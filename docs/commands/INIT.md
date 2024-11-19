# Init Command

The `init` command initializes a new AI-guided project by setting up the required directory structure and configuration files.

## Purpose

Create a consistent, well-structured environment for AI-human collaboration by:

1. Setting up core AI behavioral guidelines and principles
2. Creating AI agent workspace for analytics and decisions
3. Configuring role-specific settings for different types of users

## Directory Structure

```
.ai/
├── ai/                 # Core AI configuration
│   ├── directives.yaml   # Behavioral guidelines
│   ├── foundations.yaml  # Architecture principles
│   ├── memory.yaml      # Context persistence
│   └── tenets.yaml      # Core values
│
├── ai-agent/          # AI agent workspace
│   ├── analytics/      # AI analysis
│   ├── decisions/      # Decision tracking
│   ├── knowledge/      # Knowledge base
│   ├── sessions/       # Session state
│   └── tasks/          # Task tracking
│
└── human-agent/       # Human configuration
    └── roles/         # Role-specific settings
```

## Behavior

1. **Directory Check**

   - Check if `.ai` directory exists
   - If exists: prompt user to:
     - Create new
     - Overwrite existing
     - Cancel initialization
   - If not: proceed with initialization

2. **Role Selection**

   - Prompt user to select role(s):
     - Developer
     - Researcher
     - Writer
   - Multiple roles can be selected
   - At least one role must be selected

3. **File Operations**
   - Create directory structure
   - Copy AI configuration files
   - Copy selected role configurations
   - Create empty workspace directories

## Configuration Sources

Configuration files are sourced from the package's `ai-config` directory:

```
ai-config/
├── ai/                    # Core AI templates
│   ├── directives.yaml     # Behavioral guidelines
│   ├── foundations.yaml    # Architecture principles
│   ├── memory.yaml        # Context persistence
│   └── tenets.yaml        # Core values
│
└── human-agent/
    └── roles/            # Role templates
        ├── developer.yaml
        ├── researcher.yaml
        └── writer.yaml
```

## Usage

```bash
# Initialize new project
ai-dev init

# Select role(s) when prompted
? Select roles: (Use space to select multiple)
❯ ◯ developer
  ◯ researcher
  ◯ writer
```

## Error Handling

1. **Existing Directory**

   - Condition: `.ai` directory already exists
   - Action: Prompt user for action (new/overwrite/cancel)
   - Purpose: Allow flexibility while preventing accidental overwrites

2. **Missing Templates**

   - Condition: Required template files not found
   - Action: Display error with clear message
   - Purpose: Ensure proper package installation

3. **Permission Issues**

   - Condition: Cannot create directories/files
   - Action: Display error with clear message
   - Purpose: Guide user to resolve permission issues

4. **Role Selection**
   - Condition: No roles selected
   - Action: Prevent continuation until at least one role selected
   - Purpose: Ensure proper configuration

## Implementation Notes

1. Use `fs/promises` for async file operations
2. Use `inquirer` for interactive prompts
3. Keep error messages clear and actionable
4. Create empty workspace directories for future use
