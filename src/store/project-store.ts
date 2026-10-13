"use client";

import { get, set } from "idb-keyval";
import { create } from "zustand";
import type { StorePresetId, StorePlatform } from "@/src/config/storePresets";

export type UploadedImage = {
  id: string;
  name: string;
  type: string;
  size: number;
  file: Blob;
};

export type CustomDimension = {
  id: string;
  name: string;
  width: number;
  height: number;
};

type ProjectState = {
  images: UploadedImage[];
  selectedPlatform: StorePlatform | null;
  selectedPresetIds: StorePresetId[];
  customDimensions: CustomDimension[];
  activeTemplate: string | null;
  brandColor: string;
  font: string;
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  reorderImages: (activeId: string, overId: string) => void;
  setPlatform: (platform: StorePlatform) => void;
  togglePreset: (id: StorePresetId) => void;
  addCustomDimension: (dimension: Omit<CustomDimension, "id">) => void;
  removeCustomDimension: (id: string) => void;
  setBrandSettings: (settings: Partial<Pick<ProjectState, "brandColor" | "font">>) => void;
};

const STORAGE_KEY = "store-screenshot-studio-project";

export const useProjectStore = create<ProjectState>((setState) => ({
  images: [],
  selectedPlatform: null,
  selectedPresetIds: [],
  customDimensions: [],
  activeTemplate: null,
  brandColor: "#111111",
  font: "Inter",
  addImages: (files) =>
    setState((state) => ({
      images: [
        ...state.images,
        ...files.slice(0, 10 - state.images.length).map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          file,
        })),
      ],
    })),
  removeImage: (id) => setState((state) => ({ images: state.images.filter((image) => image.id !== id) })),
  reorderImages: (activeId, overId) =>
    setState((state) => {
      const oldIndex = state.images.findIndex((image) => image.id === activeId);
      const newIndex = state.images.findIndex((image) => image.id === overId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return state;
      const images = [...state.images];
      const [moved] = images.splice(oldIndex, 1);
      images.splice(newIndex, 0, moved);
      return { images };
    }),
  setPlatform: (selectedPlatform) => setState({ selectedPlatform, selectedPresetIds: [] }),
  togglePreset: (id) =>
    setState((state) => ({
      selectedPresetIds: state.selectedPresetIds.includes(id)
        ? state.selectedPresetIds.filter((presetId) => presetId !== id)
        : [...state.selectedPresetIds, id],
    })),
  addCustomDimension: (dimension) => setState((state) => ({ customDimensions: [...state.customDimensions, { ...dimension, id: crypto.randomUUID() }] })),
  removeCustomDimension: (id) => setState((state) => ({ customDimensions: state.customDimensions.filter((dimension) => dimension.id !== id) })),
  setBrandSettings: (settings) => setState(settings),
}));

let hydrationStarted = false;
export function hydrateProjectStore() {
  if (hydrationStarted || typeof window === "undefined") return;
  hydrationStarted = true;
  void get<Partial<ProjectState>>(STORAGE_KEY).then((saved) => {
    if (saved) useProjectStore.setState(saved);
  });
}

useProjectStore.subscribe((state) => {
  if (typeof window === "undefined") return;
  const persisted = {
    images: state.images,
    selectedPlatform: state.selectedPlatform,
    selectedPresetIds: state.selectedPresetIds,
    customDimensions: state.customDimensions,
    activeTemplate: state.activeTemplate,
    brandColor: state.brandColor,
    font: state.font,
  };
  void set(STORAGE_KEY, persisted);
});
