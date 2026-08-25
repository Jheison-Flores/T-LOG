export class SkuHelper {
  static generateSku(lastNumber: number): string {
    return `TL-${String(lastNumber).padStart(6, '0')}`;
  }

  static generateInternalCode(prefix: string, lastNumber: number): string {
    return `${prefix}-${String(lastNumber).padStart(6, '0')}`;
  }
}
