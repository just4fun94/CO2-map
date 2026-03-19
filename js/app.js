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
 * Interpolate latitude at the antimeridian crossing between two points.
 */
function interpolateLatAtAntimeridian(p1, p2) {
  const d1 = 180 - Math.abs(p1[0]);
  const d2 = 180 - Math.abs(p2[0]);
  const denom = d1 + d2;
  if (denom === 0) return (p1[1] + p2[1]) / 2;
  const t = d1 / denom;
  return p1[1] + t * (p2[1] - p1[1]);
}

/**
 * Split a ring that crosses the antimeridian into multiple rings,
 * each fully on one side.
 */
function splitRingAtAntimeridian(ring) {
  if (!doesRingCrossAntimeridian(ring)) return [ring];

  const segments = [];
  let current = [ring[0]];

  for (let i = 0; i < ring.length - 1; i++) {
    const p = ring[i];
    const next = ring[i + 1];

    if (Math.abs(p[0] - next[0]) > 180) {
      const crossLat = interpolateLatAtAntimeridian(p, next);
      const boundaryLng = p[0] > 0 ? 180 : -180;
      current.push([boundaryLng, crossLat]);
      segments.push(current);
      current = [[-boundaryLng, crossLat], next];
    } else {
      current.push(next);
    }
  }
  if (current.length > 0) segments.push(current);

  // Merge first and last segment if they're on the same side
  if (segments.length > 1) {
    const sideOf = seg => {
      const p = seg.find(c => Math.abs(c[0]) < 179.9);
      return p ? (p[0] > 0 ? 1 : -1) : 0;
    };
    if (sideOf(segments[0]) === sideOf(segments[segments.length - 1])) {
      segments[0] = segments.pop().concat(segments[0]);
    }
  }

  // Close each segment into a proper ring
  const rings = [];
  for (const seg of segments) {
    if (seg.length < 3) continue;
    const closed = [...seg];
    if (closed[0][0] !== closed[closed.length - 1][0] ||
        closed[0][1] !== closed[closed.length - 1][1]) {
      closed.push([closed[0][0], closed[0][1]]);
    }
    rings.push(closed);
  }
  return rings;
}

/**
 * Check if a feature's geometry has parts on both sides of the antimeridian.
 */
function featureSpansAntimeridian(geometry) {
  const polygons = geometry.type === 'MultiPolygon'
    ? geometry.coordinates : [geometry.coordinates];
  let hasEast = false, hasWest = false;
  for (const polygon of polygons) {
    for (const coord of polygon[0]) {
      if (coord[0] > 170) hasEast = true;
      if (coord[0] < -170) hasWest = true;
    }
  }
  return hasEast && hasWest;
}

/**
 * Fix all antimeridian-crossing polygons in a GeoJSON FeatureCollection
 * by splitting them at the ±180° boundary.
 */
function fixAntimeridian(geojson) {
  return {
    ...geojson,
    features: geojson.features.map(feature => {
      const geom = feature.geometry;
      if (!geom) return feature;

      let modified = false;

      if (geom.type === 'Polygon') {
        const outer = geom.coordinates[0];
        if (!doesRingCrossAntimeridian(outer)) return feature;
        const splitRings = splitRingAtAntimeridian(outer);
        return {
          ...feature,
          properties: { ...feature.properties, _spansAntimeridian: true },
          geometry: {
            type: 'MultiPolygon',
            coordinates: splitRings.map(r => [r])
          }
        };
      }

      if (geom.type === 'MultiPolygon') {
        const newPolygons = [];
        for (const polygon of geom.coordinates) {
          const outer = polygon[0];
          if (doesRingCrossAntimeridian(outer)) {
            modified = true;
            const splitRings = splitRingAtAntimeridian(outer);
            for (const ring of splitRings) {
              newPolygons.push([ring]);
            }
          } else {
            newPolygons.push(polygon);
          }
        }
        if (!modified) return feature;
        return {
          ...feature,
          properties: { ...feature.properties, _spansAntimeridian: true },
          geometry: { type: 'MultiPolygon', coordinates: newPolygons }
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
 * If shiftLng is true, negative longitudes are shifted by +360 to avoid
 * the antimeridian discontinuity.
 */
function ringCentroidMercator(ring, shiftLng) {
  let sumX = 0, sumY = 0, count = 0;
  for (const coord of ring) {
    let lng = coord[0];
    if (shiftLng && lng < 0) lng += 360;
    const [mx, my] = toMercator(lng, coord[1]);
    sumX += mx;
    sumY += my;
    count++;
  }
  return [sumX / count, sumY / count];
}

/**
 * Calculate the centroid for an entire feature (may have multiple polygons)
 * Uses area-weighted average of polygon centroids
 */
function featureCentroidMercator(geometry) {
  const polygons = geometry.type === 'MultiPolygon'
    ? geometry.coordinates
    : [geometry.coordinates];

  const shiftLng = featureSpansAntimeridian(geometry);

  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (const polygon of polygons) {
    const ring = polygon[0]; // outer ring
    const centroid = ringCentroidMercator(ring, shiftLng);
    // Approximate area weight by number of points (rough proxy)
    const weight = ring.length;
    weightedX += centroid[0] * weight;
    weightedY += centroid[1] * weight;
    totalWeight += weight;
  }

  return [weightedX / totalWeight, weightedY / totalWeight];
}

/**
 * Scale a single ring around a centroid in Mercator space.
 * Clamps output longitude to [-180, 180] to prevent rendering artifacts.
 */
function scaleRing(ring, centroid, scaleFactor) {
  return ring.map(coord => {
    const [mx, my] = toMercator(coord[0], coord[1]);
    const newX = centroid[0] + scaleFactor * (mx - centroid[0]);
    const newY = centroid[1] + scaleFactor * (my - centroid[1]);
    let [newLng, lat] = fromMercator(newX, newY);
    newLng = Math.max(-180, Math.min(180, newLng));
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
    const centroid = ringCentroidMercator(geometry.coordinates[0], false);
    newCoordinates = geometry.coordinates.map(ring =>
      scaleRing(ring, centroid, scaleFactor)
    );
  } else if (geometry.type === 'MultiPolygon') {
    newCoordinates = geometry.coordinates.map(polygon => {
      const centroid = ringCentroidMercator(polygon[0], false);
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
 * Get color for a budget ratio using a diverging green → yellow → red scale
 */
function getRatioColor(ratio) {
  if (ratio === null || ratio === undefined) return '#888888';
  
  // Clamp for color purposes
  const r = Math.max(0.05, Math.min(ratio, 8));

  if (r <= 1) {
    // Green to Yellow: ratio 0→1
    const t = r; // 0 to 1
    const red = Math.round(34 + (230 - 34) * t);
    const green = Math.round(170 + (195 - 170) * t);
    const blue = Math.round(100 + (50 - 100) * t);
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // Yellow to Red: ratio 1→4+
    const t = Math.min((r - 1) / 3, 1); // 0 to 1 over range 1-4
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
let currentMetric = 'co2';
let isScaled = true;
let selectedCountryId = null;
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
    if (isScaled && ratio !== null) {
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
  renderCountries();
  showInfoPanel(isoCode);
}

function deselectCountry() {
  selectedCountryId = null;
  renderCountries();
  hideInfoPanel();
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

  const worldPC = (WORLD_TOTALS.co2 / WORLD_TOTALS.population).toFixed(1);

  panel.innerHTML = `
    <div class="panel-content">
      <button class="panel-close" onclick="deselectCountry()" title="Close">&times;</button>
      <h2>${stats.name}</h2>
      
      <div class="stat-hero ${ratioClass}">
        <div class="ratio-value">${ratioPercent}%</div>
        <div class="ratio-label">of fair CO₂ budget used</div>
        <div class="ratio-detail">${diffPercent}% ${overUnder} fair share</div>
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
          <div class="stat-label">World avg t/cap</div>
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
        <p>If every person on Earth had an equal CO₂ budget, 
        <strong>${stats.name}</strong> would ${ratio > 1 ? 'need to reduce' : 'could increase'} 
        its emissions by <strong>${diffPercent}%</strong>.</p>
        <p>The country is shown at <strong>${ratioPercent}%</strong> of its actual geographic size 
        to reflect its emissions relative to a fair per-capita share.</p>
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
    document.getElementById('toggle-label').textContent = isScaled ? 'Budget View' : 'Actual Size';
    renderCountries();
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
