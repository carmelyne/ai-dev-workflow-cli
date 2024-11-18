/**
 * Context Following Command
 * 
 * Maintains and manages development contexts. Enables smooth context
 * switching while preserving important state and related information
 * for different development tasks.
 * 
 * Features:
 * - Context state preservation
 * - Smart context switching
 * - History tracking
 * - Related file tracking
 * - Environment state management
 * 
 * Usage:
 * ```bash
 * ai-dev follow
 * ai-dev follow --save my-context
 * ai-dev follow --load my-context
 * ```
 */

import { Command } from 'commander';
import { loadConfig } from '../utils/config.js';
import chalk from 'chalk';

export function createFollowCommand() {
  const command = new Command('follow');
  
  command
    .description('Follow a custom workflow from .ai/config.yaml')
    .argument('<type>', 'Custom workflow type (basic or advanced)')
    .argument('<feature>', 'Feature name')
    .action(async (type: string, feature: string) => {
      try {
        const config = await loadConfig();
        if (!config) {
          console.error(chalk.red('Failed to load config from .ai/config.yaml'));
          return;
        }

        const workflow = config.development_workflow[type];
        
        if (!workflow) {
          console.error(chalk.red(`Custom workflow type '${type}' not found in .ai/config.yaml. Available types: basic, advanced`));
          return;
        }

        console.log(chalk.blue(`\n📋 Following custom ${type} workflow for: ${feature}\n`));
        console.log(chalk.yellow('AI will combine this workflow with built-in capabilities:\n'));

        for (const [stepKey, step] of Object.entries(workflow.steps)) {
          const stepNumber = stepKey.split('_')[0];
          console.log(chalk.yellow(`Step ${stepNumber}: ${step.description}`));
        }

        console.log(chalk.green('\nCustom workflow loaded. AI will now implement this feature using both custom workflow and built-in capabilities.\n'));
      } catch (error) {
        console.error(chalk.red('Error loading custom workflow:'), error);
      }
    });

  return command;
}
