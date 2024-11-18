/**
 * Context Management Command
 * 
 * Manages the AI development context. Helps maintain alignment between
 * human and AI by tracking project state, goals, and progress.
 * 
 * Features:
 * - Context loading/saving
 * - Goal tracking
 * - Progress monitoring
 * - State synchronization
 * - History management
 * 
 * Usage:
 * ```bash
 * ai-dev context
 * ai-dev context --save
 * ai-dev context --load
 * ```
 */

import { Command } from 'commander';
import { join } from 'path';
import { readFile } from 'fs/promises';
import chalk from 'chalk';

export function createContextCommand() {
  const command = new Command('context');
  
  command
    .description('Have AI assistant review and confirm understanding of workflow')
    .action(async () => {
      try {
        const configPath = join(process.cwd(), '.ai', 'config.yaml');
        const workflowPath = join(process.cwd(), 'docs', 'guides', 'ai-workflow.md');
        
        // Read both files
        const config = await readFile(configPath, 'utf8');
        const workflow = await readFile(workflowPath, 'utf8');
        
        // Output for AI assistant to review
        console.log(chalk.blue('\nProject Configuration (.ai/config.yaml):\n'));
        console.log(config);
        console.log(chalk.blue('\nWorkflow Guidelines (docs/guides/ai-workflow.md):\n'));
        console.log(workflow);
        
        // Prompt for AI to confirm understanding
        console.log(chalk.yellow('\nAI Assistant: Please review the above files and confirm your understanding of the workflow and configuration.'));
        
      } catch (error) {
        console.error(chalk.red('Error: Required AI workflow files are missing.'));
        console.log(chalk.yellow('\nPlease ensure these files exist:'));
        console.log(chalk.gray('  - .ai/config.yaml'));
        console.log(chalk.gray('  - docs/guides/ai-workflow.md'));
        console.log(chalk.yellow('\nRun "ai-dev init" to set up the AI workflow.'));
        process.exit(1);
      }
    });

  return command;
}
