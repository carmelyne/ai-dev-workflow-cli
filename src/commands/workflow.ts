/**
 * Workflow Management Command
 * 
 * Manages development workflows and tasks. Helps coordinate development
 * activities, track progress, and maintain project context across
 * different development phases.
 * 
 * Features:
 * - Task creation and tracking
 * - Workflow state management
 * - Git integration
 * - Progress monitoring
 * - Context preservation
 * 
 * Usage:
 * ```bash
 * ai-dev workflow create
 * ai-dev workflow switch
 * ai-dev workflow list
 * ```
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { loadConfig } from '../utils/config.js';
import { executeAICommand } from '../utils/ai.js';
import { createWorkflowStep } from './workflow/step.js';
import { createWorkflowModuleCommands } from './workflow/modules.js';

interface WorkflowStep {
  type: string;
  status: string;
  title: string;
  description?: string;
  command?: string;
  args?: string[];
  guidelines?: string[];
  files?: string[];
  steps?: string[];
}

interface WorkflowConfig {
  description: string;
  steps: Record<string, WorkflowStep>;
}

export function createWorkflowCommand(): Command {
  const command = new Command('workflow');
  
  // Add module management commands
  createWorkflowModuleCommands(command);
  
  // Add step management command
  command.addCommand(createWorkflowStep());
  
  // Original workflow following command
  command
    .command('follow')
    .description('Follow a defined workflow process')
    .argument('[type]', 'Workflow type (basic or advanced)')
    .action(async (type?: string) => {
      try {
        if (!type) {
          await runInteractiveMode();
          return;
        }

        // If type provided, display workflow for AI to follow
        const config = await loadConfig();
        if (!config?.development_workflow) {
          throw new Error('No workflow configuration found. Please run init first.');
        }

        const workflow = config.development_workflow[type];
        if (!workflow) {
          console.error(chalk.red(`Workflow type '${type}' not found. Available types: ${Object.keys(config.development_workflow).join(', ')}`));
          return;
        }

        console.log(chalk.blue(`\n📋 ${type} workflow: ${workflow.description}\n`));
        console.log(chalk.yellow('This workflow is for AI guidance. The AI will follow these steps:\n'));

        // Display steps for AI to follow
        for (const [stepKey, step] of Object.entries(workflow.steps)) {
          const stepNumber = stepKey.split('_')[0];
          console.log(chalk.yellow(`Step ${stepNumber}: ${step.description}`));
          
          if (step.command) {
            console.log(chalk.cyan(`  Command template: ${step.command}`));
          }
          if (step.guidelines?.length) {
            console.log(chalk.cyan('  Guidelines:'));
            step.guidelines.forEach((guideline: string) => {
              console.log(chalk.cyan(`    • ${guideline}`));
            });
          }
          if (step.files?.length) {
            console.log(chalk.cyan('  Files:'));
            step.files.forEach((file: string) => {
              console.log(chalk.cyan(`    • ${file}`));
            });
          }
          console.log(); // Empty line between steps
        }

        console.log(chalk.green('\nWorkflow loaded. The AI will now follow these steps.\n'));
      } catch (error) {
        console.error(chalk.red('Error loading workflow:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  return command;
}

// Interactive mode for when users run 'ai-dev workflow' without args
async function runInteractiveMode(): Promise<void> {
  try {
    const config = await loadConfig();
    if (!config?.development_workflow) {
      throw new Error('No workflow configuration found. Please run init first.');
    }

    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: 'Select workflow type:',
      choices: Object.keys(config.development_workflow)
    });

    const workflow = config.development_workflow[type];
    if (!workflow) {
      throw new Error(`Workflow type '${type}' not found`);
    }

    console.log(chalk.blue(`\n📋 Starting ${type} workflow: ${workflow.description}\n`));

    // Execute each step in sequence
    for (const [stepKey, step] of Object.entries(workflow.steps)) {
      const stepNumber = stepKey.split('_')[0];
      console.log(chalk.yellow(`\nStep ${stepNumber}: ${step.description}`));

      if (step.command) {
        const { execute } = await inquirer.prompt({
          type: 'input',
          name: 'execute',
          message: `Enter values for command: ${step.command}\n(Press Enter to skip)`,
        });

        if (execute) {
          try {
            await executeAICommand(step.command, execute.split(' '));
          } catch (error) {
            console.error(chalk.red(`Error executing command: ${error instanceof Error ? error.message : String(error)}`));
          }
        }
      }

      // Show guidelines if any
      if (step.guidelines?.length) {
        console.log(chalk.cyan('\nGuidelines:'));
        step.guidelines.forEach((guideline: string) => {
          console.log(chalk.cyan(`• ${guideline}`));
        });
      }

      // Show files to modify if any
      if (step.files?.length) {
        console.log(chalk.cyan('\nFiles to modify:'));
        step.files.forEach((file: string) => {
          console.log(chalk.cyan(`• ${file}`));
        });
      }

      // Show substeps if any
      if (step.steps?.length) {
        console.log(chalk.cyan('\nSubsteps:'));
        step.steps.forEach((substep: string) => {
          console.log(chalk.cyan(`• ${substep}`));
        });
      }

      const { completed } = await inquirer.prompt({
        type: 'confirm',
        name: 'completed',
        message: 'Have you completed this step?',
        default: false,
      });

      if (!completed) {
        console.log(chalk.yellow('\nPlease complete this step before continuing.'));
        break;
      }
    }

    console.log(chalk.green('\n✨ Workflow completed!\n'));
  } catch (error) {
    console.error(chalk.red('Error in interactive mode:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
