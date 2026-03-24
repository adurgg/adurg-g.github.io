import { countriesData, deathPenaltyLabels, deathPenaltyColors } from "../data/countries";

interface CountryPanelProps {
  isoCode: string | null;
  onClose: () => void;
}

function getCrimeRateLevel(rate: number): { label: string; color: string } {
  if (rate < 1) return { label: "Очень низкий", color: "#22c55e" };
  if (rate < 3) return { label: "Низкий", color: "#84cc16" };
  if (rate < 5) return { label: "Умеренный", color: "#eab308" };
  if (rate < 10) return { label: "Выше среднего", color: "#f97316" };
  if (rate < 20) return { label: "Высокий", color: "#ef4444" };
  if (rate < 30) return { label: "Очень высокий", color: "#dc2626" };
  return { label: "Критический", color: "#991b1b" };
}

function getDeathPenaltyIcon(status: string): string {
  switch (status) {
    case "retained": return "⚖️";
    case "abolished": return "🕊️";
    case "abolished_ordinary": return "⚠️";
    case "moratorium": return "⏸️";
    default: return "❓";
  }
}

export default function CountryPanel({ isoCode, onClose }: CountryPanelProps) {
  if (!isoCode) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">🌍</div>
        <h2 className="text-xl font-semibold text-white mb-2">Выберите страну</h2>
        <p className="text-slate-400 text-sm max-w-xs">
          Нажмите на любую страну на карте, чтобы увидеть информацию о смертной казни и уровне преступности
        </p>
        <div className="mt-6 text-slate-500 text-xs space-y-1">
          <p>🖱️ Колёсико мыши — масштаб</p>
          <p>🖱️ Перетаскивание — перемещение</p>
        </div>
      </div>
    );
  }

  const data = countriesData[isoCode];

  if (!data) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-lg font-semibold text-white mb-2">Данные недоступны</h2>
          <p className="text-slate-400 text-sm">
            К сожалению, у нас нет данных по этой стране/территории.
          </p>
          <p className="text-slate-500 text-xs mt-2">Код: {isoCode}</p>
        </div>
      </div>
    );
  }

  const crimeLevel = getCrimeRateLevel(data.crimeRate);
  const maxCrimeRate = 50;
  const crimeBarWidth = Math.min((data.crimeRate / maxCrimeRate) * 100, 100);

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 h-full relative overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-lg z-10"
      >
        ✕
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{data.name}</h2>
        <p className="text-slate-400 text-sm">{data.nameEn}</p>
        <p className="text-slate-500 text-xs mt-1">Население: {data.population}</p>
      </div>

      {/* Death Penalty Card */}
      <div className="bg-slate-900/60 rounded-xl p-4 mb-4 border border-slate-700/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{getDeathPenaltyIcon(data.deathPenalty)}</span>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Смертная казнь</p>
            <p
              className="text-lg font-bold"
              style={{ color: deathPenaltyColors[data.deathPenalty] }}
            >
              {deathPenaltyLabels[data.deathPenalty]}
            </p>
          </div>
        </div>
        <div
          className="w-full h-1.5 rounded-full mb-3"
          style={{ backgroundColor: deathPenaltyColors[data.deathPenalty] + "40" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundColor: deathPenaltyColors[data.deathPenalty],
              width: data.deathPenalty === "retained" ? "100%" :
                     data.deathPenalty === "moratorium" ? "50%" :
                     data.deathPenalty === "abolished_ordinary" ? "25%" : "5%",
            }}
          />
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{data.deathPenaltyDetails}</p>
      </div>

      {/* Crime Rate Card */}
      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📊</span>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">
              Уровень убийств
            </p>
            <p className="text-lg font-bold text-white">
              {data.crimeRate}{" "}
              <span className="text-sm font-normal text-slate-400">на 100 000 чел.</span>
            </p>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span
              className="text-sm font-medium"
              style={{ color: crimeLevel.color }}
            >
              {crimeLevel.label}
            </span>
            <span className="text-slate-500 text-xs">{data.crimeRate} / {maxCrimeRate}</span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${crimeBarWidth}%`,
                background: `linear-gradient(90deg, #22c55e, ${crimeLevel.color})`,
              }}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-green-400 text-xs">Низкий</p>
            <p className="text-slate-500 text-xs">&lt;3</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-yellow-400 text-xs">Средний</p>
            <p className="text-slate-500 text-xs">3-10</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-red-400 text-xs">Высокий</p>
            <p className="text-slate-500 text-xs">&gt;10</p>
          </div>
        </div>
      </div>

      {/* Source note */}
      <p className="text-slate-600 text-xs mt-4 text-center">
        Данные: UNODC, материалы ООН по вопросам смертной казни
      </p>
    </div>
  );
}
