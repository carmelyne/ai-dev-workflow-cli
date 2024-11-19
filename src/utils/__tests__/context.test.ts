import { jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';
import * as yaml from '../yaml.js';
import * as config from '../config.js';
import {
  loadContext,
  saveContext,
  clearContext,
  addHistoryEntry,
  displayContext,
  type ContextData,
  type ContextDisplayOptions
} from '../context.js';
import { mkdir, readFile, writeFile } from 'fs/promises';
import jsYaml from 'js-yaml';

// Mock fs/promises functions
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn()
}));

// Get mocked functions with proper types
const mockedReadFile = readFile as MockedFunction<typeof readFile>;
const mockedWriteFile = writeFile as MockedFunction<typeof writeFile>;
const mockedMkdir = mkdir as MockedFunction<typeof mkdir>;

describe('Context Management', () => {
  const mockContextData: ContextData = {
    currentStep: 'test step',
    history: [{
      timestamp: '2023-01-01T00:00:00.000Z',
      command: 'test command',
      status: 'success',
      message: 'test message'
    }],
    data: { key: 'value' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadContext', () => {
    it('should load context from file', async () => {
      mockedReadFile.mockResolvedValue(jsYaml.dump(mockContextData));

      const result = await loadContext();
      expect(result).toEqual(mockContextData);
      expect(mockedReadFile).toHaveBeenCalled();
    });

    it('should create default context if file does not exist', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockedReadFile.mockRejectedValue(error);
      mockedWriteFile.mockResolvedValue(undefined);

      const result = await loadContext();
      expect(result).toEqual({
        history: [],
        data: {}
      });
      expect(mockedWriteFile).toHaveBeenCalled();
    });
  });

  describe('saveContext', () => {
    it('should save context to file', async () => {
      mockedMkdir.mockResolvedValue(undefined);
      mockedWriteFile.mockResolvedValue(undefined);

      await saveContext(mockContextData);
      expect(mockedMkdir).toHaveBeenCalled();
      expect(mockedWriteFile).toHaveBeenCalled();
    });
  });

  describe('clearContext', () => {
    it('should clear all context data', async () => {
      mockedMkdir.mockResolvedValue(undefined);
      mockedWriteFile.mockResolvedValue(undefined);

      await clearContext();
      const expectedEmptyContext = {
        history: [],
        data: {}
      };
      expect(mockedWriteFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('history: []'),
        'utf8'
      );
    });
  });

  describe('addHistoryEntry', () => {
    it('should add entry to history', async () => {
      const initialContext: ContextData = {
        history: [],
        data: {}
      };
      mockedReadFile.mockResolvedValue(jsYaml.dump(initialContext));
      mockedWriteFile.mockResolvedValue(undefined);

      await addHistoryEntry('test command', 'success', 'test message');
      
      expect(mockedWriteFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('test command'),
        'utf8'
      );
    });

    it('should limit history to 100 entries', async () => {
      const longHistory = Array(101).fill({
        timestamp: '2023-01-01T00:00:00.000Z',
        command: 'old command',
        status: 'success'
      });

      const initialContext: ContextData = {
        history: longHistory,
        data: {}
      };

      mockedReadFile.mockResolvedValue(jsYaml.dump(initialContext));
      mockedWriteFile.mockResolvedValue(undefined);

      await addHistoryEntry('new command', 'success');
      
      const [[, yamlContent]] = mockedWriteFile.mock.calls;
      const savedContext = jsYaml.load(yamlContent as string) as ContextData;
      expect(savedContext.history.length).toBe(100);
      expect(savedContext.history[99].command).toBe('new command');
    });
  });

  describe('displayContext', () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    afterEach(() => {
      mockConsoleLog.mockClear();
    });

    it('should display context information', async () => {
      await displayContext(mockContextData, { verbose: true });
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should limit history display when not verbose', async () => {
      await displayContext(mockContextData, { verbose: false });
      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });
});
