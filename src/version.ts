import { version } from '../package.json'

// Shown in the corner of the screen. Bump the version in package.json and
// give each major version a name.
export const VERSION = version.split('.').slice(0, 2).join('.')
export const VERSION_NAME = 'keisari'
