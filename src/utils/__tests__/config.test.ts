import { jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, getProjectConfig, syncConfigWithTemplate } from '../config.js';
import { loadYamlFile, saveYamlFile } from '../yaml.js';
import type { ProjectConfig } from '../config.js';

// Mock dependencies
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));
jest.mock('path');
jest.mock('../yaml.js', () => ({
  loadYamlFile: jest.fn(),
  saveYamlFile: jest.fn()
}));

// Get mocked modules
const mockedFs = jest.mocked(fs);
const mockedPath = jest.mocked(path);
const mockedLoadYaml = loadYamlFile as MockedFunction<typeof loadYamlFile>;
const mockedSaveYaml = saveYamlFile as MockedFunction<typeof saveYamlFile>;

describe('Config Utilities', () => {
  const mockConfig: ProjectConfig = {
    project: {
      name: 'test-project',
      type: 'test',
      description: 'Test Project'
    },
    name: 'test',
    development_workflow: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup common path mock
    mockedPath.join.mockImplementation((...paths) => paths.join('/'));
    mockedPath.dirname.mockImplementation((p) => p.split('/').slice(0, -1).join('/'));

    // Setup default mocks
    mockedFs.existsSync.mockReturnValue(true);
  });

  describe('loadConfig', () => {
    it('should load and parse config file', async () => {
      mockedLoadYaml.mockResolvedValue(mockConfig);

      const result = await loadConfig();

      expect(result).toEqual(mockConfig);
      expect(mockedLoadYaml).toHaveBeenCalledWith('.ai/config.yaml', null);
    });

    it('should return null if config file does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = await loadConfig();

      expect(result).toBeNull();
    });

    it('should return null on read error', async () => {
      mockedLoadYaml.mockRejectedValue(new Error('Read failed'));

      const result = await loadConfig();

      expect(result).toBeNull();
    });
  });

  describe('getProjectConfig', () => {
    it('should return project config', async () => {
      mockedLoadYaml.mockResolvedValue(mockConfig);

      const result = await getProjectConfig();

      expect(result).toEqual(mockConfig);
    });

    it('should return null if config file does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = await getProjectConfig();

      expect(result).toBeNull();
    });

    it('should return null on read error', async () => {
      mockedLoadYaml.mockRejectedValue(new Error('Read failed'));

      const result = await getProjectConfig();

      expect(result).toBeNull();
    });
  });

  describe('syncConfigWithTemplate', () => {
    it('should sync config with template', async () => {
      const mockTemplate = {
        project: {
          name: 'template-project',
          type: 'template',
          description: 'Template Project'
        }
      };

      mockedLoadYaml.mockResolvedValue(mockTemplate);
      mockedPath.dirname.mockReturnValue('.ai');

      await syncConfigWithTemplate('template.yaml');

      expect(mockedLoadYaml).toHaveBeenCalledWith('template.yaml', null);
      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('.ai', { recursive: true });
      expect(mockedSaveYaml).toHaveBeenCalledWith(
        '.ai/config.yaml',
        mockTemplate,
        expect.any(Object)
      );
    });

    it('should throw error if template does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      await expect(syncConfigWithTemplate('template.yaml'))
        .rejects
        .toThrow('Template not found: template.yaml');
    });

    it('should create config directory if it does not exist', async () => {
      const mockTemplate = {
        project: {
          name: 'template-project',
          type: 'template',
          description: 'Template Project'
        }
      };

      mockedLoadYaml.mockResolvedValue(mockTemplate);
      mockedPath.dirname.mockReturnValue('.ai');

      await syncConfigWithTemplate('template.yaml');

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('.ai', { recursive: true });
    });

    it('should handle template parsing errors', async () => {
      mockedLoadYaml.mockRejectedValue(new Error('Invalid YAML'));

      await expect(syncConfigWithTemplate('template.yaml'))
        .rejects
        .toThrow('Invalid YAML');
    });

    it('should handle write errors', async () => {
      const mockTemplate = {
        project: {
          name: 'template-project',
          type: 'template',
          description: 'Template Project'
        }
      };

      mockedLoadYaml.mockResolvedValue(mockTemplate);
      mockedSaveYaml.mockRejectedValue(new Error('Write failed'));

      await expect(syncConfigWithTemplate('template.yaml'))
        .rejects
        .toThrow('Write failed');
    });
  });
});
