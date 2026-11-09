/**
 * @typedef {'kick' | 'snare' | 'hihat' | 'openhat' | 'tom' | 'clap' | 'crash'} DrumVoice
 */

/**
 * @typedef {Object} Pad
 * @property {string} id
 * @property {string} label
 * @property {'KeyW' | 'KeyA' | 'KeyS' | 'KeyD' | 'KeyJ' | 'KeyK' | 'KeyL'} code
 * @property {DrumVoice} voice
 */

/** @type {Pad[]} */
export const PAD_LIST = [
  { id: 'pad-kick', label: 'Kick', code: 'KeyW', voice: 'kick' },
  { id: 'pad-snare', label: 'Snare', code: 'KeyA', voice: 'snare' },
  { id: 'pad-hihat', label: 'Hi-Hat', code: 'KeyS', voice: 'hihat' },
  { id: 'pad-openhat', label: 'Open Hat', code: 'KeyD', voice: 'openhat' },
  { id: 'pad-tom', label: 'Tom', code: 'KeyJ', voice: 'tom' },
  { id: 'pad-clap', label: 'Clap', code: 'KeyK', voice: 'clap' },
  { id: 'pad-crash', label: 'Crash', code: 'KeyL', voice: 'crash' },
];

/**
 * Map keyboard code -> Pad
 * @type {Map<Pad['code'], Pad>}
 */
export const padMap = new Map(
  PAD_LIST.map((pad) => [pad.code, pad])
);
