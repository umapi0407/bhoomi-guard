import { Request, Response } from 'express';
import { WhatsAppBotEngine } from './whatsapp.bot.js';
import { WhatsAppService } from './whatsapp.service.js';

export class WhatsAppController {
  /**
   * Meta Webhook Verification (GET /api/v1/whatsapp/webhook)
   */
  public static verifyWebhook(req: Request, res: Response): void {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'bhoomi_guard_webhook_token_secure';

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('[WhatsApp Webhook] Handshake verified successfully.');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }

  /**
   * Meta Webhook Inbound Message Receiver (POST /api/v1/whatsapp/webhook)
   */
  public static async handleInboundWebhook(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        const entries = body.entry || [];
        for (const entry of entries) {
          const changes = entry.changes || [];
          for (const change of changes) {
            const value = change.value;
            const messages = value?.messages || [];
            for (const msg of messages) {
              if (msg.type === 'text') {
                const fromPhone = msg.from;
                const messageText = msg.text?.body;

                console.log(`[WhatsApp Incoming] From: ${fromPhone} | Body: "${messageText}"`);

                // Record inbound message
                WhatsAppService.addChatLog({
                  id: msg.id || `IN-${Date.now()}`,
                  from: fromPhone,
                  to: 'BhoomiGuard Hotline',
                  text: messageText,
                  type: 'INBOUND',
                  timestamp: new Date(),
                });

                // Bot computes response
                const reply = await WhatsAppBotEngine.handleIncomingMessage(fromPhone, messageText);
                await WhatsAppService.sendMessage(fromPhone, reply.text);
              }
            }
          }
        }
        res.status(200).send('EVENT_RECEIVED');
        return;
      }
      res.sendStatus(404);
    } catch (err: any) {
      console.error('[WhatsApp Webhook Exception]', err.message);
      res.status(500).json({ error: 'Internal webhook error' });
    }
  }

  /**
   * Test/Simulator Endpoint (POST /api/v1/whatsapp/simulate)
   * Allows the web dashboard UI to test pre-filled messages and preview exact bot telemetry responses!
   */
  public static async simulateIncoming(req: Request, res: Response): Promise<void> {
    try {
      const { phone = '+91-7567556390', text } = req.body;
      if (!text) {
        res.status(400).json({ error: 'Message text is required' });
        return;
      }

      // Log inbound
      WhatsAppService.addChatLog({
        id: `SIM-IN-${Date.now()}`,
        from: phone,
        to: 'BhoomiGuard Hotline',
        text,
        type: 'INBOUND',
        timestamp: new Date(),
      });

      // Execute bot
      const reply = await WhatsAppBotEngine.handleIncomingMessage(phone, text);

      // Send bot reply
      await WhatsAppService.sendMessage(phone, reply.text);

      res.status(200).json({
        success: true,
        inboundText: text,
        replyText: reply.text,
        matchedZone: reply.matchedZone,
        riskLevel: reply.riskLevel,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Retrieve chat logs for CRM dashboard (GET /api/v1/whatsapp/logs)
   */
  public static getLogs(_req: Request, res: Response): void {
    res.status(200).json({ logs: WhatsAppService.getChatLogs() });
  }
}
