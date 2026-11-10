import { ArrowRightIcon } from '@phosphor-icons/react';
import { Card, CardDescription, CardHeader, CardTitle } from '@zarape/ui/components/card';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useAuth } from '@/auth/sesion';
import { MENU_APOYO, MENU_GESTION } from '@/components/menu';
import { saludo } from '@/lib/formato';

/** RDF0101: menú de gestión de catálogos. */
export function Inicio() {
  const { empleado } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          {saludo()}, {empleado?.nombreUsuario}
        </h1>
        <p className="text-muted-foreground">¿Qué catálogo quieres revisar hoy?</p>
      </div>
      <nav aria-label="Catálogos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...MENU_GESTION, ...MENU_APOYO].map(({ ruta, texto, descripcion, icono: Icono }, i) => (
          <motion.div
            key={ruta}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          >
            <Link to={ruta} className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring">
              <Card className="h-full transition-shadow group-hover:shadow-tarjeta">
                <CardHeader>
                  <span className="mb-2 grid size-12 place-items-center rounded-lg bg-chile-tinte text-chile">
                    <Icono size={28} weight="duotone" />
                  </span>
                  <CardTitle className="flex items-center justify-between font-heading text-xl">
                    {texto}
                    <ArrowRightIcon className="text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                  </CardTitle>
                  <CardDescription>{descripcion}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </nav>
    </div>
  );
}
