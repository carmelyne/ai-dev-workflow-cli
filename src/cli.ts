#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init.js';
import { guide } from './commands/guide.js';
import { explore } from './commands/explore.js';
import { StatusCommand } from './commands/status.js';
import { ReviewCommand } from './commands/review.js';
import { CodeCommand } from './commands/code.js';
import { createWorkflowCommand } from './commands/workflow.js';
import { createFollowCommand } from './commands/follow.js';
import { loadContext } from './utils/context.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const program = new Command();

program
  .name('ai-dev')
  .description('AI-guided development workflow tool')
  .version(pkg.version);

StatusCommand.register(program);
ReviewCommand.register(program);

program
  .command('init')
  .description('Initialize AI development workflow')
  .option('-t, --type <type>', 'Project type (webapp, library, cli)', 'webapp')
  .action(init);

program
  .command('guide')
  .description('Get AI guidance for development tasks')
  .argument('[type]', 'Type of guidance (feature, bugfix, refactor)')
  .option('-i, --interactive', 'Interactive mode')
  .action(guide);

program
  .command('explore')
  .description('Explore project structure')
  .option('-p, --pattern <pattern>', 'Search pattern')
  .action(explore);

program.addCommand(createWorkflowCommand());
program.addCommand(createFollowCommand());

program.parse();
