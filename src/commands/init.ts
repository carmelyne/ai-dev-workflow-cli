import { join } from 'path';
import { mkdir, cp } from 'fs/promises';
import inquirer from 'inquirer';
import chalk from 'chalk';

export async function init() {
  try {
    // Create .ai directory structure
    const aiDir = join(process.cwd(), '.ai');
    const aiSystemDir = join(aiDir, 'ai');
    const aiAgentDir = join(aiDir, 'ai-agent');
    const humanAgentDir = join(aiDir, 'human-agent');
    
    console.log(chalk.blue('\nCreating AI configuration directories...\n'));
    
    // Create all main directories
    await mkdir(aiDir, { recursive: true });
    await mkdir(aiSystemDir, { recursive: true });
    await mkdir(aiAgentDir, { recursive: true });
    await mkdir(humanAgentDir, { recursive: true });
    await mkdir(join(humanAgentDir, 'roles'), { recursive: true });

    // Copy AI system and agent templates
    const aiTemplatesDir = join(__dirname, '../../ai-config/ai');
    const aiAgentTemplatesDir = join(__dirname, '../../ai-config/ai-agent');
    
    console.log(chalk.blue('Copying AI configuration templates...\n'));
    await cp(aiTemplatesDir, aiSystemDir, { recursive: true });
    await cp(aiAgentTemplatesDir, aiAgentDir, { recursive: true });
    
    // Prompt for human agent role
    const { role } = await inquirer.prompt([{
      type: 'list',
      name: 'role',
      message: 'What is your role?',
      choices: ['developer', 'researcher', 'writer']
    }]);
    
    // Copy selected role configuration
    const roleTemplate = join(__dirname, `../../ai-config/human-agent/roles/${role}.yaml`);
    const roleTarget = join(humanAgentDir, 'roles', `${role}.yaml`);
    await cp(roleTemplate, roleTarget);
    
    console.log(chalk.green('\nProject initialized successfully!'));
    console.log(chalk.gray('AI configuration files copied to .ai/ai/'));
    console.log(chalk.gray('AI agent workspace created in .ai/ai-agent/'));
    console.log(chalk.gray(`Human agent role '${role}' configured in .ai/human-agent/`));
    
  } catch (error) {
    console.error(chalk.red('Error: Failed to initialize project.'));
    console.error(error);
  }
}
