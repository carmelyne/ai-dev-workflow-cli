// Mock chalk for all tests
const mockChalk = {
  yellow: jest.fn((str) => `[yellow]${str}[/yellow]`),
  green: jest.fn((str) => `[green]${str}[/green]`),
  red: jest.fn((str) => `[red]${str}[/red]`),
  gray: jest.fn((str) => `[gray]${str}[/gray]`),
  blue: jest.fn((str) => `[blue]${str}[/blue]`),
  cyan: jest.fn((str) => `[cyan]${str}[/cyan]`),
  magenta: jest.fn((str) => `[magenta]${str}[/magenta]`),
  default: {
    yellow: jest.fn((str) => `[yellow]${str}[/yellow]`),
    green: jest.fn((str) => `[green]${str}[/green]`),
    red: jest.fn((str) => `[red]${str}[/red]`),
    gray: jest.fn((str) => `[gray]${str}[/gray]`),
    blue: jest.fn((str) => `[blue]${str}[/blue]`),
    cyan: jest.fn((str) => `[cyan]${str}[/cyan]`),
    magenta: jest.fn((str) => `[magenta]${str}[/magenta]`)
  }
};

// Mock inquirer for CLI tests
const mockInquirer = {
  prompt: jest.fn().mockResolvedValue({ confirm: true })
};

// Mock console methods to prevent noise in test output
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Setup mocks
jest.mock('chalk', () => mockChalk);
jest.mock('inquirer', () => mockInquirer);
global.console = { ...console, ...mockConsole };

// Export mocks for test files
module.exports = {
  mocks: {
    chalk: mockChalk,
    inquirer: mockInquirer,
    console: mockConsole
  }
};
