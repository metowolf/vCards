declare namespace dateTime {
	interface Options {
		/**
		Custom date.

		@default new Date()
		*/
		date?: Date;

		/**
		Show the date in the local time zone.

		@default false
		*/
		local?: boolean;

		/**
		Show the UTC time zone postfix.

		@default false
		*/
		showTimeZone?: boolean;

		/**
		Show the milliseconds in the date if any.

		@default false
		*/
		showMilliseconds?: boolean;
	}
}

declare const dateTime: {
	/**
	Pretty datetime: `2014-01-09 06:46:01`.

	@example
	```
	import dateTime = require('date-time');

	dateTime();
	//=> '2017-05-20 17:07:05'

	dateTime({date: new Date(1989, 2, 4, 10)});
	//=> '1989-03-04 09:00:00'

	dateTime({showTimeZone: true});
	//=> '2017-05-20 17:07:05 UTC+7'

	dateTime({local: false});
	//=> '2017-05-20 10:07:05'

	dateTime({local: false, showTimeZone: true});
	//=> '2017-05-20 10:07:05 UTC'

	dateTime({showMilliseconds: true});
	//=> '2017-05-20 17:07:05 6ms'
	```
	*/
	(options?: dateTime.Options): string;

	// TODO: Remove this for the next major release, refactor the whole definition to:
	// declare function dateTime(options?: dateTime.Options): string;
	// export = dateTime;
	default: typeof dateTime;
};

export = dateTime;
