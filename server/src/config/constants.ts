// Pre-defined Northeast India (NER) High-Risk Monitoring Zones
export const NER_MONITORING_ZONES = [
  {
    code: 'SK-GTK',
    name: 'Gangtok & East Sikkim',
    state: 'Sikkim',
    coordinates: { lat: 27.3389, lng: 88.6065 },
    slopeAngleAvg: 34.2,
    geologySusceptibility: 'HIGH', // Schist/Gneiss brittle slopes
    criticalRainfallThreshold24h: 75.0, // mm
    highRainfallThreshold24h: 120.0, // mm
    emergencyPhone: '+91-3592-202416'
  },
  {
    code: 'ML-SHL',
    name: 'Shillong Plateau & Sohra Highway',
    state: 'Meghalaya',
    coordinates: { lat: 25.5788, lng: 91.8933 },
    slopeAngleAvg: 28.5,
    geologySusceptibility: 'MODERATE',
    criticalRainfallThreshold24h: 90.0,
    highRainfallThreshold24h: 150.0,
    emergencyPhone: '+91-364-2224150'
  },
  {
    code: 'AS-GHY',
    name: 'Guwahati Hills & Kamrup Foothills',
    state: 'Assam',
    coordinates: { lat: 26.1445, lng: 91.7362 },
    slopeAngleAvg: 22.0,
    geologySusceptibility: 'MODERATE',
    criticalRainfallThreshold24h: 65.0,
    highRainfallThreshold24h: 110.0,
    emergencyPhone: '+91-361-2237221'
  },
  {
    code: 'MZ-AZL',
    name: 'Aizawl Ridge & National Highway 54',
    state: 'Mizoram',
    coordinates: { lat: 23.7271, lng: 92.7176 },
    slopeAngleAvg: 38.0,
    geologySusceptibility: 'VERY_HIGH', // Soft sandstone and shale
    criticalRainfallThreshold24h: 60.0,
    highRainfallThreshold24h: 100.0,
    emergencyPhone: '+91-389-2322238'
  },
  {
    code: 'NL-KOH',
    name: 'Kohima - Zubza Fault Line Corridor',
    state: 'Nagaland',
    coordinates: { lat: 25.6751, lng: 94.1086 },
    slopeAngleAvg: 32.5,
    geologySusceptibility: 'HIGH', // Disang shales susceptible to sliding
    criticalRainfallThreshold24h: 70.0,
    highRainfallThreshold24h: 115.0,
    emergencyPhone: '+91-370-2290480'
  },
  {
    code: 'MN-IMP',
    name: 'Imphal West & NH-37 (Jiribam Highway)',
    state: 'Manipur',
    coordinates: { lat: 24.8170, lng: 93.9368 },
    slopeAngleAvg: 29.8,
    geologySusceptibility: 'HIGH',
    criticalRainfallThreshold24h: 70.0,
    highRainfallThreshold24h: 120.0,
    emergencyPhone: '+91-385-2458110'
  },
  {
    code: 'AR-ITN',
    name: 'Itanagar Capital Complex & Banderdewa',
    state: 'Arunachal Pradesh',
    coordinates: { lat: 27.0844, lng: 93.6053 },
    slopeAngleAvg: 35.5,
    geologySusceptibility: 'VERY_HIGH', // Siwalik sedimentary unstable belts
    criticalRainfallThreshold24h: 80.0,
    highRainfallThreshold24h: 130.0,
    emergencyPhone: '+91-360-2212395'
  }
];

export const RISK_LEVELS = {
  GREEN: { code: 'GREEN', label: 'Safe / Low Monitoring', color: '#2E7D5B' },
  YELLOW: { code: 'YELLOW', label: 'Advisory / Early Caution', color: '#F2B84B' },
  ORANGE: { code: 'ORANGE', label: 'High Alert / Preparedness Required', color: '#E8833A' },
  RED: { code: 'RED', label: 'Critical Danger / Imminent Risk (Approval Required)', color: '#C8442F' },
};
