import { useCallback, useEffect, useState } from 'react';

import { PAD_LIST, padMap } from './pads.js';
import { playDrum } from './drumSynth.js';
import { useDrumKeyboard } from './useDrumKeyboard.js';
import styles from './DrumMachine.module.css';

export default function DrumMachine() {
  const [activeIds, setActiveIds] = useState([]);
  const [hits, setHits] = useState([]);
  const [level, setLevel] = useState(0);

  const onTrigger = useCallback((id, phase) => {
    const pad = PAD_LIST.find((item) => item.id === id);

    if (!pad) return;

    if (phase === 'down') {
      setActiveIds((prev) =>
        prev.includes(id) ? prev : [...prev, id]
      );

      playDrum(pad.voice);

      // Thêm hit mới, chỉ giữ tối đa 10 lần gần nhất
      const entry = {
        id: crypto.randomUUID(),
        label: pad.label,
        time: new Date().toLocaleTimeString('vi-VN'),
      };

      setHits((prev) => [...prev, entry].slice(-10));

      // Cập nhật mức hoạt động âm thanh
      setLevel(100);
    }

    if (phase === 'up') {
      setActiveIds((prev) =>
        prev.filter((activeId) => activeId !== id)
      );
    }
  }, []);

  useDrumKeyboard(padMap, onTrigger);

  // Giảm level dần về 0 và cleanup timer
  useEffect(() => {
    if (level <= 0) return undefined;

    const timer = setInterval(() => {
      setLevel((prev) => Math.max(0, prev - 5));
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, [level]);

  return (
    <main className={styles.drumMachine}>
      <h1>Production Studio Drum Kit</h1>

      <section aria-label="Drum pads">
        <ul>
          {PAD_LIST.map((pad) => {
            const isActive = activeIds.includes(pad.id);

            return (
              <li key={pad.id}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onPointerDown={() => onTrigger(pad.id, 'down')}
                  onPointerUp={() => onTrigger(pad.id, 'up')}
                   onClick={(e) => {
    if (e.detail === 0) {
      onTrigger(pad.id, 'down');
      onTrigger(pad.id, 'up');
    }
  }}
                >
                  {pad.label} — {pad.code.replace('Key', '')}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Audio activity">
        <h2>Volume Meter</h2>

        <meter
          min={0}
          max={100}
          value={level}
          aria-label="Audio activity level"
        >
          {level}%
        </meter>

        <output aria-label="Audio activity level">
          {level}%
        </output>
      </section>

      <section aria-label="Hit history">
        <h2>Hit History</h2>

        <output aria-live="polite" aria-label="Latest hit">
          {hits.length > 0
            ? `${hits[hits.length - 1].label} — ${hits[hits.length - 1].time}`
            : 'Chưa có lượt đánh trống'}
        </output>

        <ol>
          {hits.map((entry) => (
            <li key={entry.id}>
              {entry.label} — {entry.time}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}