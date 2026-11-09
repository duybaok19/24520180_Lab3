/**
 * Sinh danh sách 88 phím đàn Piano từ MIDI 21 (A0)
 * đến MIDI 108 (C8).
 *
 * @returns {import('./types.js').Note[]}
 */
export function generateKeys() {
  const NOTE_NAMES = [
    'C', 'C#', 'D', 'D#', 'E', 'F',
    'F#', 'G', 'G#', 'A', 'A#', 'B',
  ];

  const BLACK_NOTE_INDICES = new Set([1, 3, 6, 8, 10]);

  const notes = [];

  for (let midi = 21; midi <= 108; midi++) {
    const pitchClass = midi % 12;
    const octave = Math.floor(midi / 12) - 1;

    const noteName = `${NOTE_NAMES[pitchClass]}${octave}`;
    const isBlack = BLACK_NOTE_INDICES.has(pitchClass);

    const freqHz = 440 * 2 ** ((midi - 69) / 12);

    notes.push({
      midi,
      noteName,
      isBlack,
      freqHz,
    });
  }

  return notes;
}

// Kiểm tra kết quả
const keys = generateKeys();

console.assert(
  keys.length === 88,
  `Expected 88 keys, got ${keys.length}`,
);

console.assert(
  keys.filter((note) => !note.isBlack).length === 52,
  'Expected 52 white keys',
);

console.assert(
  keys.filter((note) => note.isBlack).length === 36,
  'Expected 36 black keys',
);

console.assert(
  Math.abs(keys.find((note) => note.midi === 69).freqHz - 440) < 0.000001,
  'MIDI 69 (A4) must have frequency 440 Hz',
);
