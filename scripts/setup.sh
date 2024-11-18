#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up AI Development Workflow CLI..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Create symlink
echo "🔗 Creating symlink..."
npm link

# Verify installation
echo "✅ Verifying installation..."
ai --version

echo "
✨ Setup complete! You can now use the following commands:

Development:
  npm run dev -- [command]    # Run CLI in development mode
  npm run watch              # Watch for changes
  npm run test               # Run tests
  npm run lint               # Lint code

Production:
  ai [command]               # Run CLI commands directly

Example:
  ai workflow module show base
"
