export class ProductCodeHelper {
  static generateSku(id: number): string {
    return `TL-${id.toString().padStart(6, '0')}`;
  }

  static generateInternalCode(categoryCode: string, id: number): string {
    return `${categoryCode}-${id.toString().padStart(5, '0')}`;
  }
}
