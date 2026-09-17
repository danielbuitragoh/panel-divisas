/**
 * Piezas sueltas: tarjetas de variación, estados de carga y error, y la tabla
 * que hace de alternativa accesible al gráfico.
 */

import { MONEDAS, POR_CODIGO } from '../datos/monedas';
import type { Fila } from '../datos/usarSerie';
import { variacion } from '../datos/usarSerie';

/* ---------------------------------------------------------------- */
/* Tarjetas de variación                                             */
/* ---------------------------------------------------------------- */

export function Tarjetas({ filas, visibles }: { filas: Fila[]; visibles: Set<string> }) {
  const ultima = filas[filas.length - 1];

  return (
    <div className="tarjetas">
      {MONEDAS.filter((m) => visibles.has(m.codigo)).map((m) => {
        const valor = ultima?.[m.codigo];
        const delta = variacion(filas, m.codigo);
        return (
          <article className="tarjeta" key={m.codigo}>
            <p className="nombre">
              <span className="punto" style={{ background: m.color }} aria-hidden="true" />
              {m.codigo}
            </p>
            <p className="valor">
              {typeof valor === 'number'
                ? valor.toLocaleString('es-ES', {
                    minimumFractionDigits: m.decimales,
                    maximumFractionDigits: m.decimales,
                  })
                : '—'}
            </p>
            <Delta valor={delta} />
          </article>
        );
      })}
    </div>
  );
}

/**
 * La variación, con flecha y signo además del color.
 *
 * Esto no es celo decorativo: alrededor del 8% de los hombres no distingue
 * bien rojo de verde. Si el color es el único portador del significado, para
 * ellos la tarjeta no dice nada. La flecha y el signo lo dicen igual en
 * blanco y negro, en una impresión o con daltonismo.
 */
function Delta({ valor }: { valor: number | null }) {
  if (valor === null) return <p className="delta igual">sin datos suficientes</p>;

  const sube = valor > 0.05;
  const baja = valor < -0.05;
  const clase = sube ? 'sube' : baja ? 'baja' : 'igual';
  const flecha = sube ? '▲' : baja ? '▼' : '■';
  const signo = valor > 0 ? '+' : '';

  return (
    <p className={`delta ${clase}`}>
      {/* Flecha y número en el MISMO nodo de texto: así nunca se separan
          aunque la línea se parta. */}
      <span style={{ whiteSpace: 'nowrap' }}>
        <span className="flecha" aria-hidden="true">{flecha}</span>
        {signo}{valor.toFixed(2)}%
      </span>{' '}
      <span style={{ color: 'var(--tinta-3)' }}>en el periodo</span>
    </p>
  );
}

/* ---------------------------------------------------------------- */
/* Estados                                                           */
/* ---------------------------------------------------------------- */

export function Cargando({ alto = 300 }: { alto?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="solo-lectores">Cargando datos…</span>
      <div className="esqueleto" style={{ height: alto }} aria-hidden="true" />
    </div>
  );
}

/**
 * El estado de error está diseñado, no improvisado — y va a verse: el uptime
 * medido de la API ronda el 86%, así que una de cada siete visitas puede
 * acabar aquí. Un spinner infinito sería mentir por omisión.
 */
export function Fallo({ error, reintentar }: { error: Error; reintentar: () => void }) {
  return (
    <div className="aviso" role="alert">
      <h3>No se pudieron cargar las tasas</h3>
      <p>
        {error.name === 'ServicioNoDisponibleError' || error.name === 'TiempoAgotadoError'
          ? 'La fuente de datos no responde ahora mismo. Ya se reintentó varias veces automáticamente.'
          : error.message}
      </p>
      <button className="boton" onClick={reintentar}>Reintentar</button>
    </div>
  );
}

export function Caducado() {
  return (
    <p className="nota-caducada">
      <span aria-hidden="true">◍</span>
      La API no respondía: estos datos vienen de la caché. Las tasas se publican
      una vez al día, así que siguen siendo válidos.
    </p>
  );
}

/* ---------------------------------------------------------------- */
/* Tabla · la alternativa accesible                                  */
/* ---------------------------------------------------------------- */

/**
 * Un gráfico dibujado en SVG o canvas es invisible para un lector de pantalla:
 * quien lo use oye "gráfico" y nada más. Esta tabla contiene exactamente los
 * mismos datos y casi nadie se molesta en incluirla.
 *
 * Va dentro de un <details> para no cargar la página visualmente, pero existe
 * en el DOM y es navegable con teclado.
 */
export function Tabla({ filas, visibles }: { filas: Fila[]; visibles: Set<string> }) {
  const columnas = MONEDAS.filter((m) => visibles.has(m.codigo));

  return (
    <details className="tabla">
      <summary>Ver los datos en una tabla ({filas.length} fechas)</summary>
      <div className="envoltorio-tabla">
        <table>
          <caption className="solo-lectores">
            Tasas de cambio frente al euro, una fila por fecha.
          </caption>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              {columnas.map((m) => (
                <th scope="col" key={m.codigo}>{m.codigo}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...filas].reverse().map((f) => (
              <tr key={f.fecha}>
                <th scope="row" style={{ fontWeight: 400, color: 'var(--tinta-2)' }}>{f.fecha}</th>
                {columnas.map((m) => {
                  const v = f[m.codigo];
                  return (
                    <td key={m.codigo}>
                      {typeof v === 'number'
                        ? v.toLocaleString('es-ES', {
                            minimumFractionDigits: m.decimales,
                            maximumFractionDigits: m.decimales,
                          })
                        : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/* ---------------------------------------------------------------- */
/* Leyenda                                                           */
/* ---------------------------------------------------------------- */

/** Con dos o más series la leyenda va siempre: la identidad no puede
 *  depender solo del color. */
export function Leyenda({ codigos }: { codigos: string[] }) {
  if (codigos.length < 2) return null;
  return (
    <div className="leyenda">
      {codigos.map((c) => {
        const m = POR_CODIGO.get(c);
        if (!m) return null;
        return (
          <span key={c}>
            <i className="punto" style={{ background: m.color }} aria-hidden="true" />
            {m.nombre}
          </span>
        );
      })}
    </div>
  );
}
