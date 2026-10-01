import { OrchidSpecies } from '../types';

/**
 * Builds clean HTML table formatted specifically for seamless paste into Google Docs.
 * Google Docs table rendering honors cell background colors, borders, fonts and inline images.
 */
export function generateGoogleDocsCardHtml(species: OrchidSpecies): string {
  const statusLabels: Record<string, string> = {
    E: 'Probablemente extinta en el medio silvestre',
    P: 'En peligro de extinción',
    A: 'Amenazada',
    PR: 'Sujeta a protección especial',
    NC: 'No Catalogada'
  };

  const statusBg = (code: string) => {
    if (species.conservationStatus === code) {
      if (code === 'E' || code === 'P') return 'background-color: #fee2e2; border: 2px solid #ef4444; font-weight: bold; color: #991b1b;';
      if (code === 'A') return 'background-color: #fef3c7; border: 2px solid #f59e0b; font-weight: bold; color: #92400e;';
      if (code === 'PR') return 'background-color: #dcfce7; border: 2px solid #22c55e; font-weight: bold; color: #166534;';
      return 'background-color: #f1f5f9; border: 2px solid #64748b; font-weight: bold; color: #1e293b;';
    }
    return 'background-color: #f8fafc; border: 1px solid #cbd5e1; color: #64748b;';
  };

  const statesStr = species.mexicoStates && species.mexicoStates.length > 0 
    ? species.mexicoStates.map(s => `• ${s}`).join('<br>') 
    : '• Por confirmar en herbario';

  const photoHtml = species.photoUrl1 
    ? `<img src="${species.photoUrl1}" alt="${species.scientificName}" style="max-width: 100%; height: auto; max-height: 260px; object-fit: cover; border-radius: 4px; display: block; margin: 0 auto;" />`
    : `<div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; padding: 40px 10px; text-align: center; color: #64748b; font-size: 11pt;">[ Espacio para fotografía de ${species.scientificName} ]</div>`;

  return `
<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1e293b; line-height: 1.35;">
  <!-- HEADER -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
    <tr>
      <td style="vertical-align: top; padding: 4px;">
        <div style="font-size: 10pt; font-weight: bold; color: #475569; border-bottom: 2px solid #eab308; display: inline-block; padding-bottom: 2px;">
          ${species.authorSignature || 'Josué Jacobo'}
        </div>
        <div style="font-size: 19pt; font-weight: bold; font-family: 'Times New Roman', Georgia, serif; color: #0f172a; margin-top: 4px;">
          <i>${species.scientificName}</i> <span style="font-size: 12pt; font-weight: normal; color: #475569;">${species.author}</span>
        </div>
        <div style="font-size: 11pt; font-weight: bold; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #fde047; padding-bottom: 2px; margin-top: 2px;">
          ${species.commonName || species.scientificName}
        </div>
        <div style="font-size: 9pt; color: #64748b; margin-top: 3px;">
          Familia: Orchidaceae ${species.isEndemic ? '• <strong style="color: #15803d;">(Endémica de México)</strong>' : ''}
        </div>
      </td>
      <td style="width: 130px; text-align: right; vertical-align: top; padding: 4px;">
        <div style="background-color: #fef9c3; border: 2px solid #eab308; border-radius: 8px; padding: 6px 12px; text-align: center; display: inline-block;">
          <div style="font-size: 8pt; font-weight: bold; color: #854d0e; letter-spacing: 1px;">ESPECIE</div>
          <div style="font-size: 18pt; font-weight: 900; font-family: 'Times New Roman', Georgia, serif; color: #713f12; line-height: 1;">
            ${species.speciesCode}
          </div>
        </div>
      </td>
    </tr>
  </table>

  <!-- PHOTO & TAXONOMY / BOTANICAL SPECS -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
    <tr>
      <!-- LEFT: PHOTO -->
      <td style="width: 48%; vertical-align: top; padding: 4px; border-right: 1px solid #e2e8f0;">
        ${photoHtml}
        <div style="font-size: 7.5pt; color: #64748b; font-style: italic; margin-top: 4px; text-align: center;">
          ${species.photoCredit || 'Foto: Acervo Atlas de Orquídeas de México'}
        </div>
      </td>

      <!-- RIGHT: TAXONOMIA & FICHA -->
      <td style="width: 52%; vertical-align: top; padding: 4px 4px 4px 10px;">
        <!-- TAXONOMIA TABLE -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8.5pt;">
          <thead>
            <tr style="background-color: #cffafe; border: 1px solid #06b6d4;">
              <th colspan="2" style="padding: 4px; text-align: center; font-size: 9.5pt; font-weight: bold; color: #0e7490; letter-spacing: 1px;">
                TAXONOMÍA
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 3px 6px; font-weight: bold; color: #475569; width: 40%; background-color: #f8fafc;">FAMILIA</td>
              <td style="padding: 3px 6px; font-weight: bold; color: #0f172a; text-decoration: underline;">ORCHIDACEAE</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 3px 6px; font-weight: bold; color: #475569; background-color: #f8fafc;">GÉNERO</td>
              <td style="padding: 3px 6px; font-weight: bold; color: #0f172a; text-decoration: underline;">${species.genus.toUpperCase()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 3px 6px; font-weight: bold; color: #475569; background-color: #f8fafc;">ESPECIE</td>
              <td style="padding: 3px 6px; font-style: italic; color: #0f172a;">${species.scientificName}</td>
            </tr>
          </tbody>
        </table>

        <!-- FICHA BOTANICA TABLE -->
        <table style="width: 100%; border-collapse: collapse; font-size: 8pt; background-color: #ffffff; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
              <th colspan="2" style="padding: 3px; text-align: center; font-weight: bold; color: #334155; font-size: 8.5pt;">
                FICHA BOTÁNICA
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px dotted #e2e8f0;">
              <td style="padding: 3px; font-weight: bold; width: 38%; color: #475569;">🌱 Crecimiento:</td>
              <td style="padding: 3px; color: #1e293b;">${species.growthType}</td>
            </tr>
            <tr style="border-bottom: 1px dotted #e2e8f0;">
              <td style="padding: 3px; font-weight: bold; color: #475569;">⛰️ Altitud:</td>
              <td style="padding: 3px; color: #1e293b;">${species.altitude}</td>
            </tr>
            <tr style="border-bottom: 1px dotted #e2e8f0;">
              <td style="padding: 3px; font-weight: bold; color: #475569;">🌎 Distribución:</td>
              <td style="padding: 3px; color: #1e293b;">${species.distribution}</td>
            </tr>
            <tr style="border-bottom: 1px dotted #e2e8f0;">
              <td style="padding: 3px; font-weight: bold; color: #475569;">🌸 Fragancia:</td>
              <td style="padding: 3px; color: #1e293b;">${species.fragrance}</td>
            </tr>
            <tr style="border-bottom: 1px dotted #e2e8f0;">
              <td style="padding: 3px; font-weight: bold; color: #475569;">📏 Tamaño:</td>
              <td style="padding: 3px; color: #1e293b;">${species.size}</td>
            </tr>
            <tr>
              <td style="padding: 3px; font-weight: bold; color: #475569;">🐝 Polinizador:</td>
              <td style="padding: 3px; color: #1e293b;">${species.pollinator}</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </table>

  <!-- MORPHOLOGY & MEXICAN DISTRIBUTION -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8.5pt;">
    <tr>
      <!-- DESCRIPTION & CURIOSITY -->
      <td style="width: 65%; vertical-align: top; padding: 6px; border: 1px solid #e2e8f0; background-color: #fdfdfd;">
        <div style="font-weight: bold; color: #1e293b; margin-bottom: 3px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">
          DESCRIPCIÓN 🌿
        </div>
        <div style="text-align: justify; font-size: 8pt; color: #334155; margin-bottom: 6px;">
          ${species.description}
        </div>
        <div style="font-weight: bold; color: #92400e; margin-bottom: 2px; font-size: 8pt;">
          DATO CURIOSO
        </div>
        <div style="text-align: justify; font-size: 8pt; color: #78350f; background-color: #fefce8; padding: 4px; border-left: 2px solid #ca8a04;">
          ${species.curiousFact}
        </div>
      </td>

      <!-- DISTRIBUTION IN MEXICO -->
      <td style="width: 35%; vertical-align: top; padding: 6px; border: 1px solid #e2e8f0; background-color: #ffffff;">
        <div style="font-weight: bold; color: #1e293b; margin-bottom: 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">
          🌐 DISTRIBUCIÓN EN MÉXICO
        </div>
        <div style="font-size: 8pt; color: #334155; line-height: 1.4;">
          ${statesStr}
        </div>
      </td>
    </tr>
  </table>

  <!-- HABITAT BANNER -->
  <div style="background-color: #1e293b; color: #ffffff; padding: 8px 10px; border-radius: 4px; margin-bottom: 8px;">
    <span style="background-color: #facc15; color: #713f12; font-weight: bold; font-size: 7.5pt; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; margin-right: 6px;">
      HÁBITAT
    </span>
    <span style="font-size: 8pt; line-height: 1.35;">
      ${species.habitat}
    </span>
  </div>

  <!-- CONSERVATION STATUS (NOM-059-SEMARNAT) -->
  <div style="border: 1px solid #e2e8f0; padding: 6px 8px; margin-bottom: 8px; background-color: #ffffff;">
    <div style="font-size: 8pt; font-weight: bold; color: #1e293b; margin-bottom: 5px;">
      🛡️ ESTADO DE CONSERVACIÓN (NOM-059-SEMARNAT)
    </div>
    <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 7pt;">
      <tr>
        <td style="padding: 2px; width: 20%;">
          <div style="${statusBg('E')} width: 26px; height: 26px; border-radius: 50%; line-height: 26px; margin: 0 auto; font-size: 9pt;">E</div>
          <div style="margin-top: 2px; color: #475569;">Probablemente extinta</div>
        </td>
        <td style="padding: 2px; width: 20%;">
          <div style="${statusBg('P')} width: 26px; height: 26px; border-radius: 50%; line-height: 26px; margin: 0 auto; font-size: 9pt;">P</div>
          <div style="margin-top: 2px; color: #475569;">En peligro de extinción</div>
        </td>
        <td style="padding: 2px; width: 20%;">
          <div style="${statusBg('A')} width: 26px; height: 26px; border-radius: 50%; line-height: 26px; margin: 0 auto; font-size: 9pt;">A</div>
          <div style="margin-top: 2px; color: #475569;">Amenazada</div>
        </td>
        <td style="padding: 2px; width: 20%;">
          <div style="${statusBg('PR')} width: 26px; height: 26px; border-radius: 50%; line-height: 26px; margin: 0 auto; font-size: 9pt;">PR</div>
          <div style="margin-top: 2px; color: #475569;">Sujeta a protección</div>
        </td>
        <td style="padding: 2px; width: 20%;">
          <div style="${statusBg('NC')} width: 26px; height: 26px; border-radius: 50%; line-height: 26px; margin: 0 auto; font-size: 9pt;">NC</div>
          <div style="margin-top: 2px; color: #475569;">No Catalogada</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- FOOTER -->
  <table style="width: 100%; border-collapse: collapse; border-top: 2px solid #0f172a; padding-top: 4px;">
    <tr>
      <td style="font-size: 7.5pt; font-weight: bold; color: #0f172a; letter-spacing: 0.5px;">
        ORQUÍDEAS DE MÉXICO • ATLAS VISUAL DE ESPECIES NATIVAS
      </td>
      <td style="text-align: right; font-size: 8pt; font-weight: bold; color: #0f172a; text-decoration: underline;">
        Página ${species.speciesCode}
      </td>
    </tr>
  </table>
</div>
`;
}

/**
 * Copies the stylized HTML to the clipboard using text/html and text/plain
 */
export async function copyCardToClipboard(species: OrchidSpecies): Promise<boolean> {
  const htmlContent = generateGoogleDocsCardHtml(species);
  const plainText = `${species.continuousIndex}. ${species.scientificName} ${species.author} (${species.commonName})
Taxonomía: Familia Orchidaceae, Género ${species.genus}
Crecimiento: ${species.growthType} | Altitud: ${species.altitude}
Distribución: ${species.distribution}
Estados en México: ${species.mexicoStates.join(', ')}
Descripción: ${species.description}
Dato curioso: ${species.curiousFact}
Hábitat: ${species.habitat}
Conservación: ${species.conservationStatus}
Atlas Visual de Orquídeas de México - Página ${species.speciesCode}`;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        })
      ]);
      return true;
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = plainText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Generates continuous numbered species list ready to paste into Google Docs
 */
export function generateContinuousListHtml(speciesList: OrchidSpecies[]): string {
  const rows = speciesList.map(s => `
    <tr>
      <td style="padding: 4px 8px; border: 1px solid #cbd5e1; font-weight: bold; width: 60px; text-align: center;">${s.speciesCode}</td>
      <td style="padding: 4px 8px; border: 1px solid #cbd5e1;"><i>${s.scientificName}</i> ${s.author}</td>
      <td style="padding: 4px 8px; border: 1px solid #cbd5e1; color: #475569;">${s.commonName || '-'}</td>
      <td style="padding: 4px 8px; border: 1px solid #cbd5e1; text-align: center;">${s.isEndemic ? '<span style="color: #15803d; font-weight: bold;">Endémica</span>' : 'Nativa'}</td>
      <td style="padding: 4px 8px; border: 1px solid #cbd5e1; text-align: center;">${s.conservationStatus}</td>
    </tr>
  `).join('');

  return `
<h1 style="font-family: Georgia, serif; text-align: center; color: #0f172a;">Catálogo Completo de Orquídeas de México</h1>
<p style="text-align: center; color: #475569; font-style: italic;">Lista numerada continua (${speciesList.length} especies) • Formato compatible con Amazon KDP 6x9 y Documentos de Google</p>
<table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 9pt;">
  <thead>
    <tr style="background-color: #0f172a; color: #ffffff;">
      <th style="padding: 6px; border: 1px solid #0f172a;">Núm.</th>
      <th style="padding: 6px; border: 1px solid #0f172a;">Nombre Científico</th>
      <th style="padding: 6px; border: 1px solid #0f172a;">Nombre Común / Tradicional</th>
      <th style="padding: 6px; border: 1px solid #0f172a;">Endemismo</th>
      <th style="padding: 6px; border: 1px solid #0f172a;">NOM-059</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
`;
}

/**
 * Downloads a standalone .html file that can be opened directly in Google Docs via File > Open
 */
export function downloadForGoogleDocs(species: OrchidSpecies) {
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${species.speciesCode} - ${species.scientificName} - Atlas de Orquídeas de México</title>
  <style>
    @page {
      size: 6in 9in;
      margin: 0.4in;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  ${generateGoogleDocsCardHtml(species)}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Orquidea_${species.speciesCode}_${species.scientificName.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
