import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { loadConfig } from '../utils/config.js';

export async function exploreProject(pattern?: string): Promise<void> {
  const config = await loadConfig();
  const searchPattern = pattern || '**/*';
  
  const files = await glob(searchPattern, {
    ignore: ['node_modules/**', '.git/**'],
    nodir: true
  });

  for (const file of files) {
    try {
      const content = await readFile(join(process.cwd(), file), 'utf8');
      console.log(`\nFile: ${file}`);
      console.log('Content:', content.slice(0, 200) + '...');
    } catch (error: any) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
}
