import { useEffect, useRef, useState, useCallback } from "react";
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { countriesData, deathPenaltyColors } from "../data/countries";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GeoFeature {
  type: string;
  id: string;
  properties: { name: string };
  geometry: GeoPermissibleObjects;
}

function getColorForCountry(isoCode: string): string {
  const data = countriesData[isoCode];
  if (!data) return "#d1d5db"; // серый для стран без данных
  return deathPenaltyColors[data.deathPenalty];
}

function getCrimeColor(rate: number): string {
  if (rate < 1) return "#dcfce7";
  if (rate < 3) return "#bbf7d0";
  if (rate < 5) return "#fef9c3";
  if (rate < 10) return "#fed7aa";
  if (rate < 20) return "#fca5a5";
  if (rate < 30) return "#f87171";
  return "#dc2626";
}

// Полный маппинг числовых ID (UN M49 из TopoJSON) → ISO alpha‑3
const numericToISO: Record<string, string> = {
  "4": "AFG", "8": "ALB", "10": "ATA", "12": "DZA", "16": "ASM",
  "20": "AND", "24": "AGO", "28": "ATG", "31": "AZE", "32": "ARG",
  "36": "AUS", "40": "AUT", "44": "BHS", "48": "BHR", "50": "BGD",
  "51": "ARM", "52": "BRB", "56": "BEL", "60": "BMU", "64": "BTN",
  "68": "BOL", "70": "BIH", "72": "BWA", "76": "BRA", "84": "BLZ",
  "90": "SLB", "92": "VGB", "96": "BRN", "100": "BGR", "104": "MMR",
  "108": "BDI", "112": "BLR", "116": "KHM", "120": "CMR", "124": "CAN",
  "132": "CPV", "136": "CYM", "140": "CAF", "144": "LKA", "148": "TCD",
  "152": "CHL", "156": "CHN", "158": "TWN", "170": "COL", "174": "COM",
  "175": "MYT", "178": "COG", "180": "COD", "184": "COK", "188": "CRI",
  "191": "HRV", "192": "CUB", "196": "CYP", "203": "CZE", "204": "BEN",
  "208": "DNK", "212": "DMA", "214": "DOM", "218": "ECU", "222": "SLV",
  "226": "GNQ", "231": "ETH", "232": "ERI", "233": "EST", "234": "FRO",
  "238": "FLK", "242": "FJI", "246": "FIN", "250": "FRA", "254": "GUF",
  "258": "PYF", "260": "ATF", "262": "DJI", "266": "GAB", "268": "GEO",
  "270": "GMB", "275": "PSE", "276": "DEU", "288": "GHA", "296": "KIR",
  "300": "GRC", "304": "GRL", "308": "GRD", "312": "GLP", "316": "GUM",
  "320": "GTM", "324": "GIN", "328": "GUY", "332": "HTI", "336": "VAT",
  "340": "HND", "344": "HKG", "348": "HUN", "352": "ISL", "356": "IND",
  "360": "IDN", "364": "IRN", "368": "IRQ", "372": "IRL", "376": "ISR",
  "380": "ITA", "384": "CIV", "388": "JAM", "392": "JPN", "398": "KAZ",
  "400": "JOR", "404": "KEN", "408": "PRK", "410": "KOR", "414": "KWT",
  "417": "KGZ", "418": "LAO", "422": "LBN", "426": "LSO", "428": "LVA",
  "430": "LBR", "434": "LBY", "438": "LIE", "440": "LTU", "442": "LUX",
  "446": "MAC", "450": "MDG", "454": "MWI", "458": "MYS", "462": "MDV",
  "466": "MLI", "470": "MLT", "474": "MTQ", "478": "MRT", "480": "MUS",
  "484": "MEX", "492": "MCO", "496": "MNG", "498": "MDA", "499": "MNE",
  "504": "MAR", "508": "MOZ", "512": "OMN", "516": "NAM", "520": "NRU",
  "524": "NPL", "528": "NLD", "531": "CUW", "533": "ABW", "540": "NCL",
  "548": "VUT", "554": "NZL", "558": "NIC", "562": "NER", "566": "NGA",
  "570": "NIU", "574": "NFK", "578": "NOR", "580": "MNP", "583": "FSM",
  "584": "MHL", "585": "PLW", "586": "PAK", "591": "PAN", "598": "PNG",
  "600": "PRY", "604": "PER", "608": "PHL", "612": "PCN", "616": "POL",
  "620": "PRT", "624": "GNB", "626": "TLS", "630": "PRI", "634": "QAT",
  "638": "REU", "642": "ROU", "643": "RUS", "646": "RWA", "659": "KNA",
  "662": "LCA", "670": "VCT", "674": "SMR", "678": "STP", "682": "SAU",
  "686": "SEN", "688": "SRB", "690": "SYC", "694": "SLE", "702": "SGP",
  "703": "SVK", "704": "VNM", "705": "SVN", "706": "SOM", "710": "ZAF",
  "716": "ZWE", "724": "ESP", "728": "SSD", "729": "SDN", "732": "ESH",
  "740": "SUR", "748": "SWZ", "752": "SWE", "756": "CHE", "760": "SYR",
  "762": "TJK", "764": "THA", "768": "TGO", "776": "TON", "780": "TTO",
  "784": "ARE", "788": "TUN", "792": "TUR", "795": "TKM", "798": "TUV",
  "800": "UGA", "804": "UKR", "807": "MKD", "818": "EGY", "826": "GBR",
  "831": "GGY", "832": "JEY", "833": "IMN", "834": "TZA", "840": "USA",
  "854": "BFA", "858": "URY", "860": "UZB", "862": "VEN", "876": "WLF",
  "882": "WSM", "887": "YEM", "894": "ZMB",
  // Специальные коды
  "-99": "XKX",    // Косово
  "900": "XKX",    // Косово (альтернативный)
};

// Запасной маппинг по названиям (для стран, которые могут иметь нестандартные ID)
const nameToISO: Record<string, string> = {
  "Afghanistan": "AFG", "Albania": "ALB", "Algeria": "DZA", "Angola": "AGO",
  "Argentina": "ARG", "Armenia": "ARM", "Australia": "AUS", "Austria": "AUT",
  "Azerbaijan": "AZE", "Bahamas": "BHS", "The Bahamas": "BHS",
  "Bangladesh": "BGD", "Bahrain": "BHR", "Belarus": "BLR", "Belgium": "BEL",
  "Belize": "BLZ", "Benin": "BEN", "Bhutan": "BTN", "Bolivia": "BOL",
  "Bosnia and Herzegovina": "BIH", "Bosnia and Herz.": "BIH",
  "Botswana": "BWA", "Brazil": "BRA", "Brunei": "BRN", "Brunei Darussalam": "BRN",
  "Bulgaria": "BGR", "Burkina Faso": "BFA", "Burundi": "BDI",
  "Cambodia": "KHM", "Cameroon": "CMR", "Canada": "CAN",
  "Central African Republic": "CAF", "Central African Rep.": "CAF",
  "Chad": "TCD", "Chile": "CHL", "China": "CHN", "Colombia": "COL",
  "Comoros": "COM", "Congo": "COG", "Republic of the Congo": "COG",
  "Republic of Congo": "COG", "Dem. Rep. Congo": "COD",
  "Democratic Republic of the Congo": "COD", "DR Congo": "COD",
  "Costa Rica": "CRI", "Côte d'Ivoire": "CIV", "Ivory Coast": "CIV",
  "Croatia": "HRV", "Cuba": "CUB", "Cyprus": "CYP",
  "Czech Republic": "CZE", "Czechia": "CZE",
  "Denmark": "DNK", "Djibouti": "DJI", "Dominica": "DMA",
  "Dominican Republic": "DOM", "Dominican Rep.": "DOM",
  "Ecuador": "ECU", "Egypt": "EGY", "El Salvador": "SLV",
  "Equatorial Guinea": "GNQ", "Eq. Guinea": "GNQ",
  "Eritrea": "ERI", "Estonia": "EST", "Ethiopia": "ETH",
  "Falkland Islands": "FLK", "Falkland Is.": "FLK",
  "Fiji": "FJI", "Finland": "FIN", "France": "FRA",
  "French Guiana": "GUF", "Fr. Guiana": "GUF",
  "French Southern Territories": "ATF", "Fr. S. Antarctic Lands": "ATF",
  "Gabon": "GAB", "Gambia": "GMB", "The Gambia": "GMB",
  "Georgia": "GEO", "Germany": "DEU", "Ghana": "GHA", "Greece": "GRC",
  "Greenland": "GRL", "Guatemala": "GTM", "Guinea": "GIN",
  "Guinea-Bissau": "GNB", "Guinea Bissau": "GNB",
  "Guyana": "GUY", "Haiti": "HTI", "Honduras": "HND", "Hungary": "HUN",
  "Iceland": "ISL", "India": "IND", "Indonesia": "IDN", "Iran": "IRN",
  "Iran, Islamic Rep.": "IRN",
  "Iraq": "IRQ", "Ireland": "IRL", "Israel": "ISR", "Italy": "ITA",
  "Jamaica": "JAM", "Japan": "JPN", "Jordan": "JOR",
  "Kazakhstan": "KAZ", "Kenya": "KEN",
  "North Korea": "PRK", "Dem. Rep. Korea": "PRK", "Korea, Dem. Rep.": "PRK",
  "South Korea": "KOR", "Korea": "KOR", "Korea, Rep.": "KOR", "Rep. Korea": "KOR",
  "Kosovo": "XKX",
  "Kuwait": "KWT", "Kyrgyzstan": "KGZ", "Laos": "LAO", "Lao PDR": "LAO",
  "Latvia": "LVA", "Lebanon": "LBN", "Lesotho": "LSO",
  "Liberia": "LBR", "Libya": "LBY", "Lithuania": "LTU", "Luxembourg": "LUX",
  "Madagascar": "MDG", "Malawi": "MWI", "Malaysia": "MYS", "Maldives": "MDV",
  "Mali": "MLI", "Malta": "MLT", "Mauritania": "MRT", "Mauritius": "MUS",
  "Mexico": "MEX", "Moldova": "MDA", "Mongolia": "MNG", "Montenegro": "MNE",
  "Morocco": "MAR", "Mozambique": "MOZ", "Myanmar": "MMR",
  "Namibia": "NAM", "Nepal": "NPL", "Netherlands": "NLD",
  "New Caledonia": "NCL", "New Zealand": "NZL", "Nicaragua": "NIC",
  "Niger": "NER", "Nigeria": "NGA", "Norway": "NOR",
  "North Macedonia": "MKD", "Macedonia": "MKD", "N. Macedonia": "MKD",
  "Oman": "OMN", "Pakistan": "PAK", "Palestine": "PSE",
  "Panama": "PAN", "Papua New Guinea": "PNG", "Paraguay": "PRY",
  "Peru": "PER", "Philippines": "PHL", "Poland": "POL", "Portugal": "PRT",
  "Puerto Rico": "PRI", "Qatar": "QAT", "Romania": "ROU", "Russia": "RUS",
  "Rwanda": "RWA", "Saudi Arabia": "SAU", "Senegal": "SEN", "Serbia": "SRB",
  "Sierra Leone": "SLE", "Singapore": "SGP", "Slovakia": "SVK",
  "Slovenia": "SVN", "Solomon Islands": "SLB", "Solomon Is.": "SLB",
  "Somalia": "SOM", "Somaliland": "SOL",
  "South Africa": "ZAF", "South Sudan": "SSD", "S. Sudan": "SSD",
  "Spain": "ESP", "Sri Lanka": "LKA",
  "Sudan": "SDN", "Suriname": "SUR", "Swaziland": "SWZ", "eSwatini": "SWZ",
  "Sweden": "SWE", "Switzerland": "CHE", "Syria": "SYR",
  "Taiwan": "TWN", "Tajikistan": "TJK", "Tanzania": "TZA",
  "United Republic of Tanzania": "TZA",
  "Thailand": "THA", "Timor-Leste": "TLS", "East Timor": "TLS",
  "Togo": "TGO", "Trinidad and Tobago": "TTO",
  "Tunisia": "TUN", "Turkey": "TUR", "Türkiye": "TUR",
  "Turkmenistan": "TKM", "Uganda": "UGA", "Ukraine": "UKR",
  "United Arab Emirates": "ARE", "United Kingdom": "GBR",
  "United States": "USA", "United States of America": "USA",
  "Uruguay": "URY", "Uzbekistan": "UZB", "Vanuatu": "VUT",
  "Venezuela": "VEN", "Vietnam": "VNM", "Viet Nam": "VNM",
  "Western Sahara": "ESH", "W. Sahara": "ESH",
  "Yemen": "YEM", "Zambia": "ZMB", "Zimbabwe": "ZWE",
  "Antarctica": "ATA",
  // Дополнительные варианты написания
  "Dem. Rep. of the Congo": "COD", "Congo, Dem. Rep.": "COD",
  "Congo, Rep.": "COG",
  "Iran (Islamic Republic of)": "IRN",
  "Lao People's Democratic Republic": "LAO",
  "Lao People's Dem. Rep.": "LAO",
  "Syrian Arab Republic": "SYR",
  "United Rep. of Tanzania": "TZA",
  "Cabo Verde": "CPV", "Cape Verde": "CPV",
  "Antigua and Barbuda": "ATG",
  "Barbados": "BRB",
};

interface WorldMapProps {
  onSelectCountry: (isoCode: string | null) => void;
  selectedCountry: string | null;
  colorMode: "deathPenalty" | "crimeRate";
}

export default function WorldMap({ onSelectCountry, selectedCountry, colorMode }: WorldMapProps) {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Zoom / pan state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error: ${r.status}`);
        return r.json();
      })
      .then((topology: Topology) => {
        const geojson = feature(
          topology,
          topology.objects.countries as GeometryCollection
        );
        setFeatures(geojson.features as unknown as GeoFeature[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load map data:", err);
        setError("Не удалось загрузить данные карты. Проверьте интернет-соединение.");
        setLoading(false);
      });
  }, []);

  const width = 960;
  const height = 500;

  const projection = geoNaturalEarth1()
    .scale(160)
    .translate([width / 2, height / 2]);

  const pathGenerator = geoPath().projection(projection);

  const getISO = useCallback((feat: GeoFeature): string => {
    // Сначала по числовому ID
    const isoFromId = numericToISO[feat.id];
    if (isoFromId) return isoFromId;

    // Затем по имени из properties
    if (feat.properties?.name) {
      const isoFromName = nameToISO[feat.properties.name];
      if (isoFromName) return isoFromName;
    }

    return feat.id; // Возврат исходного ID
  }, []);

  const getFillColor = useCallback((feat: GeoFeature): string => {
    const iso = getISO(feat);
    if (colorMode === "deathPenalty") {
      return getColorForCountry(iso);
    } else {
      const data = countriesData[iso];
      if (!data) return "#d1d5db";
      return getCrimeColor(data.crimeRate);
    }
  }, [colorMode, getISO]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    translateStart.current = { ...translate };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setTranslate({
        x: translateStart.current.x + dx,
        y: translateStart.current.y + dy,
      });
    }
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    isPanning.current = false;
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setScale((s) => Math.min(Math.max(s * factor, 0.5), 8));
  }, []);

  // Используем useEffect для добавления wheel event с passive: false
  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => svg.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Получаем данные о наведённой стране
  const hoveredFeature = features.find(f => f.id === hoveredCountry);
  const hoveredIso = hoveredFeature ? getISO(hoveredFeature) : null;
  const hoveredData = hoveredIso ? countriesData[hoveredIso] : null;
  const hoveredName = hoveredData?.name || hoveredFeature?.properties?.name || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800/50 rounded-xl border border-red-500/30">
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <div className="text-5xl">⚠️</div>
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto bg-slate-900/50 rounded-xl border border-slate-700/50 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { handleMouseUp(); setHoveredCountry(null); }}
      >
        {/* Ocean background gradient */}
        <defs>
          <radialGradient id="ocean" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#ocean)" rx={12} />

        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
          {/* Граница (сфера) */}
          <path
            d={pathGenerator({ type: "Sphere" }) || ""}
            fill="none"
            stroke="#334155"
            strokeWidth={0.5}
          />

          {features.map((feat) => {
            const iso = getISO(feat);
            const isHovered = hoveredCountry === feat.id;
            const isSelected = selectedCountry === iso;
            const path = pathGenerator(feat.geometry);

            return (
              <path
                key={feat.id}
                d={path || ""}
                fill={getFillColor(feat)}
                stroke={isSelected ? "#facc15" : isHovered ? "#e2e8f0" : "#1e293b"}
                strokeWidth={isSelected ? 1.5 : isHovered ? 1 : 0.4}
                className="transition-colors duration-150"
                style={{
                  opacity: isHovered || isSelected ? 1 : 0.85,
                  filter: isSelected ? "brightness(1.2)" : undefined,
                }}
                onMouseEnter={() => setHoveredCountry(feat.id)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCountry(iso);
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Тултип — показываем для всех стран */}
      {hoveredCountry && hoveredName && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl border border-slate-600 text-sm"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
          }}
        >
          <p className="font-semibold">{hoveredName}</p>
          {hoveredData && (
            <p className="text-slate-300 text-xs">{hoveredData.nameEn}</p>
          )}
          {!hoveredData && (
            <p className="text-slate-400 text-xs italic">Нет данных</p>
          )}
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.3, 8))}
          className="bg-slate-800/90 hover:bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold border border-slate-600 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s / 1.3, 0.5))}
          className="bg-slate-800/90 hover:bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold border border-slate-600 transition-colors"
        >
          −
        </button>
        <button
          onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }); }}
          className="bg-slate-800/90 hover:bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border border-slate-600 transition-colors mt-1"
          title="Сбросить"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
