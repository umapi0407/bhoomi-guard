import { Request, Response } from 'express';
import { AlertModel } from './alert.model.js';
import { AlertService } from './alert.service.js';
import { io } from '../../realtime/socket.js';

let memoryAlerts: any[] = [
  {
    alertId: 'BG-ALT-MZ01',
    regionCode: 'MZ-AZL',
    regionName: 'Aizawl Ridge & NH-54 Corridor',
    severity: 'RED',
    status: 'PENDING_APPROVAL',
    title: 'CRITICAL Landslide Risk: Aizawl Ridge (Pending Officer Confirmation)',
    reason: '104 mm continuous rainfall exceeding 100 mm regional threshold on 38° fractured sandstone slopes.',
    rainfallRecorded: 104,
    thresholdValue: 100,
    recommendations: [
      'Immediate evacuation advisory along steep drainage channels.',
      'Mobilize SDRF quick response units to Hunthar bypass.',
      'Halt commercial heavy trucks along outer ring-road cuts.',
    ],
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    alertId: 'BG-ALT-SK02',
    regionCode: 'SK-GTK',
    regionName: 'Gangtok & East Sikkim',
    severity: 'ORANGE',
    status: 'APPROVED',
    title: 'ORANGE Alert: High Landslide Susceptibility near Teesta Basin',
    reason: '24h rainfall reached 98 mm (critical threshold 75 mm). Soil saturation exceeding 85%.',
    rainfallRecorded: 98,
    thresholdValue: 75,
    recommendations: [
      'Night vehicular transit restricted along NH-10 (Sevoke to Gangtok).',
      'Pre-position earth-moving excavators at 29th Mile.',
    ],
    approvedBy: 'East Sikkim Disaster Management Officer',
    approvedAt: new Date(Date.now() - 50 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    alertId: 'BG-ALT-AR03',
    regionCode: 'AR-ITN',
    regionName: 'Itanagar Capital Belt',
    severity: 'ORANGE',
    status: 'APPROVED',
    title: 'ORANGE Alert: Unstable Siltstone Slopes along Highway',
    reason: 'Rainfall 89 mm against 80 mm threshold. Waterlogging along cut slopes.',
    rainfallRecorded: 89,
    thresholdValue: 80,
    recommendations: [
      'Advise commuters to avoid mountain slope shortcuts.',
      'District control room on 24x7 monitoring.',
    ],
    approvedBy: 'Papum Pare Emergency Cell',
    approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    alertId: 'BG-ALT-ML04',
    regionCode: 'ML-SHL',
    regionName: 'Shillong Plateau',
    severity: 'YELLOW',
    status: 'APPROVED',
    title: 'YELLOW Advisory: Continuous Mountain Drizzle',
    reason: '62 mm rainfall observed. Slopes currently stable but require vigilance.',
    rainfallRecorded: 62,
    thresholdValue: 90,
    recommendations: [
      'Field patrol units checking culverts and stormwater drains.',
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

export class AlertController {
  public static async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { status, severity } = req.query;
      let filter: any = {};
      if (status && status !== 'ALL') filter.status = status;
      if (severity && severity !== 'ALL') filter.severity = severity;

      let dbAlerts: any[] = [];
      try {
        dbAlerts = await AlertModel.find(filter).sort({ createdAt: -1 }).limit(50);
      } catch (e) {}

      let results = memoryAlerts;
      if (dbAlerts && dbAlerts.length > 0) {
        const ids = new Set(dbAlerts.map((d) => d.alertId));
        results = [...dbAlerts, ...memoryAlerts.filter((m) => !ids.has(m.alertId))];
      }

      if (status && status !== 'ALL') {
        results = results.filter((a) => a.status === status);
      }
      if (severity && severity !== 'ALL') {
        results = results.filter((a) => a.severity === severity);
      }

      res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async approveAlert(req: Request, res: Response): Promise<void> {
    try {
      const alertId = req.params.id as string;
      const { officerName = 'District Emergency Officer' } = req.body;

      let updated: any = null;

      // Update in memory
      const idx = memoryAlerts.findIndex((a) => a.alertId === alertId);
      if (idx !== -1) {
        memoryAlerts[idx] = {
          ...memoryAlerts[idx],
          status: 'APPROVED',
          approvedBy: officerName,
          approvedAt: new Date(),
        };
        updated = memoryAlerts[idx];
      }

      // Update DB if connected
      try {
        const dbAlert = await AlertModel.findOneAndUpdate(
          { alertId },
          { status: 'APPROVED', approvedBy: officerName, approvedAt: new Date() },
          { new: true }
        );
        if (dbAlert) updated = dbAlert;
      } catch (e) {}

      if (!updated) {
        updated = { alertId, status: 'APPROVED', approvedBy: officerName };
      }

      // Real-time broadcast
      if (io) {
        console.log(`[Socket.io Broadcast] Alert approved: ${alertId}`);
        io.emit('alert:approved', updated);
      }

      res.status(200).json({ success: true, message: 'Alert authorized and broadcasted live', data: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const alertId = req.params.id as string;
      let updated: any = null;

      const idx = memoryAlerts.findIndex((a) => a.alertId === alertId);
      if (idx !== -1) {
        memoryAlerts[idx] = {
          ...memoryAlerts[idx],
          status: 'RESOLVED',
          resolvedAt: new Date(),
        };
        updated = memoryAlerts[idx];
      }

      try {
        const dbAlert = await AlertModel.findOneAndUpdate(
          { alertId },
          { status: 'RESOLVED', resolvedAt: new Date() },
          { new: true }
        );
        if (dbAlert) updated = dbAlert;
      } catch (e) {}

      if (!updated) {
        updated = { alertId, status: 'RESOLVED' };
      }

      if (io) {
        console.log(`[Socket.io Broadcast] Alert resolved: ${alertId}`);
        io.emit('alert:resolved', updated);
      }

      res.status(200).json({ success: true, message: 'Alert marked as resolved', data: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async createManualAlert(req: Request, res: Response): Promise<void> {
    try {
      const {
        regionCode = 'NER-GEN',
        regionName = 'Northeast India High-Risk Sector',
        severity = 'ORANGE',
        title,
        reason,
        rainfallRecorded = 75,
        thresholdValue = 70,
        recommendations = ['Advisory issued to district road checkpoints.'],
        officerName = 'Authorized District Officer',
      } = req.body;

      if (!title || !reason) {
        res.status(400).json({ error: 'Title and reason are required for emergency alerts.' });
        return;
      }

      const alertId = `BG-ALT-${Date.now().toString(36).toUpperCase()}-${regionCode}`;
      const newAlert = {
        alertId,
        regionCode,
        regionName,
        severity,
        status: severity === 'RED' ? 'PENDING_APPROVAL' : 'APPROVED',
        title,
        reason,
        rainfallRecorded: Number(rainfallRecorded),
        thresholdValue: Number(thresholdValue),
        recommendations: Array.isArray(recommendations) ? recommendations : [recommendations],
        approvedBy: severity !== 'RED' ? officerName : undefined,
        approvedAt: severity !== 'RED' ? new Date() : undefined,
        createdAt: new Date(),
      };

      memoryAlerts.unshift(newAlert);

      try {
        await AlertModel.create(newAlert);
      } catch (e) {}

      if (io) {
        console.log(`[Socket.io Broadcast] Manual alert created: ${alertId}`);
        io.emit('alert:created', newAlert);
      }

      res.status(201).json({ success: true, message: 'Emergency alert created & broadcasted live', data: newAlert });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
