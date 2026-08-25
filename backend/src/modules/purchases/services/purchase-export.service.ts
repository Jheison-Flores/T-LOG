import { Injectable } from '@nestjs/common';

import PDFDocument from 'pdfkit';

import ExcelJS from 'exceljs';

import { existsSync, readFileSync } from 'fs';

import { join } from 'path';

import { PurchasesService } from './purchases.service';

import { SettingsService } from '../../settings/services/settings.services';

import { PurchaseCurrency } from '../entities/purchase-currency.enum';

@Injectable()
export class PurchaseExportService {
  constructor(
    private readonly purchasesService: PurchasesService,

    private readonly settingsService: SettingsService,
  ) {}

  // ============================================================
  // FECHA
  // ============================================================

  private formatDate(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('es-PE', {
      day: '2-digit',

      month: '2-digit',

      year: 'numeric',
    });
  }

  // ============================================================
  // MONEDA
  // ============================================================

  private getCurrencySymbol(currency: PurchaseCurrency): string {
    return currency === PurchaseCurrency.USD ? '$' : 'S/';
  }

  // ============================================================
  // DINERO
  // ============================================================

  private money(
    value: number | string | null | undefined,

    currency: PurchaseCurrency,
  ): string {
    const amount = Number(value ?? 0);

    return `${this.getCurrencySymbol(currency)} ${amount.toLocaleString(
      'es-PE',
      {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
      },
    )}`;
  }

  // ============================================================
  // CANTIDAD
  // ============================================================

  private quantity(value: number | string): string {
    const numberValue = Number(value);

    return Number.isInteger(numberValue)
      ? String(numberValue)
      : numberValue.toFixed(2);
  }

  // ============================================================
  // NOMBRE USUARIO
  // ============================================================

  private userName(
    user:
      | {
          firstName?: string;
          lastName?: string;
          username?: string;
        }
      | null
      | undefined,
  ): string {
    if (!user) {
      return '';
    }

    return (
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.username ||
      ''
    );
  }

  // ============================================================
  // LOGO
  // ============================================================

  private findLogoPath(): string | null {
    const candidates = [
      join(process.cwd(), 'public', 'logo-teincomin.png'),
      join(process.cwd(), 'backend', 'public', 'logo-teincomin.png'),
      join(process.cwd(), 'public', 'teincomin-logo.png'),
      join(process.cwd(), 'backend', 'public', 'teincomin-logo.png'),
      join(process.cwd(), 'uploads', 'logo-teincomin.png'),
      join(process.cwd(), 'backend', 'uploads', 'logo-teincomin.png'),
      join(process.cwd(), 'src', 'assets', 'logo-teincomin.png'),
      join(process.cwd(), 'backend', 'src', 'assets', 'logo-teincomin.png'),
      join(process.cwd(), 'public', 'logo-teincomin.jpg'),
      join(process.cwd(), 'backend', 'public', 'logo-teincomin.jpg'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    console.warn(
      '[PurchaseExportService] No se encontró logo-teincomin.png. process.cwd() =',
      process.cwd(),
    );

    return null;
  }

  private getLogoBuffer(): Buffer | null {
    const logoPath = this.findLogoPath();

    if (!logoPath) {
      return null;
    }

    try {
      return readFileSync(logoPath);
    } catch (error) {
      console.warn(
        '[PurchaseExportService] Se encontró el logo pero no se pudo leer:',
        logoPath,
        error,
      );

      return null;
    }
  }

  // ============================================================
  // PDF
  // ============================================================

  async generatePdf(id: number): Promise<Buffer> {
    const purchase = await this.purchasesService.findOne(id);

    const settings = await this.settingsService.getSettings();

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',

        margins: {
          top: 28,

          right: 30,

          bottom: 30,

          left: 30,
        },

        bufferPages: true,

        info: {
          Title: `Orden de Compra ${purchase.purchaseOrderNumber}`,

          Author: settings.companyName || 'Teincomin',
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));

      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.on('error', reject);

      // ======================================================
      // MEDIDAS
      // ======================================================

      const LEFT = 30;

      const RIGHT = 565;

      const WIDTH = RIGHT - LEFT;

      const BORDER = '#111111';

      const TEXT = '#111111';

      // ======================================================
      // CELDA
      // ======================================================

      const cell = (
        text: string,

        x: number,

        y: number,

        width: number,

        height: number,

        options?: {
          bold?: boolean;

          align?: 'left' | 'center' | 'right';

          size?: number;

          fill?: string;

          color?: string;
        },
      ) => {
        if (options?.fill) {
          doc.save().rect(x, y, width, height).fill(options.fill).restore();
        }

        doc
          .save()
          .rect(x, y, width, height)
          .lineWidth(0.6)
          .strokeColor(BORDER)
          .stroke()
          .restore();

        doc
          .font(options?.bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(options?.size ?? 7)
          .fillColor(options?.color ?? TEXT)
          .text(text ?? '', x + 4, y + 4, {
            width: width - 8,

            height: height - 8,

            align: options?.align ?? 'left',
          });
      };

      // ======================================================
      // CABECERA
      // ======================================================

      let y = 28;

      const companyWidth = 170;

      const titleWidth = 205;

      const controlWidth = WIDTH - companyWidth - titleWidth;

      // EMPRESA / LOGO

      cell('', LEFT, y, companyWidth, 75);

      const logoBuffer = this.getLogoBuffer();

      if (logoBuffer) {
        try {
          doc.image(logoBuffer, LEFT + 14, y + 10, {
            fit: [companyWidth - 28, 55],

            align: 'center',

            valign: 'center',
          });
        } catch (error) {
          console.warn(
            '[PurchaseExportService] PDFKit no pudo insertar el logo:',
            error,
          );

          doc
            .font('Helvetica-Bold')
            .fontSize(18)
            .fillColor('#D97706')
            .text('TEINCOMIN', LEFT + 10, y + 27, {
              width: companyWidth - 20,

              align: 'center',
            });
        }
      } else {
        doc
          .font('Helvetica-Bold')
          .fontSize(18)
          .fillColor('#D97706')
          .text('TEINCOMIN', LEFT + 10, y + 27, {
            width: companyWidth - 20,

            align: 'center',
          });
      }

      // FORMULARIO

      cell('FORMULARIO', LEFT + companyWidth, y, titleWidth, 34, {
        align: 'center',

        bold: true,

        size: 9,
      });

      cell('ORDEN DE COMPRA', LEFT + companyWidth, y + 34, titleWidth, 41, {
        align: 'center',

        bold: true,

        size: 10,
      });

      // CONTROL

      const controlX = LEFT + companyWidth + titleWidth;

      const rows = [
        'CÓDIGO: FO-LOG-006',
        'VERSIÓN: 01',
        'FECHA: 25/10/2022',
        'Elaborado: ALO',
        'Revisado: ADM | Aprobado: GG',
      ];

      rows.forEach((text, index) => {
        cell(text, controlX, y + index * 15, controlWidth, 15, {
          bold: true,

          size: 5.5,
        });
      });

      y += 92;

      // ======================================================
      // EMPRESA IZQUIERDA + NÚMERO DERECHA
      // ======================================================

      const companyDataWidth = 300;

      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor(TEXT)
        .text(settings.companyAddress || '', LEFT, y, {
          width: companyDataWidth,
        });

      y += 13;

      if (settings.companyEmail) {
        doc
          .font('Helvetica')
          .fillColor('#2563EB')
          .text(settings.companyEmail, LEFT, y);

        y += 12;
      }

      if (settings.companyPhone) {
        doc
          .font('Helvetica')
          .fillColor(TEXT)
          .text(`Telf. ${settings.companyPhone}`, LEFT, y);
      }

      const boxX = 350;

      const boxY = 125;

      cell('', boxX, boxY, 210, 90);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(TEXT)
        .text(`RUC: ${settings.ruc || ''}`, boxX + 8, boxY + 17, {
          width: 194,

          align: 'center',
        });

      doc.fontSize(11).text('ORDEN DE COMPRA', boxX + 8, boxY + 38, {
        width: 194,

        align: 'center',
      });

      doc
        .fontSize(10)
        .text(`No. ${purchase.purchaseOrderNumber}`, boxX + 8, boxY + 58, {
          width: 194,

          align: 'center',
        });

      y = 235;

      // ======================================================
      // PROVEEDOR
      // ======================================================

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(TEXT);

      doc.text('Proveedor:', LEFT, y);

      doc.font('Helvetica').text(purchase.supplier.name, LEFT + 50, y, {
        width: 260,
      });

      doc.font('Helvetica-Bold').text('Fecha:', 350, y);

      doc
        .font('Helvetica')
        .text(this.formatDate(purchase.purchaseDate), 400, y);

      y += 15;

      doc.font('Helvetica-Bold').text('Dirección:', LEFT, y);

      doc
        .font('Helvetica')
        .text(purchase.supplier.address || '', LEFT + 50, y, {
          width: 260,
        });

      doc.font('Helvetica-Bold').text('RUC:', 350, y);

      doc.font('Helvetica').text(purchase.supplier.ruc || '', 400, y);

      y += 15;

      doc.font('Helvetica-Bold').text('N° COT.:', 350, y);

      doc.font('Helvetica').text(purchase.quotationNumber || '', 400, y);

      y += 28;

      // ======================================================
      // TABLA
      // ======================================================

      const widths = {
        number: 35,

        description: 280,

        unit: 55,

        quantity: 45,

        price: 60,

        amount: 60,
      };

      const HEADER_HEIGHT = 27;

      const drawHeader = (startY: number) => {
        let x = LEFT;

        const headers = [
          ['N°', widths.number],

          ['DESCRIPCIÓN', widths.description],

          ['UNID.\nMED.', widths.unit],

          ['CANT.', widths.quantity],

          [
            `P. UNIT. (${this.getCurrencySymbol(purchase.currency)})`,
            widths.price,
          ],

          [
            `IMPORTE (${this.getCurrencySymbol(purchase.currency)})`,
            widths.amount,
          ],
        ] as const;

        headers.forEach(([label, width]) => {
          cell(label, x, startY, width, HEADER_HEIGHT, {
            align: 'center',

            bold: true,

            size: 6.2,
          });

          x += width;
        });

        return startY + HEADER_HEIGHT;
      };

      y = drawHeader(y);

      purchase.details.forEach((detail, index) => {
        const description = detail.product.name;

        doc.font('Helvetica').fontSize(6.5);

        const descriptionHeight = doc.heightOfString(description, {
          width: widths.description - 8,
        });

        const rowHeight = Math.max(21, descriptionHeight + 8);

        if (y + rowHeight > 720) {
          doc.addPage();

          y = 35;

          y = drawHeader(y);
        }

        let x = LEFT;

        cell(String(index + 1), x, y, widths.number, rowHeight, {
          align: 'center',
        });

        x += widths.number;

        cell(description, x, y, widths.description, rowHeight);

        x += widths.description;

        cell(String(detail.product.unit ?? ''), x, y, widths.unit, rowHeight, {
          align: 'center',
        });

        x += widths.unit;

        cell(this.quantity(detail.quantity), x, y, widths.quantity, rowHeight, {
          align: 'center',
        });

        x += widths.quantity;

        cell(
          this.money(detail.unitPrice, purchase.currency),
          x,
          y,
          widths.price,
          rowHeight,
          {
            align: 'right',
          },
        );

        x += widths.price;

        cell(
          this.money(detail.subtotal, purchase.currency),
          x,
          y,
          widths.amount,
          rowHeight,
          {
            align: 'right',
          },
        );

        y += rowHeight;
      });

      // ======================================================
      // TOTALES
      // ======================================================

      const totalLabelX = 400;

      const totalValueX = 500;

      const totalLabelWidth = 100;

      const totalValueWidth = 65;

      cell('Sub Total:', totalLabelX, y, totalLabelWidth, 17, {
        bold: true,

        align: 'right',
      });

      cell(
        this.money(purchase.subtotalAmount, purchase.currency),
        totalValueX,
        y,
        totalValueWidth,
        17,
        {
          align: 'right',
        },
      );

      y += 17;

      cell(
        purchase.applyIgv ? 'IGV 18%:' : 'IGV:',
        totalLabelX,
        y,
        totalLabelWidth,
        17,
        {
          bold: true,

          align: 'right',
        },
      );

      cell(
        this.money(purchase.igvAmount, purchase.currency),
        totalValueX,
        y,
        totalValueWidth,
        17,
        {
          align: 'right',
        },
      );

      y += 17;

      cell('Total:', totalLabelX, y, totalLabelWidth, 17, {
        bold: true,

        align: 'right',
      });

      cell(
        this.money(purchase.totalAmount, purchase.currency),
        totalValueX,
        y,
        totalValueWidth,
        17,
        {
          bold: true,

          align: 'right',
        },
      );

      y += 36;

      // ======================================================
      // CONDICIONES
      // ======================================================

      if (y > 680) {
        doc.addPage();

        y = 40;
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor(TEXT)
        .text('CONDICIONES COMERCIALES:', LEFT, y);

      y += 13;

      doc.font('Helvetica').text(purchase.commercialConditions || '', LEFT, y, {
        width: WIDTH,
      });

      y += 25;

      doc.font('Helvetica-Bold').text('FORMA DE PAGO:', LEFT, y);

      y += 13;

      doc.font('Helvetica').text(purchase.paymentMethod || '', LEFT, y, {
        width: WIDTH,
      });

      y += 35;

      // ======================================================
      // CREADO POR
      // ======================================================

      if (purchase.createdBy) {
        doc
          .font('Helvetica')
          .fontSize(7)
          .text(this.userName(purchase.createdBy), LEFT, y);
      }

      y += 13;

      doc
        .font('Helvetica-Bold')
        .text((settings.companyName || 'TEINCOMIN SAC').toUpperCase(), LEFT, y);

      doc.end();
    });
  }

  // ============================================================
  // EXCEL
  // ============================================================

  async generateExcel(id: number): Promise<Buffer> {
    const purchase = await this.purchasesService.findOne(id);

    const settings = await this.settingsService.getSettings();

    const workbook = new ExcelJS.Workbook();

    workbook.creator = settings.systemName || 'T-LOG';

    const ws = workbook.addWorksheet('Orden de Compra');

    // ============================================================
    // COLUMNAS
    // ============================================================

    ws.columns = [
      {
        width: 8,
      },
      {
        width: 18,
      },
      {
        width: 44,
      },
      {
        width: 13,
      },
      {
        width: 12,
      },
      {
        width: 18,
      },
      {
        width: 18,
      },
    ];

    // ============================================================
    // HELPERS
    // ============================================================

    const border = (cell: ExcelJS.Cell) => {
      cell.border = {
        top: {
          style: 'thin',
        },

        left: {
          style: 'thin',
        },

        right: {
          style: 'thin',
        },

        bottom: {
          style: 'thin',
        },
      };
    };

    // ============================================================
    // CABECERA
    // ============================================================

    ws.mergeCells('A2:B5');

    const excelLogoPath = this.findLogoPath();

    if (excelLogoPath) {
      ws.getCell('A2').value = '';

      const logoImageId = workbook.addImage({
        filename: excelLogoPath,

        extension: excelLogoPath.toLowerCase().endsWith('.jpg')
          ? 'jpeg'
          : 'png',
      });

      ws.addImage(logoImageId, 'A2:B5');
    } else {
      ws.getCell('A2').value = (
        settings.companyName || 'TEINCOMIN'
      ).toUpperCase();

      ws.getCell('A2').font = {
        bold: true,

        size: 18,
      };

      ws.getCell('A2').alignment = {
        horizontal: 'center',

        vertical: 'middle',
      };
    }

    ws.mergeCells('C2:E3');

    ws.getCell('C2').value = 'FORMULARIO';

    ws.getCell('C2').font = {
      bold: true,
    };

    ws.getCell('C2').alignment = {
      horizontal: 'center',

      vertical: 'middle',
    };

    ws.mergeCells('C4:E5');

    ws.getCell('C4').value = 'ORDEN DE COMPRA';

    ws.getCell('C4').font = {
      bold: true,

      size: 12,
    };

    ws.getCell('C4').alignment = {
      horizontal: 'center',

      vertical: 'middle',
    };

    ws.mergeCells('F2:G2');

    ws.getCell('F2').value = 'CÓDIGO: FO-LOG-006';

    ws.mergeCells('F3:G3');

    ws.getCell('F3').value = 'VERSIÓN: 01';

    ws.mergeCells('F4:G4');

    ws.getCell('F4').value = 'FECHA: 25/10/2022';

    ws.mergeCells('F5:G5');

    ws.getCell('F5').value = 'Elaborado: ALO | Revisado: ADM | Aprobado: GG';

    for (let row = 2; row <= 5; row++) {
      for (let col = 1; col <= 7; col++) {
        const current = ws.getCell(row, col);

        border(current);

        current.alignment = {
          ...current.alignment,

          vertical: 'middle',

          wrapText: true,
        };
      }
    }

    // ============================================================
    // EMPRESA
    // ============================================================

    ws.mergeCells('A7:D7');

    ws.getCell('A7').value = '';

    ws.mergeCells('A8:D8');

    ws.getCell('A8').value = settings.companyAddress || '';

    ws.mergeCells('A9:D9');

    ws.getCell('A9').value = settings.companyEmail || '';

    ws.mergeCells('A10:D10');

    ws.getCell('A10').value = settings.companyPhone || '';

    // ============================================================
    // CUADRO OC
    // ============================================================

    ws.mergeCells('E7:G7');

    ws.getCell('E7').value = `RUC: ${settings.ruc || ''}`;

    ws.mergeCells('E8:G8');

    ws.getCell('E8').value = 'ORDEN DE COMPRA';

    ws.mergeCells('E9:G10');

    ws.getCell('E9').value = `No. ${purchase.purchaseOrderNumber}`;

    ['E7', 'E8', 'E9'].forEach((ref) => {
      const current = ws.getCell(ref);

      current.font = {
        bold: true,

        size: ref === 'E8' ? 12 : 10,
      };

      current.alignment = {
        horizontal: 'center',

        vertical: 'middle',
      };

      border(current);
    });

    // ============================================================
    // PROVEEDOR
    // ============================================================

    ws.getCell('A13').value = 'Proveedor:';

    ws.getCell('A13').font = {
      bold: true,
    };

    ws.mergeCells('B13:D13');

    ws.getCell('B13').value = purchase.supplier.name;

    ws.getCell('A14').value = 'Dirección:';

    ws.getCell('A14').font = {
      bold: true,
    };

    ws.mergeCells('B14:D15');

    ws.getCell('B14').value = purchase.supplier.address || '';

    ws.getCell('E13').value = 'Fecha:';

    ws.getCell('F13').value = this.formatDate(purchase.purchaseDate);

    ws.getCell('E14').value = 'RUC:';

    ws.getCell('F14').value = purchase.supplier.ruc || '';

    ws.getCell('E15').value = 'N° COT.:';

    ws.getCell('F15').value = purchase.quotationNumber || '';

    // ============================================================
    // TABLA
    // ============================================================

    const headerRow = 18;

    const symbol = this.getCurrencySymbol(purchase.currency);

    const headers = [
      'N°',
      'DESCRIPCIÓN',
      '',
      'UNID. MED.',
      'CANT.',
      `P. UNIT. (${symbol})`,
      `IMPORTE (${symbol})`,
    ];

    headers.forEach((value, index) => {
      const current = ws.getCell(headerRow, index + 1);

      current.value = value;

      current.font = {
        bold: true,
      };

      current.alignment = {
        horizontal: 'center',

        vertical: 'middle',

        wrapText: true,
      };

      border(current);
    });

    ws.mergeCells(`B${headerRow}:C${headerRow}`);

    ws.getCell(`B${headerRow}`).value = 'DESCRIPCIÓN';

    let row = headerRow + 1;

    purchase.details.forEach((detail, index) => {
      ws.getCell(row, 1).value = index + 1;

      ws.mergeCells(`B${row}:C${row}`);

      ws.getCell(row, 2).value = detail.product.name;

      ws.getCell(row, 4).value = detail.product.unit;

      ws.getCell(row, 5).value = Number(detail.quantity);

      ws.getCell(row, 6).value = Number(detail.unitPrice);

      ws.getCell(row, 7).value = Number(detail.subtotal);

      for (let col = 1; col <= 7; col++) {
        const current = ws.getCell(row, col);

        border(current);

        current.alignment = {
          vertical: 'middle',

          wrapText: true,
        };
      }

      ws.getCell(row, 1).alignment = {
        horizontal: 'center',

        vertical: 'middle',
      };

      ws.getCell(row, 4).alignment = {
        horizontal: 'center',

        vertical: 'middle',
      };

      ws.getCell(row, 5).alignment = {
        horizontal: 'center',

        vertical: 'middle',
      };

      ws.getCell(row, 6).numFmt = `"${symbol} " #,##0.00`;

      ws.getCell(row, 7).numFmt = `"${symbol} " #,##0.00`;

      ws.getRow(row).height = 22;

      row++;
    });

    // ============================================================
    // TOTALES
    // ============================================================

    ws.mergeCells(`E${row}:F${row}`);

    ws.getCell(`E${row}`).value = 'Sub Total:';

    ws.getCell(`G${row}`).value = Number(purchase.subtotalAmount);

    row++;

    ws.mergeCells(`E${row}:F${row}`);

    ws.getCell(`E${row}`).value = purchase.applyIgv ? 'IGV 18%:' : 'IGV:';

    ws.getCell(`G${row}`).value = Number(purchase.igvAmount);

    row++;

    ws.mergeCells(`E${row}:F${row}`);

    ws.getCell(`E${row}`).value = 'Total:';

    ws.getCell(`G${row}`).value = Number(purchase.totalAmount);

    for (let currentRow = row - 2; currentRow <= row; currentRow++) {
      ws.getCell(currentRow, 5).font = {
        bold: true,
      };

      ws.getCell(currentRow, 7).numFmt = `"${symbol} " #,##0.00`;

      border(ws.getCell(currentRow, 5));

      border(ws.getCell(currentRow, 7));
    }

    row += 3;

    // ============================================================
    // CONDICIONES
    // ============================================================

    ws.mergeCells(`A${row}:G${row}`);

    ws.getCell(`A${row}`).value = 'CONDICIONES COMERCIALES:';

    ws.getCell(`A${row}`).font = {
      bold: true,
    };

    row++;

    ws.mergeCells(`A${row}:G${row + 1}`);

    ws.getCell(`A${row}`).value = purchase.commercialConditions || '';

    ws.getCell(`A${row}`).alignment = {
      vertical: 'top',

      wrapText: true,
    };

    row += 3;

    ws.mergeCells(`A${row}:G${row}`);

    ws.getCell(`A${row}`).value = 'FORMA DE PAGO:';

    ws.getCell(`A${row}`).font = {
      bold: true,
    };

    row++;

    ws.mergeCells(`A${row}:G${row + 1}`);

    ws.getCell(`A${row}`).value = purchase.paymentMethod || '';

    // ============================================================
    // IMPRESIÓN
    // ============================================================

    ws.pageSetup = {
      orientation: 'portrait',

      paperSize: 9,

      fitToPage: true,

      fitToWidth: 1,

      fitToHeight: 0,

      margins: {
        left: 0.3,

        right: 0.3,

        top: 0.3,

        bottom: 0.3,

        header: 0.1,

        footer: 0.1,
      },
    };

    ws.pageSetup.printArea = `A1:G${row + 3}`;

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }
}
