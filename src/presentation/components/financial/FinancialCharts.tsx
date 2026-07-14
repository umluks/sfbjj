import React, { useState } from 'react';

interface ChartDataItem {
  label: string;
  total: number;
  kids: number;
  adulto: number;
}

interface FinancialChartsProps {
  data: ChartDataItem[];
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calcula valores de escala
  const maxVal = Math.max(...data.map(d => d.total), 500); // Garante escala mínima de 500
  const chartHeight = 140;
  const chartWidth = 520;
  const paddingLeft = 45;
  const paddingTop = 15;
  const paddingBottom = 25;
  
  const widthPerBar = (chartWidth - paddingLeft) / data.length;

  // Formata moeda
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Coordenadas para o gráfico de linha de evolução total
  const linePoints = data.map((d, index) => {
    const x = paddingLeft + index * widthPerBar + widthPerBar / 2;
    const y = paddingTop + chartHeight - (d.total / maxVal) * chartHeight;
    return { x, y };
  });

  const pathD = linePoints.length > 0 
    ? `M ${linePoints[0].x} ${linePoints[0].y} ` + linePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="card-premium p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-widest">
            Gráfico Analítico de Faturamento
          </h4>
          <p className="text-[9.5px] text-zinc-500 font-semibold uppercase tracking-wider">
            Série histórica mensal detalhada por categoria (Kids vs. Adulto)
          </p>
        </div>

        {/* Legendas */}
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-sky-500 rounded-sm" />
            <span className="text-zinc-400">Kids</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
            <span className="text-zinc-400">Adulto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-zinc-300 inline-block relative -top-0.5" />
            <span className="text-zinc-400">Evolução Total</span>
          </div>
        </div>
      </div>

      {/* Gráfico SVG */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + paddingTop + paddingBottom}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Eixos e Linhas Guia Horizontais */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + chartHeight * (1 - pct);
            const value = maxVal * pct;
            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#1a1a1a"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#71717a"
                  className="text-[8.5px] font-mono font-bold"
                >
                  {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                </text>
              </g>
            );
          })}

          {/* Barras Empilhadas (Kids e Adulto) */}
          {data.map((d, index) => {
            const barWidth = Math.min(widthPerBar * 0.5, 20); // Limita largura
            const x = paddingLeft + index * widthPerBar + (widthPerBar - barWidth) / 2;
            
            // Altura proporcional
            const kidsH = (d.kids / maxVal) * chartHeight;
            const adultoH = (d.adulto / maxVal) * chartHeight;

            // Posições Y
            const yKids = paddingTop + chartHeight - kidsH;
            const yAdulto = yKids - adultoH;

            const isHovered = hoveredIndex === index;

            return (
              <g
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-opacity duration-200"
                style={{ opacity: hoveredIndex !== null && !isHovered ? 0.45 : 1 }}
              >
                {/* Barra Kids (Azul) */}
                {d.kids > 0 && (
                  <rect
                    x={x}
                    y={yKids}
                    width={barWidth}
                    height={kidsH}
                    fill="url(#blueGradient)"
                    rx={1.5}
                  />
                )}
                {/* Barra Adulto (Bronze/Ambar) */}
                {d.adulto > 0 && (
                  <rect
                    x={x}
                    y={yAdulto}
                    width={barWidth}
                    height={adultoH}
                    fill="url(#amberGradient)"
                    rx={1.5}
                  />
                )}

                {/* Backplate invisível para melhorar o hover target */}
                <rect
                  x={paddingLeft + index * widthPerBar}
                  y={paddingTop}
                  width={widthPerBar}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Labels de Mês */}
                <text
                  x={paddingLeft + index * widthPerBar + widthPerBar / 2}
                  y={paddingTop + chartHeight + 16}
                  textAnchor="middle"
                  fill={isHovered ? '#f4f4f5' : '#71717a'}
                  className={`text-[9px] font-bold uppercase transition-colors ${
                    isHovered ? 'font-black' : ''
                  }`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* Gráfico de Linha (Evolução Total) */}
          <path
            d={pathD}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="2.5"
            className="opacity-70 pointer-events-none"
          />

          {/* Nós da Linha */}
          {linePoints.map((p, index) => {
            const isHovered = hoveredIndex === index;
            if (data[index].total === 0) return null; // Não renderiza nós de meses zerados
            
            return (
              <circle
                key={index}
                cx={p.x}
                cy={p.y}
                r={isHovered ? 4.5 : 3}
                fill="#ffffff"
                stroke="#18181b"
                strokeWidth={isHovered ? 2.5 : 1.5}
                className="transition-all duration-200 pointer-events-none"
              />
            );
          })}

          {/* Gradients Defs */}
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.85" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip Dinâmico Flutuante em HTML absoluto */}
        {hoveredIndex !== null && data[hoveredIndex].total > 0 && (
          <div
            className="absolute top-1/3 bg-obsidian-950/95 border border-obsidian-750 px-4 py-2.5 rounded shadow-2xl z-10 animate-fade-in text-[10px] space-y-1"
            style={{
              left: `${Math.min(
                Math.max(
                  10,
                  (paddingLeft + hoveredIndex * widthPerBar + widthPerBar / 2) * (100 / 100) - 60
                ),
                80
              )}%`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none'
            }}
          >
            <p className="font-black text-slate-100 uppercase tracking-wide border-b border-obsidian-850 pb-1 mb-1 font-mono">
              Faturamento • {data[hoveredIndex].label}
            </p>
            <p className="font-semibold text-slate-400 flex items-center justify-between gap-4">
              <span>Kids:</span>
              <span className="font-mono text-sky-400">{formatBRL(data[hoveredIndex].kids)}</span>
            </p>
            <p className="font-semibold text-slate-400 flex items-center justify-between gap-4">
              <span>Adulto:</span>
              <span className="font-mono text-amber-400">{formatBRL(data[hoveredIndex].adulto)}</span>
            </p>
            <p className="font-bold text-slate-200 border-t border-obsidian-850 pt-1 mt-1 flex items-center justify-between gap-4">
              <span>Total:</span>
              <span className="font-mono text-zinc-150">{formatBRL(data[hoveredIndex].total)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
