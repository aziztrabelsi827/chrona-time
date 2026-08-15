/**
 * Sunrise / sunset calculation using the standard solar (sunrise) equation.
 *
 * No network calls — pure astronomy math. Accuracy is typically within ~1–2
 * minutes of published values, which is more than enough for a wall-clock
 * "Sunrise: 05:42" display. Handles polar day / polar night gracefully.
 *
 * Reference: https://en.wikipedia.org/wiki/Sunrise_equation
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date;
  polarDay: boolean; // sun never sets
  polarNight: boolean; // sun never rises
}

function julian(date: Date): number {
  return date.getTime() / 86400000 + 2440588.0;
}

/**
 * @param latitudeDeg  Latitude in decimal degrees
 * @param longitudeDeg Longitude in decimal degrees (west negative)
 * @param date         Reference instant. For best results pass an instant near
 *                     local noon of the calendar day you care about.
 */
export function computeSunTimes(
  latitudeDeg: number,
  longitudeDeg: number,
  date: Date
): SunTimes {
  const n = julian(date) - 2451545.0 + 0.0008;
  const jStar = n - longitudeDeg / 360; // approximate mean solar noon

  // Solar mean anomaly
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  // Equation of the center
  const C =
    1.9148 * Math.sin(M * RAD) +
    0.02 * Math.sin(2 * M * RAD) +
    0.0003 * Math.sin(3 * M * RAD);
  // Ecliptic longitude
  const lambda = (M + C + 180 + 102.9372) % 360;

  // Solar transit (solar noon) as a Julian date
  const jTransit =
    2451545.0 +
    jStar +
    0.0053 * Math.sin(M * RAD) -
    0.0069 * Math.sin(2 * lambda * RAD);

  // Declination of the sun
  const decl = Math.asin(Math.sin(lambda * RAD) * Math.sin(23.44 * RAD)) * DEG;

  const sinLat = Math.sin(latitudeDeg * RAD);
  const cosLat = Math.cos(latitudeDeg * RAD);
  const sinDecl = Math.sin(decl * RAD);
  const cosDecl = Math.cos(decl * RAD);

  // Hour angle for -0.833° (accounts for atmospheric refraction + solar disk)
  const cosH = (Math.sin(-0.833 * RAD) - sinLat * sinDecl) / (cosLat * cosDecl);

  if (cosH > 1) {
    return {
      sunrise: null,
      sunset: null,
      solarNoon: new Date((jTransit - 2440588.0) * 86400000),
      polarDay: false,
      polarNight: true,
    };
  }

  if (cosH < -1) {
    return {
      sunrise: null,
      sunset: null,
      solarNoon: new Date((jTransit - 2440588.0) * 86400000),
      polarDay: true,
      polarNight: false,
    };
  }

  const H = Math.acos(cosH) * DEG;
  const jSet = jTransit + H / 360;
  const jRise = jTransit - H / 360;

  return {
    sunrise: new Date((jRise - 2440588.0) * 86400000),
    sunset: new Date((jSet - 2440588.0) * 86400000),
    solarNoon: new Date((jTransit - 2440588.0) * 86400000),
    polarDay: false,
    polarNight: false,
  };
}
