// Singleton socket.io — portage web de yaammoo/src/services/socket.ts.
// Rooms rejointes au login : app:<appId>, user:<userId>, et cote marchand
// la room de la boutique pour les evenements de commandes.
import { io } from "socket.io-client";
import { Config } from "./config.js";
import { IS_DEMO } from "./demo/flag.js";

let socket = null;

export const socketService = {
  connect() {
    // Mode demo : faux socket inerte, aucune connexion au backend.
    if (IS_DEMO) return { emit() {}, on() {}, off() {}, connected: false };
    if (socket?.connected) return socket;
    socket = io(Config.socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
    });
    return socket;
  },

  get() {
    return socket;
  },

  joinRoom(room) {
    if (!room) return;
    socketService.connect().emit("joinRoom", room);
  },

  leaveRoom(room) {
    if (!room || !socket) return;
    socket.emit("leaveRoom", room);
  },

  on(event, handler) {
    const s = socketService.connect();
    s.on(event, handler);
    return () => s.off(event, handler);
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
};

/** Evenements commandes ecoutes par le dashboard marchand. */
export const ORDER_EVENTS = {
  newOrder: "newFastFoodOrder",
  newOrders: "newFastFoodOrders",
  orderUpdated: "fastFoodOrderUpdated",
  ordersUpdated: "fastFoodOrdersUpdated",
  ranksUpdated: "ordersRankUpdated",
  menuCreated: "newFastFoodMenu",
  menuUpdated: "fastFoodMenuUpdated",
  menuDeleted: "fastFoodMenuDeleted",
};
