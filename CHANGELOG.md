# Changelog

## [0.1.0] - 2023-11-14

### Changed
- Simplified project structure and dependencies
- Moved to ES modules with `type: module` in package.json
- Streamlined TypeScript configuration
- Reduced build and start scripts to essentials

### Added
- New initialization workflow with AI configuration directories
- Support for multiple agent configurations (AI system, AI agent, human agent)
- Role-based configuration for human agents
- Template copying functionality

### Removed
- Complex testing infrastructure
- Unused dependencies (js-yaml, yaml, glob, luxon)
- Legacy configuration templates
- Unnecessary compiler options

### Dependencies
- Added: chalk@5.3.0 for console output
- Added: commander@11.0.0 for CLI structure
- Added: inquirer@9.2.10 for interactive prompts
- Removed multiple legacy dependencies

### Development
- Simplified TypeScript configuration
- Removed Jest testing setup
- Streamlined build process
- Basic gitignore rules
