import axios from 'axios';

export interface WhatsAppMessagePayload {
  to: string;
  body: string;
}

export interface MockChatLog {
  id: string;
  from: string;
  to: string;
  text: string;
  type: 'INBOUND' | 'OUTBOUND';
  timestamp: Date;
}

export class WhatsAppService {
  private static phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  private static accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
  private static chatLogs: MockChatLog[] = [];

  public static getChatLogs(): MockChatLog[] {
    return this.chatLogs;
  }

  public static addChatLog(log: MockChatLog) {
    this.chatLogs.unshift(log);
    if (this.chatLogs.length > 50) this.chatLogs.pop();
  }

  /**
   * Dispatches WhatsApp text message to user.
   */
  public static async sendMessage(to: string, message: string): Promise<boolean> {
    const isMock = !this.accessToken || this.accessToken === 'mock_token_for_demo';

    // Store in mock/audit log
    this.addChatLog({
      id: `WA-MSG-${Date.now().toString(36)}`,
      from: 'BhoomiGuard Bot (+91-7567556390)',
      to,
      text: message,
      type: 'OUTBOUND',
      timestamp: new Date(),
    });

    if (isMock) {
      console.log(`[WhatsApp Outbound Mock] To: ${to}\nMessage:\n${message}\n---`);
      return true;
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
      return true;
    } catch (error: any) {
      console.error('[WhatsApp Cloud API Error]', error.response?.data || error.message);
      return false;
    }
  }
}
