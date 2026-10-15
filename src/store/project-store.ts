"use client";

import { get, set } from "idb-keyval";
import { create } from "zustand";
import { allStorePresets, type StorePresetId, type StorePlatform } from "@/src/config/storePresets";
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
  templateId?: string;
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

export type BrandSettings = { brandColor: string; font: string };
export type SlideState = UploadedImage;
export type Project = {
  id: string;
  name: string;
  updatedAt: number;
  slides: SlideState[];
  globalSettings: BrandSettings & {
    activeSlideIndex: number;
    selectedPlatform: StorePlatform | null;
    selectedPresetIds: StorePresetId[];
    customDimensions: CustomDimension[];
    /** Legacy field migrated into slide.templateId during hydration. */
    activeTemplate?: string | null;
  };
};

type ProjectState = {
  projects: Project[];
  activeProjectId: string | null;
  hasHydrated: boolean;
  images: UploadedImage[];
  activeSlideIndex: number;
  selectedPlatform: StorePlatform | null;
  selectedPresetIds: StorePresetId[];
  customDimensions: CustomDimension[];
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
  setSlideTemplate: (id: string) => void;
  setActiveSlideIndex: (index: number) => void;
  updateSlide: (id: string, updates: Partial<Pick<UploadedImage, "headline" | "subheadline" | "badgeText" | "headlineFont" | "subheadlineFont" | "cardFontFamily" | "headlineColor" | "subheadlineColor" | "textAlignment" | "background" | "backgroundAccent" | "showDecorativeLayers" | "frameVisible" | "frameColor" | "cardItems" | "floatingWidgetItems" | "showRatingBadge" | "ratingBadge">>) => void;
  applyBrandColorToAllSlides: () => void;
  createProject: (name?: string) => Promise<string>;
  openProject: (id: string) => void;
  leaveProject: () => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
};

const STORAGE_KEY = "store-screenshot-studio-projects";
const LEGACY_STORAGE_KEY = "store-screenshot-studio-project";
const DEFAULT_HEADLINE = "Your Main Headline";
const EMPTY_RATING_BADGE = { score: "", stars: 0, subtitle: "" };
const TEMPLATE_RATING_DEFAULTS = [
  ["4.9", "Apps We Love"], ["4.9", "Highly rated"], ["5", "6000 reviews"], ["4.4", "227K reviews"], ["4.9", "Loved by learners"],
];
const TEMPLATE_BADGE_DEFAULTS = new Set(["★★★★★ 4.9 rating", "9m+ users", "trusted by 2m users", "academy approved", "new · featured"]);
const TEMPLATE_HEADLINE_DEFAULTS = new Set(["free shipping free returns", "ai stylist & outfit planner", "master any skill in weeks"]);
const TEMPLATE_COPY_DEFAULTS = new Set(["add a text", "optional subtitle", "optional detail", "9:00 am", "featured", "plan your next task", "stay focused and on track"]);
let projectCreationInFlight: Promise<string> | null = null;

export const useProjectStore = create<ProjectState>((setState, getState) => ({
  projects: [],
  activeProjectId: null,
  hasHydrated: false,
  images: [],
  activeSlideIndex: 0,
  selectedPlatform: null,
  selectedPresetIds: [],
  customDimensions: [],
  brandColor: "#111111",
  font: "Inter",
  createProject: (name = "Untitled Project") => {
    if (projectCreationInFlight) return projectCreationInFlight;
    projectCreationInFlight = (async () => {
      const state = getState();
      let projects = state.projects;
      const current = projects.find((project) => project.id === state.activeProjectId);
      if (current) {
        const savedCurrent: Project = {
          ...current,
          updatedAt: Date.now(),
          slides: state.images,
          globalSettings: {
            activeSlideIndex: state.activeSlideIndex,
            selectedPlatform: state.selectedPlatform,
            selectedPresetIds: state.selectedPresetIds,
            customDimensions: state.customDimensions,
            brandColor: state.brandColor,
            font: state.font,
          },
        };
        projects = projects.map((project) => project.id === current.id ? savedCurrent : project);
        await set(STORAGE_KEY, { projects, activeProjectId: state.activeProjectId });
      }

      const emptyUntitled = (project: Project) => project.name === "Untitled Project" && project.slides.length === 0;
      const reusable = (current && emptyUntitled(current)) ? current : projects.find(emptyUntitled);
      if (reusable) {
        const freshProject: Project = {
          ...reusable,
          updatedAt: Date.now(),
          slides: [],
          globalSettings: { activeSlideIndex: 0, selectedPlatform: null, selectedPresetIds: [], customDimensions: [], brandColor: "#111111", font: "Inter" },
        };
        const deduplicated = projects.map((project) => project.id === reusable.id ? freshProject : project).filter((project) => !emptyUntitled(project) || project.id === reusable.id);
        await set(STORAGE_KEY, { projects: deduplicated, activeProjectId: reusable.id });
        useProjectStore.setState({ projects: deduplicated, activeProjectId: reusable.id, images: freshProject.slides, ...freshProject.globalSettings });
        return reusable.id;
      }

      const id = crypto.randomUUID();
      const project: Project = { id, name, updatedAt: Date.now(), slides: [], globalSettings: { activeSlideIndex: 0, selectedPlatform: null, selectedPresetIds: [], customDimensions: [], brandColor: "#111111", font: "Inter" } };
      useProjectStore.setState({ ...project.globalSettings, images: [], projects: [...projects, project], activeProjectId: id });
      return id;
    })().finally(() => { projectCreationInFlight = null; });
    return projectCreationInFlight;
  },
  openProject: (id) => setState((state) => {
    const project = state.projects.find((item) => item.id === id);
    if (!project) return {};
    return { activeProjectId: id, images: project.slides, ...project.globalSettings };
  }),
  leaveProject: () => setState({ activeProjectId: null }),
  renameProject: (id, name) => setState((state) => ({ projects: state.projects.map((project) => project.id === id ? { ...project, name: name.trim() || project.name, updatedAt: Date.now() } : project) })),
  deleteProject: (id) => setState((state) => {
    const projects = state.projects.filter((project) => project.id !== id);
    if (state.activeProjectId !== id) return { projects };
    return { projects, activeProjectId: null, images: [], activeSlideIndex: 0, selectedPlatform: null, selectedPresetIds: [], customDimensions: [], brandColor: "#111111", font: "Inter" };
  }),
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
              templateId: "award-badge",
              showRatingBadge: false,
              ratingBadge: { ...EMPTY_RATING_BADGE },
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
  setSlideTemplate: (templateId) => setState((state) => {
    const template = getTemplate(templateId);
    if (!state.images[state.activeSlideIndex]) return {};
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
      images: state.images.map((image, index) => index === state.activeSlideIndex ? {
        ...image,
        templateId: template.id,
        headline: image.headline === DEFAULT_HEADLINE ? template.defaultHeadline ?? image.headline : image.headline,
        background,
        textAlignment: template.headline.align as "left" | "center" | "right",
        headlineFont: undefined,
        subheadlineFont: undefined,
        cardFontFamily: undefined,
        headlineColor: undefined,
        subheadlineColor: undefined,
        badgeText: image.badgeText ?? "",
        cardItems,
        floatingWidgetItems,
        frameVisible: undefined,
        frameColor: undefined,
        backgroundAccent: undefined,
        showDecorativeLayers: undefined,
        showRatingBadge: image.showRatingBadge ?? false,
        ratingBadge: image.ratingBadge ?? { ...EMPTY_RATING_BADGE },
      } : image),
    };
  }),
  setActiveSlideIndex: (activeSlideIndex) => setState((state) => ({ activeSlideIndex: Math.min(Math.max(0, Math.floor(activeSlideIndex)), Math.max(0, state.images.length - 1)) })),
  updateSlide: (id, updates) => setState((state) => ({ images: state.images.map((image) => image.id === id ? { ...image, ...updates } : image) })),
  applyBrandColorToAllSlides: () => setState((state) => ({
    images: state.images.map((image) => ({
      ...image,
      frameColor: "accent",
    })),
  })),
}));

let hydrationStarted = false;
export function hydrateProjectStore() {
  if (hydrationStarted || typeof window === "undefined") return;
  hydrationStarted = true;
  void Promise.all([get<{ projects?: Project[]; activeProjectId?: string | null }>(STORAGE_KEY), get<Partial<ProjectState> & { activeTemplate?: string | null }>(LEGACY_STORAGE_KEY)]).then(([saved, legacy]) => {
    const normalizeSlides = (slides: UploadedImage[] = [], templateId = "award-badge") => slides.map((image, index) => {
      const fileName = typeof image.file?.name === "string" ? image.file.name : "";
      const fileTitle = fileName.replace(/\.[^/.]+$/, "");
      const storedHeadline = typeof image.headline === "string" ? image.headline : "";
      const legacyFileHeadline = [image.name, fileName, fileTitle].some((candidate) => candidate && storedHeadline === candidate);
      const ratingBadge = { ...EMPTY_RATING_BADGE, ...image.ratingBadge };
      const templateGeneratedRating = TEMPLATE_RATING_DEFAULTS.some(([score, subtitle]) => ratingBadge.score === score && ratingBadge.subtitle === subtitle);
      const savedBadgeText = image.badgeText?.trim() ?? "";
      const templateGeneratedBadge = TEMPLATE_BADGE_DEFAULTS.has(savedBadgeText.toLowerCase().replace(/\s+/g, " "));
      const headline = !storedHeadline || legacyFileHeadline || TEMPLATE_HEADLINE_DEFAULTS.has(storedHeadline.trim().toLowerCase()) ? DEFAULT_HEADLINE : storedHeadline;
      const cleanCopy = (value: string) => TEMPLATE_COPY_DEFAULTS.has(value.trim().toLowerCase()) ? "" : value;
      return {
        ...image,
        templateId: getTemplate(image.templateId ?? templateId).id,
        id: image.id || `${image.file?.lastModified ?? Date.now()}-${image.name || "slide"}-${index}`,
        name: image.name?.replace(/\.[^/.]+$/, "") || image.name || `Slide ${index + 1}`,
        headline,
        subheadline: image.subheadline ?? "",
        badgeText: templateGeneratedBadge ? "" : image.badgeText ?? "",
        showRatingBadge: image.showRatingBadge === true && !templateGeneratedRating,
        ratingBadge,
        cardItems: image.cardItems?.map((item) => ({ ...item, title: cleanCopy(item.title), subtitle: cleanCopy(item.subtitle), detail: item.detail ? cleanCopy(item.detail) : item.detail })),
        floatingWidgetItems: image.floatingWidgetItems?.map((item) => ({ ...item, title: cleanCopy(item.title), subtitle: cleanCopy(item.subtitle) })),
      };
    });
    let projects = saved?.projects ?? [];
    let activeProjectId = saved?.activeProjectId ?? null;
    if (!saved && legacy) {
      const slides = normalizeSlides(legacy.images ?? [], legacy.activeTemplate ?? "award-badge");
      const hasLegacyWork = slides.length > 0 || Boolean(legacy.selectedPlatform || legacy.selectedPresetIds?.length || legacy.activeTemplate);
      if (hasLegacyWork) {
        const project: Project = {
          id: crypto.randomUUID(), name: "My Project", updatedAt: Date.now(), slides,
          globalSettings: {
            activeSlideIndex: legacy.activeSlideIndex ?? 0,
            selectedPlatform: legacy.selectedPlatform ?? null,
            selectedPresetIds: legacy.selectedPresetIds ?? [],
            customDimensions: legacy.customDimensions ?? [],
            brandColor: legacy.brandColor ?? "#111111",
            font: legacy.font ?? "Inter",
          },
        };
        projects = [project];
        activeProjectId = project.id;
      }
    }
    projects = projects.map((project) => {
      const { activeTemplate: legacyTemplateId, ...globalSettings } = project.globalSettings;
      return {
        ...project,
        slides: normalizeSlides(project.slides, legacyTemplateId ?? "award-badge"),
        globalSettings: {
          ...globalSettings,
          selectedPresetIds: (globalSettings.selectedPresetIds ?? []).filter((id) => allStorePresets.some((preset) => preset.id === id)),
        },
      };
    });
    const activeBeforeDedupe = projects.find((project) => project.id === activeProjectId);
    const blankProjects = projects.filter((project) => project.name === "Untitled Project" && project.slides.length === 0);
    const keptBlankId = blankProjects.some((project) => project.id === activeBeforeDedupe?.id) ? activeBeforeDedupe?.id : blankProjects[0]?.id;
    if (blankProjects.length > 1) projects = projects.filter((project) => project.name !== "Untitled Project" || project.slides.length > 0 || project.id === keptBlankId);
    const activeProject = projects.find((project) => project.id === activeProjectId);
    useProjectStore.setState({ projects, activeProjectId: activeProject?.id ?? null, hasHydrated: true, ...(activeProject ? { images: activeProject.slides, ...activeProject.globalSettings } : {}) });
  }).catch(() => useProjectStore.setState({ hasHydrated: true }));
}

useProjectStore.subscribe((state) => {
  if (typeof window === "undefined" || !state.hasHydrated) return;
  let projects = state.projects;
  const current = projects.find((project) => project.id === state.activeProjectId);
  if (current) {
    const globalSettings = { activeSlideIndex: state.activeSlideIndex, selectedPlatform: state.selectedPlatform, selectedPresetIds: state.selectedPresetIds, customDimensions: state.customDimensions, brandColor: state.brandColor, font: state.font };
    const changed = current.slides !== state.images || Object.keys(globalSettings).some((key) => current.globalSettings[key as keyof typeof globalSettings] !== globalSettings[key as keyof typeof globalSettings]);
    if (changed) {
      const updated: Project = { ...current, updatedAt: Date.now(), slides: state.images, globalSettings };
      projects = projects.map((project) => project.id === current.id ? updated : project);
      useProjectStore.setState({ projects });
    }
  }
  void set(STORAGE_KEY, { projects, activeProjectId: state.activeProjectId });
});
