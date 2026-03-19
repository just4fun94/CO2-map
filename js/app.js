/**
 * CO2 Budget Map - Main Application
 * 
 * An interactive world map that scales countries based on their CO2 emissions
 * relative to a fair per-capita budget.
 */

// ============================================================================
// Mercator Projection Helpers
// ============================================================================

const EARTH_RADIUS = 6378137;

function toMercator(lng, lat) {
  const x = EARTH_RADIUS * lng * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  // Clamp latitude to avoid infinity at poles
  const clampedLat = Math.max(-85, Math.min(85, lat));
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
    const [newLng, lat] = fromMercator(newX, newY);
    return [newLng, lat];
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
  if (ratio === null || ratio === undefined || isNaN(ratio)) return feature;
  if (ratio <= 0) ratio = 0.01; // prevent zero/negative

  const scaleFactor = Math.sqrt(ratio);
  const geometry = feature.geometry;

  let newCoordinates;

  if (geometry.type === 'Polygon') {
    const centroid = ringCentroidMercator(geometry.coordinates[0]);
    newCoordinates = geometry.coordinates.map(ring =>
      scaleRing(ring, centroid, scaleFactor)
    );
  } else if (geometry.type === 'MultiPolygon') {
    newCoordinates = geometry.coordinates.map(polygon => {
      const centroid = ringCentroidMercator(polygon[0]);
      return polygon.map(ring => scaleRing(ring, centroid, scaleFactor));
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
 * Get color for a budget ratio.
 * Default: Green → Yellow → Red diverging scale
 * Colorblind mode: Blue → White → Orange/Brown (ColorBrewer safe)
 */
function getRatioColor(ratio) {
  if (ratio === null || ratio === undefined) return '#888888';
  
  const r = Math.max(0.05, Math.min(ratio, 8));

  if (colorblindMode) {
    if (r <= 1) {
      const t = r;
      const red = Math.round(33 + (245 - 33) * t);
      const green = Math.round(102 + (245 - 102) * t);
      const blue = Math.round(172 + (245 - 172) * t);
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      const t = Math.min((r - 1) / 3, 1);
      const red = Math.round(245 + (179 - 245) * t);
      const green = Math.round(245 + (88 - 245) * t);
      const blue = Math.round(245 + (6 - 245) * t);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  }

  // Default: Green → Yellow → Red
  if (r <= 1) {
    const t = r;
    const red = Math.round(34 + (230 - 34) * t);
    const green = Math.round(170 + (195 - 170) * t);
    const blue = Math.round(100 + (50 - 100) * t);
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    const t = Math.min((r - 1) / 3, 1);
    const red = Math.round(230 + (200 - 230) * t);
    const green = Math.round(195 - 195 * t);
    const blue = Math.round(50 - 50 * t);
    return `rgb(${red}, ${green}, ${blue})`;
  }
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

  // CartoDB Positron (light minimal tiles)
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
      '<p style="color:#e94560">Failed to load map data. Please refresh the page.</p>';
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
        color: isSelected ? '#ffffff' : '#333333',
        weight: isSelected ? 2.5 : 0.5,
        opacity: isSelected ? 1 : 0.6
      };
    },
    onEachFeature: (feature, layer) => {
      // Tooltip
      const country = CO2_DATA[feature.id];
      if (country) {
        const ratio = getBudgetRatio(feature.id, currentMetric);
        const ratioText = ratio ? `${ratio.toFixed(2)}×` : 'N/A';
        const perCapita = country.co2 / country.pop;
        layer.bindTooltip(
          `<strong>${country.name}</strong><br>` +
          `${perCapita.toFixed(1)} t CO₂/cap<br>` +
          `Budget ratio: ${ratioText}`,
          { sticky: true, className: 'country-tooltip' }
        );
      }

      // Click handler
      layer.on('click', () => selectCountry(feature.id));
    }
  }).addTo(map);
}

function selectCountry(isoCode) {
  selectedCountryId = isoCode;
  selectedScaled = true;
  renderCountries();
  showInfoPanel(isoCode);
}

function deselectCountry() {
  selectedCountryId = null;
  selectedScaled = false;
  renderCountries();
  hideInfoPanel();
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
    panel.innerHTML = '<div class="panel-content"><p>No data available for this country.</p></div>';
    panel.classList.add('visible');
    return;
  }

  const ratio = stats.ratio;
  const ratioPercent = ratio ? (ratio * 100).toFixed(0) : 'N/A';
  const ratioClass = ratio > 1 ? 'over-budget' : 'under-budget';
  const ratioSign = ratio > 1 ? '+' : '';
  const overUnder = ratio > 1 ? 'over' : 'under';
  const diffPercent = ratio ? Math.abs((ratio - 1) * 100).toFixed(0) : 'N/A';

  // Build metric rows
  const metricRows = [];
  
  // Territorial
  const terrPC = stats.co2 / stats.population;
  metricRows.push({
    label: 'Territorial',
    value: `${terrPC.toFixed(1)} t/cap`,
    total: `${stats.co2.toFixed(0)} Mt`,
    active: currentMetric === 'co2'
  });

  // Consumption
  if (stats.cons) {
    const consPC = stats.cons / stats.population;
    metricRows.push({
      label: 'Consumption',
      value: `${consPC.toFixed(1)} t/cap`,
      total: `${stats.cons.toFixed(0)} Mt`,
      active: currentMetric === 'cons'
    });
  }

  // Historical
  if (stats.hist) {
    const histPC = (stats.hist * 1000) / stats.population;
    metricRows.push({
      label: 'Historical',
      value: `${histPC.toFixed(0)} t/cap`,
      total: `${stats.hist.toFixed(1)} Gt`,
      active: currentMetric === 'hist'
    });
  }

  // Paris 1.5°C
  if (stats.co2) {
    const parisPC = stats.co2 / stats.population;
    const parisAllowance = PARIS_BUDGET.perCapita;
    metricRows.push({
      label: 'Paris 1.5°C',
      value: `${parisPC.toFixed(1)} vs ${parisAllowance.toFixed(1)} t/cap`,
      total: `${stats.co2.toFixed(0)} Mt`,
      active: currentMetric === 'paris'
    });
  }

  // Paris 2.0°C
  if (stats.co2) {
    const parisPC = stats.co2 / stats.population;
    const paris2Allowance = PARIS_2_BUDGET.perCapita;
    metricRows.push({
      label: 'Paris 2.0°C',
      value: `${parisPC.toFixed(1)} vs ${paris2Allowance.toFixed(1)} t/cap`,
      total: `${stats.co2.toFixed(0)} Mt`,
      active: currentMetric === 'paris2'
    });
  }

  const isParis = currentMetric === 'paris' || currentMetric === 'paris2';
  const activeParisBudget = currentMetric === 'paris2' ? PARIS_2_BUDGET : PARIS_BUDGET;
  const parisLabel = currentMetric === 'paris2' ? '2.0°C' : '1.5°C';
  const worldPC = isParis
    ? activeParisBudget.perCapita.toFixed(1)
    : (WORLD_TOTALS.co2 / WORLD_TOTALS.population).toFixed(1);
  const worldPCLabel = isParis ? `Paris ${parisLabel} t/cap` : 'World avg t/cap';

  panel.innerHTML = `
    <div class="panel-content">
      <button class="panel-close" onclick="deselectCountry()" title="Close">&times;</button>
      <h2>${stats.name}</h2>

      ${!isScaled ? `
      <button class="resize-btn ${selectedScaled ? 'active' : ''}" onclick="toggleSelectedScale()">
        ${selectedScaled ? '↩ Reset to Actual Size' : '⬡ Resize to Budget'}
      </button>
      ` : ''}
      
      <div class="stat-hero ${ratioClass}">
        <div class="ratio-value">${ratioPercent}%</div>
        <div class="ratio-label">${isParis ? `of Paris ${parisLabel} budget` : 'of fair CO₂ budget used'}</div>
        <div class="ratio-detail">${diffPercent}% ${overUnder} ${isParis ? 'Paris target' : 'fair share'}</div>
      </div>

      <div class="stat-grid">
        <div class="stat-item">
          <div class="stat-number">${stats.population.toFixed(1)}M</div>
          <div class="stat-label">Population</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${stats.metricPerCapita ? stats.metricPerCapita.toFixed(1) : 'N/A'}</div>
          <div class="stat-label">t CO₂ per capita</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${worldPC}</div>
          <div class="stat-label">${worldPCLabel}</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${ratio ? ratio.toFixed(2) + '×' : 'N/A'}</div>
          <div class="stat-label">Scale factor</div>
        </div>
      </div>

      <h3>Emissions Breakdown</h3>
      <table class="metrics-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Per Capita</th>
            <th>Total</th>
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
        <div class="budget-bar-label">Fair share budget usage</div>
        <div class="budget-bar">
          <div class="budget-bar-fill ${ratioClass}" style="width: ${Math.min(ratio / 5 * 100, 100)}%">
          </div>
          <div class="budget-bar-marker" style="left: ${1 / 5 * 100}%"></div>
        </div>
        <div class="budget-bar-scale">
          <span>0×</span>
          <span>1×</span>
          <span>2×</span>
          <span>3×</span>
          <span>4×</span>
          <span>5×</span>
        </div>
      </div>

      <div class="explanation">
        ${isParis ? `
        <p>To stay within the ${parisLabel} Paris budget, each person can emit ~${activeParisBudget.perCapita.toFixed(1)} t/year.
        <strong>${stats.name}</strong> emits at <strong>${ratio ? ratio.toFixed(1) + '×' : 'N/A'}</strong> that rate.
        At this pace, it would exhaust its fair share of the remaining budget in 
        <strong>${ratio ? Math.max(1, Math.round(activeParisBudget.yearsLeft / ratio)) : '?'} years</strong> instead of ${activeParisBudget.yearsLeft}.</p>
        ` : `
        <p>If every person on Earth had an equal CO₂ budget, 
        <strong>${stats.name}</strong> would ${ratio > 1 ? 'need to reduce' : 'could increase'} 
        its emissions by <strong>${diffPercent}%</strong>.</p>
        <p>The country is shown at <strong>${ratioPercent}%</strong> of its actual geographic size 
        to reflect its emissions relative to a fair per-capita share.</p>
        `}
      </div>
    </div>
  `;

  panel.classList.add('visible');
}

function hideInfoPanel() {
  document.getElementById('info-panel').classList.remove('visible');
}

// ============================================================================
// Controls
// ============================================================================

function setupControls() {
  // Metric toggle buttons
  document.querySelectorAll('.metric-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.metric-btn.active').classList.remove('active');
      btn.classList.add('active');
      currentMetric = btn.dataset.metric;
      renderCountries();
      if (selectedCountryId) showInfoPanel(selectedCountryId);
    });
  });

  // Scale toggle
  document.getElementById('scale-toggle').addEventListener('change', (e) => {
    isScaled = e.target.checked;
    selectedScaled = false;
    document.getElementById('toggle-label').textContent = isScaled ? 'Budget View' : 'Actual Size';
    renderCountries();
    if (selectedCountryId) showInfoPanel(selectedCountryId);
  });

  // Colorblind toggle
  document.getElementById('colorblind-toggle').addEventListener('change', (e) => {
    colorblindMode = e.target.checked;
    document.body.classList.toggle('colorblind', colorblindMode);
    renderCountries();
    createLegend();
    if (selectedCountryId) showInfoPanel(selectedCountryId);
  });

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
  const steps = [0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0];
  
  let html = '<div class="legend-title">Budget Ratio</div><div class="legend-bar">';
  
  for (const val of steps) {
    html += `<div class="legend-step" style="background-color: ${getRatioColor(val)}" title="${val}×"></div>`;
  }
  
  html += '</div><div class="legend-labels"><span>Under budget</span><span>1×</span><span>Over budget</span></div>';
  legend.innerHTML = html;
}

// ============================================================================
// Bootstrap
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  createLegend();
  initApp();
});
