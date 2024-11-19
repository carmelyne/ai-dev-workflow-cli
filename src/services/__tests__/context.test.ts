import { jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';
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
import yaml from 'js-yaml';

// Explicitly type the mocked functions
const mockedReadFile = readFile as MockedFunction<typeof readFile>;
const mockedWriteFile = writeFile as MockedFunction<typeof writeFile>;
const mockedMkdir = mkdir as MockedFunction<typeof mkdir>;
const mockedYamlLoad = yaml.load as MockedFunction<typeof yaml.load>;
const mockedYamlDump = yaml.dump as MockedFunction<typeof yaml.dump>;

// Mock the fs/promises module
jest.mock('fs/promises');

// Mock js-yaml
jest.mock('js-yaml');

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
    mockedYamlLoad.mockImplementation((str: string) => JSON.parse(str));
    mockedYamlDump.mockImplementation((obj: unknown) => JSON.stringify(obj));
  });

  describe('loadContext', () => {
    it('should load context from file', async () => {
      const mockYamlString = JSON.stringify(mockContextData);
      mockedReadFile.mockResolvedValueOnce(mockYamlString);
      mockedYamlLoad.mockReturnValueOnce(mockContextData);

      const result = await loadContext();
      expect(result).toEqual(mockContextData);
      expect(mockedReadFile).toHaveBeenCalled();
    });

    it('should create default context if file does not exist', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockedReadFile.mockRejectedValueOnce(error);
      mockedWriteFile.mockResolvedValueOnce(undefined);

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
      const mockYamlString = JSON.stringify(mockContextData);
      mockedYamlDump.mockReturnValueOnce(mockYamlString);
      mockedMkdir.mockResolvedValueOnce(undefined);
      mockedWriteFile.mockResolvedValueOnce(undefined);

      await saveContext(mockContextData);
      expect(mockedMkdir).toHaveBeenCalled();
      expect(mockedWriteFile).toHaveBeenCalledWith(
        expect.any(String),
        mockYamlString,
        'utf8'
      );
    });
  });

  describe('clearContext', () => {
    it('should clear all context data', async () => {
      const expectedEmptyContext: ContextData = {
        history: [],
        data: {}
      };
      const mockYamlString = JSON.stringify(expectedEmptyContext);
      mockedYamlDump.mockReturnValueOnce(mockYamlString);
      mockedMkdir.mockResolvedValueOnce(undefined);
      mockedWriteFile.mockResolvedValueOnce(undefined);

      await clearContext();
      expect(mockedWriteFile).toHaveBeenCalledWith(
        expect.any(String),
        mockYamlString,
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
      const mockInitialYaml = JSON.stringify(initialContext);
      mockedReadFile.mockResolvedValueOnce(mockInitialYaml);
      mockedYamlLoad.mockReturnValueOnce(initialContext);
      mockedWriteFile.mockResolvedValueOnce(undefined);

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

      const mockInitialYaml = JSON.stringify(initialContext);
      mockedReadFile.mockResolvedValueOnce(mockInitialYaml);
      mockedYamlLoad.mockReturnValueOnce(initialContext);
      mockedWriteFile.mockResolvedValueOnce(undefined);

      await addHistoryEntry('new command', 'success');
      
      const [[, yamlContent]] = mockedWriteFile.mock.calls;
      const savedContext = JSON.parse(yamlContent as string) as ContextData;
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
