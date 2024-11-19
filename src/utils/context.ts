import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { loadYamlFile, saveYamlFile } from './yaml.js';
import { loadConfig, type ProjectConfig } from './config.js';
import chalk from 'chalk';
import type { YAMLObject, YAMLContent, YAMLArray } from '../types/yaml.js';

const CONTEXT_FILE = '.context.yaml';

type Status = 'success' | 'error';

interface HistoryEntry extends Record<string, YAMLContent> {
  timestamp: string;
  command: string;
  status: Status;
  args?: string[];
  message?: string;
}

interface BaseContextData {
  currentStep?: string;
  history: YAMLArray<HistoryEntry>;
  data: Record<string, YAMLContent>;
}

export type ContextData = YAMLObject<BaseContextData>;

export interface ContextDisplayOptions {
  verbose: boolean;
}

/**
 * Load context from the context file. Creates default context if file doesn't exist.
 */
export async function loadContext(): Promise<ContextData> {
  try {
    const contextPath = getContextPath();
    const defaultContext: ContextData = {
      history: [],
      data: {}
    };
    const context = await loadYamlFile<ContextData>(contextPath, defaultContext);
    return context ?? defaultContext;
  } catch (error) {
    throw new Error('Failed to load context: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Save context to the context file
 */
export async function saveContext(context: ContextData): Promise<void> {
  try {
    const contextPath = getContextPath();
    await saveYamlFile(contextPath, context, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: true
    });
  } catch (error) {
    throw new Error('Failed to save context: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Clear all context data
 */
export async function clearContext(): Promise<void> {
  const emptyContext: ContextData = {
    history: [],
    data: {}
  };
  await saveContext(emptyContext);
}

/**
 * Add an entry to the context history
 */
export async function addHistoryEntry(
  command: string,
  status: Status,
  message?: string,
  args?: string[]
): Promise<void> {
  const context = await loadContext();
  
  const entry: HistoryEntry = {
    timestamp: new Date().toISOString(),
    command,
    status,
    ...(message && { message }),
    ...(args && { args })
  };
  
  context.history.push(entry);
  
  // Keep only the last 100 entries
  if (context.history.length > 100) {
    context.history = context.history.slice(-100);
  }
  
  await saveContext(context);
}

/**
 * Display context information based on options
 */
export async function displayContext(context: ContextData, options: ContextDisplayOptions): Promise<void> {
  // Display current step if it exists
  if (context.currentStep) {
    console.log(chalk.yellow('\nCurrent Step:'), context.currentStep);
  }

  // Display history
  if (context.history.length > 0) {
    console.log(chalk.yellow('\nCommand History:'));
    const historyToShow = options.verbose ? context.history : context.history.slice(-5);
    
    historyToShow.forEach(entry => {
      const timestamp = new Date(entry.timestamp).toLocaleString();
      const status = entry.status === 'success' 
        ? chalk.green('✓') 
        : chalk.red('✗');
      
      console.log(`${status} ${entry.command}${entry.args ? ' ' + entry.args.join(' ') : ''} (${timestamp})`);
      if (entry.message) {
        console.log(chalk.gray(`   ${entry.message}`));
      }
    });

    if (!options.verbose && context.history.length > 5) {
      console.log(chalk.gray(`\n... and ${context.history.length - 5} more entries`));
    }
  } else {
    console.log(chalk.gray('\nNo command history yet.'));
  }

  // Display data in verbose mode
  if (options.verbose && Object.keys(context.data).length > 0) {
    console.log(chalk.yellow('\nStored Data:'));
    for (const [key, value] of Object.entries(context.data)) {
      console.log(chalk.gray(`${key}:`), typeof value === 'object' 
        ? JSON.stringify(value, null, 2) 
        : value);
    }
  }

  if (!options.verbose) {
    console.log(chalk.green('\nTip: Use --verbose flag to see all history and stored data'));
  }
}

function getContextPath(): string {
  return join(process.cwd(), CONTEXT_FILE);
}
