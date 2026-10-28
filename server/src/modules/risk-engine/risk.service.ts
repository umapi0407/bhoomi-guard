import { NER_MONITORING_ZONES } from '../../config/constants.js';
import { OpenMeteoProvider } from '../ingestion/providers/openMeteo.provider.js';
import { RegionModel } from '../regions/region.model.js';
import { RiskAssessmentModel } from './risk.model.js';

export interface EvaluatedRisk {
  regionCode: string;
  regionName: string;
  riskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  riskScore: number;
  rainfall24h: number;
  forecastRainfall24h: number;
  contributingFactors: string[];
  isSimulated: boolean;
  recommendations: string[];
}

export class RiskEngineService {
  /**
   * Assesses risk for a given zone based on real-time weather and static terrain properties.
   */
  public static async assessZone(zone: (typeof NER_MONITORING_ZONES)[0]): Promise<EvaluatedRisk> {
    const weather = await OpenMeteoProvider.fetchWeatherForCoordinates(
      zone.coordinates.lat,
      zone.coordinates.lng
    );

    const rainfall = weather.rainfall24h;
    const critThreshold = zone.criticalRainfallThreshold24h;
    const highThreshold = zone.highRainfallThreshold24h;

    // Geology factor
    let geologyMultiplier = 1.0;
    if (zone.geologySusceptibility === 'VERY_HIGH') geologyMultiplier = 1.35;
    else if (zone.geologySusceptibility === 'HIGH') geologyMultiplier = 1.2;
    else if (zone.geologySusceptibility === 'MODERATE') geologyMultiplier = 1.05;

    // Slope factor (angles > 30 deg have accelerated risk)
    const slopeMultiplier = zone.slopeAngleAvg > 30 ? 1.25 : 1.0;

    // Base rainfall ratio
    const rainRatio = rainfall / critThreshold;
    const weightedScore = Math.min(100, Math.round(rainRatio * 60 * geologyMultiplier * slopeMultiplier));

    let riskLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' = 'GREEN';
    const contributingFactors: string[] = [];
    const recommendations: string[] = [];

    contributingFactors.push(`24h Rainfall: ${rainfall}mm (Critical threshold: ${critThreshold}mm)`);
    contributingFactors.push(`Average Terrain Slope: ${zone.slopeAngleAvg}°`);
    contributingFactors.push(`Geological Formation: ${zone.geologySusceptibility} fragility`);

    if (rainfall >= highThreshold || weightedScore >= 85) {
      riskLevel = 'RED';
      contributingFactors.push('Severe cumulative saturation with imminent slope instability risk.');
      recommendations.push('Immediate evacuation advisory along vulnerable drainage channels.');
      recommendations.push('Deploy SDRF / Quick Response Teams to road transit junctions.');
      recommendations.push('Halt heavy vehicle movement along unstable highway sections.');
    } else if (rainfall >= critThreshold || weightedScore >= 65) {
      riskLevel = 'ORANGE';
      contributingFactors.push('Rainfall exceeds regional threshold on steep mountain cuts.');
      recommendations.push('Issue high travel warning; restrict night transit on ghat roads.');
      recommendations.push('Pre-position earth-moving excavators at designated choke points.');
    } else if (rainfall >= critThreshold * 0.6 || weightedScore >= 40) {
      riskLevel = 'YELLOW';
      contributingFactors.push('Moderate rainfall accumulation observed. Water logging possible.');
      recommendations.push('Monitor local rainfall telemetry and road status.');
      recommendations.push('Advise mountain commuters to exercise caution.');
    } else {
      riskLevel = 'GREEN';
      contributingFactors.push('Normal meteorological conditions. No critical trigger reached.');
      recommendations.push('Routine automated monitoring active.');
    }

    // Persist to Region and Assessment history if DB connected
    try {
      await RegionModel.findOneAndUpdate(
        { code: zone.code },
        {
          code: zone.code,
          name: zone.name,
          state: zone.state,
          coordinates: zone.coordinates,
          slopeAngleAvg: zone.slopeAngleAvg,
          geologySusceptibility: zone.geologySusceptibility,
          criticalRainfallThreshold24h: zone.criticalRainfallThreshold24h,
          highRainfallThreshold24h: zone.highRainfallThreshold24h,
          emergencyPhone: zone.emergencyPhone,
          currentRiskLevel: riskLevel,
          lastRainfall24h: rainfall,
          lastAssessedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      await RiskAssessmentModel.create({
        regionCode: zone.code,
        regionName: zone.name,
        riskLevel,
        riskScore: weightedScore,
        rainfall24h: rainfall,
        forecastRainfall24h: weather.precipitationForecast24h,
        slopeFactor: slopeMultiplier,
        geologyFactor: geologyMultiplier,
        contributingFactors,
        isSimulated: !weather.isLive,
      });
    } catch (e) {
      // In-memory / resilient logging
    }

    return {
      regionCode: zone.code,
      regionName: zone.name,
      riskLevel,
      riskScore: weightedScore,
      rainfall24h: rainfall,
      forecastRainfall24h: weather.precipitationForecast24h,
      contributingFactors,
      isSimulated: !weather.isLive,
      recommendations,
    };
  }

  /**
   * Assesses all predefined NER monitoring zones.
   */
  public static async assessAllZones(): Promise<EvaluatedRisk[]> {
    const results: EvaluatedRisk[] = [];
    for (const zone of NER_MONITORING_ZONES) {
      const res = await this.assessZone(zone);
      results.push(res);
    }
    return results;
  }
}
