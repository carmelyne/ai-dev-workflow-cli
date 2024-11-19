import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import yaml from 'js-yaml';
import type { YAMLContent, YAMLOptions } from '../types/yaml.js';

export async function loadYamlFile<T extends YAMLContent>(
  filePath: string,
  defaultContent: T | null = null
): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf8');
    const parsed = yaml.load(content);
    return (parsed as T) || defaultContent;
  } catch (error: any) {
    if (error.code === 'ENOENT' && defaultContent !== null) {
      await saveYamlFile(filePath, defaultContent);
      return defaultContent;
    }
    throw error;
  }
}

export async function saveYamlFile(
  filePath: string,
  content: YAMLContent,
  options: YAMLOptions = {}
): Promise<void> {
  const yamlContent = yaml.dump(content, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: true,
    ...options
  });

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, yamlContent, 'utf8');
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, any>
    ? DeepPartial<T[P]>
    : T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P];
};

export function mergeYamlFiles<T extends Record<string, unknown>>(
  base: T,
  overlay: DeepPartial<T>
): T {
  if (!base || typeof base !== 'object') return overlay as T;
  if (!overlay || typeof overlay !== 'object') return base;

  const result = { ...base } as T;

  Object.entries(overlay).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      delete result[key as keyof T];
    } else if (Array.isArray(value)) {
      const baseValue = result[key as keyof T];
      result[key as keyof T] = (Array.isArray(baseValue)
        ? [...baseValue, ...value]
        : [...value]) as T[keyof T];
    } else if (typeof value === 'object') {
      const baseValue = result[key as keyof T];
      result[key as keyof T] = (typeof baseValue === 'object'
        ? mergeYamlFiles(
            baseValue as Record<string, unknown>,
            value as Record<string, unknown>
          )
        : value) as T[keyof T];
    } else {
      result[key as keyof T] = value as T[keyof T];
    }
  });

  return result;
}
