import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { loadYamlFile, saveYamlFile } from './yaml.js';
import type { YAMLObject, YAMLContent } from '../types/yaml.js';

export interface ProjectDetails extends Record<string, YAMLContent> {
  name: string;
  type: string;
  description: string;
}

export interface TestConfig extends Record<string, YAMLContent> {
  command: string;
}

export interface BaseProjectConfig {
  project: ProjectDetails;
  name: string;
  development_workflow: Record<string, unknown>;
  test?: TestConfig;
}

export type ProjectConfig = YAMLObject<BaseProjectConfig>;

/**
 * Load the project configuration from the .ai/config.yaml file
 * @returns The project configuration or null if not found
 */
export async function loadConfig(): Promise<ProjectConfig | null> {
  const configPath = join('.ai', 'config.yaml');
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const config = await loadYamlFile<ProjectConfig>(configPath, null);
    return config;
  } catch (error) {
    return null;
  }
}

/**
 * Get the project configuration
 * @returns The project configuration or null if not found
 */
export async function getProjectConfig(): Promise<ProjectConfig | null> {
  return loadConfig();
}

/**
 * Sync the project configuration with a template
 * @param templatePath Path to the template file
 */
export async function syncConfigWithTemplate(templatePath: string): Promise<void> {
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  try {
    const template = await loadYamlFile<ProjectConfig>(templatePath, null);
    if (!template) {
      throw new Error('Invalid template configuration');
    }

    const configPath = join('.ai', 'config.yaml');
    const configDir = dirname(configPath);
    
    // Explicitly create the config directory
    mkdirSync(configDir, { recursive: true });

    await saveYamlFile(
      configPath,
      template,
      {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: true
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to sync config with template');
  }
}
