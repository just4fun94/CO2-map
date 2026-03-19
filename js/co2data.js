// CO2 emissions data from Our World in Data (Global Carbon Project)
// Source: https://github.com/owid/co2-data
// Data year: 2023 (consumption-based: latest available, mostly 2022)
// Generated from owid-co2-data.csv
//
// Units:
//   pop  = population in millions
//   co2  = territorial CO2 emissions in Mt (million tonnes)
//   cons = consumption-based CO2 emissions in Mt (null if unavailable)
//   hist = cumulative CO2 emissions 1750-2023 in Gt (gigatonnes)

const CO2_DATA = {
  "004": { name: 'Afghanistan', pop: 41.455, co2: 10.516, cons: null, hist: 0.232 },
  "008": { name: 'Albania', pop: 2.812, co2: 4.417, cons: 5.382, hist: 0.303 },
  "012": { name: 'Algeria', pop: 46.164, co2: 202.847, cons: null, hist: 5.278 },
  "020": { name: 'Andorra', pop: 0.081, co2: 0.418, cons: null, hist: 0.016 },
  "024": { name: 'Angola', pop: 36.75, co2: 21.675, cons: null, hist: 0.717 },
  "028": { name: 'Antigua and Barbuda', pop: 0.093, co2: 0.641, cons: null, hist: 0.026 },
  "031": { name: 'Azerbaijan', pop: 10.318, co2: 42.748, cons: 40.838, hist: 2.597 },
  "032": { name: 'Argentina', pop: 45.538, co2: 178.407, cons: 185.666, hist: 8.98 },
  "036": { name: 'Australia', pop: 26.451, co2: 384.316, cons: 372.151, hist: 19.653 },
  "040": { name: 'Austria', pop: 9.13, co2: 56.909, cons: 76.469, hist: 5.693 },
  "044": { name: 'Bahamas', pop: 0.399, co2: 2.956, cons: null, hist: 0.177 },
  "048": { name: 'Bahrain', pop: 1.57, co2: 38.787, cons: 22.064, hist: 1.073 },
  "050": { name: 'Bangladesh', pop: 171.467, co2: 104.527, cons: 167.859, hist: 1.893 },
  "051": { name: 'Armenia', pop: 2.943, co2: 7.43, cons: 7.674, hist: 0.399 },
  "052": { name: 'Barbados', pop: 0.282, co2: 1.317, cons: null, hist: 0.063 },
  "056": { name: 'Belgium', pop: 11.713, co2: 84.703, cons: 196.605, hist: 12.821 },
  "060": { name: 'Bermuda', pop: 0.065, co2: 0.53, cons: null, hist: 0.03 },
  "064": { name: 'Bhutan', pop: 0.786, co2: 1.63, cons: null, hist: 0.028 },
  "068": { name: 'Bolivia', pop: 12.244, co2: 24.621, cons: 25.628, hist: 0.612 },
  "070": { name: 'Bosnia and Herzegovina', pop: 3.185, co2: 19.881, cons: null, hist: 1.024 },
  "072": { name: 'Botswana', pop: 2.48, co2: 7.249, cons: 14.509, hist: 0.177 },
  "076": { name: 'Brazil', pop: 211.141, co2: 483.992, cons: 469.989, hist: 17.716 },
  "084": { name: 'Belize', pop: 0.411, co2: 0.766, cons: null, hist: 0.022 },
  "090": { name: 'Solomon Islands', pop: 0.8, co2: 0.282, cons: null, hist: 0.011 },
  "092": { name: 'British Virgin Islands', pop: 0.039, co2: 0.185, cons: null, hist: 0.006 },
  "096": { name: 'Brunei', pop: 0.459, co2: 12.503, cons: 8.876, hist: 0.416 },
  "100": { name: 'Bulgaria', pop: 6.796, co2: 34.501, cons: 35.31, hist: 3.953 },
  "104": { name: 'Myanmar', pop: 54.134, co2: 31.793, cons: null, hist: 0.696 },
  "108": { name: 'Burundi', pop: 13.689, co2: 0.901, cons: null, hist: 0.016 },
  "112": { name: 'Belarus', pop: 9.116, co2: 55.736, cons: 62.548, hist: 5.128 },
  "116": { name: 'Cambodia', pop: 17.424, co2: 21.412, cons: 39.064, hist: 0.23 },
  "120": { name: 'Cameroon', pop: 28.373, co2: 9.695, cons: 10.384, hist: 0.3 },
  "124": { name: 'Canada', pop: 39.299, co2: 545.479, cons: 519.943, hist: 35.111 },
  "132": { name: 'Cape Verde', pop: 0.522, co2: 0.571, cons: null, hist: 0.016 },
  "140": { name: 'Central African Republic', pop: 5.152, co2: 0.389, cons: null, hist: 0.012 },
  "144": { name: 'Sri Lanka', pop: 22.972, co2: 19.166, cons: 46.439, hist: 0.547 },
  "148": { name: 'Chad', pop: 19.319, co2: 2.848, cons: null, hist: 0.049 },
  "152": { name: 'Chile', pop: 19.659, co2: 77.604, cons: 88.157, hist: 3.246 },
  "156": { name: 'China', pop: 1422.585, co2: 12172.009, cons: 10857.025, hist: 272.798 },
  "158": { name: 'Taiwan', pop: 23.317, co2: 267.127, cons: 294.802, hist: 9.83 },
  "170": { name: 'Colombia', pop: 52.321, co2: 89.992, cons: 104.465, hist: 3.709 },
  "174": { name: 'Comoros', pop: 0.85, co2: 0.542, cons: null, hist: 0.007 },
  "178": { name: 'Congo', pop: 6.183, co2: 8.274, cons: null, hist: 0.182 },
  "180": { name: 'Democratic Republic of Congo', pop: 105.79, co2: 5.881, cons: null, hist: 0.233 },
  "184": { name: 'Cook Islands', pop: 0.014, co2: 0.077, cons: null, hist: 0.003 },
  "188": { name: 'Costa Rica', pop: 5.106, co2: 8.473, cons: 14.692, hist: 0.277 },
  "191": { name: 'Croatia', pop: 3.896, co2: 18.468, cons: 23.711, hist: 1.166 },
  "192": { name: 'Cuba', pop: 11.02, co2: 23.47, cons: null, hist: 1.79 },
  "196": { name: 'Cyprus', pop: 1.345, co2: 7.188, cons: 8.624, hist: 0.314 },
  "203": { name: 'Czechia', pop: 10.81, co2: 83.232, cons: 100.025, hist: 12.256 },
  "204": { name: 'Benin', pop: 14.111, co2: 5.928, cons: 8.434, hist: 0.122 },
  "208": { name: 'Denmark', pop: 5.948, co2: 28.831, cons: 49.471, hist: 4.171 },
  "212": { name: 'Dominica', pop: 0.067, co2: 0.165, cons: null, hist: 0.005 },
  "214": { name: 'Dominican Republic', pop: 11.331, co2: 31.829, cons: 40.438, hist: 0.836 },
  "218": { name: 'Ecuador', pop: 17.98, co2: 44.6, cons: 48.898, hist: 1.345 },
  "222": { name: 'El Salvador', pop: 6.31, co2: 8.67, cons: 11.255, hist: 0.256 },
  "226": { name: 'Equatorial Guinea', pop: 1.848, co2: 6.913, cons: null, hist: 0.156 },
  "231": { name: 'Ethiopia', pop: 128.692, co2: 17.571, cons: 23.246, hist: 0.312 },
  "232": { name: 'Eritrea', pop: 3.47, co2: 0.731, cons: null, hist: 0.018 },
  "233": { name: 'Estonia', pop: 1.367, co2: 8.744, cons: 12.585, hist: 1.66 },
  "234": { name: 'Faroe Islands', pop: 0.055, co2: 0.714, cons: null, hist: 0.033 },
  "242": { name: 'Fiji', pop: 0.924, co2: 1.382, cons: null, hist: 0.053 },
  "246": { name: 'Finland', pop: 5.601, co2: 31.799, cons: 47.462, hist: 3.295 },
  "250": { name: 'France', pop: 66.439, co2: 270.263, cons: 407.365, hist: 39.783 },
  "258": { name: 'French Polynesia', pop: 0.281, co2: 0.882, cons: null, hist: 0.034 },
  "262": { name: 'Djibouti', pop: 1.153, co2: 0.558, cons: null, hist: 0.021 },
  "266": { name: 'Gabon', pop: 2.485, co2: 5.321, cons: null, hist: 0.302 },
  "268": { name: 'Georgia', pop: 3.807, co2: 11.922, cons: 15.366, hist: 0.651 },
  "270": { name: 'Gambia', pop: 2.698, co2: 0.773, cons: null, hist: 0.017 },
  "275": { name: 'Palestine', pop: 5.409, co2: 4.755, cons: null, hist: 0.073 },
  "276": { name: 'Germany', pop: 84.548, co2: 593.766, cons: 768.481, hist: 94.563 },
  "288": { name: 'Ghana', pop: 33.788, co2: 20.136, cons: 26.373, hist: 0.406 },
  "296": { name: 'Kiribati', pop: 0.133, co2: 0.069, cons: null, hist: 0.002 },
  "300": { name: 'Greece', pop: 10.243, co2: 51.988, cons: 67.191, hist: 4.243 },
  "304": { name: 'Greenland', pop: 0.056, co2: 0.609, cons: null, hist: 0.035 },
  "308": { name: 'Grenada', pop: 0.117, co2: 0.363, cons: null, hist: 0.009 },
  "320": { name: 'Guatemala', pop: 18.125, co2: 19.736, cons: 25.449, hist: 0.496 },
  "324": { name: 'Guinea', pop: 14.405, co2: 3.875, cons: 6.399, hist: 0.102 },
  "328": { name: 'Guyana', pop: 0.826, co2: 4.379, cons: null, hist: 0.113 },
  "332": { name: 'Haiti', pop: 11.637, co2: 2.865, cons: null, hist: 0.086 },
  "340": { name: 'Honduras', pop: 10.645, co2: 12.404, cons: 10.458, hist: 0.297 },
  "344": { name: 'Hong Kong', pop: 7.443, co2: 32.957, cons: 144.164, hist: 1.717 },
  "348": { name: 'Hungary', pop: 9.686, co2: 40.344, cons: 56.728, hist: 5.144 },
  "352": { name: 'Iceland', pop: 0.388, co2: 3.508, cons: null, hist: 0.168 },
  "356": { name: 'India', pop: 1438.07, co2: 3062.756, cons: 2543.215, hist: 62.879 },
  "360": { name: 'Indonesia', pop: 281.19, co2: 762.358, cons: 728.167, hist: 16.608 },
  "364": { name: 'Iran', pop: 90.609, co2: 789.676, cons: 668.58, hist: 21.018 },
  "368": { name: 'Iraq', pop: 45.074, co2: 227.91, cons: null, hist: 5.117 },
  "372": { name: 'Ireland', pop: 5.197, co2: 33.568, cons: 40.834, hist: 2.333 },
  "376": { name: 'Israel', pop: 9.256, co2: 55.382, cons: 88.32, hist: 2.555 },
  "380": { name: 'Italy', pop: 59.499, co2: 312.291, cons: 429.008, hist: 25.704 },
  "384": { name: 'Cote d\'Ivoire', pop: 31.166, co2: 14.052, cons: 17.865, hist: 0.385 },
  "388": { name: 'Jamaica', pop: 2.84, co2: 8.069, cons: 8.334, hist: 0.477 },
  "392": { name: 'Japan', pop: 124.371, co2: 986.91, cons: 1142.299, hist: 68.65 },
  "398": { name: 'Kazakhstan', pop: 20.33, co2: 286.175, cons: 212.657, hist: 14.65 },
  "400": { name: 'Jordan', pop: 11.439, co2: 23.119, cons: 31.817, hist: 0.77 },
  "404": { name: 'Kenya', pop: 55.339, co2: 21.186, cons: 34.98, hist: 0.53 },
  "408": { name: 'North Korea', pop: 26.418, co2: 62.025, cons: null, hist: 5.43 },
  "410": { name: 'South Korea', pop: 51.749, co2: 589.178, cons: 708.865, hist: 20.124 },
  "414": { name: 'Kuwait', pop: 4.839, co2: 123.169, cons: 122.346, hist: 3.746 },
  "417": { name: 'Kyrgyzstan', pop: 7.074, co2: 11.144, cons: 19.193, hist: 0.871 },
  "418": { name: 'Laos', pop: 7.665, co2: 24.157, cons: 14.825, hist: 0.219 },
  "422": { name: 'Lebanon', pop: 5.773, co2: 15.559, cons: null, hist: 0.779 },
  "426": { name: 'Lesotho', pop: 2.311, co2: 2.494, cons: null, hist: 0.07 },
  "428": { name: 'Latvia', pop: 1.882, co2: 6.59, cons: 13.362, hist: 0.974 },
  "430": { name: 'Liberia', pop: 5.493, co2: 0.834, cons: null, hist: 0.052 },
  "434": { name: 'Libya', pop: 7.306, co2: 64.219, cons: null, hist: 2.425 },
  "438": { name: 'Liechtenstein', pop: 0.04, co2: 0.131, cons: null, hist: 0.01 },
  "440": { name: 'Lithuania', pop: 2.854, co2: 12.507, cons: 20.517, hist: 1.598 },
  "442": { name: 'Luxembourg', pop: 0.665, co2: 6.841, cons: 7.332, hist: 0.776 },
  "446": { name: 'Macao', pop: 0.714, co2: 1.043, cons: null, hist: 0.056 },
  "450": { name: 'Madagascar', pop: 31.196, co2: 4.447, cons: 6.419, hist: 0.108 },
  "454": { name: 'Malawi', pop: 21.104, co2: 1.853, cons: 3.233, hist: 0.056 },
  "458": { name: 'Malaysia', pop: 35.126, co2: 276.297, cons: 286.508, hist: 6.752 },
  "462": { name: 'Maldives', pop: 0.526, co2: 2.205, cons: null, hist: 0.031 },
  "466": { name: 'Mali', pop: 23.769, co2: 6.743, cons: null, hist: 0.093 },
  "470": { name: 'Malta', pop: 0.533, co2: 1.768, cons: 14.296, hist: 0.109 },
  "478": { name: 'Mauritania', pop: 5.022, co2: 5.037, cons: null, hist: 0.095 },
  "480": { name: 'Mauritius', pop: 1.274, co2: 4.588, cons: 7.913, hist: 0.129 },
  "484": { name: 'Mexico', pop: 129.74, co2: 458.254, cons: 564.969, hist: 21.555 },
  "492": { name: 'Monaco', pop: 0.039, co2: null, cons: null, hist: null },
  "496": { name: 'Mongolia', pop: 3.432, co2: 44.184, cons: 36.605, hist: 0.817 },
  "498": { name: 'Moldova', pop: 3.067, co2: 5.329, cons: null, hist: 1.353 },
  "499": { name: 'Montenegro', pop: 0.634, co2: 2.407, cons: null, hist: 0.12 },
  "500": { name: 'Montserrat', pop: 0.004, co2: 0.026, cons: null, hist: 0.002 },
  "504": { name: 'Morocco', pop: 37.713, co2: 68.961, cons: 69.914, hist: 1.947 },
  "508": { name: 'Mozambique', pop: 33.635, co2: 9.093, cons: 14.428, hist: 0.203 },
  "512": { name: 'Oman', pop: 5.049, co2: 79.811, cons: 83.36, hist: 1.591 },
  "516": { name: 'Namibia', pop: 2.963, co2: 3.443, cons: 9.646, hist: 0.084 },
  "520": { name: 'Nauru', pop: 0.012, co2: 0.059, cons: null, hist: 0.005 },
  "524": { name: 'Nepal', pop: 29.695, co2: 18.348, cons: 47.279, hist: 0.213 },
  "528": { name: 'Netherlands', pop: 18.093, co2: 117.016, cons: 150.148, hist: 12.147 },
  "531": { name: 'Curacao', pop: 0.185, co2: 2.205, cons: null, hist: 0.53 },
  "533": { name: 'Aruba', pop: 0.108, co2: 0.887, cons: null, hist: 0.075 },
  "534": { name: 'Sint Maarten (Dutch part)', pop: 0.043, co2: 0.691, cons: null, hist: 0.062 },
  "535": { name: 'Bonaire Sint Eustatius and Saba', pop: 0.03, co2: 0.146, cons: null, hist: 0.01 },
  "540": { name: 'New Caledonia', pop: 0.29, co2: 5.068, cons: null, hist: 0.166 },
  "548": { name: 'Vanuatu', pop: 0.32, co2: 0.188, cons: null, hist: 0.005 },
  "554": { name: 'New Zealand', pop: 5.173, co2: 31.56, cons: 41.396, hist: 1.98 },
  "558": { name: 'Nicaragua', pop: 6.824, co2: 5.428, cons: 7.173, hist: 0.192 },
  "562": { name: 'Niger', pop: 26.16, co2: 3.133, cons: null, hist: 0.058 },
  "566": { name: 'Nigeria', pop: 227.883, co2: 129.376, cons: 133.284, hist: 4.575 },
  "570": { name: 'Niue', pop: 0.002, co2: 0.007, cons: null, hist: 0.0 },
  "578": { name: 'Norway', pop: 5.519, co2: 38.869, cons: 38.97, hist: 2.75 },
  "583": { name: 'Micronesia (country)', pop: 0.113, co2: 0.144, cons: null, hist: 0.005 },
  "584": { name: 'Marshall Islands', pop: 0.039, co2: 0.148, cons: null, hist: 0.004 },
  "585": { name: 'Palau', pop: 0.018, co2: 0.216, cons: null, hist: 0.011 },
  "586": { name: 'Pakistan', pop: 247.505, co2: 186.861, cons: 220.106, hist: 5.56 },
  "591": { name: 'Panama', pop: 4.459, co2: 13.002, cons: 19.517, hist: 0.348 },
  "598": { name: 'Papua New Guinea', pop: 10.39, co2: 8.358, cons: null, hist: 0.201 },
  "600": { name: 'Paraguay', pop: 6.844, co2: 7.646, cons: 13.125, hist: 0.201 },
  "604": { name: 'Peru', pop: 33.846, co2: 66.065, cons: 78.884, hist: 2.092 },
  "608": { name: 'Philippines', pop: 114.891, co2: 160.98, cons: 211.593, hist: 3.809 },
  "616": { name: 'Poland', pop: 38.763, co2: 283.243, cons: 273.856, hist: 28.771 },
  "620": { name: 'Portugal', pop: 10.431, co2: 37.622, cons: 47.46, hist: 2.732 },
  "624": { name: 'Guinea-Bissau', pop: 2.153, co2: 0.329, cons: null, hist: 0.008 },
  "626": { name: 'East Timor', pop: 1.384, co2: 0.637, cons: null, hist: 0.011 },
  "634": { name: 'Qatar', pop: 2.979, co2: 119.544, cons: 82.228, hist: 2.465 },
  "642": { name: 'Romania', pop: 19.118, co2: 67.866, cons: 78.251, hist: 8.793 },
  "643": { name: 'Russia', pop: 145.441, co2: 1733.135, cons: 1405.982, hist: 121.028 },
  "646": { name: 'Rwanda', pop: 13.954, co2: 2.016, cons: 3.517, hist: 0.035 },
  "654": { name: 'Saint Helena', pop: 0.005, co2: 0.011, cons: null, hist: 0.0 },
  "659": { name: 'Saint Kitts and Nevis', pop: 0.047, co2: 0.25, cons: null, hist: 0.008 },
  "660": { name: 'Anguilla', pop: 0.014, co2: 0.143, cons: null, hist: 0.003 },
  "662": { name: 'Saint Lucia', pop: 0.179, co2: 0.517, cons: null, hist: 0.016 },
  "666": { name: 'Saint Pierre and Miquelon', pop: 0.006, co2: 0.053, cons: null, hist: 0.004 },
  "670": { name: 'Saint Vincent and the Grenadines', pop: 0.101, co2: 0.246, cons: null, hist: 0.008 },
  "674": { name: 'San Marino', pop: 0.034, co2: null, cons: null, hist: null },
  "678": { name: 'Sao Tome and Principe', pop: 0.231, co2: 0.14, cons: null, hist: 0.004 },
  "682": { name: 'Saudi Arabia', pop: 33.264, co2: 677.442, cons: 654.104, hist: 18.328 },
  "686": { name: 'Senegal', pop: 18.078, co2: 14.082, cons: 19.033, hist: 0.287 },
  "688": { name: 'Serbia', pop: 6.773, co2: 42.907, cons: null, hist: 2.883 },
  "690": { name: 'Seychelles', pop: 0.128, co2: 0.641, cons: null, hist: 0.015 },
  "694": { name: 'Sierra Leone', pop: 8.461, co2: 1.38, cons: null, hist: 0.041 },
  "702": { name: 'Singapore', pop: 5.789, co2: 51.068, cons: 186.926, hist: 2.194 },
  "703": { name: 'Slovakia', pop: 5.518, co2: 30.766, cons: 35.035, hist: 3.999 },
  "704": { name: 'Vietnam', pop: 100.352, co2: 347.399, cons: 247.788, hist: 5.298 },
  "705": { name: 'Slovenia', pop: 2.118, co2: 12.012, cons: 19.735, hist: 0.899 },
  "706": { name: 'Somalia', pop: 18.359, co2: 1.296, cons: null, hist: 0.041 },
  "710": { name: 'South Africa', pop: 63.212, co2: 436.604, cons: 325.381, hist: 22.387 },
  "716": { name: 'Zimbabwe', pop: 16.341, co2: 13.443, cons: 15.32, hist: 0.819 },
  "724": { name: 'Spain', pop: 47.912, co2: 215.461, cons: 260.615, hist: 15.48 },
  "728": { name: 'South Sudan', pop: 11.483, co2: 1.666, cons: null, hist: 0.044 },
  "729": { name: 'Sudan', pop: 50.043, co2: 17.716, cons: null, hist: 0.499 },
  "740": { name: 'Suriname', pop: 0.629, co2: 2.869, cons: null, hist: 0.126 },
  "748": { name: 'Eswatini', pop: 1.231, co2: 1.03, cons: null, hist: 0.044 },
  "752": { name: 'Sweden', pop: 10.551, co2: 36.709, cons: 61.722, hist: 5.096 },
  "756": { name: 'Switzerland', pop: 8.871, co2: 31.977, cons: 118.33, hist: 3.126 },
  "760": { name: 'Syria', pop: 23.595, co2: 31.674, cons: null, hist: 2.024 },
  "762": { name: 'Tajikistan', pop: 10.39, co2: 10.264, cons: 13.021, hist: 0.507 },
  "764": { name: 'Thailand', pop: 71.702, co2: 264.734, cons: 305.567, hist: 8.041 },
  "768": { name: 'Togo', pop: 9.304, co2: 2.671, cons: 8.647, hist: 0.074 },
  "776": { name: 'Tonga', pop: 0.105, co2: 0.146, cons: null, hist: 0.005 },
  "780": { name: 'Trinidad and Tobago', pop: 1.503, co2: 35.536, cons: 22.352, hist: 1.676 },
  "784": { name: 'United Arab Emirates', pop: 10.642, co2: 210.425, cons: 248.068, hist: 5.602 },
  "788": { name: 'Tunisia', pop: 12.2, co2: 31.738, cons: 30.179, hist: 1.034 },
  "792": { name: 'Turkey', pop: 87.271, co2: 486.945, cons: 483.031, hist: 12.375 },
  "795": { name: 'Turkmenistan', pop: 7.364, co2: 95.421, cons: null, hist: 2.661 },
  "796": { name: 'Turks and Caicos Islands', pop: 0.046, co2: 0.365, cons: null, hist: 0.007 },
  "798": { name: 'Tuvalu', pop: 0.01, co2: 0.011, cons: null, hist: 0.0 },
  "800": { name: 'Uganda', pop: 48.657, co2: 6.236, cons: 8.802, hist: 0.125 },
  "804": { name: 'Ukraine', pop: 37.733, co2: 139.325, cons: 166.306, hist: 31.094 },
  "807": { name: 'North Macedonia', pop: 1.832, co2: 7.338, cons: null, hist: 0.531 },
  "818": { name: 'Egypt', pop: 114.536, co2: 250.23, cons: 253.428, hist: 7.213 },
  "826": { name: 'United Kingdom', pop: 68.683, co2: 307.826, cons: 487.1, hist: 79.767 },
  "834": { name: 'Tanzania', pop: 66.618, co2: 20.31, cons: 25.788, hist: 0.325 },
  "840": { name: 'United States', pop: 343.477, co2: 4918.407, cons: 5431.659, hist: 429.962 },
  "854": { name: 'Burkina Faso', pop: 23.026, co2: 6.308, cons: 5.801, hist: 0.089 },
  "858": { name: 'Uruguay', pop: 3.388, co2: 7.627, cons: 10.782, hist: 0.469 },
  "860": { name: 'Uzbekistan', pop: 35.652, co2: 122.872, cons: null, hist: 6.611 },
  "862": { name: 'Venezuela', pop: 28.301, co2: 119.588, cons: 100.516, hist: 7.77 },
  "876": { name: 'Wallis and Futuna', pop: 0.011, co2: 0.029, cons: null, hist: 0.001 },
  "882": { name: 'Samoa', pop: 0.217, co2: 0.235, cons: null, hist: 0.008 },
  "887": { name: 'Yemen', pop: 39.391, co2: 10.141, cons: null, hist: 0.698 },
  "894": { name: 'Zambia', pop: 20.724, co2: 11.831, cons: 12.705, hist: 0.289 },
};

const WORLD_TOTALS = {
  pop: 8091.735,   // millions
  population: 8091.735, // alias for pop (used by info panel)
  co2: 38094.039,  // Mt
  cons: 38094.039, // Mt (consumption ≈ territorial globally)
  hist: 1810.525   // Gt
};

function getWorldPerCapita(metric = "co2") {
  if (metric === "hist") return WORLD_TOTALS.hist / WORLD_TOTALS.pop;
  const key = metric === "cons" ? "cons" : "co2";
  return WORLD_TOTALS[key] / WORLD_TOTALS.pop;
}

function getBudgetRatio(isoCode, metric = "co2") {
  const d = CO2_DATA[isoCode];
  if (!d || !d.pop) return null;
  let val;
  if (metric === "hist") {
    val = d.hist;
  } else if (metric === "cons") {
    val = d.cons != null ? d.cons : d.co2;
  } else {
    val = d.co2;
  }
  if (val == null) return null;
  const perCapita = val / d.pop;
  const worldPC = getWorldPerCapita(metric);
  return perCapita / worldPC;
}

function getCountryStats(isoCode, metric = 'co2') {
  const d = CO2_DATA[isoCode];
  if (!d) return null;
  const ratio = getBudgetRatio(isoCode, metric);
  let metricPerCapita = null;
  if (metric === 'hist' && d.hist != null && d.pop) {
    metricPerCapita = (d.hist * 1000) / d.pop; // Gt→Mt for per-capita
  } else if (metric === 'cons') {
    const val = d.cons != null ? d.cons : d.co2;
    if (val != null && d.pop) metricPerCapita = val / d.pop;
  } else {
    if (d.co2 != null && d.pop) metricPerCapita = d.co2 / d.pop;
  }
  return {
    name: d.name,
    population: d.pop,
    co2: d.co2,
    cons: d.cons,
    hist: d.hist,
    consumption: d.cons,
    historical: d.hist,
    ratio: ratio,
    metricPerCapita: metricPerCapita,
    co2PerCapita: d.co2 && d.pop ? +(d.co2 / d.pop).toFixed(4) : null,
    consPerCapita: d.cons != null && d.pop ? +(d.cons / d.pop).toFixed(4) : null,
    histPerCapita: d.hist != null && d.pop ? +(d.hist / d.pop).toFixed(6) : null
  };
}
