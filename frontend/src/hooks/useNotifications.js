import { useEffect, useMemo, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { notificationService, wsBaseUrl } from "../services/api";
import { useToast } from "../context/ToastContext";

export default function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const { info } = useToast();

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    notificationService
      .list()
      .then(({ data }) => setNotifications(data))
      .catch(() => setNotifications([]));
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;

    const client = new Client({
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
      debug: () => {},
    });

    client.onConnect = () => {
      setConnected(true);

      client.subscribe(`/topic/users/${userId}/notifications`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          setNotifications((prev) => [
            {
              id: payload.notificationId,
              message: payload.message,
              userId: payload.userId,
              isRead: payload.isRead,
              createdAt: payload.createdAt,
            },
            ...prev,
          ]);
          info(payload.message);
        } catch {
          // Ignore malformed payload
        }
      });
    };

    client.onStompError = () => {
      setConnected(false);
    };

    client.onWebSocketClose = () => {
      setConnected(false);
    };

    client.activate();

    return () => {
      setConnected(false);
      client.deactivate();
    };
  }, [userId, info]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const markAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch {
      // Best effort action.
    }
  };

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
  };
}
