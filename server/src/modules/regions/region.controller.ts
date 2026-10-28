import { Request, Response } from 'express';
import { NER_MONITORING_ZONES } from '../../config/constants.js';
import { RiskEngineService } from '../risk-engine/risk.service.js';
import { AlertService } from '../alerts/alert.service.js';
import { RegionModel } from './region.model.js';

export class RegionController {
  public static async getAllRegions(_req: Request, res: Response): Promise<void> {
    try {
      let regions: any[] = [];
      try {
        regions = await RegionModel.find().lean();
      } catch (e) {}

      if (!regions || regions.length === 0) {
        // Evaluate default zones
        const evaluated = await RiskEngineService.assessAllZones();
        await AlertService.processRiskEvaluations(evaluated);
        regions = evaluated.map((e) => {
          const zone = NER_MONITORING_ZONES.find((z) => z.code === e.regionCode)!;
          return {
            ...zone,
            currentRiskLevel: e.riskLevel,
            lastRainfall24h: e.rainfall24h,
            lastAssessedAt: new Date(),
          };
        });
      }

      res.status(200).json({ success: true, count: regions.length, data: regions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async assessRegionNow(req: Request, res: Response): Promise<void> {
    try {
      const code = req.params.code as string;
      const zone = NER_MONITORING_ZONES.find((z) => z.code.toUpperCase() === code.toUpperCase());
      if (!zone) {
        res.status(404).json({ error: 'Monitoring zone not found' });
        return;
      }
      const evaluation = await RiskEngineService.assessZone(zone);
      await AlertService.processRiskEvaluations([evaluation]);
      res.status(200).json({ success: true, evaluation });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
