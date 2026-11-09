import { useEffect, useState } from 'react';
import { usePubgAirdropTimer } from '../../hooks/usePubgAirdropTimer';

const PHASE_LABELS = {
  WARMUP: 'Sắp mở Airdrop',
  AIRDROP_LIVE: 'Airdrop đang diễn ra',
  LOOTED_OUT: 'Đã hết vật phẩm',
  EXPIRED: 'Airdrop đã kết thúc',
};

/**
 * Format milliseconds into HH:MM:SS.
 * @param {number} ms
 * @returns {string}
 */
export function formatRemaining(ms) {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

const formatVnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

export default function Countdown({
  targetEpochMs,
  phase,
  priceVnd,
}) {
  const { remainingMs } = usePubgAirdropTimer(targetEpochMs);

  const [announcement, setAnnouncement] = useState('');

  const isWithinOneMinute =
    remainingMs <= 60_000 && remainingMs > 0;

  useEffect(() => {
    if (phase === 'AIRDROP_LIVE') {
      setAnnouncement('Airdrop đã bắt đầu!');
    } else if (isWithinOneMinute) {
      setAnnouncement('Airdrop sẽ bắt đầu trong vòng 1 phút!');
    } else {
      setAnnouncement('');
    }
  }, [isWithinOneMinute, phase]);

  const phaseLabel =
    PHASE_LABELS[phase] ?? 'Trạng thái không xác định';

  const validTarget = Number.isFinite(targetEpochMs);

  return (
    <section className="countdown">
      <p className="countdown__label">Thời gian đến Airdrop</p>

      <time
        className="countdown__time"
        dateTime={
          validTarget
            ? new Date(targetEpochMs).toISOString()
            : undefined
        }
      >
        {formatRemaining(remainingMs)}
      </time>

      <p className="countdown__phase">
        Trạng thái: <strong>{phaseLabel}</strong>
      </p>

      {priceVnd !== undefined && (
        <p className="countdown__price">
          Giá: <strong>{formatVnd.format(priceVnd)}</strong>
        </p>
      )}

      <output
        className="countdown__announcement"
        role="status"
        aria-live="polite"
      >
        {announcement}
      </output>
    </section>
  );
}
