import { countriesData } from "../data/countries";

export default function Stats() {
  const countries = Object.values(countriesData);
  const total = countries.length;
  const retained = countries.filter(c => c.deathPenalty === "retained").length;
  const abolished = countries.filter(c => c.deathPenalty === "abolished").length;
  const moratorium = countries.filter(c => c.deathPenalty === "moratorium").length;
  const abolishedOrdinary = countries.filter(c => c.deathPenalty === "abolished_ordinary").length;
  
  const avgCrime = (countries.reduce((sum, c) => sum + c.crimeRate, 0) / total).toFixed(1);
  const maxCrime = countries.reduce((max, c) => c.crimeRate > max.crimeRate ? c : max, countries[0]);
  const minCrime = countries.reduce((min, c) => c.crimeRate < min.crimeRate ? c : min, countries[0]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon="⚖️"
        value={retained.toString()}
        label="Сохранена"
        color="text-red-400"
        bgColor="bg-red-500/10"
      />
      <StatCard
        icon="🕊️"
        value={abolished.toString()}
        label="Отменена"
        color="text-green-400"
        bgColor="bg-green-500/10"
      />
      <StatCard
        icon="⏸️"
        value={moratorium.toString()}
        label="Мораторий"
        color="text-blue-400"
        bgColor="bg-blue-500/10"
      />
      <StatCard
        icon="⚠️"
        value={abolishedOrdinary.toString()}
        label="Частично"
        color="text-yellow-400"
        bgColor="bg-yellow-500/10"
      />
      <StatCard
        icon="📊"
        value={avgCrime}
        label="Среднее убийств / 100к"
        color="text-slate-300"
        bgColor="bg-slate-500/10"
      />
      <StatCard
        icon="📈"
        value={maxCrime.crimeRate.toString()}
        label={`Макс. (${maxCrime.name})`}
        color="text-red-300"
        bgColor="bg-red-500/10"
      />
      <StatCard
        icon="📉"
        value={minCrime.crimeRate.toString()}
        label={`Мин. (${minCrime.name})`}
        color="text-green-300"
        bgColor="bg-green-500/10"
      />
      <StatCard
        icon="🌍"
        value={total.toString()}
        label="Стран в базе"
        color="text-purple-300"
        bgColor="bg-purple-500/10"
      />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  bgColor,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-3 border border-slate-700/30`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className={`text-xl font-bold ${color}`}>{value}</span>
      </div>
      <p className="text-slate-400 text-xs">{label}</p>
    </div>
  );
}
