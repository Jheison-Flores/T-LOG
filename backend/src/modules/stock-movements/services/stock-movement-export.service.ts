import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { join } from 'path';

import { StockMovement } from '../entities/stock-movement.entity';
import { StockMovementsService } from './stock.movements.service';

@Injectable()
export class StockMovementExportService {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  private findLogoPath(): string | null {
    const paths = [
      join(process.cwd(), 'public', 'logo-teincomin.png'),
      join(process.cwd(), 'frontend', 'public', 'logo-teincomin.png'),
      join(process.cwd(), '..', 'frontend', 'public', 'logo-teincomin.png'),
    ];
    return paths.find((path) => existsSync(path)) ?? null;
  }

  async generatePdf(id: number, userId: number): Promise<Buffer> {
    const selected = await this.stockMovementsService.findOne(id, userId);
    const all = await this.stockMovementsService.findAll(userId);
    const group = selected.voucherNumber && selected.voucherSeries
      ? this.findVoucherGroup(all, selected)
      : [selected];
    return this.renderVouchers([group]);
  }

  async generateMonthlyPdf(month: string, userId: number): Promise<Buffer> {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new BadRequestException('El mes indicado no es válido.');
    }
    const [year, monthNumber] = month.split('-').map(Number);
    const lastDay = new Date(year, monthNumber, 0).getDate();
    return this.generateRangePdf(`${month}-01`, `${month}-${String(lastDay).padStart(2, '0')}`, undefined, undefined, userId);
  }

  async generateRangePdf(
    fromDate: string,
    toDate: string,
    warehouseId: string | undefined,
    movementType: string | undefined,
    userId: number,
  ): Promise<Buffer> {
    const vouchers = await this.getVouchersInRange(fromDate, toDate, warehouseId, movementType, userId);
    return this.renderVouchers(vouchers);
  }

  async generateRangeExcel(
    fromDate: string,
    toDate: string,
    warehouseId: string | undefined,
    movementType: string | undefined,
    userId: number,
  ): Promise<Buffer> {
    const vouchers = await this.getVouchersInRange(fromDate, toDate, warehouseId, movementType, userId);
    return this.renderVouchersExcel(vouchers, fromDate, toDate);
  }

  getRangeDownloadFilename(fromDate: string, toDate: string, format: 'pdf' | 'xlsx' = 'pdf'): string {
    return `VALES-${fromDate}-a-${toDate}.${format}`;
  }

  private async getVouchersInRange(
    fromDate: string,
    toDate: string,
    warehouseFilter: string | undefined,
    movementTypeFilter: string | undefined,
    userId: number,
  ): Promise<StockMovement[][]> {
    if (!this.isIsoDate(fromDate) || !this.isIsoDate(toDate) || fromDate > toDate) {
      throw new BadRequestException('Selecciona un rango de fechas válido.');
    }
    let warehouseId: number | undefined;
    if (warehouseFilter) {
      warehouseId = Number(warehouseFilter);
      if (!Number.isSafeInteger(warehouseId) || warehouseId < 1) {
        throw new BadRequestException('La mina seleccionada no es válida.');
      }
    }
    if (movementTypeFilter && !['ENTRY', 'OUTPUT', 'TRANSFER', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'].includes(movementTypeFilter)) {
      throw new BadRequestException('El tipo de movimiento seleccionado no es válido.');
    }

    const movements = await this.stockMovementsService.findAll(userId);
    const filtered = movements.filter((movement) => {
      if (!movement.voucherPrefix || !movement.voucherSeries || !movement.voucherNumber) return false;
      const voucherDate = movement.voucherDate?.slice(0, 10) ?? this.formatIsoDate(movement.createdAt);
      if (voucherDate < fromDate || voucherDate > toDate) return false;
      if (movementTypeFilter && movement.movementType !== movementTypeFilter) return false;
      if (!warehouseId) return true;
      return movement.sourceInventory?.warehouse?.id === warehouseId ||
        movement.destinationInventory?.warehouse?.id === warehouseId;
    });
    const vouchers = this.groupVouchers(filtered);
    if (vouchers.length === 0) {
      throw new NotFoundException('No hay vales para los filtros seleccionados.');
    }
    return vouchers;
  }

  private isIsoDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  private formatIsoDate(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }

  getDownloadFilename(movement: StockMovement): string {
    return movement.voucherPrefix
      ? `VALE-${this.getVoucherCode(movement)}.pdf`
      : `MOV-${movement.id}.pdf`;
  }

  getMonthlyDownloadFilename(month: string): string {
    return `VALES-${month}.pdf`;
  }

  private renderVouchers(vouchers: StockMovement[][]): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 26,
        info: { Title: 'Vales de almacén TEINCOMIN', Author: 'TEINCOMIN' },
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      vouchers.forEach((group, index) => {
        if (index > 0) doc.addPage();
        this.drawVoucher(doc, group);
      });
      doc.end();
    });
  }

  private async renderVouchersExcel(
    vouchers: StockMovement[][],
    fromDate: string,
    toDate: string,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TEINCOMIN';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Registro de vales', {
      pageSetup: {
        orientation: 'landscape',
        paperSize: 9,
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: { left: 0.2, right: 0.2, top: 0.3, bottom: 0.3, header: 0, footer: 0 },
      },
    });
    worksheet.views = [{ state: 'frozen', ySplit: 4, showGridLines: false, zoomScale: 80 }];
    const headers = [
      'Fecha', 'Mes', 'Unidad minera', 'Tipo', 'N° de vale',
      'Solicitante / destinatario', 'Recibió', 'Entregó', 'Jefe / encargado de área',
      'Guardia', 'SKU', 'Descripción del material', 'Categoría', 'UND',
      'Cantidad', 'Motivo', 'Comentarios',
    ];
    worksheet.columns = [
      { width: 12 }, { width: 13 }, { width: 19 }, { width: 12 }, { width: 17 },
      { width: 23 }, { width: 19 }, { width: 19 }, { width: 23 }, { width: 12 },
      { width: 14 }, { width: 29 }, { width: 19 }, { width: 9 }, { width: 12 },
      { width: 24 }, { width: 28 },
    ];

    const headerRow = 4;
    const dataStartRow = headerRow + 1;
    const lastColumn = headers.length;
    const lastColumnName = this.columnNumberToName(lastColumn);
    const dataRows = vouchers.flatMap((movements) => movements.map((movement) => {
      const product = this.getProduct(movement);
      const voucherDate = movement.voucherDate ?? movement.createdAt;
      const warehouse = movement.movementType === 'ENTRY' || movement.movementType === 'ADJUSTMENT_IN'
        ? movement.destinationInventory?.warehouse ?? movement.sourceInventory?.warehouse
        : movement.sourceInventory?.warehouse ?? movement.destinationInventory?.warehouse;
      const movementTypeLabel = movement.movementType === 'ENTRY' || movement.movementType === 'ADJUSTMENT_IN'
        ? 'ENTRADA'
        : movement.movementType === 'OUTPUT' || movement.movementType === 'ADJUSTMENT_OUT'
          ? 'SALIDA'
          : 'TRANSFERENCIA';

      return [
        this.formatDate(voucherDate),
        this.formatMonth(voucherDate),
        warehouse?.name ?? '',
        movementTypeLabel,
        this.getVoucherCode(movement),
        movement.voucherPersonnel ?? '',
        movement.receivedBy ?? '',
        movement.deliveredBy ?? '',
        movement.areaManager ?? '',
        movement.voucherShift ?? '',
        product?.sku ?? '',
        product?.name ?? '',
        product?.category?.name ?? '',
        product?.unit ?? '',
        Number(movement.quantity),
        movement.reason ?? '',
        movement.voucherComments ?? '',
      ];
    }));

    worksheet.mergeCells(`A1:${lastColumnName}1`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'CONTROL GENERAL DE VALES - TEINCOMIN';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26364A' } };
    worksheet.getRow(1).height = 32;

    worksheet.mergeCells(`A2:${lastColumnName}2`);
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `Periodo: ${this.formatDate(fromDate)} al ${this.formatDate(toDate)}  |  Vales: ${vouchers.length}  |  Líneas de material: ${dataRows.length}`;
    subtitleCell.font = { name: 'Arial', size: 10, color: { argb: 'FF374151' } };
    subtitleCell.alignment = { horizontal: 'left', vertical: 'middle' };
    worksheet.getRow(2).height = 22;
    worksheet.getRow(3).height = 8;

    const header = worksheet.getRow(headerRow);
    header.values = headers;
    header.height = 34;
    header.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9A3412' } };
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF7C2D12' } } };
    });

    dataRows.forEach((values, index) => {
      const row = worksheet.getRow(dataStartRow + index);
      row.values = values;
      const estimatedLines = values.map((value, valueIndex) => {
        const columnWidth = worksheet.getColumn(valueIndex + 1).width ?? 12;
        return Math.max(1, Math.ceil(String(value ?? '').length / Math.max(1, columnWidth - 2)));
      });
      row.height = Math.min(120, Math.max(30, Math.max(...estimatedLines) * 13));
      row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
        cell.font = { name: 'Arial', size: 9, color: { argb: 'FF111827' } };
        cell.alignment = {
          vertical: 'middle',
          horizontal: columnNumber === 15 ? 'right' : 'left',
          wrapText: true,
        };
        cell.border = {
          bottom: { style: 'hair', color: { argb: 'FFD1D5DB' } },
        };
        if (index % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        }
      });
      row.getCell(15).numFmt = '#,##0.###';
    });

    worksheet.autoFilter = {
      from: `A${headerRow}`,
      to: `${lastColumnName}${Math.max(headerRow, dataStartRow + dataRows.length - 1)}`,
    };
    worksheet.pageSetup.printArea = `A1:${lastColumnName}${Math.max(headerRow, dataStartRow + dataRows.length - 1)}`;

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private drawVoucher(doc: PDFKit.PDFDocument, movements: StockMovement[]): void {
    const selected = movements[0];
    const x = 26;
    const width = 790;
    const border = '#252525';
    const gray = '#ededed';
    const drawCell = (
      left: number,
      top: number,
      cellWidth: number,
      height: number,
      label: string,
      value = '',
      options: { bold?: boolean; centered?: boolean; labelWidth?: number; fontSize?: number } = {},
    ) => {
      doc.rect(left, top, cellWidth, height).lineWidth(0.8).strokeColor(border).stroke();
      if (label) {
        doc.rect(left, top, options.labelWidth ?? cellWidth, height).fillAndStroke(gray, border);
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#111111')
          .text(label, left + 4, top + Math.max(4, (height - 9) / 2), {
            width: (options.labelWidth ?? cellWidth) - 8,
            align: options.centered ? 'center' : 'left',
            ellipsis: true,
          });
      }
      if (value) {
        const valueX = label ? left + (options.labelWidth ?? cellWidth) + 4 : left + 5;
        const valueWidth = cellWidth - (valueX - left) - 5;
        doc.font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(options.fontSize ?? 9).fillColor('#111111')
          .text(value, valueX, top + Math.max(4, (height - 11) / 2), {
            width: valueWidth,
            align: options.centered ? 'center' : 'left',
            ellipsis: true,
          });
      }
    };

    // Plant header: company mark, document name, and controlled-form details.
    const top = 24;
    const headerHeight = 88;
    const logoWidth = 178;
    const titleWidth = 380;
    const metaWidth = width - logoWidth - titleWidth;
    doc.rect(x, top, logoWidth, headerHeight).lineWidth(1).strokeColor(border).stroke();
    const logo = this.findLogoPath();
    if (logo) {
      doc.image(logo, x + 8, top + 9, { fit: [logoWidth - 16, headerHeight - 18] });
    } else {
      doc.font('Helvetica-Bold').fontSize(19).fillColor('#111111')
        .text('TEINCOMIN', x + 12, top + 27, { width: logoWidth - 24, align: 'center' });
    }

    doc.rect(x + logoWidth, top, titleWidth, headerHeight).lineWidth(1).strokeColor(border).stroke();
    doc.rect(x + logoWidth, top, titleWidth, 25).fillAndStroke(gray, border);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111111')
      .text('FORMULARIO', x + logoWidth + 5, top + 7, { width: titleWidth - 10, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(15).fillColor('#111111')
      .text(selected.voucherPrefix === 'E'
        ? 'VALE DE ENTRADA - ALMACÉN'
        : selected.voucherPrefix === 'S'
          ? 'VALE DE SALIDA - ALMACÉN'
          : 'COMPROBANTE DE MOVIMIENTO',
        x + logoWidth + 8, top + 42, { width: titleWidth - 16, align: 'center', ellipsis: true });

    const metaX = x + logoWidth + titleWidth;
    const metaRowHeight = 20;
    const metaLabelWidth = 87;
    drawCell(metaX, top, metaWidth, metaRowHeight, 'CÓDIGO', 'FO-LO-012', { labelWidth: metaLabelWidth });
    drawCell(metaX, top + metaRowHeight, metaWidth, metaRowHeight, 'VERSIÓN', '00', { labelWidth: metaLabelWidth });
    drawCell(metaX, top + metaRowHeight * 2, metaWidth, metaRowHeight, 'FECHA', '19/01/2023', { labelWidth: metaLabelWidth });

    const approvalY = top + metaRowHeight * 3;
    const approvalHeight = headerHeight - metaRowHeight * 3;
    const approvalBoxes = [
      ['ELABORÓ', 'ALO'],
      ['REVISÓ', 'ADM'],
      ['APROBÓ', 'GG'],
    ];
    const approvalBoxWidth = metaWidth / approvalBoxes.length;
    approvalBoxes.forEach(([label, name], index) => {
      const boxX = metaX + approvalBoxWidth * index;
      doc.rect(boxX, approvalY, approvalBoxWidth, approvalHeight).lineWidth(0.8).strokeColor(border).stroke();
      doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#111111')
        .text(label, boxX + 2, approvalY + 5, { width: approvalBoxWidth - 4, align: 'center', ellipsis: true });
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#111111')
        .text(name, boxX + 2, approvalY + 16, { width: approvalBoxWidth - 4, align: 'center' });
    });

    const code = this.getVoucherCode(selected);
    let y = top + headerHeight;
    const firstRowHeight = 23;
    const labelWidth = 105;
    const rightLabelWidth = 57;
    drawCell(x, y, 565, firstRowHeight, 'SOLICITANTE:', selected.voucherPersonnel || '', { labelWidth });
    drawCell(x + 565, y, width - 565, firstRowHeight, 'FECHA:', this.formatDate(selected.voucherDate ?? selected.createdAt), { labelWidth: rightLabelWidth });
    y += firstRowHeight;
    drawCell(x, y, 565, firstRowHeight, 'GUARDIA:', selected.voucherShift || '', { labelWidth });
    drawCell(x + 565, y, width - 565, firstRowHeight, 'N°:', code, { labelWidth: rightLabelWidth, bold: true });
    y += firstRowHeight;
    drawCell(x, y, width, 25, selected.voucherPrefix === 'E'
      ? 'MOTIVO DE ENTRADA:'
      : selected.voucherPrefix === 'S'
        ? 'MOTIVO DE SALIDA:'
        : 'MOTIVO:', selected.reason || '', { labelWidth: 125 });
    y += 25;

    // Materials table uses one quantity column, with the registered product SKU.
    const columns = [55, 96, 430, 75, 134];
    const headings = ['ITEM', 'CÓDIGO', 'DESCRIPCIÓN DEL MATERIAL', 'UND', 'CANTIDAD'];
    const tableHeaderHeight = 28;
    let left = x;
    columns.forEach((columnWidth, index) => {
      doc.rect(left, y, columnWidth, tableHeaderHeight).fillAndStroke(gray, border);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#111111')
        .text(headings[index], left + 3, y + 10, { width: columnWidth - 6, align: 'center', ellipsis: true });
      left += columnWidth;
    });
    y += tableHeaderHeight;

    const lineCount = Math.max(8, movements.length);
    const rowHeight = Math.min(25, 205 / lineCount);
    for (let index = 0; index < lineCount; index += 1) {
      const movement = movements[index];
      const product = movement ? this.getProduct(movement) : undefined;
      const cells = [
        String(index + 1),
        product?.sku || '',
        product?.name || '',
        product?.unit || '',
        movement ? String(movement.quantity) : '',
      ];
      left = x;
      columns.forEach((columnWidth, columnIndex) => {
        doc.rect(left, y, columnWidth, rowHeight).lineWidth(0.65).strokeColor(border).stroke();
        if (cells[columnIndex]) {
          doc.font('Helvetica').fontSize(8).fillColor('#111111')
            .text(cells[columnIndex], left + 4, y + Math.max(3, (rowHeight - 9) / 2), {
              width: columnWidth - 8,
              align: columnIndex === 0 || columnIndex === 3 || columnIndex === 4 ? 'center' : 'left',
              ellipsis: true,
            });
        }
        left += columnWidth;
      });
      y += rowHeight;
    }

    const observationHeight = 45;
    drawCell(x, y, width, observationHeight, 'OBSERVACIÓN:', selected.voucherComments || '', {
      labelWidth: 105,
      fontSize: 8,
    });
    y += observationHeight;

    const footerHeight = 78;
    const signatureWidths = [263, 264, 263];
    const signatureLabels = [
      `ENTREGÓ: ${selected.deliveredBy || ''}`,
      `JEFE / ENCARGADO DE ÁREA (OPCIONAL): ${selected.areaManager || ''}`,
      `RECIBIÓ: ${selected.receivedBy || ''}`,
    ];
    left = x;
    signatureWidths.forEach((signatureWidth, index) => {
      doc.rect(left, y, signatureWidth, footerHeight).lineWidth(0.8).strokeColor(border).stroke();
      doc.moveTo(left + 12, y + 55).lineTo(left + signatureWidth - 12, y + 55)
        .lineWidth(0.7).strokeColor(border).stroke();
      doc.font('Helvetica').fontSize(index === 1 ? 6 : 8).fillColor('#111111')
        .text(signatureLabels[index], left + 5, y + 63, { width: signatureWidth - 10, align: 'center', ellipsis: true });
      left += signatureWidth;
    });
  }

  private groupVouchers(movements: StockMovement[]): StockMovement[][] {
    const groups = new Map<string, StockMovement[]>();
    for (const movement of movements) {
      const key = `${movement.voucherPrefix}-${movement.voucherSeries}-${movement.voucherNumber}`;
      const group = groups.get(key) ?? [];
      group.push(movement);
      groups.set(key, group);
    }
    return [...groups.values()].map((group) => group.sort((a, b) => a.id - b.id)).sort((a, b) => {
      const aDate = a[0].voucherDate ?? '';
      const bDate = b[0].voucherDate ?? '';
      return aDate.localeCompare(bDate) ||
        String(a[0].voucherPrefix).localeCompare(String(b[0].voucherPrefix)) ||
        Number(a[0].voucherNumber) - Number(b[0].voucherNumber);
    });
  }

  private findVoucherGroup(movements: StockMovement[], selected: StockMovement): StockMovement[] {
    const group = movements.filter((movement) =>
      movement.voucherSeries === selected.voucherSeries &&
      movement.voucherPrefix === selected.voucherPrefix &&
      movement.voucherNumber === selected.voucherNumber,
    );
    return group.length ? group.sort((a, b) => a.id - b.id) : [selected];
  }

  private getVoucherCode(movement: StockMovement): string {
    if (!movement.voucherPrefix || !movement.voucherNumber) return '';
    const series = movement.voucherSeries ? `-${movement.voucherSeries}` : '';
    return `${movement.voucherPrefix}${series}-${String(movement.voucherNumber).padStart(6, '0')}`;
  }

  private getProduct(movement: StockMovement) {
    return movement.sourceInventory?.product ?? movement.destinationInventory?.product;
  }

  private columnNumberToName(columnNumber: number): string {
    let current = columnNumber;
    let name = '';

    while (current > 0) {
      const remainder = (current - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      current = Math.floor((current - 1) / 26);
    }

    return name;
  }

  private formatDate(value: string | Date): string {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es-PE');
  }

  private formatMonth(value: string | Date): string {
    const monthNumber = typeof value === 'string' && /^\d{4}-\d{2}/.test(value)
      ? Number(value.slice(5, 7))
      : new Date(value).getMonth() + 1;
    const months = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
    ];
    return months[monthNumber - 1] ?? '';
  }
}
