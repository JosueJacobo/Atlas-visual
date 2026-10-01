# Atlas Visual de Orquídeas de México (6" × 9" KDP & Google Docs)

Atlas botánico ilustrado para la catalogación, edición e impresión bajo demanda en **Amazon Kindle Direct Publishing (KDP)** y exportación a **Documentos de Google**.

![Formato KDP](https://img.shields.io/badge/Formato-6x9_Pulgadas_(KDP)-amber)
![Especies](https://img.shields.io/badge/Especies-1182%2B_Continuas-emerald)
![Google Docs](https://img.shields.io/badge/Google_Docs-Integrado-blue)
![Licencia](https://img.shields.io/badge/Autor-Josué_Jacobo-purple)

---

## 🌸 Características Principales

1. **Plantilla Ficha Botánica Estilo Canva (6" × 9" pulgadas)**:
   - Cabecera con firma de autor, nombre científico, nombre común y placa dorada con número continuo de especie (`0001` a `1182+`).
   - Módulo fotográfico dual (foto general + macro/detalle floral) con créditos de foto personalizables.
   - Tabla taxonómica (Familia, Género, Especie).
   - Ficha botánica completa (Crecimiento, Altitud, Distribución general, Fragancia, Tamaño, Polinizador).
   - Descripción morfológica botánica y recuadro de **Dato Curioso**.
   - Distribución por estados de la República Mexicana.
   - Banner de hábitat y los 5 círculos oficiales de conservación (**NOM-059-SEMARNAT**: E, P, A, PR, NC).
   - Pie de página con numeración continua de página para imprenta.

2. **Numeración Continua Corregida**:
   - Catálogo ordenado correlativamente desde `0001` en adelante.
   - Buscador rápido por código o nombre científico.
   - Filtro de especies endémicas de México.
   - Formulario para agregar nuevas especies hasta llegar a 1,274 o más.

3. **Integración con Documentos de Google**:
   - Botón directo para crear la ficha botánica en tu Google Drive.
   - Botón de copiado enriquecido (<kbd>Ctrl</kbd> + <kbd>V</kbd>) que mantiene las tablas, colores y tipografías editables dentro de Google Docs.

4. **Estándar Amazon KDP Paperback (Tapa blanda/dura)**:
   - Medidas exactas de 6" × 9" (15.24 cm × 22.86 cm).
   - Superposición de guías visuales: Línea de corte (*Trim Line*), Sangrado (*Bleed +0.125"*) y Zona Segura de márgenes (*Safe Zone 0.375"*).
   - Función de impresión directa o exportación a PDF para Amazon KDP.

---

## 🚀 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# 2. Entrar a la carpeta
cd atlas-orquideas-mexico

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre en tu navegador: `http://localhost:3000`

---

## 📁 Estructura del Código

- `src/App.tsx`: Interfaz principal, navegación de páginas, filtros y zoom.
- `src/components/OrchidCard6x9.tsx`: Componente de la ficha botánica 6x9 estilo Canva.
- `src/components/OrchidEditorDrawer.tsx`: Panel lateral para editar textos, estados y fotos.
- `src/components/ContinuousIndexModal.tsx`: Catálogo completo de especies con buscador y botón de agregar.
- `src/components/GoogleDocsExportModal.tsx`: Conexión con Google Docs y copiado al portapapeles.
- `src/components/KdpSettingsModal.tsx`: Configuración de guías KDP e impresión en PDF.
- `src/data/speciesData.ts`: Base de datos completa con más de 1,180 especies de orquídeas mexicanas.
- `src/utils/googleDocsExport.ts`: Generador de tablas HTML compatibles con Google Docs.
