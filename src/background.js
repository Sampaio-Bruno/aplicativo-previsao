/* eslint-disable import/no-extraneous-dependencies */
import {
  app, protocol, BrowserWindow, ipcMain, screen, Menu, MenuItem,
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { join, dirname } from 'path';
import fs from 'fs';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  const win = new BrowserWindow({
    width: parseInt(width * 0.8, 10),
    height: parseInt(height * 0.8, 10),
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
      // for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      webviewTag: true,
    },
  });

  // Remove top menu bar
  win.removeMenu();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.webContents.session.on('will-download', (event, item) => {
    // Set the save path, making Electron not to prompt a save dialog.
    item.setSavePath(join(app.getPath('userData'), 'sipam.csv'));

    item.on('updated', (_event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }
    });
    item.once('done', (_event, state) => {
      if (state === 'completed') {
        console.log('Download successfully');
        win.webContents.send('download', 'end');
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });

  ipcMain.on('toogle-devtools', async () => {
    win.webContents.toggleDevTools();
  });

  ipcMain.handle('clear-cookies', async () => win.webContents.session.clearStorageData({ storages: ['cookies'] }));

  win.webContents.on('context-menu', (event, params) => {
    const { selectionText, isEditable } = params;
    let menu;

    if (isEditable) {
      menu = Menu.buildFromTemplate([
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
      ]);
    } else if (selectionText && selectionText.trim() !== '') {
      menu = Menu.buildFromTemplate([{ role: 'copy', label: 'Copiar' }]);
    }

    // Add each spelling suggestion
    if (params.dictionarySuggestions.length > 0) {
      menu.append(new MenuItem({ type: 'separator' }));
      // eslint-disable-next-line no-restricted-syntax
      for (const suggestion of params.dictionarySuggestions) {
        menu.append(
          new MenuItem({
            label: suggestion,
            click: () => win.webContents.replaceMisspelling(suggestion),
          }),
        );
      }
    }

    // Allow users to add the misspelled word to the dictionary
    if (params.misspelledWord) {
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(
        new MenuItem({
          label: 'Adicionar ao dicionário',
          // eslint-disable-next-line max-len
          click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
        }),
      );
    }
    menu.popup();
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

// eslint-disable-next-line consistent-return
ipcMain.handle('read-file', async (event, file, charset) => {
  const path = join(app.getPath('userData'), file);
  if (!fs.existsSync(path)) throw new Error('Arquivo não encontrado');
  const fileContent = await fs.promises.readFile(path, charset);
  return fileContent;
});

ipcMain.handle('write-file', async (event, file, data) => {
  const path = join(app.getPath('userData'), file);
  const dir = dirname(path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.accessSync(dir, fs.constants.W_OK);
  await fs.promises.writeFile(path, JSON.stringify(data));
});

ipcMain.handle('remove-file', async (event, file) => {
  const path = join(app.getPath('userData'), file);
  if (fs.existsSync(path)) {
    return fs.unlinkSync(path);
  }
  throw new Error(`Arquivo ${file} não encontrado`);
});

ipcMain.handle('read-dir', async (event, dir) => {
  const path = join(app.getPath('userData'), dir);
  if (!fs.existsSync(path)) throw new Error('Diretório não encontrado');
  const files = await fs.promises.readdir(path);
  return files;
});
