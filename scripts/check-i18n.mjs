import {readFileSync} from 'node:fs';

const locales = ['en', 'es', 'fr', 'de', 'ar'];
const messages = Object.fromEntries(locales.map((locale) => [
  locale,
  JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8'))
]));

function collect(value, prefix = '', output = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(child)) child.forEach((item, index) => {
      const itemPath = `${path}.${index}`;
      if (item && typeof item === 'object') collect(item, itemPath, output);
      else output[itemPath] = item;
    });
    else if (child && typeof child === 'object') collect(child, path, output);
    else output[path] = child;
  }
  return output;
}

function placeholders(value) {
  return [...String(value).matchAll(/\{([\w.]+)(?:,[^}]*)?\}/g)].map((match) => match[1]).sort();
}

const flattened = Object.fromEntries(locales.map((locale) => [locale, collect(messages[locale])]));
const referenceKeys = Object.keys(flattened.en).sort();
const errors = [];

for (const locale of locales.slice(1)) {
  const keys = Object.keys(flattened[locale]).sort();
  for (const key of referenceKeys) if (!(key in flattened[locale])) errors.push(`${locale}: missing ${key}`);
  for (const key of keys) if (!(key in flattened.en)) errors.push(`${locale}: extra ${key}`);
}

for (const key of referenceKeys) {
  for (const locale of locales) {
    const value = flattened[locale][key];
    if (typeof value !== 'string' || !value.trim()) errors.push(`${locale}: ${key} must be a non-empty string`);
    else if (JSON.stringify(placeholders(value)) !== JSON.stringify(placeholders(flattened.en[key]))) {
      errors.push(`${locale}: interpolation placeholders differ for ${key}`);
    }
  }
}

const rendererSource = readFileSync(new URL('../src/renderer/templates.ts', import.meta.url), 'utf8');
const typeBlock = rendererSource.match(/export type TemplateId\s*=([\s\S]*?);/)?.[1] ?? '';
const templateIds = [...typeBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]).sort();
for (const locale of locales) {
  const metadataIds = Object.keys(messages[locale].templates ?? {}).sort();
  if (JSON.stringify(metadataIds) !== JSON.stringify(templateIds)) errors.push(`${locale}: template metadata IDs do not match TemplateId`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Localization check passed for ${locales.join(', ')} (${referenceKeys.length} keys and ${templateIds.length} template IDs).`);
}
