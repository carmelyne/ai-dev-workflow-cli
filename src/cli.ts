#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init.js';

const program = new Command();

program
  .name('ai-dev')
  .description('AI-guided development workflow')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize AI development workflow')
  .action(init);

program.parse();
