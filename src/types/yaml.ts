export type BasicYAMLContent = string | number | boolean | null | undefined;

export type YAMLContent =
  | BasicYAMLContent
  | { [key: string]: YAMLContent }
  | YAMLContent[];

export interface YAMLOptions {
  indent?: number;
  lineWidth?: number;
  noRefs?: boolean;
  sortKeys?: boolean;
}

// Helper type for YAML objects that allows for known properties and additional string indexing
export type YAMLObject<T = unknown> = T & {
  [key: string]: YAMLContent;
};

// Type guard to check if a value is a YAMLContent
export function isYAMLContent(value: unknown): value is YAMLContent {
  if (value === null || value === undefined) return true;
  if (['string', 'number', 'boolean'].includes(typeof value)) return true;
  if (Array.isArray(value)) return value.every(isYAMLContent);
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every(isYAMLContent);
  }
  return false;
}

// Helper type for arrays in YAML
export type YAMLArray<T> = T[] & YAMLContent[];
