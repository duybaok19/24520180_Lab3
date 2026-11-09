import { useEffect, useState } from 'react';

/**
 * Hook đếm ngược Airdrop không bị trôi thời gian.
 *
 * @param {number} targetEpochMs - Thời điểm Airdrop mở (Unix milliseconds).
 * @param {number} [serverOffsetMs=0] - Độ lệch giữa giờ server và giờ client.
 * @returns {{ remainingMs: number, isLive: boolean }}
 */
export function usePubgAirdropTimer(
  targetEpochMs,
  serverOffsetMs = 0
) {
  const calcRemaining = () => {
    return Math.max(
      0,
      targetEpochMs - (Date.now() + serverOffsetMs)
    );
  };

  const [remainingMs, setRemainingMs] = useState(calcRemaining);

  useEffect(() => {
    // Đồng bộ ngay khi target hoặc server offset thay đổi.
    const syncRemaining = () => {
      setRemainingMs(calcRemaining());
    };

    // Cập nhật định kỳ dựa trên thời gian thực.
    const intervalId = setInterval(syncRemaining, 200);

    // Đồng bộ ngay khi người dùng quay lại tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncRemaining();
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    // Đồng bộ lần đầu trong effect.
    syncRemaining();

    return () => {
      clearInterval(intervalId);

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [targetEpochMs, serverOffsetMs]);

  return {
    remainingMs,
    isLive: remainingMs === 0,
  };
}
