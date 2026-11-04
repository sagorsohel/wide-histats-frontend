import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5050";

let socket: Socket | null = null;
let currentSubscribedWebsiteId: string | null = null;

export const getSocket = (): Socket => {
  if (typeof window === "undefined") return null as any;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: (cb) => {
        const token = localStorage.getItem("accessToken") || "";
        cb({ token });
      },
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      if (currentSubscribedWebsiteId) {
        socket?.emit("subscribe:website", currentSubscribedWebsiteId);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("histat:socket_sync"));
      }
    });

    socket.on("disconnect", (reason) => {
      // If server or transport disconnected while backgrounded, auto-reconnect
      if (reason === "io server disconnect" || reason === "transport close") {
        setTimeout(() => {
          socket?.connect();
        }, 1000);
      }
    });

    // Auto-reconnect & resubscribe when tab regains focus or becomes visible
    const handleWakeup = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        const token = localStorage.getItem("accessToken") || "";
        if (socket) {
          socket.auth = { token };
          if (!socket.connected) {
            socket.connect();
          } else if (currentSubscribedWebsiteId) {
            socket.emit("subscribe:website", currentSubscribedWebsiteId);
          }
        }
        window.dispatchEvent(new CustomEvent("histat:socket_sync"));
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleWakeup);
      window.addEventListener("focus", handleWakeup);
      window.addEventListener("online", handleWakeup);
    }
  }

  // If socket was disconnected while tab was asleep, trigger reconnect
  if (socket && !socket.connected) {
    const token = localStorage.getItem("accessToken") || "";
    socket.auth = { token };
    socket.connect();
  }

  return socket;
};

export const subscribeToWebsite = (websiteId: string) => {
  if (!websiteId) return;
  currentSubscribedWebsiteId = websiteId;
  const s = getSocket();
  if (s) {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
    if (!s.connected) {
      s.connect();
    } else {
      s.emit("subscribe:website", { websiteId, token });
    }
  }
};

export const unsubscribeFromWebsite = (websiteId: string) => {
  if (currentSubscribedWebsiteId === websiteId) {
    currentSubscribedWebsiteId = null;
  }
  const s = getSocket();
  if (s && s.connected) {
    s.emit("unsubscribe:website", websiteId);
  }
};

export const reconnectSocketWithToken = () => {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("accessToken") || "";
  const s = getSocket();
  if (s) {
    s.auth = { token };
    if (s.connected) {
      s.emit("auth:token", token);
      if (currentSubscribedWebsiteId) {
        s.emit("subscribe:website", { websiteId: currentSubscribedWebsiteId, token });
      }
    } else {
      s.connect();
    }
  }
};

