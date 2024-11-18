/**
 * Status Tracking Command
 * 
 * Monitors and displays the current development context, active tasks,
 * and project status. Provides a comprehensive view of the development
 * state and pending actions.
 * 
 * Features:
 * - Current context display
 * - Active task listing
 * - Recent activity tracking
 * - Pending action highlights
 * - Git integration
 * 
 * Usage:
 * ```bash
 * ai-dev status
 * ai-dev status --detailed
 * ai-dev status --watch
 * ```
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { loadConfig } from '../utils/config.js';

export class StatusCommand {
  static register(program: Command): void {
    const statusCmd = program
      .command('status')
      .description('Show project status, configuration, and next steps');

    // Main status command (summary)
    statusCmd
      .action(async () => {
        await StatusCommand.handleStatus({ summary: true });
      });

    // Progress subcommand
    statusCmd
      .command('progress')
      .description('Show detailed progress of current tasks and features')
      .action(async () => {
        await StatusCommand.handleProgress();
      });

    // Blockers subcommand
    statusCmd
      .command('blockers')
      .description('Show current blockers and issues')
      .action(async () => {
        await StatusCommand.handleBlockers();
      });

    // Full status subcommand (existing functionality)
    statusCmd
      .command('full')
      .description('Show full project status including TODO items')
      .action(async () => {
        await StatusCommand.handleStatus({ full: true });
      });
  }

  private static async handleStatus(options: any): Promise<void> {
    console.log('🔍 AI Dev Workflow Status\n');

    // Load and display config
    const config = await loadConfig();
    if (!config) {
      console.error('Failed to load config from .ai/config.yaml');
      return;
    }

    console.log('Project Configuration:');
    console.log(`- Name: ${config.project.name}`);
    console.log(`- Type: ${config.project.type}`);
    console.log(`- Description: ${config.project.description}`);
    console.log();

    // Load and display current context
    const context = await StatusCommand.getCurrentContext();
    console.log('Current Context:');
    console.log(`- Active Branch: ${context.branch}`);
    console.log(`- Last Commit: ${context.lastCommit}`);
    console.log(`- Modified Files: ${context.modifiedFiles.length}`);
    console.log();

    if (options.summary) {
      // Show quick summary for main command
      const progress = await StatusCommand.getProgressSummary();
      const blockers = await StatusCommand.getBlockersSummary();
      
      if (progress.length > 0) {
        console.log('🎯 Current Progress:');
        progress.slice(0, 3).forEach(item => console.log(`- ${item}`));
        if (progress.length > 3) console.log('  (Run "ai-dev status progress" for more)');
        console.log();
      }

      if (blockers.length > 0) {
        console.log('⚠️ Active Blockers:');
        blockers.slice(0, 2).forEach(item => console.log(`- ${item}`));
        if (blockers.length > 2) console.log('  (Run "ai-dev status blockers" for more)');
        console.log();
      }
    }

    if (options.full) {
      // Show full TODO list
      const todoContent = await StatusCommand.getFullTodo();
      console.log('Full TODO List:');
      console.log(todoContent);
    }

    // Show helpful commands
    console.log('Available Commands:');
    console.log('- ai-dev status progress  # Show detailed progress');
    console.log('- ai-dev status blockers  # Show active blockers');
    console.log('- ai-dev status full      # Show full status');
    console.log();
  }

  private static async handleProgress(): Promise<void> {
    console.log('🎯 Detailed Progress Report\n');

    // Get all progress items
    const progress = await StatusCommand.getProgressSummary();
    
    if (progress.length === 0) {
      console.log('No active tasks or features in progress.');
      return;
    }

    // Group by status
    const inProgress = progress.filter(item => item.includes('[IN PROGRESS]'));
    const completed = progress.filter(item => item.includes('[COMPLETED]'));
    const planned = progress.filter(item => !item.includes('[IN PROGRESS]') && !item.includes('[COMPLETED]'));

    if (inProgress.length > 0) {
      console.log('In Progress:');
      inProgress.forEach(item => console.log(`- ${item}`));
      console.log();
    }

    if (completed.length > 0) {
      console.log('Recently Completed:');
      completed.forEach(item => console.log(`- ${item}`));
      console.log();
    }

    if (planned.length > 0) {
      console.log('Planned:');
      planned.forEach(item => console.log(`- ${item}`));
      console.log();
    }
  }

  private static async handleBlockers(): Promise<void> {
    console.log('⚠️ Current Blockers and Issues\n');

    // Get all blockers
    const blockers = await StatusCommand.getBlockersSummary();
    
    if (blockers.length === 0) {
      console.log('No active blockers or issues.');
      return;
    }

    // Group by priority
    const high = blockers.filter(item => item.includes('[HIGH]'));
    const medium = blockers.filter(item => item.includes('[MEDIUM]'));
    const low = blockers.filter(item => !item.includes('[HIGH]') && !item.includes('[MEDIUM]'));

    if (high.length > 0) {
      console.log('High Priority:');
      high.forEach(item => console.log(`- ${item}`));
      console.log();
    }

    if (medium.length > 0) {
      console.log('Medium Priority:');
      medium.forEach(item => console.log(`- ${item}`));
      console.log();
    }

    if (low.length > 0) {
      console.log('Low Priority:');
      low.forEach(item => console.log(`- ${item}`));
      console.log();
    }
  }

  private static async getProgressSummary(): Promise<string[]> {
    try {
      const todoPath = path.join(process.cwd(), 'TODO.md');
      if (!fs.existsSync(todoPath)) return [];

      const content = fs.readFileSync(todoPath, 'utf8');
      const progressSection = content.split('## Progress 🚀')[1]?.split('##')[0] || '';
      
      return progressSection
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[*-]\s*/, '').trim())
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  private static async getBlockersSummary(): Promise<string[]> {
    try {
      const todoPath = path.join(process.cwd(), 'TODO.md');
      if (!fs.existsSync(todoPath)) return [];

      const content = fs.readFileSync(todoPath, 'utf8');
      const blockersSection = content.split('## Blockers ⚠️')[1]?.split('##')[0] || '';
      
      return blockersSection
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[*-]\s*/, '').trim())
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  private static async getCurrentContext(): Promise<any> {
    try {
      const { execSync } = require('child_process');
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
      const modifiedFiles = execSync('git status --porcelain', { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);

      return { branch, lastCommit, modifiedFiles };
    } catch (error) {
      return { branch: 'N/A', lastCommit: 'N/A', modifiedFiles: [] };
    }
  }

  private static async getNextTodos(): Promise<string[]> {
    try {
      const todoPath = path.join(process.cwd(), 'TODO.md');
      if (!fs.existsSync(todoPath)) return [];

      const content = fs.readFileSync(todoPath, 'utf8');
      const nextUpSection = content.split('## Next Up 🎯')[1]?.split('##')[0] || '';
      
      return nextUpSection
        .split('\n')
        .filter(line => line.includes('[ ]'))
        .map(line => line.replace(/^.*\[ \]/, '').trim())
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  private static async getFullTodo(): Promise<string> {
    try {
      const todoPath = path.join(process.cwd(), 'TODO.md');
      return fs.existsSync(todoPath) ? fs.readFileSync(todoPath, 'utf8') : 'No TODO.md found';
    } catch (error) {
      return 'Error reading TODO.md';
    }
  }
}
