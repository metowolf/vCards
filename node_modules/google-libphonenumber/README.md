# google-libphonenumber

The up-to-date and reliable Google's libphonenumber package for node.js. Zero dependencies.

## Status

[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![install size][packagephobia-image]][packagephobia-url]

## Introduction

Google's [libphonenumber](https://github.com/googlei18n/libphonenumber) is a library that parses, formats, stores and validates international phone numbers. It is used by Android since version 4.0 and is a phenomenal repository of carrier metadata.

Although it compiles down to Java, C++ and JS, its JS port is tightly coupled to the Google Closure library. This makes it more difficult to directly require and use the code on a node.js project.

Google eventually started publishing [google-closure-library](https://www.npmjs.com/package/google-closure-library) directly to NPM, ending years of ill-maintained community packages. However, running the original library on node.js [remains a cumbersome process](https://github.com/googlei18n/libphonenumber/tree/master/javascript).

After all these years, Google's libphonenumber is still not officially available on NPM. What is the best way to use Google's libphonenumber on node.js then? If you're looking for a convenient and easy method, that's what this package is all about.

## Installation

Install the package via `npm`:

```sh
npm install --save-prod google-libphonenumber
```

## Usage

The following is a simple phone information extraction example similar to what can be viewed on the official demo page.

⚠️ _Most libphonenumber functions expect to receive an instance of `libphonenumber.PhoneNumber` which can be obtained by calling `phoneUtil.parse` or `phoneUtil.parseAndKeepRawInput` on a raw (string) number, otherwise it will throw errors like `TypeError: a.getCountryCodeOrDefault is not a function`._

This **will** work:

```js
phoneUtil.isValidNumberForRegion(phoneUtil.parse('202-456-1414', 'US'), 'US');
```

This **will not** work:

```js
phoneUtil.isValidNumberForRegion('202-456-1414', 'US');
```

More API examples after parsing the raw string:

```js
// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat;

// Get an instance of `PhoneNumberUtil`.
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

// Parse number with country code and keep raw input.
const number = phoneUtil.parseAndKeepRawInput('202-456-1414', 'US');

// Print the phone's country code.
console.log(number.getCountryCode());
// => 1

// Print the phone's national number.
console.log(number.getNationalNumber());
// => 2024561414

// Print the phone's extension.
console.log(number.getExtension());
// =>

// Print the phone's extension when compared to i18n.phonenumbers.CountryCodeSource.
console.log(number.getCountryCodeSource());
// => FROM_DEFAULT_COUNTRY

// Print the phone's italian leading zero.
console.log(number.getItalianLeadingZero());
// => false

// Print the phone's raw input.
console.log(number.getRawInput());
// => 202-456-1414

// Result from isPossibleNumber().
console.log(phoneUtil.isPossibleNumber(number));
// => true

// Result from isValidNumber().
console.log(phoneUtil.isValidNumber(number));
// => true

// Result from isValidNumberForRegion().
console.log(phoneUtil.isValidNumberForRegion(number, 'US'));
// => true

// Result from getRegionCodeForNumber().
console.log(phoneUtil.getRegionCodeForNumber(number));
// => US

// Result from getNumberType() when compared to i18n.phonenumbers.PhoneNumberType.
console.log(phoneUtil.getNumberType(number));
// => FIXED_LINE_OR_MOBILE

// Format number in the E164 format.
console.log(phoneUtil.format(number, PNF.E164));
// => +12024561414

// Format number in the original format.
console.log(phoneUtil.formatInOriginalFormat(number, 'US'));
// => (202) 456-1414

// Format number in the national format.
console.log(phoneUtil.format(number, PNF.NATIONAL));
// => (202) 456-1414

// Format number in the international format.
console.log(phoneUtil.format(number, PNF.INTERNATIONAL));
// => +1 202-456-1414

// Format number in the out-of-country format from US.
console.log(phoneUtil.formatOutOfCountryCallingNumber(number, 'US'));
// => 1 (202) 456-1414

// Format number in the out-of-country format from CH.
console.log(phoneUtil.formatOutOfCountryCallingNumber(number, 'CH'));
// => 00 1 202-456-1414
```

#### Using the "As You Type" Formatter

The "As You Type" formatter is a specialized tool that show the formatting *progress* as it attempts to discover the right format for the given number. It requires registering every keystroke (input digit) on a new instance of the `AsYouTypeFormatter` as shown below.

```js
// Require `AsYouTypeFormatter`.
const AsYouTypeFormatter = require('google-libphonenumber').AsYouTypeFormatter;
const formatter = new AsYouTypeFormatter('US');

console.log(formatter.inputDigit('2')); // => 2
console.log(formatter.inputDigit('0')); // => 20
console.log(formatter.inputDigit('2')); // => 202
console.log(formatter.inputDigit('-')); // => 202-
console.log(formatter.inputDigit('4')); // => 202-4
console.log(formatter.inputDigit('5')); // => 202-45
console.log(formatter.inputDigit('6')); // => 202-456
console.log(formatter.inputDigit('-')); // => 202-456-
console.log(formatter.inputDigit('1')); // => 202-456-1
console.log(formatter.inputDigit('4')); // => 202-456-14
console.log(formatter.inputDigit('1')); // => 202-456-141
console.log(formatter.inputDigit('4')); // => 202-456-1414

// Cleanup all input digits from instance.
formatter.clear();
```

## Methods

A quick glance at Google's libphonenumber rich API. Descriptions sourced from original files.

### i18n.phonenumbers.PhoneNumberUtil

The class that offers the main utilities to work with phone numbers, such as formatting, parsing and validating.

Highlights:

* **format(number, numberFormat)** - formats a phone number in the specified format using default rules.
* **formatInOriginalFormat(number, regionCallingFrom)** - formats a phone number using the original phone number format that the number is parsed from.
* **formatOutOfCountryCallingNumber(number, regionCallingFrom)** - formats a phone number for out-of-country dialing purposes.
* **getNumberType(number)** - gets the type of a valid phone number.
* **getRegionCodeForNumber(number)** - returns the region where a phone number is from.
* **isPossibleNumber(number)** - returns true if the number is either a possible fully-qualified number (containing the area code and country code), or if the number could be a possible local number (with a country code, but missing an area code).
* **isValidNumber(number)** - tests whether a phone number matches a valid pattern.
* **isValidNumberForRegion(number, regionCode)** - tests whether a phone number is valid for a certain region.
* **parseAndKeepRawInput(numberToParse, defaultRegion)** - parses a string and returns it in proto buffer format while keeping the raw input value.
* **parse(numberToParse, defaultRegion)** - parses a string and returns it in proto buffer format.

### i18n.phonenumbers.PhoneNumber

The type of the phone returned after a string number has been parsed via `PhoneNumberUtil.parse()` or `PhoneNumberUtil.parseAndKeepRawInput()`.

Highlights:

* **getCountryCode()**
* **getCountryCodeSource()**
* **getExtension()**
* **getItalianLeadingZero()**
* **getNationalNumber()**
* **getRawInput()**

## i18n.phonenumbers.CountryCodeSource

Lists the following enums in order to compare them with the output of `Phone.getCountryCodeSource()`:

* `CountryCodeSource.UNSPECIFIED`
* `CountryCodeSource.FROM_NUMBER_WITH_PLUS_SIGN`
* `CountryCodeSource.FROM_NUMBER_WITH_IDD`
* `CountryCodeSource.FROM_NUMBER_WITHOUT_PLUS_SIGN`
* `CountryCodeSource.FROM_DEFAULT_COUNTRY`

## i18n.phonenumbers.PhoneNumberFormat

Lists the following enums in order to pass them to `PhoneNumberUtil.format()`:

* `PhoneNumberFormat.E164`
* `PhoneNumberFormat.INTERNATIONAL`
* `PhoneNumberFormat.NATIONAL`
* `PhoneNumberFormat.RFC3966`

## i18n.phonenumbers.PhoneNumberType

Lists the following enums in order to compare them with the output of `PhoneNumberUtil.getNumberType()`:

* `PhoneNumberType.FIXED_LINE`
* `PhoneNumberType.MOBILE`
* `PhoneNumberType.FIXED_LINE_OR_MOBILE`
* `PhoneNumberType.TOLL_FREE`
* `PhoneNumberType.PREMIUM_RATE`
* `PhoneNumberType.SHARED_COST`
* `PhoneNumberType.VOIP`
* `PhoneNumberType.PERSONAL_NUMBER`
* `PhoneNumberType.PAGER`
* `PhoneNumberType.UAN`
* `PhoneNumberType.VOICEMAIL`
* `PhoneNumberType.UNKNOWN`

### i18n.phonenumbers.ShortNumberInfo

Highlights:

* **connectsToEmergencyNumber(number, regionCode)** - tests whether the short number can be used to connect to emergency services when dialed from the given region.
* **isPossibleShortNumber(number)** - tests whether a short number is a possible number.
* **isPossibleShortNumberForRegion(number, regionDialingFrom)** - tests whether a short number is a possible number when dialed from the given region.
* **isValidShortNumber(number)** - tests whether a short number is a possible number.
* **isValidShortNumberForRegion(number, regionDialingFrom)** - tests whether a short number matches a valid pattern in a region.

```js
// Get an instance of `ShortNumberInfo`.
const shortInfo = require('google-libphonenumber').ShortNumberInfo.getInstance();

// Get an instance of `PhoneNumberUtil`.
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

// Result from connectsToEmergencyNumber().
console.log(shortInfo.connectsToEmergencyNumber('911', 'US'));
// => true

// Result from isPossibleShortNumber().
console.log(shortInfo.isPossibleShortNumber(phoneUtil.parse('123456', 'FR')));
// => true

// Result from isPossibleShortNumberForRegion().
console.log(shortInfo.isPossibleShortNumberForRegion(phoneUtil.parse('123456', 'FR'), 'FR'));
// => true
```

### Unavailable methods and classes

The following methods or classes are unavailable on the original JS port of Google's libphonenumber:

* findNumbers - finds numbers in text (useful for highlighting or linking phone numbers inside text messages).
* PhoneNumberOfflineGeocoder - provides geographical information related to a phone number.
* PhoneNumberToCarrierMapper - provides carrier information related to a phone number.
* PhoneNumberToTimeZonesMapper - provides timezone information related to a phone number.

## Notes

### Metadata issues

Most of the issues submitted to this repository are related to carrier metadata - things like unexpected phone validations, errors in formatting numbers, unknown carriers and so on.

First, try the same input using the [official demo page](http://libphonenumber.appspot.com). If the result is different, then it might mean that a metadata update is due on this package, as the demo page always runs on the latest and official metadata version.

If the result is the same, it means there might be an issue with the currently available metadata. In that case, you should report your issue in the original project's [issue tracker](https://issuetracker.google.com/issues?q=componentid:192347) ([moved out of GitHub on 05/12/2017](https://groups.google.com/forum/#!topic/libphonenumber-discuss/bcCh0175LME)).

This note will be posted on every issue regarding metadata troubles and it will be automatically closed.

### Differences from other packages

`google-libphonenumber` does not try to be more than what it really is - a pre-compiled Google libphonenumber bundle that works on node.js. It is a **1:1 mirror** of the original library without any further simplifications or optimizations.

* All classes available from `libphonenumber` are exported as-is. No magic methods.
* Always based on the latest `google-closure` library version available from Google with performance and bug fixes.
* Relies on a simplified and [well-documented update process](https://github.com/ruimarinho/google-libphonenumber/blob/master/bin/update.sh) to keep the underlying `libphonenumber` library always up-to-date.

If you're looking for a slightly simpler API, you should try [awesome-phonenumber](https://www.npmjs.com/package/awesome-phonenumber). It is based on the same concepts of this package but changes the API in order to make it more user friendly. You run the risk of bumping into [other](https://github.com/grantila/awesome-phonenumber/issues/14) [bugs](https://github.com/grantila/awesome-phonenumber/issues/17) and you'll have to [learn new API types](https://github.com/grantila/awesome-phonenumber#api-types), but that's the necessary trade-off that the author made for achieving a generally better looking API.

[libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js) is a much more radical approach to Google's libphonenumber. It is a rewrite of the original library based on its source phone metadata but implemented without depending on the Google Closure library. It also offers a tool to reduce the metadata to a set of countries which might be useful for frontend projects. It has several [caveats](https://github.com/catamphetamine/libphonenumber-js#difference-from-googles-libphonenumber), many of which make a lot of sense depending on the project, but you will have to ascertain those yourself.

## Webpack

There have been some users reporting successful but also unsuccessful usage with Webpack. While I don't personally use it, I'm 100% supportive of pull requests adding modifications that allow this package to better interact with it.

### Chrome Extensions

Google Closure Compiler API, a serviced provided by Google to compile code online via its Closure library, may not always return fully compliant UTF-8-encoded output.

Loading extensions using this library on Google Chrome and other Chromium-based browsers may result in the following error when compiled with webpack:

`Could not load file 'file.js' for content script. It isn't UTF-8 encoded.`

While the local Java-based version supports a parameter which would let us workaround this issue at the source using `--charset=US-ASCII`, the online API version, which is a lot more convenient to use, does not offer support for an equivalent parameter (e.g. `output_charset=US-ASCII`).

In order to workaround this issue when using webpack, make sure to output US-ASCII characters only when defining `TerserPlugin` options, as demonstrated below:

```js
optimization: {
  minimize: process.env.NODE_ENV !== 'development',
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        output: {
          ascii_only: true
        }
      },
    }),
  ]
}
```

## Tests

A small subset of tests guarantees that the main library functions are working as expected and are correctly exported. The actual heavy lifting is done by `libphonenumber`'s extensive test suite.

```sh
npm test
```

## Release

```sh
npm version [<newversion> | major | minor | patch] -m "Release %s"
```

## Acknowledgments

The exceptional work on `libphonenumber` was made possible by these [committers and contributors](https://github.com/googlei18n/libphonenumber/graphs/contributors).

## Licenses

This package is licensed under MIT. The bundled [libphonenumber](https://github.com/googlei18n/libphonenumber/blob/master/LICENSE) library is licensed under Apache 2.0.

[npm-image]: https://flat.badgen.net/npm/v/google-libphonenumber
[npm-url]: https://npmjs.org/package/google-libphonenumber
[travis-image]: https://flat.badgen.net/travis/ruimarinho/google-libphonenumber
[travis-url]: https://travis-ci.org/ruimarinho/google-libphonenumber
[packagephobia-image]: https://flat.badgen.net/packagephobia/install/google-libphonenumber
[packagephobia-url]: https://packagephobia.now.sh/result?p=google-libphonenumber
