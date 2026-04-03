/**
 * CO2 Budget Map - Main Application
 * 
 * An interactive world map that scales countries based on their CO2 emissions
 * relative to a fair per-capita budget.
 */

// ============================================================================
// Utility Helpers
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS when inserting into innerHTML.
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Debounce a function so it only fires after a pause in calls.
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ============================================================================
// Named Constants
// ============================================================================

const LEGEND_STEPS = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10.0, 12.0];
const LEGEND_LABELS = new Map([[0.1, '0.1\u00d7'], [0.5, '0.5\u00d7'], [1.0, '1\u00d7'], [2.0, '2\u00d7'], [5.0, '5\u00d7'], [12.0, '12\u00d7']]);
const VALID_METRICS = ['paris', 'paris2', 'co2', 'cons', 'hist'];
const MIN_SCALE_RATIO = 0.01;
const MERCATOR_LAT_LIMIT = 85;
const DEBOUNCE_RENDER_MS = 60;

// ============================================================================
// Mercator Projection Helpers
// ============================================================================

const EARTH_RADIUS = 6378137;

function toMercator(lng, lat) {
  const x = EARTH_RADIUS * lng * Math.PI / 180;
  // Clamp latitude to avoid infinity at poles
  const clampedLat = Math.max(-MERCATOR_LAT_LIMIT, Math.min(MERCATOR_LAT_LIMIT, lat));
  const clampedLatRad = clampedLat * Math.PI / 180;
  const y = EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + clampedLatRad / 2));
  return [x, y];
}

function fromMercator(x, y) {
  const lng = (x / EARTH_RADIUS) * 180 / Math.PI;
  const lat = (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * 180 / Math.PI;
  return [lng, lat];
}

// ============================================================================
// Antimeridian Fix (Russia, Fiji, etc.)
// ============================================================================

/**
 * Check if a polygon ring crosses the antimeridian (±180° longitude).
 */
function doesRingCrossAntimeridian(ring) {
  for (let i = 0; i < ring.length - 1; i++) {
    if (Math.abs(ring[i][0] - ring[i + 1][0]) > 180) return true;
  }
  return false;
}

/**
 * For a ring that crosses the antimeridian, shift coordinates so they
 * are continuous. Uses the provided shiftEast flag to determine direction.
 */
function normalizeRingAcrossAntimeridian(ring, shiftEast) {
  if (!doesRingCrossAntimeridian(ring)) return ring;

  if (shiftEast) {
    // Shift western (negative) points by +360 to join eastern side
    return ring.map(c => c[0] < -90 ? [c[0] + 360, c[1]] : c);
  } else {
    // Shift eastern (positive) points by -360 to join western side
    return ring.map(c => c[0] > 90 ? [c[0] - 360, c[1]] : c);
  }
}

/**
 * Determine the dominant hemisphere for an entire feature by counting
 * all coordinates across all polygons.
 */
function featureDominantSide(geometry) {
  const polygons = geometry.type === 'MultiPolygon'
    ? geometry.coordinates : [geometry.coordinates];
  let east = 0, west = 0;
  for (const polygon of polygons) {
    for (const coord of polygon[0]) {
      if (coord[0] > 0) east++;
      else if (coord[0] < 0) west++;
    }
  }
  return east >= west; // true = shift toward east (shift negatives by +360)
}

/**
 * Fix all antimeridian-crossing polygons in a GeoJSON FeatureCollection.
 * Instead of splitting, shifts coordinates so each polygon is continuous.
 * The shift direction is determined per-feature so all sub-polygons
 * of a country (e.g. Russia) shift consistently.
 * Leaflet handles coordinates outside [-180, 180] correctly.
 */
function fixAntimeridian(geojson) {
  return {
    ...geojson,
    features: geojson.features.map(feature => {
      const geom = feature.geometry;
      if (!geom) return feature;

      // Check if any ring crosses the antimeridian
      const polygons = geom.type === 'MultiPolygon'
        ? geom.coordinates
        : geom.type === 'Polygon' ? [geom.coordinates] : null;
      if (!polygons) return feature;

      const hasCrossing = polygons.some(p => doesRingCrossAntimeridian(p[0]));
      if (!hasCrossing) return feature;

      // Determine shift direction from the whole feature
      const shiftEast = featureDominantSide(geom);

      if (geom.type === 'Polygon') {
        return {
          ...feature,
          geometry: {
            ...geom,
            coordinates: geom.coordinates.map(r => normalizeRingAcrossAntimeridian(r, shiftEast))
          }
        };
      }

      if (geom.type === 'MultiPolygon') {
        return {
          ...feature,
          geometry: {
            ...geom,
            coordinates: geom.coordinates.map(polygon =>
              doesRingCrossAntimeridian(polygon[0])
                ? polygon.map(r => normalizeRingAcrossAntimeridian(r, shiftEast))
                : polygon
            )
          }
        };
      }

      return feature;
    })
  };
}

// ============================================================================
// Geometry Scaling
// ============================================================================

/**
 * Calculate the centroid of a polygon ring in Mercator coordinates.
 */
function ringCentroidMercator(ring) {
  let sumX = 0, sumY = 0, count = 0;
  for (const coord of ring) {
    const [mx, my] = toMercator(coord[0], coord[1]);
    sumX += mx;
    sumY += my;
    count++;
  }
  return [sumX / count, sumY / count];
}

/**
 * Scale a single ring around a centroid in Mercator space.
 */
function scaleRing(ring, centroid, scaleFactor) {
  return ring.map(coord => {
    const [mx, my] = toMercator(coord[0], coord[1]);
    const newX = centroid[0] + scaleFactor * (mx - centroid[0]);
    const newY = centroid[1] + scaleFactor * (my - centroid[1]);
    const [newLng, newLat] = fromMercator(newX, newY);
    // Clamp latitude so scaled polygons don't exceed Mercator bounds
    return [newLng, Math.max(-MERCATOR_LAT_LIMIT, Math.min(MERCATOR_LAT_LIMIT, newLat))];
  });
}

/**
 * Scale a GeoJSON feature's geometry by a given area ratio.
 * The linear scale factor is sqrt(ratio) since area ~ scale^2.
 * Each polygon is scaled from its own centroid (not from a single feature centroid)
 * to avoid extreme coordinate shifts for countries with far-flung territories
 * (e.g. US with Alaska/Hawaii, Russia with Chukotka, France with overseas).
 */
function scaleFeature(feature, ratio) {
  if (ratio === null || ratio === undefined || !isFinite(ratio)) return feature;
  if (ratio <= 0) ratio = MIN_SCALE_RATIO; // prevent zero/negative

  const scaleFactor = Math.sqrt(ratio);
  const geometry = feature.geometry;

  let newCoordinates;

  if (geometry.type === 'Polygon') {
    const centroid = ringCentroidMercator(geometry.coordinates[0]);
    newCoordinates = geometry.coordinates.map(ring =>
      scaleRing(ring, centroid, scaleFactor)
    );
  } else if (geometry.type === 'MultiPolygon') {
    // Use the centroid of the largest polygon for all parts so that
    // small coastal islands scale together with the main landmass,
    // avoiding gaps between them.
    let largestArea = -1;
    let sharedCentroid = null;
    for (const polygon of geometry.coordinates) {
      let area = 0;
      const ring = polygon[0];
      for (let i = 0, n = ring.length; i < n; i++) {
        const j = (i + 1) % n;
        area += ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1];
      }
      area = Math.abs(area);
      if (area > largestArea) {
        largestArea = area;
        sharedCentroid = ringCentroidMercator(ring);
      }
    }
    newCoordinates = geometry.coordinates.map(polygon => {
      return polygon.map(ring => scaleRing(ring, sharedCentroid, scaleFactor));
    });
  } else {
    return feature;
  }

  return {
    ...feature,
    geometry: {
      ...geometry,
      coordinates: newCoordinates
    }
  };
}

// ============================================================================
// Color Scale
// ============================================================================

/**
 * Linearly interpolate between color stops defined as [value, r, g, b].
 */
function interpolateStops(value, stops) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [v0, r0, g0, b0] = stops[i];
    const [v1, r1, g1, b1] = stops[i + 1];
    if (value <= v1) {
      const t = (value - v0) / (v1 - v0);
      return `rgb(${Math.round(r0 + (r1 - r0) * t)}, ${Math.round(g0 + (g1 - g0) * t)}, ${Math.round(b0 + (b1 - b0) * t)})`;
    }
  }
  const last = stops[stops.length - 1];
  return `rgb(${last[1]}, ${last[2]}, ${last[3]})`;
}

/**
 * Get color for a budget ratio using a multi-stop piecewise scale.
 *
 * More color stops in the 0.5–3× range give better differentiation
 * for countries that cluster near the budget line (e.g. Europe).
 * Range extends to 12× before saturating.
 *
 * Default: Green → Yellow → Orange → Red → Dark Red
 * Colorblind: Blue → White → Orange → Dark Brown (ColorBrewer safe)
 */
function getRatioColor(ratio) {
  if (ratio === null || ratio === undefined || !isFinite(ratio)) return '#888888';
  
  const r = Math.max(0.05, Math.min(ratio, 12));

  if (colorblindMode) {
    return interpolateStops(r, [
      [0.0,  33, 102, 172],   // deep blue
      [0.5, 103, 169, 207],   // medium blue
      [1.0, 245, 245, 245],   // near-white
      [1.5, 253, 208, 162],   // light peach
      [2.0, 245, 165,  80],   // orange
      [3.0, 215, 120,  30],   // dark orange
      [5.0, 179,  88,   6],   // brown
      [8.0, 127,  59,   8],   // dark brown
      [12.0, 84,  36,   5],   // very dark brown
    ]);
  }

  // Default: diverging green → yellow → red → burgundy
  return interpolateStops(r, [
    [0.0,  22, 160,  90],    // deep green
    [0.5,  80, 190, 110],    // medium green
    [1.0, 230, 210,  60],    // yellow (exactly at budget)
    [1.5, 245, 170,  50],    // light orange
    [2.0, 240, 130,  40],    // orange
    [3.0, 220,  70,  30],    // red-orange
    [5.0, 200,  20,  20],    // red
    [8.0, 150,  10,  30],    // dark red
    [12.0,100,   5,  20],    // burgundy
  ]);
}

// ============================================================================
// Application State
// ============================================================================

let map;
let geojsonData = null;
let countriesLayer = null;
let scaledLayer = null;
let currentMetric = 'paris';
let isScaled = false;
let colorblindMode = false;
let selectedCountryId = null;
let selectedScaled = false;
let highlightLayer = null;
let selectionOutlineLayer = null;
let rankingOpen = false;

// ============================================================================
// Map Initialization
// ============================================================================

async function initApp() {
  // Create Leaflet map
  map = L.map('map', {
    center: [20, 0],
    zoom: 3,
    minZoom: 2,
    maxZoom: 8,
    zoomControl: false,
    worldCopyJump: true
  });

  // Add zoom control to bottom-right
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // CartoDB Positron (light minimal tiles — no labels)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Add labels on top (separate layer so they appear above our polygons)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20,
    pane: 'overlayPane'
  }).addTo(map);

  // Show loading state
  showLoading(true);

  try {
    // Load country boundaries
    await loadGeoJSON();
    // Render initial view
    renderCountries();
    // Set up event listeners
    setupControls();
  } catch (error) {
    console.error('Failed to initialize:', error);
    document.getElementById('loading').innerHTML =
      `<p style="color:#e94560">${t('loadError')}</p>`;
  }

  showLoading(false);
}

/**
 * Load GeoJSON country boundaries from CDN
 */
async function loadGeoJSON() {
  const response = await fetch(
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json'
  );
  if (!response.ok) throw new Error('Failed to fetch map data');
  
  const topology = await response.json();
  geojsonData = topojson.feature(topology, topology.objects.countries);

  // Assign id from properties.name for features without a numeric id (e.g. Somaliland, Kosovo)
  geojsonData.features.forEach(f => {
    if (f.id == null && f.properties && f.properties.name) {
      f.id = f.properties.name;
    }
  });

  // Fix Russia, Fiji etc. — split polygons that cross the antimeridian
  geojsonData = fixAntimeridian(geojsonData);
  
  // Also extract borders for nice outlines
  // geojsonData.borders = topojson.mesh(topology, topology.objects.countries, (a, b) => a !== b);
}

// ============================================================================
// Rendering
// ============================================================================

function renderCountries() {
  // Remove existing layers
  if (countriesLayer) map.removeLayer(countriesLayer);
  if (scaledLayer) map.removeLayer(scaledLayer);
  if (highlightLayer) map.removeLayer(highlightLayer);
  if (selectionOutlineLayer) map.removeLayer(selectionOutlineLayer);

  const features = geojsonData.features.map(feature => {
    const ratio = getBudgetRatio(feature.id, currentMetric);
    if (ratio !== null && (isScaled || (selectedScaled && feature.id === selectedCountryId))) {
      return scaleFeature(feature, ratio);
    }
    return feature;
  });

  const scaledGeoJSON = { type: 'FeatureCollection', features };

  scaledLayer = L.geoJSON(scaledGeoJSON, {
    style: feature => {
      const ratio = getBudgetRatio(feature.id, currentMetric);
      const isSelected = feature.id === selectedCountryId;
      return {
        fillColor: getRatioColor(ratio),
        fillOpacity: isSelected ? 0.9 : 0.75,
        color: '#333333',
        weight: 0.5,
        opacity: 0.6
      };
    },
    onEachFeature: (feature, layer) => {
      // Tooltip
      const country = CO2_DATA[feature.id];
      if (country) {
        const ratio = getBudgetRatio(feature.id, currentMetric);
        const ratioText = ratio ? `${ratio.toFixed(2)}×` : 'N/A';
        let perCapita, unit;
        if (currentMetric === 'hist') {
          perCapita = country.hist != null ? (country.hist * 1000) / country.pop : null;
          unit = t('unitTCumulCap');
        } else if (currentMetric === 'cons' || currentMetric === 'paris' || currentMetric === 'paris2') {
          const val = country.cons != null ? country.cons : country.co2;
          perCapita = val != null ? val / country.pop : null;
          unit = t('unitTCO2Cap');
        } else {
          perCapita = country.co2 != null ? country.co2 / country.pop : null;
          unit = t('unitTCO2Cap');
        }
        const pcText = perCapita != null ? formatCompact(perCapita, 1) : 'N/A';
        layer.bindTooltip(
          `<strong>${escapeHtml(tn(country.name))}</strong><br>` +
          `${escapeHtml(pcText)} ${escapeHtml(unit)}<br>` +
          `${escapeHtml(t('budgetRatioLabel'))}: ${escapeHtml(ratioText)}`,
          { sticky: true, className: 'country-tooltip' }
        );
      } else if (TERRITORY_NAMES[feature.id]) {
        const name = escapeHtml(tn(TERRITORY_NAMES[feature.id]));
        const parent = TERRITORY_PARENTS[feature.id];
        const note = parent
          ? escapeHtml(t('tooltipDataUnder')(tn(parent)))
          : escapeHtml(t('tooltipNoData'));
        layer.bindTooltip(
          `<strong>${name}</strong><br>${note}`,
          { sticky: true, className: 'country-tooltip' }
        );
      }

      // Click handler
      layer.on('click', () => selectCountry(feature.id));
    }
  }).addTo(map);

  // Ghost outline: show original borders when a country is scaled
  if (selectedCountryId && selectedScaled) {
    const ratio = getBudgetRatio(selectedCountryId, currentMetric);
    if (ratio !== null && ratio !== 1) {
      const originalFeature = geojsonData.features.find(f => f.id === selectedCountryId);
      if (originalFeature) {
        highlightLayer = L.geoJSON(originalFeature, {
          style: {
            fillColor: getRatioColor(ratio),
            fillOpacity: 0.15,
            color: '#000000',
            weight: 2,
            opacity: 0.7,
            dashArray: '6,4'
          },
          interactive: false
        }).addTo(map);
      }
    }

    // White outline on the scaled geometry so all parts are visibly outlined
    const scaledFeature = features.find(f => f.id === selectedCountryId);
    if (scaledFeature) {
      selectionOutlineLayer = L.geoJSON(scaledFeature, {
        style: {
          fill: false,
          color: '#ffffff',
          weight: 2.5,
          opacity: 1
        },
        interactive: false
      }).addTo(map);
    }
  }
}

function selectCountry(isoCode) {
  selectedCountryId = isoCode;
  selectedScaled = true;
  renderCountries();
  showInfoPanel(isoCode);
  if (rankingOpen) buildRanking();
}

function deselectCountry() {
  selectedCountryId = null;
  selectedScaled = false;
  renderCountries();
  hideInfoPanel();
  if (rankingOpen) buildRanking();
}

function toggleSelectedScale() {
  selectedScaled = !selectedScaled;
  renderCountries();
  if (selectedCountryId) showInfoPanel(selectedCountryId);
}

// ============================================================================
// Info Panel
// ============================================================================

function showInfoPanel(isoCode) {
  const panel = document.getElementById('info-panel');
  const stats = getCountryStats(isoCode, currentMetric);
  
  if (!stats) {
    const territoryName = escapeHtml(tn(TERRITORY_NAMES[isoCode]) || t('unknownTerritory')(isoCode));
    const parent = TERRITORY_PARENTS[isoCode];
    const parentNote = parent
      ? `<p>${t('dataIncludedUnder')(escapeHtml(tn(parent)))}</p>`
      : `<p>${escapeHtml(t('noDataAvailable'))}</p>`;
    panel.innerHTML = `
      <div class="panel-content">
        <button class="panel-close" onclick="deselectCountry()" title="${escapeHtml(t('close'))}">&times;</button>
        <button class="panel-minimize" onclick="toggleInfoMinimize()" title="${escapeHtml(t('minimize'))}">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 11l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <h2>${territoryName}</h2>
        <div class="panel-body">
          ${parentNote}
        </div>
      </div>`;
    panel.classList.add('visible');
    panel.classList.remove('minimized');
    return;
  }

  const ratio = stats.ratio;
  const ratioPercent = ratio ? (ratio * 100).toFixed(0) : 'N/A';
  const ratioClass = ratio > 1 ? 'over-budget' : 'under-budget';
  const ratioSign = ratio > 1 ? '+' : '';
  const overUnder = ratio > 1 ? t('overTarget') : t('underTarget');
  const diffPercent = ratio ? Math.abs((ratio - 1) * 100).toFixed(0) : 'N/A';

  // Build metric rows
  const metricRows = [];
  
  // Territorial
  const terrPC = stats.co2 / stats.population;
  metricRows.push({
    label: t('metricTerritorial'),
    value: `${formatCompact(terrPC, 1)} ${t('unitTCap')}`,
    total: `${formatCompact(stats.co2, 0)} Mt`,
    active: currentMetric === 'co2'
  });

  // Consumption
  if (stats.cons) {
    const consPC = stats.cons / stats.population;
    metricRows.push({
      label: t('metricConsumption'),
      value: `${formatCompact(consPC, 1)} ${t('unitTCap')}`,
      total: `${formatCompact(stats.cons, 0)} Mt`,
      active: currentMetric === 'cons'
    });
  }

  // Historical
  if (stats.hist) {
    const histPC = (stats.hist * 1000) / stats.population;
    metricRows.push({
      label: t('metricHistorical'),
      value: `${formatCompact(histPC, 0)} ${t('unitTCap')}`,
      total: `${formatCompact(stats.hist, 1)} Gt`,
      active: currentMetric === 'hist'
    });
  }

  // Paris 1.5°C
  if (stats.co2) {
    const parisVal = stats.cons != null ? stats.cons : stats.co2;
    const parisPC = parisVal / stats.population;
    const parisAllowance = PARIS_BUDGET.perCapita;
    metricRows.push({
      label: t('metricParis'),
      value: `${formatCompact(parisPC, 1)} vs ${formatCompact(parisAllowance, 1)} ${t('unitTCap')}`,
      total: `${formatCompact(parisVal, 0)} Mt`,
      active: currentMetric === 'paris'
    });
  }

  // Paris 2.0°C
  if (stats.co2) {
    const parisVal = stats.cons != null ? stats.cons : stats.co2;
    const parisPC = parisVal / stats.population;
    const paris2Allowance = PARIS_2_BUDGET.perCapita;
    metricRows.push({
      label: t('metricParis2'),
      value: `${formatCompact(parisPC, 1)} vs ${formatCompact(paris2Allowance, 1)} ${t('unitTCap')}`,
      total: `${formatCompact(parisVal, 0)} Mt`,
      active: currentMetric === 'paris2'
    });
  }

  const isParis = currentMetric === 'paris' || currentMetric === 'paris2';
  const activeParisBudget = currentMetric === 'paris2' ? PARIS_2_BUDGET : PARIS_BUDGET;
  const parisLabel = currentMetric === 'paris2' ? '2.0°C' : '1.5°C';
  const worldPC = isParis
    ? formatCompact(activeParisBudget.perCapita, 1)
    : formatCompact(WORLD_TOTALS.co2 / WORLD_TOTALS.population, 1);
  const worldPCLabel = isParis ? t('parisTCap')(parisLabel) : t('worldAvgTCap');

  panel.innerHTML = `
    <div class="panel-content">
      <button class="panel-close" onclick="deselectCountry()" title="${escapeHtml(t('close'))}">&times;</button>
      <button class="panel-minimize" onclick="toggleInfoMinimize()" title="${escapeHtml(t('minimize'))}">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 11l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <h2>${escapeHtml(tn(stats.name))}</h2>

      <div class="panel-body">
      ${!isScaled ? `
      <button class="resize-btn ${selectedScaled ? 'active' : ''}" onclick="toggleSelectedScale()">
        ${selectedScaled ? t('resetToActual') : t('resizeToBudget')}
      </button>
      ` : ''}
      
      <div class="stat-hero ${ratioClass}">
        <div class="ratio-value">${ratioPercent}%</div>
        <div class="ratio-label">${isParis ? t('ofParisBudget')(parisLabel) : t('ofFairBudget')}</div>
        <div class="ratio-detail">${diffPercent}% ${overUnder} ${isParis ? t('parisTarget') : t('fairShare')}</div>
      </div>

      <div class="stat-grid">
        <div class="stat-item">
          <div class="stat-number">${formatCompact(stats.population, 1)}M</div>
          <div class="stat-label">${escapeHtml(t('population'))}</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${stats.metricPerCapita ? formatCompact(stats.metricPerCapita, 1) : 'N/A'}</div>
          <div class="stat-label">${escapeHtml(t('tCO2PerCapita'))}</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${worldPC}</div>
          <div class="stat-label">${escapeHtml(worldPCLabel)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${ratio ? formatCompact(ratio, 2) + '\u00d7' : 'N/A'}</div>
          <div class="stat-label">${escapeHtml(t('scaleFactor'))}</div>
        </div>
      </div>

      <h3>${t('emissionsBreakdown')}</h3>
      <table class="metrics-table">
        <thead>
          <tr>
            <th>${t('metric')}</th>
            <th>${t('perCapita')}</th>
            <th>${t('total')}</th>
          </tr>
        </thead>
        <tbody>
          ${metricRows.map(r => `
            <tr class="${r.active ? 'active-metric' : ''}">
              <td>${r.label}</td>
              <td>${r.value}</td>
              <td>${r.total}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="budget-bar-container">
        <div class="budget-bar-label">${t('fairShareUsage')}</div>
        <div class="budget-bar">
          <div class="budget-bar-fill ${ratioClass}" style="width: ${Math.min(ratio / 12 * 100, 100)}%">
          </div>
          <div class="budget-bar-marker" style="left: ${1 / 12 * 100}%"></div>
        </div>
        <div class="budget-bar-scale">
          <span style="left:0%">0\u00d7</span>
          <span style="left:${1/12*100}%">1\u00d7</span>
          <span style="left:${3/12*100}%">3\u00d7</span>
          <span style="left:${6/12*100}%">6\u00d7</span>
          <span style="left:${9/12*100}%">9\u00d7</span>
          <span style="left:100%">12\u00d7</span>
        </div>
      </div>

      <div class="explanation">
        ${isParis ? `
        ${t('parisExplanation')(parisLabel, activeParisBudget.perCapita.toFixed(1), tn(stats.name), ratio ? ratio.toFixed(1) + '×' : 'N/A', ratio ? Math.max(1, Math.round(activeParisBudget.yearsLeft / ratio)) : '?', activeParisBudget.yearsLeft)}
        <p class="data-note">${stats.usedFallback
          ? t('consFallbackNote')
          : t('consNote')}</p>
        ` : currentMetric === 'cons' ? `
        ${t('consExplanation')(tn(stats.name), ratio > 1 ? t('needToReduce') : t('couldIncrease'), diffPercent)}
        <p class="data-note">${stats.usedFallback
          ? t('consFallbackNote')
          : t('consNote')}</p>
        ` : `
        ${t('defaultExplanation')(tn(stats.name), ratio > 1 ? t('needToReduce') : t('couldIncrease'), diffPercent, ratioPercent)}
        `}
      </div>
      </div>
    </div>
  `;

  panel.classList.add('visible');
  panel.classList.remove('minimized');
  updateLegendVisibility();
  updateHeaderSummary();

  // Auto-collapse header on mobile to maximize map space
  if (window.innerWidth <= 640) {
    document.querySelector('.header').classList.add('collapsed');
  }
}

function hideInfoPanel() {
  document.getElementById('info-panel').classList.remove('visible');
  document.getElementById('info-panel').classList.remove('minimized');
  updateLegendVisibility();
}

function toggleInfoMinimize() {
  document.getElementById('info-panel').classList.toggle('minimized');
}

// ============================================================================
// Controls
// ============================================================================

function setupControls() {
  // Debounced render for rapid interactions
  const debouncedRender = debounce(() => {
    renderCountries();
    if (selectedCountryId) showInfoPanel(selectedCountryId);
    if (rankingOpen) buildRanking();
  }, DEBOUNCE_RENDER_MS);

  // Metric toggle buttons
  document.querySelectorAll('.metric-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!VALID_METRICS.includes(btn.dataset.metric)) return;
      document.querySelectorAll('.metric-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      currentMetric = btn.dataset.metric;
      debouncedRender();
      updateHeaderSummary();
    });
  });

  // Scale toggle
  document.getElementById('scale-toggle').addEventListener('change', (e) => {
    isScaled = e.target.checked;
    selectedScaled = false;
    document.getElementById('toggle-label').textContent = isScaled ? t('budgetView') : t('actualSize');
    renderCountries();
    if (selectedCountryId) showInfoPanel(selectedCountryId);
    updateHeaderSummary();
  });

  // Colorblind toggle
  document.getElementById('colorblind-toggle').addEventListener('change', (e) => {
    colorblindMode = e.target.checked;
    document.body.classList.toggle('colorblind', colorblindMode);
    renderCountries();
    createLegend();
    if (selectedCountryId) showInfoPanel(selectedCountryId);
    if (rankingOpen) buildRanking();
    updateHeaderSummary();
  });

  // Ranking toggle
  document.getElementById('ranking-toggle').addEventListener('click', toggleRanking);
  document.getElementById('ranking-close').addEventListener('click', toggleRanking);

  // Click on map background to deselect
  map.on('click', (e) => {
    if (!e.originalEvent.defaultPrevented) {
      // Only deselect if clicking on the background, not on a country
    }
  });
}

// ============================================================================
// UI Helpers
// ============================================================================

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// ============================================================================
// Legend
// ============================================================================

function createLegend() {
  const legend = document.getElementById('legend');
  
  let html = '<div class="legend-title">' + escapeHtml(t('budgetRatio')) + '</div>';
  html += '<div class="legend-bar">';
  for (const val of LEGEND_STEPS) {
    html += `<div class="legend-step" style="background-color: ${getRatioColor(val)}" title="${val}\u00d7" aria-label="Budget ratio ${val}\u00d7"></div>`;
  }
  html += '</div>';
  html += '<div class="legend-ticks">';
  for (const val of LEGEND_STEPS) {
    const label = LEGEND_LABELS.get(val) || '';
    const isBold = val === 1.0;
    html += `<span class="legend-tick${isBold ? ' legend-tick-bold' : ''}">${label}</span>`;
  }
  html += '</div>';
  
  legend.innerHTML = html;
}

// ============================================================================
// Ranking Panel
// ============================================================================

function buildRanking() {
  const list = document.getElementById('ranking-list');
  const entries = [];

  for (const [id, d] of Object.entries(CO2_DATA)) {
    if (!d.pop) continue;
    const ratio = getBudgetRatio(id, currentMetric);
    if (ratio == null) continue;

    let perCapita, unit;
    if (currentMetric === 'hist') {
      perCapita = d.hist != null ? (d.hist * 1000) / d.pop : null;
      unit = t('unitTCumulCap');
    } else if (currentMetric === 'cons' || currentMetric === 'paris' || currentMetric === 'paris2') {
      const val = d.cons != null ? d.cons : d.co2;
      perCapita = val != null ? val / d.pop : null;
      unit = t('unitTCap');
    } else {
      perCapita = d.co2 != null ? d.co2 / d.pop : null;
      unit = t('unitTCap');
    }

    entries.push({ id, name: tn(d.name), ratio, perCapita, unit });
  }

  // Sort worst (highest ratio) first
  entries.sort((a, b) => b.ratio - a.ratio);

  let html = '';
  entries.forEach((e, i) => {
    const rank = i + 1;
    const color = getRatioColor(e.ratio);
    const pcText = e.perCapita != null ? formatCompact(e.perCapita, 1) : 'N/A';
    const isSelected = e.id === selectedCountryId;
    html += `<div class="ranking-item${isSelected ? ' selected' : ''}" data-id="${escapeHtml(e.id)}">
      <span class="ranking-rank">${rank}</span>
      <span class="ranking-color" style="background:${color}"></span>
      <span class="ranking-name">${escapeHtml(e.name)}</span>
      <span class="ranking-value">${escapeHtml(pcText)} ${escapeHtml(e.unit)}</span>
    </div>`;
  });

  list.innerHTML = html;

  // Click handlers
  list.querySelectorAll('.ranking-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      selectCountry(id);
      panToCountry(id);
      buildRanking();
    });
  });

  // Scroll selected into view
  const selected = list.querySelector('.ranking-item.selected');
  if (selected) selected.scrollIntoView({ block: 'nearest' });
}

function toggleRanking() {
  rankingOpen = !rankingOpen;
  document.getElementById('ranking-panel').classList.toggle('visible', rankingOpen);
  document.getElementById('ranking-toggle').classList.toggle('active', rankingOpen);
  if (rankingOpen) buildRanking();
  updateLegendVisibility();
}

function updateLegendVisibility() {
  const legend = document.getElementById('legend');
  const infoOpen = document.getElementById('info-panel').classList.contains('visible');
  const isSmallScreen = window.innerWidth <= 640;
  legend.style.display = (isSmallScreen && (infoOpen || rankingOpen)) ? 'none' : '';
}

function panToCountry(isoCode) {
  if (!geojsonData) return;
  const feature = geojsonData.features.find(f => f.id === isoCode);
  if (!feature) return;
  const layer = L.geoJSON(feature);
  map.flyToBounds(layer.getBounds(), { duration: 0.6, maxZoom: 5, padding: [40, 40] });
}

// ============================================================================
// Bootstrap
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  createLegend();
  initApp();

  // Keep --header-height in sync when header wraps
  const header = document.querySelector('.header');
  const ro = new ResizeObserver(() => {
    document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
    if (map) map.invalidateSize();
  });
  ro.observe(header);

  // Collapsible header
  const collapseBtn = document.getElementById('header-collapse');
  collapseBtn.addEventListener('click', () => {
    header.classList.toggle('collapsed');
  });

  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // Apply initial language (auto-detect)
  document.documentElement.lang = currentLang;
  document.title = t('pageTitle');
  applyStaticTranslations();

  // Settings summary
  updateHeaderSummary();
});

function updateHeaderSummary() {
  const metrics = t('summaryMetrics');
  const metric = metrics[currentMetric] || currentMetric;
  const scaled = document.getElementById('scale-toggle').checked ? t('summaryScaled') : t('summaryActual');
  const cb = document.getElementById('colorblind-toggle').checked ? ' · ' + t('summaryCB') : '';
  document.getElementById('header-summary').textContent = `${metric} · ${scaled}${cb}`;
}
