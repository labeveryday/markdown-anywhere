import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';

interface RenderedDocument {
    uri: vscode.Uri;
    htmlContent: string;
    watcher: vscode.FileSystemWatcher;
    server: any;
    port: number;
}

class MarkdownRenderer {
    private renderedDocs: Map<string, RenderedDocument> = new Map();
    private portCounter = 3000;
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'markdown-anywhere.showActiveRenders';
        this.updateStatusBar();
        
        marked.setOptions({
            highlight: (code: string, lang?: string) => {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.error('Highlight.js error:', err);
                    }
                }
                return hljs.highlightAuto(code).value;
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true
        });
    }

    async renderMarkdown(uri: vscode.Uri): Promise<void> {
        const filePath = uri.fsPath;
        const docKey = filePath;

        if (this.renderedDocs.has(docKey)) {
            this.updateRenderedDocument(docKey);
            return;
        }

        try {
            const markdownContent = fs.readFileSync(filePath, 'utf8');
            const htmlContent = this.generateHtml(markdownContent, path.basename(filePath));
            
            const port = this.getNextPort();
            const server = await this.createServer(htmlContent, port);
            
            const watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(path.dirname(filePath), path.basename(filePath))
            );
            
            watcher.onDidChange(() => {
                this.updateRenderedDocument(docKey);
            });

            this.renderedDocs.set(docKey, {
                uri,
                htmlContent,
                watcher,
                server,
                port
            });

            this.updateStatusBar();

            const url = `http://localhost:${port}`;
            vscode.env.openExternal(vscode.Uri.parse(url));
            
            vscode.window.showInformationMessage(
                `Markdown file opened in browser at ${url}`,
                'Close Render'
            ).then((selection: string | undefined) => {
                if (selection === 'Close Render') {
                    this.closeRenderedDocument(docKey);
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to render markdown: ${error}`);
        }
    }

    private generateHtml(markdownContent: string, filename: string): string {
        const htmlBody = marked(markdownContent);
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename} - Markdown Anywhere</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #24292e;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
            background-color: #fff;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        
        h1 {
            font-size: 2em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
        }
        
        h2 {
            font-size: 1.5em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
        }
        
        pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
        }
        
        code {
            background-color: rgba(27,31,35,0.05);
            border-radius: 3px;
            font-size: 85%;
            margin: 0;
            padding: 0.2em 0.4em;
        }
        
        pre code {
            background-color: transparent;
            border: 0;
            display: inline;
            line-height: inherit;
            margin: 0;
            max-width: auto;
            overflow: visible;
            padding: 0;
            word-wrap: normal;
        }
        
        blockquote {
            border-left: 0.25em solid #dfe2e5;
            color: #6a737d;
            padding: 0 1em;
            margin: 0;
        }
        
        table {
            border-spacing: 0;
            border-collapse: collapse;
            margin-top: 0;
            margin-bottom: 16px;
        }
        
        table th, table td {
            padding: 6px 13px;
            border: 1px solid #dfe2e5;
        }
        
        table th {
            font-weight: 600;
            background-color: #f6f8fa;
        }
        
        img {
            max-width: 100%;
            height: auto;
        }
        
        .auto-refresh-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #28a745;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
        }
        
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #0d1117;
                color: #c9d1d9;
            }
            
            h1, h2 {
                border-bottom-color: #21262d;
            }
            
            pre {
                background-color: #161b22;
            }
            
            code {
                background-color: rgba(110,118,129,0.4);
            }
            
            blockquote {
                border-left-color: #30363d;
                color: #8b949e;
            }
            
            table th, table td {
                border-color: #30363d;
            }
            
            table th {
                background-color: #21262d;
            }
        }
    </style>
    <script>
        let lastModified = Date.now();
        
        function checkForUpdates() {
            fetch('/check-update')
                .then(response => response.json())
                .then(data => {
                    if (data.updated && data.timestamp > lastModified) {
                        lastModified = data.timestamp;
                        window.location.reload();
                    }
                })
                .catch(() => {});
        }
        
        setInterval(checkForUpdates, 1000);
        
        document.addEventListener('DOMContentLoaded', function() {
            const indicator = document.createElement('div');
            indicator.className = 'auto-refresh-indicator';
            indicator.textContent = 'Auto-refresh enabled';
            document.body.appendChild(indicator);
            
            setTimeout(() => {
                indicator.style.opacity = '0.7';
            }, 2000);
        });
    </script>
</head>
<body>
    ${htmlBody}
</body>
</html>`;
    }

    private async createServer(htmlContent: string, port: number): Promise<any> {
        const http = require('http');
        let currentHtml = htmlContent;
        let lastModified = Date.now();
        
        const server = http.createServer((req: any, res: any) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            if (req.url === '/check-update') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    updated: true, 
                    timestamp: lastModified 
                }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(currentHtml);
        });
        
        return new Promise((resolve, reject) => {
            server.listen(port, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    server.updateContent = (newHtml: string) => {
                        currentHtml = newHtml;
                        lastModified = Date.now();
                    };
                    resolve(server);
                }
            });
        });
    }

    private updateRenderedDocument(docKey: string): void {
        const doc = this.renderedDocs.get(docKey);
        if (!doc) return;

        try {
            const markdownContent = fs.readFileSync(doc.uri.fsPath, 'utf8');
            const htmlContent = this.generateHtml(markdownContent, path.basename(doc.uri.fsPath));
            
            doc.server.updateContent(htmlContent);
            doc.htmlContent = htmlContent;
            
        } catch (error) {
            console.error('Failed to update rendered document:', error);
        }
    }

    private closeRenderedDocument(docKey: string): void {
        const doc = this.renderedDocs.get(docKey);
        if (doc) {
            doc.watcher.dispose();
            doc.server.close();
            this.renderedDocs.delete(docKey);
            this.updateStatusBar();
        }
    }

    private getNextPort(): number {
        return this.portCounter++;
    }

    private updateStatusBar(): void {
        const config = vscode.workspace.getConfiguration('markdown-anywhere');
        const showStatusBar = config.get<boolean>('showStatusBar', true);
        
        const count = this.renderedDocs.size;
        if (count === 0 || !showStatusBar) {
            this.statusBarItem.hide();
        } else {
            this.statusBarItem.text = `$(globe) ${count} render${count === 1 ? '' : 's'}`;
            this.statusBarItem.tooltip = `${count} markdown file${count === 1 ? '' : 's'} rendered in browser. Click to manage.`;
            this.statusBarItem.show();
        }
    }

    showActiveRenders(): void {
        if (this.renderedDocs.size === 0) {
            vscode.window.showInformationMessage('No markdown files currently rendered in browser.');
            return;
        }

        const items: vscode.QuickPickItem[] = Array.from(this.renderedDocs.entries()).map(([key, doc]) => ({
            label: `$(file) ${path.basename(doc.uri.fsPath)}`,
            description: `Port ${doc.port}`,
            detail: doc.uri.fsPath,
            key: key
        })) as Array<vscode.QuickPickItem & { key: string }>;

        items.push({
            label: '$(x) Close All Renders',
            description: 'Close all active renders',
            detail: 'Stop all HTTP servers and close all rendered markdown files',
            key: '__close_all__'
        } as vscode.QuickPickItem & { key: string });

        const quickPick = vscode.window.createQuickPick();
        quickPick.items = items;
        quickPick.placeholder = 'Select a render to close, or close all';
        quickPick.canSelectMany = false;

        quickPick.onDidAccept(() => {
            const selected = quickPick.selectedItems[0] as vscode.QuickPickItem & { key: string };
            if (selected) {
                if (selected.key === '__close_all__') {
                    this.closeAllRenders();
                } else {
                    this.closeRenderedDocument(selected.key);
                }
            }
            quickPick.dispose();
        });

        quickPick.show();
    }

    private closeAllRenders(): void {
        const count = this.renderedDocs.size;
        for (const [key] of this.renderedDocs) {
            this.closeRenderedDocument(key);
        }
        vscode.window.showInformationMessage(`Closed ${count} render${count === 1 ? '' : 's'}.`);
    }

    dispose(): void {
        for (const [key, doc] of this.renderedDocs) {
            this.closeRenderedDocument(key);
        }
        this.statusBarItem.dispose();
    }
}

export function activate(context: vscode.ExtensionContext) {
    const renderer = new MarkdownRenderer();
    
    const openInBrowserCommand = vscode.commands.registerCommand(
        'markdown-anywhere.openInBrowser',
        async (uri?: vscode.Uri) => {
            if (!uri) {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document.languageId === 'markdown') {
                    uri = editor.document.uri;
                } else {
                    vscode.window.showErrorMessage('Please select a markdown file');
                    return;
                }
            }
            
            if (path.extname(uri.fsPath) !== '.md') {
                vscode.window.showErrorMessage('Selected file is not a markdown file');
                return;
            }
            
            await renderer.renderMarkdown(uri);
        }
    );

    const showActiveRendersCommand = vscode.commands.registerCommand(
        'markdown-anywhere.showActiveRenders',
        () => {
            renderer.showActiveRenders();
        }
    );
    
    context.subscriptions.push(openInBrowserCommand);
    context.subscriptions.push(showActiveRendersCommand);
    context.subscriptions.push({ dispose: () => renderer.dispose() });
}

export function deactivate() {}