import { Injectable } from '@nestjs/common';
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
    const movements = selected.voucherNumber && selected.voucherSeries
      ? (await this.stockMovementsService.findAll(userId)).filter(
          (movement) =>
            movement.voucherSeries === selected.voucherSeries &&
            movement.voucherPrefix === selected.voucherPrefix &&
            movement.voucherNumber === selected.voucherNumber,
        )
      : [selected];

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 42,
        info: { Title: this.getDocumentTitle(selected), Author: 'TEINCOMIN' },
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const logo = this.findLogoPath();
      if (logo) {
        doc.image(logo, 42, 34, { fit: [170, 54] });
      } else {
        doc.font('Helvetica-Bold').fontSize(19).fillColor('#1f2937')
          .text('TEINCOMIN', 42, 48);
      }

      const voucherCode = this.getVoucherCode(selected);
      const title = selected.voucherPrefix === 'E'
        ? 'VALE DE ENTRADA'
        : selected.voucherPrefix === 'S'
          ? 'VALE DE SALIDA'
          : 'COMPROBANTE DE MOVIMIENTO';
      doc.font('Helvetica-Bold').fontSize(17).fillColor('#1f2937')
        .text(title, 250, 42, { width: 303, align: 'right' });
      if (voucherCode) {
        doc.font('Helvetica').fontSize(11).fillColor('#4b5563')
          .text(voucherCode, 250, 66, { width: 303, align: 'right' });
      }

      doc.moveTo(42, 100).lineTo(553, 100).lineWidth(2).strokeColor('#ea580c').stroke();
      let y = 116;
      const warehouse = this.getWarehouseName(selected);
      const fields: Array<[string, string]> = [
        ['Mina / almacén', warehouse],
        ['Fecha', this.formatDate(selected.voucherDate ?? selected.createdAt)],
        ['Personal involucrado', selected.voucherPersonnel || '—'],
        ['Registrado por', this.getUserName(selected)],
      ];

      fields.forEach(([label, value], index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = column === 0 ? 42 : 306;
        const top = y + row * 43;
        doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
          .text(label.toUpperCase(), x, top, { width: 245 });
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#1f2937')
          .text(value, x, top + 13, { width: 245, ellipsis: true });
      });

      y += 102;
      const drawTableHeader = () => {
        doc.rect(42, y, 511, 24).fill('#f3f4f6');
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#374151');
        doc.text('SKU', 49, y + 8, { width: 84 });
        doc.text('PRODUCTO', 137, y + 8, { width: 245 });
        doc.text('CANTIDAD', 385, y + 8, { width: 70, align: 'right' });
        doc.text('UNIDAD', 464, y + 8, { width: 80, align: 'right' });
        y += 24;
      };

      drawTableHeader();
      movements.forEach((movement) => {
        const product = this.getProduct(movement);
        const productName = product?.name || 'Producto';
        const rowHeight = Math.max(28, doc.heightOfString(productName, { width: 240 }) + 14);
        if (y + rowHeight > 735) {
          doc.addPage();
          y = 42;
          drawTableHeader();
        }
        doc.rect(42, y, 511, rowHeight).lineWidth(0.5).strokeColor('#d1d5db').stroke();
        doc.font('Helvetica').fontSize(9).fillColor('#1f2937');
        doc.text(product?.sku || '—', 49, y + 8, { width: 84, ellipsis: true });
        doc.text(productName, 137, y + 7, { width: 240 });
        doc.text(String(movement.quantity), 385, y + 8, { width: 70, align: 'right' });
        doc.text(product?.unit || '—', 464, y + 8, { width: 80, align: 'right' });
        y += rowHeight;
      });

      y += 20;
      if (selected.reason || selected.voucherComments) {
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#4b5563')
          .text('COMENTARIOS', 42, y);
        y += 14;
        doc.font('Helvetica').fontSize(9).fillColor('#1f2937')
          .text(selected.voucherComments || selected.reason || '', 42, y, { width: 511 });
        y = doc.y + 28;
      }

      if (selected.deliveredBy || selected.receivedBy) {
        if (y > 710) {
          doc.addPage();
          y = 100;
        }
        const signatureY = y + 42;
        doc.moveTo(52, signatureY).lineTo(245, signatureY).strokeColor('#6b7280').stroke();
        doc.moveTo(350, signatureY).lineTo(543, signatureY).strokeColor('#6b7280').stroke();
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#1f2937')
          .text(selected.deliveredBy || '—', 52, signatureY + 8, { width: 193, align: 'center' })
          .text(selected.receivedBy || '—', 350, signatureY + 8, { width: 193, align: 'center' });
        doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
          .text('ENTREGÓ', 52, signatureY + 23, { width: 193, align: 'center' })
          .text('RECIBIÓ', 350, signatureY + 23, { width: 193, align: 'center' });
      }

      doc.end();
    });
  }

  getDownloadFilename(movement: StockMovement): string {
    return movement.voucherPrefix
      ? `VALE-${this.getVoucherCode(movement)}.pdf`
      : `MOV-${movement.id}.pdf`;
  }

  private getDocumentTitle(movement: StockMovement): string {
    return movement.voucherPrefix === 'E'
      ? `Vale de entrada ${this.getVoucherCode(movement)}`
      : movement.voucherPrefix === 'S'
        ? `Vale de salida ${this.getVoucherCode(movement)}`
        : `Movimiento ${movement.id}`;
  }

  private getVoucherCode(movement: StockMovement): string {
    if (!movement.voucherPrefix || !movement.voucherNumber) return '';
    const series = movement.voucherSeries ? `-${movement.voucherSeries}` : '';
    return `${movement.voucherPrefix}${series}-${String(movement.voucherNumber).padStart(6, '0')}`;
  }

  private getProduct(movement: StockMovement) {
    return movement.sourceInventory?.product ?? movement.destinationInventory?.product;
  }

  private getWarehouseName(movement: StockMovement): string {
    return movement.sourceInventory?.warehouse?.name ??
      movement.destinationInventory?.warehouse?.name ?? '—';
  }

  private getUserName(movement: StockMovement): string {
    const fullName = [movement.user?.firstName, movement.user?.lastName]
      .filter(Boolean)
      .join(' ');
    return fullName || movement.user?.username || '—';
  }

  private formatDate(value: string | Date): string {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es-PE');
  }
}
