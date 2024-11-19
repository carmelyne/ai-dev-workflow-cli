import chalk from 'chalk';
import { spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { loadYamlFile } from './yaml.js';
import { getProjectConfig } from './config.js';
import type { YAMLObject, YAMLArray, YAMLContent } from '../types/yaml.js';

interface TestStep {
  name: string;
  command?: string;
  [key: string]: YAMLContent;
}

interface TestCase {
  name: string;
  description?: string;
  steps: TestStep[];
  [key: string]: YAMLContent;
}

interface BaseTestConfig {
  name: string;
  description?: string;
  tests: TestCase[];
}

export type TestConfig = YAMLObject<BaseTestConfig>;

export interface TestOptions {
  files?: string;
  update?: boolean;
  watch?: boolean;
  coverage?: boolean;
  analyze?: boolean;
}

// Helper to detect if we're running in a test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

export async function runTests(options: TestOptions = {}): Promise<void> {
  const config = await getProjectConfig();
  if (!config) {
    throw new Error('Project configuration not found');
  }
  const testCommand = config.test?.command || 'jest';
  
  console.log('🧪 Running tests with jest...');

  const args: string[] = [];
  if (options.files) {
    args.push(options.files);
  }
  if (options.update) {
    args.push('--updateSnapshot');
  }
  // Only enable watch mode if explicitly requested and not in a test environment
  if (options.watch && !isTestEnvironment) {
    args.push('--watch');
  }
  if (options.coverage) {
    args.push('--coverage');
    args.push('--coverageDirectory=.ai/coverage');
  }
  if (options.analyze) {
    args.push('--json');
    args.push('--outputFile=.ai/test-results.json');
  }

  const result = spawnSync(testCommand, args, {
    stdio: 'inherit',
    shell: true
  });

  if (result.status !== 0) {
    throw new Error(`Tests failed with exit code ${result.status}`);
  }

  if (options.analyze) {
    await analyzeTestResults();
  }
}

async function analyzeTestResults(): Promise<void> {
  console.log('\n📊 AI Analysis of Test Results');

  if (!existsSync('.ai/test-results.json')) {
    console.log('No test results found for analysis');
    return;
  }

  let results;
  try {
    const content = readFileSync('.ai/test-results.json', 'utf8');
    results = JSON.parse(content);
  } catch (error) {
    console.log('Failed to parse test results:', error instanceof Error ? error.message : String(error));
    return;
  }

  const { numTotalTestSuites, numTotalTests, numFailedTests, startTime, coverage } = results;

  console.log('\nTest Overview:');
  console.log(`- Total Suites: ${numTotalTestSuites}`);
  console.log(`- Total Tests: ${numTotalTests}`);
  console.log(`- Failures: ${numFailedTests}`);
  console.log(`- Duration: ${Date.now() - startTime}ms`);

  if (coverage) {
    console.log('\nCoverage Analysis:');
    console.log(`- Statements: ${coverage.statements?.pct ?? 0}%`);
    console.log(`- Branches: ${coverage.branches?.pct ?? 0}%`);
    console.log(`- Functions: ${coverage.functions?.pct ?? 0}%`);
    console.log(`- Lines: ${coverage.lines?.pct ?? 0}%`);

    const threshold = 80;
    if ((coverage.statements?.pct ?? 0) < threshold) {
      console.log(chalk.yellow('\n⚠️ Statement coverage is below 80%'));
    }
    if ((coverage.branches?.pct ?? 0) < threshold) {
      console.log(chalk.yellow('\n⚠️ Branch coverage is below 80%'));
    }
    if ((coverage.functions?.pct ?? 0) < threshold) {
      console.log(chalk.yellow('\n⚠️ Function coverage is below 80%'));
    }
    if ((coverage.lines?.pct ?? 0) < threshold) {
      console.log(chalk.yellow('\n⚠️ Line coverage is below 80%'));
    }
  }
}

export async function loadTestConfig(path: string): Promise<TestConfig> {
  const defaultConfig: TestConfig = {
    name: 'Default Test Suite',
    tests: []
  };
  const config = await loadYamlFile<TestConfig>(path, defaultConfig);
  return config ?? defaultConfig;
}

export async function runTest(test: TestCase): Promise<boolean> {
  console.log(`\nRunning test: ${test.name}`);
  if (test.description) {
    console.log(test.description);
  }

  for (const step of test.steps) {
    console.log(`\nStep: ${step.name}`);
    if (step.command) {
      console.log(`Command: ${step.command}`);
    }
  }

  return true;
}
