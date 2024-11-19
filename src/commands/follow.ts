import { Command } from 'commander';
import { loadConfig } from '../utils/config.js';
import chalk from 'chalk';
import type { Workflow } from '../types/workflow.js';
import { isWorkflow } from '../types/workflow.js';

interface ConfigWithWorkflow {
  development_workflow: {
    [key: string]: unknown;
  };
}

export function createFollowCommand() {
  const command = new Command('follow');
  
  command
    .description('Follow a custom workflow from .ai/config.yaml')
    .argument('<type>', 'Custom workflow type (basic or advanced)')
    .argument('<feature>', 'Feature name')
    .action(async (type: string, feature: string) => {
      try {
        const config = await loadConfig() as ConfigWithWorkflow;
        if (!config) {
          console.error(chalk.red('Failed to load config from .ai/config.yaml'));
          return;
        }

        const workflowData = config.development_workflow[type];
        
        if (!workflowData) {
          console.error(chalk.red(`Custom workflow type '${type}' not found in .ai/config.yaml. Available types: basic, advanced`));
          return;
        }

        if (!isWorkflow(workflowData)) {
          console.error(chalk.red(`Invalid workflow format for type '${type}'`));
          return;
        }

        const workflow: Workflow = workflowData;

        console.log(chalk.blue(`\n📋 Following custom ${type} workflow for: ${feature}\n`));
        console.log(chalk.yellow('AI will combine this workflow with built-in capabilities:\n'));

        for (const [stepKey, step] of Object.entries(workflow.steps)) {
          const stepNumber = stepKey.split('_')[0];
          console.log(chalk.yellow(`Step ${stepNumber}: ${step.description}`));
        }

        console.log(chalk.green('\nCustom workflow loaded. AI will now implement this feature using both custom workflow and built-in capabilities.\n'));
      } catch (error: any) {
        console.error(chalk.red('Error loading custom workflow:'), error.message);
      }
    });

  return command;
}
