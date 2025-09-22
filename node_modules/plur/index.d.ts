/**
Pluralize a word.

@param word - The word to pluralize.
@param plural - Explicitly provide the pluralized word.
The plural suffix will match the case of the last letter in the word.
This option is only for extreme edge-cases. You probably won't need it.

Default:

- Irregular nouns will use this [list](https://github.com/sindresorhus/irregular-plurals/blob/main/irregular-plurals.json).
- Words ending in *s*, *x*, *z*, *ch*, *sh* will be pluralized with *-es* (eg. *foxes*).
- Words ending in *y* that are preceded by a consonant will be pluralized by replacing *y* with *-ies* (eg. *puppies*).
- All other words will have "s" added to the end (eg. *days*).

@param count - The count to determine whether to use singular or plural.

@example
```
import plur from 'plur';

plur('rainbow');
//=> 'rainbows'

plur('unicorn', 4);
//=> 'unicorns'

plur('puppy', 2);
//=> 'puppies'

plur('box', 2);
//=> 'boxes'

plur('cactus', 2);
//=> 'cacti'
```
*/
export default function plur(word: string, count?: number): string;
export default function plur(word: string, plural: string, count: number): string;
