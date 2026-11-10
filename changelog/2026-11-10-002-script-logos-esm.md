# El script de logos funciona otra vez

- **Fecha:** 2026-11-10
- **Autor:** Daniel Ojeda Luna
- **Tipo:** fixed
- **Módulo:** Transversal
- **Requerimientos:** N/A

## Qué cambió

`branding/scripts/generar-logos.js` ahora es un módulo ES: usa `import` en lugar de `require`.

## Por qué

El esqueleto del monorepo (entrada 010) agregó `"type": "module"` al `package.json` de la raíz. Desde entonces el script fallaba con `require is not defined`. Se verificó que vuelve a correr y que genera exactamente los mismos cinco SVG que están en `branding/logos/`.

## Archivos

- `branding/scripts/generar-logos.js`
- `changelog/README.md`
- `changelog/2026-11-10-002-script-logos-esm.md`
