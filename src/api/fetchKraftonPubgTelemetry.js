import { PUBG_VN_SQUADS } from '../data/pubgVnSquads.js';

/**
 * Mock PUBG Vietnam telemetry API.
 *
 * @param {'ces' | 'te' | 'ge'} squadId
 * @param {{ signal: AbortSignal }} options
 * @returns {Promise<import('../types/pubgTelemetry.js').SquadTelemetry>}
 */
export function fetchKraftonPubgTelemetry(squadId, { signal }) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const squad = PUBG_VN_SQUADS.find(
      (item) => item.id === squadId
    );

    if (!squad) {
      reject(new Error('Unknown squad'));
      return;
    }

    const delay = 600 + Math.random() * 600;

    const timeoutId = setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);

      if (
        (squad.map === 'Erangel' || squad.map === 'Miramar') &&
        Math.random() < 0.35
      ) {
        reject(new Error('Satellite packet lost'));
        return;
      }

      resolve(squad);
    }, delay);

    function handleAbort() {
      clearTimeout(timeoutId);
      signal.removeEventListener('abort', handleAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    }

    signal.addEventListener('abort', handleAbort, { once: true });
  });
}
