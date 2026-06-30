// utils/imprimir.js
export const exportarAImpresion = ({ 
  elementoRef, 
  datos, 
  titulo, 
  descripcion, 
  columnas, 
  formatearFila,
  rangosAlerta // <-- Nueva propiedad opcional
}) => {
  if (!elementoRef) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow.document;

  // Copiar estilos base del proyecto
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => {
    iframeDoc.head.appendChild(style.cloneNode(true));
  });

  const graficoClonado = elementoRef.cloneNode(true);

  // Forzar colores en SVG
  graficoClonado.querySelectorAll('rect').forEach(rect => {
    const computedFill = window.getComputedStyle(rect).fill;
    if (computedFill && computedFill !== 'none' && computedFill !== 'transparent') {
      rect.setAttribute('fill', computedFill);
      rect.style.fill = computedFill;
    }
  });

  // Hacer el gráfico responsive en el clon
  graficoClonado.querySelectorAll('svg').forEach(svg => {
    const w = svg.getAttribute('width') || svg.clientWidth;
    const h = svg.getAttribute('height') || svg.clientHeight;
    if (w && h && !svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', `0 0 ${parseInt(w)} ${parseInt(h)}`);
    }
    if (svg.style) {
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
    }
  });

  // Construcción de la tabla
  const columnasHtml = columnas.map(c => `<th class="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border-b border-slate-200">${c}</th>`).join('');
  const filasHtml = datos.map(item => {
    const celdas = formatearFila(item);
    return `<tr class="border-b border-slate-200 bg-white text-slate-600">${celdas.map(c => `<td class="px-4 py-2 text-sm">${c}</td>`).join('')}</tr>`;
  }).join('');

  // --- NUEVO: Construcción de las etiquetas de Rangos de Alerta ---
  let rangosHtml = '';
  if (rangosAlerta && rangosAlerta.length > 0) {
    const tagsHtml = rangosAlerta.map(r => {
      // Mapeo de colores idéntico a Tailwind/PrimeVue para impresión precisa
      let bg = '#f1f5f9', text = '#475569', border = '#e2e8f0'; // Default / info
      
      if (r.severity === 'success') { bg = '#f0fdf4'; text = '#15803d'; border = '#bbf7d0'; }
      else if (r.severity === 'warn') { bg = '#fffbeb'; text = '#b45309'; border = '#fde68a'; }
      else if (r.severity === 'danger') { bg = '#fff1f2'; text = '#be123c'; border = '#fecdd3'; }

      return `
        <span style="
          background-color: ${bg} !important;
          color: ${text} !important;
          border: 1px solid ${border} !important;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          font-family: sans-serif;
        ">${r.value}</span>
      `;
    }).join('');

    rangosHtml = `
      <div class="mt-4 mb-2">
        <p style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Rangos de alerta establecidos:</p>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">${tagsHtml}</div>
      </div>
    `;
  }

  // Inyectar HTML final al iframe
  iframeDoc.body.innerHTML = `
    <style>
      @page { size: portrait; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { background: white !important; }
        .overflow-x-auto, .overflow-hidden, .overflow-y-auto { overflow: visible !important; }
        .print-chart-container { width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
        .print-chart-container * { max-width: 100% !important; min-width: 0 !important; }
        .print-chart-container svg { max-width: 100% !important; height: auto !important; display: block; margin: 0 auto; }
      }
    </style>
    <div class="p-8 max-w-4xl mx-auto font-sans text-slate-800 bg-white" style="max-width: 100%;">
      <h1 class="text-xl font-bold mb-6 border-b pb-4 text-slate-900">Reporte de Indicadores de Gestión</h1>
      <h2 class="text-lg font-bold text-blue-500 mb-4">${titulo}</h2>
      
      <div class="print-chart-container mb-6 p-4 border border-slate-200 rounded-xl bg-white shadow-xs flex justify-center items-center">
        ${graficoClonado.outerHTML}
      </div>
      
      <table class="min-w-full border-collapse border border-slate-200 mb-6 text-sm">
        <thead><tr>${columnasHtml}</tr></thead>
        <tbody>${filasHtml}</tbody>
      </table>

      ${descripcion ? `
      <div class=" p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
        <p class="font-bold mb-1 text-slate-900">Descripción del indicador:</p>
        <p class="mb-0">${descripcion}</p>
        ${rangosHtml} </div>
      ` : ''}
    </div>
  `;

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => { document.body.removeChild(iframe); }, 1000);
  }, 500);
};