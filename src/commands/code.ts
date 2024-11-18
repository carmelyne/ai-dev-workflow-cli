/**
 * Code Generation Command
 * 
 * Provides AI-assisted code generation and modification capabilities.
 * Helps developers write, modify, and improve code through AI
 * guidance and suggestions.
 * 
 * Features:
 * - Code generation
 * - Code modification
 * - Style enforcement
 * - Best practice suggestions
 * - Documentation generation
 * 
 * Usage:
 * ```bash
 * ai-dev code generate
 * ai-dev code modify
 * ai-dev code document
 * ```
 */

import { Command } from 'commander';
import { CodeReviewCommand } from './code/review.js';
import { runTests } from '../utils/test.js';

export class CodeCommand {
  static register(program: Command) {
    const codeCmd = program
      .command('code')
      .description('Code-related operations with AI assistance');

    // Review subcommand - maintaining all previous functionality
    codeCmd
      .command('review')
      .description('Get AI code review with analysis')
      .option('-f, --files <glob>', 'Files to review (default: staged files)')
      .option('-t, --type <type>', 'Review type (security, performance, style, all)', 'all')
      .option('-c, --checklist', 'Use checklist for review', false)
      .option('-a, --autofix', 'Automatically fix simple issues', false)
      .action(async (options) => {
        try {
          await CodeReviewCommand.execute(options);
        } catch (error: any) {
          console.error('Error during code review:', error.message);
          process.exit(1);
        }
      });

    // Test subcommand
    codeCmd
      .command('test')
      .description('Run tests with AI analysis')
      .option('-f, --files <glob>', 'Files to test (default: all tests)')
      .option('-u, --update', 'Update test snapshots')
      .option('-w, --watch', 'Watch mode')
      .option('-c, --coverage', 'Collect coverage')
      .option('-a, --analyze', 'Detailed AI analysis of results')
      .action(async (options) => {
        try {
          await runTests(options);
        } catch (error: any) {
          console.error('Error running tests:', error.message);
          process.exit(1);
        }
      });

    return codeCmd;
  }
}
