import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { loadConfig, getProjectConfig } from '../../utils/config.js';
import { loadContext } from '../../utils/context.js';
import { executeAICommand } from '../../utils/ai.js';

interface ReviewOptions {
  files?: string;
  type?: 'security' | 'performance' | 'style' | 'all';
  checklist?: boolean;
  autofix?: boolean;
  interactive?: boolean;
  depth?: 'basic' | 'detailed' | 'comprehensive';
}

interface ReviewResult {
  file: string;
  type: string;
  issues: Array<{
    severity: 'info' | 'warning' | 'error';
    line?: number;
    description: string;
    suggestion?: string;
    autoFixable: boolean;
  }>;
  metrics?: {
    complexity: number;
    maintainability: number;
    testability: number;
  };
}

export class CodeReviewCommand {
  static register(program: Command) {
    const reviewCmd = program
      .command('review')
      .description('Perform AI-powered code review')
      .option('-f, --files <glob>', 'Files to review (default: staged files)')
      .option('-t, --type <type>', 'Review type (security, performance, style, all)', 'all')
      .option('-c, --checklist', 'Use review checklist', false)
      .option('-a, --autofix', 'Automatically fix simple issues', false)
      .option('-i, --interactive', 'Interactive review mode', false)
      .option('-d, --depth <level>', 'Analysis depth (basic, detailed, comprehensive)', 'detailed')
      .action(async (options: ReviewOptions) => {
        try {
          await CodeReviewCommand.execute(options);
        } catch (error: any) {
          console.error('Error during code review:', error.message);
          process.exit(1);
        }
      });

    return reviewCmd;
  }

  static async execute(options: ReviewOptions): Promise<void> {
    console.log('🔍 Starting AI Code Review...\n');

    // Load AI context and config
    await loadContext();
    const config = await getProjectConfig();

    // Get files to review
    const files = await this.getFilesToReview(options.files);
    if (files.length === 0) {
      console.log('No files to review. Stage changes or specify files with --files');
      return;
    }

    // Show review plan
    console.log(`Found ${files.length} files to review:`);
    files.forEach(file => console.log(`  - ${file}`));
    console.log();

    // Load or create checklist if requested
    if (options.checklist) {
      await this.loadReviewChecklist();
    }

    // Determine review types
    const reviewTypes = (options.type || 'all') === 'all'
      ? ['security', 'performance', 'style']
      : [options.type || 'all'];

    // Perform review
    const results: ReviewResult[] = [];
    for (const file of files) {
      for (const type of reviewTypes) {
        const result = await this.reviewFile(file, type, options);
        results.push(result);
      }
    }

    // Apply auto-fixes if requested
    if (options.autofix) {
      await this.applyAutoFixes(results);
    }

    // Generate report
    await this.generateReport(results, options);
  }

  private static async getFilesToReview(filePattern?: string): Promise<string[]> {
    if (typeof filePattern === 'string' && filePattern.trim()) {
      return glob.sync(filePattern) || [];
    }

    // Get staged files by default
    const { execSync } = require('child_process');
    try {
      const gitFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return gitFiles.split('\n').filter(Boolean);
    } catch (error) {
      console.warn('Unable to get staged files. Are you in a git repository?');
      return [];
    }
  }

  private static async reviewFile(
    file: string, 
    type: string, 
    options: ReviewOptions
  ): Promise<ReviewResult> {
    console.log(`\n📝 Reviewing ${file} (${type})...`);
    
    const content = fs.readFileSync(file, 'utf8');
    const result: ReviewResult = {
      file,
      type,
      issues: []
    };

    // Perform AI analysis based on type and depth
    const analysis = await executeAICommand('analyze', {
      content,
      type,
      depth: options.depth,
      context: {
        projectConfig: await getProjectConfig(),
        fileType: path.extname(file),
        reviewType: type
      }
    });

    if (analysis?.issues) {
      result.issues = analysis.issues;
    }
    
    if (analysis?.metrics) {
      result.metrics = analysis.metrics;
    }

    // Interactive review if requested
    if (options.interactive) {
      await this.interactiveReview(result);
    }

    return result;
  }

  private static async interactiveReview(result: ReviewResult): Promise<void> {
    // TODO: Implement interactive review mode
    // - Show issues one by one
    // - Allow user to accept/reject/modify suggestions
    // - Provide immediate feedback
    // - Allow adding custom notes
  }

  private static async applyAutoFixes(results: ReviewResult[]): Promise<void> {
    const fixableIssues = results.flatMap(r => 
      r.issues.filter(i => i.autoFixable)
    );

    if (fixableIssues.length === 0) {
      console.log('\nNo auto-fixable issues found.');
      return;
    }

    console.log(`\n🔧 Applying ${fixableIssues.length} auto-fixes...`);
    // TODO: Implement auto-fix logic
    // - Apply fixes one by one
    // - Verify each fix
    // - Allow rollback if needed
  }

  private static async generateReport(
    results: ReviewResult[], 
    options: ReviewOptions
  ): Promise<void> {
    console.log('\n📊 Review Summary\n');

    type Severity = 'error' | 'warning' | 'info';
    type IssueInfo = {
      file: string;
      line?: number;
      description: string;
      suggestion?: string;
    };

    // Group issues by severity
    const issuesBySeverity: Record<Severity, IssueInfo[]> = {
      error: [],
      warning: [],
      info: []
    };

    results.forEach(result => {
      result.issues.forEach((issue) => {
        const issueInfo: IssueInfo = {
          file: result.file,
          line: issue.line,
          description: issue.description,
          suggestion: issue.suggestion
        };
        issuesBySeverity[issue.severity].push(issueInfo);
      });
    });

    // Print issues by severity
    const severities: Array<'error' | 'warning' | 'info'> = ['error', 'warning', 'info'];
    severities.forEach(severity => {
      const issues = issuesBySeverity[severity];
      if(issues.length > 0) {
        console.log(`${severity.toUpperCase()} (${issues.length}):`);
        issues.forEach(issue => {
          console.log(`  - [${issue.file}${issue.line ? `:${issue.line}` : ''}] ${issue.description}`);
          if(issue.suggestion) {
            console.log(`    Suggestion: ${issue.suggestion}`);
          }
        });
        console.log();
      }
    });

    // Print metrics if available
    const filesWithMetrics = results.filter(r => r.metrics);
    if (filesWithMetrics.length > 0) {
      console.log('Code Metrics:');
      filesWithMetrics.forEach(result => {
        console.log(`  ${result.file}:`);
        console.log(`    - Complexity: ${result.metrics!.complexity}`);
        console.log(`    - Maintainability: ${result.metrics!.maintainability}`);
        console.log(`    - Testability: ${result.metrics!.testability}`);
      });
    }

    // Save report to file
    const reportPath = path.join(process.cwd(), '.ai/reviews');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const reportFile = path.join(
      reportPath, 
      `review-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );

    fs.writeFileSync(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      options,
      results
    }, null, 2));

    console.log(`\nDetailed report saved to: ${reportFile}`);
  }

  private static async loadReviewChecklist(): Promise<void> {
    const checklistPath = path.join(process.cwd(), '.ai/templates/review-checklist.md');
    
    if (!fs.existsSync(checklistPath)) {
      await this.createReviewChecklist();
    }

    const checklist = fs.readFileSync(checklistPath, 'utf8');
    console.log('Review Checklist:\n');
    console.log(checklist);
  }

  private static async createReviewChecklist(): Promise<void> {
    const template = `# Code Review Checklist

## Security
- [ ] Check for exposed secrets
- [ ] Validate input sanitization
- [ ] Review authentication/authorization
- [ ] Check for vulnerable dependencies
- [ ] Verify secure communication
- [ ] Review access controls
- [ ] Check for injection vulnerabilities
- [ ] Validate data encryption

## Performance
- [ ] Identify potential bottlenecks
- [ ] Review resource usage
- [ ] Check for unnecessary operations
- [ ] Verify caching strategy
- [ ] Analyze algorithm complexity
- [ ] Check memory management
- [ ] Review database queries
- [ ] Validate async operations

## Style
- [ ] Follow project conventions
- [ ] Check code organization
- [ ] Verify naming conventions
- [ ] Review documentation
- [ ] Check formatting consistency
- [ ] Validate code modularity
- [ ] Review error messages
- [ ] Check comments quality

## Best Practices
- [ ] DRY (Don't Repeat Yourself)
- [ ] SOLID principles
- [ ] Error handling
- [ ] Logging practices
- [ ] Configuration management
- [ ] Dependency management
- [ ] API design
- [ ] Code reusability

## Testing
- [ ] Unit tests coverage
- [ ] Integration tests
- [ ] Edge cases covered
- [ ] Error scenarios
- [ ] Performance tests
- [ ] Security tests
- [ ] UI/UX tests
- [ ] API tests

## Documentation
- [ ] API documentation
- [ ] Code comments
- [ ] README updates
- [ ] Change log
- [ ] Dependencies list
- [ ] Setup instructions
- [ ] Usage examples
- [ ] Troubleshooting guide

## DevOps
- [ ] CI/CD pipeline
- [ ] Deployment process
- [ ] Monitoring setup
- [ ] Logging configuration
- [ ] Backup strategy
- [ ] Rollback plan
- [ ] Resource scaling
- [ ] Security scanning

## Notes
${new Date().toISOString()}
Status: In Progress`;

    const checklistDir = path.join(process.cwd(), '.ai/templates');
    if (!fs.existsSync(checklistDir)) {
      fs.mkdirSync(checklistDir, { recursive: true });
    }

    fs.writeFileSync(path.join(checklistDir, 'review-checklist.md'), template);
    console.log('Created new review checklist template');
  }
}
