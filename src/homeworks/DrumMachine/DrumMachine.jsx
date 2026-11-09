import { useCallback, useState } from 'react';

import { PAD_LIST, padMap } from './pads.js';
import { playDrum } from './drumSynth.js';
import { useDrumKeyboard } from './useDrumKeyboard.js';

export default function DrumMachine() {
  const [activeIds, setActiveIds] = useState([]);

  const onTrigger = useCallback((id, phase) => {
    const pad = PAD_LIST.find((item) => item.id === id);

    if (!pad) return;

    if (phase === 'down') {
      // Cập nhật state immutable, tránh thêm trùng id
      setActiveIds((prev) =>
        prev.includes(id) ? prev : [...prev, id]
      );

      // Phát âm thanh khi nhấn
      playDrum(pad.voice);
    }

    if (phase === 'up') {
      // Gỡ id khỏi danh sách active
      setActiveIds((prev) =>
        prev.filter((activeId) => activeId !== id)
      );
    }
  }, []);

  // Kích hoạt điều khiển bằng bàn phím
  useDrumKeyboard(padMap, onTrigger);

  return (
    <main>
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
                >
                  {pad.label} — {pad.code.replace('Key', '')}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

