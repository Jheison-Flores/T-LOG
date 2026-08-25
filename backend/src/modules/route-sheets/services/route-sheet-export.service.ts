import { Injectable } from '@nestjs/common';

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

import { existsSync } from 'fs';
import { extname, join } from 'path';

import { RouteSheetsService } from './route-sheets.service';

import { SettingsService } from '../../settings/services/settings.services';

import { RouteSheetStatus } from '../entities/route-sheet-status.enum';

@Injectable()
export class RouteSheetExportService {
  // ============================================================
  // FORMATO DOCUMENTAL
  // ============================================================

  private readonly FORM_CODE = 'FO-LO-016';

  private readonly FORM_VERSION = '00';

  private readonly FORM_DATE = '13/09/2023';

  private readonly ELABORATED_BY = 'ALO';

  private readonly REVIEWED_BY = 'ADM';

  private readonly APPROVED_BY = 'GG';

  // ============================================================
  // COLORES
  // ============================================================

  private readonly BLACK = '#000000';

  private readonly RED = '#FF0000';

  private readonly GRAY = '#B7B7B7';

  private readonly PEACH = '#F4B183';

  private readonly RED_EXCEL = 'FFFF0000';

  private readonly GRAY_EXCEL = 'FFB7B7B7';

  private readonly PEACH_EXCEL = 'FFF4B183';

  constructor(
    private readonly routeSheetsService: RouteSheetsService,

    private readonly settingsService: SettingsService,
  ) {}

  // ============================================================
  // FECHA
  // ============================================================

  private formatDate(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');

      return `${day}/${month}/${year}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('es-PE');
  }

  // ============================================================
  // CANTIDAD
  // ============================================================

  private formatQuantity(value: number | string | null | undefined): string {
    const numberValue = Number(value ?? 0);

    if (!Number.isFinite(numberValue)) {
      return '';
    }

    if (Number.isInteger(numberValue)) {
      return String(numberValue);
    }

    return numberValue.toFixed(2).replace(/\.00$/, '');
  }

  // ============================================================
  // SEDE LIMA
  // ============================================================

  private getSentLabel(quantity: number | string): string {
    return `C- ${this.formatQuantity(quantity)}`;
  }

  // ============================================================
  // ALMACÉN PROYECTO
  // ============================================================

  private getReceivedLabel(
    sentQuantity: number | string,
    receivedQuantity: number | string,
    isConforming: boolean,
  ): string {
    const sent = Number(sentQuantity);

    const received = Number(receivedQuantity);

    if (isConforming && sent === received) {
      return `C- ${this.formatQuantity(received)}`;
    }

    return `NC- ${this.formatQuantity(received)}`;
  }

  // ============================================================
  // INSTALACIÓN
  // ============================================================

  private getInstallationLabel(value: boolean | null | undefined): string {
    if (value === true) {
      return 'C';
    }

    if (value === false) {
      return 'NC';
    }

    return '';
  }

  // ============================================================
  // LOGO
  // ============================================================

  private findLogoPath(): string | null {
    const possiblePaths = [
      join(process.cwd(), 'public', 'logo-teincomin.png'),

      join(process.cwd(), 'public', 'teincomin-logo.png'),

      join(process.cwd(), 'uploads', 'logo-teincomin.png'),

      join(process.cwd(), 'src', 'assets', 'logo-teincomin.png'),

      join(process.cwd(), 'public', 'logo-teincomin.jpg'),
    ];

    for (const logoPath of possiblePaths) {
      if (existsSync(logoPath)) {
        return logoPath;
      }
    }

    return null;
  }

  // ============================================================
  // PDF
  // ============================================================

  async generatePdf(id: number, userId: number): Promise<Buffer> {
    const routeSheet = await this.routeSheetsService.findOne(id, userId);

    const settings = await this.settingsService.getSettings();

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',

        layout: 'landscape',

        margin: 0,

        bufferPages: true,

        info: {
          Title: `Hoja de Recorrido ${routeSheet.routeSheetNumber}`,

          Author: settings.companyName || 'TEINCOMIN',
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', reject);

      // ======================================================
      // DIMENSIONES A4 HORIZONTAL
      // ======================================================

      const PAGE_WIDTH = 841.89;

      const PAGE_HEIGHT = 595.28;

      const LEFT = 14;

      const TOP = 12;

      const WIDTH = PAGE_WIDTH - 28;

      // ======================================================
      // HELPERS PDF
      // ======================================================

      const drawBorder = (
        x: number,
        y: number,
        width: number,
        height: number,
        lineWidth = 0.7,
      ) => {
        doc
          .save()
          .strokeColor(this.BLACK)
          .lineWidth(lineWidth)
          .rect(x, y, width, height)
          .stroke()
          .restore();
      };

      const drawFill = (
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
      ) => {
        doc.save().rect(x, y, width, height).fill(color).restore();
      };

      const drawText = (
        value: string,
        x: number,
        y: number,
        width: number,
        options?: {
          bold?: boolean;
          size?: number;
          align?: 'left' | 'center' | 'right';
          color?: string;
        },
      ) => {
        doc
          .font(options?.bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(options?.size ?? 7)
          .fillColor(options?.color ?? this.BLACK)
          .text(value ?? '', x, y, {
            width,

            align: options?.align ?? 'left',
          });
      };

      // ======================================================
      // CABECERA
      // ======================================================

      const logoWidth = 82;

      const titleWidth = 385;

      const controlWidth = WIDTH - logoWidth - titleWidth;

      const headerHeight = 72;

      // ======================================================
      // LOGO
      // ======================================================

      drawBorder(LEFT, TOP, logoWidth, headerHeight, 1);

      const logoPath = this.findLogoPath();

      if (logoPath) {
        try {
          doc.image(logoPath, LEFT + 8, TOP + 11, {
            fit: [logoWidth - 16, 48],
          });
        } catch {
          drawText('TEINCOMIN', LEFT + 4, TOP + 30, logoWidth - 8, {
            bold: true,

            size: 10,

            align: 'center',
          });
        }
      } else {
        drawText('TEINCOMIN', LEFT + 4, TOP + 30, logoWidth - 8, {
          bold: true,

          size: 10,

          align: 'center',
        });
      }

      // ======================================================
      // FORMULARIO
      // ======================================================

      const titleX = LEFT + logoWidth;

      drawBorder(titleX, TOP, titleWidth, 27, 1);

      drawText('FORMULARIO', titleX, TOP + 8, titleWidth, {
        bold: true,

        size: 11,

        align: 'center',
      });

      drawBorder(titleX, TOP + 27, titleWidth, headerHeight - 27, 1);

      drawText(
        'HOJA DE RECORRIDO DEL REQUERIMIENTO',
        titleX,
        TOP + 44,
        titleWidth,
        {
          bold: true,

          size: 12,

          align: 'center',
        },
      );

      // ======================================================
      // CONTROL DOCUMENTAL
      // ======================================================

      const controlX = titleX + titleWidth;

      drawBorder(controlX, TOP, controlWidth, headerHeight, 1);

      drawText(
        `CÓDIGO: ${this.FORM_CODE}`,
        controlX + 5,
        TOP + 5,
        controlWidth - 10,
        {
          bold: true,

          size: 6,
        },
      );

      drawText(
        `VERSIÓN: ${this.FORM_VERSION}`,
        controlX + 5,
        TOP + 15,
        controlWidth - 10,
        {
          bold: true,

          size: 6,
        },
      );

      drawText(
        `FECHA: ${this.FORM_DATE}`,
        controlX + 5,
        TOP + 25,
        controlWidth - 10,
        {
          bold: true,

          size: 6,
        },
      );

      const controlBottomY = TOP + 40;

      doc
        .moveTo(controlX, controlBottomY)
        .lineTo(controlX + controlWidth, controlBottomY)
        .stroke();

      const controlThird = controlWidth / 3;

      for (let index = 1; index <= 2; index++) {
        const verticalX = controlX + controlThird * index;

        doc
          .moveTo(verticalX, controlBottomY)
          .lineTo(verticalX, TOP + headerHeight)
          .stroke();
      }

      drawText(
        `Elaborado:\n${this.ELABORATED_BY}`,
        controlX,
        TOP + 46,
        controlThird,
        {
          bold: true,

          size: 5.5,

          align: 'center',
        },
      );

      drawText(
        `Revisado:\n${this.REVIEWED_BY}`,
        controlX + controlThird,
        TOP + 46,
        controlThird,
        {
          bold: true,

          size: 5.5,

          align: 'center',
        },
      );

      drawText(
        `Aprobado:\n${this.APPROVED_BY}`,
        controlX + controlThird * 2,
        TOP + 46,
        controlThird,
        {
          bold: true,

          size: 5.5,

          align: 'center',
        },
      );

      // ======================================================
      // INFORMACIÓN PRINCIPAL
      // ======================================================

      let y = TOP + headerHeight + 8;

      const leftBlockWidth = 470;

      const rightBlockWidth = WIDTH - leftBlockWidth;

      const rightX = LEFT + leftBlockWidth;

      // ======================================================
      // UNIDAD / GUÍA
      // ======================================================

      drawBorder(LEFT, y, leftBlockWidth, 30);

      drawText('Unidad/\nProyecto:', LEFT + 5, y + 6, 85, {
        bold: true,

        size: 7,
      });

      drawText(
        routeSheet.warehouse.name.toUpperCase(),
        LEFT + 90,
        y + 9,
        leftBlockWidth - 95,
        {
          bold: true,

          size: 11,

          align: 'center',
        },
      );

      drawBorder(rightX, y, rightBlockWidth, 30);

      drawText('N° DE GUÍA DE REMISIÓN:', rightX + 5, y + 10, 130, {
        bold: true,

        size: 6.5,
      });

      drawText(
        routeSheet.remissionGuide.fullNumber,
        rightX + 135,
        y + 9,
        rightBlockWidth - 140,
        {
          bold: true,

          size: 10,

          align: 'center',
        },
      );

      y += 30;

      // ======================================================
      // IZQUIERDA DATOS REQUERIMIENTO
      // ======================================================

      const infoWidth = 160;

      const incidentWidth = leftBlockWidth - infoWidth;

      // N° REQ

      drawBorder(LEFT, y, 82, 25);

      drawText('N° de\nRequerimiento:', LEFT + 5, y + 4, 72, {
        bold: true,

        size: 6.5,
      });

      drawBorder(LEFT + 82, y, 78, 25);

      drawText(
        routeSheet.request?.requestNumber ?? 'SIN REQUERIMIENTO',
        LEFT + 84,
        y + 8,
        74,
        {
          bold: true,

          size: 7.5,

          align: 'center',

          color: this.RED,
        },
      );

      // FECHA ENVÍO

      drawBorder(LEFT, y + 25, 82, 25);

      drawText('Fecha de envío:', LEFT + 5, y + 33, 72, {
        bold: true,

        size: 6.5,
      });

      drawBorder(LEFT + 82, y + 25, 78, 25);

      drawText(
        this.formatDate(routeSheet.shippingDate),
        LEFT + 84,
        y + 33,
        74,
        {
          bold: true,

          size: 8,

          align: 'center',

          color: this.RED,
        },
      );

      // FECHA RECEPCIÓN

      drawBorder(LEFT, y + 50, 82, 25);

      drawText('Fecha de\nRecepción:', LEFT + 5, y + 54, 72, {
        bold: true,

        size: 6.5,
      });

      drawBorder(LEFT + 82, y + 50, 78, 25);

      drawText(
        this.formatDate(routeSheet.receptionDate),
        LEFT + 84,
        y + 58,
        74,
        {
          bold: true,

          size: 8,

          align: 'center',

          color: this.RED,
        },
      );

      // ======================================================
      // INCIDENTE
      // ======================================================

      drawBorder(LEFT + infoWidth, y, incidentWidth, 75);

      const incidentText =
        routeSheet.incidentDescription?.trim() ||
        (routeSheet.status === RouteSheetStatus.CONFORMING
          ? 'Recepción conforme de los materiales enviados según la Guía de Remisión.'
          : 'Recepción con observaciones.');

      drawText(incidentText, LEFT + infoWidth + 7, y + 18, incidentWidth - 14, {
        bold: true,

        size: 7,
      });

      // ======================================================
      // DERECHA
      // ======================================================

      drawBorder(rightX, y, rightBlockWidth, 75);

      drawBorder(rightX, y, rightBlockWidth, 25);

      drawText('Fecha:', rightX + 6, y + 8, 50, {
        bold: true,

        size: 6.5,
      });

      drawText(
        this.formatDate(routeSheet.receptionDate),
        rightX + rightBlockWidth - 100,
        y + 8,
        90,
        {
          bold: true,

          size: 7,

          align: 'center',
        },
      );

      drawBorder(rightX, y + 25, 120, 50);

      drawText('Responsable:', rightX, y + 31, 120, {
        bold: true,

        size: 6.5,

        align: 'center',
      });

      drawText(
        routeSheet.responsibleName.toUpperCase(),
        rightX + 5,
        y + 50,
        110,
        {
          bold: true,

          size: 7,

          align: 'center',
        },
      );

      drawBorder(rightX + 120, y + 25, rightBlockWidth - 120, 50);

      y += 75;

      // ======================================================
      // CABECERA DE TABLA
      // ======================================================

      const itemWidth = leftBlockWidth;

      const validationWidth = rightBlockWidth;

      drawFill(LEFT, y, itemWidth, 62, this.GRAY);

      drawBorder(LEFT, y, itemWidth, 62, 1);

      drawText('ITEM', LEFT, y + 25, itemWidth, {
        bold: true,

        size: 11,

        align: 'center',
      });

      drawFill(rightX, y, validationWidth, 37, this.GRAY);

      drawBorder(rightX, y, validationWidth, 37, 1);

      drawText(
        'Indicar CONFORMIDAD con (C), en caso de NO CONFORMIDAD detallar\nde forma breve el incidente',
        rightX + 5,
        y + 8,
        validationWidth - 10,
        {
          bold: true,

          size: 6,

          align: 'center',
        },
      );

      const validationColumnWidth = validationWidth / 3;

      for (let column = 0; column < 3; column++) {
        drawFill(
          rightX + validationColumnWidth * column,
          y + 37,
          validationColumnWidth,
          25,
          this.PEACH,
        );

        drawBorder(
          rightX + validationColumnWidth * column,
          y + 37,
          validationColumnWidth,
          25,
        );
      }

      drawText('SEDE LIMA\n(cantidad)', rightX, y + 42, validationColumnWidth, {
        bold: true,

        size: 5.8,

        align: 'center',
      });

      drawText(
        'ALMACÉN EN\nPROYECTO (cantidad)',
        rightX + validationColumnWidth,
        y + 42,
        validationColumnWidth,
        {
          bold: true,

          size: 5.8,

          align: 'center',
        },
      );

      drawText(
        'INSTALACIÓN EN\nPROYECTO',
        rightX + validationColumnWidth * 2,
        y + 42,
        validationColumnWidth,
        {
          bold: true,

          size: 5.8,

          align: 'center',
        },
      );

      y += 62;

      // ======================================================
      // PRODUCTOS
      // ======================================================

      const availableHeight = PAGE_HEIGHT - y - 20;

      const detailCount = Math.max(routeSheet.details.length, 1);

      const dynamicRowHeight = Math.min(
        40,
        Math.max(28, availableHeight / detailCount),
      );

      for (const detail of routeSheet.details) {
        if (y + dynamicRowHeight > PAGE_HEIGHT - 15) {
          break;
        }

        // ITEM

        drawBorder(LEFT, y, itemWidth, dynamicRowHeight);

        drawText(
          detail.product.name.toUpperCase(),
          LEFT + 8,
          y + dynamicRowHeight / 2 - 5,
          itemWidth - 16,
          {
            size: 8,

            align: 'center',

            color: this.RED,
          },
        );

        // SEDE LIMA

        drawBorder(rightX, y, validationColumnWidth, dynamicRowHeight);

        drawText(
          this.getSentLabel(detail.sentQuantity),
          rightX,
          y + dynamicRowHeight / 2 - 8,
          validationColumnWidth,
          {
            size: 13,

            align: 'center',

            color: this.RED,
          },
        );

        // ALMACÉN

        drawBorder(
          rightX + validationColumnWidth,
          y,
          validationColumnWidth,
          dynamicRowHeight,
        );

        drawText(
          this.getReceivedLabel(
            detail.sentQuantity,
            detail.receivedQuantity,
            detail.isConforming,
          ),
          rightX + validationColumnWidth,
          y + dynamicRowHeight / 2 - 8,
          validationColumnWidth,
          {
            size: 13,

            align: 'center',

            color: this.RED,
          },
        );

        // INSTALACIÓN

        drawBorder(
          rightX + validationColumnWidth * 2,
          y,
          validationColumnWidth,
          dynamicRowHeight,
        );

        drawText(
          this.getInstallationLabel(detail.installationConforming),
          rightX + validationColumnWidth * 2,
          y + dynamicRowHeight / 2 - 8,
          validationColumnWidth,
          {
            size: 13,

            align: 'center',

            color: this.RED,
          },
        );

        y += dynamicRowHeight;
      }

      doc.end();
    });
  }

  // ============================================================
  // EXCEL
  // ============================================================

  async generateExcel(id: number, userId: number): Promise<Buffer> {
    const routeSheet = await this.routeSheetsService.findOne(id, userId);

    const settings = await this.settingsService.getSettings();

    const workbook = new ExcelJS.Workbook();

    workbook.creator = settings.systemName || 'T-LOG';

    workbook.created = new Date();

    const ws = workbook.addWorksheet('Hoja de Recorrido');

    // ============================================================
    // COLUMNAS
    // ============================================================

    ws.columns = [
      {
        width: 17,
      },

      {
        width: 17,
      },

      {
        width: 24,
      },

      {
        width: 24,
      },

      {
        width: 20,
      },

      {
        width: 20,
      },

      {
        width: 20,
      },
    ];

    ws.views = [
      {
        showGridLines: false,
      },
    ];

    // ============================================================
    // BORDES
    // ============================================================

    const thinBorder: Partial<ExcelJS.Borders> = {
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

    const borderRange = (
      startRow: number,
      startColumn: number,
      endRow: number,
      endColumn: number,
    ) => {
      for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
        for (
          let columnIndex = startColumn;
          columnIndex <= endColumn;
          columnIndex++
        ) {
          ws.getCell(rowIndex, columnIndex).border = thinBorder;
        }
      }
    };

    // ============================================================
    // ESTILOS
    // ============================================================

    const grayFill: ExcelJS.Fill = {
      type: 'pattern',

      pattern: 'solid',

      fgColor: {
        argb: this.GRAY_EXCEL,
      },
    };

    const peachFill: ExcelJS.Fill = {
      type: 'pattern',

      pattern: 'solid',

      fgColor: {
        argb: this.PEACH_EXCEL,
      },
    };

    const center = (reference: string) => {
      ws.getCell(reference).alignment = {
        horizontal: 'center',

        vertical: 'middle',

        wrapText: true,
      };
    };

    const applyRed = (reference: string, size = 10) => {
      const cell = ws.getCell(reference);

      cell.font = {
        ...cell.font,

        name: 'Arial',

        size,

        color: {
          argb: this.RED_EXCEL,
        },
      };
    };

    // ============================================================
    // LOGO
    // ============================================================

    ws.mergeCells('A1:A4');

    borderRange(1, 1, 4, 1);

    const logoPath = this.findLogoPath();

    if (logoPath) {
      try {
        const extension = extname(logoPath).toLowerCase().replace('.', '');

        const imageExtension: 'png' | 'jpeg' =
          extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : 'png';

        const imageId = workbook.addImage({
          filename: logoPath,

          extension: imageExtension,
        });

        // Compatible con tu versión de ExcelJS
        ws.addImage(imageId, 'A1:A4');
      } catch {
        ws.getCell('A1').value = 'TEINCOMIN';

        ws.getCell('A1').font = {
          bold: true,

          size: 12,
        };

        center('A1');
      }
    } else {
      ws.getCell('A1').value = 'TEINCOMIN';

      ws.getCell('A1').font = {
        bold: true,

        size: 12,
      };

      center('A1');
    }

    // ============================================================
    // FORMULARIO
    // ============================================================

    ws.mergeCells('B1:D2');

    ws.getCell('B1').value = 'FORMULARIO';

    ws.getCell('B1').font = {
      bold: true,

      size: 12,
    };

    center('B1');

    borderRange(1, 2, 2, 4);

    ws.mergeCells('B3:D4');

    ws.getCell('B3').value = 'HOJA DE RECORRIDO DEL REQUERIMIENTO';

    ws.getCell('B3').font = {
      bold: true,

      size: 11,
    };

    center('B3');

    borderRange(3, 2, 4, 4);

    // ============================================================
    // CONTROL DOCUMENTAL
    // ============================================================

    ws.mergeCells('E1:G1');

    ws.getCell('E1').value = `CÓDIGO: ${this.FORM_CODE}`;

    ws.mergeCells('E2:G2');

    ws.getCell('E2').value = `VERSIÓN: ${this.FORM_VERSION}`;

    ws.mergeCells('E3:G3');

    ws.getCell('E3').value = `FECHA: ${this.FORM_DATE}`;

    ws.getCell('E4').value = `Elaborado:\n${this.ELABORATED_BY}`;

    ws.getCell('F4').value = `Revisado:\n${this.REVIEWED_BY}`;

    ws.getCell('G4').value = `Aprobado:\n${this.APPROVED_BY}`;

    for (let rowIndex = 1; rowIndex <= 4; rowIndex++) {
      for (let columnIndex = 5; columnIndex <= 7; columnIndex++) {
        const cell = ws.getCell(rowIndex, columnIndex);

        cell.font = {
          bold: true,

          size: 7,
        };

        cell.alignment = {
          horizontal: rowIndex === 4 ? 'center' : 'left',

          vertical: 'middle',

          wrapText: true,
        };
      }
    }

    borderRange(1, 5, 4, 7);

    // ============================================================
    // UNIDAD
    // ============================================================

    ws.getCell('A6').value = 'Unidad/\nProyecto:';

    ws.getCell('A6').font = {
      bold: true,

      size: 8,
    };

    ws.mergeCells('B6:D6');

    ws.getCell('B6').value = routeSheet.warehouse.name.toUpperCase();

    ws.getCell('B6').font = {
      bold: true,

      size: 12,
    };

    center('B6');

    borderRange(6, 1, 6, 4);

    // ============================================================
    // GUÍA
    // ============================================================

    ws.getCell('E6').value = 'N° DE GUÍA DE REMISIÓN:';

    ws.getCell('E6').font = {
      bold: true,

      size: 7,
    };

    ws.mergeCells('F6:G6');

    ws.getCell('F6').value = routeSheet.remissionGuide.fullNumber;

    ws.getCell('F6').font = {
      bold: true,

      size: 11,
    };

    center('F6');

    borderRange(6, 5, 6, 7);

    // ============================================================
    // REQUERIMIENTO
    // ============================================================

    ws.getCell('A7').value = 'N° de\nRequerimiento:';

    ws.getCell('A7').font = {
      bold: true,

      size: 8,
    };

    ws.getCell('B7').value =
      routeSheet.request?.requestNumber ?? 'SIN REQUERIMIENTO';

    applyRed('B7', 10);

    center('B7');

    // ============================================================
    // INCIDENTE
    // ============================================================

    ws.mergeCells('C7:D9');

    ws.getCell('C7').value =
      routeSheet.incidentDescription?.trim() ||
      (routeSheet.status === RouteSheetStatus.CONFORMING
        ? 'Recepción conforme de los materiales enviados según la Guía de Remisión.'
        : 'Recepción con observaciones.');

    ws.getCell('C7').font = {
      bold: true,

      size: 8,
    };

    ws.getCell('C7').alignment = {
      vertical: 'middle',

      wrapText: true,
    };

    // ============================================================
    // FECHA DERECHA
    // ============================================================

    ws.getCell('E7').value = 'Fecha:';

    ws.mergeCells('F7:G7');

    ws.getCell('F7').value = this.formatDate(routeSheet.receptionDate);

    center('F7');

    // ============================================================
    // FECHA ENVÍO
    // ============================================================

    ws.getCell('A8').value = 'Fecha de envío:';

    ws.getCell('A8').font = {
      bold: true,

      size: 8,
    };

    ws.getCell('B8').value = this.formatDate(routeSheet.shippingDate);

    applyRed('B8', 10);

    center('B8');

    // ============================================================
    // RESPONSABLE
    // ============================================================

    ws.getCell('E8').value = 'Responsable:';

    ws.getCell('E8').font = {
      bold: true,

      size: 8,
    };

    ws.mergeCells('F8:G9');

    ws.getCell('F8').value = routeSheet.responsibleName.toUpperCase();

    ws.getCell('F8').font = {
      bold: true,

      size: 9,
    };

    center('F8');

    // ============================================================
    // FECHA RECEPCIÓN
    // ============================================================

    ws.getCell('A9').value = 'Fecha de\nRecepción:';

    ws.getCell('A9').font = {
      bold: true,

      size: 8,
    };

    ws.getCell('B9').value = this.formatDate(routeSheet.receptionDate);

    applyRed('B9', 10);

    center('B9');

    borderRange(7, 1, 9, 7);

    // ============================================================
    // CABECERA ITEM
    // ============================================================

    ws.mergeCells('A10:D11');

    ws.getCell('A10').value = 'ITEM';

    ws.getCell('A10').fill = grayFill;

    ws.getCell('A10').font = {
      bold: true,

      size: 12,
    };

    center('A10');

    borderRange(10, 1, 11, 4);

    // ============================================================
    // INSTRUCCIÓN
    // ============================================================

    ws.mergeCells('E10:G10');

    ws.getCell('E10').value =
      'Indicar CONFORMIDAD con (C), en caso de NO CONFORMIDAD detallar de forma breve el incidente';

    ws.getCell('E10').fill = grayFill;

    ws.getCell('E10').font = {
      bold: true,

      size: 7,
    };

    center('E10');

    borderRange(10, 5, 10, 7);

    // ============================================================
    // SUBCABECERAS
    // ============================================================

    ws.getCell('E11').value = 'SEDE LIMA (cantidad)';

    ws.getCell('F11').value = 'ALMACÉN EN PROYECTO (cantidad)';

    ws.getCell('G11').value = 'INSTALACIÓN EN PROYECTO';

    for (const cellReference of ['E11', 'F11', 'G11']) {
      const cell = ws.getCell(cellReference);

      cell.fill = peachFill;

      cell.font = {
        bold: true,

        size: 7,
      };

      cell.alignment = {
        horizontal: 'center',

        vertical: 'middle',

        wrapText: true,
      };
    }

    borderRange(11, 5, 11, 7);

    // ============================================================
    // PRODUCTOS
    // ============================================================

    let currentRow = 12;

    for (const detail of routeSheet.details) {
      ws.mergeCells(`A${currentRow}:D${currentRow}`);

      ws.getCell(`A${currentRow}`).value = detail.product.name.toUpperCase();

      applyRed(`A${currentRow}`, 10);

      center(`A${currentRow}`);

      // SEDE LIMA

      ws.getCell(`E${currentRow}`).value = this.getSentLabel(
        detail.sentQuantity,
      );

      applyRed(`E${currentRow}`, 14);

      center(`E${currentRow}`);

      // ALMACÉN PROYECTO

      ws.getCell(`F${currentRow}`).value = this.getReceivedLabel(
        detail.sentQuantity,
        detail.receivedQuantity,
        detail.isConforming,
      );

      applyRed(`F${currentRow}`, 14);

      center(`F${currentRow}`);

      // INSTALACIÓN

      ws.getCell(`G${currentRow}`).value = this.getInstallationLabel(
        detail.installationConforming,
      );

      applyRed(`G${currentRow}`, 14);

      center(`G${currentRow}`);

      ws.getRow(currentRow).height = 38;

      borderRange(currentRow, 1, currentRow, 7);

      currentRow++;
    }

    // ============================================================
    // OBSERVACIONES POR PRODUCTO
    // ============================================================

    const observedDetails = routeSheet.details.filter((detail) =>
      Boolean(detail.observation?.trim()),
    );

    if (observedDetails.length > 0) {
      currentRow++;

      ws.mergeCells(`A${currentRow}:G${currentRow}`);

      ws.getCell(`A${currentRow}`).value = 'DETALLE DE OBSERVACIONES';

      ws.getCell(`A${currentRow}`).fill = grayFill;

      ws.getCell(`A${currentRow}`).font = {
        bold: true,

        size: 9,
      };

      center(`A${currentRow}`);

      borderRange(currentRow, 1, currentRow, 7);

      currentRow++;

      for (const detail of observedDetails) {
        ws.mergeCells(`A${currentRow}:G${currentRow}`);

        ws.getCell(`A${currentRow}`).value =
          `${detail.product.name}: ${detail.observation}`;

        ws.getCell(`A${currentRow}`).alignment = {
          vertical: 'middle',

          wrapText: true,
        };

        borderRange(currentRow, 1, currentRow, 7);

        currentRow++;
      }
    }

    // ============================================================
    // FUENTE GENERAL
    // ============================================================

    ws.eachRow(
      {
        includeEmpty: true,
      },
      (row) => {
        row.eachCell(
          {
            includeEmpty: true,
          },
          (cell) => {
            cell.font = {
              ...cell.font,

              name: cell.font?.name || 'Arial',
            };
          },
        );
      },
    );

    // ============================================================
    // ALTURAS
    // ============================================================

    ws.getRow(1).height = 20;

    ws.getRow(2).height = 20;

    ws.getRow(3).height = 22;

    ws.getRow(4).height = 24;

    ws.getRow(6).height = 30;

    ws.getRow(7).height = 30;

    ws.getRow(8).height = 30;

    ws.getRow(9).height = 30;

    ws.getRow(10).height = 35;

    ws.getRow(11).height = 35;

    // ============================================================
    // IMPRESIÓN
    //
    // Importante:
    // NO usamos ws.pageMargins porque tu versión de ExcelJS
    // no lo soporta.
    // ============================================================

    ws.pageSetup = {
      orientation: 'landscape',

      paperSize: 9,

      fitToPage: true,

      fitToWidth: 1,

      fitToHeight: 1,

      horizontalCentered: true,

      verticalCentered: false,

      margins: {
        left: 0.2,

        right: 0.2,

        top: 0.2,

        bottom: 0.2,

        header: 0,

        footer: 0,
      },
    };

    ws.pageSetup.printArea = `A1:G${currentRow}`;

    // ============================================================
    // BUFFER
    // ============================================================

    const excelBuffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(excelBuffer);
  }
}
