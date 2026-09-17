import { useMemo, useState } from 'react';
import { MONEDAS, RANGOS, BASE } from './datos/monedas';
import { usarSerie, indexar } from './datos/usarSerie';
import { Grafico } from './componentes/Grafico';
import { Cargando, Fallo, Caducado, Tarjetas, Tabla, Leyenda } from './componentes/Piezas';
import { Conversor } from './componentes/Conversor';

export default function App() {
  const [rango, setRango] = useState(RANGOS[1]);
  const [visibles, setVisibles] = useState<Set<string>>(
    () => new Set(MONEDAS.map((m) => m.codigo)),
  );
  const [tema, setTema] = useState<'auto' | 'claro' | 'oscuro'>('auto');

  const { datos, cargando, error, caducado, reintentar } = usarSerie(rango);
  const codigos = useMemo(
    () => MONEDAS.filter((m) => visibles.has(m.codigo)).map((m) => m.codigo),
    [visibles],
  );
  const indexados = useMemo(
    () => (datos ? indexar(datos, codigos) : []),
    [datos, codigos],
  );

  function alternar(codigo: string) {
    setVisibles((previo) => {
      const nuevo = new Set(previo);
      // Nunca dejar el gráfico vacío: quitar la última moneda no apaga nada.
      if (nuevo.has(codigo) && nuevo.size > 1) nuevo.delete(codigo);
      else nuevo.add(codigo);
      return nuevo;
    });
  }

  function cambiarTema() {
    const siguiente = tema === 'auto' ? 'claro' : tema === 'claro' ? 'oscuro' : 'auto';
    setTema(siguiente);
    if (siguiente === 'auto') document.documentElement.removeAttribute('data-tema');
    else document.documentElement.setAttribute('data-tema', siguiente);
  }

  return (
    <div className="marco">
      <header className="cabecera">
        <div className="fila">
          <div>
            <h1>Divisas latinoamericanas frente al euro</h1>
            <p>
              Tasas de referencia de 98 bancos centrales, con histórico desde 1948.
              Los datos llegan vía <a href="https://www.npmjs.com/package/frankfurter-ts">frankfurter-ts</a>,
              el cliente que escribí para esta API.
            </p>
          </div>
          <button className="pildora" onClick={cambiarTema}>
            Tema: {tema === 'auto' ? 'del sistema' : tema}
          </button>
        </div>
      </header>

      {/* Los filtros, en UNA fila encima de los gráficos. En una barra lateral
          se leen como navegación y no como controles de lo que hay al lado. */}
      <div className="mandos">
        <div className="grupo" role="group" aria-label="Periodo">
          {RANGOS.map((r) => (
            <button
              key={r.clave}
              onClick={() => setRango(r)}
              aria-pressed={r.clave === rango.clave}
            >
              {r.etiqueta}
            </button>
          ))}
        </div>

        <span className="separador" />

        {MONEDAS.map((m) => (
          <button
            key={m.codigo}
            className="pildora"
            onClick={() => alternar(m.codigo)}
            aria-pressed={visibles.has(m.codigo)}
            title={m.nombre}
          >
            <span
              className="punto"
              style={{ background: visibles.has(m.codigo) ? m.color : 'var(--eje)' }}
              aria-hidden="true"
            />
            {m.codigo}
          </button>
        ))}
      </div>

      {error && <Fallo error={error} reintentar={reintentar} />}

      {!error && (
        <>
          {cargando || !datos ? (
            <Cargando alto={110} />
          ) : (
            <Tarjetas filas={datos} visibles={visibles} />
          )}

          <section className="panel">
            <header>
              <h2>Evolución comparada</h2>
              <p className="explica">
                Todas las monedas parten de <strong>100</strong> el primer día del periodo, así
                que la línea muestra cuánto se ha movido cada una en términos
                relativos. Por encima de 100 se ha encarecido frente al euro; por
                debajo, abaratado. Sin indexar no serían comparables: el peso
                colombiano ronda los 3.600 por euro y el dólar 1,15.
              </p>
            </header>

            <Leyenda codigos={codigos} />

            {cargando || !datos
              ? <Cargando />
              : <Grafico filas={indexados} codigos={codigos} indexado />}

            {caducado && <Caducado />}
            {datos && <Tabla filas={datos} visibles={visibles} />}
          </section>

          <section className="panel">
            <header>
              <h2>Conversor</h2>
              <p className="explica">
                Al cambio de hoy, con aritmética de enteros: nada de coma flotante
                para los importes.
              </p>
            </header>
            <Conversor />
          </section>
        </>
      )}

      <footer className="pie">
        <span>
          Datos de <a href="https://frankfurter.dev">Frankfurter</a>, base {BASE}.
          Las tasas se publican una vez al día.
        </span>
        <span>
          <a href="https://github.com/danielbuitragoh/panel-divisas">Código</a> ·
          Daniel Buitrago
        </span>
      </footer>
    </div>
  );
}
