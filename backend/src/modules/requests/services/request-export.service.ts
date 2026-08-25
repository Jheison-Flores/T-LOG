import { Injectable } from '@nestjs/common';

import PDFDocument from 'pdfkit';

import ExcelJS from 'exceljs';

import { existsSync } from 'fs';

import { join } from 'path';

import { RequestsService } from './requests.service';

import { SettingsService } from '../../settings/services/settings.services';

@Injectable()
export class RequestExportService {
  constructor(
    private readonly requestsService: RequestsService,

    private readonly settingsService: SettingsService,
  ) {}

  // ============================================================
  // FORMATEAR FECHA
  // ============================================================

  private formatDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // ============================================================
  // FORMATEAR CANTIDAD
  // ============================================================

  private formatQuantity(value: number | string | null | undefined): string {
    const numberValue = Number(value ?? 0);

    if (Number.isInteger(numberValue)) {
      return String(numberValue);
    }

    return numberValue.toFixed(2).replace(/\.?0+$/, '');
  }

  // ============================================================
  // FORMATEAR MONEDA
  // ============================================================

  private formatMoney(value: number | string | null | undefined): string {
    const numberValue = Number(value ?? 0);

    return `S/ ${numberValue.toFixed(2)}`;
  }

  // ============================================================
  // NOMBRE DEL USUARIO
  // ============================================================

  private getUserName(
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

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || user.username || '';
  }

  // ============================================================
  // OBTENER MES
  // ============================================================

  private getMonthName(value: Date | string): string {
    const date = new Date(value);

    return date
      .toLocaleDateString('es-PE', {
        month: 'long',
      })
      .toUpperCase();
  }

  // ============================================================
  // OBTENER CORRELATIVO
  //
  // REQ-2026-000009 -> 000009
  // ============================================================

  private getCorrelative(requestNumber: string): string {
    const parts = requestNumber.split('-');

    return parts[parts.length - 1] || requestNumber;
  }

  // ============================================================
  // BUSCAR LOGO
  //
  // Ruta principal:
  // backend/public/logo-teincomin.png
  // ============================================================

  private findLogoPath(): string | null {
    const candidates = [
      join(process.cwd(), 'public', 'logo-teincomin.png'),

      join(process.cwd(), 'public', 'teincomin-logo.png'),

      join(process.cwd(), 'uploads', 'logo-teincomin.png'),

      join(process.cwd(), 'src', 'assets', 'logo-teincomin.png'),

      join(process.cwd(), 'public', 'logo-teincomin.jpg'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  // ============================================================
  // GENERAR PDF
  // ============================================================

  async generatePdf(requestId: number, userId: number): Promise<Buffer> {
    const request = await this.requestsService.findOne(requestId, userId);

    const settings = await this.settingsService.getSettings();

    return new Promise<Buffer>((resolve, reject) => {
      const document = new PDFDocument({
        size: 'A4',

        layout: 'landscape',

        margins: {
          top: 22,
          right: 22,
          bottom: 30,
          left: 22,
        },

        bufferPages: true,

        info: {
          Title: `Requerimiento ${request.requestNumber}`,

          Author: settings.companyName || 'Teincomin',

          Subject: 'Requerimiento de materiales',
        },
      });

      const chunks: Buffer[] = [];

      document.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      document.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      document.on('error', reject);

      // ======================================================
      // DIMENSIONES A4 HORIZONTAL
      // ======================================================

      const PAGE_LEFT = 22;

      const PAGE_RIGHT = 820;

      const CONTENT_WIDTH = PAGE_RIGHT - PAGE_LEFT;

      // ======================================================
      // COLORES
      // ======================================================

      const NAVY = '#17365D';

      const LIGHT_BLUE = '#B7DEE8';

      const LIGHT_GRAY = '#D9D9D9';

      const CATEGORY_YELLOW = '#FFF200';

      const TEXT = '#111111';

      const BORDER = '#111111';

      // ======================================================
      // HELPER CELDA PDF
      // ======================================================

      const drawCell = (
        text: string,

        x: number,

        y: number,

        width: number,

        height: number,

        options?: {
          bold?: boolean;

          fontSize?: number;

          align?: 'left' | 'center' | 'right';

          fill?: string;

          textColor?: string;

          padding?: number;
        },
      ) => {
        const padding = options?.padding ?? 4;

        if (options?.fill) {
          document
            .save()
            .rect(x, y, width, height)
            .fill(options.fill)
            .restore();
        }

        document
          .save()
          .rect(x, y, width, height)
          .strokeColor(BORDER)
          .lineWidth(0.55)
          .stroke()
          .restore();

        document
          .fillColor(options?.textColor ?? TEXT)
          .font(options?.bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(options?.fontSize ?? 7)
          .text(text ?? '', x + padding, y + padding, {
            width: width - padding * 2,

            height: height - padding * 2,

            align: options?.align ?? 'left',
          });
      };

      // ======================================================
      // CABECERA PRINCIPAL
      // ======================================================

      const headerY = 22;

      const headerHeight = 76;

      const logoWidth = 245;

      const titleWidth = 235;

      const controlWidth = CONTENT_WIDTH - logoWidth - titleWidth;

      const titleX = PAGE_LEFT + logoWidth;

      const controlX = titleX + titleWidth;

      // ======================================================
      // BLOQUE EMPRESA
      // ======================================================

      drawCell('', PAGE_LEFT, headerY, logoWidth, headerHeight);

      const logoPath = this.findLogoPath();

      if (logoPath) {
        try {
          document.image(logoPath, PAGE_LEFT + 20, headerY + 12, {
            fit: [logoWidth - 40, headerHeight - 24],

            align: 'center',

            valign: 'center',
          });
        } catch {
          document
            .font('Helvetica-Bold')
            .fontSize(19)
            .fillColor('#D97706')
            .text('TEINCOMIN', PAGE_LEFT + 12, headerY + 27, {
              width: logoWidth - 24,

              align: 'center',
            });
        }
      } else {
        document
          .font('Helvetica-Bold')
          .fontSize(19)
          .fillColor('#D97706')
          .text('TEINCOMIN', PAGE_LEFT + 12, headerY + 27, {
            width: logoWidth - 24,

            align: 'center',
          });
      }

      // ======================================================
      // FORMULARIO / REQUERIMIENTO
      // ======================================================

      drawCell('FORMULARIO', titleX, headerY, titleWidth, 36, {
        bold: true,
        fontSize: 11,
        align: 'center',
      });

      drawCell(
        'REQUERIMIENTO',
        titleX,
        headerY + 36,
        titleWidth,
        headerHeight - 36,
        {
          bold: true,
          fontSize: 12,
          align: 'center',
        },
      );

      // ======================================================
      // CONTROL DOCUMENTARIO
      // ======================================================

      const controlRows = [
        'CÓDIGO: FO-LO-005',
        'VERSIÓN: 01',
        `FECHA: ${this.formatDate(request.createdAt)}`,
        'ELABORADO: ALO',
        'REVISADO: ADM     APROBADO: GG',
      ];

      const controlRowHeight = headerHeight / controlRows.length;

      controlRows.forEach((row, index) => {
        drawCell(
          row,
          controlX,
          headerY + index * controlRowHeight,
          controlWidth,
          controlRowHeight,
          {
            bold: true,
            fontSize: 6,
          },
        );
      });

      // ======================================================
      // DIRECCIÓN
      // ======================================================

      let y = headerY + headerHeight + 7;

      document
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor(TEXT)
        .text(
          settings.companyAddress ||
            'Asoc. Praderas de Pariachi Mz E Lt 1 - Ate - Lima',
          PAGE_LEFT,
          y,
          {
            width: CONTENT_WIDTH,
          },
        );

      y += 18;

      // ======================================================
      // DATOS UNIDAD / AÑO / MES / CORRELATIVO
      // ======================================================

      const leftBlockWidth = 245;

      const leftValueWidth = 72;

      const leftLabelWidth = leftBlockWidth - leftValueWidth;

      const infoRowHeight = 16;

      const requestDate = new Date(request.createdAt);

      const leftRows = [
        {
          value: request.warehouse.code || '',
          label: 'UNIDAD',
        },
        {
          value: String(requestDate.getFullYear()),
          label: 'AÑO',
        },
        {
          value: this.getMonthName(request.createdAt),
          label: 'MES',
        },
        {
          value: this.getCorrelative(request.requestNumber),
          label: 'N° CORRELATIVO',
        },
      ];

      leftRows.forEach((row, index) => {
        const rowY = y + index * infoRowHeight;

        drawCell(row.value, PAGE_LEFT, rowY, leftValueWidth, infoRowHeight, {
          align: 'center',

          fill: index === 0 ? LIGHT_BLUE : LIGHT_GRAY,

          fontSize: 7,
        });

        drawCell(
          row.label,
          PAGE_LEFT + leftValueWidth,
          rowY,
          leftLabelWidth,
          infoRowHeight,
          {
            fill: index === 0 ? LIGHT_BLUE : LIGHT_GRAY,

            fontSize: 7,
          },
        );
      });

      // ======================================================
      // DATOS DERECHA
      // ======================================================

      const rightX = PAGE_LEFT + 450;

      const rightWidth = CONTENT_WIDTH - 450;

      const rightLabelWidth = 72;

      const rightValueWidth = rightWidth - rightLabelWidth;

      const rightRows = [
        {
          label: 'N°:',
          value: request.requestNumber,
        },
        {
          label: 'RUC:',
          value: settings.ruc || '',
        },
        {
          label: 'FECHA:',
          value: this.formatDate(request.createdAt),
        },
        {
          label: 'DESTINO:',
          value: request.destination || request.warehouse.name,
        },
        {
          label: 'ATENCIÓN:',
          value: request.attention || 'LOGÍSTICA',
        },
      ];

      rightRows.forEach((row, index) => {
        const rowY = y + index * infoRowHeight;

        drawCell(row.label, rightX, rowY, rightLabelWidth, infoRowHeight, {
          bold: true,

          fill: index === 0 ? LIGHT_BLUE : undefined,

          fontSize: 7,
        });

        drawCell(
          row.value,
          rightX + rightLabelWidth,
          rowY,
          rightValueWidth,
          infoRowHeight,
          {
            align: 'center',

            fill: index === 0 ? LIGHT_BLUE : undefined,

            textColor: row.label === 'FECHA:' ? '#DC2626' : TEXT,

            fontSize: 7,
          },
        );
      });

      y += rightRows.length * infoRowHeight + 7;

      // ======================================================
      // ELABORADO
      // ======================================================

      const personLabelWidth = 75;

      drawCell('ELABORADO:', PAGE_LEFT, y, personLabelWidth, 16, {
        bold: true,
        fontSize: 7,
      });

      drawCell(
        this.getUserName(request.createdBy) || request.requester,
        PAGE_LEFT + personLabelWidth,
        y,
        CONTENT_WIDTH - personLabelWidth,
        16,
        {
          align: 'center',
          fontSize: 7,
        },
      );

      y += 16;

      // ======================================================
      // REVISADO
      // ======================================================

      drawCell('REVISADO:', PAGE_LEFT, y, personLabelWidth, 16, {
        bold: true,
        fontSize: 7,
      });

      drawCell(
        this.getUserName(request.approvedBy),
        PAGE_LEFT + personLabelWidth,
        y,
        CONTENT_WIDTH - personLabelWidth,
        16,
        {
          align: 'center',
          fontSize: 7,
        },
      );

      y += 24;

      // ======================================================
      // COLUMNAS
      //
      // TOTAL = 798
      // ======================================================

      const columns = {
        item: 36,

        code: 70,

        description: 260,

        requested: 55,

        unit: 52,

        unitPrice: 68,

        total: 76,

        stock: 55,

        observation: 126,
      };

      const TABLE_WIDTH = Object.values(columns).reduce(
        (total, width) => total + width,
        0,
      );

      // ======================================================
      // ENCABEZADO TABLA
      // ======================================================

      const TABLE_HEADER_HEIGHT = 32;

      const drawTableHeader = (startY: number): number => {
        const headers = [
          {
            label: 'ITEM',
            width: columns.item,
          },
          {
            label: 'CÓDIGO',
            width: columns.code,
          },
          {
            label: 'DESCRIPCIÓN',
            width: columns.description,
          },
          {
            label: 'PEDIDO',
            width: columns.requested,
          },
          {
            label: 'U.M.',
            width: columns.unit,
          },
          {
            label: 'P.U.',
            width: columns.unitPrice,
          },
          {
            label: 'TOTAL',
            width: columns.total,
          },
          {
            label: 'STOCK',
            width: columns.stock,
          },
          {
            label: 'OBSERV.',
            width: columns.observation,
          },
        ];

        let x = PAGE_LEFT;

        headers.forEach((header) => {
          drawCell(header.label, x, startY, header.width, TABLE_HEADER_HEIGHT, {
            bold: true,

            align: 'center',

            fill: NAVY,

            textColor: '#FFFFFF',

            fontSize: 6.5,

            padding: 3,
          });

          x += header.width;
        });

        return startY + TABLE_HEADER_HEIGHT;
      };

      y = drawTableHeader(y);

      // ======================================================
      // AGRUPAR PRODUCTOS POR CATEGORÍA
      // ======================================================

      const grouped = new Map<string, typeof request.details>();

      for (const detail of request.details) {
        const categoryName =
          detail.product.category?.name?.trim() || 'SIN CATEGORÍA';

        if (!grouped.has(categoryName)) {
          grouped.set(categoryName, []);
        }

        grouped.get(categoryName)!.push(detail);
      }

      let itemNumber = 1;

      // ======================================================
      // CATEGORÍAS
      // ======================================================

      for (const [categoryName, categoryDetails] of grouped.entries()) {
        // ====================================================
        // VERIFICAR ESPACIO
        // ====================================================

        if (y + 48 > 545) {
          document.addPage();

          y = 28;

          y = drawTableHeader(y);
        }

        // ====================================================
        // FILA AMARILLA CATEGORÍA
        // ====================================================

        drawCell(categoryName.toUpperCase(), PAGE_LEFT, y, TABLE_WIDTH, 19, {
          bold: true,

          fill: CATEGORY_YELLOW,

          fontSize: 7.5,
        });

        y += 19;

        // ====================================================
        // PRODUCTOS DE ESA CATEGORÍA
        // ====================================================

        for (const detail of categoryDetails) {
          const description = detail.product.name || '';

          const observations = detail.observations || '';

          document.font('Helvetica').fontSize(6.5);

          const descriptionHeight = document.heightOfString(description, {
            width: columns.description - 8,
          });

          const observationHeight = document.heightOfString(observations, {
            width: columns.observation - 8,
          });

          const rowHeight = Math.max(
            23,
            descriptionHeight + 9,
            observationHeight + 9,
          );

          // ==================================================
          // SALTO PÁGINA
          // ==================================================

          if (y + rowHeight > 545) {
            document.addPage();

            y = 28;

            y = drawTableHeader(y);

            // Repetimos la categoría en nueva página.
            drawCell(
              categoryName.toUpperCase(),
              PAGE_LEFT,
              y,
              TABLE_WIDTH,
              19,
              {
                bold: true,

                fill: CATEGORY_YELLOW,

                fontSize: 7.5,
              },
            );

            y += 19;
          }

          const price = Number(detail.product.currentPrice ?? 0);

          const quantity = Number(detail.quantity ?? 0);

          const total = quantity * price;

          let x = PAGE_LEFT;

          // ITEM
          drawCell(String(itemNumber), x, y, columns.item, rowHeight, {
            align: 'center',
            fontSize: 6.5,
          });

          x += columns.item;

          // CÓDIGO
          drawCell(
            detail.product.internalCode ?? detail.product.sku ?? '',
            x,
            y,
            columns.code,
            rowHeight,
            {
              align: 'center',
              fontSize: 6.2,
            },
          );

          x += columns.code;

          // DESCRIPCIÓN
          drawCell(description, x, y, columns.description, rowHeight, {
            fontSize: 6.5,
          });

          x += columns.description;

          // PEDIDO
          drawCell(
            this.formatQuantity(detail.quantity),
            x,
            y,
            columns.requested,
            rowHeight,
            {
              align: 'center',
              fontSize: 6.5,
            },
          );

          x += columns.requested;

          // U.M.
          drawCell(
            String(detail.product.unit ?? ''),
            x,
            y,
            columns.unit,
            rowHeight,
            {
              align: 'center',
              fontSize: 6.2,
            },
          );

          x += columns.unit;

          // P.U.
          drawCell(
            this.formatMoney(price),
            x,
            y,
            columns.unitPrice,
            rowHeight,
            {
              align: 'right',
              fontSize: 6.2,
            },
          );

          x += columns.unitPrice;

          // TOTAL
          drawCell(this.formatMoney(total), x, y, columns.total, rowHeight, {
            align: 'right',
            fontSize: 6.2,
          });

          x += columns.total;

          // STOCK
          //
          // Por ahora vacío.
          // No mostramos un valor falso.
          drawCell('', x, y, columns.stock, rowHeight, {
            align: 'center',
            fontSize: 6.5,
          });

          x += columns.stock;

          // OBSERVACIÓN
          drawCell(observations, x, y, columns.observation, rowHeight, {
            fontSize: 6,
          });

          y += rowHeight;

          itemNumber++;
        }
      }

      // ======================================================
      // OBSERVACIONES GENERALES
      // ======================================================

      y += 10;

      if (y + 55 > 545) {
        document.addPage();

        y = 35;
      }

      drawCell('OBSERVACIONES GENERALES', PAGE_LEFT, y, CONTENT_WIDTH, 18, {
        bold: true,

        fill: LIGHT_GRAY,

        fontSize: 7,
      });

      y += 18;

      drawCell(
        request.observations || 'Sin observaciones.',
        PAGE_LEFT,
        y,
        CONTENT_WIDTH,
        35,
        {
          fontSize: 7,
        },
      );

      // ======================================================
      // PIE DE PÁGINA
      // ======================================================

      const range = document.bufferedPageRange();

      for (let pageIndex = 0; pageIndex < range.count; pageIndex++) {
        document.switchToPage(pageIndex);

        document
          .save()
          .moveTo(PAGE_LEFT, 568)
          .lineTo(PAGE_RIGHT, 568)
          .strokeColor('#D1D5DB')
          .lineWidth(0.5)
          .stroke()
          .restore();

        document
          .font('Helvetica')
          .fontSize(6.3)
          .fillColor('#6B7280')
          .text(
            `${settings.systemName || 'T-LOG'} | ${request.requestNumber}`,
            PAGE_LEFT,
            575,
            {
              width: CONTENT_WIDTH / 2,

              align: 'left',

              lineBreak: false,
            },
          );

        document.text(
          `Página ${pageIndex + 1} de ${range.count}`,
          PAGE_LEFT + CONTENT_WIDTH / 2,
          575,
          {
            width: CONTENT_WIDTH / 2,

            align: 'right',

            lineBreak: false,
          },
        );
      }

      document.end();
    });
  }

  // ============================================================
  // GENERAR EXCEL
  // ============================================================

  async generateExcel(requestId: number, userId: number): Promise<Buffer> {
    const request = await this.requestsService.findOne(requestId, userId);

    const settings = await this.settingsService.getSettings();

    const workbook = new ExcelJS.Workbook();

    workbook.creator = settings.systemName || 'T-LOG';

    workbook.created = new Date();

    workbook.modified = new Date();

    workbook.subject = `Requerimiento ${request.requestNumber}`;

    const worksheet = workbook.addWorksheet('Requerimiento');

    // ============================================================
    // COLUMNAS
    // ============================================================

    worksheet.columns = [
      {
        key: 'item',
        width: 8,
      },

      {
        key: 'code',
        width: 18,
      },

      {
        key: 'description',
        width: 48,
      },

      {
        key: 'requested',
        width: 13,
      },

      {
        key: 'unit',
        width: 13,
      },

      {
        key: 'unitPrice',
        width: 16,
      },

      {
        key: 'total',
        width: 18,
      },

      {
        key: 'stock',
        width: 12,
      },

      {
        key: 'observations',
        width: 45,
      },
    ];

    // ============================================================
    // COLORES
    // ============================================================

    const NAVY = 'FF17365D';

    const LIGHT_BLUE = 'FFB7DEE8';

    const LIGHT_GRAY = 'FFD9D9D9';

    const CATEGORY_YELLOW = 'FFFFFF00';

    // ============================================================
    // FUNCIÓN BORDE
    // ============================================================

    const applyBorder = (cell: ExcelJS.Cell) => {
      cell.border = {
        top: {
          style: 'thin',
        },

        left: {
          style: 'thin',
        },

        bottom: {
          style: 'thin',
        },

        right: {
          style: 'thin',
        },
      };
    };

    // ============================================================
    // CABECERA PRINCIPAL
    // ============================================================

    worksheet.mergeCells('A2:C5');

    const companyCell = worksheet.getCell('A2');

    const excelLogoPath = this.findLogoPath();

    if (excelLogoPath) {
      companyCell.value = '';

      const logoImageId = workbook.addImage({
        filename: excelLogoPath,

        extension: excelLogoPath.toLowerCase().endsWith('.jpg')
          ? 'jpeg'
          : 'png',
      });

      worksheet.addImage(logoImageId, 'A2:C5');
    } else {
      companyCell.value = (settings.companyName || 'TEINCOMIN').toUpperCase();

      companyCell.font = {
        bold: true,
        size: 18,
      };

      companyCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
    }

    // FORMULARIO

    worksheet.mergeCells('D2:F3');

    const formCell = worksheet.getCell('D2');

    formCell.value = 'FORMULARIO';

    formCell.font = {
      bold: true,
      size: 12,
    };

    formCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    // REQUERIMIENTO

    worksheet.mergeCells('D4:F5');

    const requirementCell = worksheet.getCell('D4');

    requirementCell.value = 'REQUERIMIENTO';

    requirementCell.font = {
      bold: true,
      size: 13,
    };

    requirementCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    // CONTROL DOCUMENTARIO

    worksheet.mergeCells('G2:I2');

    worksheet.getCell('G2').value = 'CÓDIGO: FO-LO-005';

    worksheet.mergeCells('G3:I3');

    worksheet.getCell('G3').value = 'VERSIÓN: 01';

    worksheet.mergeCells('G4:I4');

    worksheet.getCell('G4').value = `FECHA: ${this.formatDate(
      request.createdAt,
    )}`;

    worksheet.mergeCells('G5:I5');

    worksheet.getCell('G5').value =
      'ELABORADO: ALO | REVISADO: ADM | APROBADO: GG';

    // ============================================================
    // ESTILO CABECERA
    // ============================================================

    for (let row = 2; row <= 5; row++) {
      for (let column = 1; column <= 9; column++) {
        const cell = worksheet.getCell(row, column);

        applyBorder(cell);

        cell.alignment = {
          ...cell.alignment,

          vertical: 'middle',

          wrapText: true,
        };
      }
    }

    worksheet.getRow(2).height = 22;

    worksheet.getRow(3).height = 22;

    worksheet.getRow(4).height = 22;

    worksheet.getRow(5).height = 22;

    // ============================================================
    // DIRECCIÓN
    // ============================================================

    worksheet.mergeCells('A7:I7');

    const addressCell = worksheet.getCell('A7');

    addressCell.value =
      settings.companyAddress ||
      'Asoc. Praderas de Pariachi Mz E Lt 1 - Ate - Lima';

    addressCell.font = {
      bold: true,
      size: 9,
    };

    addressCell.alignment = {
      vertical: 'middle',
    };

    // ============================================================
    // DATOS DEL REQUERIMIENTO
    // ============================================================

    const requestDate = new Date(request.createdAt);

    // UNIDAD

    worksheet.getCell('A9').value =
      request.warehouse.code || request.warehouse.name;

    worksheet.getCell('B9').value = 'UNIDAD';

    // AÑO

    worksheet.getCell('A10').value = requestDate.getFullYear();

    worksheet.getCell('B10').value = 'AÑO';

    // MES

    worksheet.getCell('A11').value = this.getMonthName(request.createdAt);

    worksheet.getCell('B11').value = 'MES';

    // CORRELATIVO

    worksheet.getCell('A12').value = this.getCorrelative(request.requestNumber);

    worksheet.getCell('B12').value = 'N° CORRELATIVO';

    // ============================================================
    // COLORES BLOQUE IZQUIERDO
    // ============================================================

    for (let row = 9; row <= 12; row++) {
      for (let column = 1; column <= 2; column++) {
        const cell = worksheet.getCell(row, column);

        applyBorder(cell);

        cell.fill = {
          type: 'pattern',

          pattern: 'solid',

          fgColor: {
            argb: row === 9 ? LIGHT_BLUE : LIGHT_GRAY,
          },
        };

        cell.alignment = {
          vertical: 'middle',

          horizontal: column === 1 ? 'center' : 'left',
        };
      }
    }

    // ============================================================
    // BLOQUE DERECHO
    // ============================================================

    const rightRows = [
      {
        row: 9,
        label: 'N°:',
        value: request.requestNumber,
      },
      {
        row: 10,
        label: 'RUC:',
        value: settings.ruc || '',
      },
      {
        row: 11,
        label: 'FECHA:',
        value: this.formatDate(request.createdAt),
      },
      {
        row: 12,
        label: 'DESTINO:',
        value: request.destination || request.warehouse.name,
      },
      {
        row: 13,
        label: 'ATENCIÓN:',
        value: request.attention || 'LOGÍSTICA',
      },
    ];

    rightRows.forEach((item) => {
      worksheet.getCell(`E${item.row}`).value = item.label;

      worksheet.mergeCells(`F${item.row}:I${item.row}`);

      worksheet.getCell(`F${item.row}`).value = item.value;

      const labelCell = worksheet.getCell(`E${item.row}`);

      const valueCell = worksheet.getCell(`F${item.row}`);

      labelCell.font = {
        bold: true,
      };

      valueCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };

      applyBorder(labelCell);

      applyBorder(valueCell);

      if (item.row === 9) {
        labelCell.fill = {
          type: 'pattern',

          pattern: 'solid',

          fgColor: {
            argb: LIGHT_BLUE,
          },
        };

        valueCell.fill = {
          type: 'pattern',

          pattern: 'solid',

          fgColor: {
            argb: LIGHT_BLUE,
          },
        };
      }

      if (item.label === 'FECHA:') {
        valueCell.font = {
          color: {
            argb: 'FFFF0000',
          },
        };
      }
    });

    // ============================================================
    // ELABORADO / REVISADO
    // ============================================================

    worksheet.getCell('A15').value = 'ELABORADO:';

    worksheet.getCell('A15').font = {
      bold: true,
    };

    worksheet.mergeCells('B15:I15');

    worksheet.getCell('B15').value =
      this.getUserName(request.createdBy) || request.requester;

    worksheet.getCell('B15').alignment = {
      horizontal: 'center',
    };

    worksheet.getCell('A16').value = 'REVISADO:';

    worksheet.getCell('A16').font = {
      bold: true,
    };

    worksheet.mergeCells('B16:I16');

    worksheet.getCell('B16').value = this.getUserName(request.approvedBy);

    worksheet.getCell('B16').alignment = {
      horizontal: 'center',
    };

    for (let row = 15; row <= 16; row++) {
      applyBorder(worksheet.getCell(`A${row}`));

      applyBorder(worksheet.getCell(`B${row}`));
    }

    // ============================================================
    // ENCABEZADO DE TABLA
    // ============================================================

    const HEADER_ROW = 18;

    const headers = [
      'ITEM',
      'CÓDIGO',
      'DESCRIPCIÓN',
      'PEDIDO',
      'U.M.',
      'P.U.',
      'TOTAL',
      'STOCK',
      'OBSERV.',
    ];

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(HEADER_ROW, index + 1);

      cell.value = header;

      cell.font = {
        bold: true,

        color: {
          argb: 'FFFFFFFF',
        },
      };

      cell.fill = {
        type: 'pattern',

        pattern: 'solid',

        fgColor: {
          argb: NAVY,
        },
      };

      cell.alignment = {
        horizontal: 'center',

        vertical: 'middle',

        wrapText: true,
      };

      applyBorder(cell);
    });

    worksheet.getRow(HEADER_ROW).height = 28;

    // ============================================================
    // AGRUPAR POR CATEGORÍA
    // ============================================================

    const grouped = new Map<string, typeof request.details>();

    for (const detail of request.details) {
      const categoryName =
        detail.product.category?.name?.trim() || 'SIN CATEGORÍA';

      if (!grouped.has(categoryName)) {
        grouped.set(categoryName, []);
      }

      grouped.get(categoryName)!.push(detail);
    }

    // ============================================================
    // INSERTAR CATEGORÍAS Y PRODUCTOS
    // ============================================================

    let rowNumber = HEADER_ROW + 1;

    let itemNumber = 1;

    for (const [categoryName, categoryDetails] of grouped.entries()) {
      // ========================================================
      // CATEGORÍA AMARILLA
      // ========================================================

      worksheet.mergeCells(rowNumber, 1, rowNumber, 9);

      const categoryCell = worksheet.getCell(rowNumber, 1);

      categoryCell.value = categoryName.toUpperCase();

      categoryCell.font = {
        bold: true,
        size: 9,
      };

      categoryCell.fill = {
        type: 'pattern',

        pattern: 'solid',

        fgColor: {
          argb: CATEGORY_YELLOW,
        },
      };

      categoryCell.alignment = {
        vertical: 'middle',

        horizontal: 'left',
      };

      applyBorder(categoryCell);

      worksheet.getRow(rowNumber).height = 20;

      rowNumber++;

      // ========================================================
      // PRODUCTOS
      // ========================================================

      for (const detail of categoryDetails) {
        const price = Number(detail.product.currentPrice ?? 0);

        const quantity = Number(detail.quantity ?? 0);

        const total = quantity * price;

        const row = worksheet.getRow(rowNumber);

        row.values = [
          itemNumber,

          detail.product.internalCode ?? detail.product.sku ?? '',

          detail.product.name,

          quantity,

          detail.product.unit,

          price,

          total,

          '',

          detail.observations ?? '',
        ];

        // ======================================================
        // ESTILO PRODUCTO
        // ======================================================

        for (let column = 1; column <= 9; column++) {
          const cell = row.getCell(column);

          applyBorder(cell);

          cell.alignment = {
            vertical: 'middle',

            wrapText: true,
          };
        }

        // ITEM
        row.getCell(1).alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };

        // CÓDIGO
        row.getCell(2).alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };

        // PEDIDO
        row.getCell(4).alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };

        // U.M.
        row.getCell(5).alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };

        // P.U.
        row.getCell(6).numFmt = '"S/ "0.00';

        row.getCell(6).alignment = {
          horizontal: 'right',
          vertical: 'middle',
        };

        // TOTAL
        row.getCell(7).numFmt = '"S/ "0.00';

        row.getCell(7).alignment = {
          horizontal: 'right',
          vertical: 'middle',
        };

        // STOCK
        row.getCell(8).alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };

        row.height = 25;

        rowNumber++;

        itemNumber++;
      }
    }

    // ============================================================
    // OBSERVACIONES GENERALES
    // ============================================================

    rowNumber += 1;

    worksheet.mergeCells(rowNumber, 1, rowNumber, 9);

    const observationsTitle = worksheet.getCell(rowNumber, 1);

    observationsTitle.value = 'OBSERVACIONES GENERALES';

    observationsTitle.font = {
      bold: true,
    };

    observationsTitle.fill = {
      type: 'pattern',

      pattern: 'solid',

      fgColor: {
        argb: LIGHT_GRAY,
      },
    };

    applyBorder(observationsTitle);

    rowNumber++;

    worksheet.mergeCells(rowNumber, 1, rowNumber + 2, 9);

    const observationsCell = worksheet.getCell(rowNumber, 1);

    observationsCell.value = request.observations || 'Sin observaciones.';

    observationsCell.alignment = {
      vertical: 'top',

      wrapText: true,
    };

    applyBorder(observationsCell);

    // ============================================================
    // CONFIGURACIÓN DE IMPRESIÓN
    // ============================================================

    worksheet.pageSetup = {
      orientation: 'landscape',

      paperSize: 9,

      fitToPage: true,

      fitToWidth: 1,

      fitToHeight: 0,

      margins: {
        left: 0.2,

        right: 0.2,

        top: 0.3,

        bottom: 0.3,

        header: 0.1,

        footer: 0.1,
      },
    };

    worksheet.pageSetup.printArea = `A1:I${rowNumber + 3}`;

    worksheet.views = [
      {
        state: 'frozen',

        ySplit: HEADER_ROW,
      },
    ];

    // ============================================================
    // GENERAR ARCHIVO
    // ============================================================

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }
}
