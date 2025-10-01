'use strict';

// Usage:
// node carddav.js > contact.mobileconfig

const mobileconfig = require('../index');
const fs = require('fs');

mobileconfig.getCardDAVConfig(
    {
        organization: 'My Company',
        identifier: 'com.my.company',

        displayName: 'My Contacts',
        displayDescription: 'Install this profile to auto configure your contacts',

        accountName: 'CardDAV Config',
        accountDescription: 'Configure your contact list',

        dav: {
            hostname: 'http://localhost:8080',
            port: 8080,
            secure: false,
            principalurl: 'http://localhost:8080/dav/username',
            username: 'username@gmail.com',
            password: 'mypass'
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
