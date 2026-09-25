import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore, bootstrapAuth } from "../../store/auth";
import { colors, radius, spacing, typography } from "../../theme";
import type { TabScreenProps } from "../../navigation/types";

type Props = TabScreenProps<"Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const canStudio = user.role === "ARTISAN" || user.role === "PRODUCER";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
        {user.giCluster ? <Text style={styles.cluster}>GI Cluster: {user.giCluster}</Text> : null}
      </View>
      <View style={styles.infoCard}>
        <InfoRow label="Phone" value={user.phone} />
        <InfoRow label="Email" value={user.email ?? "—"} />
        <InfoRow label="Member since" value={new Date(user.createdAt).toLocaleDateString()} />
      </View>
      {canStudio ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("ArtisanStudio")}
        >
          <Text style={styles.primaryButtonText}>Artisan Studio</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={styles.logoutButton} onPress={() => void logout()}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          void bootstrapAuth();
        }}
      >
        <Text style={styles.retryText}>Refresh session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, alignItems: "center" },
  header: { alignItems: "center", marginBottom: spacing.xl },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.white, fontSize: 36, fontWeight: "800" },
  name: { ...typography.title },
  role: { ...typography.label, color: colors.secondary, marginTop: 2, textTransform: "uppercase" },
  cluster: { ...typography.caption, marginTop: spacing.sm },
  infoCard: {
    alignSelf: "stretch",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  infoLabel: { ...typography.body, color: colors.textMuted },
  infoValue: { ...typography.body, fontWeight: "600" },
  primaryButton: {
    alignSelf: "stretch",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  primaryButtonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  logoutButton: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  logoutText: { color: colors.danger, fontWeight: "700" },
  retryButton: { marginTop: spacing.lg },
  retryText: { ...typography.label, color: colors.textMuted },
});