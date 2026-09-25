import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";
import { colors, radius, spacing, typography } from "../../theme";
import { useAuthStore } from "../../store/auth";
import type { Role } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const ROLES: { label: string; value: Role }[] = [
  { label: "Buyer", value: "BUYER" },
  { label: "Artisan", value: "ARTISAN" },
  { label: "Producer", value: "PRODUCER" },
  { label: "Delivery Agent", value: "DELIVERY" },
];

export default function RegisterScreen({ navigation }: Props) {
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [giCluster, setGiCluster] = useState("");
  const [role, setRole] = useState<Role>("BUYER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!name.trim() || !phone.trim() || password.length < 8) {
      setError("Name, phone, and a password of at least 8 characters are required");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        password,
        email: email.trim() || undefined,
        giCluster: role === "ARTISAN" && giCluster.trim() ? giCluster.trim() : undefined,
        role,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
        <TextInput
          style={styles.input}
          placeholder="Phone (+91...)"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Email (optional)"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 8 chars)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Text style={styles.label}>I am a...</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.rolePill, role === r.value && styles.rolePillActive]}
              onPress={() => setRole(r.value)}
            >
              <Text style={[styles.roleText, role === r.value && styles.roleTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {role === "ARTISAN" ? (
          <TextInput
            style={styles.input}
            placeholder="GI Cluster (e.g. Darjeeling, Banaras)"
            value={giCluster}
            onChangeText={setGiCluster}
          />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl },
  title: { ...typography.title, textAlign: "center", marginBottom: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 15,
  },
  label: { ...typography.label, marginBottom: spacing.sm },
  roleRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  rolePill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rolePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleText: { ...typography.body, color: colors.text },
  roleTextActive: { color: colors.white, fontWeight: "600" },
  error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: { color: colors.white, fontWeight: "700" },
  link: { ...typography.label, color: colors.primary, textAlign: "center", marginTop: spacing.lg },
});