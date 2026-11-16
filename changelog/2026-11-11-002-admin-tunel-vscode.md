# Admin acepta el túnel de VS Code

- **Fecha:** 2026-11-11
- **Autor:** Daniel Ojeda Luna
- **Tipo:** chore
- **Módulo:** I Gestión
- **Requerimientos:** NF01

## Qué cambió

El dev server de `apps/admin` acepta hosts `*.devtunnels.ms` (`server.allowedHosts`).

## Por qué

Para compartir la app por el reenvío de puertos de VS Code. Sin esto, Vite rechaza el host del túnel.

## Archivos

- `apps/admin/vite.config.ts`
