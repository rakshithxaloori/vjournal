import React from "react";
import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function Page() {
  return (
    <View>
      <Text>Home page</Text>
      <Button title="Go to video" onPress={() => router.push("/video")} />
      <Button title="Go to new" onPress={() => router.push("/new")} />
      <Button title="Go to signin" onPress={() => router.push("/signin")} />
    </View>
  );
}
