import { useCallback, useEffect, useRef, useState } from 'react';
import { claimDrop } from '../api/claimDrop';

/**
 * @typedef {import('../homeworks/KraftonPubgVnArena/types').PubgCrateDrop} PubgCrateDrop
 */

/**
 * @param {PubgCrateDrop[]} initialDrops
 */
export function useOptimisticClaim(initialDrops) {
  const [drops, setDrops] = useState(initialDrops);
  const [pendingDropIds, setPendingDropIds] = useState(() => new Set());
  const [message, setMessage] = useState('');

  // Set các claimId đang được xử lý.
  const inFlight = useRef(new Set());

  // Khóa theo dropId để chống bấm trùng cùng một drop.
  const inFlightDrops = useRef(new Set());

  // Lưu AbortController của từng request.
  const controllers = useRef(new Map());

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;

      // Hủy tất cả request khi component unmount.
      controllers.current.forEach((controller) => {
        controller.abort();
      });

      controllers.current.clear();
    };
  }, []);

  const claim = useCallback(async (dropId) => {
    // Không cho gửi request trùng cùng drop.
    if (inFlightDrops.current.has(dropId)) {
      return;
    }

    const targetDrop = drops.find((drop) => drop.id === dropId);

    if (!targetDrop || targetDrop.remainingStock <= 0) {
      return;
    }

    const claimId = crypto.randomUUID();
    const controller = new AbortController();

    inFlight.current.add(claimId);
    inFlightDrops.current.add(dropId);
    controllers.current.set(claimId, controller);

    setPendingDropIds((prev) => new Set(prev).add(dropId));
    setMessage('');

    // Optimistic update: trừ kho ngay lập tức.
    setDrops((prev) =>
      prev.map((drop) =>
        drop.id === dropId
          ? {
              ...drop,
              remainingStock: Math.max(0, drop.remainingStock - 1),
            }
          : drop
      )
    );

    try {
      const result = await claimDrop(dropId, claimId, {
        signal: controller.signal,
      });

      if (!result.ok) {
        // Rollback bằng functional update, không dùng snapshot cũ.
        setDrops((prev) =>
          prev.map((drop) =>
            drop.id === dropId
              ? {
                  ...drop,
                  remainingStock: drop.remainingStock + 1,
                }
              : drop
          )
        );

        if (mounted.current) {
          setMessage(result.message);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Không hiển thị lỗi khi request bị hủy.
        return;
      }

      // Lỗi request cũng cần rollback optimistic update.
      setDrops((prev) =>
        prev.map((drop) =>
          drop.id === dropId
            ? {
                ...drop,
                remainingStock: drop.remainingStock + 1,
              }
            : drop
        )
      );

      if (mounted.current) {
        setMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      }
    } finally {
      inFlight.current.delete(claimId);
      inFlightDrops.current.delete(dropId);
      controllers.current.delete(claimId);

      if (mounted.current) {
        setPendingDropIds((prev) => {
          const next = new Set(prev);
          next.delete(dropId);
          return next;
        });
      }
    }
  }, [drops]);

  return {
    drops,
    claim,
    pendingDropIds,
    message,
  };
}