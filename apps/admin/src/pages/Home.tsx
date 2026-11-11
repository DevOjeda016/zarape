import { ArrowRightIcon } from '@phosphor-icons/react';
import { Card, CardDescription, CardHeader, CardTitle } from '@zarape/ui/components/card';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useAuth } from '@/auth/session';
import { CATALOG_MENU, SUPPORT_MENU } from '@/components/menu';
import { greeting } from '@/lib/format';

/** RDF0101: menú de gestión de catálogos. */
export function Home() {
  const { employee } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-4xl">
          {greeting()}, {employee?.username}
        </h1>
        <p className="text-muted-foreground">¿Qué catálogo quieres revisar hoy?</p>
      </div>
      <nav aria-label="Catálogos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...CATALOG_MENU, ...SUPPORT_MENU].map(({ path, label, description, icon: IconComponent }, i) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          >
            <Link to={path} className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring">
              <Card className="h-full transition-shadow group-hover:ring-2 group-hover:ring-tinta">
                <CardHeader>
                  <span className="mb-2 grid size-12 place-items-center rounded-sm border-2 border-tinta bg-papel">
                    <IconComponent size={28} />
                  </span>
                  <CardTitle className="flex items-center justify-between font-heading text-xl">
                    {label}
                    <ArrowRightIcon className="text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </nav>
    </div>
  );
}
