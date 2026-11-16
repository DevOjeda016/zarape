import { PlusIcon } from '@phosphor-icons/react';
import type { ComandaProduct, ProductType } from '@zarape/shared';
import { Button } from '@zarape/ui/components/button';
import { ProductCard } from '@zarape/ui/components/product-card';
import { motion } from 'motion/react';
import { photoSrc } from '@/lib/api';
import { formatCardPrice } from '@/lib/format';
import type { MenuCombo, MenuProduct } from '@/lib/types';

type Product = MenuProduct | MenuCombo;

/** Platillos y bebidas se agrupan por su categoría; los combos van juntos. */
function groupByCategory(products: Product[]): { title: string | null; products: Product[] }[] {
  const groups = new Map<string | null, Product[]>();
  for (const product of products) {
    const title = 'category' in product ? product.category.name : null;
    groups.set(title, [...(groups.get(title) ?? []), product]);
  }
  return [...groups].map(([title, items]) => ({ title, products: items }));
}

function description(product: Product): string {
  if (!('contents' in product) || product.contents.length === 0) return product.description;
  return product.contents.map((part) => (part.quantity > 1 ? `${part.quantity} ${part.name}` : part.name)).join(' + ');
}

/** Las cartas del menú repartidas sobre la mesa (RF07). */
export function MenuBoard({
  type,
  products,
  onAdd,
}: {
  type: ProductType;
  products: Product[];
  onAdd: (product: ComandaProduct) => void;
}) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-lg text-muted-foreground">Por ahora no hay nada aquí. Prueba otra sección.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {groupByCategory(products).map((group) => (
        <section key={group.title ?? 'all'} aria-label={group.title ?? 'Combos'}>
          {group.title && <h2 className="mb-4 font-heading text-[28px]/8">{group.title}</h2>}
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-5">
            {group.products.map((product) => (
              <motion.li key={product.id} whileTap={{ y: -4 }} transition={{ duration: 0.15 }} className="flex">
                <ProductCard
                  className="w-full"
                  price={formatCardPrice(product.price)}
                  name={product.name}
                  description={description(product)}
                  photoSrc={photoSrc(product.photoUrl)}
                  action={
                    <Button
                      size="xl"
                      className="w-full bg-maiz text-tinta hover:bg-maiz"
                      aria-label={`Agregar ${product.name}`}
                      onClick={() => onAdd({ type, productId: product.id, name: product.name, unitPrice: product.price })}
                    >
                      <PlusIcon weight="bold" data-icon="inline-start" />
                      Agregar
                    </Button>
                  }
                />
              </motion.li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
