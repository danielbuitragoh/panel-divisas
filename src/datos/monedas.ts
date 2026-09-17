/**
 * Las monedas del panel y su asignación de color.
 *
 * El orden importa y no es decorativo: el color sigue a la ENTIDAD, no a su
 * posición. Si el usuario filtra y quita el peso mexicano, el colombiano sigue
 * siendo azul. Repintar las series supervivientes según su nuevo orden es de
 * los errores más comunes en paneles y confunde a quien ya aprendió "el COP es
 * el azul".
 *
 * Son cinco y no más a propósito: la paleta validada garantiza separación bajo
 * daltonismo hasta ocho, pero pasados cinco trazos en un mismo gráfico el
 * problema deja de ser el color y pasa a ser el amontonamiento.
 */

export interface Moneda {
  codigo: string;
  nombre: string;
  /** Variable CSS con el color asignado. Fijo por entidad. */
  color: string;
  /** Decimales con los que se muestra la tasa. */
  decimales: number;
}

export const MONEDAS: Moneda[] = [
  { codigo: 'COP', nombre: 'Peso colombiano', color: 'var(--serie-1)', decimales: 2 },
  { codigo: 'MXN', nombre: 'Peso mexicano',   color: 'var(--serie-2)', decimales: 3 },
  { codigo: 'BRL', nombre: 'Real brasileño',  color: 'var(--serie-3)', decimales: 3 },
  { codigo: 'CLP', nombre: 'Peso chileno',    color: 'var(--serie-4)', decimales: 1 },
  { codigo: 'USD', nombre: 'Dólar',           color: 'var(--serie-5)', decimales: 4 },
];

export const POR_CODIGO = new Map(MONEDAS.map((m) => [m.codigo, m]));

export const BASE = 'EUR';

export interface Rango {
  clave: string;
  etiqueta: string;
  dias: number;
  /** La API sabe submuestrear; pedir 5 años de datos diarios es tirar ancho
   *  de banda y dibujar 1.800 puntos en 600 píxeles. */
  agrupar?: 'week' | 'month';
}

export const RANGOS: Rango[] = [
  { clave: '30d', etiqueta: '30 días', dias: 30 },
  { clave: '90d', etiqueta: '90 días', dias: 90 },
  { clave: '1a',  etiqueta: '1 año',   dias: 365,  agrupar: 'week' },
  { clave: '5a',  etiqueta: '5 años',  dias: 1826, agrupar: 'month' },
];

/** Fecha ISO corta de hace N días. */
export function hace(dias: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

export function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}
