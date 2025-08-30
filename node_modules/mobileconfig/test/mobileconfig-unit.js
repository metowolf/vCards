/* eslint no-unused-vars: 0, no-unused-expressions: 0 */
/* globals expect: false */

'use strict';

const mobileconfig = require('../index');
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const plist = require('plist');
const uuid = require('uuid');

chai.Assertion.includeStack = true;

describe('mobileconfig unit tests', () => {
    describe('#sign', () => {
        it('should sign value', done => {
            let value = 'Hello ŠŽ 👻';
            let options = {
                key: fs.readFileSync(__dirname + '/fixtures/key.pem'),
                cert: fs.readFileSync(__dirname + '/fixtures/cert.pem'),
                hashAlg: 'sha256',
                sigAlg: 'SHA256withRSA',
                signingTime: false
            };

            mobileconfig.sign(value, options, (err, data) => {
                expect(err).to.not.exist;
                expect(data.toString('binary')).to.equal(fs.readFileSync(__dirname + '/fixtures/signed-string.der', 'binary'));
                done();
            });
        });

        it('should return an error', done => {
            let value = 'Hello ŠŽ 👻';
            let options = {
                key: fs.readFileSync(__dirname + '/fixtures/key.pem'),
                cert: fs.readFileSync(__dirname + '/fixtures/key.pem'),
                hashAlg: 'sha256',
                sigAlg: 'SHA256withRSA',
                signingTime: false
            };

            mobileconfig.sign(value, options, (err, data) => {
                expect(err).to.exist;
                expect(data).to.not.exist;
                done();
            });
        });
    });

    describe('#getEmailConfig', () => {
        it('should generate valid plist', () => {
            let options = {
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

                contentUuid: 'abcdef',
                plistUuid: 'ghijklmn'
            };

            let emailConfig = plist.parse(mobileconfig.getEmailConfig(options));

            expect(emailConfig).to.deep.equal({
                PayloadContent: [
                    {
                        EmailAccountDescription: 'Configure your Gmail account',
                        EmailAccountType: 'EmailTypeIMAP',
                        EmailAddress: 'my-email-address@gmail.com',
                        IncomingMailServerAuthentication: 'EmailAuthPassword',
                        IncomingMailServerHostName: 'imap.gmail.com',
                        IncomingMailServerPortNumber: 993,
                        IncomingMailServerUseSSL: true,
                        IncomingMailServerUsername: 'my-email-address@gmail.com',
                        IncomingPassword: 'mypass',
                        OutgoingMailServerAuthentication: 'EmailAuthPassword',
                        OutgoingMailServerHostName: 'smtp.gmail.com',
                        OutgoingMailServerPortNumber: 587,
                        OutgoingMailServerUseSSL: false,
                        OutgoingMailServerUsername: 'my-email-address@gmail.com',
                        OutgoingPasswordSameAsIncomingPassword: true,
                        PayloadDescription: 'Configures email account.',
                        PayloadDisplayName: 'IMAP Config',
                        PayloadIdentifier: 'com.my.company',
                        PayloadOrganization: 'My Company',
                        PayloadType: 'com.apple.mail.managed',
                        PayloadUUID: 'abcdef',
                        PayloadVersion: 1,
                        PreventAppSheet: false,
                        PreventMove: false,
                        SMIMEEnabled: false,
                        allowMailDrop: true
                    }
                ],
                PayloadDescription: 'Install this profile to auto configure your Gmail account',
                PayloadDisplayName: 'My Gmail Account',
                PayloadIdentifier: 'com.my.company',
                PayloadOrganization: 'My Company',
                PayloadRemovalDisallowed: false,
                PayloadType: 'Configuration',
                PayloadUUID: 'ghijklmn',
                PayloadVersion: 1
            });
        });
    });

    describe('#getSignedEmailConfig', () => {
        it('should not return an error', done => {
            let options = {
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

                contentUuid: 'abcdef',
                plistUuid: 'ghijklmn',

                keys: {
                    key: fs.readFileSync(__dirname + '/fixtures/key.pem'),
                    cert: fs.readFileSync(__dirname + '/fixtures/cert.pem'),
                    hashAlg: 'sha256',
                    sigAlg: 'SHA256withRSA',
                    signingTime: false
                }
            };

            mobileconfig.getSignedEmailConfig(options, (err, data) => {
                expect(err).to.not.exist;
                expect(data).to.exist;

                done();
            });
        });
    });

    describe('#getCardDAVConfig', () => {
        it('should generate valid plist', () => {
            let options = {
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

                contentUuid: 'abcdef',
                plistUuid: 'ghijklmn'
            };

            let emailConfig = plist.parse(mobileconfig.getCardDAVConfig(options));

            expect(emailConfig).to.deep.equal({
                PayloadContent: [
                    {
                        CardDAVAccountDescription: 'Configure your contact list',
                        CardDAVPrincipalURL: 'http://localhost:8080/dav/username',
                        CardDAVHostName: 'http://localhost:8080',
                        CardDAVPort: 8080,
                        CardDAVUseSSL: false,
                        CardDAVUsername: 'username@gmail.com',
                        CardDAVPassword: 'mypass',
                        PayloadDescription: 'username@gmail.com contacts',
                        PayloadDisplayName: 'username@gmail.com contacts',
                        PayloadIdentifier: 'com.my.company',
                        PayloadOrganization: 'My Company',
                        PayloadType: 'com.apple.carddav.account',
                        PayloadUUID: 'abcdef',
                        PayloadVersion: 1
                    }
                ],
                PayloadDescription: 'Install this profile to auto configure your contacts',
                PayloadDisplayName: 'My Contacts',
                PayloadIdentifier: 'com.my.company',
                PayloadOrganization: 'My Company',
                PayloadRemovalDisallowed: false,
                PayloadType: 'Configuration',
                PayloadUUID: 'ghijklmn',
                PayloadVersion: 1
            });
        });
    });

    describe('#getCalDAVConfig', () => {
        it('should generate valid plist', () => {
            let options = {
                organization: 'My Company',
                identifier: 'com.my.company',

                displayName: 'My Calendar',
                displayDescription: 'Install this profile to auto configure your calendar',

                accountName: 'CalDAV Config',
                accountDescription: 'Configure your calendar',

                dav: {
                    hostname: 'http://localhost:8080',
                    port: 8080,
                    secure: false,
                    principalurl: 'http://localhost:8080/dav/username',
                    username: 'username@gmail.com',
                    password: 'mypass'
                },

                contentUuid: 'abcdef',
                plistUuid: 'ghijklmn'
            };

            let caldavConfig = plist.parse(mobileconfig.getCalDAVConfig(options));

            expect(caldavConfig).to.deep.equal({
                PayloadContent: [
                    {
                        CalDAVAccountDescription: 'Configure your calendar',
                        CalDAVPrincipalURL: 'http://localhost:8080/dav/username',
                        CalDAVHostName: 'http://localhost:8080',
                        CalDAVPort: 8080,
                        CalDAVUseSSL: false,
                        CalDAVUsername: 'username@gmail.com',
                        CalDAVPassword: 'mypass',
                        PayloadDescription: 'username@gmail.com calendar events',
                        PayloadDisplayName: 'username@gmail.com calendar events',
                        PayloadIdentifier: 'com.my.company',
                        PayloadOrganization: 'My Company',
                        PayloadType: 'com.apple.caldav.account',
                        PayloadUUID: 'abcdef',
                        PayloadVersion: 1
                    }
                ],
                PayloadDescription: 'Install this profile to auto configure your calendar',
                PayloadDisplayName: 'My Calendar',
                PayloadIdentifier: 'com.my.company',
                PayloadOrganization: 'My Company',
                PayloadRemovalDisallowed: false,
                PayloadType: 'Configuration',
                PayloadUUID: 'ghijklmn',
                PayloadVersion: 1
            });
        });
    });

    describe('#getSignedEmailConfig', () => {
        it('should not return an error', done => {
            let options = {
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

                contentUuid: 'abcdef',
                plistUuid: 'ghijklmn',

                keys: {
                    key: fs.readFileSync(__dirname + '/fixtures/key.pem'),
                    cert: fs.readFileSync(__dirname + '/fixtures/cert.pem'),
                    hashAlg: 'sha256',
                    sigAlg: 'SHA256withRSA',
                    signingTime: false
                }
            };

            mobileconfig.getSignedEmailConfig(options, (err, data) => {
                expect(err).to.not.exist;
                expect(data).to.exist;

                done();
            });
        });
    });

    describe('#getSignedConfig', () => {
        it('should generate a config file', done => {
            mobileconfig.getSignedConfig(
                {
                    PayloadType: 'Configuration',
                    PayloadVersion: 1,
                    PayloadIdentifier: 'com.my.company',
                    PayloadUUID: uuid.v4(),
                    PayloadDisplayName: 'My Gmail Account',
                    PayloadDescription: 'Install this profile to auto configure your email account',
                    PayloadOrganization: 'My Company',

                    PayloadContent: {
                        PayloadType: 'com.apple.mail.managed',
                        PayloadVersion: 1,
                        PayloadIdentifier: 'com.my.company',
                        PayloadUUID: uuid.v4(),
                        PayloadDisplayName: 'IMAP Config',
                        PayloadDescription: 'Configures email account',
                        PayloadOrganization: 'My Company',

                        EmailAccountDescription: 'Configure your email account',
                        EmailAccountName: 'John Smith',
                        EmailAccountType: 'EmailTypeIMAP',
                        EmailAddress: 'my-email-address@gmail.com',
                        IncomingMailServerAuthentication: 'EmailAuthPassword',
                        IncomingMailServerHostName: 'imap.gmail.com',
                        IncomingMailServerPortNumber: 993,
                        IncomingMailServerUseSSL: true,
                        IncomingMailServerUsername: 'my-email-address@gmail.com',
                        IncomingPassword: 'verysecret',
                        OutgoingPasswordSameAsIncomingPassword: true,
                        OutgoingMailServerAuthentication: 'EmailAuthPassword',
                        OutgoingMailServerHostName: 'smtp.gmail.com',
                        OutgoingMailServerPortNumber: 587,
                        OutgoingMailServerUseSSL: false,
                        OutgoingMailServerUsername: 'my-email-address@gmail.com',
                        PreventMove: false,
                        PreventAppSheet: false,
                        SMIMEEnabled: false,
                        allowMailDrop: true
                    }
                },
                {
                    key: fs.readFileSync(__dirname + '/fixtures/key.pem'),
                    cert: fs.readFileSync(__dirname + '/fixtures/cert.pem'),
                    hashAlg: 'sha256',
                    sigAlg: 'SHA256withRSA',
                    signingTime: false
                },
                (err, data) => {
                    expect(err).to.not.exist;
                    expect(data).to.exist;
                    done();
                }
            );
        });
    });
});
