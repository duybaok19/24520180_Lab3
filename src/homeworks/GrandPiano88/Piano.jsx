import { useCallback, useState } from 'react';
import { generateKeys } from './keys.js';
import PianoKey from './PianoKey.jsx';
import styles from './Piano.module.css';

// Chỉ generate một lần khi module được tải.
const PIANO_KEYS = generateKeys();

export default function Piano() {
  const [pressedMidis, setPressedMidis] = useState(
    () => new Set(),
  );

  // Thêm MIDI vào Set bằng cách tạo Set mới.
  const onNoteOn = useCallback((midi) => {
    setPressedMidis((prev) => {
      const next = new Set(prev);
      next.add(midi);
      return next;
    });
  }, []);

  // Xóa MIDI khỏi Set bằng cách tạo Set mới.
  const onNoteOff = useCallback((midi) => {
    setPressedMidis((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }, []);

  return (
    <main className={styles.piano}>
      <h1>Grand Piano 88 Keys</h1>

      <section
        className={styles.pianoViewport}
        aria-label="88-key piano keyboard"
        tabIndex={0}
      >
        <ul className={styles.keyList}>
          {PIANO_KEYS.map((note) => (
            <li
              key={note.midi}
              className={
                note.isBlack
                  ? styles.blackSlot
                  : styles.whiteSlot
              }
            >
              <PianoKey
                midi={note.midi}
                noteName={note.noteName}
                isBlack={note.isBlack}
                isPressed={pressedMidis.has(note.midi)}
                onNoteOn={onNoteOn}
                onNoteOff={onNoteOff}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
