"""
Generate co2data.js from Our World in Data CO2 dataset.
Uses 2023 data as primary year, falls back to 2022 where needed.
"""
import csv
import json
import logging
import os
import sys

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
log = logging.getLogger(__name__)

# ISO 3166-1 alpha-3 to numeric mapping (matching world-atlas topojson)
ISO_A3_TO_NUM = {
    'AFG':'004','ALB':'008','DZA':'012','ASM':'016','AND':'020','AGO':'024','ATG':'028',
    'ARG':'032','ARM':'051','AUS':'036','AUT':'040','AZE':'031','BHS':'044','BHR':'048',
    'BGD':'050','BRB':'052','BLR':'112','BEL':'056','BLZ':'084','BEN':'204','BMU':'060',
    'BTN':'064','BOL':'068','BIH':'070','BWA':'072','BRA':'076','BRN':'096','BGR':'100',
    'BFA':'854','BDI':'108','KHM':'116','CMR':'120','CAN':'124','CPV':'132','CAF':'140',
    'TCD':'148','CHL':'152','CHN':'156','COL':'170','COM':'174','COG':'178','COD':'180',
    'CRI':'188','CIV':'384','HRV':'191','CUB':'192','CYP':'196','CZE':'203','DNK':'208',
    'DJI':'262','DMA':'212','DOM':'214','ECU':'218','EGY':'818','SLV':'222','GNQ':'226',
    'ERI':'232','EST':'233','SWZ':'748','ETH':'231','FJI':'242','FIN':'246','FRA':'250',
    'GAB':'266','GMB':'270','GEO':'268','DEU':'276','GHA':'288','GRC':'300','GRL':'304',
    'GTM':'320','GIN':'324','GNB':'624','GUY':'328','HTI':'332','HND':'340','HUN':'348',
    'ISL':'352','IND':'356','IDN':'360','IRN':'364','IRQ':'368','IRL':'372','ISR':'376',
    'ITA':'380','JAM':'388','JPN':'392','JOR':'400','KAZ':'398','KEN':'404','KIR':'296',
    'KWT':'414','KGZ':'417','LAO':'418','LVA':'428','LBN':'422','LSO':'426','LBR':'430',
    'LBY':'434','LTU':'440','LUX':'442','MDG':'450','MWI':'454','MYS':'458','MDV':'462',
    'MLI':'466','MLT':'470','MRT':'478','MUS':'480','MEX':'484','MDA':'498','MNG':'496',
    'MNE':'499','MAR':'504','MOZ':'508','MMR':'104','NAM':'516','NPL':'524','NLD':'528',
    'NZL':'554','NIC':'558','NER':'562','NGA':'566','PRK':'408','MKD':'807','NOR':'578',
    'OMN':'512','PAK':'586','PAN':'591','PNG':'598','PRY':'600','PER':'604','PHL':'608',
    'POL':'616','PRT':'620','QAT':'634','ROU':'642','RUS':'643','RWA':'646','SAU':'682',
    'SEN':'686','SRB':'688','SLE':'694','SGP':'702','SVK':'703','SVN':'705','SLB':'090',
    'SOM':'706','ZAF':'710','KOR':'410','SSD':'728','ESP':'724','LKA':'144','SDN':'729',
    'SUR':'740','SWE':'752','CHE':'756','SYR':'760','TWN':'158','TJK':'762','TZA':'834',
    'THA':'764','TLS':'626','TGO':'768','TTO':'780','TUN':'788','TUR':'792','TKM':'795',
    'UGA':'800','UKR':'804','ARE':'784','GBR':'826','USA':'840','URY':'858','UZB':'860',
    'VUT':'548','VEN':'862','VNM':'704','YEM':'887','ZMB':'894','ZWE':'716',
    'PSE':'275','NCL':'540','CUW':'531','ABW':'533','PYF':'258','FSM':'583',
    'BES':'535','SXM':'534','MAF':'663','SPM':'666','WLF':'876','MYT':'175',
    'SHN':'654','FLK':'238','GIB':'292','FRO':'234','CYM':'136',
    'VIR':'850','GUM':'316','MNP':'580','PRI':'630','TCA':'796','VGB':'092',
    'AIA':'660','MSR':'500','COK':'184','NIU':'570','TKL':'772',
    'WSM':'882','TON':'776','PLW':'585','MHL':'584','NRU':'520','TUV':'798',
    'KNA':'659','LCA':'662','VCT':'670','GRD':'308',
    'XKX':'383',
    'HKG':'344','MAC':'446','LIE':'438','MCO':'492','SMR':'674','STP':'678','SYC':'690'
}

# Known non-country entries in OWID data to skip
SKIP_ENTITIES = {
    'World', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania',
    'High-income countries', 'Low-income countries', 'Lower-middle-income countries',
    'Upper-middle-income countries', 'European Union (27)', 'Asia (excl. China and India)',
    'Europe (excl. EU-27)', 'Europe (excl. EU-28)', 'North America (excl. USA)',
    'International transport', 'Kuwaiti Oil Fires', 'Statistical discrepancy',
    'OWID_WRL', 'OWID_AFR', 'OWID_ASI', 'OWID_EUR', 'OWID_NAM', 'OWID_SAM', 'OWID_OCE',
}

def safe_float(val):
    """Convert string to float, return None if empty or invalid."""
    if val is None or val.strip() == '':
        return None
    try:
        return float(val)
    except ValueError:
        return None

def main():
    csv_path = 'owid-co2-data.csv'
    output_path = 'js/co2data.js'

    if not os.path.isfile(csv_path):
        log.error(f"Input file not found: {csv_path}")
        sys.exit(1)

    # Read CSV
    rows = {}
    world_row_2023 = None
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            iso = row.get('iso_code', '').strip()
            country = row.get('country', '').strip()
            year = row.get('year', '').strip()
            
            if not year:
                continue
            
            # Store World row for totals (iso_code may be empty for World)
            if country == 'World':
                if year == '2023':
                    world_row_2023 = row
                continue
            
            if not iso:
                continue
            
            # Skip aggregates and non-countries
            if iso.startswith('OWID_') or country in SKIP_ENTITIES:
                continue
            
            key = (iso, year)
            rows[key] = row
    
    # Build country data
    countries = {}
    matched = 0
    unmatched_isos = []
    
    # Get all unique ISO codes from the data
    all_isos = set()
    for (iso, year) in rows:
        all_isos.add(iso)
    
    for iso in sorted(all_isos):
        num = ISO_A3_TO_NUM.get(iso)
        if not num:
            unmatched_isos.append(iso)
            continue
        
        # Prefer 2023, fall back to 2022
        row = rows.get((iso, '2023')) or rows.get((iso, '2022'))
        if not row:
            continue
        
        name = row['country']
        pop = safe_float(row.get('population'))
        co2 = safe_float(row.get('co2'))
        
        # consumption: try 2022 first (latest available for most), then 2023
        cons_row = rows.get((iso, '2022')) or rows.get((iso, '2023'))
        cons = safe_float(cons_row.get('consumption_co2')) if cons_row else None
        
        # If 2023 has consumption data, prefer it
        row_2023 = rows.get((iso, '2023'))
        if row_2023:
            cons_2023 = safe_float(row_2023.get('consumption_co2'))
            if cons_2023 is not None:
                cons = cons_2023
        
        # cumulative_co2 - use latest year available
        hist = safe_float(row.get('cumulative_co2'))
        
        if pop is None and co2 is None:
            continue
        
        # Convert population to millions
        pop_m = round(pop / 1e6, 3) if pop else None
        # co2 is already in Mt in OWID
        co2_mt = round(co2, 3) if co2 is not None else None
        # consumption is in Mt
        cons_mt = round(cons, 3) if cons is not None else None
        # cumulative is in Mt, convert to Gt (divide by 1000)
        hist_gt = round(hist / 1000, 3) if hist is not None else None
        
        countries[num] = {
            'name': name,
            'pop': pop_m,
            'co2': co2_mt,
            'cons': cons_mt,
            'hist': hist_gt
        }
        matched += 1
    
    # World totals from OWID
    world_pop = safe_float(world_row_2023.get('population')) if world_row_2023 else None
    world_co2 = safe_float(world_row_2023.get('co2')) if world_row_2023 else None
    world_cons = safe_float(world_row_2023.get('consumption_co2')) if world_row_2023 else None
    world_hist = safe_float(world_row_2023.get('cumulative_co2')) if world_row_2023 else None
    
    world_totals = {
        'pop': round(world_pop / 1e6, 3) if world_pop else 8045.311,
        'co2': round(world_co2, 3) if world_co2 else 37550.0,
        'cons': round(world_cons, 3) if world_cons else 37550.0,
        'hist': round(world_hist / 1000, 3) if world_hist else 1740.0
    }
    
    log.info(f"Matched {matched} countries to ISO numeric codes")
    if unmatched_isos:
        log.warning(f"Unmatched ISO codes ({len(unmatched_isos)}): {unmatched_isos}")
    log.info(f"World totals: {world_totals}")
    
    # Check a few key countries
    for num, name in [('840', 'USA'), ('156', 'China'), ('356', 'India'), ('643', 'Russia'), ('276', 'Germany')]:
        c = countries.get(num)
        if c:
            log.info(f"  {name}: pop={c['pop']}M, co2={c['co2']}Mt, cons={c['cons']}, hist={c['hist']}Gt")
    
    # Generate JS file
    js_lines = []
    js_lines.append('// CO2 emissions data from Our World in Data (Global Carbon Project)')
    js_lines.append('// Source: https://github.com/owid/co2-data')
    js_lines.append('// Data year: 2023 (consumption-based: latest available, mostly 2022)')
    js_lines.append('// Generated from owid-co2-data.csv')
    js_lines.append('//')
    js_lines.append('// Units:')
    js_lines.append('//   pop  = population in millions')
    js_lines.append('//   co2  = territorial CO2 emissions in Mt (million tonnes)')
    js_lines.append('//   cons = consumption-based CO2 emissions in Mt (null if unavailable)')
    js_lines.append('//   hist = cumulative CO2 emissions 1750-2023 in Gt (gigatonnes)')
    js_lines.append('')
    js_lines.append('const CO2_DATA = {')
    
    for num in sorted(countries.keys()):
        c = countries[num]
        name_esc = c['name'].replace("'", "\\'")
        pop_str = str(c['pop']) if c['pop'] is not None else 'null'
        co2_str = str(c['co2']) if c['co2'] is not None else 'null'
        cons_str = str(c['cons']) if c['cons'] is not None else 'null'
        hist_str = str(c['hist']) if c['hist'] is not None else 'null'
        js_lines.append(f"  \"{num}\": {{ name: '{name_esc}', pop: {pop_str}, co2: {co2_str}, cons: {cons_str}, hist: {hist_str} }},")
    
    js_lines.append('};')
    js_lines.append('')
    
    # World totals
    js_lines.append('const WORLD_TOTALS = {')
    js_lines.append(f"  pop: {world_totals['pop']},   // millions")
    js_lines.append(f"  population: {world_totals['pop']}, // alias for pop (used by info panel)")
    js_lines.append(f"  co2: {world_totals['co2']},  // Mt")
    js_lines.append(f"  cons: {world_totals['cons']}, // Mt (consumption ≈ territorial globally)")
    js_lines.append(f"  hist: {world_totals['hist']}   // Gt")
    js_lines.append('};')
    js_lines.append('')
    
    # Helper functions (same API as before)
    js_lines.append('function getWorldPerCapita(metric = "co2") {')
    js_lines.append('  if (metric === "hist") return WORLD_TOTALS.hist / WORLD_TOTALS.pop;')
    js_lines.append('  const key = metric === "cons" ? "cons" : "co2";')
    js_lines.append('  return WORLD_TOTALS[key] / WORLD_TOTALS.pop;')
    js_lines.append('}')
    js_lines.append('')
    js_lines.append('function getBudgetRatio(isoCode, metric = "co2") {')
    js_lines.append('  const d = CO2_DATA[isoCode];')
    js_lines.append('  if (!d || !d.pop) return null;')
    js_lines.append('  let val;')
    js_lines.append('  if (metric === "hist") {')
    js_lines.append('    val = d.hist;')
    js_lines.append('  } else if (metric === "cons") {')
    js_lines.append('    val = d.cons != null ? d.cons : d.co2;')
    js_lines.append('  } else {')
    js_lines.append('    val = d.co2;')
    js_lines.append('  }')
    js_lines.append('  if (val == null) return null;')
    js_lines.append('  const perCapita = val / d.pop;')
    js_lines.append('  const worldPC = getWorldPerCapita(metric);')
    js_lines.append('  return perCapita / worldPC;')
    js_lines.append('}')
    js_lines.append('')
    js_lines.append("function getCountryStats(isoCode, metric = 'co2') {")
    js_lines.append('  const d = CO2_DATA[isoCode];')
    js_lines.append('  if (!d) return null;')
    js_lines.append("  const ratio = getBudgetRatio(isoCode, metric);")
    js_lines.append('  let metricPerCapita = null;')
    js_lines.append("  if (metric === 'hist' && d.hist != null && d.pop) {")
    js_lines.append('    metricPerCapita = (d.hist * 1000) / d.pop; // Gt->Mt for per-capita')
    js_lines.append("  } else if (metric === 'cons') {")
    js_lines.append('    const val = d.cons != null ? d.cons : d.co2;')
    js_lines.append('    if (val != null && d.pop) metricPerCapita = val / d.pop;')
    js_lines.append('  } else {')
    js_lines.append('    if (d.co2 != null && d.pop) metricPerCapita = d.co2 / d.pop;')
    js_lines.append('  }')
    js_lines.append('  return {')
    js_lines.append('    name: d.name,')
    js_lines.append('    population: d.pop,')
    js_lines.append('    co2: d.co2,')
    js_lines.append('    cons: d.cons,')
    js_lines.append('    hist: d.hist,')
    js_lines.append('    consumption: d.cons,')
    js_lines.append('    historical: d.hist,')
    js_lines.append('    ratio: ratio,')
    js_lines.append('    metricPerCapita: metricPerCapita,')
    js_lines.append('    co2PerCapita: d.co2 && d.pop ? +(d.co2 / d.pop).toFixed(4) : null,')
    js_lines.append('    consPerCapita: d.cons != null && d.pop ? +(d.cons / d.pop).toFixed(4) : null,')
    js_lines.append('    histPerCapita: d.hist != null && d.pop ? +(d.hist / d.pop).toFixed(6) : null')
    js_lines.append('  };')
    js_lines.append('}')
    js_lines.append('')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(js_lines))
    
    # Output validation
    errors = []
    if matched < 150:
        errors.append(f"Only {matched} countries matched (expected 150+)")
    if world_totals['co2'] <= 0:
        errors.append("World CO2 total is zero or negative")
    if world_totals['pop'] <= 0:
        errors.append("World population total is zero or negative")
    # Spot-check: major countries must be present
    for num, name in [('840', 'USA'), ('156', 'China'), ('356', 'India')]:
        if num not in countries:
            errors.append(f"Missing major country: {name} ({num})")
        elif countries[num]['co2'] is None:
            errors.append(f"Missing CO2 data for {name}")
    
    if errors:
        for err in errors:
            log.error(err)
        sys.exit(1)
    
    log.info(f"Generated {output_path} with {matched} countries")

if __name__ == '__main__':
    main()
