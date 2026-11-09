let sharedContext = null;

/**
 * Tạo AudioContext dùng chung khi được gọi lần đầu.
 * Nếu context đang suspended, yêu cầu trình duyệt resume.
 */
export function getContext() {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }

  if (sharedContext.state === 'suspended') {
    sharedContext.resume();
  }

  return sharedContext;
}

/**
 * Tạo nguồn noise ngẫu nhiên bằng AudioBuffer.
 */
function createNoiseBuffer(ctx, duration) {
  const frameCount = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

/**
 * Tạo envelope giảm âm lượng để tránh tiếng click/pop.
 */
function setDecay(gainNode, startTime, duration, peak = 0.7) {
  gainNode.gain.setValueAtTime(peak, startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + duration
  );
}

/**
 * Phát một tiếng noise qua filter và gain.
 */
function playNoise(
  ctx,
  {
    duration,
    filterType,
    frequency,
    startAt = ctx.currentTime,
    peak = 0.7,
  }
) {
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = createNoiseBuffer(ctx, duration);

  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, startAt);

  setDecay(gain, startAt, duration, peak);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };

  source.start(startAt);
  source.stop(startAt + duration);
}

/**
 * Phát một tiếng sine oscillator.
 */
function playTone(
  ctx,
  {
    startFrequency,
    endFrequency,
    duration,
    peak = 0.7,
    startAt = ctx.currentTime,
  }
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'sine';

  oscillator.frequency.setValueAtTime(
    startFrequency,
    startAt
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    endFrequency,
    startAt + duration
  );

  setDecay(gain, startAt, duration, peak);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };

  oscillator.start(startAt);
  oscillator.stop(startAt + duration);
}

/**
 * Phát âm thanh theo DrumVoice.
 *
 * @param {'kick' | 'snare' | 'hihat' | 'openhat' | 'tom' | 'clap' | 'crash'} voice
 */
export function playDrum(voice) {
  const ctx = getContext();
  const now = ctx.currentTime;

  switch (voice) {
    case 'kick':
      playTone(ctx, {
        startFrequency: 150,
        endFrequency: 50,
        duration: 0.3,
        peak: 1,
        startAt: now,
      });
      break;

    case 'snare':
      // Tiếng noise ngắn qua bandpass
      playNoise(ctx, {
        duration: 0.18,
        filterType: 'bandpass',
        frequency: 1800,
        peak: 0.65,
      });

      // Thêm tiếng sine khoảng 180Hz
      playTone(ctx, {
        startFrequency: 180,
        endFrequency: 100,
        duration: 0.12,
        peak: 0.45,
        startAt: now,
      });
      break;

    case 'hihat':
      playNoise(ctx, {
        duration: 0.05,
        filterType: 'highpass',
        frequency: 7000,
        peak: 0.45,
      });
      break;

    case 'openhat':
      playNoise(ctx, {
        duration: 0.3,
        filterType: 'highpass',
        frequency: 6000,
        peak: 0.4,
      });
      break;

    case 'tom':
      playTone(ctx, {
        startFrequency: 200,
        endFrequency: 100,
        duration: 0.25,
        peak: 0.75,
        startAt: now,
      });
      break;

    case 'clap': {
      // Một vài burst noise ngắn liên tiếp
      const burstOffsets = [0, 0.045, 0.09, 0.135];

      for (const offset of burstOffsets) {
        playNoise(ctx, {
          duration: 0.035,
          filterType: 'bandpass',
          frequency: 1500,
          startAt: now + offset,
          peak: 0.65,
        });
      }
      break;
    }

    case 'crash':
      playNoise(ctx, {
        duration: 1,
        filterType: 'highpass',
        frequency: 4500,
        peak: 0.5,
      });
      break;

    default:
      throw new Error(`Unknown drum voice: ${voice}`);
  }
}
