import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.analycos.com";

let socket: Socket | null = null;
let currentSubscribedWebsiteId: string | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let serverKickTimer: ReturnType<typeof setTimeout> | null = null;
let serverKickAttempts = 0;

const readToken = (): string =>
  typeof window === "undefined" ? "" : localStorage.getItem("accessToken") || "";

const hasSession = (): boolean => !!readToken();

const emitSubscribe = (s: Socket, websiteId: string) => {
  s.emit("subscribe:website", { websiteId, token: readToken() });
};

const handleWakeup = () => {
  if (!socket || document.visibilityState !== "visible" || !hasSession()) return;
  socket.auth = { token: readToken() };
  if (!socket.connected) {
    socket.connect(); // the "connect" handler resubscribes and fires histat:socket_sync
  } else if (currentSubscribedWebsiteId) {
    emitSubscribe(socket, currentSubscribedWebsiteId);
  }
};

/**
 * Lazily creates the shared socket. Returns null on the server.
 * Never connects without a session token.
 */
export const getSocket = (): Socket | null => {
  if (typeof window === "undefined") return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: (cb) => cb({ token: readToken() }),
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      serverKickAttempts = 0;
      if (currentSubscribedWebsiteId && socket) {
        emitSubscribe(socket, currentSubscribedWebsiteId);
      }
      // Lets pages pull anything missed while disconnected.
      window.dispatchEvent(new CustomEvent("histat:socket_sync"));
    });

    socket.on("disconnect", (reason) => {
      // socket.io auto-reconnects for transport errors. A server-initiated disconnect
      // (e.g. rejected token) does not, so retry a few times with backoff, never in a tight loop.
      if (reason === "io server disconnect" && hasSession() && serverKickAttempts < 5) {
        const delay = Math.min(30_000, 2_000 * 2 ** serverKickAttempts);
        serverKickAttempts += 1;
        if (serverKickTimer) clearTimeout(serverKickTimer);
        serverKickTimer = setTimeout(() => {
          if (socket && !socket.connected && hasSession()) {
            socket.auth = { token: readToken() };
            socket.connect();
          }
        }, delay);
      }
    });

    // Keep-alive ping; also revives a dead connection while the tab is visible.
    heartbeatTimer = setInterval(() => {
      if (!socket || !hasSession()) return;
      if (socket.connected) {
        socket.emit("ping:heartbeat", { t: Date.now() });
      } else if (document.visibilityState === "visible" && !socket.active) {
        socket.connect();
      }
    }, 25_000);

    document.addEventListener("visibilitychange", handleWakeup);
    window.addEventListener("online", handleWakeup);
  }

  if (!socket.connected && !socket.active && hasSession()) {
    socket.auth = { token: readToken() };
    socket.connect();
  }

  return socket;
};

export const subscribeToWebsite = (websiteId: string) => {
  if (!websiteId) return;
  currentSubscribedWebsiteId = websiteId;
  const s = getSocket();
  if (!s) return;
  if (s.connected) {
    emitSubscribe(s, websiteId); // otherwise the "connect" handler subscribes
  }
};

export const unsubscribeFromWebsite = (websiteId: string) => {
  if (currentSubscribedWebsiteId === websiteId) {
    currentSubscribedWebsiteId = null;
  }
  // Don't create/connect a socket just to unsubscribe.
  if (socket?.connected) {
    socket.emit("unsubscribe:website", websiteId);
  }
};

/** Call after login / token refresh so the socket authenticates with the new token. */
export const reconnectSocketWithToken = () => {
  if (typeof window === "undefined" || !hasSession()) return;
  const token = readToken();
  const s = getSocket();
  if (!s) return;
  s.auth = { token };
  if (s.connected) {
    s.emit("auth:token", token);
    if (currentSubscribedWebsiteId) emitSubscribe(s, currentSubscribedWebsiteId);
  } else if (!s.active) {
    s.connect();
  }
};

/** Call on logout: drop the connection and forget the subscription. */
export const disconnectSocket = () => {
  currentSubscribedWebsiteId = null;
  serverKickAttempts = 0;
  if (serverKickTimer) {
    clearTimeout(serverKickTimer);
    serverKickTimer = null;
  }
  if (socket) {
    socket.disconnect();
  }
};

// Exposed for completeness; the singleton normally lives for the whole session.
export const destroySocket = () => {
  disconnectSocket();
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", handleWakeup);
    window.removeEventListener("online", handleWakeup);
  }
  socket?.removeAllListeners();
  socket = null;
};
