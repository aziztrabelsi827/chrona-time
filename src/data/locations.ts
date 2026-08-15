/**
 * Location data model — the single source of truth for every place we build a
 * page for. Kept separate from UI so it can grow to thousands of entries
 * (or be swapped for a database / CMS) without touching components.
 *
 * Offsets are deliberately NOT stored here. They are always computed live from
 * the IANA `timezone` identifier so daylight-saving rules stay correct.
 */

export interface City {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  lat: number;
  lng: number;
  population?: number;
  popular?: boolean;
  aliases?: string[];
}

export interface Country {
  slug: string;
  name: string;
  code: string;
  continent: Continent;
  // Optional declared capital. Omitted where it would be disputed/unnecessary
  // (e.g. Israel). Not required for any time calculation.
  capital?: string;
  // Geographic reference city for country-level sunrise/sunset and the
  // representative location. Defaults to `capital` when not specified.
  referenceCitySlug?: string;
  timezones: string[]; // IANA zones that apply across the country's territory
  lat: number;
  lng: number;
  phoneCode?: string;
  popular?: boolean;
  aliases?: string[];
}

export type Continent =
  | "Africa"
  | "Europe"
  | "Asia"
  | "North America"
  | "South America"
  | "Oceania";

export const COUNTRIES: Country[] = [
  { slug: "tunisia", name: "Tunisia", code: "TN", continent: "Africa", capital: "tunis", timezones: ["Africa/Tunis"], lat: 36.8, lng: 10.18, phoneCode: "+216", popular: true, aliases: ["tunisie"] },
  { slug: "egypt", name: "Egypt", code: "EG", continent: "Africa", capital: "cairo", timezones: ["Africa/Cairo"], lat: 30.04, lng: 31.24, phoneCode: "+20", popular: true },
  { slug: "morocco", name: "Morocco", code: "MA", continent: "Africa", capital: "rabat", timezones: ["Africa/Casablanca"], lat: 34.02, lng: -6.84, phoneCode: "+212" },
  { slug: "south-africa", name: "South Africa", code: "ZA", continent: "Africa", capital: "pretoria", timezones: ["Africa/Johannesburg"], lat: -25.75, lng: 28.23, phoneCode: "+27", popular: true },
  { slug: "kenya", name: "Kenya", code: "KE", continent: "Africa", capital: "nairobi", timezones: ["Africa/Nairobi"], lat: -1.29, lng: 36.82, phoneCode: "+254" },
  { slug: "nigeria", name: "Nigeria", code: "NG", continent: "Africa", capital: "abuja", timezones: ["Africa/Lagos"], lat: 9.08, lng: 7.4, phoneCode: "+234", popular: true },
  { slug: "algeria", name: "Algeria", code: "DZ", continent: "Africa", capital: "algiers", timezones: ["Africa/Algiers"], lat: 36.75, lng: 3.06, phoneCode: "+213" },

  { slug: "united-kingdom", name: "United Kingdom", code: "GB", continent: "Europe", capital: "london", timezones: ["Europe/London"], lat: 51.51, lng: -0.13, phoneCode: "+44", popular: true, aliases: ["uk", "britain", "great britain", "england"] },
  { slug: "france", name: "France", code: "FR", continent: "Europe", capital: "paris", timezones: ["Europe/Paris"], lat: 48.85, lng: 2.35, phoneCode: "+33", popular: true },
  { slug: "germany", name: "Germany", code: "DE", continent: "Europe", capital: "berlin", timezones: ["Europe/Berlin"], lat: 52.52, lng: 13.4, phoneCode: "+49", popular: true, aliases: ["deutschland"] },
  { slug: "italy", name: "Italy", code: "IT", continent: "Europe", capital: "rome", timezones: ["Europe/Rome"], lat: 41.9, lng: 12.5, phoneCode: "+39", popular: true, aliases: ["italia"] },
  { slug: "spain", name: "Spain", code: "ES", continent: "Europe", capital: "madrid", timezones: ["Europe/Madrid", "Atlantic/Canary"], lat: 40.42, lng: -3.7, phoneCode: "+34", popular: true, aliases: ["espana"] },
  { slug: "netherlands", name: "Netherlands", code: "NL", continent: "Europe", capital: "amsterdam", timezones: ["Europe/Amsterdam"], lat: 52.37, lng: 4.9, phoneCode: "+31", aliases: ["holland"] },
  { slug: "belgium", name: "Belgium", code: "BE", continent: "Europe", capital: "brussels", timezones: ["Europe/Brussels"], lat: 50.85, lng: 4.35, phoneCode: "+32" },
  { slug: "switzerland", name: "Switzerland", code: "CH", continent: "Europe", capital: "bern", timezones: ["Europe/Zurich"], lat: 46.95, lng: 7.45, phoneCode: "+41" },
  { slug: "austria", name: "Austria", code: "AT", continent: "Europe", capital: "vienna", timezones: ["Europe/Vienna"], lat: 48.21, lng: 16.37, phoneCode: "+43" },
  { slug: "portugal", name: "Portugal", code: "PT", continent: "Europe", capital: "lisbon", timezones: ["Europe/Lisbon", "Atlantic/Azores"], lat: 38.72, lng: -9.14, phoneCode: "+351" },
  { slug: "ireland", name: "Ireland", code: "IE", continent: "Europe", capital: "dublin", timezones: ["Europe/Dublin"], lat: 53.35, lng: -6.26, phoneCode: "+353" },
  { slug: "poland", name: "Poland", code: "PL", continent: "Europe", capital: "warsaw", timezones: ["Europe/Warsaw"], lat: 52.23, lng: 21.01, phoneCode: "+48" },
  { slug: "czechia", name: "Czechia", code: "CZ", continent: "Europe", capital: "prague", timezones: ["Europe/Prague"], lat: 50.08, lng: 14.44, phoneCode: "+420", aliases: ["czech republic"] },
  { slug: "sweden", name: "Sweden", code: "SE", continent: "Europe", capital: "stockholm", timezones: ["Europe/Stockholm"], lat: 59.33, lng: 18.07, phoneCode: "+46" },
  { slug: "norway", name: "Norway", code: "NO", continent: "Europe", capital: "oslo", timezones: ["Europe/Oslo"], lat: 59.91, lng: 10.75, phoneCode: "+47" },
  { slug: "denmark", name: "Denmark", code: "DK", continent: "Europe", capital: "copenhagen", timezones: ["Europe/Copenhagen"], lat: 55.68, lng: 12.57, phoneCode: "+45" },
  { slug: "finland", name: "Finland", code: "FI", continent: "Europe", capital: "helsinki", timezones: ["Europe/Helsinki"], lat: 60.17, lng: 24.94, phoneCode: "+358" },
  { slug: "greece", name: "Greece", code: "GR", continent: "Europe", capital: "athens", timezones: ["Europe/Athens"], lat: 37.98, lng: 23.73, phoneCode: "+30" },
  { slug: "russia", name: "Russia", code: "RU", continent: "Europe", capital: "moscow", timezones: ["Europe/Kaliningrad", "Europe/Moscow", "Europe/Samara", "Asia/Yekaterinburg", "Asia/Omsk", "Asia/Novosibirsk", "Asia/Krasnoyarsk", "Asia/Irkutsk", "Asia/Yakutsk", "Asia/Vladivostok", "Asia/Magadan", "Asia/Kamchatka", "Asia/Anadyr"], lat: 55.76, lng: 37.62, phoneCode: "+7", popular: true },
  { slug: "turkey", name: "Turkey", code: "TR", continent: "Europe", capital: "ankara", timezones: ["Europe/Istanbul"], lat: 39.93, lng: 32.86, phoneCode: "+90", popular: true, aliases: ["turkiye"] },
  { slug: "hungary", name: "Hungary", code: "HU", continent: "Europe", capital: "budapest", timezones: ["Europe/Budapest"], lat: 47.5, lng: 19.04, phoneCode: "+36", popular: true },
  { slug: "romania", name: "Romania", code: "RO", continent: "Europe", capital: "bucharest", timezones: ["Europe/Bucharest"], lat: 44.43, lng: 26.1, phoneCode: "+40" },

  { slug: "united-arab-emirates", name: "United Arab Emirates", code: "AE", continent: "Asia", capital: "abu-dhabi", timezones: ["Asia/Dubai"], lat: 24.45, lng: 54.38, phoneCode: "+971", popular: true, aliases: ["uae", "emirates"] },
  { slug: "saudi-arabia", name: "Saudi Arabia", code: "SA", continent: "Asia", capital: "riyadh", timezones: ["Asia/Riyadh"], lat: 24.71, lng: 46.68, phoneCode: "+966", popular: true },
  { slug: "qatar", name: "Qatar", code: "QA", continent: "Asia", capital: "doha", timezones: ["Asia/Qatar"], lat: 25.29, lng: 51.51, phoneCode: "+974" },
  { slug: "kuwait", name: "Kuwait", code: "KW", continent: "Asia", capital: "kuwait-city", timezones: ["Asia/Kuwait"], lat: 29.38, lng: 47.98, phoneCode: "+965" },
  { slug: "oman", name: "Oman", code: "OM", continent: "Asia", capital: "muscat", timezones: ["Asia/Muscat"], lat: 23.59, lng: 58.38, phoneCode: "+968" },
  { slug: "israel", name: "Israel", code: "IL", continent: "Asia", referenceCitySlug: "tel-aviv", timezones: ["Asia/Jerusalem"], lat: 32.08, lng: 34.78, phoneCode: "+972" },
  { slug: "japan", name: "Japan", code: "JP", continent: "Asia", capital: "tokyo", timezones: ["Asia/Tokyo"], lat: 35.68, lng: 139.69, phoneCode: "+81", popular: true, aliases: ["nihon"] },
  { slug: "china", name: "China", code: "CN", continent: "Asia", capital: "beijing", timezones: ["Asia/Shanghai"], lat: 39.9, lng: 116.41, phoneCode: "+86", popular: true },
  { slug: "singapore", name: "Singapore", code: "SG", continent: "Asia", capital: "singapore", timezones: ["Asia/Singapore"], lat: 1.35, lng: 103.82, phoneCode: "+65", popular: true },
  { slug: "india", name: "India", code: "IN", continent: "Asia", capital: "delhi", timezones: ["Asia/Kolkata"], lat: 28.61, lng: 77.21, phoneCode: "+91", popular: true, aliases: ["bharat"] },
  { slug: "thailand", name: "Thailand", code: "TH", continent: "Asia", capital: "bangkok", timezones: ["Asia/Bangkok"], lat: 13.76, lng: 100.5, phoneCode: "+66" },
  { slug: "south-korea", name: "South Korea", code: "KR", continent: "Asia", capital: "seoul", timezones: ["Asia/Seoul"], lat: 37.57, lng: 126.98, phoneCode: "+82", aliases: ["korea"] },
  { slug: "indonesia", name: "Indonesia", code: "ID", continent: "Asia", capital: "jakarta", timezones: ["Asia/Jakarta", "Asia/Pontianak", "Asia/Makassar", "Asia/Jayapura"], lat: -6.21, lng: 106.85, phoneCode: "+62" },
  { slug: "philippines", name: "Philippines", code: "PH", continent: "Asia", capital: "manila", timezones: ["Asia/Manila"], lat: 14.6, lng: 120.98, phoneCode: "+63" },
  { slug: "malaysia", name: "Malaysia", code: "MY", continent: "Asia", capital: "kuala-lumpur", timezones: ["Asia/Kuala_Lumpur"], lat: 3.14, lng: 101.69, phoneCode: "+60" },
  { slug: "pakistan", name: "Pakistan", code: "PK", continent: "Asia", capital: "islamabad", timezones: ["Asia/Karachi"], lat: 33.68, lng: 73.05, phoneCode: "+92" },

  { slug: "united-states", name: "United States", code: "US", continent: "North America", capital: "washington-dc", timezones: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix", "America/Anchorage", "Pacific/Honolulu"], lat: 38.91, lng: -77.04, phoneCode: "+1", popular: true, aliases: ["usa", "america"] },
  { slug: "canada", name: "Canada", code: "CA", continent: "North America", capital: "ottawa", timezones: ["America/St_Johns", "America/Halifax", "America/Toronto", "America/Winnipeg", "America/Regina", "America/Edmonton", "America/Vancouver"], lat: 45.42, lng: -75.7, phoneCode: "+1", popular: true },
  { slug: "mexico", name: "Mexico", code: "MX", continent: "North America", capital: "mexico-city", timezones: ["America/Tijuana", "America/Mazatlan", "America/Chihuahua", "America/Mexico_City", "America/Monterrey", "America/Cancun"], lat: 19.43, lng: -99.13, phoneCode: "+52" },
  { slug: "brazil", name: "Brazil", code: "BR", continent: "South America", capital: "brasilia", timezones: ["America/Noronha", "America/Sao_Paulo", "America/Manaus", "America/Rio_Branco"], lat: -15.79, lng: -47.88, phoneCode: "+55", popular: true, aliases: ["brasil"] },
  { slug: "argentina", name: "Argentina", code: "AR", continent: "South America", capital: "buenos-aires", timezones: ["America/Argentina/Buenos_Aires"], lat: -34.6, lng: -58.38, phoneCode: "+54", popular: true },

  { slug: "australia", name: "Australia", code: "AU", continent: "Oceania", capital: "canberra", timezones: ["Australia/Perth", "Australia/Darwin", "Australia/Adelaide", "Australia/Brisbane", "Australia/Sydney", "Australia/Hobart", "Australia/Lord_Howe"], lat: -35.28, lng: 149.13, phoneCode: "+61", popular: true },
  { slug: "new-zealand", name: "New Zealand", code: "NZ", continent: "Oceania", capital: "wellington", timezones: ["Pacific/Auckland"], lat: -41.29, lng: 174.78, phoneCode: "+64" },
];

export const CITIES: City[] = [
  // Tunisia
  { slug: "tunis", name: "Tunis", country: "Tunisia", countryCode: "TN", timezone: "Africa/Tunis", lat: 36.8, lng: 10.18, population: 2300000, popular: true, aliases: ["tunisie"] },
  { slug: "sousse", name: "Sousse", country: "Tunisia", countryCode: "TN", timezone: "Africa/Tunis", lat: 35.83, lng: 10.64, population: 674000, popular: true },
  { slug: "sfax", name: "Sfax", country: "Tunisia", countryCode: "TN", timezone: "Africa/Tunis", lat: 34.74, lng: 10.76, population: 330000 },

  // Egypt
  { slug: "cairo", name: "Cairo", country: "Egypt", countryCode: "EG", timezone: "Africa/Cairo", lat: 30.04, lng: 31.24, population: 21000000, popular: true },
  { slug: "alexandria", name: "Alexandria", country: "Egypt", countryCode: "EG", timezone: "Africa/Cairo", lat: 31.2, lng: 29.92, population: 5400000 },

  // Morocco
  { slug: "casablanca", name: "Casablanca", country: "Morocco", countryCode: "MA", timezone: "Africa/Casablanca", lat: 33.57, lng: -7.59, population: 3360000 },
  { slug: "marrakesh", name: "Marrakesh", country: "Morocco", countryCode: "MA", timezone: "Africa/Casablanca", lat: 31.63, lng: -7.99, population: 930000, aliases: ["marrakech"] },

  // South Africa
  { slug: "johannesburg", name: "Johannesburg", country: "South Africa", countryCode: "ZA", timezone: "Africa/Johannesburg", lat: -26.2, lng: 28.05, population: 5600000, popular: true },
  { slug: "cape-town", name: "Cape Town", country: "South Africa", countryCode: "ZA", timezone: "Africa/Johannesburg", lat: -33.92, lng: 18.42, population: 4700000 },

  // Kenya
  { slug: "nairobi", name: "Nairobi", country: "Kenya", countryCode: "KE", timezone: "Africa/Nairobi", lat: -1.29, lng: 36.82, population: 4400000 },

  // Nigeria
  { slug: "lagos", name: "Lagos", country: "Nigeria", countryCode: "NG", timezone: "Africa/Lagos", lat: 6.52, lng: 3.38, population: 15300000, popular: true },

  // Algeria
  { slug: "algiers", name: "Algiers", country: "Algeria", countryCode: "DZ", timezone: "Africa/Algiers", lat: 36.75, lng: 3.06, population: 2800000 },

  // United Kingdom
  { slug: "london", name: "London", country: "United Kingdom", countryCode: "GB", timezone: "Europe/London", lat: 51.51, lng: -0.13, population: 9000000, popular: true, aliases: ["london uk", "greater london"] },
  { slug: "manchester", name: "Manchester", country: "United Kingdom", countryCode: "GB", timezone: "Europe/London", lat: 53.48, lng: -2.24, population: 550000 },
  { slug: "edinburgh", name: "Edinburgh", country: "United Kingdom", countryCode: "GB", timezone: "Europe/London", lat: 55.95, lng: -3.19, population: 540000 },

  // France
  { slug: "paris", name: "Paris", country: "France", countryCode: "FR", timezone: "Europe/Paris", lat: 48.85, lng: 2.35, population: 11100000, popular: true },
  { slug: "lyon", name: "Lyon", country: "France", countryCode: "FR", timezone: "Europe/Paris", lat: 45.76, lng: 4.84, population: 1720000 },
  { slug: "marseille", name: "Marseille", country: "France", countryCode: "FR", timezone: "Europe/Paris", lat: 43.3, lng: 5.37, population: 1610000 },

  // Germany
  { slug: "berlin", name: "Berlin", country: "Germany", countryCode: "DE", timezone: "Europe/Berlin", lat: 52.52, lng: 13.4, population: 3600000, popular: true },
  { slug: "munich", name: "Munich", country: "Germany", countryCode: "DE", timezone: "Europe/Berlin", lat: 48.14, lng: 11.58, population: 1500000, aliases: ["münchen"] },
  { slug: "frankfurt", name: "Frankfurt", country: "Germany", countryCode: "DE", timezone: "Europe/Berlin", lat: 50.11, lng: 8.68, population: 760000 },

  // Italy
  { slug: "rome", name: "Rome", country: "Italy", countryCode: "IT", timezone: "Europe/Rome", lat: 41.9, lng: 12.5, population: 4300000, popular: true, aliases: ["roma"] },
  { slug: "milan", name: "Milan", country: "Italy", countryCode: "IT", timezone: "Europe/Rome", lat: 45.46, lng: 9.19, population: 3200000, aliases: ["milano"] },

  // Spain
  { slug: "madrid", name: "Madrid", country: "Spain", countryCode: "ES", timezone: "Europe/Madrid", lat: 40.42, lng: -3.7, population: 6700000, popular: true },
  { slug: "barcelona", name: "Barcelona", country: "Spain", countryCode: "ES", timezone: "Europe/Madrid", lat: 41.39, lng: 2.16, population: 5600000 },

  // Netherlands / Belgium / Switzerland / Austria / Portugal / Ireland
  { slug: "amsterdam", name: "Amsterdam", country: "Netherlands", countryCode: "NL", timezone: "Europe/Amsterdam", lat: 52.37, lng: 4.9, population: 900000 },
  { slug: "brussels", name: "Brussels", country: "Belgium", countryCode: "BE", timezone: "Europe/Brussels", lat: 50.85, lng: 4.35, population: 2100000 },
  { slug: "zurich", name: "Zurich", country: "Switzerland", countryCode: "CH", timezone: "Europe/Zurich", lat: 47.37, lng: 8.54, population: 1400000, aliases: ["zürich"] },
  { slug: "geneva", name: "Geneva", country: "Switzerland", countryCode: "CH", timezone: "Europe/Zurich", lat: 46.2, lng: 6.14, population: 620000 },
  { slug: "vienna", name: "Vienna", country: "Austria", countryCode: "AT", timezone: "Europe/Vienna", lat: 48.21, lng: 16.37, population: 1900000, aliases: ["wien"] },
  { slug: "lisbon", name: "Lisbon", country: "Portugal", countryCode: "PT", timezone: "Europe/Lisbon", lat: 38.72, lng: -9.14, population: 2900000, aliases: ["lisboa"] },
  { slug: "dublin", name: "Dublin", country: "Ireland", countryCode: "IE", timezone: "Europe/Dublin", lat: 53.35, lng: -6.26, population: 1400000 },

  // Central / Eastern Europe
  { slug: "warsaw", name: "Warsaw", country: "Poland", countryCode: "PL", timezone: "Europe/Warsaw", lat: 52.23, lng: 21.01, population: 1800000 },
  { slug: "prague", name: "Prague", country: "Czechia", countryCode: "CZ", timezone: "Europe/Prague", lat: 50.08, lng: 14.44, population: 1300000, aliases: ["praha"] },
  { slug: "stockholm", name: "Stockholm", country: "Sweden", countryCode: "SE", timezone: "Europe/Stockholm", lat: 59.33, lng: 18.07, population: 1700000 },
  { slug: "oslo", name: "Oslo", country: "Norway", countryCode: "NO", timezone: "Europe/Oslo", lat: 59.91, lng: 10.75, population: 1100000 },
  { slug: "copenhagen", name: "Copenhagen", country: "Denmark", countryCode: "DK", timezone: "Europe/Copenhagen", lat: 55.68, lng: 12.57, population: 1400000, aliases: ["københavn"] },
  { slug: "helsinki", name: "Helsinki", country: "Finland", countryCode: "FI", timezone: "Europe/Helsinki", lat: 60.17, lng: 24.94, population: 660000 },
  { slug: "athens", name: "Athens", country: "Greece", countryCode: "GR", timezone: "Europe/Athens", lat: 37.98, lng: 23.73, population: 3200000 },
  { slug: "moscow", name: "Moscow", country: "Russia", countryCode: "RU", timezone: "Europe/Moscow", lat: 55.76, lng: 37.62, population: 12600000, popular: true },
  { slug: "istanbul", name: "Istanbul", country: "Turkey", countryCode: "TR", timezone: "Europe/Istanbul", lat: 41.01, lng: 28.98, population: 15500000, popular: true },
  { slug: "budapest", name: "Budapest", country: "Hungary", countryCode: "HU", timezone: "Europe/Budapest", lat: 47.5, lng: 19.04, population: 1800000, popular: true },
  { slug: "bucharest", name: "Bucharest", country: "Romania", countryCode: "RO", timezone: "Europe/Bucharest", lat: 44.43, lng: 26.1, population: 1800000 },

  // Middle East
  { slug: "dubai", name: "Dubai", country: "United Arab Emirates", countryCode: "AE", timezone: "Asia/Dubai", lat: 25.2, lng: 55.27, population: 3500000, popular: true },
  { slug: "abu-dhabi", name: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", timezone: "Asia/Dubai", lat: 24.45, lng: 54.38, population: 1500000 },
  { slug: "riyadh", name: "Riyadh", country: "Saudi Arabia", countryCode: "SA", timezone: "Asia/Riyadh", lat: 24.71, lng: 46.68, population: 7600000, popular: true },
  { slug: "jeddah", name: "Jeddah", country: "Saudi Arabia", countryCode: "SA", timezone: "Asia/Riyadh", lat: 21.49, lng: 39.18, population: 4600000 },
  { slug: "doha", name: "Doha", country: "Qatar", countryCode: "QA", timezone: "Asia/Qatar", lat: 25.29, lng: 51.51, population: 2400000 },
  { slug: "kuwait-city", name: "Kuwait City", country: "Kuwait", countryCode: "KW", timezone: "Asia/Kuwait", lat: 29.38, lng: 47.98, population: 3300000 },
  { slug: "muscat", name: "Muscat", country: "Oman", countryCode: "OM", timezone: "Asia/Muscat", lat: 23.59, lng: 58.38, population: 1600000 },
  { slug: "tel-aviv", name: "Tel Aviv", country: "Israel", countryCode: "IL", timezone: "Asia/Jerusalem", lat: 32.08, lng: 34.78, population: 4500000 },
  { slug: "jerusalem", name: "Jerusalem", country: "Israel", countryCode: "IL", timezone: "Asia/Jerusalem", lat: 31.78, lng: 35.22, population: 950000 },

  // East / South / SE Asia
  { slug: "tokyo", name: "Tokyo", country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo", lat: 35.68, lng: 139.69, population: 37400000, popular: true },
  { slug: "osaka", name: "Osaka", country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo", lat: 34.69, lng: 135.5, population: 19000000 },
  { slug: "beijing", name: "Beijing", country: "China", countryCode: "CN", timezone: "Asia/Shanghai", lat: 39.9, lng: 116.41, population: 21500000, popular: true, aliases: ["peking"] },
  { slug: "shanghai", name: "Shanghai", country: "China", countryCode: "CN", timezone: "Asia/Shanghai", lat: 31.23, lng: 121.47, population: 28000000, popular: true },
  { slug: "hong-kong", name: "Hong Kong", country: "China", countryCode: "CN", timezone: "Asia/Hong_Kong", lat: 22.32, lng: 114.17, population: 7500000, popular: true },
  { slug: "singapore", name: "Singapore", country: "Singapore", countryCode: "SG", timezone: "Asia/Singapore", lat: 1.35, lng: 103.82, population: 5700000, popular: true },
  { slug: "mumbai", name: "Mumbai", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 19.08, lng: 72.88, population: 21400000, popular: true, aliases: ["bombay"] },
  { slug: "delhi", name: "New Delhi", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 28.61, lng: 77.21, population: 32000000, popular: true, aliases: ["new delhi", "delhi"] },
  { slug: "bengaluru", name: "Bengaluru", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 12.97, lng: 77.59, population: 13000000, aliases: ["bangalore"] },
  { slug: "bangkok", name: "Bangkok", country: "Thailand", countryCode: "TH", timezone: "Asia/Bangkok", lat: 13.76, lng: 100.5, population: 10700000, popular: true },
  { slug: "seoul", name: "Seoul", country: "South Korea", countryCode: "KR", timezone: "Asia/Seoul", lat: 37.57, lng: 126.98, population: 9900000, popular: true },
  { slug: "jakarta", name: "Jakarta", country: "Indonesia", countryCode: "ID", timezone: "Asia/Jakarta", lat: -6.21, lng: 106.85, population: 11000000 },
  { slug: "manila", name: "Manila", country: "Philippines", countryCode: "PH", timezone: "Asia/Manila", lat: 14.6, lng: 120.98, population: 14000000 },
  { slug: "kuala-lumpur", name: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", timezone: "Asia/Kuala_Lumpur", lat: 3.14, lng: 101.69, population: 8400000, aliases: ["kl"] },
  { slug: "karachi", name: "Karachi", country: "Pakistan", countryCode: "PK", timezone: "Asia/Karachi", lat: 24.86, lng: 67.01, population: 16500000 },

  // Americas
  { slug: "new-york", name: "New York", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 40.71, lng: -74.01, population: 18800000, popular: true, aliases: ["nyc", "new york city", "manhattan"] },
  { slug: "los-angeles", name: "Los Angeles", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 34.05, lng: -118.24, population: 12500000, popular: true, aliases: ["la"] },
  { slug: "chicago", name: "Chicago", country: "United States", countryCode: "US", timezone: "America/Chicago", lat: 41.88, lng: -87.63, population: 8900000, popular: true },
  { slug: "houston", name: "Houston", country: "United States", countryCode: "US", timezone: "America/Chicago", lat: 29.76, lng: -95.37, population: 7000000 },
  { slug: "miami", name: "Miami", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 25.76, lng: -80.19, population: 6300000 },
  { slug: "seattle", name: "Seattle", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 47.61, lng: -122.33, population: 4000000 },
  { slug: "san-francisco", name: "San Francisco", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 37.77, lng: -122.42, population: 4700000, aliases: ["sf", "frisco"] },
  { slug: "denver", name: "Denver", country: "United States", countryCode: "US", timezone: "America/Denver", lat: 39.74, lng: -104.99, population: 2900000 },
  { slug: "honolulu", name: "Honolulu", country: "United States", countryCode: "US", timezone: "Pacific/Honolulu", lat: 21.31, lng: -157.86, population: 990000 },
  { slug: "toronto", name: "Toronto", country: "Canada", countryCode: "CA", timezone: "America/Toronto", lat: 43.65, lng: -79.38, population: 6400000, popular: true },
  { slug: "vancouver", name: "Vancouver", country: "Canada", countryCode: "CA", timezone: "America/Vancouver", lat: 49.28, lng: -123.12, population: 2600000 },
  { slug: "montreal", name: "Montreal", country: "Canada", countryCode: "CA", timezone: "America/Toronto", lat: 45.5, lng: -73.57, population: 4300000, aliases: ["montréal"] },
  { slug: "calgary", name: "Calgary", country: "Canada", countryCode: "CA", timezone: "America/Edmonton", lat: 51.05, lng: -114.07, population: 1500000 },
  { slug: "mexico-city", name: "Mexico City", country: "Mexico", countryCode: "MX", timezone: "America/Mexico_City", lat: 19.43, lng: -99.13, population: 22000000, popular: true, aliases: ["ciudad de mexico", "cdmx"] },
  { slug: "sao-paulo", name: "São Paulo", country: "Brazil", countryCode: "BR", timezone: "America/Sao_Paulo", lat: -23.55, lng: -46.63, population: 22400000, popular: true, aliases: ["são paulo", "sao paulo"] },
  { slug: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", timezone: "America/Sao_Paulo", lat: -22.91, lng: -43.17, population: 13700000, aliases: ["rio"] },
  { slug: "buenos-aires", name: "Buenos Aires", country: "Argentina", countryCode: "AR", timezone: "America/Argentina/Buenos_Aires", lat: -34.6, lng: -58.38, population: 15400000, popular: true },

  // Oceania
  { slug: "sydney", name: "Sydney", country: "Australia", countryCode: "AU", timezone: "Australia/Sydney", lat: -33.87, lng: 151.21, population: 5400000, popular: true },
  { slug: "melbourne", name: "Melbourne", country: "Australia", countryCode: "AU", timezone: "Australia/Melbourne", lat: -37.81, lng: 144.96, population: 5100000 },
  { slug: "perth", name: "Perth", country: "Australia", countryCode: "AU", timezone: "Australia/Perth", lat: -31.95, lng: 115.86, population: 2100000 },
  { slug: "brisbane", name: "Brisbane", country: "Australia", countryCode: "AU", timezone: "Australia/Brisbane", lat: -27.47, lng: 153.02, population: 2600000 },
  { slug: "auckland", name: "Auckland", country: "New Zealand", countryCode: "NZ", timezone: "Pacific/Auckland", lat: -36.85, lng: 174.76, population: 1700000 },

  // National capitals (added so every country.capital resolves to a real city)
  { slug: "washington-dc", name: "Washington, D.C.", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 38.91, lng: -77.04, population: 6300000 },
  { slug: "ottawa", name: "Ottawa", country: "Canada", countryCode: "CA", timezone: "America/Toronto", lat: 45.42, lng: -75.7, population: 1400000 },
  { slug: "brasilia", name: "Brasília", country: "Brazil", countryCode: "BR", timezone: "America/Sao_Paulo", lat: -15.79, lng: -47.88, population: 4800000 },
  { slug: "canberra", name: "Canberra", country: "Australia", countryCode: "AU", timezone: "Australia/Sydney", lat: -35.28, lng: 149.13, population: 460000 },
  { slug: "wellington", name: "Wellington", country: "New Zealand", countryCode: "NZ", timezone: "Pacific/Auckland", lat: -41.29, lng: 174.78, population: 430000 },
  { slug: "abuja", name: "Abuja", country: "Nigeria", countryCode: "NG", timezone: "Africa/Lagos", lat: 9.08, lng: 7.4, population: 3600000 },
  { slug: "ankara", name: "Ankara", country: "Turkey", countryCode: "TR", timezone: "Europe/Istanbul", lat: 39.93, lng: 32.86, population: 5700000 },
  { slug: "pretoria", name: "Pretoria", country: "South Africa", countryCode: "ZA", timezone: "Africa/Johannesburg", lat: -25.75, lng: 28.23, population: 2500000 },
  { slug: "rabat", name: "Rabat", country: "Morocco", countryCode: "MA", timezone: "Africa/Casablanca", lat: 34.02, lng: -6.84, population: 1900000 },
  { slug: "bern", name: "Bern", country: "Switzerland", countryCode: "CH", timezone: "Europe/Zurich", lat: 46.95, lng: 7.45, population: 430000 },
  { slug: "islamabad", name: "Islamabad", country: "Pakistan", countryCode: "PK", timezone: "Asia/Karachi", lat: 33.68, lng: 73.05, population: 1100000 },
];

// Time-zone data now lives in `src/data/timezones.ts` as its own entity,
// separate from cities and countries.
