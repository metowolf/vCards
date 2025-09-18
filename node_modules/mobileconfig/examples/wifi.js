'use strict';

// Usage:
// node wifi.js > wifi.mobileconfig

const mobileconfig = require('../index');
const fs = require('fs');

mobileconfig.getSignedWifiConfig(
    {
        organization: 'Some Company',
        displayName: 'My WiFi Network',
        wifi: {
            encryptionType: 'WPA',
            ssid: 'Some SSID',
            password: 'VerySecretPassword'
        },
        keys: {
            key: fs.readFileSync(__dirname + '/../test/fixtures/key.pem'),
            cert: fs.readFileSync(__dirname + '/../test/fixtures/cert.pem'),
            ca: []
        }
    },
    (err, data) => {
        if (err) {
            process.stderr.write(err.stack);
            return process.exit(1);
        }
        process.stdout.write(data);
    }
);
