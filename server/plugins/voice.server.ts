import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";
import { defineNitroPlugin } from "nitro/app";

type IceCandidatePayload = {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
};

type VoiceSignal =
    | { type: "join"; roomId: string; username: string }
    | { type: "leave" }
    | { type: "offer"; targetId: string; sdp: string }
    | { type: "answer"; targetId: string; sdp: string }
    | { type: "ice-candidate"; targetId: string; candidate: IceCandidatePayload }
    | { type: "set-mute"; muted: boolean };

type VoiceServerMessage =
    | {
  type: "joined";
  id: string;
  participants: Array<{ id: string; username: string; muted: boolean }>;
}
    | {
  type: "participant-joined";
  participant: { id: string; username: string; muted: boolean };
}
    | { type: "participant-left"; id: string }
    | { type: "participant-muted"; id: string; muted: boolean }
    | { type: "offer"; fromId: string; sdp: string; username: string }
    | { type: "answer"; fromId: string; sdp: string; username: string }
    | { type: "ice-candidate"; fromId: string; candidate: IceCandidatePayload }
    | { type: "error"; message: string };

interface VoiceClient {
  id: string;
  username: string;
  roomId: string;
  muted: boolean;
  socket: WebSocket;
}

const rooms = new Map<string, Map<string, VoiceClient>>();

const getOrCreateRoom = (roomId: string) => {
  const existing = rooms.get(roomId);
  if (existing) return existing;
  const room = new Map<string, VoiceClient>();
  rooms.set(roomId, room);
  return room;
};

const removeClientFromRoom = (client: VoiceClient) => {
  const room = rooms.get(client.roomId);
  if (!room) return;
  room.delete(client.id);
  if (room.size === 0) {
    rooms.delete(client.roomId);
  }
};

const broadcast = (
    room: Map<string, VoiceClient>,
    message: VoiceServerMessage,
    excludeId?: string
) => {
  const payload = JSON.stringify(message);
  room.forEach((client) => {
    if (excludeId && client.id === excludeId) return;
    // 1 === OPEN (ws)
    if (client.socket.readyState === 1) {
      client.socket.send(payload);
    }
  });
};

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("listen", (listener) => {
    const httpServer = listener.server;
    if (!httpServer) {
      console.warn("[voice] No HTTP server available to attach WebSocket server");
      return;
    }

    const wss = new WebSocketServer({ server: httpServer, path: "/voice" });

    console.log(
        "\x1b[32m[voice] WebSocket signaling server listening at /voice\x1b[0m"
    );

    nitroApp.hooks.hookOnce("close", () => {
      wss.clients.forEach((client) => client.close());
      wss.close();
    });

    wss.on("connection", (socket: WebSocket) => {
      console.log("\x1b[36m[voice] client connected\x1b[0m");
      let client: VoiceClient | null = null;

      const send = (message: VoiceServerMessage) => {
        if (socket.readyState === 1) {
          socket.send(JSON.stringify(message));
        }
      };

      const cleanup = () => {
        if (!client) return;
        const room = rooms.get(client.roomId);
        if (!room) {
          client = null;
          return;
        }
        removeClientFromRoom(client);
        broadcast(room, { type: "participant-left", id: client.id });
        console.log(
            `\x1b[33m[voice] client ${client.username} left room ${client.roomId}\x1b[0m`
        );
        client = null;
      };

      socket.on("message", (raw) => {
        let message: VoiceSignal;
        try {
          message = JSON.parse(raw.toString()) as VoiceSignal;
        } catch {
          send({ type: "error", message: "Geçersiz mesaj biçimi" });
          return;
        }

        if (message.type === "join") {
          if (client) return;
          if (!message.roomId || !message.username) {
            send({
              type: "error",
              message: "Oda veya kullanıcı bilgisi eksik",
            });
            return;
          }

          const room = getOrCreateRoom(message.roomId);
          const clientId = randomUUID();
          client = {
            id: clientId,
            roomId: message.roomId,
            username: message.username,
            muted: false,
            socket,
          };
          room.set(clientId, client);

          console.log(
              `\x1b[35m[voice] ${client.username} joined room ${client.roomId}\x1b[0m`
          );

          const participants = Array.from(room.values())
              .filter((participant) => participant.id !== clientId)
              .map(({ id, username, muted }) => ({ id, username, muted }));

          send({ type: "joined", id: clientId, participants });
          broadcast(
              room,
              {
                type: "participant-joined",
                participant: {
                  id: clientId,
                  username: client.username,
                  muted: client.muted,
                },
              },
              clientId
          );
          return;
        }

        if (!client) {
          send({ type: "error", message: "Önce odaya katılmalısınız" });
          return;
        }

        const room = rooms.get(client.roomId);
        if (!room) return;

        switch (message.type) {
          case "leave": {
            cleanup();
            break;
          }
          case "offer":
          case "answer":
          case "ice-candidate": {
            const target = room.get((message as any).targetId);
            if (!target) return;
            const payload: VoiceServerMessage =
                message.type === "ice-candidate"
                    ? {
                      type: "ice-candidate",
                      fromId: client.id,
                      candidate: (message as any).candidate,
                    }
                    : {
                      type: message.type,
                      fromId: client.id,
                      sdp: (message as any).sdp,
                      username: client.username,
                    };
            if (target.socket.readyState === 1) {
              target.socket.send(JSON.stringify(payload));
            }
            break;
          }
          case "set-mute": {
            client.muted = !!(message as any).muted;
            broadcast(
                room,
                { type: "participant-muted", id: client.id, muted: client.muted },
                client.id
            );
            console.log(
                `[voice] ${client.username} is now ${
                    client.muted ? "muted 🔇" : "unmuted 🔊"
                }`
            );
            break;
          }
        }
      });

      socket.on("close", cleanup);
      socket.on("error", cleanup);
    });
  });
};
