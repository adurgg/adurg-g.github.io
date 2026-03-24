import { useState } from "react";
import WorldMap from "./components/WorldMap";
import CountryPanel from "./components/CountryPanel";
import Legend from "./components/Legend";
import Stats from "./components/Stats";

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<"deathPenalty" | "crimeRate">("deathPenalty");
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-red-500/20">
              🌍
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Смертная казнь и преступность в мире
              </h1>
              <p className="text-slate-500 text-xs hidden sm:block">
                Интерактивная карта · Индивидуальный проект
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Toggle color mode */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setColorMode("deathPenalty")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  colorMode === "deathPenalty"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⚖️ Смертная казнь
              </button>
              <button
                onClick={() => setColorMode("crimeRate")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  colorMode === "crimeRate"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📊 Преступность
              </button>
            </div>

            <button
              onClick={() => setShowStats(!showStats)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showStats
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              📈 Статистика
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-4">
        {/* Stats Panel */}
        {showStats && (
          <div className="mb-4 animate-in">
            <Stats />
          </div>
        )}

        {/* Legend */}
        <div className="mb-3 bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
          <Legend colorMode={colorMode} />
        </div>

        {/* Map + Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* Map */}
          <div className="order-1">
            <WorldMap
              onSelectCountry={setSelectedCountry}
              selectedCountry={selectedCountry}
              colorMode={colorMode}
            />
          </div>

          {/* Country Info Panel */}
          <div className="order-2 lg:order-2">
            <CountryPanel
              isoCode={selectedCountry}
              onClose={() => setSelectedCountry(null)}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-slate-600 text-xs pb-4">
          <p>Данные основаны на отчётах UNODC и материалах ООН по вопросам смертной казни</p>
          <p className="mt-1">Индивидуальный проект · Интерактивная карта мира</p>
        </footer>
      </main>
    </div>
  );
}
