# AI Dev Workflow CLI

> **Important**: Start by reading [PRINCIPLES.md](PRINCIPLES.md) to understand our documentation-first approach and core values.

<div align="center">

[![GitHub license](https://img.shields.io/github/license/carmelyne/ai-dev-workflow-cli)](https://github.com/carmelyne/ai-dev-workflow-cli/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/ai-dev-workflow-cli)](https://www.npmjs.com/package/ai-dev-workflow-cli)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/carmelyne/ai-dev-workflow-cli/blob/main/CONTRIBUTING.md)
[![Status](https://img.shields.io/badge/status-pre--alpha-orange)](https://github.com/carmelyne/ai-dev-workflow-cli)

</div>

> ⚠️ **Project Status: Pre-Alpha**
>
> This project is in active early development. While the architecture and documentation are being established, the implementation is not yet ready for production use. We're following a documentation-first approach to ensure solid foundations.
>
> - ✅ Architecture & Documentation: In Progress
> - 🚧 Core Implementation: Early Development
> - 📅 Expected Alpha Release: Q1 2025
>
> Star/Watch this repository to stay updated on our progress!

A framework-agnostic CLI tool that provides consistent, user-controlled AI behavior through tenets, directives, and workflow templates.

## Core Concepts

- **Tenets & Directives** - Control WHAT and HOW the AI operates
- **Context Persistence** - Maintain AI behavior consistency
- **User Control** - Full customization of AI behavior
- **Documentation First** - Clear specifications before implementation

## System Integration

```
System Level
└── /etc/ai/
    ├── tenets/
    └── directives/

Application Level
└── ${APP_PATH}/ai/
    ├── workflows/
    └── preferences/

User Level
└── ~/.config/ai/
    ├── custom/
    └── preferences/
```

## Quick Start

```bash
# Install globally
npm install -g ai-dev-workflow-cli

# Initialize in your project
ai-dev init

# Load a workflow template
ai-dev workflow load developer

# Check current AI context
ai-dev context show

# Refresh AI memory
ai-dev refresh-memory
```

## Documentation Structure

```
docs/
├── ARCHITECTURE.md     # System design
├── core/
│   ├── TENETS_AND_REFRESH.md
│   └── USER_CONTROL.md
├── integration/        # OS/App integration
└── workflows/         # Template guides
```

## Key Features

### 1. Context Management
- File-based configuration via `/PATH`
- Hierarchical settings loading
- Context persistence across sessions

### 2. User Empowerment
- Custom workflow templates
- Behavior preferences
- Privacy controls

### 3. Universal Integration
- OS-level integration
- Application support
- Cross-platform compatibility

## Configuration

```yaml
# Example user preferences
~/.config/ai/preferences.yaml

preferences:
  style:
    tone: professional
    verbosity: concise
  
  workflow:
    auto_refresh: true
    context_retention: high
```

## Development Status

### Current Phase: Pre-Alpha

We are currently in the early stages of development, following our documentation-first principle:

#### Completed
- ✅ Core architecture design
- ✅ Documentation structure
- ✅ Tenets and directives system
- ✅ User control specification

#### In Progress
- 🚧 Base implementation
- 🚧 Template system
- 🚧 Context management
- 🚧 Integration guides

#### Roadmap
- 📅 Q1 2025: Alpha Release
  - Basic CLI functionality
  - Core workflow templates
  - Local context management
- 📅 Q3 2025: Beta Release
  - Full feature set
  - Multiple workflow types
  - Integration APIs
- 📅 Q1 2026: 1.0 Release
  - Production ready
  - Enterprise features
  - Extended ecosystem

### Getting Involved

While we're not yet ready for production use, you can:
1. Star the repository to show interest
2. Watch for updates
3. Provide feedback on the architecture
4. Suggest features or use cases

## Contributing

1. Read [PRINCIPLES.md](PRINCIPLES.md) first
2. Follow documentation-first approach
3. See [CONTRIBUTING.md](CONTRIBUTING.md)

## Learn More

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Core Concepts](docs/core/TENETS_AND_REFRESH.md)
- [User Control](docs/core/USER_CONTROL.md)

## License

MIT - See [LICENSE](LICENSE) for details
