# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Visual Studio Code extension called "Markdown Anywhere" that renders markdown files in a browser without keeping them open in VS Code. The extension creates a local HTTP server to serve rendered HTML and provides live reload functionality when markdown files are edited.

## Architecture

### Core Components

- **MarkdownRenderer Class** (`src/extension.ts:15-407`): Main class that handles markdown rendering, server management, and file watching
- **HTTP Server**: Creates local servers on incrementing ports (starting from 3000) to serve rendered HTML
- **File Watcher**: Uses VS Code's FileSystemWatcher to detect changes and auto-refresh rendered content
- **Markdown Processing**: Uses `marked` library with `highlight.js` for syntax highlighting

### Key Features

1. **Browser Rendering**: Converts markdown to HTML and serves it via local HTTP server
2. **Live Reload**: Automatically refreshes browser when markdown file changes
3. **Syntax Highlighting**: Code blocks are highlighted using highlight.js
4. **GitHub-style CSS**: Provides GitHub-like styling with dark mode support
5. **Port Management**: Each rendered file gets its own port to allow multiple simultaneous renders

## Development Commands

### Build and Compilation
```bash
npm run compile          # Compile TypeScript to JavaScript
npm run watch           # Watch mode for development
npm run vscode:prepublish   # Prepare for publishing
```

### Extension Development
- Use F5 in VS Code to launch Extension Development Host
- The compiled extension will be in `./out/extension.js`
- TypeScript source maps are enabled for debugging

## Extension Activation

- **Activation Events**: `onLanguage:markdown` - activates when a markdown file is opened
- **Main Command**: `markdown-anywhere.openInBrowser` - opens markdown in browser
- **Keybinding**: `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)

## File Structure

```
src/
├── extension.ts         # Main extension logic
out/                     # Compiled JavaScript output
├── extension.js         # Compiled from src/extension.ts
package.json            # Extension manifest and dependencies  
tsconfig.json           # TypeScript configuration
```

## Key Implementation Details

### Server Management
- Each rendered markdown file gets its own HTTP server on a unique port
- Servers are tracked in `MarkdownRenderer.renderedDocs` Map
- Includes `/check-update` endpoint for live reload functionality

### HTML Generation
- Uses GitHub-flavored markdown via `marked` library
- Includes comprehensive CSS styling that matches GitHub's appearance
- Auto-refresh JavaScript checks for updates every second
- Supports both light and dark themes via CSS media queries

### Resource Management
- File watchers are properly disposed when documents are closed
- HTTP servers are closed when renders are terminated
- Extension cleanup handled in `deactivate()` function

## Dependencies

### Runtime Dependencies
- `marked`: Markdown parser and compiler
- `highlight.js`: Syntax highlighting for code blocks

### Development Dependencies  
- `@types/vscode`: VS Code extension API types
- `@types/node`: Node.js type definitions
- `typescript`: TypeScript compiler

## Testing and Debugging

To test the extension:
1. Open the project in VS Code
2. Press F5 to launch Extension Development Host
3. Open a markdown file in the new window
4. Use Ctrl+Shift+M or right-click context menu to render in browser
5. Edit the markdown file and observe live reload in browser