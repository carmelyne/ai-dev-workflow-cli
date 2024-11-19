import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CLI_PATH = join(__dirname, '../../dist/cli.js');

describe('CLI Integration Tests', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'ai-dev-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should show version number', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} --version`);
    expect(stdout.trim()).toMatch(/\d+\.\d+\.\d+/);
  });

  it('should show help information', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
    expect(stdout).toContain('AI-guided development workflow tool');
    expect(stdout).toContain('Commands:');
  });

  it('should initialize a new project', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} init --type webapp`, { cwd: tempDir });
    expect(stdout).toContain('Initializing');
  });

  it('should run explore command', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} explore`, { cwd: tempDir });
    expect(stdout).toBeTruthy();
  });

  it('should run status command', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} status`, { cwd: tempDir });
    expect(stdout).toBeTruthy();
  });

  // Test error cases
  it('should handle invalid commands gracefully', async () => {
    try {
      await execAsync(`node ${CLI_PATH} invalid-command`);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.stderr).toContain('error: unknown command');
    }
  });

  it('should handle invalid options gracefully', async () => {
    try {
      await execAsync(`node ${CLI_PATH} init --invalid-option`);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.stderr).toContain('error: unknown option');
    }
  });
});
