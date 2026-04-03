// ============================================================================
// Internationalization (i18n)
// ============================================================================

const TRANSLATIONS = {
  en: {
    // Page
    pageTitle: 'CO₂ Budget Map — Who\'s Using More Than Their Fair Share?',
    headerTitle: 'CO₂ <span>Budget Map</span>',
    headerSubtitle: 'See how countries compare to a fair per-capita carbon budget',
    loading: 'Loading map data…',
    loadError: 'Failed to load map data. Please refresh the page.',

    // Metric buttons
    metricParis: 'Paris 1.5°C',
    metricParis2: 'Paris 2.0°C',
    metricTerritorial: 'Territorial',
    metricConsumption: 'Consumption',
    metricHistorical: 'Historical',

    // Metric tooltips
    tooltipParis: 'Compares current emissions to a Paris Agreement–aligned budget. The remaining ~350 Gt CO₂ for 1.5°C (IPCC AR6, 50% probability) is split equally per capita and spread to 2050 — giving each person ~1.6 t/year. A ratio of 1× means exactly on track; most countries far exceed it.',
    tooltipParis2: 'Same approach but for the 2°C target. The remaining ~1,100 Gt CO₂ (IPCC AR6, 67% probability) spread to 2050 gives each person ~5.0 t/year — a less ambitious but still transformative goal.',
    tooltipTerritorial: 'CO₂ emitted within a country\'s borders — from power plants, factories, cars, etc. located in that country.',
    tooltipConsumption: 'CO₂ caused by a country\'s consumption, including emissions embedded in imports and excluding exports. Reflects a country\'s lifestyle footprint.',
    tooltipHistorical: 'Cumulative CO₂ emitted since 1750, divided by today\'s population. This is a rough proxy — it doesn\'t account for population changes over time, so countries that grew fast (e.g. India) look lower, and slow-growth countries (e.g. UK) look higher. Still, it\'s the standard way to approximate each country\'s historical climate debt per person.',

    // Toggles
    actualSize: 'Actual Size',
    budgetView: 'Budget View',
    colorblind: 'Colorblind',
    ranking: '🏆 Ranking',

    // Projection toggle
    globeView: '🌐 Globe',
    mapView: '🗺️ Map',

    // Ranking panel
    countryRanking: 'Country Ranking',

    // Legend
    budgetRatio: 'Budget Ratio',
    underBudget: 'Under budget',
    overBudget: 'Over budget',

    // Info panel
    close: 'Close',
    minimize: 'Minimize',
    resizeToBudget: '⬡ Resize to Budget',
    resetToActual: '↩ Reset to Actual Size',
    population: 'Population',
    tCO2PerCapita: 't CO₂ per capita',
    scaleFactor: 'Scale factor',
    emissionsBreakdown: 'Emissions Breakdown',
    metric: 'Metric',
    perCapita: 'Per Capita',
    total: 'Total',
    fairShareUsage: 'Fair share budget usage',

    // Info panel dynamic text
    ofParisBudget: (label) => `of Paris ${label} budget`,
    ofFairBudget: 'of fair CO₂ budget used',
    overTarget: 'over',
    underTarget: 'under',
    parisTarget: 'Paris target',
    fairShare: 'fair share',
    worldAvgTCap: 'World avg t/cap',
    parisTCap: (label) => `Paris ${label} t/cap`,
    unitTCap: 't/cap',
    unitTCO2Cap: 't CO₂/cap',
    unitTCumulCap: 't cumul/cap',

    // Territory messages
    unknownTerritory: (code) => `Unknown (${code})`,
    dataIncludedUnder: (parent) => `Emissions data for this territory is included under <strong>${parent}</strong>.`,
    noDataAvailable: 'No emissions data available.',
    tooltipDataUnder: (parent) => `Data included under ${parent}`,
    tooltipNoData: 'No data available',
    budgetRatioLabel: 'Budget ratio',

    // Explanations
    parisExplanation: (label, perCapita, name, ratioText, years, yearsLeft) =>
      `<p>To stay within the ${label} Paris budget, each person can emit ~${perCapita} t/year. <strong>${name}</strong> emits at <strong>${ratioText}</strong> that rate. At this pace, it would exhaust its fair share of the remaining budget in <strong>${years} years</strong> instead of ${yearsLeft}.</p>`,
    consExplanation: (name, action, diffPercent) =>
      `<p>If every person on Earth had an equal CO₂ budget, <strong>${name}</strong> would ${action} its emissions by <strong>${diffPercent}%</strong>.</p>`,
    defaultExplanation: (name, action, diffPercent, ratioPercent) =>
      `<p>If every person on Earth had an equal CO₂ budget, <strong>${name}</strong> would ${action} its emissions by <strong>${diffPercent}%</strong>.</p><p>The country is shown at <strong>${ratioPercent}%</strong> of its actual geographic size to reflect its emissions relative to a fair per-capita share.</p>`,
    needToReduce: 'need to reduce',
    couldIncrease: 'could increase',
    consFallbackNote: '⚠ Consumption-based data unavailable — using territorial emissions as fallback.',
    consNote: 'Using consumption-based emissions (includes imports, excludes exports).',

    // Header summary
    summaryScaled: 'Scaled',
    summaryActual: 'Actual',
    summaryCB: 'CB',
    summaryMetrics: { paris: '1.5°C', paris2: '2.0°C', co2: 'Territorial', cons: 'Consumption', hist: 'Historical' },

    // Language selector
    langLabel: '🌐',
  },

  de: {
    pageTitle: 'CO₂-Budgetkarte — Wer verbraucht mehr als seinen fairen Anteil?',
    headerTitle: 'CO₂-<span>Budgetkarte</span>',
    headerSubtitle: 'Wie Länder im Vergleich zu einem fairen Pro-Kopf-CO₂-Budget abschneiden',
    loading: 'Kartendaten werden geladen…',
    loadError: 'Kartendaten konnten nicht geladen werden. Bitte Seite neu laden.',

    metricParis: 'Paris 1,5°C',
    metricParis2: 'Paris 2,0°C',
    metricTerritorial: 'Territorial',
    metricConsumption: 'Konsum',
    metricHistorical: 'Historisch',

    tooltipParis: 'Vergleicht aktuelle Emissionen mit einem Budget gemäß dem Pariser Abkommen. Das verbleibende ~350 Gt CO₂ für 1,5°C (IPCC AR6, 50% Wahrscheinlichkeit) wird gleichmäßig pro Kopf bis 2050 aufgeteilt — ca. 1,6 t/Jahr pro Person. Ein Verhältnis von 1× bedeutet genau im Plan; die meisten Länder überschreiten dies deutlich.',
    tooltipParis2: 'Gleicher Ansatz, aber für das 2°C-Ziel. Das verbleibende ~1.100 Gt CO₂ (IPCC AR6, 67% Wahrscheinlichkeit) bis 2050 ergibt ca. 5,0 t/Jahr pro Person — ein weniger ambitioniertes, aber dennoch transformatives Ziel.',
    tooltipTerritorial: 'CO₂, das innerhalb der Landesgrenzen ausgestoßen wird — von Kraftwerken, Fabriken, Autos usw.',
    tooltipConsumption: 'CO₂, das durch den Konsum eines Landes verursacht wird, einschließlich der in Importen enthaltenen Emissionen und ohne Exporte. Spiegelt den Lebensstil-Fußabdruck wider.',
    tooltipHistorical: 'Kumulierte CO₂-Emissionen seit 1750, geteilt durch die heutige Bevölkerung. Dies ist ein grober Näherungswert — Bevölkerungsveränderungen im Zeitverlauf werden nicht berücksichtigt, daher erscheinen schnell wachsende Länder (z.B. Indien) niedriger und langsam wachsende (z.B. UK) höher. Dennoch die Standardmethode zur Schätzung der historischen Klimaschuld pro Person.',

    actualSize: 'Originalgröße',
    budgetView: 'Budgetansicht',
    colorblind: 'Farbenblind',
    ranking: '🏆 Rangliste',

    globeView: '🌐 Globus',
    mapView: '🗺️ Karte',

    countryRanking: 'Länder-Rangliste',

    budgetRatio: 'Budgetverhältnis',
    underBudget: 'Unter Budget',
    overBudget: 'Über Budget',

    close: 'Schließen',
    minimize: 'Minimieren',
    resizeToBudget: '⬡ Auf Budget skalieren',
    resetToActual: '↩ Originalgröße',
    population: 'Bevölkerung',
    tCO2PerCapita: 't CO₂ pro Kopf',
    scaleFactor: 'Skalierungsfaktor',
    emissionsBreakdown: 'Emissionen im Detail',
    metric: 'Metrik',
    perCapita: 'Pro Kopf',
    total: 'Gesamt',
    fairShareUsage: 'Nutzung des fairen Anteils',

    ofParisBudget: (label) => `des Paris-${label}-Budgets`,
    ofFairBudget: 'des fairen CO₂-Budgets verbraucht',
    overTarget: 'über',
    underTarget: 'unter',
    parisTarget: 'Paris-Ziel',
    fairShare: 'fairem Anteil',
    worldAvgTCap: 'Welt-Ø t/Kopf',
    parisTCap: (label) => `Paris ${label} t/Kopf`,
    unitTCap: 't/Kopf',
    unitTCO2Cap: 't CO₂/Kopf',
    unitTCumulCap: 't kum./Kopf',

    unknownTerritory: (code) => `Unbekannt (${code})`,
    dataIncludedUnder: (parent) => `Emissionsdaten für dieses Gebiet sind unter <strong>${parent}</strong> enthalten.`,
    noDataAvailable: 'Keine Emissionsdaten verfügbar.',
    tooltipDataUnder: (parent) => `Daten enthalten unter ${parent}`,
    tooltipNoData: 'Keine Daten verfügbar',
    budgetRatioLabel: 'Budgetverhältnis',

    parisExplanation: (label, perCapita, name, ratioText, years, yearsLeft) =>
      `<p>Um das ${label}-Paris-Budget einzuhalten, darf jede Person ~${perCapita} t/Jahr ausstoßen. <strong>${name}</strong> emittiert das <strong>${ratioText}</strong>-fache. Bei diesem Tempo wäre der faire Anteil am verbleibenden Budget in <strong>${years} Jahren</strong> statt ${yearsLeft} aufgebraucht.</p>`,
    consExplanation: (name, action, diffPercent) =>
      `<p>Hätte jeder Mensch auf der Erde ein gleiches CO₂-Budget, müsste <strong>${name}</strong> seine Emissionen um <strong>${diffPercent}%</strong> ${action}.</p>`,
    defaultExplanation: (name, action, diffPercent, ratioPercent) =>
      `<p>Hätte jeder Mensch auf der Erde ein gleiches CO₂-Budget, müsste <strong>${name}</strong> seine Emissionen um <strong>${diffPercent}%</strong> ${action}.</p><p>Das Land wird mit <strong>${ratioPercent}%</strong> seiner tatsächlichen Größe dargestellt, um seine Emissionen im Verhältnis zu einem fairen Pro-Kopf-Anteil widerzuspiegeln.</p>`,
    needToReduce: 'senken',
    couldIncrease: 'erhöhen',
    consFallbackNote: '⚠ Konsumbasierte Daten nicht verfügbar — territoriale Emissionen als Ersatz verwendet.',
    consNote: 'Konsumbasierte Emissionen (inkl. Importe, ohne Exporte).',

    summaryScaled: 'Skaliert',
    summaryActual: 'Original',
    summaryCB: 'FB',
    summaryMetrics: { paris: '1,5°C', paris2: '2,0°C', co2: 'Territorial', cons: 'Konsum', hist: 'Historisch' },

    langLabel: '🌐',
  }
};

// German country & territory name translations (English → German)
const COUNTRY_NAMES_DE = {
  'Afghanistan': 'Afghanistan', 'Albania': 'Albanien', 'Algeria': 'Algerien', 'Andorra': 'Andorra',
  'Angola': 'Angola', 'Antigua and Barbuda': 'Antigua und Barbuda', 'Azerbaijan': 'Aserbaidschan',
  'Argentina': 'Argentinien', 'Australia': 'Australien', 'Austria': 'Österreich', 'Bahamas': 'Bahamas',
  'Bahrain': 'Bahrain', 'Bangladesh': 'Bangladesch', 'Armenia': 'Armenien', 'Barbados': 'Barbados',
  'Belgium': 'Belgien', 'Bermuda': 'Bermuda', 'Bhutan': 'Bhutan', 'Bolivia': 'Bolivien',
  'Bosnia and Herzegovina': 'Bosnien und Herzegowina', 'Botswana': 'Botswana', 'Brazil': 'Brasilien',
  'Belize': 'Belize', 'Solomon Islands': 'Salomonen', 'British Virgin Islands': 'Britische Jungferninseln',
  'Brunei': 'Brunei', 'Bulgaria': 'Bulgarien', 'Myanmar': 'Myanmar', 'Burundi': 'Burundi',
  'Belarus': 'Belarus', 'Cambodia': 'Kambodscha', 'Cameroon': 'Kamerun', 'Canada': 'Kanada',
  'Cape Verde': 'Kap Verde', 'Central African Republic': 'Zentralafrikanische Republik',
  'Sri Lanka': 'Sri Lanka', 'Chad': 'Tschad', 'Chile': 'Chile', 'China': 'China', 'Taiwan': 'Taiwan',
  'Colombia': 'Kolumbien', 'Comoros': 'Komoren', 'Congo': 'Kongo',
  'Democratic Republic of Congo': 'Demokratische Republik Kongo', 'Cook Islands': 'Cookinseln',
  'Costa Rica': 'Costa Rica', 'Croatia': 'Kroatien', 'Cuba': 'Kuba', 'Cyprus': 'Zypern',
  'Czechia': 'Tschechien', 'Benin': 'Benin', 'Denmark': 'Dänemark', 'Dominica': 'Dominica',
  'Dominican Republic': 'Dominikanische Republik', 'Ecuador': 'Ecuador', 'El Salvador': 'El Salvador',
  'Equatorial Guinea': 'Äquatorialguinea', 'Ethiopia': 'Äthiopien', 'Eritrea': 'Eritrea',
  'Estonia': 'Estland', 'Faroe Islands': 'Färöer', 'Fiji': 'Fidschi', 'Finland': 'Finnland',
  'France': 'Frankreich', 'French Polynesia': 'Französisch-Polynesien', 'Djibouti': 'Dschibuti',
  'Gabon': 'Gabun', 'Georgia': 'Georgien', 'Gambia': 'Gambia', 'Palestine': 'Palästina',
  'Germany': 'Deutschland', 'Ghana': 'Ghana', 'Kiribati': 'Kiribati', 'Greece': 'Griechenland',
  'Greenland': 'Grönland', 'Grenada': 'Grenada', 'Guatemala': 'Guatemala', 'Guinea': 'Guinea',
  'Guyana': 'Guyana', 'Haiti': 'Haiti', 'Honduras': 'Honduras', 'Hong Kong': 'Hongkong',
  'Hungary': 'Ungarn', 'Iceland': 'Island', 'India': 'Indien', 'Indonesia': 'Indonesien',
  'Iran': 'Iran', 'Iraq': 'Irak', 'Ireland': 'Irland', 'Israel': 'Israel', 'Italy': 'Italien',
  "Cote d'Ivoire": 'Elfenbeinküste', 'Jamaica': 'Jamaika', 'Japan': 'Japan',
  'Kazakhstan': 'Kasachstan', 'Jordan': 'Jordanien', 'Kenya': 'Kenia', 'North Korea': 'Nordkorea',
  'South Korea': 'Südkorea', 'Kuwait': 'Kuwait', 'Kyrgyzstan': 'Kirgisistan', 'Laos': 'Laos',
  'Lebanon': 'Libanon', 'Lesotho': 'Lesotho', 'Latvia': 'Lettland', 'Liberia': 'Liberia',
  'Libya': 'Libyen', 'Liechtenstein': 'Liechtenstein', 'Lithuania': 'Litauen',
  'Luxembourg': 'Luxemburg', 'Macao': 'Macao', 'Madagascar': 'Madagaskar', 'Malawi': 'Malawi',
  'Malaysia': 'Malaysia', 'Maldives': 'Malediven', 'Mali': 'Mali', 'Malta': 'Malta',
  'Mauritania': 'Mauretanien', 'Mauritius': 'Mauritius', 'Mexico': 'Mexiko', 'Monaco': 'Monaco',
  'Mongolia': 'Mongolei', 'Moldova': 'Moldau', 'Montenegro': 'Montenegro', 'Montserrat': 'Montserrat',
  'Morocco': 'Marokko', 'Mozambique': 'Mosambik', 'Oman': 'Oman', 'Namibia': 'Namibia',
  'Nauru': 'Nauru', 'Nepal': 'Nepal', 'Netherlands': 'Niederlande', 'Curacao': 'Curaçao',
  'Aruba': 'Aruba', 'Sint Maarten (Dutch part)': 'Sint Maarten (niederländischer Teil)',
  'Bonaire Sint Eustatius and Saba': 'Bonaire, Sint Eustatius und Saba',
  'New Caledonia': 'Neukaledonien', 'Vanuatu': 'Vanuatu', 'New Zealand': 'Neuseeland',
  'Nicaragua': 'Nicaragua', 'Niger': 'Niger', 'Nigeria': 'Nigeria', 'Niue': 'Niue',
  'Norway': 'Norwegen', 'Micronesia (country)': 'Mikronesien', 'Marshall Islands': 'Marshallinseln',
  'Palau': 'Palau', 'Pakistan': 'Pakistan', 'Panama': 'Panama',
  'Papua New Guinea': 'Papua-Neuguinea', 'Paraguay': 'Paraguay', 'Peru': 'Peru',
  'Philippines': 'Philippinen', 'Poland': 'Polen', 'Portugal': 'Portugal',
  'Guinea-Bissau': 'Guinea-Bissau', 'East Timor': 'Osttimor', 'Qatar': 'Katar',
  'Romania': 'Rumänien', 'Russia': 'Russland', 'Rwanda': 'Ruanda', 'Saint Helena': 'St. Helena',
  'Saint Kitts and Nevis': 'St. Kitts und Nevis', 'Anguilla': 'Anguilla', 'Saint Lucia': 'St. Lucia',
  'Saint Pierre and Miquelon': 'St. Pierre und Miquelon',
  'Saint Vincent and the Grenadines': 'St. Vincent und die Grenadinen', 'San Marino': 'San Marino',
  'Sao Tome and Principe': 'São Tomé und Príncipe', 'Saudi Arabia': 'Saudi-Arabien',
  'Senegal': 'Senegal', 'Serbia': 'Serbien', 'Seychelles': 'Seychellen',
  'Sierra Leone': 'Sierra Leone', 'Singapore': 'Singapur', 'Slovakia': 'Slowakei',
  'Vietnam': 'Vietnam', 'Slovenia': 'Slowenien', 'Somalia': 'Somalia', 'South Africa': 'Südafrika',
  'Zimbabwe': 'Simbabwe', 'Spain': 'Spanien', 'South Sudan': 'Südsudan', 'Sudan': 'Sudan',
  'Suriname': 'Suriname', 'Eswatini': 'Eswatini', 'Sweden': 'Schweden', 'Switzerland': 'Schweiz',
  'Syria': 'Syrien', 'Tajikistan': 'Tadschikistan', 'Thailand': 'Thailand', 'Togo': 'Togo',
  'Tonga': 'Tonga', 'Trinidad and Tobago': 'Trinidad und Tobago',
  'United Arab Emirates': 'Vereinigte Arabische Emirate', 'Tunisia': 'Tunesien', 'Turkey': 'Türkei',
  'Turkmenistan': 'Turkmenistan', 'Turks and Caicos Islands': 'Turks- und Caicosinseln',
  'Tuvalu': 'Tuvalu', 'Uganda': 'Uganda', 'Ukraine': 'Ukraine',
  'North Macedonia': 'Nordmazedonien', 'Egypt': 'Ägypten',
  'United Kingdom': 'Vereinigtes Königreich', 'Tanzania': 'Tansania',
  'United States': 'Vereinigte Staaten', 'Burkina Faso': 'Burkina Faso', 'Uruguay': 'Uruguay',
  'Uzbekistan': 'Usbekistan', 'Venezuela': 'Venezuela', 'Wallis and Futuna': 'Wallis und Futuna',
  'Samoa': 'Samoa', 'Yemen': 'Jemen', 'Zambia': 'Sambia',
  // Territory names
  'Western Sahara': 'Westsahara', 'French Guiana': 'Französisch-Guayana',
  'Guadeloupe': 'Guadeloupe', 'Martinique': 'Martinique', 'Réunion': 'Réunion',
  'Mayotte': 'Mayotte', 'Saint Barthélemy': 'Saint-Barthélemy', 'Saint Martin': 'Saint-Martin',
  'Guernsey': 'Guernsey', 'Jersey': 'Jersey', 'Isle of Man': 'Isle of Man',
  'Åland Islands': 'Ålandinseln', 'American Samoa': 'Amerikanisch-Samoa',
  'Norfolk Island': 'Norfolkinsel', 'Christmas Island': 'Weihnachtsinsel',
  'Antarctica': 'Antarktis', 'Vatican City': 'Vatikanstadt',
  'Northern Mariana Islands': 'Nördliche Marianen',
  'U.S. Virgin Islands': 'Amerikanische Jungferninseln', 'Guam': 'Guam',
  'Puerto Rico': 'Puerto Rico',
  'South Georgia and the South Sandwich Islands': 'Südgeorgien und die Südlichen Sandwichinseln',
  'British Indian Ocean Territory': 'Britisches Territorium im Indischen Ozean',
  'Pitcairn Islands': 'Pitcairninseln', 'Falkland Islands': 'Falklandinseln',
  'Cayman Islands': 'Kaimaninseln',
  'French Southern and Antarctic Lands': 'Französische Süd- und Antarktisgebiete',
  'Heard Island and McDonald Islands': 'Heard und McDonaldinseln',
  'Somaliland': 'Somaliland', 'Kosovo': 'Kosovo', 'Northern Cyprus': 'Nordzypern',
  'Indian Ocean Territories': 'Indischer-Ozean-Territorien', 'Siachen Glacier': 'Siachengletscher',
};

/**
 * Translate a country or territory name.
 * Returns the German name when in German mode, otherwise the original.
 */
function tn(name) {
  if (currentLang === 'de' && COUNTRY_NAMES_DE[name]) return COUNTRY_NAMES_DE[name];
  return name;
}

let currentLang = (navigator.language || 'en').startsWith('de') ? 'de' : 'en';

function t(key) {
  return TRANSLATIONS[currentLang][key] ?? TRANSLATIONS.en[key] ?? key;
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  applyStaticTranslations();
  updateHeaderSummary();
  createLegend();
  if (selectedCountryId) showInfoPanel(selectedCountryId);
  if (rankingOpen) buildRanking();
  renderCountries(); // re-renders tooltips
}

function applyStaticTranslations() {
  // Header
  document.querySelector('.header-title').innerHTML = t('headerTitle');
  document.querySelector('.header-subtitle').textContent = t('headerSubtitle');

  // Metric buttons
  const metricKeys = {
    paris: { label: 'metricParis', tooltip: 'tooltipParis' },
    paris2: { label: 'metricParis2', tooltip: 'tooltipParis2' },
    co2: { label: 'metricTerritorial', tooltip: 'tooltipTerritorial' },
    cons: { label: 'metricConsumption', tooltip: 'tooltipConsumption' },
    hist: { label: 'metricHistorical', tooltip: 'tooltipHistorical' },
  };
  document.querySelectorAll('.metric-btn').forEach(btn => {
    const m = btn.dataset.metric;
    const keys = metricKeys[m];
    if (!keys) return;
    const textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = '\n          ' + t(keys.label) + '\n          ';
    const tooltipEl = btn.querySelector('.metric-tooltip');
    if (tooltipEl) tooltipEl.textContent = t(keys.tooltip);
  });

  // Toggles
  document.getElementById('toggle-label').textContent = isScaled ? t('budgetView') : t('actualSize');
  document.querySelector('label[for="colorblind-toggle"]').textContent = t('colorblind');
  document.getElementById('ranking-toggle').textContent = t('ranking');
  document.getElementById('projection-toggle').textContent = isGlobeView ? t('mapView') : t('globeView');

  // Ranking panel header
  document.querySelector('.ranking-header h3').textContent = t('countryRanking');

  // Loading text
  document.querySelector('#loading p').textContent = t('loading');

  // Language selector highlight
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

// ============================================================================
// Locale-Aware Number Formatting
// ============================================================================

/**
 * Format a number according to the current locale.
 * @param {number} value - The number to format
 * @param {number} [decimals] - Number of decimal places (default: auto)
 * @returns {string} Locale-formatted number string
 */
function formatNumber(value, decimals) {
  if (value == null || !isFinite(value)) return 'N/A';
  const locale = currentLang === 'de' ? 'de-DE' : 'en-US';
  const opts = decimals != null ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : {};
  return value.toLocaleString(locale, opts);
}

/**
 * Format a number compactly (e.g. "1.2M" or "4.5Gt").
 * Uses locale-aware decimal separator.
 */
function formatCompact(value, decimals = 1) {
  if (value == null || !isFinite(value)) return 'N/A';
  const locale = currentLang === 'de' ? 'de-DE' : 'en-US';
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
