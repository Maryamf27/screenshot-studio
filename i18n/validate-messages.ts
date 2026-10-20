import en from '../messages/en.json';
import es from '../messages/es.json';
import fr from '../messages/fr.json';
import de from '../messages/de.json';
import {templates} from '@/src/renderer/templates';

type LocaleMessages = Record<string, unknown>;
const requiredColorGroups = ['solid_light_warm', 'pastel_vibrant', 'gradients', 'dark_premium'];
const requiredColorPresets = [
  'golden_yellow', 'warm_taupe', 'pure_white', 'crisp_slate_light', 'soft_lavender', 'blush_pink', 'mint_green', 'sky_blue',
  'sunset_pop', 'cool_indigo', 'emerald_wave', 'soft_aura', 'obsidian_dark', 'midnight_navy', 'deep_violet', 'charcoal',
];

function hasMessage(messages: LocaleMessages, path: string) {
  return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as LocaleMessages)[key] : undefined, messages) !== undefined;
}

function leafPaths(value: LocaleMessages, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? leafPaths(child as LocaleMessages, path)
      : [path];
  }).sort();
}

export function validateMessages() {
  const resources = {en, es, fr, de};
  const reference = leafPaths(en as LocaleMessages);
  const errors: string[] = [];

  for (const [locale, messages] of Object.entries(resources)) {
    const paths = leafPaths(messages as LocaleMessages);
    const missing = reference.filter((path) => !paths.includes(path));
    const extra = paths.filter((path) => !reference.includes(path));
    if (missing.length) errors.push(`${locale}: missing keys ${missing.join(', ')}`);
    if (extra.length) errors.push(`${locale}: unexpected keys ${extra.join(', ')}`);

    const colorKeys = [...requiredColorGroups.map((key) => `presetGroups.${key}`), ...requiredColorPresets.map((key) => `presets.${key}`)];
    const missingColorKeys = colorKeys.filter((key) => !hasMessage(messages as LocaleMessages, key));
    if (missingColorKeys.length) errors.push(`${locale}: missing color preset labels ${missingColorKeys.join(', ')}`);

    const templateKeys = Object.keys(messages.templates as Record<string, unknown>).sort();
    const templateIds = templates.map(({id}) => id).sort();
    if (templateKeys.join('|') !== templateIds.join('|')) {
      errors.push(`${locale}: template metadata does not match the available template IDs`);
    }
  }

  if (errors.length) throw new Error(`Invalid localization resources:\n${errors.join('\n')}`);
}
