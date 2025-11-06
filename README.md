# Markdown Anywhere

<p align="center">
  <img src="icon.png" alt="Markdown Anywhere Icon" width="128" height="128">
</p>

A Visual Studio Code extension that renders markdown files in your browser without keeping them open in VS Code. Perfect for writing documentation, notes, or any markdown content while keeping your editor clean and focused.

## Features

- **Browser Rendering**: Open markdown files directly in your default browser
- **Live Reload**: Automatically refreshes the browser when you edit the markdown file
- **GitHub Styling**: Beautiful GitHub-flavored markdown rendering with syntax highlighting
- **Dark Mode Support**: Automatically adapts to your system's color scheme
- **Multiple Files**: Render multiple markdown files simultaneously on different ports
- **No Editor Clutter**: View rendered content without keeping files open in VS Code

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Markdown Anywhere"
4. Click Install

### From VSIX (Development)
1. Download the `.vsix` file
2. In VS Code, go to Extensions
3. Click the "..." menu and select "Install from VSIX..."
4. Select the downloaded file

## Usage

### Opening Markdown in Browser

**Method 1: Keyboard Shortcut**
- Open a markdown file in VS Code
- Press `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)

**Method 2: Context Menu**
- Right-click on a markdown file in the Explorer
- Select "Open Markdown in Browser"

**Method 3: Command Palette**
- Open a markdown file
- Press `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac)
- Type "Open Markdown in Browser" and press Enter

### Managing Active Renders

- View active renders in the status bar (shows count)
- Click the status bar item to manage active renders
- Close individual renders or all at once
- Use Command Palette: "Show Active Renders"

## Configuration

The extension provides the following settings:

- `markdown-anywhere.showStatusBar`: Show the render count in the status bar (default: `true`)

## How It Works

1. **Local HTTP Server**: Creates a local server on an available port (starting from 3000)
2. **Markdown Processing**: Uses the `marked` library to convert markdown to HTML
3. **Syntax Highlighting**: Code blocks are highlighted using `highlight.js`
4. **File Watching**: Monitors file changes and automatically updates the browser
5. **Resource Management**: Properly cleans up servers and watchers when done

## Development

### Prerequisites
- Node.js (version 16 or higher)
- VS Code (version 1.74.0 or higher)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd markdown-anywhere

# Install dependencies
npm install

# Compile TypeScript
npm run compile
```

### Building
```bash
# Compile once
npm run compile

# Watch for changes during development
npm run watch

# Prepare for publishing
npm run vscode:prepublish
```

### Testing
1. Open the project in VS Code
2. Press `F5` to launch a new Extension Development Host window
3. Open a markdown file in the new window
4. Test the extension functionality

### Packaging
```bash
# Install vsce if you haven't already
npm install -g vsce

# Package the extension
vsce package
```

## Technical Details

### Architecture
- **Main Class**: `MarkdownRenderer` handles all core functionality
- **Port Management**: Each rendered file gets its own port to avoid conflicts
- **Live Reload**: Uses a `/check-update` endpoint with client-side polling
- **Styling**: GitHub-flavored CSS with comprehensive dark mode support

### Dependencies
- `marked`: Markdown parsing and rendering
- `highlight.js`: Syntax highlighting for code blocks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Changelog

### 1.0.0
- Initial release
- Browser-based markdown rendering with GitHub styling
- Live reload functionality
- Syntax highlighting with highlight.js
- Dark mode support
- Multiple file support with individual ports
- Status bar integration for managing active renders