import type { NavigatorScreenParams } from "@react-navigation/native";
import type { CompositeScreenProps } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Catalog: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  ProductDetail: { productId: string };
  Checkout: undefined;
  OrderDetail: { orderId: string };
  ArtisanStudio: undefined;
};

export const AuthStack = createNativeStackNavigator<AuthStackParamList>();
export const MainTabs = createBottomTabNavigator<MainTabParamList>();
export const RootStack = createNativeStackNavigator<RootStackParamList>();

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export const orderStatusColor: Record<string, string> = {
  CONFIRMED: "#059669",
  IN_WORKSHOP: "#D97706",
  QUALITY_PASSED: "#059669",
  READY_FOR_PICKUP: "#D97706",
  SHIPPED: "#0284C7",
  IN_TRANSIT: "#0284C7",
  OUT_FOR_DELIVERY: "#7C3AED",
  DELIVERED: "#059669",
  CANCELLED: "#DC2626",
  DISPUTED: "#DC2626",
};

export function money(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `\u20B9${Number.isFinite(num) ? num.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "0"}`;
}