/**
 * El comparador: todas las monedas indexadas a base 100, en un solo eje.
 *
 * La decisión de fondo está explicada en `indexar()`, pero conviene repetirla
 * aquí porque es lo que hace que este gráfico funcione: NUNCA dos ejes Y.
 * El peso colombiano ronda 3.600 por euro y el dólar 1,15. Dibujarlos juntos
 * con dos escalas distintas inventa una correlación que no está en los datos,
 * porque la alineación entre ambas escalas es arbitraria. Indexando a 100 en
 * el primer día, comparten un solo eje y el gráfico pasa a responder la
 * pregunta interesante: cuál se ha movido más en términos relativos.
 */

import {
  CartesianGrid, Line, LineChart, ResponsiveContainer,
  ReferenceLine, Tooltip, XAxis, YAxis,
} from 'recharts';
import { POR_CODIGO } from '../datos/monedas';
import type { Fila } from '../datos/usarSerie';

interface Props {
  filas: Fila[];
  codigos: string[];
  /** true en el comparador (valores en base 100); false en la serie cruda. */
  indexado: boolean;
}

export function Grafico({ filas, codigos, indexado }: Props) {
  if (filas.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={330}>
      <LineChart data={filas} margin={{ top: 10, right: 46, bottom: 4, left: -8 }}>
        {/* Rejilla continua y discreta: el punteado añade ruido y compite
            con las propias series. Solo horizontales — las verticales no
            ayudan a leer un valor. */}
        <CartesianGrid stroke="var(--rejilla)" strokeDasharray="0" vertical={false} />

        <XAxis
          dataKey="fecha"
          tick={{ fill: 'var(--tinta-3)', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'var(--eje)' }}
          minTickGap={44}
          tickFormatter={(f: string) => f.slice(5)}
        />
        <YAxis
          tick={{ fill: 'var(--tinta-3)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={52}
          domain={indexado ? ['dataMin - 2', 'dataMax + 2'] : ['auto', 'auto']}
          tickFormatter={(v: number) => (indexado ? v.toFixed(0) : v.toLocaleString('es-ES'))}
        />

        <Tooltip
          content={<Globo indexado={indexado} />}
          cursor={{ stroke: 'var(--eje)', strokeWidth: 1 }}
        />

        {/* La referencia del comparador. Como ReferenceLine y no como una
            Line falsa: así lleva su propia etiqueta, no entra en el tooltip
            y no cuenta como una serie más. */}
        {indexado && (
          <ReferenceLine
            y={100}
            stroke="var(--tinta-3)"
            strokeWidth={1}
            label={{
              value: '100 · inicio',
              position: 'right',
              fill: 'var(--tinta-3)',
              fontSize: 10.5,
            }}
          />
        )}

        {codigos.map((c) => {
          const m = POR_CODIGO.get(c);
          if (!m) return null;
          return (
            <Line
              key={c}
              type="monotone"
              dataKey={c}
              stroke={m.color}
              strokeWidth={2}
              dot={false}
              /* Marcador de 8px al pasar el ratón: por debajo de eso no hay
                 dónde apuntar. El anillo del color de la superficie separa
                 las series que se cruzan. */
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--superficie)' }}
              isAnimationActive={false}
              connectNulls
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------------------------------------------------------------- */

interface GloboProps {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number }>;
  label?: string;
  indexado: boolean;
}

/**
 * Tooltip con todas las series de esa fecha, ordenadas de mayor a menor.
 * Un gráfico en HTML **es** interactivo; entregarlo estático desaprovecha el
 * medio. El texto va en tokens de tinta y el color lo carga el punto de al
 * lado — un número escrito en amarillo sobre fondo claro no se lee.
 */
function Globo({ active, payload, label, indexado }: GloboProps) {
  if (!active || !payload?.length) return null;

  const filas = payload
    .filter((p) => typeof p.value === 'number' && typeof p.dataKey === 'string')
    .map((p) => ({ codigo: p.dataKey as string, valor: p.value as number }))
    .sort((a, b) => b.valor - a.valor);

  if (filas.length === 0) return null;

  return (
    <div className="globo">
      <p className="fecha">{label}</p>
      <ul>
        {filas.map(({ codigo, valor }) => {
          const m = POR_CODIGO.get(codigo);
          if (!m) return null;
          return (
            <li key={codigo}>
              <i className="punto" style={{ background: m.color }} aria-hidden="true" />
              <span>{m.codigo}</span>
              <b>
                {indexado
                  ? valor.toFixed(1)
                  : valor.toLocaleString('es-ES', {
                      minimumFractionDigits: m.decimales,
                      maximumFractionDigits: m.decimales,
                    })}
              </b>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
