import { getPanchangamDetails, Observer, tithiNames, yogaNames, dayNames, matchKundli, checkMangalDosha, getUpcomingFestivals, getKundli } from '@ishubhamx/panchangam-js';
import { Body, MakeTime, EclipticLongitude } from 'astronomy-engine';
import type { Profile } from './db';

export interface PlanetPosition {
  name: string;
  sign: number; // 0-11 (Aries to Pisces)
  degree: number;
  nakshatra?: string;
  pada?: number;
}

export interface AstrologyDetails {
  lagnaSign: number;
  planets: PlanetPosition[];
  navamsha: {
    lagnaSign: number;
    planets: PlanetPosition[];
  };
  rasi: string;
  rasiIndex: number;
  nakshatra: string;
  nakshatraIndex: number;
  pada: number;
  dashaBalance: string;
  birthNakshatra: string;
  
  // Panchangam advanced data
  birthDateObj: Date;
  tithiInfo: { name: string; paksha: string; index: number };
  yogaInfo: { name: string; index: number };
  karanaName: string;
  varaName: string;
  
  // Celestial times
  sunMoonTimes: {
    sunrise: Date | null;
    sunset: Date | null;
    moonrise: Date | null;
    moonset: Date | null;
  };
  
  // Muhurta / Kalams
  muhurta: {
    rahuKalamStart: Date | null;
    rahuKalamEnd: Date | null;
    yamagandaKalamStart: Date | null;
    yamagandaKalamEnd: Date | null;
    gulikaKalamStart: Date | null;
    gulikaKalamEnd: Date | null;
  };
  
  // Vimshottari
  vimshottariFullCycle: Array<{ planet: string; startTime: Date; endTime: Date }>;
  currentMahadasha: { planet: string; endTime: Date } | null;
  
  // Store coordinates for downstream use
  latitude: number;
  longitude: number;
}

const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export function calculateChart(
  date: string, 
  time: string, 
  lat: number, 
  lng: number
): AstrologyDetails {
  try {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    const dateObj = new Date(year, month - 1, day, hours, minutes);
    const observer = new Observer(lat, lng, 0);

    const panchangam = getPanchangamDetails(dateObj, observer);

    const planets: PlanetPosition[] = [];
    const navamshaPlanets: PlanetPosition[] = [];
    const pp = panchangam.planetaryPositions;
    
    // Helper to calculate Navamsha (D-9) sign from absolute degrees
    const getNavamshaSign = (sign: number, degree: number) => {
      const absoluteDeg = sign * 30 + degree;
      return Math.floor(absoluteDeg / (10 / 3)) % 12;
    };

    const getNakshatraData = (sign: number, degree: number) => {
      const absoluteDeg = sign * 30 + degree;
      const nakIdx = Math.floor(absoluteDeg / (40 / 3));
      const pada = Math.floor(absoluteDeg / (10 / 3)) % 4 + 1;
      return { nakshatra: NAKSHATRA_NAMES[nakIdx] || 'Unknown', pada };
    };

    if (pp) {
      const ayanamsa = panchangam.ayanamsa || 0;
      
      const addOuterPlanet = (body: Body) => {
        let l = EclipticLongitude(body, MakeTime(dateObj));
        l = (l - ayanamsa + 360) % 360; // Sidereal
        return { rashi: Math.floor(l / 30), degree: l % 30 };
      };

      const pMap = [
        { name: 'Sun', data: pp.sun },
        { name: 'Moon', data: pp.moon },
        { name: 'Mars', data: pp.mars },
        { name: 'Mercury', data: pp.mercury },
        { name: 'Jupiter', data: pp.jupiter },
        { name: 'Venus', data: pp.venus },
        { name: 'Saturn', data: pp.saturn },
        { name: 'Rahu', data: pp.rahu },
        { name: 'Ketu', data: pp.ketu },
        { name: 'Uranus', data: addOuterPlanet(Body.Uranus) },
        { name: 'Neptune', data: addOuterPlanet(Body.Neptune) },
        { name: 'Pluto', data: addOuterPlanet(Body.Pluto) },
      ];

      for (const p of pMap) {
        if (p.data) {
          const { nakshatra, pada } = getNakshatraData(p.data.rashi, p.data.degree);
          planets.push({
            name: p.name,
            sign: p.data.rashi,
            degree: p.data.degree,
            nakshatra,
            pada
          });
          navamshaPlanets.push({
            name: p.name,
            sign: getNavamshaSign(p.data.rashi, p.data.degree),
            degree: p.data.degree
          });
        }
      }
    }

    const lagnaSign = typeof panchangam.udayaLagna === 'number' ? panchangam.udayaLagna : 0;
    
    // Use getKundli to get proper ascendant data for accurate lagna
    let actualLagnaSign = lagnaSign;
    let actualLagnaDegree = 15; // fallback
    try {
      const kundli = getKundli(dateObj, observer);
      if (kundli.ascendant) {
        actualLagnaSign = kundli.ascendant.rashi;
        actualLagnaDegree = kundli.ascendant.longitude % 30;
      }
    } catch (e) {
      console.warn('getKundli fallback:', e);
    }
    
    const navamshaLagnaSign = getNavamshaSign(actualLagnaSign, actualLagnaDegree);
    
    const rasiName = panchangam.moonRashi?.name || 'Unknown';
    const nakIndex = panchangam.nakshatra;
    const nakshatraName = nakIndex >= 0 && nakIndex < 27 ? NAKSHATRA_NAMES[nakIndex] : 'Unknown';
    const pada = panchangam.nakshatraPada || 1;

    let dashaBalance = "00 Yrs 00 Months 00 Days";
    if (panchangam.vimshottariDasha?.dashaBalance) {
      const match = panchangam.vimshottariDasha.dashaBalance.match(/(\d+)y\s+(\d+)m\s+(\d+)\s*d/i);
      if (match) {
        const y = match[1].padStart(2, '0');
        const m = match[2].padStart(2, '0');
        const d = match[3].padStart(2, '0');
        dashaBalance = `${y} Yrs ${m} Months ${d} Days`;
      }
    }
    const birthNakshatra = panchangam.vimshottariDasha?.birthNakshatra || nakshatraName;
    
    // Extract Panchangam values safely
    const tithiIndex = typeof panchangam.tithi === 'number' ? panchangam.tithi : 0;
    const yogaIndex = typeof panchangam.yoga === 'number' ? panchangam.yoga : 0;
    const varaIndex = typeof panchangam.vara === 'number' ? panchangam.vara : 0;

    return {
      lagnaSign: actualLagnaSign,
      planets,
      navamsha: {
        lagnaSign: navamshaLagnaSign,
        planets: navamshaPlanets,
      },
      rasi: rasiName,
      rasiIndex: panchangam.moonRashi?.index ?? -1,
      nakshatra: nakshatraName,
      nakshatraIndex: nakIndex,
      pada,
      dashaBalance,
      birthNakshatra,
      latitude: lat,
      longitude: lng,
      
      birthDateObj: dateObj,
      tithiInfo: { 
        name: tithiNames[tithiIndex - 1] || 'Unknown', 
        paksha: panchangam.paksha || 'Unknown',
        index: tithiIndex
      },
      yogaInfo: {
        name: yogaNames[yogaIndex - 1] || 'Unknown',
        index: yogaIndex
      },
      karanaName: panchangam.karana || 'Unknown',
      varaName: dayNames[varaIndex] || 'Unknown',
      
      sunMoonTimes: {
        sunrise: panchangam.sunrise || null,
        sunset: panchangam.sunset || null,
        moonrise: panchangam.moonrise || null,
        moonset: panchangam.moonset || null,
      },
      
      muhurta: {
        rahuKalamStart: panchangam.rahuKalamStart || null,
        rahuKalamEnd: panchangam.rahuKalamEnd || null,
        yamagandaKalamStart: panchangam.yamagandaKalam?.start || null,
        yamagandaKalamEnd: panchangam.yamagandaKalam?.end || null,
        gulikaKalamStart: panchangam.gulikaKalam?.start || null,
        gulikaKalamEnd: panchangam.gulikaKalam?.end || null,
      },
      
      vimshottariFullCycle: panchangam.vimshottariDasha?.fullCycle || [],
      currentMahadasha: panchangam.vimshottariDasha?.currentMahadasha || null,
    };
  } catch (error) {
    console.error("Astrology calculation failed:", error);
    return {
      lagnaSign: 0,
      planets: [],
      navamsha: { lagnaSign: 0, planets: [] },
      rasi: 'Error',
      rasiIndex: -1,
      nakshatra: 'Error',
      nakshatraIndex: -1,
      pada: 1,
      dashaBalance: '00 Yrs 00 Months 00 Days',
      birthNakshatra: 'Unknown',
      latitude: lat,
      longitude: lng,
      
      birthDateObj: new Date(),
      tithiInfo: { name: 'Error', paksha: 'Error', index: 0 },
      yogaInfo: { name: 'Error', index: 0 },
      karanaName: 'Error',
      varaName: 'Error',
      sunMoonTimes: { sunrise: null, sunset: null, moonrise: null, moonset: null },
      muhurta: { rahuKalamStart: null, rahuKalamEnd: null, yamagandaKalamStart: null, yamagandaKalamEnd: null, gulikaKalamStart: null, gulikaKalamEnd: null },
      vimshottariFullCycle: [],
      currentMahadasha: null
    };
  }
}

// --------------------------------------------------------
// ADVANCED FEATURES
// --------------------------------------------------------

export function calculateMatching(boyProfile: Profile, girlProfile: Profile) {
  const boyDate = new Date(
    parseInt(boyProfile.birth_date.split('-')[0]),
    parseInt(boyProfile.birth_date.split('-')[1]) - 1,
    parseInt(boyProfile.birth_date.split('-')[2]),
    parseInt(boyProfile.birth_time.split(':')[0]),
    parseInt(boyProfile.birth_time.split(':')[1])
  );
  const girlDate = new Date(
    parseInt(girlProfile.birth_date.split('-')[0]),
    parseInt(girlProfile.birth_date.split('-')[1]) - 1,
    parseInt(girlProfile.birth_date.split('-')[2]),
    parseInt(girlProfile.birth_time.split(':')[0]),
    parseInt(girlProfile.birth_time.split(':')[1])
  );
  
  const boyObserver = new Observer(boyProfile.latitude, boyProfile.longitude, 0);
  const girlObserver = new Observer(girlProfile.latitude, girlProfile.longitude, 0);
  
  const boyKundli = getKundli(boyDate, boyObserver);
  const girlKundli = getKundli(girlDate, girlObserver);
  
  const matchResult = matchKundli(boyKundli, girlKundli);
  const boyDosha = checkMangalDosha(boyKundli);
  const girlDosha = checkMangalDosha(girlKundli);
  
  return { matchResult, boyDosha, girlDosha };
}

export function getDailyAuspiciousness(details: AstrologyDetails, targetDate: Date, lat: number, lng: number) {
  const observer = new Observer(lat, lng, 0);
  const panchangam = getPanchangamDetails(targetDate, observer, {
    birthMoonRashi: details.rasiIndex,
    birthNakshatra: details.nakshatraIndex,
    timezoneOffset: 330 // 5.5 hours for SL
  });
  
  return panchangam;
}

export function getAstroCalendarEvents(targetDate: Date, lat: number, lng: number, days: number = 30) {
  const observer = new Observer(lat, lng, 0);
  return getUpcomingFestivals({
    date: targetDate,
    observer: observer,
    days: days,
    timezoneOffset: 330
  });
}
