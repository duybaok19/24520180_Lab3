
import { PAD_LIST } from './pads.js';

export default function DrumMachine() {
  return (
    <main>
      <h1>Production Studio Drum Kit</h1>

      <section aria-label="Drum pads">
        <ul>
          {PAD_LIST.map((pad) => (
            <li key={pad.id}>
              <button
                type="button"
                aria-pressed="false"
              >
                {pad.label} — {pad.code.replace('Key', '')}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
