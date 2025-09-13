/**
 * Chat package translations
 * Real-time messaging and communication translations
 */

export interface ChatTranslations {
  message: {
    send: string;
    type: string;
    placeholder: string;
    sent: string;
    received: string;
    failed: string;
  };
  room: {
    create: string;
    join: string;
    leave: string;
    delete: string;
    name: string;
    description: string;
  };
  user: {
    online: string;
    offline: string;
    typing: string;
    away: string;
  };
  p2p: {
    connect: string;
    disconnect: string;
    connected: string;
    disconnected: string;
  };
}
