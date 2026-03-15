export const capitalizarInput = (e) => {
  const input = e.target;
  const start = input.selectionStart;
  const valorOriginal = input.value;
  
  const valorNuevo = valorOriginal
    .replace(/[^a-zA-Z\u00C0-\u017F\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/(?:^|\s)\S/g, c => c.toUpperCase());

  if (valorOriginal !== valorNuevo) {
    input.value = valorNuevo;
    input.setSelectionRange(start, start);
    input.dispatchEvent(new Event('input')); 
  }
};




export const obtenerMesAnio = (periodo) => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const partes = periodo.split('-');
  const mesNumero = parseInt(partes[0], 10);
  const anio = partes[1];
  return `${meses[mesNumero - 1]} ${anio}`;
};

export function fechaFormateada() {
  const fechaHoy = new Date();
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  const dia = fechaHoy.getDate().toString().padStart(2, '0');
  const mes = meses[fechaHoy.getMonth()];
  const anio = fechaHoy.getFullYear();

  return `${dia} ${mes} - ${anio}`;
}

export const formatearFecha = (fechaTexto) => {
  if (!fechaTexto) return '';
  const [dia, mes, anio] = fechaTexto.split('/');
  const fechaReal = new Date(anio, mes - 1, dia);
  return fechaReal;
};

// --- Fecha Min / Max
export const obtenerFinAnio = () => {
  const anioActual = new Date().getFullYear();
  return new Date(anioActual, 11, 31);
};

export const obtenerHoy = () => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
};



// --- Formatear dinero ---
export const formatearMonto = (monto) => {
  const numero = Number(monto);
  if (isNaN(numero)) {
    return "0,00"; 
  }
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
};

export const parsearMonto = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val; 
  if (typeof val === 'string') {
    if (!val.includes(',')) {
      return Number(val);
    }
    const numeroLimpio = val.replace(/\./g, '').replace(',', '.');
    return Number(numeroLimpio);
  }
  return 0;
};