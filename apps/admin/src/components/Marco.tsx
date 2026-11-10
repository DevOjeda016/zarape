import { HouseIcon, SignOutIcon } from '@phosphor-icons/react';
import { Button } from '@zarape/ui/components/button';
import { Separator } from '@zarape/ui/components/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@zarape/ui/components/sidebar';
import { AnimatePresence, motion } from 'motion/react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/auth/sesion';
import { MENU_APOYO, MENU_GESTION, type OpcionMenu } from './menu';

function Enlace({ opcion }: { opcion: OpcionMenu }) {
  const { pathname } = useLocation();
  const activo = pathname.startsWith(opcion.ruta);
  const Icono = opcion.icono;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={activo} tooltip={opcion.texto} size="lg">
        <NavLink to={opcion.ruta}>
          <Icono weight={activo ? 'fill' : 'regular'} />
          <span>{opcion.texto}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** Marco de la intranet: barra lateral (barro) + contenido con transición de pantalla. */
export function Marco() {
  const { empleado, salir } = useAuth();
  const { pathname } = useLocation();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="print:hidden">
        <SidebarHeader>
          <NavLink to="/" className="flex items-center gap-2 rounded-lg p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <img src="/jarro.svg" alt="" className="size-9 shrink-0" />
            <span className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="font-heading text-lg font-extrabold">El Zarape</span>
              <span className="text-xs text-muted-foreground">Gestión</span>
            </span>
          </NavLink>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Inicio" size="lg">
                    <NavLink to="/" end>
                      <HouseIcon weight={pathname === '/' ? 'fill' : 'regular'} />
                      <span>Inicio</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Catálogos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MENU_GESTION.map((o) => (
                  <Enlace key={o.ruta} opcion={o} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Apoyo</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MENU_APOYO.map((o) => (
                  <Enlace key={o.ruta} opcion={o} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={salir} tooltip="Salir" size="lg">
                <SignOutIcon />
                <span>Salir</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="print:m-0 print:shadow-none">
        <header className="flex h-14 items-center gap-2 border-b px-4 print:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-5" />
          <p className="flex-1 text-sm text-muted-foreground">Sabor mexicano a tu ritmo.</p>
          <p className="text-sm">
            <span className="font-semibold">{empleado?.nombreUsuario}</span>
            <span className="text-muted-foreground"> · Administrador</span>
          </p>
          <Button variant="ghost" size="sm" onClick={salir} className="md:hidden">
            Salir
          </Button>
        </header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8 print:max-w-none print:p-0"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </SidebarInset>
    </SidebarProvider>
  );
}
