'use strict';

// Usage:
// node imap.js > account.mobileconfig

const mobileconfig = require('../index');
const fs = require('fs');

mobileconfig.getSignedEmailConfig(
    {
        emailAddress: 'my-email-address@gmail.com',

        organization: 'My Company',
        identifier: 'com.my.company',

        displayName: 'My Gmail Account',
        displayDescription: 'Install this profile to auto configure your Gmail account',

        accountName: 'IMAP Config',
        accountDescription: 'Configure your Gmail account',

        imap: {
            hostname: 'imap.gmail.com',
            port: 993,
            secure: true,
            username: 'my-email-address@gmail.com',
            password: 'mypass'
        },

        smtp: {
            hostname: 'smtp.gmail.com',
            port: 587,
            secure: false,
            username: 'my-email-address@gmail.com',
            password: false // use the same password as for IMAP
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
