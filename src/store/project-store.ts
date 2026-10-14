"use client";

import { get, set } from "idb-keyval";
import { create } from "zustand";
import type { StorePresetId, StorePlatform } from "@/src/config/storePresets";
import { getTemplate } from "@/src/renderer/templates";
import type { SlideBackgroundAccent } from "@/src/renderer/templates";

export type UploadedImage = {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  headline: string;
  subheadline: string;
  headlineFont?: string;
  subheadlineFont?: string;
  cardFontFamily?: string;
  headlineColor?: string;
  subheadlineColor?: string;
  badgeText?: string;
  showRatingBadge: boolean;
  ratingBadge: { score: string; stars: number; subtitle: string };
  cardItems?: { id: string; subtitle: string; title: string; detail?: string }[];
  floatingWidgetItems?: { id: string; title: string; subtitle: string }[];
  textAlignment?: "left" | "center" | "right";
  background?: { type: "solid" | "gradient"; primaryColor: string; secondaryColor: string; angle?: number };
  backgroundAccent?: SlideBackgroundAccent;
  showDecorativeLayers?: boolean;
  frameVisible?: boolean;
  frameColor?: "dark" | "light" | "accent";
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
  activeSlideIndex: number;
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
  setActiveTemplate: (id: string) => void;
  setActiveSlideIndex: (index: number) => void;
  updateSlide: (id: string, updates: Partial<Pick<UploadedImage, "headline" | "subheadline" | "headlineFont" | "subheadlineFont" | "cardFontFamily" | "headlineColor" | "subheadlineColor" | "textAlignment" | "background" | "backgroundAccent" | "showDecorativeLayers" | "frameVisible" | "frameColor" | "cardItems" | "floatingWidgetItems" | "showRatingBadge" | "ratingBadge">>) => void;
  applyBrandColorToAllSlides: () => void;
};

const STORAGE_KEY = "store-screenshot-studio-project";
const DEFAULT_HEADLINE = "Your Main Headline";
const DEFAULT_RATING_BADGE = { score: "4.9", stars: 5, subtitle: "Apps We Love" };

export const useProjectStore = create<ProjectState>((setState) => ({
  images: [],
  activeSlideIndex: 0,
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
              headline: DEFAULT_HEADLINE,
              subheadline: "",
              showRatingBadge: offset + index === 0,
              ratingBadge: { ...DEFAULT_RATING_BADGE },
            };
          }),
        ],
      };
    }),
  removeImage: (id) => setState((state) => {
    const removedIndex = state.images.findIndex((image) => image.id === id);
    const images = state.images.filter((image) => image.id !== id);
    return { images, activeSlideIndex: Math.min(Math.max(0, removedIndex < state.activeSlideIndex ? state.activeSlideIndex - 1 : state.activeSlideIndex), Math.max(0, images.length - 1)) };
  }),
  renameImage: (id, name) =>
    setState((state) => ({
      images: state.images.map((image) => (image.id === id ? { ...image, name } : image)),
    })),
  reorderImages: (images) => setState((state) => ({ images, activeSlideIndex: Math.max(0, images.findIndex((image) => image.id === state.images[state.activeSlideIndex]?.id)) })),
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
  setActiveTemplate: (activeTemplate) => setState((state) => {
    const template = getTemplate(activeTemplate);
    const selectedSlide = state.images[state.activeSlideIndex];
    if (!selectedSlide) return { activeTemplate: template.id };
    const cardItems = template.taskCards?.map((item, index) => ({ id: `${template.id}-${index}`, subtitle: item.time, title: item.title, detail: item.detail }))
      ?? template.routineRows?.rows.map((item, index) => ({ id: `${template.id}-${index}`, subtitle: item.time, title: item.title }));
    const floatingWidgetItems = template.floatingWidget ? [{ id: `${template.id}-widget-0`, title: template.floatingWidget.title, subtitle: template.floatingWidget.detail }] : undefined;

    // Template selection resets the active slide's visual overrides to this
    // definition while keeping the user's headline and subheadline copy.
    const background = {
      type: template.background.type,
      primaryColor: template.background.start,
      secondaryColor: template.background.end ?? template.background.start,
      angle: template.background.angle ?? 135,
    } as const;
    return {
      activeTemplate: template.id,
      images: state.images.map((image, index) => index === state.activeSlideIndex ? {
        ...image,
        background,
        textAlignment: template.headline.align as "left" | "center" | "right",
        headlineFont: undefined,
        subheadlineFont: undefined,
        cardFontFamily: undefined,
        headlineColor: undefined,
        subheadlineColor: undefined,
        badgeText: template.badge?.text,
        cardItems,
        floatingWidgetItems,
        frameVisible: undefined,
        frameColor: undefined,
        backgroundAccent: undefined,
        showDecorativeLayers: undefined,
        showRatingBadge: image.showRatingBadge ?? index === 0,
        ratingBadge: image.ratingBadge ?? { ...DEFAULT_RATING_BADGE },
      } : image),
    };
  }),
  setActiveSlideIndex: (activeSlideIndex) => setState((state) => ({ activeSlideIndex: Math.min(Math.max(0, Math.floor(activeSlideIndex)), Math.max(0, state.images.length - 1)) })),
  updateSlide: (id, updates) => setState((state) => ({ images: state.images.map((image) => image.id === id ? { ...image, ...updates } : image) })),
  applyBrandColorToAllSlides: () => setState((state) => ({
    images: state.images.map((image) => ({
      ...image,
      background: {
        type: image.background?.type ?? "solid",
        primaryColor: state.brandColor,
        secondaryColor: image.background?.secondaryColor ?? state.brandColor,
        angle: image.background?.angle ?? 135,
      },
    })),
  })),
}));

let hydrationStarted = false;
export function hydrateProjectStore() {
  if (hydrationStarted || typeof window === "undefined") return;
  hydrationStarted = true;
  void get<Partial<ProjectState>>(STORAGE_KEY).then((saved) => {
    if (!saved) return;
    const images = (saved.images ?? []).map((image, index) => {
      const fileName = typeof image.file?.name === "string" ? image.file.name : "";
      const fileTitle = fileName.replace(/\.[^/.]+$/, "");
      const storedHeadline = typeof image.headline === "string" ? image.headline : "";
      const legacyFileHeadline = [image.name, fileName, fileTitle].some((candidate) => candidate && storedHeadline === candidate);
      return {
        ...image,
        id: image.id || `${image.file?.lastModified ?? Date.now()}-${image.name || "slide"}-${index}`,
        name: image.name?.replace(/\.[^/.]+$/, "") || image.name || `Slide ${index + 1}`,
        headline: !storedHeadline || legacyFileHeadline ? DEFAULT_HEADLINE : storedHeadline,
        subheadline: image.subheadline ?? "",
        showRatingBadge: typeof image.showRatingBadge === "boolean" ? image.showRatingBadge : index === 0,
        ratingBadge: { ...DEFAULT_RATING_BADGE, ...image.ratingBadge },
      };
    });
    useProjectStore.setState({ ...saved, images, activeSlideIndex: Math.min(Math.max(0, saved.activeSlideIndex ?? 0), Math.max(0, images.length - 1)) });
  });
}

useProjectStore.subscribe((state) => {
  if (typeof window === "undefined") return;
  const persisted = {
    images: state.images,
    activeSlideIndex: state.activeSlideIndex,
    selectedPlatform: state.selectedPlatform,
    selectedPresetIds: state.selectedPresetIds,
    customDimensions: state.customDimensions,
    activeTemplate: state.activeTemplate,
    brandColor: state.brandColor,
    font: state.font,
  };
  void set(STORAGE_KEY, persisted);
});
