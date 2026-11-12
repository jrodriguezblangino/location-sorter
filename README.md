# Ledige lokationer — Imerco

Herramienta interna para filtrar el Excel de ubicaciones libres del WMS y pasarle la lista al almacén con un QR.

Se queda con los pasillos **11, 12, 13, 14 y 17** en los niveles **20, 30 y 40**. El archivo no sale del navegador: no hay servidor. El QR lleva las ubicaciones dentro del enlace, así que cada subida genera un código nuevo.

## En local

```bash
npm install
npm run dev
npm test
```

La app queda en `http://localhost:5173`.

## GitHub Pages

1. Crea un repositorio y sube esta carpeta a la rama `main`.
2. En el repositorio: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. El workflow `.github/workflows/pages.yml` publica el build en cada push a `main`.

El código de la app es público. Los Excel no se guardan en el repositorio. Quien tenga el enlace del QR ve solo los códigos de esa subida.
