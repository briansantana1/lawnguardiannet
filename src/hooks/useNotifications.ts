import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export type NotificationPreference = "browser" | "email" | "both" | "none";

interface UseNotificationsReturn {
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<boolean>;
  sendBrowserNotification: (title: string, options?: NotificationOptions) => void;
  isSupported: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  const isSupported = typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("Browser notifications are not supported on this device");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("Browser notifications enabled!");
        return true;
      } else if (result === "denied") {
        toast.error("Notification permission denied. You can enable it in browser settings.");
        return false;
      } else {
        toast.info("Please allow notifications when prompted");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to request notification permission");
      return false;
    }
  }, [isSupported]);

  const sendBrowserNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported) {
        console.warn("Browser notifications not supported");
        return;
      }

      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    },
    [isSupported, permission]
  );

  return {
    permission,
    requestPermission,
    sendBrowserNotification,
    isSupported,
  };
}
