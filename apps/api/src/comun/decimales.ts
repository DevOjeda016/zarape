/** Prisma regresa `Decimal`; la API responde números (dinero con dos decimales). */
export function aNumero(valor: { toString(): string } | number): number {
  return typeof valor === 'number' ? valor : Number(valor.toString());
}
