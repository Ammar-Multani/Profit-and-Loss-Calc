import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  History: undefined;
  Onboarding: undefined;
  CurrencySelector: undefined;
  Terms: undefined;
  Disclaimer: undefined;
  Privacy: undefined;
  Manual: undefined;
  BugReport: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;
export type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Settings"
>;
export type HistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "History"
>;
export type OnboardingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Onboarding"
>;
export type CurrencySelectorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CurrencySelector"
>;
