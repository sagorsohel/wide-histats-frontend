import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5050";

let socket: Socket | null = null;
let currentSubscribedWebsiteId: string | null = null;

export const getSocket = (): Socket => {
  if (!socket && typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken") || "";
    socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      if (currentSubscribedWebsiteId) {
        socket?.emit("subscribe:website", currentSubscribedWebsiteId);
      }
    });
  }
  return socket!;
};

export const subscribeToWebsite = (websiteId: string) => {
  currentSubscribedWebsiteId = websiteId;
  const s = getSocket();
  if (s) {
    s.emit("subscribe:website", websiteId);
  }
};

export const unsubscribeFromWebsite = (websiteId: string) => {
  if (currentSubscribedWebsiteId === websiteId) {
    currentSubscribedWebsiteId = null;
  }
  const s = getSocket();
  if (s) {
    s.emit("unsubscribe:website", websiteId);
  }
};
