import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

import { connectDB } from './config/db.js';
import { initSocketIO, io } from './realtime/socket.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { RegionController } from './modules/regions/region.controller.js';
import { AlertController } from './modules/alerts/alert.controller.js';
import { IncidentController } from './modules/incidents/incident.controller.js';
import { WhatsAppController } from './modules/whatsapp/whatsapp.controller.js';
import { RiskEngineService } from './modules/risk-engine/risk.service.js';
import { AlertService } from './modules/alerts/alert.service.js';

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocketIO(httpServer);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect MongoDB (resilient fallback if offline)
connectDB();

// ----------------- API ROUTES -----------------
const router = express.Router();

// Health Check
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'BhoomiGuard MERN API & Ingestion Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0-SIH',
  });
});

// Auth Routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', AuthController.me);

// Regions & GIS Routes
router.get('/regions', RegionController.getAllRegions);
router.post('/regions/:code/assess', RegionController.assessRegionNow);

// Alerts Routes
router.get('/alerts', AlertController.getAlerts);
router.post('/alerts', AlertController.createManualAlert);
router.post('/alerts/:id/approve', AlertController.approveAlert);
router.post('/alerts/:id/resolve', AlertController.resolveAlert);

// Incident & Road Blockage Routes
router.get('/incidents', IncidentController.getIncidents);
router.post('/incidents', IncidentController.reportIncident);
router.post('/incidents/:id/verify', IncidentController.verifyIncident);

// WhatsApp Webhook & CRM Routes
router.get('/whatsapp/webhook', WhatsAppController.verifyWebhook);
router.post('/whatsapp/webhook', WhatsAppController.handleInboundWebhook);
router.post('/whatsapp/simulate', WhatsAppController.simulateIncoming);
router.get('/whatsapp/logs', WhatsAppController.getLogs);

app.use('/api/v1', router);

// Root fallback
app.get('/', (_req, res) => {
  res.send('BhoomiGuard Backend API is operational. Access endpoints via /api/v1/...');
});

// Scheduled Ingestion & Risk Recalculation (Every 10 minutes)
cron.schedule('*/10 * * * *', async () => {
  console.log('[Scheduler] Ingesting meteorological telemetry and evaluating risk...');
  try {
    const evaluations = await RiskEngineService.assessAllZones();
    const alerts = await AlertService.processRiskEvaluations(evaluations);
    if (io) {
      io.emit('risk:updated', { evaluations, timestamp: new Date() });
    }
  } catch (err: any) {
    console.error('[Scheduler Error]', err.message);
  }
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🛡️  BHOOMIGUARD MERN BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`📡 Endpoints active at: http://localhost:${PORT}/api/v1/health`);
  console.log(`💬 WhatsApp Webhook at: http://localhost:${PORT}/api/v1/whatsapp/webhook`);
  console.log(`=================================================\n`);
});
