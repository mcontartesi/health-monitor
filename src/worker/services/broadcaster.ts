import { Env } from '../db/types';

export class RealtimeBroadcaster {
  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint for WebSocket upgrade connection from clients
    const isWebSocket = url.pathname.endsWith('/ws') || request.headers.get('Upgrade')?.toLowerCase() === 'websocket';
    if (isWebSocket) {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Hibernate the WebSocket so the Durable Object can sleep when idle
      this.state.acceptWebSocket(server);

      // Send initial welcome message
      try {
        server.send(JSON.stringify({
          type: 'CONNECTED',
          payload: { message: 'WebSocket real-time connection established' },
          timestamp: new Date().toISOString(),
        }));
      } catch (e) {
        // Ignore initial send error if socket immediately closed
      }

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Endpoint for worker handlers to broadcast events to all connected clients
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      try {
        const body = await request.text();
        const sockets = this.state.getWebSockets();

        let sentCount = 0;
        for (const ws of sockets) {
          try {
            ws.send(body);
            sentCount++;
          } catch (err) {
            // Closed or errored socket; system will prune automatically
          }
        }

        return new Response(JSON.stringify({ success: true, sentCount }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }

  // WebSocket Hibernation Event Handlers
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message === 'string' && message.trim() === 'ping') {
      try {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      } catch (e) {
        // Ignore send error
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    ws.close(code, reason);
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    try {
      ws.close(1011, 'Internal Error');
    } catch (e) {
      // Ignore
    }
  }
}

/**
 * Broadcasts a real-time event to all connected dashboard WebSockets via Durable Object.
 */
export async function broadcastRealtimeEvent(env: Env, type: string, payload: any): Promise<void> {
  if (!env.REALTIME_BROADCASTER) return;
  try {
    const id = env.REALTIME_BROADCASTER.idFromName('global_dashboard');
    const stub = env.REALTIME_BROADCASTER.get(id);
    await stub.fetch('http://broadcaster/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload, timestamp: new Date().toISOString() }),
    });
  } catch (err) {
    console.error('[RealtimeBroadcaster] Event broadcast error:', err);
  }
}
