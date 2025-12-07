import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚑 Rescue Circle</Text>
      <Text style={styles.subtitle}>Your emergency assistant app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "gray" }
});
