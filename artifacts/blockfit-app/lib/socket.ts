import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? "http://localhost:3001" : "");

class SocketManager {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(BASE_URL, {
        transports: ["websocket"],
        autoConnect: true,
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket?.id);
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();

export function useSocketListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = socketManager.connect();

    const listenToAthleteUpdates = async () => {
      try {
        const storedUserStr = await AsyncStorage.getItem("atleta_user");
        if (storedUserStr) {
          const user = JSON.parse(storedUserStr);
          if (user?.id) {
            socket.on(`athlete_update_${user.id}`, (payload: any) => {
              console.log("Real-time athlete update received:", payload);
              // Invalidate relevant queries to fetch fresh data
              queryClient.invalidateQueries();
            });
          }
        }
      } catch (error) {
        console.error("Failed to parse athlete_user for socket:", error);
      }
    };

    // Escucha eventos globales de configuración
    socket.on("setting_updated", () => {
      queryClient.invalidateQueries();
    });
    
    socket.on("feature_flag_updated", () => {
      queryClient.invalidateQueries();
    });

    socket.on("remote_config_updated", () => {
      queryClient.invalidateQueries();
    });

    listenToAthleteUpdates();

    return () => {
      socket.off("setting_updated");
      socket.off("feature_flag_updated");
      socket.off("remote_config_updated");
      socketManager.disconnect();
    };
  }, [queryClient]);
}

export function SocketListener() {
  useSocketListener();
  return null;
}
