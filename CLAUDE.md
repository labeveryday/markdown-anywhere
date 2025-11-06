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
- **Commands**:
  - `markdown-anywhere.openInBrowser` - opens markdown in browser
  - `markdown-anywhere.showActiveRenders` - shows quick pick menu to manage active renders
- **Keybinding**: `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)
- **Configuration**: `markdown-anywhere.showStatusBar` (boolean, default: true) - controls status bar visibility

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
- Each rendered markdown file gets its own HTTP server on a unique port (starts at 3000, auto-increments via `portCounter`)
- Servers are tracked in `MarkdownRenderer.renderedDocs` Map with key = file path
- Server has custom `updateContent()` method to update HTML without restarting (`src/extension.ts:299-302`)
- Includes `/check-update` endpoint that returns `{ updated: true, timestamp: lastModified }` for live reload (`src/extension.ts:281-287`)

### HTML Generation (`src/extension.ts:93-269`)
- Uses GitHub-flavored markdown via `marked` library with `highlight.js` integration (`src/extension.ts:25-39`)
- Includes comprehensive CSS styling that matches GitHub's appearance with dark mode support via `prefers-color-scheme`
- Auto-refresh JavaScript polls `/check-update` every 1 second (`src/extension.ts:239-251`)
- Visual indicator shows "Auto-refresh enabled" in top-right corner

### Resource Management
- File watchers use `RelativePattern` to watch specific file, disposed via `watcher.dispose()` (`src/extension.ts:58-64, 328`)
- HTTP servers closed via `server.close()` when renders are terminated (`src/extension.ts:329`)
- Status bar item shows count of active renders with globe icon and click-to-manage functionality (`src/extension.ts:339-351`)
- Extension cleanup in `dispose()` closes all renders and disposes status bar (`src/extension.ts:401-406`)

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

### Publishing Extension
```bash
# Install vsce globally if not already installed
npm install -g @vscode/vsce

# Package extension into .vsix file
vsce package

# Publish to marketplace (requires Personal Access Token)
vsce publish
```