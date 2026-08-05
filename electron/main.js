const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, '..', 'public', 'vite.svg'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        title: 'DOE - Extrator de Dados',
    });

    // In production, serve the built files via an Express server (for proxy support)
    const server = express();

    // Set up the proxy for /api/doe
    server.use(
        '/api/doe',
        createProxyMiddleware({
            target: 'https://www.diariooficial.rs.gov.br',
            changeOrigin: true,
            pathRewrite: { '^/api/doe': '' },
            secure: false,
        })
    );

    // Serve the built static files
    const distPath = path.join(__dirname, '..', 'dist');
    server.use(express.static(distPath));

    // Fallback to index.html for SPA routing
    server.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });

    // Start server on a random available port
    const listener = server.listen(0, '127.0.0.1', () => {
        const port = listener.address().port;
        console.log(`Server running on http://127.0.0.1:${port}`);
        mainWindow.loadURL(`http://127.0.0.1:${port}`);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        listener.close();
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
