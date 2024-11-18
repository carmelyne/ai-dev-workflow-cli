/**
 * AI Guidance Command
 * 
 * Provides AI-assisted guidance for development tasks. Analyzes current context
 * and project state to offer relevant suggestions and step-by-step guidance
 * for various development activities.
 * 
 * Features:
 * - Interactive AI guidance
 * - Context-aware suggestions
 * - Support for different development tasks:
 *   - Feature development
 *   - Bug fixing
 *   - Refactoring
 * - Conversation history tracking
 * 
 * Usage:
 * ```bash
 * ai-dev guide
 * ai-dev guide feature
 * ai-dev guide bugfix --interactive
 * ```
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import inquirer from 'inquirer';
import { loadConfig } from '../utils/config.js';
import { executeAICommand } from '../utils/ai.js';

interface StoryOptions {
  title?: string;
  description?: string;
}

interface ImplementOptions {
  story?: string;
  test?: boolean;
}

interface ReviewOptions {
  files?: string;
  type?: 'security' | 'performance' | 'style';
}

export async function guide(command: string, action: string, options: StoryOptions | ImplementOptions | ReviewOptions) {
  // Load AI workflow config
  const config = loadConfig();
  if (!config) {
    console.error('No AI workflow configuration found. Run "ai-workflow init" first.');
    process.exit(1);
  }

  switch (command) {
    case 'story':
      await handleStory(action, options as StoryOptions);
      break;
    case 'implement':
      await handleImplementation(action, options as ImplementOptions);
      break;
    case 'review':
      await handleReview(options as ReviewOptions);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

async function handleStory(action: string, options: StoryOptions) {
  switch (action) {
    case 'create':
      const storyDetails = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Story title:',
          when: !options.title
        },
        {
          type: 'input',
          name: 'description',
          message: 'Story description:',
          when: !options.description
        }
      ]);

      // Use AI to enhance and structure the story
      await executeAICommand('story:create', {
        title: options.title || storyDetails.title,
        description: options.description || storyDetails.description
      });
      break;

    case 'modify':
      // Handle story modification
      break;

    case 'complete':
      // Handle story completion
      break;

    default:
      console.error(`Unknown story action: ${action}`);
      process.exit(1);
  }
}

async function handleImplementation(type: string, options: ImplementOptions) {
  const validTypes = ['feature', 'bugfix', 'refactor'];
  if (!validTypes.includes(type)) {
    console.error(`Invalid implementation type. Must be one of: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  // Get associated story if not provided
  if (!options.story) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'story',
        message: 'Associated story ID (optional):',
      }
    ]);
    options.story = answer.story;
  }

  // Use AI to guide implementation
  await executeAICommand('implement', {
    type,
    storyId: options.story,
    includeTests: options.test
  });
}

async function handleReview(options: ReviewOptions) {
  const files = options.files || await getDefaultFiles();
  const type = options.type || 'general';

  // Use AI to perform code review
  await executeAICommand('review', {
    files,
    type,
    context: await getProjectContext()
  });
}

async function getDefaultFiles(): Promise<string> {
  // Default to git staged files or prompt user
  return '**/*.{ts,js,tsx,jsx}';
}

async function getProjectContext(): Promise<object> {
  // Gather relevant project context
  return {
    // Project specific context
  };
}
