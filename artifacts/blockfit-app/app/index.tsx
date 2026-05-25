import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const [auth, setAuth] = useState<{ loading: boolean; authenticated: boolean }>({
    loading: true,
    authenticated: false,
  });

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("atleta_token");
      setAuth({ loading: false, authenticated: !!token });
    })();
  }, []);

  if (auth.loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#ff4444" />
      </View>
    );
  }

  if (auth.authenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/login" />;
}
