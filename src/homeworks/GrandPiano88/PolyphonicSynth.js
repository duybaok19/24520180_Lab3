export class PolyphonicSynth {
  constructor(maxVoices = 8) {
    // Không tạo AudioContext trong constructor.
    this.ctx = null;

    // Map: midi -> { osc, gain }
    // Map giữ thứ tự insertion để xử lý FIFO.
    this.voices = new Map();

    this.maxVoices = maxVoices;
  }

  noteOn(midi, freqHz) {
    // Tạo AudioContext ở lần phát đầu tiên.
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }

    // Resume nếu AudioContext đang suspended.
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((error) => {
        console.error('Cannot resume AudioContext:', error);
      });
    }

    // Không tạo hai voice cho cùng một MIDI.
    if (this.voices.has(midi)) {
      return;
    }

    // Đủ số voice thì loại bỏ voice cũ nhất (FIFO).
    if (this.voices.size >= this.maxVoices) {
      const oldestMidi = this.voices.keys().next().value;
      this.noteOff(oldestMidi);
    }

    // Tạo oscillator và gain node.
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(
      freqHz,
      this.ctx.currentTime
    );

    gain.gain.setValueAtTime(
      0.2,
      this.ctx.currentTime
    );

    // Kết nối âm thanh.
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Dọn node sau khi oscillator kết thúc.
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    // Bắt đầu phát và lưu voice.
    osc.start();

    this.voices.set(midi, {
      osc,
      gain,
    });
  }

  noteOff(midi) {
    const voice = this.voices.get(midi);

    if (!voice || !this.ctx) {
      return;
    }

    const { osc, gain } = voice;
    const now = this.ctx.currentTime;

    // Giảm âm lượng trước khi dừng oscillator.
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.04
    );

    osc.stop(now + 0.05);

    // Xóa khỏi Map ngay để giải phóng slot.
    this.voices.delete(midi);
  }

  dispose() {
  const ctx = this.ctx;

  if (!ctx) return;

  for (const midi of [...this.voices.keys()]) {
    this.noteOff(midi);
  }

  this.ctx = null;

  if (ctx.state !== 'closed') {
    void ctx.close().catch(() => {});
  }
}
}
