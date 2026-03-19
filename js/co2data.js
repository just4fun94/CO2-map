/**
 * CO2 Emissions and Population Data
 * 
 * Sources (approximate 2022 data compiled from public datasets):
 * - Global Carbon Budget 2023 (Friedlingstein et al., 2023)
 * - Our World in Data CO2 dataset (based on Global Carbon Project)
 * - World Bank Population Indicators (2022)
 * - Carbon Brief Historical Emissions Analysis
 * 
 * Keyed by ISO 3166-1 numeric code (matching world-atlas topojson)
 * 
 * Fields:
 *   name: Country name
 *   pop:  Population in millions (2022)
 *   co2:  Territorial/production CO2 emissions (Mt CO2, 2022)
 *   cons: Consumption-based CO2 emissions (Mt CO2, latest available) or null
 *   hist: Historical cumulative CO2 emissions (Gt CO2, 1850–2022) or null
 */

const CO2_DATA = {
  "004": { name: "Afghanistan", pop: 41.1, co2: 8.6, cons: null, hist: 0.15 },
  "008": { name: "Albania", pop: 2.8, co2: 4.4, cons: null, hist: 0.28 },
  "012": { name: "Algeria", pop: 45.6, co2: 149, cons: 150, hist: 4.6 },
  "024": { name: "Angola", pop: 35.0, co2: 22, cons: null, hist: 0.8 },
  "031": { name: "Azerbaijan", pop: 10.1, co2: 35, cons: null, hist: 1.2 },
  "032": { name: "Argentina", pop: 46.2, co2: 172, cons: 165, hist: 8.2 },
  "036": { name: "Australia", pop: 26.0, co2: 386, cons: 410, hist: 18.3 },
  "040": { name: "Austria", pop: 9.1, co2: 62, cons: 80, hist: 4.5 },
  "050": { name: "Bangladesh", pop: 171, co2: 84, cons: 90, hist: 1.8 },
  "051": { name: "Armenia", pop: 3.0, co2: 5.5, cons: null, hist: 0.35 },
  "056": { name: "Belgium", pop: 11.6, co2: 88, cons: 110, hist: 10.2 },
  "064": { name: "Bhutan", pop: 0.78, co2: 1.0, cons: null, hist: 0.02 },
  "068": { name: "Bolivia", pop: 12.1, co2: 22, cons: null, hist: 0.9 },
  "070": { name: "Bosnia and Herzegovina", pop: 3.2, co2: 20, cons: null, hist: 0.8 },
  "072": { name: "Botswana", pop: 2.4, co2: 6.5, cons: null, hist: 0.2 },
  "076": { name: "Brazil", pop: 215, co2: 478, cons: 490, hist: 15.2 },
  "100": { name: "Bulgaria", pop: 6.8, co2: 36, cons: 34, hist: 3.5 },
  "104": { name: "Myanmar", pop: 54.4, co2: 22, cons: null, hist: 1.5 },
  "112": { name: "Belarus", pop: 9.2, co2: 55, cons: null, hist: 3.0 },
  "116": { name: "Cambodia", pop: 16.9, co2: 12, cons: null, hist: 0.25 },
  "120": { name: "Cameroon", pop: 27.9, co2: 8, cons: null, hist: 0.35 },
  "124": { name: "Canada", pop: 39.0, co2: 544, cons: 570, hist: 34 },
  "140": { name: "Central African Republic", pop: 5.5, co2: 0.3, cons: null, hist: 0.02 },
  "144": { name: "Sri Lanka", pop: 22.0, co2: 18, cons: 22, hist: 0.85 },
  "148": { name: "Chad", pop: 17.7, co2: 1.5, cons: null, hist: 0.05 },
  "152": { name: "Chile", pop: 19.5, co2: 87, cons: 95, hist: 3.8 },
  "156": { name: "China", pop: 1412, co2: 11397, cons: 10500, hist: 284 },
  "170": { name: "Colombia", pop: 51.9, co2: 87, cons: 90, hist: 3.7 },
  "178": { name: "Congo", pop: 5.8, co2: 4, cons: null, hist: 0.2 },
  "180": { name: "Dem. Rep. Congo", pop: 99, co2: 4, cons: null, hist: 0.35 },
  "188": { name: "Costa Rica", pop: 5.2, co2: 8, cons: 10, hist: 0.3 },
  "191": { name: "Croatia", pop: 3.9, co2: 15, cons: 18, hist: 1.3 },
  "192": { name: "Cuba", pop: 11.2, co2: 24, cons: null, hist: 2.0 },
  "196": { name: "Cyprus", pop: 1.25, co2: 7.5, cons: null, hist: 0.35 },
  "203": { name: "Czechia", pop: 10.8, co2: 98, cons: 105, hist: 9.0 },
  "208": { name: "Denmark", pop: 5.9, co2: 26, cons: 45, hist: 2.8 },
  "214": { name: "Dominican Republic", pop: 11.1, co2: 25, cons: null, hist: 0.85 },
  "218": { name: "Ecuador", pop: 18.0, co2: 34, cons: null, hist: 1.5 },
  "222": { name: "El Salvador", pop: 6.3, co2: 6, cons: null, hist: 0.2 },
  "226": { name: "Equatorial Guinea", pop: 1.6, co2: 5, cons: null, hist: 0.15 },
  "231": { name: "Ethiopia", pop: 123, co2: 17, cons: null, hist: 0.5 },
  "232": { name: "Eritrea", pop: 3.6, co2: 0.7, cons: null, hist: 0.03 },
  "233": { name: "Estonia", pop: 1.33, co2: 11, cons: 13, hist: 1.0 },
  "242": { name: "Fiji", pop: 0.93, co2: 1.5, cons: null, hist: 0.05 },
  "246": { name: "Finland", pop: 5.5, co2: 36, cons: 48, hist: 2.9 },
  "250": { name: "France", pop: 68.0, co2: 299, cons: 370, hist: 37 },
  "262": { name: "Djibouti", pop: 1.1, co2: 0.5, cons: null, hist: 0.02 },
  "266": { name: "Gabon", pop: 2.4, co2: 4, cons: null, hist: 0.2 },
  "268": { name: "Georgia", pop: 3.7, co2: 10, cons: null, hist: 0.6 },
  "270": { name: "Gambia", pop: 2.7, co2: 0.6, cons: null, hist: 0.02 },
  "275": { name: "Palestine", pop: 5.3, co2: 3, cons: null, hist: 0.08 },
  "276": { name: "Germany", pop: 84.3, co2: 666, cons: 740, hist: 92 },
  "288": { name: "Ghana", pop: 33.5, co2: 15, cons: 18, hist: 0.7 },
  "300": { name: "Greece", pop: 10.4, co2: 56, cons: 65, hist: 4.2 },
  "320": { name: "Guatemala", pop: 17.4, co2: 17, cons: null, hist: 0.5 },
  "324": { name: "Guinea", pop: 13.9, co2: 3, cons: null, hist: 0.1 },
  "328": { name: "Guyana", pop: 0.8, co2: 3, cons: null, hist: 0.05 },
  "332": { name: "Haiti", pop: 11.6, co2: 3, cons: null, hist: 0.1 },
  "340": { name: "Honduras", pop: 10.3, co2: 10, cons: null, hist: 0.3 },
  "348": { name: "Hungary", pop: 10.0, co2: 44, cons: 50, hist: 3.8 },
  "352": { name: "Iceland", pop: 0.38, co2: 3, cons: 4, hist: 0.12 },
  "356": { name: "India", pop: 1417, co2: 2830, cons: 2600, hist: 55 },
  "360": { name: "Indonesia", pop: 276, co2: 619, cons: 580, hist: 14.3 },
  "364": { name: "Iran", pop: 88.0, co2: 690, cons: 650, hist: 18 },
  "368": { name: "Iraq", pop: 44.5, co2: 175, cons: 165, hist: 5.3 },
  "372": { name: "Ireland", pop: 5.1, co2: 37, cons: 50, hist: 2.6 },
  "376": { name: "Israel", pop: 9.6, co2: 63, cons: 72, hist: 3.0 },
  "380": { name: "Italy", pop: 59.0, co2: 326, cons: 350, hist: 23 },
  "384": { name: "Côte d'Ivoire", pop: 28.2, co2: 10, cons: null, hist: 0.4 },
  "388": { name: "Jamaica", pop: 2.8, co2: 7, cons: null, hist: 0.35 },
  "392": { name: "Japan", pop: 125, co2: 1067, cons: 1100, hist: 65 },
  "398": { name: "Kazakhstan", pop: 19.4, co2: 222, cons: 200, hist: 9.5 },
  "400": { name: "Jordan", pop: 11.3, co2: 22, cons: 25, hist: 0.6 },
  "404": { name: "Kenya", pop: 54.0, co2: 14, cons: null, hist: 0.45 },
  "408": { name: "North Korea", pop: 26.0, co2: 55, cons: null, hist: 4.0 },
  "410": { name: "South Korea", pop: 51.7, co2: 616, cons: 630, hist: 18 },
  "414": { name: "Kuwait", pop: 4.3, co2: 83, cons: 78, hist: 3.2 },
  "417": { name: "Kyrgyzstan", pop: 6.7, co2: 8, cons: null, hist: 0.4 },
  "418": { name: "Laos", pop: 7.5, co2: 15, cons: null, hist: 0.15 },
  "422": { name: "Lebanon", pop: 6.8, co2: 18, cons: null, hist: 0.7 },
  "426": { name: "Lesotho", pop: 2.3, co2: 2, cons: null, hist: 0.04 },
  "430": { name: "Liberia", pop: 5.2, co2: 1, cons: null, hist: 0.04 },
  "434": { name: "Libya", pop: 6.8, co2: 34, cons: null, hist: 2.5 },
  "440": { name: "Lithuania", pop: 2.8, co2: 12, cons: 16, hist: 1.5 },
  "442": { name: "Luxembourg", pop: 0.65, co2: 9, cons: 14, hist: 0.7 },
  "450": { name: "Madagascar", pop: 29.6, co2: 4, cons: null, hist: 0.1 },
  "454": { name: "Malawi", pop: 20.0, co2: 2, cons: null, hist: 0.06 },
  "458": { name: "Malaysia", pop: 33.0, co2: 234, cons: 220, hist: 6.3 },
  "466": { name: "Mali", pop: 22.4, co2: 4, cons: null, hist: 0.1 },
  "478": { name: "Mauritania", pop: 4.7, co2: 3, cons: null, hist: 0.1 },
  "484": { name: "Mexico", pop: 129, co2: 421, cons: 430, hist: 16 },
  "496": { name: "Mongolia", pop: 3.4, co2: 15, cons: null, hist: 0.4 },
  "498": { name: "Moldova", pop: 2.6, co2: 5, cons: null, hist: 0.6 },
  "504": { name: "Morocco", pop: 37.5, co2: 58, cons: 62, hist: 2.1 },
  "508": { name: "Mozambique", pop: 32.8, co2: 5, cons: null, hist: 0.2 },
  "512": { name: "Oman", pop: 4.6, co2: 67, cons: 55, hist: 1.6 },
  "516": { name: "Namibia", pop: 2.5, co2: 3, cons: null, hist: 0.15 },
  "524": { name: "Nepal", pop: 30.5, co2: 11, cons: null, hist: 0.2 },
  "528": { name: "Netherlands", pop: 17.6, co2: 147, cons: 180, hist: 11 },
  "540": { name: "New Caledonia", pop: 0.29, co2: 4, cons: null, hist: 0.15 },
  "554": { name: "New Zealand", pop: 5.1, co2: 32, cons: 36, hist: 1.8 },
  "558": { name: "Nicaragua", pop: 6.9, co2: 5, cons: null, hist: 0.18 },
  "562": { name: "Niger", pop: 26.2, co2: 3, cons: null, hist: 0.08 },
  "566": { name: "Nigeria", pop: 219, co2: 104, cons: null, hist: 3.5 },
  "578": { name: "Norway", pop: 5.4, co2: 41, cons: 55, hist: 2.7 },
  "586": { name: "Pakistan", pop: 231, co2: 185, cons: 180, hist: 4.6 },
  "591": { name: "Panama", pop: 4.4, co2: 10, cons: null, hist: 0.45 },
  "598": { name: "Papua New Guinea", pop: 10.0, co2: 7, cons: null, hist: 0.2 },
  "600": { name: "Paraguay", pop: 6.8, co2: 7, cons: null, hist: 0.3 },
  "604": { name: "Peru", pop: 34.0, co2: 52, cons: 56, hist: 2.1 },
  "608": { name: "Philippines", pop: 115, co2: 157, cons: 150, hist: 3.0 },
  "616": { name: "Poland", pop: 37.8, co2: 306, cons: 310, hist: 27 },
  "620": { name: "Portugal", pop: 10.3, co2: 40, cons: 48, hist: 2.6 },
  "634": { name: "Qatar", pop: 2.7, co2: 80, cons: 60, hist: 2.3 },
  "642": { name: "Romania", pop: 19.0, co2: 68, cons: 72, hist: 7.0 },
  "643": { name: "Russia", pop: 144, co2: 1757, cons: 1500, hist: 115 },
  "646": { name: "Rwanda", pop: 13.8, co2: 1, cons: null, hist: 0.04 },
  "682": { name: "Saudi Arabia", pop: 36.4, co2: 586, cons: 550, hist: 16 },
  "686": { name: "Senegal", pop: 17.3, co2: 10, cons: null, hist: 0.25 },
  "688": { name: "Serbia", pop: 6.7, co2: 39, cons: null, hist: 3.0 },
  "694": { name: "Sierra Leone", pop: 8.4, co2: 2, cons: null, hist: 0.05 },
  "702": { name: "Singapore", pop: 5.64, co2: 47, cons: 70, hist: 1.5 },
  "703": { name: "Slovakia", pop: 5.4, co2: 31, cons: 35, hist: 3.5 },
  "704": { name: "Vietnam", pop: 98.0, co2: 207, cons: 190, hist: 4.2 },
  "705": { name: "Slovenia", pop: 2.1, co2: 13, cons: 16, hist: 0.8 },
  "706": { name: "Somalia", pop: 17.6, co2: 1, cons: null, hist: 0.03 },
  "710": { name: "South Africa", pop: 60.0, co2: 435, cons: 400, hist: 19.5 },
  "716": { name: "Zimbabwe", pop: 16.3, co2: 10, cons: null, hist: 0.55 },
  "724": { name: "Spain", pop: 47.6, co2: 247, cons: 280, hist: 14 },
  "728": { name: "South Sudan", pop: 11.1, co2: 2, cons: null, hist: 0.08 },
  "729": { name: "Sudan", pop: 46.0, co2: 15, cons: null, hist: 0.55 },
  "740": { name: "Suriname", pop: 0.61, co2: 2, cons: null, hist: 0.08 },
  "748": { name: "Eswatini", pop: 1.2, co2: 1, cons: null, hist: 0.04 },
  "752": { name: "Sweden", pop: 10.5, co2: 35, cons: 60, hist: 4.7 },
  "756": { name: "Switzerland", pop: 8.8, co2: 34, cons: 65, hist: 2.8 },
  "760": { name: "Syria", pop: 22.1, co2: 15, cons: null, hist: 1.5 },
  "762": { name: "Tajikistan", pop: 10.0, co2: 7, cons: null, hist: 0.3 },
  "764": { name: "Thailand", pop: 71.7, co2: 278, cons: 270, hist: 7.6 },
  "768": { name: "Togo", pop: 8.8, co2: 3, cons: null, hist: 0.08 },
  "780": { name: "Trinidad and Tobago", pop: 1.5, co2: 18, cons: null, hist: 1.0 },
  "784": { name: "United Arab Emirates", pop: 9.4, co2: 178, cons: 160, hist: 5.5 },
  "788": { name: "Tunisia", pop: 12.1, co2: 25, cons: 28, hist: 1.1 },
  "792": { name: "Turkey", pop: 85.3, co2: 400, cons: 420, hist: 12.5 },
  "795": { name: "Turkmenistan", pop: 6.3, co2: 72, cons: null, hist: 2.5 },
  "800": { name: "Uganda", pop: 47.2, co2: 4, cons: null, hist: 0.15 },
  "804": { name: "Ukraine", pop: 43.8, co2: 151, cons: 140, hist: 29 },
  "807": { name: "North Macedonia", pop: 2.1, co2: 6, cons: null, hist: 0.5 },
  "818": { name: "Egypt", pop: 111, co2: 219, cons: 210, hist: 5.7 },
  "826": { name: "United Kingdom", pop: 67.5, co2: 338, cons: 400, hist: 78 },
  "834": { name: "Tanzania", pop: 65.0, co2: 13, cons: null, hist: 0.4 },
  "840": { name: "United States", pop: 333, co2: 5057, cons: 5500, hist: 422 },
  "854": { name: "Burkina Faso", pop: 22.1, co2: 4, cons: null, hist: 0.1 },
  "858": { name: "Uruguay", pop: 3.4, co2: 6, cons: 8, hist: 0.35 },
  "860": { name: "Uzbekistan", pop: 35.3, co2: 58, cons: null, hist: 3.8 },
  "862": { name: "Venezuela", pop: 28.4, co2: 71, cons: null, hist: 5.8 },
  "887": { name: "Yemen", pop: 33.0, co2: 8, cons: null, hist: 0.5 },
  "894": { name: "Zambia", pop: 20.0, co2: 5, cons: null, hist: 0.45 },
  "716": { name: "Zimbabwe", pop: 16.3, co2: 10, cons: null, hist: 0.55 }
};

/**
 * World totals (2022)
 */
const WORLD_TOTALS = {
  population: 7951,    // millions
  co2: 37150,          // Mt CO2 (territorial)
  cons: 37150,         // Mt CO2 (consumption = territorial globally)
  hist: 1740           // Gt CO2 (cumulative 1850-2022)
};

/**
 * Calculate the per-capita world average for a given metric
 */
function getWorldPerCapita(metric) {
  if (metric === 'co2') return WORLD_TOTALS.co2 / WORLD_TOTALS.population;     // ~4.67 t/cap
  if (metric === 'cons') return WORLD_TOTALS.cons / WORLD_TOTALS.population;    // ~4.67 t/cap
  if (metric === 'hist') return WORLD_TOTALS.hist / WORLD_TOTALS.population * 1000; // Gt→Mt, ~0.219 Mt/million people... 
  return WORLD_TOTALS.co2 / WORLD_TOTALS.population;
}

/**
 * Get the CO2 budget ratio for a country.
 * ratio > 1 means overconsumption, < 1 means underconsumption.
 * 
 * @param {string} isoCode - ISO 3166-1 numeric code
 * @param {string} metric - 'co2', 'cons', or 'hist'
 * @returns {number|null} ratio, or null if no data
 */
function getBudgetRatio(isoCode, metric) {
  const country = CO2_DATA[isoCode];
  if (!country) return null;

  let countryValue;
  let worldValue;
  
  if (metric === 'co2') {
    countryValue = country.co2;
    worldValue = WORLD_TOTALS.co2;
  } else if (metric === 'cons') {
    countryValue = country.cons || country.co2; // fallback to territorial
    worldValue = WORLD_TOTALS.cons;
  } else if (metric === 'hist') {
    if (!country.hist) return null;
    // Historical: Gt for country, Gt for world — convert to same units
    countryValue = country.hist * 1000; // Gt → Mt for consistent division
    worldValue = WORLD_TOTALS.hist * 1000;
  } else {
    return null;
  }

  if (!countryValue || !country.pop) return null;

  // ratio = (country per capita) / (world per capita)
  //       = (countryValue / country.pop) / (worldValue / WORLD_TOTALS.population)
  const countryPerCapita = countryValue / country.pop;
  const worldPerCapita = worldValue / WORLD_TOTALS.population;
  
  return countryPerCapita / worldPerCapita;
}

/**
 * Get formatted stats for a country
 */
function getCountryStats(isoCode, metric) {
  const country = CO2_DATA[isoCode];
  if (!country) return null;

  const ratio = getBudgetRatio(isoCode, metric);
  
  let metricValue, metricPerCapita, worldPerCapita, metricLabel, unit;

  if (metric === 'co2') {
    metricValue = country.co2;
    metricPerCapita = country.co2 / country.pop;
    worldPerCapita = WORLD_TOTALS.co2 / WORLD_TOTALS.population;
    metricLabel = 'Territorial Emissions';
    unit = 't CO₂/year';
  } else if (metric === 'cons') {
    metricValue = country.cons || country.co2;
    metricPerCapita = metricValue / country.pop;
    worldPerCapita = WORLD_TOTALS.cons / WORLD_TOTALS.population;
    metricLabel = 'Consumption Emissions';
    unit = 't CO₂/year';
  } else if (metric === 'hist') {
    metricValue = country.hist ? country.hist * 1000 : null;
    metricPerCapita = metricValue ? metricValue / country.pop : null;
    worldPerCapita = (WORLD_TOTALS.hist * 1000) / WORLD_TOTALS.population;
    metricLabel = 'Historical Cumulative';
    unit = 't CO₂ total';
  }

  return {
    name: country.name,
    population: country.pop,
    ratio: ratio,
    metricValue: metricValue,
    metricPerCapita: metricPerCapita,
    worldPerCapita: worldPerCapita,
    metricLabel: metricLabel,
    unit: unit,
    co2: country.co2,
    cons: country.cons,
    hist: country.hist
  };
}
