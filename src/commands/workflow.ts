import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { join } from 'path';
import { readdir } from 'fs/promises';
import { loadYamlFile } from '../utils/yaml.js';
import { executeAICommand } from '../utils/ai.js';
import { fileURLToPath } from 'url';
import type { Workflow, WorkflowStep } from '../types/workflow.js';
import { isWorkflow } from '../types/workflow.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function loadWorkflow(type: string): Promise<Workflow> {
  const workflowPath = join(__dirname, '../../templates/workflows', `${type}.yaml`);
  try {
    const content = await loadYamlFile(workflowPath);
    if (!content || !isWorkflow(content)) {
      throw new Error(`Invalid workflow format for '${type}'`);
    }
    return content;
  } catch (error: any) {
    console.error(chalk.red(`Error loading workflow: ${error.message}`));
    process.exit(1);
  }
}

async function listWorkflows(): Promise<void> {
  const workflowsDir = join(__dirname, '../../templates/workflows');
  try {
    const files = (await readdir(workflowsDir))
      .filter(file => file.endsWith('.yaml'))
      .map(file => file.replace('.yaml', ''));
    
    console.log(chalk.blue('\nAvailable workflows:'));
    files.forEach(file => {
      console.log(chalk.yellow(`- ${file}`));
    });
    console.log();
  } catch (error: any) {
    console.error(chalk.red(`Error listing workflows: ${error.message}`));
    process.exit(1);
  }
}

async function showWorkflow(type: string): Promise<void> {
  try {
    const workflow = await loadWorkflow(type);
    
    console.log(chalk.blue(`\n📋 ${type} workflow: ${workflow.description}\n`));
    
    let stepNumber = 1;
    for (const [stepKey, step] of Object.entries<WorkflowStep>(workflow.steps)) {
      console.log(chalk.green(`Step ${stepNumber} (${stepKey}):`));
      console.log(chalk.yellow(`Step ${stepNumber}: ${step.description}`));
      
      if (step.command) {
        console.log(chalk.cyan(`  Command template: ${step.command}`));
      }
      
      if (step.guidelines?.length) {
        console.log(chalk.magenta('  Guidelines:'));
        step.guidelines.forEach((guideline: string) => {
          console.log(chalk.magenta(`  - ${guideline}`));
        });
      }
      
      if (step.files?.length) {
        console.log(chalk.cyan('  Files:'));
        step.files.forEach((file: string) => {
          console.log(chalk.cyan(`  - ${file}`));
        });
      }
      
      stepNumber++;
    }
    console.log();
  } catch (error: any) {
    console.error(chalk.red(`Error showing workflow: ${error.message}`));
    process.exit(1);
  }
}

async function executeWorkflow(type: string): Promise<void> {
  try {
    const workflow = await loadWorkflow(type);
    
    console.log(chalk.blue(`\n📋 Starting ${type} workflow: ${workflow.description}\n`));
    
    let stepNumber = 1;
    for (const [stepKey, step] of Object.entries<WorkflowStep>(workflow.steps)) {
      console.log(chalk.green(`Step ${stepNumber} (${stepKey}):`));
      console.log(chalk.yellow(`\nStep ${stepNumber}: ${step.description}`));
      
      if (step.command) {
        const { execute } = await inquirer.prompt([
          {
            type: 'input',
            name: 'execute',
            message: `Enter values for command: ${step.command}\n(Press Enter to skip)`
          }
        ]);
        
        if (execute) {
          try {
            await executeAICommand(step.command, execute.split(' '));
          } catch (error: any) {
            console.error(chalk.red(`Error executing command: ${error.message}`));
          }
        }
      }
      
      if (step.guidelines?.length) {
        console.log(chalk.magenta('\nGuidelines:'));
        step.guidelines.forEach((guideline: string) => {
          console.log(chalk.magenta(`- ${guideline}`));
        });
        console.log();
      }
      
      if (step.files?.length) {
        console.log(chalk.cyan('\nFiles to review:'));
        step.files.forEach((file: string) => {
          console.log(chalk.cyan(`- ${file}`));
        });
        console.log();
      }
      
      if (step.steps?.length) {
        console.log(chalk.yellow('\nSub-steps:'));
        step.steps.forEach((substep: string) => {
          console.log(chalk.yellow(`- ${substep}`));
        });
        console.log();
      }
      
      const { continue: shouldContinue } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Continue to next step?',
          default: true
        }
      ]);
      
      if (!shouldContinue) {
        console.log(chalk.yellow('\nWorkflow paused. Resume when ready.\n'));
        break;
      }
      
      stepNumber++;
    }
    
    console.log(chalk.green('\nWorkflow completed! 🎉\n'));
  } catch (error: any) {
    console.error(chalk.red(`Error executing workflow: ${error.message}`));
    process.exit(1);
  }
}

export function createWorkflowCommand(): Command {
  const command = new Command('workflow')
    .description('Manage development workflows')
    .argument('[type]', 'Type of workflow to run')
    .option('-l, --list', 'List available workflows')
    .option('-s, --show', 'Show workflow steps without executing')
    .action(async (type: string, options: { list?: boolean; show?: boolean }) => {
      try {
        if (options.list) {
          await listWorkflows();
        } else if (options.show && type) {
          await showWorkflow(type);
        } else if (type) {
          await executeWorkflow(type);
        } else {
          await listWorkflows();
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return command;
}
