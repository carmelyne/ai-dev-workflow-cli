/**
 * Project Exploration Command
 * 
 * Helps developers understand and navigate the project structure and codebase.
 * Provides insights about code organization, dependencies, and relationships
 * between different components.
 * 
 * Features:
 * - Project structure analysis
 * - Pattern-based file search
 * - Code dependency mapping
 * - Component relationship insights
 * 
 * Usage:
 * ```bash
 * ai-dev explore
 * ai-dev explore --pattern "*.ts"
 * ```
 */

import { createExplorer } from '../explorer.js';

interface ExploreOptions {
  pattern?: string;
}

export async function explore(options: ExploreOptions) {
  const explorer = createExplorer(process.cwd());
  
  try {
    if (options.pattern) {
      // Search for specific pattern
      const files = await explorer.findFiles(options.pattern);
      if (files.length === 0) {
        console.log('No files found matching pattern:', options.pattern);
        return;
      }

      console.log(`\nFound ${files.length} files matching pattern: ${options.pattern}\n`);
      for (const file of files) {
        const metadata = explorer.getFileMetadata(file);
        console.log(`- ${file} (${metadata.type}, ${formatSize(metadata.size)})`);
      }
    } else {
      // Show priority files
      const files = await explorer.findPriorityFiles();
      if (files.length === 0) {
        console.log('No priority files found. Try initializing the project first:');
        console.log('  $ ai-workflow init');
        return;
      }

      console.log('\nPriority files in project:\n');
      for (const file of files) {
        const metadata = explorer.getFileMetadata(file);
        console.log(`- ${file} (${metadata.type}, ${formatSize(metadata.size)})`);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error exploring project:', error.message);
    } else {
      console.error('Error exploring project:', String(error));
    }
    process.exit(1);
  }
}

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
