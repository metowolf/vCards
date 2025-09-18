vCards JS
=====

[![Build Status](https://travis-ci.org/enesser/vCards-js.svg?branch=master)](https://travis-ci.org/enesser/vCards-js.svg?branch=master)

Create vCards to import contacts into Outlook, iOS, Mac OS, and Android devices from your website or application.

![Screenshot](https://cloud.githubusercontent.com/assets/5659221/5240131/f99c1f3e-78c1-11e4-83b1-4f6e70eecf65.png)

## Install

```sh
npm install vcards-js --save
```

## Usage

Below is a simple example of how to create a basic vCard and how to save it to a file, or view its contents from the console.

### Basic vCard

```js
var vCardsJS = require('vcards-js');

//create a new vCard
var vCard = vCardsJS();

//set properties
vCard.firstName = 'Eric';
vCard.middleName = 'J';
vCard.lastName = 'Nesser';
vCard.organization = 'ACME Corporation';
vCard.photo.attachFromUrl('https://avatars2.githubusercontent.com/u/5659221?v=3&s=460', 'JPEG');
vCard.workPhone = '312-555-1212';
vCard.birthday = new Date(1985, 0, 1);
vCard.title = 'Software Developer';
vCard.url = 'https://github.com/enesser';
vCard.note = 'Notes on Eric';

//save to file
vCard.saveToFile('./eric-nesser.vcf');

//get as formatted string
console.log(vCard.getFormattedString());

```

### On the Web

You can use vCards JS on your website. Below is an example of how to get it working on Express 4.

```js

var express = require('express');
var router = express.Router();

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {

    var vCardsJS = require('vcards-js');

    //create a new vCard
    vCard = vCardsJS();

    //set properties
    vCard.firstName = 'Eric';
    vCard.middleName = 'J';
    vCard.lastName = 'Nesser';
    vCard.organization = 'ACME Corporation';

    //set content-type and disposition including desired filename
    res.set('Content-Type', 'text/vcard; name="enesser.vcf"');
    res.set('Content-Disposition', 'inline; filename="enesser.vcf"');

    //send the response
    res.send(vCard.getFormattedString());
});

```

### Embedding Images

You can embed images in the photo or logo field instead of linking to them from a URL using base64 encoding.

```js
//can be Windows or Linux/Unix path structures, and JPEG, PNG, GIF formats
vCard.photo.embedFromFile('/path/to/file.png');
vCard.logo.embedFromFile('/path/to/file.png');
```

```js
//can also embed images via base-64 encoded strings
vCard.photo.embedFromString('iVBORw0KGgoAAAANSUhEUgAAA2...', 'image/png');
vCard.logo.embedFromString('iVBORw0KGgoAAAANSUhEUgAAA2...', 'image/png');
```

### Date Reference

MDN reference on how to use the `Date` object for birthday and anniversary can be found at [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date).

### Complete Example

The following shows a vCard with everything filled out.

```js
var vCardJS = require('vcards-js');

//create a new vCard
var vCard = vCardsJS();

//set basic properties shown before
vCard.firstName = 'Eric';
vCard.middleName = 'J';
vCard.lastName = 'Nesser';
vCard.uid = '69531f4a-c34d-4a1e-8922-bd38a9476a53';
vCard.organization = 'ACME Corporation';

//link to image
vCard.photo.attachFromUrl('https://avatars2.githubusercontent.com/u/5659221?v=3&s=460', 'JPEG');

//or embed image
vCard.photo.attachFromUrl('/path/to/file.jpeg');

vCard.workPhone = '312-555-1212';
vCard.birthday = new Date(1985, 0, 1);
vCard.title = 'Software Developer';
vCard.url = 'https://github.com/enesser';
vCard.workUrl = 'https://acme-corporation/enesser';
vCard.note = 'Notes on Eric';

//set other vitals
vCard.nickname = 'Scarface';
vCard.namePrefix = 'Mr.';
vCard.nameSuffix = 'JR';
vCard.gender = 'M';
vCard.anniversary = new Date(2004, 0, 1);
vCard.role = 'Software Development';

//set other phone numbers
vCard.homePhone = '312-555-1313';
vCard.cellPhone = '312-555-1414';
vCard.pagerPhone = '312-555-1515';

//set fax/facsimile numbers
vCard.homeFax = '312-555-1616';
vCard.workFax = '312-555-1717';

//set email addresses
vCard.email = 'e.nesser@emailhost.tld';
vCard.workEmail = 'e.nesser@acme-corporation.tld';

//set logo of organization or personal logo (also supports embedding, see above)
vCard.logo.attachFromUrl('https://avatars2.githubusercontent.com/u/5659221?v=3&s=460', 'JPEG');

//set URL where the vCard can be found
vCard.source = 'http://mywebpage/myvcard.vcf';

//set address information
vCard.homeAddress.label = 'Home Address';
vCard.homeAddress.street = '123 Main Street';
vCard.homeAddress.city = 'Chicago';
vCard.homeAddress.stateProvince = 'IL';
vCard.homeAddress.postalCode = '12345';
vCard.homeAddress.countryRegion = 'United States of America';

vCard.workAddress.label = 'Work Address';
vCard.workAddress.street = '123 Corporate Loop\nSuite 500';
vCard.workAddress.city = 'Los Angeles';
vCard.workAddress.stateProvince = 'CA';
vCard.workAddress.postalCode = '54321';
vCard.workAddress.countryRegion = 'United States of America';

//set social media URLs
vCard.socialUrls['facebook'] = 'https://...';
vCard.socialUrls['linkedIn'] = 'https://...';
vCard.socialUrls['twitter'] = 'https://...';
vCard.socialUrls['flickr'] = 'https://...';
vCard.socialUrls['custom'] = 'https://...';

//you can also embed photos from files instead of attaching via URL
vCard.photo.embedFromFile('photo.jpg');
vCard.logo.embedFromFile('logo.jpg');

vCard.version = '3.0'; //can also support 2.1 and 4.0, certain versions only support certain fields

//save to file
vCard.saveToFile('./eric-nesser.vcf');

//get as formatted string
console.log(vCard.getFormattedString());
```

### Multiple Email, Fax, & Phone Examples

`email`, `otherEmail`, `cellPhone`, `pagerPhone`, `homePhone`, `workPhone`, `homeFax`, `workFax`, `otherPhone` all support multiple entries in an array format.

Examples are provided below:

```js
var vCardsJS = require('vcards-js');

//create a new vCard
var vCard = vCardsJS();

//multiple email entry
vCard.email = [
    'e.nesser@emailhost.tld',
    'e.nesser@emailhost2.tld',
    'e.nesser@emailhost3.tld'
];

//multiple cellphone
vCard.cellPhone = [
    '312-555-1414',
    '312-555-1415',
    '312-555-1416'
];

```

### Apple AddressBook Extensions

You can mark as a contact as an organization with the following Apple AddressBook extension property:

```js
    var vCardsJS = require('vcards-js');
    var vCard = vCardsJS();
    vCard.isOrganization = true;
```

## React Native

A React Native version exists here at this repository --
[https://github.com/idxbroker/vCards-js/tree/react-native](https://github.com/idxbroker/vCards-js/tree/react-native)

## Testing

You can run the vCard unit tests via `npm`:

```sh
npm test
```

## Contributions

Contributions are always welcome!

Additional thanks to --
* Tobias Müller ([https://github.com/webdepp](https://github.com/webdepp))
* Julian Krenge ([https://github.com/jkrenge](https://github.com/jkrenge))
* Charlie Hulcher ([https://github.com/c-h-](https://github.com/c-h-))
* Jimmy Tsao ([https://github.com/jimmytsao](https://github.com/jimmytsao))
* Michael Polino ([https://github.com/mplno](https://github.com/mplno))
* Randy Stevens ([https://github.com/RandyStevens](https://github.com/RandyStevens))

## Donations

BTC 18N1g2o1b9u2jNPbSpGHhV6x5xs6Qou3EV

## License
Copyright (c) 2014-2019 Eric J Nesser MIT