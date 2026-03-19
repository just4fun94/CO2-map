# CO₂ Budget Map

**See how countries compare to a fair per-capita carbon budget.**

An interactive world map that resizes countries based on their CO₂ emissions relative to what would be a fair, equal share. Built with Leaflet and real data from Our World in Data.

![Screenshot placeholder](https://img.shields.io/badge/status-live-brightgreen)

## Features

- **Paris Agreement budgets** — Compare emissions against the remaining carbon budget for 1.5°C and 2.0°C warming targets (IPCC AR6), split equally per capita
- **Multiple metrics** — Switch between Paris 1.5°C, Paris 2.0°C, Territorial, Consumption-based, and Historical cumulative emissions
- **Country scaling** — Toggle a mode where countries visually grow or shrink based on how far they are over or under their fair share
- **Consumption-based data** — Paris and Consumption modes prefer consumption-based emissions (which account for trade), falling back to territorial data where unavailable
- **Info panel** — Click any country to see detailed stats, budget ratios, and per-capita breakdowns
- **Colorblind mode** — Alternative color scheme for accessibility
- **241 territories covered** — Every area on the map shows a name and data attribution

## Data

All emissions data comes from [Our World in Data](https://github.com/owid/co2-data) (Global Carbon Project, 2024):

- **215 countries** with territorial, consumption-based, and historical cumulative CO₂ data
- Population figures for 2023 ([UN estimates](https://population.un.org/wpp/), via OWID)
- Consumption-based data available for ~80 countries; territorial used as fallback for the rest

### Paris budget methodology

| Target | Remaining budget | Probability | Per-capita annual budget |
|--------|-----------------|-------------|------------------------|
| 1.5°C  | ~350 Gt CO₂     | 50% (IPCC AR6) | ~1.6 t/year (spread to 2050) |
| 2.0°C  | ~1,100 Gt CO₂   | 67% (IPCC AR6) | ~5.0 t/year (spread to 2050) |

## Tech stack

- [Leaflet.js](https://leafletjs.com/) v1.9.4 — map rendering
- [TopoJSON Client](https://github.com/topojson/topojson-client) v3 — decoding [world-atlas](https://github.com/topojson/world-atlas) geometry
- [CartoDB Positron](https://carto.com/basemaps/) — base map tiles
- Vanilla JavaScript, HTML, CSS — no build step, no framework

## Running locally

Just open `index.html` in a browser, or serve it with any static file server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

## Regenerating data

If you want to update the emissions data from the OWID source:

1. Download `owid-co2-data.csv` from [owid/co2-data](https://github.com/owid/co2-data)
2. Place it in the project root
3. Run `python generate_data.py`

This regenerates the CO₂ data entries in `js/co2data.js`. Note that territory mappings and Paris budget constants in that file are maintained manually.

## License

Data: [Our World in Data](https://github.com/owid/co2-data) — Creative Commons BY 4.0
