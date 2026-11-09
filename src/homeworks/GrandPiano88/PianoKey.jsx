import { memo } from 'react';
import styles from './PianoKey.module.css';

const PianoKey = memo(function PianoKey({
  midi,
  noteName,
  isBlack,
  isPressed,
  onNoteOn,
  onNoteOff,
}) {
  return (
    <button
      type="button"
      className={isBlack ? styles.blackKey : styles.whiteKey}
      aria-pressed={isPressed}
      aria-label={noteName}
      onPointerDown={() => onNoteOn(midi)}
      onPointerUp={() => onNoteOff(midi)}
      onPointerLeave={() => onNoteOff(midi)}
    >
      <span>{noteName}</span>
    </button>
  );
});

export default PianoKey;
