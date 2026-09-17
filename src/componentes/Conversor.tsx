/**
 * Conversor al cambio del día.
 *
 * El importe se maneja con `Dinero`, la clase de `frankfurter-ts` que guarda
 * el dinero como entero de unidades mínimas. Sería más corto multiplicar dos
 * `number` y ya está — y también sería la forma de que 0,1 + 0,2 acabe dando
 * 0,30000000000000004 en la pantalla de alguien.
 */

import { useEffect, useState } from 'react';
import { ClienteFrankfurter, Dinero, MonedaNoSoportadaError } from 'frankfurter-ts';
import { MONEDAS, BASE } from '../datos/monedas';

const api = new ClienteFrankfurter();
const OPCIONES = [BASE, ...MONEDAS.map((m) => m.codigo)];

export function Conversor() {
  const [cantidad, setCantidad] = useState('100');
  const [de, setDe] = useState(BASE);
  const [a, setA] = useState('COP');
  const [salida, setSalida] = useState<{ texto: string; fecha: string } | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setFallo(null);

    // Se valida el importe ANTES de pedir nada: si el usuario escribió
    // "cien", pedirle una tasa a la API no arregla el problema.
    let importe: Dinero;
    try {
      importe = Dinero.de(cantidad || '0', de);
    } catch {
      setSalida(null);
      setFallo('Escribe un importe válido, por ejemplo 49.99');
      return;
    }

    if (de === a) {
      setSalida({ texto: importe.formatear('es-ES'), fecha: 'misma moneda' });
      return;
    }

    api
      .tasa(de, a)
      .then((t) => {
        if (!vigente) return;
        setSalida({
          texto: importe.convertirA(a, String(t.valor)).formatear('es-ES'),
          fecha: `1 ${t.base} = ${t.valor} ${t.cotizada} · ${t.fecha}${t.caducada ? ' (de caché)' : ''}`,
        });
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        setSalida(null);
        setFallo(
          e instanceof MonedaNoSoportadaError
            ? `${e.moneda} no está disponible`
            : 'No se pudo obtener la tasa ahora mismo.',
        );
      });

    return () => { vigente = false; };
  }, [cantidad, de, a]);

  return (
    <div className="conversor">
      <div className="campo">
        <label htmlFor="cantidad">Cantidad</label>
        <input
          id="cantidad"
          inputMode="decimal"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="de">De</label>
        <select id="de" value={de} onChange={(e) => setDe(e.target.value)}>
          {OPCIONES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="a">A</label>
        <select id="a" value={a} onChange={(e) => setA(e.target.value)}>
          {OPCIONES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <p className="resultado" aria-live="polite">
        {fallo ? (
          /* El error va en texto, debajo del campo. Un borde rojo y nada más
             deja a quien no distingue el rojo sin saber qué ha pasado. */
          <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--critico)' }}>{fallo}</span>
        ) : salida ? (
          <>
            {salida.texto}
            <small>{salida.fecha}</small>
          </>
        ) : (
          <span style={{ color: 'var(--tinta-3)', fontSize: '14px', fontWeight: 400 }}>calculando…</span>
        )}
      </p>
    </div>
  );
}
