/**
 * Mobile Bridge Docs  —  app/docs/mobile/page.js  →  /docs/mobile
 */
const { docsSidebar } = require('../page');

module.exports = function MobileDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Mobile Bridge'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'The Mobile Bridge connects LUNA apps to native iOS and Android APIs — camera, GPS, biometrics, push notifications, and more.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Native API Access'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const bridge = app.bridge;\n\n// Camera\nconst photo = await bridge.camera.capture({ quality: 0.8 });\n\n// Geolocation\nconst location = await bridge.location.getCurrentPosition();\n\n// Biometrics\nconst auth = await bridge.biometrics.authenticate('Confirm payment');\n\n// Push Notifications\nawait bridge.notifications.requestPermission();\nbridge.notifications.onMessage((notification) => {\n  console.log('Received:', notification.title);\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Haptic Feedback'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["bridge.haptic('impact');       // Short tap\nbridge.haptic('notification'); // Success vibration\nbridge.haptic('selection');    // Light selection tap"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Building for Mobile'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["# Build for iOS\nluna build --target mobile --platform ios\n\n# Build for Android\nluna build --target mobile --platform android"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Supported APIs'] },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['Camera & Photo Library'] },
                            { tag: 'li', props: {}, children: ['GPS & Geolocation'] },
                            { tag: 'li', props: {}, children: ['Biometric Authentication (Face ID / Fingerprint)'] },
                            { tag: 'li', props: {}, children: ['Push Notifications'] },
                            { tag: 'li', props: {}, children: ['Haptic Feedback'] },
                            { tag: 'li', props: {}, children: ['Secure Storage (Keychain / Keystore)'] },
                            { tag: 'li', props: {}, children: ['Accelerometer & Gyroscope'] },
                            { tag: 'li', props: {}, children: ['NFC & Bluetooth'] }
                        ]
                    }
                ]
            }
        ]
    };
};
