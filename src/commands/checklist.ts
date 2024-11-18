/**
 * Checklist Management Command
 * 
 * Manages development checklists and task verification. Helps ensure
 * consistency and completeness in development tasks through
 * structured checklists.
 * 
 * Features:
 * - Checklist creation
 * - Progress tracking
 * - Task verification
 * - Template management
 * - Custom checklist support
 * 
 * Usage:
 * ```bash
 * ai-dev checklist
 * ai-dev checklist create
 * ai-dev checklist verify
 * ```
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { DateTime } from 'luxon';

interface ChecklistConfig {
  path: string;
  variables: string[];
  defaults: {
    [key: string]: any;
  };
}

interface AIConfig {
  templates: {
    checklist: ChecklistConfig;
  };
}

export class ChecklistCommand {
  private static getAIConfig(): AIConfig {
    const configPath = path.join(process.cwd(), '.ai', 'config.yaml');
    const configContent = fs.readFileSync(configPath, 'utf8');
    return yaml.load(configContent) as AIConfig;
  }

  private static generateChecklist(featureName: string, branchType: string = 'feature'): string {
    const config = ChecklistCommand.getAIConfig();
    const templatePath = path.join(process.cwd(), config.templates.checklist.path);
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace variables
    const variables = {
      branch_type: branchType,
      feature_name: featureName,
      coverage_target: config.templates.checklist.defaults.coverage_target || 80,
      notes: '',
      start_date: DateTime.now().toISO(),
      last_updated: DateTime.now().toISO(),
      status: config.templates.checklist.defaults.status || 'In Progress'
    };

    Object.entries(variables).forEach(([key, value]) => {
      template = template.replace(new RegExp(`\\$\{${key}\}`, 'g'), value);
    });

    return template;
  }

  private static saveChecklist(featureName: string, content: string): void {
    const checklistDir = path.join(process.cwd(), '.ai', 'checklists');
    if (!fs.existsSync(checklistDir)) {
      fs.mkdirSync(checklistDir, { recursive: true });
    }

    const checklistPath = path.join(checklistDir, `${featureName}.md`);
    fs.writeFileSync(checklistPath, content);
  }

  static register(program: Command): void {
    program
      .command('checklist')
      .description('Manage development checklists')
      .addCommand(
        new Command('create')
          .description('Create a new checklist for a feature')
          .argument('<feature-name>', 'Name of the feature')
          .option('-t, --type <type>', 'Branch type (feature, bugfix, etc.)', 'feature')
          .action((featureName, options) => {
            const content = ChecklistCommand.generateChecklist(featureName, options.type);
            ChecklistCommand.saveChecklist(featureName, content);
            console.log(`✅ Created checklist for ${featureName}`);
            console.log(`📝 Location: .ai/checklists/${featureName}.md`);
          })
      )
      .addCommand(
        new Command('list')
          .description('List all active checklists')
          .action(() => {
            const checklistDir = path.join(process.cwd(), '.ai', 'checklists');
            if (!fs.existsSync(checklistDir)) {
              console.log('No checklists found');
              return;
            }

            const checklists = fs.readdirSync(checklistDir)
              .filter(file => file.endsWith('.md'));
            
            console.log('📋 Active Checklists:');
            checklists.forEach(file => {
              const content = fs.readFileSync(path.join(checklistDir, file), 'utf8');
              const status = content.match(/Status: (.*)/)?.[1] || 'Unknown';
              console.log(`- ${file.replace('.md', '')}: ${status}`);
            });
          })
      )
      .addCommand(
        new Command('show')
          .description('Show a specific checklist')
          .argument('<feature-name>', 'Name of the feature')
          .action((featureName) => {
            const checklistPath = path.join(process.cwd(), '.ai', 'checklists', `${featureName}.md`);
            if (!fs.existsSync(checklistPath)) {
              console.log(`❌ No checklist found for ${featureName}`);
              return;
            }

            const content = fs.readFileSync(checklistPath, 'utf8');
            console.log(content);
          })
      )
      .addCommand(
        new Command('update')
          .description('Update checklist status')
          .argument('<feature-name>', 'Name of the feature')
          .option('-s, --status <status>', 'New status')
          .option('-n, --notes <notes>', 'Add notes')
          .action((featureName, options) => {
            const checklistPath = path.join(process.cwd(), '.ai', 'checklists', `${featureName}.md`);
            if (!fs.existsSync(checklistPath)) {
              console.log(`❌ No checklist found for ${featureName}`);
              return;
            }

            let content = fs.readFileSync(checklistPath, 'utf8');
            
            if (options.status) {
              content = content.replace(
                /Status: .*/,
                `Status: ${options.status}`
              );
            }

            if (options.notes) {
              content = content.replace(
                /## Notes\n.*/,
                `## Notes\n${options.notes}`
              );
            }

            content = content.replace(
              /Last Updated: .*/,
              `Last Updated: ${DateTime.now().toISO()}`
            );

            fs.writeFileSync(checklistPath, content);
            console.log(`✅ Updated checklist for ${featureName}`);
          })
      );
  }
}
