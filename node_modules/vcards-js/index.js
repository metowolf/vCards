/********************************************************************************
    vCards-js, Eric J Nesser, November 2014
********************************************************************************/
/*jslint node: true */
'use strict';

/**
 * Represents a contact that can be imported into Outlook, iOS, Mac OS, Android devices, and more
 */
var vCard = (function () {
    /**
     * Get photo object for storing photos in vCards
     */
    function getPhoto() {
        return {
            url: '',
            mediaType: '',
            base64: false,

            /**
             * Attach a photo from a URL
             * @param  {string} url       URL where photo can be found
             * @param  {string} mediaType Media type of photo (JPEG, PNG, GIF)
             */
            attachFromUrl: function(url, mediaType) {
                this.url = url;
                this.mediaType = mediaType;
                this.base64 = false;
            },

            /**
             * Embed a photo from a file using base-64 encoding (not implemented yet)
             * @param  {string} filename
             */
            embedFromFile: function(fileLocation) {
              var fs   = require('fs');
              var path = require('path');
              this.mediaType = path.extname(fileLocation).toUpperCase().replace(/\./g, "");
              var imgData = fs.readFileSync(fileLocation);
              this.url = imgData.toString('base64');
              this.base64 = true;
            },

            /**
             * Embed a photo from a base-64 string
             * @param  {string} base64String
             */
            embedFromString: function(base64String, mediaType) {
              this.mediaType = mediaType;
              this.url = base64String;
              this.base64 = true;
            }
        };
    }

    /**
     * Get a mailing address to attach to a vCard.
     */
    function getMailingAddress() {
        return {
            /**
             * Represents the actual text that should be put on the mailing label when delivering a physical package
             * @type {String}
             */
            label: '',

            /**
             * Street address
             * @type {String}
             */
            street: '',

            /**
             * City
             * @type {String}
             */
            city: '',

            /**
             * State or province
             * @type {String}
             */
            stateProvince: '',

            /**
             * Postal code
             * @type {String}
             */
            postalCode: '',

            /**
             * Country or region
             * @type {String}
             */
            countryRegion: ''
        };
    }

    /**
     * Get social media URLs
     * @return {object} Social media URL hash group
     */
    function getSocialUrls() {
        return {
            'facebook': '',
            'linkedIn': '',
            'twitter': '',
            'flickr': ''
        };
    }

    /********************************************************************************
     * Public interface for vCard
     ********************************************************************************/
    return {

        /**
         * Specifies a value that represents a persistent, globally unique identifier associated with the vCard
         * @type {String}
         */
        uid: '',

        /**
         * Date of birth
         * @type {Datetime}
         */
        birthday: '',

        /**
         * Cell phone number
         * @type {String}
         */
        cellPhone: '',

        /**
         * Other cell phone number or pager
         * @type {String}
         */
        pagerPhone: '',

        /**
         * The address for private electronic mail communication
         * @type {String}
         */
        email: '',

        /**
         * The address for work-related electronic mail communication
         * @type {String}
         */
        workEmail: '',

        /**
         * First name
         * @type {String}
         */
        firstName: '',

        /**
         * Formatted name string associated with the vCard object (will automatically populate if not set)
         * @type {String}
         */
        formattedName: '',

        /**
         * Gender.
         * @type {String} Must be M or F for Male or Female
         */
        gender: '',

        /**
         * Home mailing address
         * @type {object}
         */
        homeAddress: getMailingAddress(),

        /**
         * Home phone
         * @type {String}
         */
        homePhone: '',

        /**
         * Home facsimile
         * @type {String}
         */
        homeFax: '',

        /**
         * Last name
         * @type {String}
         */
        lastName: '',

        /**
         * Logo
         * @type {object}
         */
        logo: getPhoto(),

        /**
         * Middle name
         * @type {String}
         */
        middleName: '',

        /**
         * Prefix for individual's name
         * @type {String}
         */
        namePrefix: '',

        /**
         * Suffix for individual's name
         * @type {String}
         */
        nameSuffix: '',

        /**
         * Nickname of individual
         * @type {String}
         */
        nickname: '',

        /**
         * Specifies supplemental information or a comment that is associated with the vCard
         * @type {String}
         */
        note: '',

        /**
         * The name and optionally the unit(s) of the organization associated with the vCard object
         * @type {String}
         */
        organization: '',

        /**
         * Individual's photo
         * @type {object}
         */
        photo: getPhoto(),

        /**
         * The role, occupation, or business category of the vCard object within an organization
         * @type {String}
         */
        role: '',

        /**
         * Social URLs attached to the vCard object (ex: Facebook, Twitter, LinkedIn)
         * @type {String}
         */
        socialUrls: getSocialUrls(),

        /**
         * A URL that can be used to get the latest version of this vCard
         * @type {String}
         */
        source: '',

        /**
         * Specifies the job title, functional position or function of the individual within an organization
         * @type {String}
         */
        title: '',

        /**
         * URL pointing to a website that represents the person in some way
         * @type {String}
         */
        url: '',

        /**
         * URL pointing to a website that represents the person's work in some way
         * @type {String}
         */
        workUrl: '',

        /**
         * Work mailing address
         * @type {object}
         */
        workAddress: getMailingAddress(),

        /**
         * Work phone
         * @type {String}
         */
        workPhone: '',

        /**
         * Work facsimile
         * @type {String}
         */
        workFax: '',

        /**
         * vCard version
         * @type {String}
         */
        version: '3.0',

        /**
         * Get major version of the vCard format
         * @return {integer}
         */
        getMajorVersion: function() {
            var majorVersionString = this.version ? this.version.split('.')[0] : '4';
            if (!isNaN(majorVersionString)) {
                return parseInt(majorVersionString);
            }
            return 4;
        },

        /**
         * Get formatted vCard
         * @return {String} Formatted vCard in VCF format
         */
        getFormattedString: function() {
            var vCardFormatter = require('./lib/vCardFormatter');
            return vCardFormatter.getFormattedString(this);
        },

        /**
         * Save formatted vCard to file
         * @param  {String} filename
         */
        saveToFile: function(filename) {
            var vCardFormatter = require('./lib/vCardFormatter');
            var contents = vCardFormatter.getFormattedString(this);

            var fs = require('fs');
            fs.writeFileSync(filename, contents, { encoding: 'utf8' });
        }
    };
});

module.exports = vCard;
