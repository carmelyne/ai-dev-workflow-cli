# AI Development Workflow CLI Commands

## Current Commands
- `init` - Initialize AI development workflow
- `explore` - Explore codebase with AI
- `guide` - Get AI guidance on development tasks
- `review` - Review code with AI
- `status` - Check workflow status
- `code` - Code generation and modification
- `context` - Manage development context
- `sync` - Synchronize development state

## Commands to Define
1. Context Management
   - [ ] `ai keep <item>` - Mark items for preservation
   - [ ] `ai forget <item>` - Remove items from context
   - [ ] `ai tag <item> <tag>` - Tag items for organization
   - [ ] `ai search <query>` - Search through context history

2. Workflow Control
   - [ ] `ai pause` - Pause current workflow
   - [ ] `ai resume` - Resume paused workflow
   - [ ] `ai switch <context>` - Switch between contexts

3. Knowledge Management
   - [ ] `ai learn` - Add to knowledge base
   - [ ] `ai explain` - Get explanations from context
   - [ ] `ai history` - View decision history

4. Team Collaboration
   - [ ] `ai share` - Share context with team
   - [ ] `ai merge` - Merge contexts
   - [ ] `ai diff` - Compare contexts

5. Task Management
   - [ ] `ai task new` - Create new development task
   - [ ] `ai task list` - List all tasks
   - [ ] `ai task start <id>` - Start working on a task
   - [ ] `ai task pause <id>` - Pause task and save context
   - [ ] `ai task resume <id>` - Resume task with saved context
   - [ ] `ai task done <id>` - Complete task and archive context
   - [ ] `ai task deps` - Show task dependencies
   - [ ] `ai task tree` - Show task hierarchy
   - [ ] `ai task context` - Show/edit task-specific context
   - [ ] `ai task export` - Export task details (for tickets/PRs)

## Next Steps
1. Define command specifications:
   - Arguments and options
   - Input/output formats
   - Error handling
   - Examples

2. Group commands by:
   - Core vs. Extended functionality
   - Individual vs. Team usage
   - Context vs. Code operations

3. Consider:
   - Command aliases for common operations
   - Batch operations
   - Integration with existing tools
   - Configuration options

## Notes
- Keep command naming consistent
- Ensure clear, single-responsibility for each command
- Document common workflows
- Consider progressive disclosure of complexity
