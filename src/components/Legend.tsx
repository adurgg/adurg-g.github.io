interface LegendProps {
  colorMode: "deathPenalty" | "crimeRate";
}

export default function Legend({ colorMode }: LegendProps) {
  if (colorMode === "deathPenalty") {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        <LegendItem color="#ef4444" label="Сохранена" />
        <LegendItem color="#3b82f6" label="Мораторий" />
        <LegendItem color="#eab308" label="Отменена частично" />
        <LegendItem color="#22c55e" label="Отменена" />
        <LegendItem color="#d1d5db" label="Нет данных" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <LegendItem color="#dcfce7" label="<1" />
      <LegendItem color="#bbf7d0" label="1-3" />
      <LegendItem color="#fef9c3" label="3-5" />
      <LegendItem color="#fed7aa" label="5-10" />
      <LegendItem color="#fca5a5" label="10-20" />
      <LegendItem color="#f87171" label="20-30" />
      <LegendItem color="#dc2626" label=">30" />
      <span className="text-slate-500 text-xs self-center ml-1">(на 100 тыс.)</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-3.5 h-3.5 rounded-sm border border-slate-600"
        style={{ backgroundColor: color }}
      />
      <span className="text-slate-300 text-xs">{label}</span>
    </div>
  );
}
