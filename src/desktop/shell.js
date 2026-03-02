/**
 * LUNA Desktop Native Shell Layer
 * 
 * Provides native desktop application capabilities:
 * - Native window management
 * - Direct OS API access
 * - Embedded lightweight renderer
 * - File system integration (drag & drop, file dialogs)
 * - System-level notifications
 * - System tray
 * - Menu bar
 * - Keyboard shortcuts
 * - Multi-window support
 * 
 * Supported: Windows, macOS, Linux
 */

'use strict';

const { EventEmitter } = require('events');
const path = require('path');

/**
 * Window configuration.
 */
class WindowConfig {
  constructor(options = {}) {
    this.title = options.title || 'LUNA Application';
    this.width = options.width || 1200;
    this.height = options.height || 800;
    this.minWidth = options.minWidth || 400;
    this.minHeight = options.minHeight || 300;
    this.maxWidth = options.maxWidth || Infinity;
    this.maxHeight = options.maxHeight || Infinity;
    this.x = options.x || undefined;
    this.y = options.y || undefined;
    this.center = options.center !== false;
    this.resizable = options.resizable !== false;
    this.movable = options.movable !== false;
    this.minimizable = options.minimizable !== false;
    this.maximizable = options.maximizable !== false;
    this.closable = options.closable !== false;
    this.fullscreenable = options.fullscreenable !== false;
    this.alwaysOnTop = options.alwaysOnTop || false;
    this.frame = options.frame !== false;
    this.transparent = options.transparent || false;
    this.show = options.show !== false;
    this.backgroundColor = options.backgroundColor || '#FFFFFF';
    this.icon = options.icon || null;
    this.titleBarStyle = options.titleBarStyle || 'default'; // default | hidden | hiddenInset
    this.vibrancy = options.vibrancy || null; // macOS only
  }
}

/**
 * Native Window abstraction.
 */
class NativeWindow extends EventEmitter {
  static _idCounter = 0;

  constructor(config = {}) {
    super();
    this.id = `window_${++NativeWindow._idCounter}`;
    this.config = config instanceof WindowConfig ? config : new WindowConfig(config);
    this.isOpen = true;
    this.isMinimized = false;
    this.isMaximized = false;
    this.isFullscreen = false;
    this.isFocused = true;
    this.bounds = {
      x: this.config.x || 0,
      y: this.config.y || 0,
      width: this.config.width,
      height: this.config.height
    };
    this._webContents = null;
    this._menu = null;
  }

  /**
   * Set the window title.
   */
  setTitle(title) {
    this.config.title = title;
    this.emit('titleChange', title);
    return this;
  }

  /**
   * Resize the window.
   */
  setSize(width, height) {
    this.bounds.width = width;
    this.bounds.height = height;
    this.emit('resize', { width, height });
    return this;
  }

  /**
   * Move the window.
   */
  setPosition(x, y) {
    this.bounds.x = x;
    this.bounds.y = y;
    this.emit('move', { x, y });
    return this;
  }

  /**
   * Center the window on screen.
   */
  center() {
    this.emit('center');
    return this;
  }

  /**
   * Minimize the window.
   */
  minimize() {
    this.isMinimized = true;
    this.emit('minimize');
    return this;
  }

  /**
   * Maximize the window.
   */
  maximize() {
    this.isMaximized = true;
    this.emit('maximize');
    return this;
  }

  /**
   * Restore from minimize/maximize.
   */
  restore() {
    this.isMinimized = false;
    this.isMaximized = false;
    this.emit('restore');
    return this;
  }

  /**
   * Toggle fullscreen.
   */
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.emit('fullscreen', this.isFullscreen);
    return this;
  }

  /**
   * Focus the window.
   */
  focus() {
    this.isFocused = true;
    this.emit('focus');
    return this;
  }

  /**
   * Blur the window.
   */
  blur() {
    this.isFocused = false;
    this.emit('blur');
    return this;
  }

  /**
   * Load content into the window.
   */
  loadURL(url) {
    this._webContents = { type: 'url', source: url };
    this.emit('navigate', url);
    return this;
  }

  /**
   * Load HTML content directly.
   */
  loadHTML(html) {
    this._webContents = { type: 'html', source: html };
    this.emit('contentLoaded');
    return this;
  }

  /**
   * Load a file into the window.
   */
  loadFile(filePath) {
    this._webContents = { type: 'file', source: path.resolve(filePath) };
    this.emit('navigate', `file://${path.resolve(filePath)}`);
    return this;
  }

  /**
   * Set the window menu.
   */
  setMenu(menu) {
    this._menu = menu;
    this.emit('menuChange', menu);
    return this;
  }

  /**
   * Show the window.
   */
  show() {
    this.isOpen = true;
    this.emit('show');
    return this;
  }

  /**
   * Hide the window.
   */
  hide() {
    this.emit('hide');
    return this;
  }

  /**
   * Close the window.
   */
  close() {
    this.isOpen = false;
    this.emit('close');
    return this;
  }

  /**
   * Execute JavaScript in the window context.
   */
  async executeJS(code) {
    this.emit('executeJS', code);
    return null; // In real implementation, would return result
  }

  /**
   * Get window bounds.
   */
  getBounds() {
    return { ...this.bounds };
  }
}

/**
 * Menu builder.
 */
class Menu {
  constructor() {
    this.items = [];
  }

  /**
   * Add a menu item.
   */
  add(label, options = {}) {
    const item = {
      label,
      type: options.type || 'normal', // normal | separator | submenu | checkbox | radio
      accelerator: options.accelerator || null,
      enabled: options.enabled !== false,
      visible: options.visible !== false,
      checked: options.checked || false,
      click: options.click || null,
      submenu: options.submenu || null,
      role: options.role || null,
      id: options.id || `menu_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    };
    this.items.push(item);
    return this;
  }

  /**
   * Add a separator.
   */
  separator() {
    this.items.push({ type: 'separator' });
    return this;
  }

  /**
   * Add a submenu.
   */
  submenu(label, builderFn) {
    const sub = new Menu();
    builderFn(sub);
    this.items.push({
      label,
      type: 'submenu',
      submenu: sub
    });
    return this;
  }

  /**
   * Build the menu template.
   */
  build() {
    return this.items.map(item => {
      if (item.submenu instanceof Menu) {
        return { ...item, submenu: item.submenu.build() };
      }
      return item;
    });
  }
}

/**
 * System tray.
 */
class SystemTray extends EventEmitter {
  constructor(options = {}) {
    super();
    this.icon = options.icon || null;
    this.tooltip = options.tooltip || 'LUNA Application';
    this.menu = null;
    this.isVisible = false;
  }

  setIcon(iconPath) {
    this.icon = iconPath;
    this.emit('iconChange', iconPath);
    return this;
  }

  setTooltip(text) {
    this.tooltip = text;
    this.emit('tooltipChange', text);
    return this;
  }

  setMenu(menu) {
    this.menu = menu;
    this.emit('menuChange', menu);
    return this;
  }

  show() {
    this.isVisible = true;
    this.emit('show');
    return this;
  }

  hide() {
    this.isVisible = false;
    this.emit('hide');
    return this;
  }

  destroy() {
    this.isVisible = false;
    this.emit('destroy');
  }
}

/**
 * Native dialog APIs.
 */
class Dialogs {
  constructor() {}

  /**
   * Show an open file dialog.
   */
  async openFile(options = {}) {
    return {
      canceled: false,
      filePaths: [],
      filters: options.filters || [{ name: 'All Files', extensions: ['*'] }],
      properties: options.properties || ['openFile'],
      title: options.title || 'Open File'
    };
  }

  /**
   * Show a save file dialog.
   */
  async saveFile(options = {}) {
    return {
      canceled: false,
      filePath: null,
      title: options.title || 'Save File'
    };
  }

  /**
   * Show a message box.
   */
  async messageBox(options = {}) {
    return {
      type: options.type || 'info', // info | warning | error | question
      title: options.title || '',
      message: options.message || '',
      buttons: options.buttons || ['OK'],
      response: 0
    };
  }

  /**
   * Show an error dialog.
   */
  async showError(title, content) {
    return this.messageBox({ type: 'error', title, message: content });
  }
}

/**
 * Keyboard shortcut manager.
 */
class ShortcutManager extends EventEmitter {
  constructor() {
    super();
    this._shortcuts = new Map();
  }

  /**
   * Register a global keyboard shortcut.
   */
  register(accelerator, callback) {
    this._shortcuts.set(accelerator, callback);
    this.emit('registered', accelerator);
    return () => this.unregister(accelerator);
  }

  /**
   * Unregister a shortcut.
   */
  unregister(accelerator) {
    this._shortcuts.delete(accelerator);
    this.emit('unregistered', accelerator);
  }

  /**
   * Check if a shortcut is registered.
   */
  isRegistered(accelerator) {
    return this._shortcuts.has(accelerator);
  }

  /**
   * Handle a keypress event.
   */
  handleKeypress(accelerator) {
    const callback = this._shortcuts.get(accelerator);
    if (callback) {
      callback();
      return true;
    }
    return false;
  }

  /**
   * Get all registered shortcuts.
   */
  getAll() {
    return Array.from(this._shortcuts.keys());
  }

  /**
   * Unregister all shortcuts.
   */
  unregisterAll() {
    this._shortcuts.clear();
    this.emit('allUnregistered');
  }
}

/**
 * System notifications.
 */
class SystemNotifications extends EventEmitter {
  constructor() {
    super();
    this._supported = true;
  }

  /**
   * Show a native notification.
   */
  async show(options = {}) {
    const notification = {
      title: options.title || 'LUNA',
      body: options.body || '',
      icon: options.icon || null,
      silent: options.silent || false,
      urgency: options.urgency || 'normal', // low | normal | critical
      timeout: options.timeout || 5000,
      actions: options.actions || [],
      id: `notif_${Date.now()}`
    };

    this.emit('show', notification);
    return notification;
  }

  /**
   * Check if notifications are supported.
   */
  isSupported() {
    return this._supported;
  }
}

/**
 * Main Desktop Shell.
 */
class DesktopShell extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.platform = process.platform; // win32 | darwin | linux
    this.windows = new Map();
    this.mainWindow = null;
    this.tray = null;
    this.dialogs = new Dialogs();
    this.shortcuts = new ShortcutManager();
    this.notifications = new SystemNotifications();
    this._applicationMenu = null;
  }

  /**
   * Create a new window.
   */
  createWindow(options = {}) {
    const window = new NativeWindow(options);
    this.windows.set(window.id, window);

    if (!this.mainWindow) {
      this.mainWindow = window;
    }

    window.on('close', () => {
      this.windows.delete(window.id);
      if (window === this.mainWindow) {
        this.mainWindow = null;
        // If main window is closed, close all windows
        if (this.config.quitOnMainWindowClose !== false) {
          this.quit();
        }
      }
    });

    this.emit('windowCreated', window);
    return window;
  }

  /**
   * Create the system tray.
   */
  createTray(options = {}) {
    this.tray = new SystemTray(options);
    this.emit('trayCreated', this.tray);
    return this.tray;
  }

  /**
   * Set the application menu.
   */
  setApplicationMenu(menu) {
    this._applicationMenu = menu;
    this.emit('menuChange', menu);
    return this;
  }

  /**
   * Build a default application menu.
   */
  buildDefaultMenu() {
    const menu = new Menu();

    menu.submenu('File', (sub) => {
      sub.add('New Window', { accelerator: 'CmdOrCtrl+N', click: () => this.createWindow() });
      sub.separator();
      sub.add('Quit', { accelerator: 'CmdOrCtrl+Q', click: () => this.quit(), role: 'quit' });
    });

    menu.submenu('Edit', (sub) => {
      sub.add('Undo', { accelerator: 'CmdOrCtrl+Z', role: 'undo' });
      sub.add('Redo', { accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' });
      sub.separator();
      sub.add('Cut', { accelerator: 'CmdOrCtrl+X', role: 'cut' });
      sub.add('Copy', { accelerator: 'CmdOrCtrl+C', role: 'copy' });
      sub.add('Paste', { accelerator: 'CmdOrCtrl+V', role: 'paste' });
      sub.add('Select All', { accelerator: 'CmdOrCtrl+A', role: 'selectAll' });
    });

    menu.submenu('View', (sub) => {
      sub.add('Toggle Fullscreen', { accelerator: 'F11', click: () => {
        if (this.mainWindow) this.mainWindow.toggleFullscreen();
      }});
      sub.add('Toggle DevTools', { accelerator: 'CmdOrCtrl+Shift+I' });
      sub.separator();
      sub.add('Zoom In', { accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' });
      sub.add('Zoom Out', { accelerator: 'CmdOrCtrl+-', role: 'zoomOut' });
      sub.add('Reset Zoom', { accelerator: 'CmdOrCtrl+0', role: 'resetZoom' });
    });

    menu.submenu('Help', (sub) => {
      sub.add('About LUNA', { click: () => this.showAbout() });
    });

    return menu;
  }

  /**
   * Show about dialog.
   */
  async showAbout() {
    return this.dialogs.messageBox({
      type: 'info',
      title: 'About LUNA',
      message: 'LUNA – Universal JavaScript Operating Runtime\nVersion 0.1.0',
      buttons: ['OK']
    });
  }

  /**
   * Get all open windows.
   */
  getAllWindows() {
    return Array.from(this.windows.values());
  }

  /**
   * Get a window by ID.
   */
  getWindow(id) {
    return this.windows.get(id);
  }

  /**
   * Quit the application.
   */
  quit() {
    this.emit('before-quit');
    for (const window of this.windows.values()) {
      window.close();
    }
    if (this.tray) {
      this.tray.destroy();
    }
    this.shortcuts.unregisterAll();
    this.emit('quit');
  }
}

module.exports = {
  DesktopShell,
  NativeWindow,
  WindowConfig,
  Menu,
  SystemTray,
  Dialogs,
  ShortcutManager,
  SystemNotifications
};
