"use client";

import { get, set } from "idb-keyval";
import { create } from "zustand";
import type { StorePresetId, StorePlatform } from "@/src/config/storePresets";

export type UploadedImage = {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  headline: string;
  subheadline: string;
};

function slideNameFromFile(file: File) {
  return file.name.replace(/\.[^/.]+$/, "") || file.name;
}

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
  renameImage: (id: string, name: string) => void;
  reorderImages: (images: UploadedImage[]) => void;
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
    setState((state) => {
      const offset = state.images.length;
      const timestamp = Date.now();
      return {
        images: [
          ...state.images,
          ...files.slice(0, 10 - offset).map((file, index) => {
            const name = slideNameFromFile(file);
            return {
              id: `${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}-${offset + index}`,
              name,
              type: file.type,
              size: file.size,
              file,
              headline: name,
              subheadline: "",
            };
          }),
        ],
      };
    }),
  removeImage: (id) => setState((state) => ({ images: state.images.filter((image) => image.id !== id) })),
  renameImage: (id, name) =>
    setState((state) => ({
      images: state.images.map((image) => (image.id === id ? { ...image, name } : image)),
    })),
  reorderImages: (images) => setState({ images }),
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
    if (!saved) return;
    const images = (saved.images ?? []).map((image, index) => ({
      ...image,
      id: image.id || `${image.file?.lastModified ?? Date.now()}-${image.name || "slide"}-${index}`,
      name: image.name?.replace(/\.[^/.]+$/, "") || image.name || `Slide ${index + 1}`,
      headline: image.headline ?? image.name?.replace(/\.[^/.]+$/, "") ?? "",
      subheadline: image.subheadline ?? "",
    }));
    useProjectStore.setState({ ...saved, images });
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
