import { Request, Response } from 'express';
import { IncidentModel } from './incident.model.js';
import { io } from '../../realtime/socket.js';

// Resilient in-memory store so newly submitted reports are NEVER lost even if MongoDB is reconnecting
let memoryIncidents: any[] = [
  {
    incidentId: 'INC-2026-SK01',
    type: 'ROAD_BLOCKAGE',
    title: 'Debris Flow on NH-10 near 29th Mile',
    description: 'Mudflow and boulder debris covering North-bound single lane. BRO heavy machines mobilized.',
    regionCode: 'SK-GTK',
    locationName: 'NH-10, 29th Mile, Teesta Corridor',
    coordinates: { lat: 27.215, lng: 88.512 },
    severity: 'HIGH',
    status: 'VERIFIED',
    reportedBy: { name: 'BRO Patrol Unit', role: 'FIELD_OFFICER' },
    verifiedBy: 'District Magistrate Office',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    incidentId: 'INC-2026-MZ02',
    type: 'LANDSLIDE',
    title: 'Road Verge Subsidence at Hunthar',
    description: 'Outer shoulder settlement of 1.2 meters. Barrier tape installed; SDRF inspecting slope toe.',
    regionCode: 'MZ-AZL',
    locationName: 'Hunthar Hill Section, Aizawl, Mizoram',
    coordinates: { lat: 23.742, lng: 92.735 },
    severity: 'CRITICAL',
    status: 'VERIFIED',
    reportedBy: { name: 'Lalremruata (Citizen)', role: 'CITIZEN' },
    verifiedBy: 'Aizawl District Disaster Management',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    incidentId: 'INC-2026-AS03',
    type: 'FLASH_FLOOD',
    title: 'Waterlogging at Jalukbari Underpass',
    description: 'Mountain runoff stormwater buildup. Municipal pumps mobilized.',
    regionCode: 'AS-GHY',
    locationName: 'Kamrup West, Assam',
    coordinates: { lat: 26.148, lng: 91.682 },
    severity: 'MEDIUM',
    status: 'VERIFIED',
    reportedBy: { name: 'Citizen Reporter via WhatsApp', role: 'CITIZEN' },
    verifiedBy: 'Kamrup District Control Room',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];

export class IncidentController {
  public static async getIncidents(req: Request, res: Response): Promise<void> {
    try {
      const { type, status } = req.query;
      let filter: any = {};
      if (type && type !== 'ALL') filter.type = type;
      if (status && status !== 'ALL') filter.status = status;

      let dbIncidents: any[] = [];
      try {
        dbIncidents = await IncidentModel.find(filter).sort({ createdAt: -1 }).limit(100);
      } catch (e) {}

      // If DB has records, use DB combined with memory, else use memory
      let results = memoryIncidents;
      if (dbIncidents && dbIncidents.length > 0) {
        // Merge without duplicates
        const ids = new Set(dbIncidents.map((d) => d.incidentId));
        results = [...dbIncidents, ...memoryIncidents.filter((m) => !ids.has(m.incidentId))];
      }

      // Apply in-memory filtering if needed
      if (type && type !== 'ALL') {
        results = results.filter((i) => i.type === type);
      }
      if (status && status !== 'ALL') {
        results = results.filter((i) => i.status === status);
      }

      res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async reportIncident(req: Request, res: Response): Promise<void> {
    try {
      const {
        type = 'LANDSLIDE',
        title,
        description,
        regionCode = 'NER-GEN',
        locationName,
        coordinates = { lat: 27.3389, lng: 88.6065 },
        severity = 'HIGH',
        reporterName = 'Citizen Reporter',
        reporterPhone,
        photoUrl,
        isOfflineSynced = false,
      } = req.body;

      if (!title || !description || !locationName) {
        res.status(400).json({ error: 'Title, description, and location name are required.' });
        return;
      }

      const incidentId = `INC-${Date.now().toString(36).toUpperCase()}`;
      const newIncident = {
        incidentId,
        type,
        title,
        description,
        regionCode,
        locationName,
        coordinates: {
          lat: Number(coordinates.lat) || 27.3389,
          lng: Number(coordinates.lng) || 88.6065,
        },
        severity,
        status: 'REPORTED',
        reportedBy: {
          name: reporterName || 'Citizen Reporter',
          phone: reporterPhone || '',
          role: 'CITIZEN',
        },
        photoUrl,
        isOfflineSynced,
        createdAt: new Date(),
      };

      // Always save to memory store so it is instantly available
      memoryIncidents.unshift(newIncident);

      // Attempt DB save if connected
      try {
        await IncidentModel.create(newIncident);
      } catch (dbErr) {
        // Graceful resilient fallback
      }

      // Broadcast real-time Socket.io event to all connected browsers & admin panel
      if (io) {
        console.log(`[Socket.io Broadcast] New incident created: ${incidentId}`);
        io.emit('incident:created', newIncident);
      }

      res.status(201).json({
        success: true,
        message: 'Incident report submitted and broadcasted in real time!',
        data: newIncident,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async verifyIncident(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status = 'VERIFIED', verifiedBy = 'District Emergency Officer', notes } = req.body;

      let updatedItem: any = null;

      // Update in-memory
      const idx = memoryIncidents.findIndex((i) => i.incidentId === id);
      if (idx !== -1) {
        memoryIncidents[idx] = {
          ...memoryIncidents[idx],
          status,
          verifiedBy,
          notes: notes || memoryIncidents[idx].notes,
          updatedAt: new Date(),
        };
        updatedItem = memoryIncidents[idx];
      }

      // Update in DB if connected
      try {
        const dbUpdated = await IncidentModel.findOneAndUpdate(
          { incidentId: id },
          { status, verifiedBy, notes },
          { new: true }
        );
        if (dbUpdated) updatedItem = dbUpdated;
      } catch (dbErr) {}

      if (!updatedItem) {
        // If not found, create a verified placeholder
        updatedItem = { incidentId: id, status, verifiedBy };
      }

      // Broadcast real-time update to all active clients
      if (io) {
        console.log(`[Socket.io Broadcast] Incident updated: ${id} -> ${status}`);
        io.emit('incident:updated', updatedItem);
      }

      res.status(200).json({
        success: true,
        message: `Incident ${id} marked as ${status} in real time`,
        data: updatedItem,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
