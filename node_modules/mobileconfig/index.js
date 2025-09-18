'use strict';

const jsrsasign = require('jsrsasign');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const uuid = require('uuid');
const plist = require('plist');

const templates = {
    imap: Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'imap.plist'), 'utf-8')),
    carddav: Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'carddav.plist'), 'utf-8')),
    caldav: Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'caldav.plist'), 'utf-8')),
    wifi: Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'wifi.plist'), 'utf-8'))
};

module.exports = {
    sign(value, options, callback) {
        options = options || {};

        let certs = [];
        []
            .concat(options.cert || [])
            .concat(options.ca || [])
            .map(ca => {
                ca = (ca || '').toString().trim().split('END CERTIFICATE-----');
                ca.pop();
                ca.forEach(ca => {
                    ca += 'END CERTIFICATE-----';
                    certs.push(ca.trim());
                });
                return ca;
            });

        certs = certs.reverse();

        //let pem;
        let der;
        let params = {
            content: {
                // the signed content needs to be a normal unicode string
                str: (value || '').toString('utf-8')
            },

            // join ca certs with signer cert into single array and ensure the values are strings, not Buffer object
            certs,

            signerInfos: [
                {
                    // sha256, sha512, sha384, sha224, sha1, md5, ripemd160
                    hashAlg: options.hashAlg || 'sha256',

                    // If signingTime is true, add SigingTime signed attribute
                    sAttr: options.signingTime
                        ? {
                              SigningTime: {}
                          }
                        : {},

                    signerCert: certs[certs.length - 1],
                    signerPrvKey: (options.key || '').toString(),

                    // SHA256withRSA, SHA512withRSA, SHA384withRSA, SHA224withRSA, SHA1withRSA,MD5withRSA
                    // RIPEMD160withRSA, SHA256withECDSA, SHA512withECDSA, SHA384withECDSA, SHA224withECDSA, SHA1withECDSA
                    // SHA256withSA, SHA512withSA, SHA384withSA, SHA224withSA, SHA1withDSA
                    sigAlg: options.sigAlg || 'SHA256withRSA'
                }
            ]
        };

        try {
            der = Buffer.from(jsrsasign.asn1.cms.CMSUtil.newSignedData(params).getContentInfoEncodedHex(), 'hex');
            //console.log(jsrsasign.KEYUTIL);
            //der = new Buffer(jsrsasign.KEYUTIL.getHexFromPEM(pem, 'CMS'), 'hex');
        } catch (E) {
            return setImmediate(() => {
                callback(E);
            });
        }

        return setImmediate(() => {
            callback(null, der);
        });
    },

    getEmailConfig(options, callback) {
        let imap = options.imap || {};
        let smtp = options.smtp || {};

        let data = {
            emailAddress: options.emailAddress || 'admin@localhost',

            organization: options.organization || false,
            identifier: options.identifier || 'com.kreata.anonymous',

            displayName: options.displayName || 'Mail Account',
            displayDescription: options.displayDescription,

            accountName: options.accountName || 'IMAP Account',
            accountDescription: options.accountDescription || false,

            emailAccountName: options.emailAccountName || false,

            imap: {
                hostname: imap.hostname || 'localhost',
                port: imap.port || (imap.secure ? 993 : 143),
                secure: imap.hasOwnProperty('secure') ? !!imap.secure : imap.port === 993,
                username: imap.username || options.emailAddress || 'anonymous',
                password: imap.password || ''
            },

            smtp: {
                hostname: smtp.hostname || 'localhost',
                port: smtp.port || (smtp.secure ? 465 : 587),
                secure: smtp.hasOwnProperty('secure') ? !!smtp.secure : smtp.port === 465,
                username: smtp.username || false,
                password: smtp.password || false
            },

            contentUuid: options.contentUuid || uuid.v4(),
            plistUuid: options.plistUuid || uuid.v4()
        };

        if (callback) {
            callback(null, templates.imap(data));
            return;
        }

        return templates.imap(data);
    },

    getSignedEmailConfig(options, callback) {
        options = options || {};

        let plistFile;

        try {
            plistFile = module.exports.getEmailConfig(options);
        } catch (E) {
            return callback(E);
        }

        return module.exports.sign(plistFile, options.keys, callback);
    },

    getCardDAVConfig(options, callback) {
        let dav = options.dav || {};

        let data = {
            emailAddress: options.emailAddress || 'admin@localhost',

            organization: options.organization || false,
            identifier: options.identifier || 'com.kreata.anonymous',

            displayName: options.displayName || 'Mail Account',
            displayDescription: options.displayDescription,

            accountName: options.accountName || 'CardDAV Account',
            accountDescription: options.accountDescription || false,

            dav: {
                hostname: dav.hostname || 'localhost',
                port: dav.port || (dav.secure ? 443 : 80),
                principalurl: dav.principalurl || '',
                secure: dav.hasOwnProperty('secure') ? !!dav.secure : dav.port === 80,
                username: dav.username || options.emailAddress || 'anonymous',
                password: dav.password || ''
            },

            contentUuid: options.contentUuid || uuid.v4(),
            plistUuid: options.plistUuid || uuid.v4()
        };

        if (callback) {
            callback(null, templates.carddav(data));
            return;
        }

        return templates.carddav(data);
    },

    getSignedCardDAVConfig(options, callback) {
        options = options || {};

        let plistFile;

        try {
            plistFile = module.exports.getCardDAVConfig(options);
        } catch (E) {
            return callback(E);
        }

        return module.exports.sign(plistFile, options.keys, callback);
    },

    getCalDAVConfig(options, callback) {
        let dav = options.dav || {};

        let data = {
            emailAddress: options.emailAddress || 'admin@localhost',

            organization: options.organization || false,
            identifier: options.identifier || 'com.kreata.anonymous',

            displayName: options.displayName || 'Calendar Account',
            displayDescription: options.displayDescription,

            accountName: options.accountName || 'CalDAV Account',
            accountDescription: options.accountDescription || false,

            dav: {
                hostname: dav.hostname || 'localhost',
                port: dav.port || (dav.secure ? 443 : 80),
                principalurl: dav.principalurl || '',
                secure: dav.hasOwnProperty('secure') ? !!dav.secure : dav.port === 80,
                username: dav.username || options.emailAddress || 'anonymous',
                password: dav.password || ''
            },

            contentUuid: options.contentUuid || uuid.v4(),
            plistUuid: options.plistUuid || uuid.v4()
        };

        if (callback) {
            callback(null, templates.caldav(data));
            return;
        }

        return templates.caldav(data);
    },

    getSignedCalDAVConfig(options, callback) {
        options = options || {};

        let plistFile;

        try {
            plistFile = module.exports.getCalDAVConfig(options);
        } catch (E) {
            return callback(E);
        }

        return module.exports.sign(plistFile, options.keys, callback);
    },

    getWifiConfig(options, callback) {
        options = options || {};
        let data = {
            displayName: options.displayName,
            encryptionType: options.wifi.encryptionType,
            ssid: options.wifi.ssid,
            password: options.wifi.password,
            organization: options.organization || false,
            contentUuid: options.contentUuid || uuid.v4(),
            plistUuid: options.plistUuid || uuid.v4()
        };

        if (callback) {
            callback(null, templates.wifi(data));
            return;
        }

        return templates.wifi(data);
    },

    getSignedWifiConfig(options, callback) {
        options = options || {};

        let plistFile;

        try {
            plistFile = module.exports.getWifiConfig(options);
        } catch (E) {
            return callback(E);
        }

        return module.exports.sign(plistFile, options.keys, callback);
    },

    getSignedConfig(plistData, keys, callback) {
        plistData = plistData || [];

        let plistFile;

        try {
            plistFile = plist.build(plistData);
        } catch (E) {
            return callback(E);
        }

        return module.exports.sign(plistFile, keys, callback);
    }
};
