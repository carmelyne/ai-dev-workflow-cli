/**
 * Project Initialization Command
 * 
 * Initializes a new project with AI-guided development workflow configuration.
 * Creates necessary directory structure, configuration files, and templates
 * for AI-assisted development.
 * 
 * Features:
 * - Creates .ai directory with configuration
 * - Sets up project-specific templates
 * - Configures initial development workflow
 * - Initializes git integration (if needed)
 * 
 * Usage:
 * ```bash
 * ai-dev init
 * ai-dev init --type webapp
 * ```
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import yaml from 'yaml';
import { copyTemplate } from '../utils/files.js';

interface InitOptions {
  type?: string;
}

export async function init(options: InitOptions) {
  // Get project info
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: path.basename(process.cwd())
    },
    {
      type: 'list',
      name: 'type',
      message: 'Project type:',
      choices: ['webapp', 'library', 'cli'],
      default: options.type
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:'
    }
  ]);

  // Create .ai directory
  const aiDir = path.join(process.cwd(), '.ai');
  if (!fs.existsSync(aiDir)) {
    fs.mkdirSync(aiDir);
    fs.mkdirSync(path.join(aiDir, 'patterns'));
    fs.mkdirSync(path.join(aiDir, 'templates'));
  }

  // Copy and customize config template
  const configTemplate = path.join(__dirname, '../../templates/config.yaml');
  const configContent = fs.readFileSync(configTemplate, 'utf8');
  const config = yaml.parse(configContent);

  // Update with project info
  config.project = {
    ...config.project,
    name: answers.name,
    type: answers.type,
    description: answers.description
  };

  // Write customized config
  fs.writeFileSync(
    path.join(aiDir, 'config.yaml'),
    yaml.stringify(config)
  );

  // Copy templates based on project type
  copyTemplate('patterns', answers.type, aiDir);
  copyTemplate('templates', answers.type, aiDir);

  console.log(`
✨ AI workflow initialized!

Created .ai directory with:
  - config.yaml: Core AI guidance
  - patterns/: Reusable patterns
  - templates/: Story/PR templates

Start developing with:
  $ ai-workflow guide feature
  `);
}
