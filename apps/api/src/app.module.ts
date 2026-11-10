import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlimentosModule } from './alimentos/alimentos.module.js';
import { ArchivosModule } from './archivos/archivos.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BebidasModule } from './bebidas/bebidas.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { ComandasModule } from './comandas/comandas.module.js';
import { CombosModule } from './combos/combos.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { PagosModule } from './pagos/pagos.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SaludController } from './salud.controller.js';
import { SucursalesModule } from './sucursales/sucursales.module.js';
import { TiempoRealModule } from './tiempo-real/tiempo-real.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SucursalesModule,
    UsuariosModule,
    CategoriasModule,
    AlimentosModule,
    BebidasModule,
    CombosModule,
    ClientesModule,
    ComandasModule,
    PagosModule,
    TiempoRealModule,
    DashboardModule,
    ArchivosModule,
  ],
  controllers: [SaludController],
})
export class AppModule {}
