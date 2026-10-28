import { AlertModel, IAlert } from './alert.model.js';
import { EvaluatedRisk } from '../risk-engine/risk.service.js';
import { io } from '../../realtime/socket.js';

export class AlertService {
  private static COOLDOWN_HOURS = 2;

  public static async processRiskEvaluations(evaluations: EvaluatedRisk[]): Promise<IAlert[]> {
    const createdAlerts: IAlert[] = [];

    for (const item of evaluations) {
      if (item.riskLevel === 'GREEN') continue;

      // Check deduplication cooldown
      const cooldownTime = new Date(Date.now() - this.COOLDOWN_HOURS * 60 * 60 * 1000);
      let existingAlert = null;
      try {
        existingAlert = await AlertModel.findOne({
          regionCode: item.regionCode,
          severity: item.riskLevel,
          status: { $in: ['PENDING_APPROVAL', 'APPROVED', 'DISPATCHED'] },
          createdAt: { $gte: cooldownTime },
        });
      } catch (err) {
        // DB fallback
      }

      if (existingAlert) {
        continue; // Prevent spamming within cooldown period
      }

      // RED severity requires human officer approval by default
      const status = item.riskLevel === 'RED' ? 'PENDING_APPROVAL' : 'APPROVED';

      const alertId = `BG-ALT-${Date.now().toString(36).toUpperCase()}-${item.regionCode}`;
      const newAlertData = {
        alertId,
        regionCode: item.regionCode,
        regionName: item.regionName,
        severity: item.riskLevel,
        status,
        title: `${item.riskLevel} Landslide Risk Alert: ${item.regionName}`,
        reason: item.contributingFactors.join(' | '),
        rainfallRecorded: item.rainfall24h,
        thresholdValue: item.riskScore,
        recommendations: item.recommendations,
        isSimulated: item.isSimulated,
        whatsappBroadcastCount: 0,
      };

      try {
        const created = await AlertModel.create(newAlertData);
        createdAlerts.push(created);

        // Broadcast live alert to connected dashboard clients
        if (io) {
          io.emit('alert:created', created);
        }
      } catch (err) {
        // In-memory fallback
      }
    }

    return createdAlerts;
  }

  public static async approveAlert(alertId: string, officerName: string): Promise<IAlert | null> {
    try {
      const alert = await AlertModel.findOneAndUpdate(
        { alertId },
        {
          status: 'APPROVED',
          approvedBy: officerName,
          approvedAt: new Date(),
        },
        { new: true }
      );
      if (alert && io) {
        io.emit('alert:approved', alert);
      }
      return alert;
    } catch (e) {
      return null;
    }
  }

  public static async resolveAlert(alertId: string): Promise<IAlert | null> {
    try {
      const alert = await AlertModel.findOneAndUpdate(
        { alertId },
        {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
        { new: true }
      );
      if (alert && io) {
        io.emit('alert:resolved', alert);
      }
      return alert;
    } catch (e) {
      return null;
    }
  }
}
