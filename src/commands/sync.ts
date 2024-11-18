/**
 * Synchronization Command
 * 
 * Manages synchronization of development state and context across
 * different environments and team members. Ensures consistency
 * in development workflow.
 * 
 * Features:
 * - State synchronization
 * - Context sharing
 * - Environment alignment
 * - Team coordination
 * - Configuration sync
 * 
 * Usage:
 * ```bash
 * ai-dev sync
 * ai-dev sync push
 * ai-dev sync pull
 * ```
 */

import { Command } from 'commander';
import { syncConfigWithTemplate } from '../utils/config.js';
import chalk from 'chalk';

export function createSyncCommand() {
  const command = new Command('sync');
  
  command
    .description('Sync project configuration with template updates')
    .option('-f, --force', 'Force sync without confirmation')
    .option('-b, --backup', 'Create backup before syncing')
    .option('-t, --template <path>', 'Path to template file', '.ai/template.yaml')
    .action(async (options) => {
      try {
        console.log(chalk.blue('🔄 Syncing project configuration with template...'));
        await syncConfigWithTemplate(options.template);
      } catch (error: any) {
        console.error(chalk.red('Error syncing configuration:'), error.message);
        process.exit(1);
      }
    });

  return command;
}
