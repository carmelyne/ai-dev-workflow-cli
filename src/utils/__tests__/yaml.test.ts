import { jest } from '@jest/globals';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { loadYamlFile, saveYamlFile, mergeYamlFiles, type DeepPartial } from '../yaml.js';
import type { YAMLContent, YAMLObject } from '../../types/yaml.js';

// Mock fs/promises
jest.mock('fs/promises');
const mockedFs = jest.mocked(fs);

// Mock js-yaml
jest.mock('js-yaml');
const mockedYaml = jest.mocked(yaml);

describe('YAML Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadYamlFile', () => {
    it('should load and parse yaml file', async () => {
      const mockContent = 'key: value';
      const mockParsed: YAMLObject = { key: 'value' };
      
      mockedFs.readFile.mockResolvedValue(mockContent);
      mockedYaml.load.mockReturnValue(mockParsed);

      const result = await loadYamlFile<YAMLObject>('test.yaml');
      
      expect(result).toEqual(mockParsed);
      expect(mockedFs.readFile).toHaveBeenCalledWith('test.yaml', 'utf8');
      expect(mockedYaml.load).toHaveBeenCalledWith(mockContent);
    });

    it('should return default content if file does not exist', async () => {
      const defaultContent: YAMLObject = { default: true };
      const error = new Error('ENOENT');
      (error as NodeJS.ErrnoException).code = 'ENOENT';
      
      mockedFs.readFile.mockRejectedValue(error);

      const result = await loadYamlFile<YAMLObject>('test.yaml', defaultContent);
      
      expect(result).toEqual(defaultContent);
      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it('should throw error for other file system errors', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('Other error'));

      await expect(loadYamlFile('test.yaml')).rejects.toThrow('Other error');
    });

    it('should return default content if yaml content is null', async () => {
      const defaultContent: YAMLObject = { default: true };
      
      mockedFs.readFile.mockResolvedValue('');
      mockedYaml.load.mockReturnValue(null);

      const result = await loadYamlFile<YAMLObject>('test.yaml', defaultContent);
      
      expect(result).toEqual(defaultContent);
    });
  });

  describe('saveYamlFile', () => {
    it('should save content as yaml', async () => {
      const content: YAMLObject = { key: 'value' };
      const yamlString = 'key: value\n';
      
      mockedYaml.dump.mockReturnValue(yamlString);

      await saveYamlFile('test.yaml', content);
      
      expect(mockedFs.mkdir).toHaveBeenCalled();
      expect(mockedYaml.dump).toHaveBeenCalledWith(content, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: true
      });
      expect(mockedFs.writeFile).toHaveBeenCalledWith('test.yaml', yamlString, 'utf8');
    });

    it('should create directory if it does not exist', async () => {
      const content: YAMLObject = { key: 'value' };
      const yamlString = 'key: value\n';
      
      mockedYaml.dump.mockReturnValue(yamlString);

      await saveYamlFile('dir/test.yaml', content);
      
      expect(mockedFs.mkdir).toHaveBeenCalledWith('dir', { recursive: true });
    });
  });

  describe('mergeYamlFiles', () => {
    interface TestObject extends Record<string, unknown> {
      a?: number;
      b?: number;
      c?: number;
      arr?: number[];
      nested?: {
        a?: number;
        b?: number;
        c?: number;
      };
    }

    it('should merge two objects', () => {
      const base: TestObject = { a: 1, b: 2 };
      const overlay: DeepPartial<TestObject> = { b: 3, c: 4 };
      
      const result = mergeYamlFiles(base, overlay);
      
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should handle null or undefined values', () => {
      const base: TestObject = { a: 1, b: 2 };
      const overlay: DeepPartial<TestObject> = { b: undefined };
      
      const result = mergeYamlFiles(base, overlay);
      
      expect(result).toEqual({ a: 1 });
    });

    it('should merge arrays', () => {
      const base: TestObject = { arr: [1, 2] };
      const overlay: DeepPartial<TestObject> = { arr: [3, 4] };
      
      const result = mergeYamlFiles(base, overlay);
      
      expect(result).toEqual({ arr: [1, 2, 3, 4] });
    });

    it('should handle nested objects', () => {
      const base: TestObject = { nested: { a: 1, b: 2 } };
      const overlay: DeepPartial<TestObject> = { nested: { b: 3, c: 4 } };
      
      const result = mergeYamlFiles(base, overlay);
      
      expect(result).toEqual({ nested: { a: 1, b: 3, c: 4 } });
    });

    it('should handle empty base object', () => {
      const base: TestObject = {};
      const overlay: DeepPartial<TestObject> = { a: 1 };
      
      const result = mergeYamlFiles(base, overlay);
      
      expect(result).toEqual({ a: 1 });
    });

    it('should handle empty overlay object', () => {
      const base: TestObject = { a: 1 };
      const overlay: DeepPartial<TestObject> = {};
      
      const result = mergeYamlFiles(base, overlay);
      
      expect(result).toEqual({ a: 1 });
    });
  });
});
