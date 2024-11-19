# Commit Checklist

## Flow

1. **Before Starting Changes**
   - Create a new branch if needed
   - Review the checklist items below

2. **During Development**
   - Keep track of changes made
   - Update documentation as you go
   - Run checks frequently (build, lint, etc.)

3. **Before Committing**
   - Go through each section of the checklist
   - Mark items as completed
   - Fix any issues found

4. **Final Steps**
   - Complete checklist items 7.1-7.3
   - Create your change record in `.changes/`
   - Name format: `<version>-<change-description>.md`
   - Document completed checklist and changes
   - Push changes

## Checklist Items

## 1. Documentation
- [ ] CHANGELOG.md updated with correct version
- [ ] Package.json version matches CHANGELOG.md
- [ ] Documentation files updated if needed

## 2. Git Setup
- [ ] .gitignore includes all necessary patterns
- [ ] No sensitive data in commits
- [ ] Removed unused files from staging

## 3. Testing
- [ ] Tests pass (if applicable)
- [ ] Test coverage maintained
- [ ] No broken tests left behind

## 4. Code Quality
- [ ] ESLint shows no errors
- [ ] Prettier formatting applied
- [ ] Pre-commit hooks working

## 5. Build
- [ ] Clean build succeeds
- [ ] No TypeScript errors
- [ ] No compilation warnings

## 6. npm Scripts
- [ ] `format` works
- [ ] `lint` passes
- [ ] `build` succeeds
- [ ] `start` runs correctly
- [ ] `dev` works as expected

## 7. Final Steps
- [ ] Stage all intended changes
- [ ] Write clear commit message
- [ ] Verify staged changes with `git status`
- [ ] Create a new file in `.changes/` directory

## Notes
- This checklist should be reviewed before every commit
- Not all items may apply to every commit
- Add project-specific items as needed
