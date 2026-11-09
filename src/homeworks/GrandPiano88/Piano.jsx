import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { generateKeys } from './keys.js';
import { PolyphonicSynth } from './PolyphonicSynth.js';
import { Recorder, replay } from './sequencer.js';

import PianoKey from './PianoKey.jsx';
import styles from './Piano.module.css';

const PIANO_KEYS = generateKeys();

const NOTE_BY_MIDI = new Map(
  PIANO_KEYS.map((note) => [note.midi, note])
);

export default function Piano() {
  // Chỉ có một state quản lý trạng thái hoạt động.
  const [status, setStatus] = useState('IDLE');

  const [rate, setRate] = useState('1');

  const [pressedMidis, setPressedMidis] = useState(
    () => new Set()
  );

  const rateId = useId();

  const synthRef = useRef(null);
  const recorderRef = useRef(null);
  const abortControllerRef = useRef(null);
  const recordedEventsRef = useRef([]);

  // Khởi tạo các đối tượng một lần.
  if (!synthRef.current) {
    synthRef.current = new PolyphonicSynth(8);
  }

  if (!recorderRef.current) {
    recorderRef.current = new Recorder();
  }

  const synth = synthRef.current;
  const recorder = recorderRef.current;

  // Nhấn một phím.
  const onNoteOn = useCallback((midi) => {
    const note = NOTE_BY_MIDI.get(midi);

    if (!note) return;

    synth.noteOn(midi, note.freqHz);
    recorder.noteDown(midi, note.freqHz);

    setPressedMidis((prev) => {
      const next = new Set(prev);
      next.add(midi);
      return next;
    });
  }, [synth, recorder]);

  // Thả một phím.
  const onNoteOff = useCallback((midi) => {
    synth.noteOff(midi);
    recorder.noteUp(midi);

    setPressedMidis((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }, [synth, recorder]);

  // Bắt đầu ghi âm.
  const handleRecord = () => {
    if (status !== 'IDLE') return;

    recorder.start();
    recordedEventsRef.current = [];

    setStatus('RECORDING');
  };

  // Dừng ghi âm và lưu bản ghi.
  const handleStopRecording = () => {
    if (status !== 'RECORDING') return;

    recordedEventsRef.current = recorder.stop();

    setStatus('IDLE');
  };

  // Phát lại bản ghi.
  const handlePlay = async () => {
    if (status !== 'IDLE') return;
    if (recordedEventsRef.current.length === 0) return;

    const controller = new AbortController();

    // Mỗi lần Play tạo một AbortController mới.
    abortControllerRef.current = controller;

    setStatus('PLAYING');

    try {
      await replay(
        recordedEventsRef.current,
        Number(rate),
        {
          noteOn: (midi) => onNoteOn(midi),
          noteOff: (midi) => onNoteOff(midi),
          signal: controller.signal,
        }
      );
    } catch (error) {
      // Người dùng chủ động Stop không phải lỗi.
      if (error.name !== 'AbortError') {
        console.error('Sequence playback failed:', error);
      }
    } finally {
      // Không để lần playback cũ ghi đè trạng thái của lần mới.
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setStatus('IDLE');
      }
    }
  };

  // Dừng phát lại.
  const handleStopSequence = () => {
    const controller = abortControllerRef.current;

    if (!controller) return;

    // Xóa ref trước khi abort để finally cũ không đổi state lần mới.
    abortControllerRef.current = null;

    controller.abort();

    setStatus('IDLE');
  };

  // Cleanup khi component unmount.
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;

      synth.dispose();
    };
  }, [synth]);

  return (
    <main className={styles.piano}>
      <h1>Grand Piano 88 Keys</h1>

      <section
        className={styles.controls}
        aria-label="Piano recording controls"
      >
        <button
          type="button"
          onClick={handleRecord}
          disabled={status !== 'IDLE'}
        >
          Record
        </button>

        <button
          type="button"
          onClick={handleStopRecording}
          disabled={status !== 'RECORDING'}
        >
          Stop Recording
        </button>

        <label htmlFor={rateId}>
          Playback speed
        </label>

        <select
          id={rateId}
          value={rate}
          onChange={(event) => setRate(event.target.value)}
          disabled={status === 'PLAYING'}
        >
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="2">2x</option>
        </select>

        <button
          type="button"
          onClick={handlePlay}
          disabled={
            status !== 'IDLE' ||
            recordedEventsRef.current.length === 0
          }
        >
          Play
        </button>

        <button
          type="button"
          onClick={handleStopSequence}
          disabled={status !== 'PLAYING'}
        >
          Stop Sequence
        </button>
      </section>

      <p aria-live="polite">
        Status: {status}
      </p>

      <section
        className={styles.pianoViewport}
        aria-label="88-key piano keyboard"
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
