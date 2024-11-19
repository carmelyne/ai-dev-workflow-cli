import { jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';
import { runTests, loadTestConfig, runTest } from '../test.js';
import type { TestConfig, TestOptions } from '../test.js';
import * as configModule from '../config.js';
import * as yamlModule from '../yaml.js';
import * as childProcess from 'child_process';
import type { YAMLContent } from '../../types/yaml.js';

// Mock dependencies
jest.mock('../config.js');
jest.mock('../yaml.js');
jest.mock('child_process', () => ({
  spawnSync: jest.fn()
}));

const mockedLoadYamlFile = yamlModule.loadYamlFile as MockedFunction<typeof yamlModule.loadYamlFile>;
const mockedGetProjectConfig = configModule.getProjectConfig as MockedFunction<typeof configModule.getProjectConfig>;
const mockedSpawnSync = childProcess.spawnSync as MockedFunction<typeof childProcess.spawnSync>;

describe('Test Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default spawn mock to return success
    mockedSpawnSync.mockReturnValue({
      status: 0,
      stdout: Buffer.from(''),
      stderr: Buffer.from(''),
      pid: 123,
      output: [],
      signal: null
    });
  });

  describe('runTests', () => {
    it('should run tests with default options', async () => {
      const mockConfig = {
        test: {
          command: 'mocha'
        }
      };

      mockedGetProjectConfig.mockResolvedValue(mockConfig as any);

      await runTests();

      expect(mockedSpawnSync).toHaveBeenCalledWith(
        'mocha',
        [],
        expect.objectContaining({ stdio: 'inherit', shell: true })
      );
    });

    it('should handle missing config', async () => {
      mockedGetProjectConfig.mockResolvedValue(null);

      await expect(runTests()).rejects.toThrow('Project configuration not found');
      expect(mockedSpawnSync).not.toHaveBeenCalled();
    });

    it('should handle test options', async () => {
      const mockConfig = {
        test: {
          command: 'mocha'
        }
      };

      mockedGetProjectConfig.mockResolvedValue(mockConfig as any);

      const options: TestOptions = {
        files: 'test.ts',
        update: true,
        watch: true,  // watch mode will be ignored in test environment
        coverage: true,
        analyze: true
      };

      await runTests(options);

      // Verify args are passed correctly (watch flag should be omitted in test environment)
      const expectedArgs = [
        'test.ts',
        '--updateSnapshot',
        '--coverage',
        '--coverageDirectory=.ai/coverage',
        '--json',
        '--outputFile=.ai/test-results.json'
      ];

      expect(mockedSpawnSync).toHaveBeenCalledWith(
        'mocha',
        expectedArgs,
        expect.objectContaining({ stdio: 'inherit', shell: true })
      );
    });

    it('should handle spawn failure', async () => {
      const mockConfig = {
        test: {
          command: 'mocha'
        }
      };

      mockedGetProjectConfig.mockResolvedValue(mockConfig as any);
      mockedSpawnSync.mockReturnValue({
        status: 1,
        stdout: Buffer.from(''),
        stderr: Buffer.from('Test failed'),
        pid: 123,
        output: [],
        signal: null
      });

      await expect(runTests()).rejects.toThrow('Tests failed with exit code 1');
    });
  });

  describe('loadTestConfig', () => {
    it('should load test configuration', async () => {
      mockedLoadYamlFile.mockImplementation(<T extends YAMLContent>(path: string, defaultConfig: T | null = null) => 
        Promise.resolve(defaultConfig as T)
      );

      const result = await loadTestConfig('test.yaml');
      expect(result).toBeDefined();
      expect(result.name).toBe('Default Test Suite');
    });
  });

  describe('runTest', () => {
    it('should run a test', async () => {
      const test = {
        name: 'Test Case',
        description: 'Test Description',
        steps: [
          {
            name: 'Step 1',
            command: 'test command'
          }
        ]
      };

      const result = await runTest(test);
      expect(result).toBe(true);
    });

    it('should run a test without description', async () => {
      const test = {
        name: 'Test Case',
        steps: [
          {
            name: 'Step 1'
          }
        ]
      };

      const result = await runTest(test);
      expect(result).toBe(true);
    });
  });
});
