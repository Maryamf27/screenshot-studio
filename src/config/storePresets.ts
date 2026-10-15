export type StorePlatform = "google-play" | "app-store";

export type StorePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  notes?: string;
};

export const storePresets = {
  googlePlay: {
    platform: "google-play" as const,
    label: "Google Play",
    presets: [
      { id: "phone", label: "Phone", width: 1080, height: 1920, orientation: "portrait" as const },
      { id: "tablet-7", label: "7\" tablet", width: 1440, height: 2560, orientation: "portrait" as const },
      { id: "tablet-10", label: "10\" tablet", width: 1440, height: 2560, orientation: "portrait" as const },
    ],
  },
  appStore: {
    platform: "app-store" as const,
    label: "App Store",
    presets: [
      { id: "iphone-dynamic-island-medium-1206", label: "iPhone Dynamic Island medium", width: 1206, height: 2622, orientation: "portrait" as const },
      { id: "iphone-dynamic-island-medium-1179", label: "iPhone Dynamic Island medium", width: 1179, height: 2556, orientation: "portrait" as const },
      { id: "iphone-dynamic-island-large", label: "iPhone Dynamic Island large", width: 1320, height: 2868, orientation: "portrait" as const },
      { id: "iphone-6-5-face-id", label: "iPhone 6.5\" Face ID", width: 1284, height: 2778, orientation: "portrait" as const },
      { id: "ipad-13", label: "iPad 13\"", width: 2064, height: 2752, orientation: "portrait" as const },
    ],
  },
} as const satisfies Record<string, { platform: StorePlatform; label: string; presets: readonly StorePreset[] }>;

export const allStorePresets = [
  ...storePresets.googlePlay.presets,
  ...storePresets.appStore.presets,
] as const;

export type StorePresetId = (typeof allStorePresets)[number]["id"];

export function getStorePreset(id: StorePresetId) {
  return allStorePresets.find((preset) => preset.id === id);
}

export const wizardSteps = [
  { id: 1, label: "Upload", description: "Add screenshots" },
  { id: 2, label: "Choose Target", description: "Select a store" },
  { id: 3, label: "Pick a Template", description: "Choose a layout" },
  { id: 4, label: "Customize per Screenshot", description: "Refine each image" },
  { id: 5, label: "Export", description: "Download assets" },
] as const;

export type WizardStep = (typeof wizardSteps)[number]["id"];
