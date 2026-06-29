export const exportarAImpresion = (elementoRef, datos, titulo, descripcion, columnas, formatearFila) => {
  if (!elementoRef) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow.document;

  // 1. Copiar estilos
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => {
    iframeDoc.head.appendChild(style.cloneNode(true));
  });

  // 2. Clonar el gráfico
  const graficoClonado = elementoRef.cloneNode(true);

  // 3. Forzar estilos de los rectángulos (para los gráficos SVG)
  graficoClonado.querySelectorAll('rect').forEach(rect => {
    const computedFill = window.getComputedStyle(rect).fill;
    if (computedFill && computedFill !== 'none' && computedFill !== 'transparent') {
      rect.setAttribute('fill', computedFill);
      rect.style.fill = computedFill;
    }
  });

  // --- NUEVO FIX: Convertir el gráfico en escalable (Responsive) ---
  graficoClonado.querySelectorAll('svg').forEach(svg => {
    const w = svg.getAttribute('width') || svg.clientWidth;
    const h = svg.getAttribute('height') || svg.clientHeight;
    
    // Si el gráfico no tiene viewBox, lo calculamos. Esto es lo que evita el recorte.
    if (w && h && !svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', `0 0 ${parseInt(w)} ${parseInt(h)}`);
    }
    
    // Quitamos anchos fijos directos del SVG
    if (svg.style) {
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
    }
  });

  // 4. Estructura de tabla
  const columnasHtml = columnas.map(c => `<th class="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border-b border-slate-200">${c}</th>`).join('');
  const filasHtml = datos.map(item => {
    const celdas = formatearFila(item);
    return `<tr class="border-b border-slate-200 bg-white text-slate-600">${celdas.map(c => `<td class="px-4 py-2 text-sm">${c}</td>`).join('')}</tr>`;
  }).join('');

  // 5. Inyectar HTML al iframe
  iframeDoc.body.innerHTML = `
    <style>
      @page {
        size: portrait;
      }
      
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { background: white !important; }
        
        .overflow-x-auto, .overflow-hidden, .overflow-y-auto {
          overflow: visible !important;
        }
        
        /* Contenedor principal */
        .print-chart-container {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important; /* <-- CRUCIAL: Obliga a Flexbox a ceder espacio */
          box-sizing: border-box !important;
        }
        
        /* Forzamos a todos los hijos a no exceder el ancho y permitir reducción */
        .print-chart-container * {
          max-width: 100% !important;
          min-width: 0 !important; /* <-- CRUCIAL: Previene que divs internos empujen el borde fuera de la hoja */
        }

        /* Comportamiento del SVG ya escalable */
        .print-chart-container svg, 
        .print-chart-container canvas, 
        .apexcharts-canvas, 
        .apexcharts-svg {
          max-width: 100% !important;
          height: auto !important; 
          display: block;
          margin: 0 auto;
        }
      }
    </style>
    <div class="p-8 max-w-4xl mx-auto font-sans text-slate-800 bg-white" style="max-width: 100%;">
      <h1 class="text-xl font-bold mb-6 border-b pb-4 text-slate-900">Reporte de Indicadores de Gestión</h1>
      <h2 class="text-lg font-bold text-blue-500 mb-4">${titulo}</h2>
      
      <div class="print-chart-container mb-8 p-4 border border-slate-200 rounded-xl bg-white shadow-xs flex justify-center items-center">
        ${graficoClonado.outerHTML}
      </div>
      
      <table class="min-w-full border-collapse border border-slate-200 mb-6">
        <thead><tr>${columnasHtml}</tr></thead>
        <tbody>${filasHtml}</tbody>
      </table>

      ${descripcion ? `
      <div class="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
        <p class="font-bold mb-1 text-slate-900">Descripción del indicador:</p>
        <p>${descripcion}</p>
      </div>
      ` : ''}
    </div>
  `;

  // 6. Imprimir
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => { document.body.removeChild(iframe); }, 1000);
  }, 500);
};