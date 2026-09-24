import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ExcelJS from 'exceljs';
import { ReportsService, RawDetailRow } from './reports.service';
import { ReportFilterDto } from '../dto/report-filter.dto';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { SettingsService } from '../../settings/services/settings.services';

interface GroupedItem {
  key: string;
  itemNumber: number;
  description: string;
  unit: string;
  quantitiesByDate: Map<string, number>;
  totalQuantity: number;
  currency: 'PEN' | 'USD' | null;
  unitCostPEN: number | null;
  unitCostUSD: number | null;
  totalCostPEN: number;
  totalCostUSD: number;
}

interface GroupedCategory {
  categoryName: string;
  items: Map<string, GroupedItem>;
}

@Injectable()
export class ReportsExportService {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly settingsService: SettingsService,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  // ============================================================
  // COLORES CORPORATIVOS Y ESTILOS
  // ============================================================

  private readonly COLOR_PRIMARY_NAVY = 'FF1F4E79'; // Azul marino corporativo
  private readonly COLOR_HEADER_BLUE = 'FF2F5597'; // Azul cabecera
  private readonly COLOR_CAT_BG = 'FFD9E1F2'; // Azul claro categoría
  private readonly COLOR_BORDER = 'FFD9D9D9'; // Gris suave bordes
  private readonly COLOR_WHITE = 'FFFFFFFF';

  // ============================================================
  // HELPERS
  // ============================================================

  private getColumnLetter(colIndex: number): string {
    let letter = '';
    let temp = colIndex;
    while (temp > 0) {
      const mod = (temp - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      temp = Math.floor((temp - mod) / 26);
    }
    return letter;
  }

  private parseDateKey(val: Date | string | null | undefined): string | null {
    if (!val) return null;
    if (typeof val === 'string') {
      const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    }
    if (val instanceof Date && !isNaN(val.getTime())) {
      const year = val.getUTCFullYear();
      const month = String(val.getUTCMonth() + 1).padStart(2, '0');
      const day = String(val.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  private formatDateHeader(dateKey: string): string {
    const [y, m, d] = dateKey.split('-');
    return `${d}/${m}/${y}`;
  }

  private formatUnit(u?: string | null): string {
    if (!u) return 'UND';
    const trimmed = u.trim().toUpperCase();
    if (trimmed === 'UNIDAD') return 'UND';
    return trimmed;
  }

  private formatWarehouseTitle(warehouseName?: string | null): string {
    if (!warehouseName) return '';
    const trimmed = warehouseName.trim();
    if (/^unidad\s+/i.test(trimmed)) {
      return 'U.M. ' + trimmed.replace(/^unidad\s+/i, '').toUpperCase();
    }
    return trimmed.toUpperCase();
  }

  private getPeriodTitle(filter: ReportFilterDto, dateKeys: string[]): string {
    const monthNames = [
      'ENERO',
      'FEBRERO',
      'MARZO',
      'ABRIL',
      'MAYO',
      'JUNIO',
      'JULIO',
      'AGOSTO',
      'SEPTIEMBRE',
      'OCTUBRE',
      'NOVIEMBRE',
      'DICIEMBRE',
    ];

    if (filter.from && filter.to) {
      const fromMatch = filter.from.match(/^(\d{4})-(\d{2})-(\d{2})/);
      const toMatch = filter.to.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (fromMatch && toMatch) {
        const fromYear = fromMatch[1];
        const fromMonth = parseInt(fromMatch[2], 10);
        const toYear = toMatch[1];
        const toMonth = parseInt(toMatch[2], 10);

        if (fromYear === toYear && fromMonth === toMonth) {
          return `${monthNames[fromMonth - 1]} ${fromYear}`;
        }
        return `${fromMatch[3]}/${fromMatch[2]}/${fromYear} AL ${toMatch[3]}/${toMatch[2]}/${toYear}`;
      }
    }

    if (filter.from) {
      const m = filter.from.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `DESDE ${m[3]}/${m[2]}/${m[1]}`;
    }

    if (filter.to) {
      const m = filter.to.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `HASTA ${m[3]}/${m[2]}/${m[1]}`;
    }

    if (dateKeys.length > 0) {
      const first = dateKeys[0].split('-');
      const last = dateKeys[dateKeys.length - 1].split('-');
      if (first[0] === last[0] && first[1] === last[1]) {
        const monthIdx = parseInt(first[1], 10) - 1;
        return `${monthNames[monthIdx]} ${first[0]}`;
      }
      return `${first[2]}/${first[1]}/${first[0]} AL ${last[2]}/${last[1]}/${last[0]}`;
    }

    const now = new Date();
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }

  // ============================================================
  // GENERAR NOMBRE DEL ARCHIVO
  // ============================================================

  async getExportFileName(
    userId: number,
    filter: ReportFilterDto,
  ): Promise<string> {
    const user = await this.reportsService.getUser(userId);
    this.reportsService.validateCanViewReports(user);

    let warehouseName = '';
    if (this.reportsService.isLogistics(user)) {
      warehouseName = user.warehouse?.name ?? '';
    } else if (filter.warehouseId) {
      const wh = await this.warehouseRepository.findOne({
        where: { id: Number(filter.warehouseId) },
      });
      warehouseName = wh?.name ?? '';
    }

    const cleanWh = warehouseName
      ? warehouseName
          .replace(/^unidad\s+/i, '')
          .replace(/[^a-zA-Z0-9]/g, '_')
          .toUpperCase()
      : 'GENERAL';

    const cleanPeriod = this.getPeriodTitle(filter, [])
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toUpperCase();

    return `Envio_Materiales_${cleanWh}_${cleanPeriod}.xlsx`;
  }

  // ============================================================
  // GENERAR EXCEL DEL REPORTE
  // ============================================================

  async generateMaterialDispatchExcel(
    userId: number,
    filter: ReportFilterDto,
  ): Promise<Buffer> {
    const user = await this.reportsService.getUser(userId);
    this.reportsService.validateCanViewReports(user);
    this.reportsService.validateDateRange(filter);

    const rows: RawDetailRow[] = await this.reportsService.getRows(user, filter);

    // 1. Obtener almacén seleccionado o inferido
    let targetWarehouseName: string | null = null;
    if (this.reportsService.isLogistics(user)) {
      targetWarehouseName = user.warehouse?.name ?? null;
    } else if (filter.warehouseId) {
      const wh = await this.warehouseRepository.findOne({
        where: { id: Number(filter.warehouseId) },
      });
      targetWarehouseName = wh?.name ?? null;
    } else if (rows.length > 0) {
      const uniqueWh = new Set(rows.map((r) => r.warehouse_name).filter(Boolean));
      if (uniqueWh.size === 1) {
        targetWarehouseName = Array.from(uniqueWh)[0] as string;
      }
    }

    // 2. Extraer fechas únicas ordenadas cronológicamente
    const dateKeySet = new Set<string>();
    for (const row of rows) {
      const dateKey = this.parseDateKey(row.guide_transfer_start_date);
      if (dateKey) {
        dateKeySet.add(dateKey);
      }
    }
    const sortedDateKeys = Array.from(dateKeySet).sort();

    // 3. Título del almacén y período
    const whTitle = targetWarehouseName
      ? this.formatWarehouseTitle(targetWarehouseName)
      : '';
    const periodTitle = this.getPeriodTitle(filter, sortedDateKeys);
    const mainTitle = whTitle
      ? `ENVÍO DE MATERIALES A ${whTitle} - ${periodTitle}`
      : `ENVÍO DE MATERIALES - ${periodTitle}`;

    // 4. Agrupar materiales por Categoría y por Producto
    const categoryMap = new Map<string, GroupedCategory>();

    for (const row of rows) {
      const categoryName = (row.category_name?.trim() || 'SIN CATEGORÍA').toUpperCase();

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          categoryName,
          items: new Map<string, GroupedItem>(),
        });
      }

      const catGroup = categoryMap.get(categoryName)!;

      const description = (
        row.product_name ||
        row.detail_description ||
        'SIN DESCRIPCIÓN'
      ).trim();

      const unit = this.formatUnit(row.product_unit || row.detail_unit);

      const itemKey = row.product_id
        ? `PID_${row.product_id}`
        : `DESC_${description}_${unit}`;

      const quantity = Number(row.quantity ?? 0);
      const unitCost =
        row.unit_cost !== null && row.unit_cost !== undefined
          ? Number(row.unit_cost)
          : null;
      const totalCost =
        row.total_cost !== null && row.total_cost !== undefined
          ? Number(row.total_cost)
          : unitCost !== null
            ? quantity * unitCost
            : null;

      const currencyStr = (row.currency ?? '').trim().toUpperCase();
      const currency: 'PEN' | 'USD' | null =
        currencyStr === 'PEN' || currencyStr === 'USD' ? currencyStr : null;

      if (!catGroup.items.has(itemKey)) {
        catGroup.items.set(itemKey, {
          key: itemKey,
          itemNumber: 0,
          description,
          unit,
          quantitiesByDate: new Map<string, number>(),
          totalQuantity: 0,
          currency: null,
          unitCostPEN: null,
          unitCostUSD: null,
          totalCostPEN: 0,
          totalCostUSD: 0,
        });
      }

      const currentItem = catGroup.items.get(itemKey)!;

      // Sumar cantidad de la fecha
      const dateKey = this.parseDateKey(row.guide_transfer_start_date);
      if (dateKey) {
        const curDateQty = currentItem.quantitiesByDate.get(dateKey) || 0;
        currentItem.quantitiesByDate.set(dateKey, curDateQty + quantity);
      }

      currentItem.totalQuantity += quantity;

      // Actualizar moneda y costos si este detalle tiene precio
      if (currency === 'PEN') {
        currentItem.currency = 'PEN';
        if (unitCost !== null && unitCost > 0) {
          currentItem.unitCostPEN = unitCost;
        }
        if (totalCost !== null) {
          currentItem.totalCostPEN += totalCost;
        }
      } else if (currency === 'USD') {
        currentItem.currency = 'USD';
        if (unitCost !== null && unitCost > 0) {
          currentItem.unitCostUSD = unitCost;
        }
        if (totalCost !== null) {
          currentItem.totalCostUSD += totalCost;
        }
      }
    }

    // 5. Configurar libro de Excel
    const workbook = new ExcelJS.Workbook();
    const settings = await this.settingsService.getSettings();
    workbook.creator = settings.systemName || 'T-LOG';

    const ws = workbook.addWorksheet('Envío de Materiales', {
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9, // A4
      },
      views: [{ showGridLines: true }],
    });

    const dateCount = sortedDateKeys.length;
    // Total de columnas = 2 (ITEM, DESC) + dateCount + 6 (TOTAL ENVIADO, U.M., P.U. S/, P.U. US$, TOTAL S/, TOTAL US$)
    const totalCols = 2 + dateCount + 6;

    // Configurar anchos de columna
    const columns: Partial<ExcelJS.Column>[] = [
      { width: 8 }, // Col 1: ITEM
      { width: 46 }, // Col 2: DESCRIPCIÓN
    ];
    for (let i = 0; i < dateCount; i++) {
      columns.push({ width: 13 }); // Columnas de Fechas
    }
    columns.push(
      { width: 16 }, // TOTAL ENVIADO
      { width: 10 }, // U.M.
      { width: 14 }, // P.U. S/
      { width: 14 }, // P.U. US$
      { width: 16 }, // TOTAL S/
      { width: 16 }, // TOTAL US$
    );
    ws.columns = columns;

    // Borde estándar
    const cellBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: this.COLOR_BORDER } },
      left: { style: 'thin', color: { argb: this.COLOR_BORDER } },
      bottom: { style: 'thin', color: { argb: this.COLOR_BORDER } },
      right: { style: 'thin', color: { argb: this.COLOR_BORDER } },
    };

    const headerBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: this.COLOR_PRIMARY_NAVY } },
      left: { style: 'thin', color: { argb: this.COLOR_PRIMARY_NAVY } },
      bottom: { style: 'thin', color: { argb: this.COLOR_PRIMARY_NAVY } },
      right: { style: 'thin', color: { argb: this.COLOR_PRIMARY_NAVY } },
    };

    // ============================================================
    // FILA 1: TÍTULO PRINCIPAL
    // ============================================================
    ws.mergeCells(1, 1, 1, totalCols);
    const titleCell = ws.getCell(1, 1);
    titleCell.value = mainTitle;
    titleCell.font = {
      name: 'Calibri',
      size: 13,
      bold: true,
      color: { argb: this.COLOR_WHITE },
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLOR_PRIMARY_NAVY },
    };
    ws.getRow(1).height = 32;

    // FILA 2: Espacio en blanco
    ws.getRow(2).height = 10;

    // ============================================================
    // FILA 3: CABECERA DE LA TABLA
    // ============================================================
    const headerRow = ws.getRow(3);
    headerRow.height = 26;

    let colIdx = 1;
    ws.getCell(3, colIdx++).value = 'ITEM';
    ws.getCell(3, colIdx++).value = 'DESCRIPCIÓN';

    for (const dk of sortedDateKeys) {
      ws.getCell(3, colIdx++).value = this.formatDateHeader(dk);
    }

    const totalEnviadoColIdx = colIdx++;
    ws.getCell(3, totalEnviadoColIdx).value = 'TOTAL ENVIADO';

    const umColIdx = colIdx++;
    ws.getCell(3, umColIdx).value = 'U.M.';

    const puPenColIdx = colIdx++;
    ws.getCell(3, puPenColIdx).value = 'P.U. S/';

    const puUsdColIdx = colIdx++;
    ws.getCell(3, puUsdColIdx).value = 'P.U. US$';

    const totalPenColIdx = colIdx++;
    ws.getCell(3, totalPenColIdx).value = 'TOTAL S/';

    const totalUsdColIdx = colIdx++;
    ws.getCell(3, totalUsdColIdx).value = 'TOTAL US$';

    for (let c = 1; c <= totalCols; c++) {
      const cell = ws.getCell(3, c);
      cell.font = {
        name: 'Calibri',
        size: 10,
        bold: true,
        color: { argb: this.COLOR_WHITE },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.COLOR_HEADER_BLUE },
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = headerBorder;
    }

    // ============================================================
    // FILAS DE DATOS POR CATEGORÍA
    // ============================================================
    let currentRow = 4;
    let globalItemIndex = 1;
    const sortedCategories = Array.from(categoryMap.values()).sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName),
    );

    let sumTotalSoles = 0;
    let sumTotalUsd = 0;
    let sumTotalQuantity = 0;
    const dateSums = new Array<number>(dateCount).fill(0);

    for (const cat of sortedCategories) {
      // Fila de Encabezado de Categoría
      ws.mergeCells(currentRow, 1, currentRow, totalCols);
      const catCell = ws.getCell(currentRow, 1);
      catCell.value = cat.categoryName;
      catCell.font = {
        name: 'Calibri',
        size: 10.5,
        bold: true,
        color: { argb: this.COLOR_PRIMARY_NAVY },
      };
      catCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.COLOR_CAT_BG },
      };
      catCell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        indent: 1,
      };
      catCell.border = {
        top: { style: 'thin', color: { argb: this.COLOR_PRIMARY_NAVY } },
        bottom: { style: 'thin', color: { argb: this.COLOR_PRIMARY_NAVY } },
      };
      ws.getRow(currentRow).height = 22;
      currentRow++;

      // Ordenar items alfabéticamente dentro de la categoría
      const sortedItems = Array.from(cat.items.values()).sort((a, b) =>
        a.description.localeCompare(b.description),
      );

      for (const item of sortedItems) {
        const row = ws.getRow(currentRow);
        row.height = 20;

        // 1. ITEM
        const cellItem = ws.getCell(currentRow, 1);
        cellItem.value = globalItemIndex++;
        cellItem.alignment = { horizontal: 'center', vertical: 'middle' };
        cellItem.border = cellBorder;
        cellItem.font = { name: 'Calibri', size: 10 };

        // 2. DESCRIPCIÓN
        const cellDesc = ws.getCell(currentRow, 2);
        cellDesc.value = item.description;
        cellDesc.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        cellDesc.border = cellBorder;
        cellDesc.font = { name: 'Calibri', size: 10 };

        // 3. CANTIDADES POR FECHA
        for (let i = 0; i < dateCount; i++) {
          const dk = sortedDateKeys[i];
          const qty = item.quantitiesByDate.get(dk) || 0;
          dateSums[i] += qty;

          const dateCell = ws.getCell(currentRow, 3 + i);
          dateCell.value = qty;
          dateCell.numFmt = Number.isInteger(qty) ? '#,##0' : '#,##0.00';
          dateCell.alignment = { horizontal: 'right', vertical: 'middle' };
          dateCell.border = cellBorder;
          dateCell.font = { name: 'Calibri', size: 10 };
        }

        // 4. TOTAL ENVIADO
        const totalEnvCell = ws.getCell(currentRow, totalEnviadoColIdx);
        sumTotalQuantity += item.totalQuantity;

        if (dateCount > 0) {
          const firstDateCol = this.getColumnLetter(3);
          const lastDateCol = this.getColumnLetter(2 + dateCount);
          totalEnvCell.value = {
            formula: `SUM(${firstDateCol}${currentRow}:${lastDateCol}${currentRow})`,
            result: item.totalQuantity,
          };
        } else {
          totalEnvCell.value = item.totalQuantity;
        }

        totalEnvCell.numFmt = Number.isInteger(item.totalQuantity) ? '#,##0' : '#,##0.00';
        totalEnvCell.font = { name: 'Calibri', size: 10, bold: true };
        totalEnvCell.alignment = { horizontal: 'right', vertical: 'middle' };
        totalEnvCell.border = cellBorder;

        // 5. U.M.
        const umCell = ws.getCell(currentRow, umColIdx);
        umCell.value = item.unit;
        umCell.alignment = { horizontal: 'center', vertical: 'middle' };
        umCell.border = cellBorder;
        umCell.font = { name: 'Calibri', size: 10 };

        // 6. P.U. S/
        const puPenCell = ws.getCell(currentRow, puPenColIdx);
        if (item.currency === 'PEN' && item.unitCostPEN !== null) {
          puPenCell.value = item.unitCostPEN;
          puPenCell.numFmt = '#,##0.00';
        } else {
          puPenCell.value = null;
        }
        puPenCell.alignment = { horizontal: 'right', vertical: 'middle' };
        puPenCell.border = cellBorder;
        puPenCell.font = { name: 'Calibri', size: 10 };

        // 7. P.U. US$
        const puUsdCell = ws.getCell(currentRow, puUsdColIdx);
        if (item.currency === 'USD' && item.unitCostUSD !== null) {
          puUsdCell.value = item.unitCostUSD;
          puUsdCell.numFmt = '#,##0.00';
        } else {
          puUsdCell.value = null;
        }
        puUsdCell.alignment = { horizontal: 'right', vertical: 'middle' };
        puUsdCell.border = cellBorder;
        puUsdCell.font = { name: 'Calibri', size: 10 };

        // 8. TOTAL S/
        const totalPenCell = ws.getCell(currentRow, totalPenColIdx);
        if (item.currency === 'PEN' && item.unitCostPEN !== null) {
          const totLetter = this.getColumnLetter(totalEnviadoColIdx);
          const puLetter = this.getColumnLetter(puPenColIdx);
          const calcTotal = Number((item.totalQuantity * item.unitCostPEN).toFixed(2));
          totalPenCell.value = {
            formula: `${totLetter}${currentRow}*${puLetter}${currentRow}`,
            result: calcTotal,
          };
          sumTotalSoles += calcTotal;
        } else {
          totalPenCell.value = 0;
        }
        totalPenCell.numFmt = '#,##0.00';
        totalPenCell.alignment = { horizontal: 'right', vertical: 'middle' };
        totalPenCell.border = cellBorder;
        totalPenCell.font = { name: 'Calibri', size: 10 };

        // 9. TOTAL US$
        const totalUsdCell = ws.getCell(currentRow, totalUsdColIdx);
        if (item.currency === 'USD' && item.unitCostUSD !== null) {
          const totLetter = this.getColumnLetter(totalEnviadoColIdx);
          const puLetter = this.getColumnLetter(puUsdColIdx);
          const calcTotal = Number((item.totalQuantity * item.unitCostUSD).toFixed(2));
          totalUsdCell.value = {
            formula: `${totLetter}${currentRow}*${puLetter}${currentRow}`,
            result: calcTotal,
          };
          sumTotalUsd += calcTotal;
        } else {
          totalUsdCell.value = 0;
        }
        totalUsdCell.numFmt = '#,##0.00';
        totalUsdCell.alignment = { horizontal: 'right', vertical: 'middle' };
        totalUsdCell.border = cellBorder;
        totalUsdCell.font = { name: 'Calibri', size: 10 };

        currentRow++;
      }
    }

    // Si no hubo filas de datos
    if (sortedCategories.length === 0) {
      ws.mergeCells(currentRow, 1, currentRow, totalCols);
      const emptyCell = ws.getCell(currentRow, 1);
      emptyCell.value =
        'No se encontraron materiales enviados con los filtros seleccionados.';
      emptyCell.font = { name: 'Calibri', size: 10, italic: true };
      emptyCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(currentRow).height = 24;
      currentRow++;
    }

    // ============================================================
    // FILA FINAL: TOTAL MES
    // ============================================================
    const summaryRowNumber = currentRow;
    const summaryRow = ws.getRow(summaryRowNumber);
    summaryRow.height = 24;

    // Col 1 & 2: TOTAL MES
    ws.mergeCells(summaryRowNumber, 1, summaryRowNumber, 2);
    const sumLabelCell = ws.getCell(summaryRowNumber, 1);
    sumLabelCell.value = 'TOTAL MES';
    sumLabelCell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: this.COLOR_PRIMARY_NAVY },
    };
    sumLabelCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    // Columnas de fechas: sumatoria por columna si hay datos
    for (let i = 0; i < dateCount; i++) {
      const colLetter = this.getColumnLetter(3 + i);
      const cell = ws.getCell(summaryRowNumber, 3 + i);
      if (summaryRowNumber > 4) {
        cell.value = {
          formula: `SUM(${colLetter}4:${colLetter}${summaryRowNumber - 1})`,
          result: dateSums[i],
        };
      } else {
        cell.value = dateSums[i];
      }
      cell.numFmt = Number.isInteger(dateSums[i]) ? '#,##0' : '#,##0.00';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.font = { name: 'Calibri', size: 10, bold: true };
    }

    // TOTAL ENVIADO SUM
    const sumTotalEnvCell = ws.getCell(summaryRowNumber, totalEnviadoColIdx);
    const envColLetter = this.getColumnLetter(totalEnviadoColIdx);
    if (summaryRowNumber > 4) {
      sumTotalEnvCell.value = {
        formula: `SUM(${envColLetter}4:${envColLetter}${summaryRowNumber - 1})`,
        result: sumTotalQuantity,
      };
    } else {
      sumTotalEnvCell.value = sumTotalQuantity;
    }
    sumTotalEnvCell.numFmt = Number.isInteger(sumTotalQuantity) ? '#,##0' : '#,##0.00';
    sumTotalEnvCell.alignment = { horizontal: 'right', vertical: 'middle' };
    sumTotalEnvCell.font = { name: 'Calibri', size: 10, bold: true };

    // U.M., P.U. S/, P.U. US$ (vacíos)
    ws.getCell(summaryRowNumber, umColIdx).value = '';
    ws.getCell(summaryRowNumber, puPenColIdx).value = '';
    ws.getCell(summaryRowNumber, puUsdColIdx).value = '';

    // TOTAL S/
    const sumPenCell = ws.getCell(summaryRowNumber, totalPenColIdx);
    const penColLetter = this.getColumnLetter(totalPenColIdx);
    if (summaryRowNumber > 4) {
      sumPenCell.value = {
        formula: `SUM(${penColLetter}4:${penColLetter}${summaryRowNumber - 1})`,
        result: Number(sumTotalSoles.toFixed(2)),
      };
    } else {
      sumPenCell.value = 0;
    }
    sumPenCell.numFmt = '#,##0.00';
    sumPenCell.alignment = { horizontal: 'right', vertical: 'middle' };
    sumPenCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: this.COLOR_PRIMARY_NAVY } };

    // TOTAL US$
    const sumUsdCell = ws.getCell(summaryRowNumber, totalUsdColIdx);
    const usdColLetter = this.getColumnLetter(totalUsdColIdx);
    if (summaryRowNumber > 4) {
      sumUsdCell.value = {
        formula: `SUM(${usdColLetter}4:${usdColLetter}${summaryRowNumber - 1})`,
        result: Number(sumTotalUsd.toFixed(2)),
      };
    } else {
      sumUsdCell.value = 0;
    }
    sumUsdCell.numFmt = '#,##0.00';
    sumUsdCell.alignment = { horizontal: 'right', vertical: 'middle' };
    sumUsdCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: this.COLOR_PRIMARY_NAVY } };

    // Estilos de la fila TOTAL MES
    for (let c = 1; c <= totalCols; c++) {
      const cell = ws.getCell(summaryRowNumber, c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.COLOR_CAT_BG },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: this.COLOR_PRIMARY_NAVY } },
        bottom: { style: 'double', color: { argb: this.COLOR_PRIMARY_NAVY } },
        left: { style: 'thin', color: { argb: this.COLOR_BORDER } },
        right: { style: 'thin', color: { argb: this.COLOR_BORDER } },
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
