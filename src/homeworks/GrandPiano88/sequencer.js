/**
 * @typedef {import('./types.js').RecordedEvent} RecordedEvent
 * @typedef {import('./types.js').PlaybackRate} PlaybackRate
 */

export class Recorder {
  constructor() {
    this.startedAt = 0;

    /**
     * @type {(RecordedEvent & { _startedAt: number })[]}
     */
    this.events = [];

    // midi -> { freqHz, downAt }
    this.heldNotes = new Map();

    this.isRecording = false;
  }

  start() {
    this.startedAt = performance.now();
    this.events = [];
    this.heldNotes.clear();
    this.isRecording = true;
  }

  noteDown(midi, freqHz) {
    if (!this.isRecording) return;

    // Không ghi trùng một MIDI đang được giữ.
    if (this.heldNotes.has(midi)) return;

    this.heldNotes.set(midi, {
      freqHz,
      downAt: performance.now(),
    });
  }

  noteUp(midi) {
    if (!this.isRecording) return;

    const note = this.heldNotes.get(midi);

    if (!note) return;

    const upAt = performance.now();
    const durationMs = upAt - note.downAt;

    // Lưu thời điểm nhấn để sắp xếp FIFO khi stop().
    this.events.push({
      midi,
      freqHz: note.freqHz,
      durationMs,
      deltaMs: 0,
      _startedAt: note.downAt,
    });

    this.heldNotes.delete(midi);
  }

  stop() {
    this.isRecording = false;
    this.heldNotes.clear();

    // Sắp xếp theo thời điểm nhấn, không phải thời điểm nhả.
    const sortedEvents = [...this.events].sort(
      (a, b) => a._startedAt - b._startedAt,
    );

    let previousStartedAt = this.startedAt;

    const result = sortedEvents.map((event) => {
      const { _startedAt, ...recordedEvent } = event;

      const deltaMs = _startedAt - previousStartedAt;
      previousStartedAt = _startedAt;

      return {
        ...recordedEvent,
        deltaMs,
      };
    });

    // Trả bản sao, không để bên ngoài sửa mảng nội bộ.
    return result;
  }
}

/**
 * Chờ một khoảng thời gian có hỗ trợ AbortSignal.
 *
 * @param {number} ms
 * @param {AbortSignal} signal
 * @returns {Promise<void>}
 */
export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const error = new Error('Playback aborted');
      error.name = 'AbortError';
      reject(error);
      return;
    }

    let timerId;

    const cleanup = () => {
      clearTimeout(timerId);
      signal?.removeEventListener('abort', handleAbort);
    };

    const handleAbort = () => {
      cleanup();

      const error = new Error('Playback aborted');
      error.name = 'AbortError';
      reject(error);
    };

    timerId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, Math.max(0, ms));

    signal?.addEventListener('abort', handleAbort, {
      once: true,
    });
  });
}

/**
 * Phát lại danh sách sự kiện theo thứ tự FIFO.
 *
 * @param {RecordedEvent[]} events
 * @param {PlaybackRate} rate
 * @param {{
 *   noteOn: (midi: number, freqHz: number) => void,
 *   noteOff: (midi: number) => void,
 *   signal: AbortSignal
 * }} options
 */
export async function replay(
  events,
  rate,
  { noteOn, noteOff, signal },
) {
  if (![0.5, 1, 2].includes(rate)) {
    throw new RangeError('Playback rate must be 0.5, 1, or 2');
  }

  const activeNotes = new Set();
  const pendingTimers = new Map();

  // Dừng và giải phóng tất cả nốt đang replay.
  const releaseAll = () => {
    for (const timerId of pendingTimers.values()) {
      clearTimeout(timerId);
    }

    pendingTimers.clear();

    for (const midi of activeNotes) {
      noteOff(midi);
    }

    activeNotes.clear();
  };

  const handleAbort = () => releaseAll();

  if (signal.aborted) {
    const error = new Error('Playback aborted');
    error.name = 'AbortError';
    throw error;
  }

  signal.addEventListener('abort', handleAbort, {
    once: true,
  });

  try {
    for (const event of events) {
      // Chờ khoảng cách giữa hai lần nhấn.
      await sleep(event.deltaMs / rate, signal);

      if (signal.aborted) {
        throw new Error('Playback aborted');
      }

      // Phát nốt.
      noteOn(event.midi, event.freqHz);
      activeNotes.add(event.midi);

      // Hủy timer cũ nếu MIDI này đã có timer.
      const previousTimer = pendingTimers.get(event.midi);

      if (previousTimer !== undefined) {
        clearTimeout(previousTimer);
      }

      // Lên lịch tắt nốt.
      const timerId = setTimeout(() => {
        pendingTimers.delete(event.midi);

        if (activeNotes.has(event.midi)) {
          noteOff(event.midi);
          activeNotes.delete(event.midi);
        }
      }, Math.max(0, event.durationMs / rate));

      pendingTimers.set(event.midi, timerId);
    }

    // Chờ tất cả nốt cuối cùng kết thúc.
    while (pendingTimers.size > 0) {
      await sleep(10, signal);
    }
  } catch (error) {
    releaseAll();

    if (signal.aborted || error.name === 'AbortError') {
      const abortError = new Error('Playback aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }

    throw error;
  } finally {
    signal.removeEventListener('abort', handleAbort);
  }
}
