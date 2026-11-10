/** Prisma regresa `Decimal`; la API responde números (dinero con dos decimales). */
export function toNumber(value: { toString(): string } | number): number {
  return typeof value === 'number' ? value : Number(value.toString());
}
