import React from "react";
import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function Page() {
  return (
    <View>
      <Text>Home page</Text>
      <Link href="/video">
        <Button title="Go to video" />
      </Link>
      <Link href="/new">
        <Button title="Go to new" />
      </Link>
    </View>
  );
}
