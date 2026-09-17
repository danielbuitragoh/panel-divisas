/**
 * Carga de datos.
 *
 * Usa `frankfurter-ts`, el cliente que publiqué en npm para esta misma API.
 * Consumir mi propio paquete no es una floritura: si la librería fuese
 * incómoda de usar, este archivo se llenaría de parches y eso sería la señal
 * de que estaba mal diseñada.
 *
 * La caché, los reintentos y el servir datos caducados cuando la API no
 * responde vienen de la librería. Aquí no se repite nada de eso.
 */

import { useEffect, useState } from 'react';
import { ClienteFrankfurter, type Tasa } from 'frankfurter-ts';
import { BASE, MONEDAS, hace, type Rango } from './monedas';

const api = new ClienteFrankfurter();

/** Una fecha, con el valor de cada moneda ese día. */
export interface Fila {
  fecha: string;
  [codigo: string]: string | number;
}

export interface Estado<T> {
  datos: T | null;
  cargando: boolean;
  error: Error | null;
  /** Los datos vienen de caché caducada porque la API no respondía. */
  caducado: boolean;
  reintentar: () => void;
}

/**
 * Serie temporal de todas las monedas frente al euro.
 *
 * La API devuelve filas planas `{fecha, base, cotizada, valor}`; los gráficos
 * necesitan una fila por fecha con una columna por moneda. Ese giro se hace
 * aquí, una vez, y no en cada componente.
 */
export function usarSerie(rango: Rango): Estado<Fila[]> {
  const [datos, setDatos] = useState<Fila[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [caducado, setCaducado] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    api
      .tasas({
        base: BASE,
        cotizadas: MONEDAS.map((m) => m.codigo),
        desde: hace(rango.dias),
        agrupar: rango.agrupar,
      })
      .then((tasas: Tasa[]) => {
        // Una petición que ya no interesa (el usuario cambió de rango) no
        // debe pisar el estado de la que sí. Sin esta guarda, cambiar rápido
        // entre rangos deja en pantalla los datos de la petición más lenta.
        if (!vigente) return;

        const porFecha = new Map<string, Fila>();
        for (const t of tasas) {
          let fila = porFecha.get(t.fecha);
          if (!fila) {
            fila = { fecha: t.fecha };
            porFecha.set(t.fecha, fila);
          }
          fila[t.cotizada] = t.valor;
        }

        setDatos([...porFecha.values()].sort((a, b) => a.fecha.localeCompare(b.fecha)));
        setCaducado(tasas.some((t) => t.caducada));
        setCargando(false);
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setCargando(false);
      });

    return () => { vigente = false; };
  }, [rango.clave, intento]);

  return { datos, cargando, error, caducado, reintentar: () => setIntento((n) => n + 1) };
}

/**
 * Indexa una serie a base 100 en su primera fecha.
 *
 * Esta función es la razón de ser del comparador. El COP ronda 3.600 por euro
 * y el USD ronda 1,15: ponerlos en el mismo gráfico con dos ejes Y inventaría
 * una correlación que no existe en los datos, porque la alineación entre las
 * dos escalas sería arbitraria. Es EL error clásico de los paneles.
 *
 * Indexando a 100 en el primer día, todas las monedas comparten un solo eje y
 * la pregunta que el gráfico responde pasa a ser la interesante: ¿cuál se ha
 * movido más, en términos relativos?
 */
export function indexar(filas: Fila[], codigos: string[]): Fila[] {
  if (filas.length === 0) return filas;

  const primeros = new Map<string, number>();
  for (const c of codigos) {
    // La primera fecha con dato para esa moneda, que no tiene por qué ser la
    // primera fila: una moneda puede entrar en el catálogo más tarde.
    const fila = filas.find((f) => typeof f[c] === 'number');
    if (fila) primeros.set(c, fila[c] as number);
  }

  return filas.map((f) => {
    const salida: Fila = { fecha: f.fecha };
    for (const c of codigos) {
      const base = primeros.get(c);
      const v = f[c];
      if (base && typeof v === 'number') salida[c] = (v / base) * 100;
    }
    return salida;
  });
}

/** Variación porcentual entre el primer y el último valor de una moneda. */
export function variacion(filas: Fila[], codigo: string): number | null {
  const conDato = filas.filter((f) => typeof f[codigo] === 'number');
  if (conDato.length < 2) return null;
  const primero = conDato[0][codigo] as number;
  const ultimo = conDato[conDato.length - 1][codigo] as number;
  return ((ultimo - primero) / primero) * 100;
}
