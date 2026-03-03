/**
 * Desktop Shell Docs  —  app/docs/desktop/page.js  →  /docs/desktop
 */
const { docsSidebar } = require('../page');

module.exports = function DesktopDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Desktop Shell'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'Build native desktop applications with LUNA. The Desktop Shell provides window management, system tray, menus, dialogs, and native OS integration.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Window Management'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const shell = app.shell;\n\nconst win = shell.createWindow({\n  title: 'My App',\n  width: 1200,\n  height: 800,\n  frame: true,\n  resizable: true,\n  minWidth: 400,\n  minHeight: 300\n});\n\nwin.maximize();\nwin.setAlwaysOnTop(true);"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['System Tray'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["shell.tray.create({\n  icon: './assets/tray-icon.png',\n  tooltip: 'My LUNA App',\n  menu: [\n    { label: 'Show', click: () => win.show() },\n    { label: 'Quit', click: () => app.quit() }\n  ]\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Native Menus'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["shell.menu.set([\n  {\n    label: 'File',\n    submenu: [\n      { label: 'New', accelerator: 'CmdOrCtrl+N', click: onNew },\n      { label: 'Open', accelerator: 'CmdOrCtrl+O', click: onOpen },\n      { type: 'separator' },\n      { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }\n    ]\n  }\n]);"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Notifications & Dialogs'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["// OS notification\nshell.notify('Build complete', { body: 'Your app is ready.' });\n\n// File dialog\nconst path = await shell.dialog.open({\n  filters: [{ name: 'Images', extensions: ['png', 'jpg'] }]\n});\n\n// Message box\nconst result = await shell.dialog.message({\n  type: 'question',\n  title: 'Confirm',\n  message: 'Save changes?',\n  buttons: ['Save', 'Discard', 'Cancel']\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Building'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["# Build desktop app\nluna build --target desktop\n\n# Platform-specific\nluna build --target desktop --platform macos\nluna build --target desktop --platform windows\nluna build --target desktop --platform linux"] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
