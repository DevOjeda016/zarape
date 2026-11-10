# Modelo de datos de El Zarape

Modelo relacional en PostgreSQL. La fuente de verdad será `apps/api/prisma/schema.prisma`: si algo cambia ahí, se actualiza este documento. Base para la entrega 14 (diagramación de la base de datos).

## Diagrama entidad-relación

```mermaid
erDiagram
    SUCURSAL |o--o{ USUARIO : "asigna"
    SUCURSAL ||--o{ COMANDA : "recibe"
    SUCURSAL |o--o{ GASTO_MARKETING : "invierte"
    CATEGORIA ||--o{ ALIMENTO : "agrupa"
    CATEGORIA ||--o{ BEBIDA : "agrupa"
    COMBO ||--o{ COMBO_ALIMENTO : "incluye"
    ALIMENTO ||--o{ COMBO_ALIMENTO : "forma parte"
    COMBO ||--o{ COMBO_BEBIDA : "incluye"
    BEBIDA ||--o{ COMBO_BEBIDA : "forma parte"
    CLIENTE ||--|| MEDIO_PAGO : "registra"
    CLIENTE |o--o{ COMANDA : "ordena"
    COMANDA ||--|{ DETALLE_COMANDA : "contiene"
    ALIMENTO |o--o{ DETALLE_COMANDA : "vendido en"
    BEBIDA |o--o{ DETALLE_COMANDA : "vendido en"
    COMBO |o--o{ DETALLE_COMANDA : "vendido en"
    COMANDA ||--o{ PAGO : "se paga con"
    COMANDA ||--o| CALIFICACION : "recibe"

    SUCURSAL {
        int id PK
        string nombre
        string direccion
        decimal latitud
        decimal longitud
        string foto_url
        string url
        string horarios
        enum estatus
    }
    USUARIO {
        int id PK
        string nombre_usuario UK
        string password_hash
        enum rol
        int sucursal_id FK
        enum estatus
    }
    CATEGORIA {
        int id PK
        string nombre
        enum tipo
        enum estatus
    }
    ALIMENTO {
        int id PK
        string nombre
        string descripcion
        string foto_url
        decimal precio
        int categoria_id FK
        enum estatus
    }
    BEBIDA {
        int id PK
        string nombre
        string descripcion
        string foto_url
        decimal precio
        int categoria_id FK
        enum estatus
    }
    COMBO {
        int id PK
        string nombre
        string descripcion
        string foto_url
        decimal precio
        enum estatus
    }
    COMBO_ALIMENTO {
        int combo_id PK
        int alimento_id PK
        int cantidad
    }
    COMBO_BEBIDA {
        int combo_id PK
        int bebida_id PK
        int cantidad
    }
    CLIENTE {
        int id PK
        string usuario UK
        string password_hash
        string nombre
        string apellidos
        string telefono
        enum estatus
    }
    MEDIO_PAGO {
        int id PK
        int cliente_id FK
        string titular
        string marca
        string ultimos4
        int mes_venc
        int anio_venc
        string calle_numero
        string colonia
        string ciudad
        string estado
        string codigo_postal
    }
    COMANDA {
        int id PK
        uuid token_qr UK
        int turno
        date fecha_turno
        enum canal
        enum estatus
        int sucursal_id FK
        int cliente_id FK
        decimal subtotal
        decimal iva
        decimal total
        datetime creada_en
        datetime pagada_en
        datetime lista_en
        datetime entregada_en
    }
    DETALLE_COMANDA {
        int id PK
        int comanda_id FK
        enum tipo
        int alimento_id FK
        int bebida_id FK
        int combo_id FK
        string nombre
        int cantidad
        decimal precio_unitario
        decimal total_linea
    }
    PAGO {
        int id PK
        int comanda_id FK
        string titular
        string marca
        string ultimos4
        int mes_venc
        int anio_venc
        decimal monto
        enum estatus
        string referencia
        datetime fecha
    }
    GASTO_MARKETING {
        int id PK
        string campana
        string canal
        decimal monto
        date fecha_inicio
        date fecha_fin
        int sucursal_id FK
    }
    CALIFICACION {
        int id PK
        int comanda_id FK
        int estrellas
        string comentario
        datetime creada_en
    }
```

## Enums

| Enum | Valores |
|---|---|
| `estatus` (catálogos incluidas las categorías, usuario, cliente) | `ACTIVO`, `BAJA` |
| `rol` | `ADMIN`, `COCINA` |
| `CATEGORIA.tipo` | `ALIMENTO`, `BEBIDA` |
| `COMANDA.canal` | `KIOSKO`, `DRIVE_THRU` |
| `COMANDA.estatus` | `PENDIENTE`, `PAGADA`, `EN_COCINA`, `LISTA`, `ENTREGADA`, `CANCELADA` |
| `DETALLE_COMANDA.tipo` | `ALIMENTO`, `BEBIDA`, `COMBO` |
| `PAGO.estatus` | `APROBADO`, `RECHAZADO` |

## Reglas del modelo

- **Dinero** en `decimal(10,2)`, nunca `float`. Los precios del catálogo incluyen IVA; la comanda guarda `subtotal`, `iva` y `total` calculados por la API.
- **Detalle con foto fija del momento:** `DETALLE_COMANDA` copia `nombre` y `precio_unitario`. Si el precio cambia después, los tickets viejos no cambian.
- **Un solo producto por línea:** en `DETALLE_COMANDA` solo uno de `alimento_id`, `bebida_id` o `combo_id` tiene valor, según `tipo` (restricción `CHECK`).
- **Comanda del kiosko sin cliente:** `cliente_id` es nulo en el canal `KIOSKO` y obligatorio en `DRIVE_THRU` (restricción `CHECK`).
- **Turno:** consecutivo diario por sucursal (índice único en `sucursal_id` + `fecha_turno` + `turno`). `turno` y `fecha_turno` (día local en que se pagó) se asignan juntos al pagar (restricción `CHECK`); antes los dos son nulos.
- **Fechas y horas** en `timestamptz`, para que las horas del dashboard no dependan de la zona del servidor.
- Las restricciones `CHECK` no caben en `schema.prisma`: viven en la migración inicial (`apps/api/prisma/migrations/20261108000000_inicial/migration.sql`). Prisma no las borra en migraciones nuevas.
- **QR:** guarda `token_qr` (UUID), nunca el `id` consecutivo, para que nadie adivine pedidos ajenos.
- **Tarjetas:** solo últimos 4 dígitos, marca y vencimiento. Nunca número completo ni CVV (ver `docs/arquitectura.md`).
- **Eliminar:** borrado físico solo si no hay registros relacionados; si los hay, `estatus = BAJA`. `CLIENTE` siempre pasa a `BAJA`.
- **Horas de la comanda** (`pagada_en`, `lista_en`, `entregada_en`): dan el tiempo de preparación del dashboard.

## De dónde sale cada indicador del dashboard

| Indicador | Cálculo |
|---|---|
| Ventas totales, por sucursal, por canal | `SUM(total)` de comandas pagadas, agrupado por `sucursal_id` o `canal` |
| Ticket promedio | `AVG(total)` de comandas pagadas |
| Productos y combos más vendidos | `SUM(cantidad)` en `DETALLE_COMANDA` por producto |
| Horarios de mayor demanda | Comandas por hora de `pagada_en` |
| Comandas por estatus | `COUNT` por `estatus` |
| Tiempo promedio de preparación | `AVG(lista_en - pagada_en)` |
| Clientes registrados y recompra | `CLIENTE` activos; clientes con 2 o más comandas en 30 días |
| Costo de adquisición y ROI | `GASTO_MARKETING` contra clientes nuevos e ingresos del periodo |
| Satisfacción | `AVG(estrellas)` de `CALIFICACION` |
