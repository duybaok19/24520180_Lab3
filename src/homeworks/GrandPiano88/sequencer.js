function createAbortError() {
  return new DOMException('Playback was aborted', 'AbortError');
}

/**
 * Chờ một khoảng thời gian.
 * Có thể hủy bằng AbortSignal.
 */
export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const cleanup = () => {
      signal?.removeEventListener('abort', handleAbort);
    };

    const timerId = setTimeout(() => {
      cleanup();
      resolve();
    }, Math.max(0, ms));

    function handleAbort() {
      clearTimeout(timerId);
      cleanup();
      reject(createAbortError());
    }

    signal?.addEventListener('abort', handleAbort, { once: true });
  });
}

export class Recorder {
  constructor() {
    this.events = [];
    this.heldNotes = new Map();
    this.completedEvents = new Set();
    this.lastEventAt = 0;
    this.isRecording = false;
  }

  start() {
    this.events = [];
    this.heldNotes.clear();
    this.completedEvents.clear();

    this.lastEventAt = performance.now();
    this.isRecording = true;
  }

  noteDown(midi, freqHz) {
    if (!this.isRecording || this.heldNotes.has(midi)) return;

    const now = performance.now();

    const event = {
      midi,
      freqHz,
      durationMs: 0,
      deltaMs: now - this.lastEventAt,
    };

    // Thêm ngay khi nhấn để giữ đúng thứ tự nhấn phím.
    this.events.push(event);

    this.heldNotes.set(midi, {
      downAt: now,
      event,
    });

    this.lastEventAt = now;
  }

  noteUp(midi) {
    if (!this.isRecording) return;

    const heldNote = this.heldNotes.get(midi);
    if (!heldNote) return;

    const now = performance.now();

    heldNote.event.durationMs = Math.max(
      0,
      now - heldNote.downAt
    );

    this.completedEvents.add(heldNote.event);
    this.heldNotes.delete(midi);
  }

  stop() {
    this.isRecording = false;
    this.heldNotes.clear();

    // Trả về bản sao, không để bên ngoài sửa dữ liệu nội bộ.
    const result = this.events
      .filter((event) => this.completedEvents.has(event))
      .map((event) => ({ ...event }));

    return result;
  }
}

/**
 * Phát lại các sự kiện đã ghi.
 *
 * deltaMs: khoảng cách giữa hai lần nhấn phím.
 * durationMs: thời gian giữ phím.
 */
export async function replay(
  events,
  rate,
  { noteOn, noteOff, signal }
) {
  if (![0.5, 1, 2].includes(rate)) {
    throw new RangeError('Playback rate must be 0.5, 1, or 2.');
  }

  const activeNotes = new Set();
  const pendingOffs = new Map();

  function releaseAll() {
    // Hủy tất cả timer noteOff đang chờ.
    for (const [midi, pending] of pendingOffs) {
      clearTimeout(pending.timerId);
      pending.resolve();
      pendingOffs.delete(midi);
    }

    // Giải phóng các nốt đang phát.
    for (const midi of activeNotes) {
      noteOff(midi);
    }

    activeNotes.clear();
  }

  function handleAbort() {
    releaseAll();
  }

  function scheduleNoteOff(midi, durationMs) {
    return new Promise((resolve) => {
      const timerId = setTimeout(() => {
        pendingOffs.delete(midi);

        if (activeNotes.has(midi)) {
          noteOff(midi);
          activeNotes.delete(midi);
        }

        resolve();
      }, Math.max(0, durationMs / rate));

      pendingOffs.set(midi, { timerId, resolve });
    });
  }

  const offPromises = [];

  try {
    if (signal?.aborted) {
      throw createAbortError();
    }

    signal?.addEventListener('abort', handleAbort, { once: true });

    for (const event of events) {
      // Chờ đến thời điểm nhấn nốt tiếp theo.
      await sleep(event.deltaMs / rate, signal);

      if (signal?.aborted) {
        throw createAbortError();
      }

      // Tránh để một nốt MIDI bị phát chồng lên chính nó.
      const previous = pendingOffs.get(event.midi);

      if (previous) {
        clearTimeout(previous.timerId);
        previous.resolve();
        pendingOffs.delete(event.midi);

        if (activeNotes.has(event.midi)) {
          noteOff(event.midi);
          activeNotes.delete(event.midi);
        }
      }

      noteOn(event.midi, event.freqHz);
      activeNotes.add(event.midi);

      offPromises.push(
        scheduleNoteOff(event.midi, event.durationMs)
      );
    }

    // Chờ tất cả nốt được thả tự nhiên.
    await Promise.all(offPromises);

    if (signal?.aborted) {
      throw createAbortError();
    }
  } catch (error) {
    releaseAll();

    if (signal?.aborted || error.name === 'AbortError') {
      throw createAbortError();
    }

    throw error;
  } finally {
    signal?.removeEventListener('abort', handleAbort);
  }
}
