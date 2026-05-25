import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { NotificationItem } from "@/components/NotificationItem";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { gymApi } from "@/lib/api";
import { Notification } from "@/types";

function group(items: Notification[]) {
  const today: Notification[] = [];
  const week: Notification[] = [];
  const older: Notification[] = [];
  const now = Date.now();
  for (const n of items) {
    const ageMs = now - new Date(n.date).getTime();
    if (ageMs < 86400000) today.push(n);
    else if (ageMs < 86400000 * 7) week.push(n);
    else older.push(n);
  }
  return { today, week, older };
}

export default function Notifications() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await gymApi.getNotifications();
        if (res.success) {
          setItems(res.data.sort((a, b) => +new Date(b.date) - +new Date(a.date)));
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    })();
  }, []);

  const { today, week, older } = group(items);
  const isEmpty = items.length === 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 24 + (Platform.OS === "web" ? 34 : insets.bottom) }}
    >
      {isEmpty ? (
        <EmptyState icon="notifications-outline" title="Sin notificaciones" subtitle="Te avisaremos cuando haya novedades." />
      ) : (
        <>
          {today.length > 0 && (
            <>
              <SectionHeader title="Hoy" />
              {today.map((n) => <NotificationItem key={n.id} notification={n} />)}
            </>
          )}
          {week.length > 0 && (
            <>
              <SectionHeader title="Esta semana" />
              {week.map((n) => <NotificationItem key={n.id} notification={n} />)}
            </>
          )}
          {older.length > 0 && (
            <>
              <SectionHeader title="Anteriores" />
              {older.map((n) => <NotificationItem key={n.id} notification={n} />)}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}
