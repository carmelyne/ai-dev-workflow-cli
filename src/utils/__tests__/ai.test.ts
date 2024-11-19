import { jest } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs';
import {
  executeAICommand,
  type AIAnalysisResult,
  type AICommandOptions,
  analyzeBusinessValue,
  generateAcceptanceCriteria,
  analyzeTechnicalImpact,
  breakdownTasks,
  assessRisks,
  generateTestScenarios,
  identifyDocumentation,
  estimateComplexity,
  estimateTimeline,
  findRelatedStories,
  getProjectContext,
  sanitizeFilename,
  getRelevantFiles
} from '../ai.js';

// Mock fs and path
jest.mock('fs');
jest.mock('path');

const mockedFs = jest.mocked(fs);
const mockedPath = jest.mocked(path);

describe('AI Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mocks
    mockedPath.join.mockImplementation((...args) => args.join('/'));
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('template content');
    mockedFs.mkdirSync.mockImplementation(() => undefined);
    mockedFs.writeFileSync.mockImplementation(() => undefined);
  });

  describe('executeAICommand', () => {
    const defaultOptions: AICommandOptions = {
      content: 'test content',
      type: 'test',
      depth: 'full'
    };

    it('should handle story creation command', async () => {
      const result = await executeAICommand('story:create', {
        ...defaultOptions,
        title: 'Test Story',
        description: 'Test Description'
      });

      expect(result).toBeDefined();
      expect(result.issues).toEqual([]);
      expect(result.metrics).toBeDefined();
    });

    it('should handle story creation when directory does not exist', async () => {
      mockedFs.existsSync.mockReturnValueOnce(false);
      
      const result = await executeAICommand('story:create', {
        ...defaultOptions,
        title: 'Test Story',
        description: 'Test Description'
      });

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
      expect(result).toBeDefined();
      expect(result.issues).toEqual([]);
      expect(result.metrics).toBeDefined();
    });

    it('should handle implement command', async () => {
      const result = await executeAICommand('implement', defaultOptions);

      expect(result).toBeDefined();
      expect(result.issues).toEqual([]);
      expect(result.metrics).toBeDefined();
    });

    it('should handle review command', async () => {
      const result = await executeAICommand('review', defaultOptions);

      expect(result).toBeDefined();
      expect(result.issues).toHaveLength(1);
      expect(result.metrics).toBeDefined();
      expect(result.metrics?.complexity).toBeDefined();
      expect(result.metrics?.maintainability).toBeDefined();
      expect(result.metrics?.testability).toBeDefined();
    });

    it('should handle review command with autofix option', async () => {
      const result = await executeAICommand('review', {
        ...defaultOptions,
        autofix: true
      });

      expect(result).toBeDefined();
      expect(result.fixes).toBeDefined();
      expect(result.fixes?.length).toBeGreaterThan(0);
    });

    it('should throw error for unknown command', async () => {
      await expect(
        executeAICommand('unknown', defaultOptions)
      ).rejects.toThrow('Unknown AI command: unknown');
    });
  });

  describe('AI Analysis Functions', () => {
    const mockContext = {};

    describe('Business Value Analysis', () => {
      it('should analyze business value', async () => {
        const description = 'Test feature description';
        const result = await analyzeBusinessValue(description, mockContext);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('Acceptance Criteria Generation', () => {
      it('should generate acceptance criteria', async () => {
        const description = 'Test feature description';
        const result = await generateAcceptanceCriteria(description, mockContext);
        expect(result).toBeDefined();
        expect(result).toContain('- [ ]');
      });
    });

    describe('Technical Impact Analysis', () => {
      it('should analyze technical impact', async () => {
        const description = 'Test feature description';
        const result = await analyzeTechnicalImpact(description, mockContext);
        expect(result).toBeDefined();
        expect(result.architecture).toBeDefined();
        expect(result.dependencies).toBeDefined();
        expect(result.approach).toBeDefined();
      });
    });

    describe('Task Breakdown', () => {
      it('should break down tasks', async () => {
        const description = 'Test feature description';
        const result = await breakdownTasks(description, mockContext);
        expect(result).toBeDefined();
        expect(result).toContain('- [ ]');
        expect(result).toContain('Complexity:');
      });
    });

    describe('Risk Assessment', () => {
      it('should assess risks', async () => {
        const description = 'Test feature description';
        const result = await assessRisks(description, mockContext);
        expect(result).toBeDefined();
        expect(result).toContain('Risk:');
        expect(result).toContain('Mitigation:');
      });
    });

    describe('Test Scenario Generation', () => {
      it('should generate test scenarios', async () => {
        const description = 'Test feature description';
        const result = await generateTestScenarios(description, mockContext);
        expect(result).toBeDefined();
        expect(result).toContain('- [ ]');
      });
    });

    describe('Documentation Requirements', () => {
      it('should identify documentation requirements', async () => {
        const description = 'Test feature description';
        const result = await identifyDocumentation(description, mockContext);
        expect(result).toBeDefined();
        expect(result).toContain('- [ ]');
      });
    });

    describe('Complexity Estimation', () => {
      it('should estimate complexity', async () => {
        const description = 'Test feature description';
        const result = await estimateComplexity(description, mockContext);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('Timeline Estimation', () => {
      it('should estimate timeline', async () => {
        const description = 'Test feature description';
        const result = await estimateTimeline(description, mockContext);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('Related Stories Analysis', () => {
      it('should find related stories', async () => {
        const description = 'Test feature description';
        const result = await findRelatedStories(description, mockContext);
        expect(result).toBeDefined();
        expect(result).toContain('Related Story');
      });
    });

    describe('Project Context', () => {
      it('should get project context', async () => {
        const result = await getProjectContext();
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });
    });
  });

  describe('File Operations', () => {
    it('should sanitize filenames', () => {
      const filename = 'Test Story Name! @#$%';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).toBe('test-story-name');
    });

    it('should sanitize filenames with leading/trailing hyphens', () => {
      const filename = '-Test Story Name!-';
      const sanitized = sanitizeFilename(filename);
      expect(sanitized).toBe('test-story-name');
    });

    it('should get relevant files', async () => {
      const projectRoot = '/test/project';
      const command = 'test';
      const options = {};
      const files = await getRelevantFiles(projectRoot, command, options);
      expect(Array.isArray(files)).toBe(true);
    });
  });
});
