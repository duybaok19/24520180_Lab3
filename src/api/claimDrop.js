
/** @typedef {import('../homeworks/KraftonPubgVnArena/types').ClaimResult} ClaimResult */

// Mock server state: tồn tại xuyên suốt các lần gọi API.
let serverStock = 100;

// Lưu Promise/kết quả theo claimId để chống xử lý trùng.
const processedClaims = new Map();

/**
 * Mock API nhận Airdrop.
 *
 * @param {string} dropId
 * @param {string} claimId
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<ClaimResult>}
 */
export function claimDrop(dropId, claimId, { signal } = {}) {
  if (signal?.aborted) {
    return Promise.reject(
      new DOMException('Aborted', 'AbortError'),
    );
  }

  const previousClaim = processedClaims.get(claimId);

  if (previousClaim) {
    return previousClaim;
  }

  const claimPromise = new Promise((resolve, reject) => {
    const delay = 400 + Math.floor(Math.random() * 501);

    const timerId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);

      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      /** @type {ClaimResult} */
      let result;

      if (serverStock > 0) {
        serverStock -= 1;
        result = { ok: true };
      } else {
        result = {
          ok: false,
          status: 409,
          message: 'Looted Out',
        };
      }

      resolve(result);
    }, delay);

    function handleAbort() {
      clearTimeout(timerId);
      signal?.removeEventListener('abort', handleAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    }

    signal?.addEventListener('abort', handleAbort, { once: true });
  });

  // Đặt Promise vào Map ngay lập tức, trước khi request hoàn tất.
  processedClaims.set(claimId, claimPromise);

  // Nếu request bị abort, cho phép claimId được thử lại.
  claimPromise.catch((error) => {
    if (error.name === 'AbortError') {
      processedClaims.delete(claimId);
    }
  });

  return claimPromise;
}

/**
 * Reset mock server stock for testing.
 *
 * @param {number} n
 */
export function resetServerStock(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError('Stock must be a non-negative integer');
  }

  serverStock = n;
  processedClaims.clear();
}
