// src/homeworks/KraftonPubgVnArena/data.js

/**
 * IMPORTANT:
 * All drop inventory and squad statistics below are SAMPLE DATA.
 * They are fictional values created for this homework.
 *
 * Squad contract adjustment:
 * 'roy' = Roy Esports, replacing 'ge' from the slide contract.
 */

/**
 * @type {import('./types').PubgCrateDrop[]}
 */
export const SAMPLE_DROPS = [
  {
    id: 'pvs-vip-grand-finals',
    title: 'Vé VIP PVS Grand Finals',
    priceVnd: 500000,
    remainingStock: 100,
    dropEpochMs: Date.UTC(2026, 11, 1, 12, 0, 0),
  },
  {
    id: 'gcoin-crate',
    title: 'G-Coin Crate',
    priceVnd: 100000,
    remainingStock: 250,
    dropEpochMs: Date.UTC(2026, 11, 1, 12, 30, 0),
  },
];

/**
 * @type {import('./types').PubgVnSquadStanding[]}
 */
export const SAMPLE_SQUADS = [
  {
    squadId: 'te',
    squadName: 'The Expendables',
    wwcdCount: 3,
    placementPts: 42,
    killPts: 58,
  },
  {
    squadId: 'ces',
    squadName: 'Cerberus Esports',
    wwcdCount: 2,
    placementPts: 36,
    killPts: 51,
  },
  {
    squadId: 'roy',
    squadName: 'Roy Esports',
    wwcdCount: 2,
    placementPts: 32,
    killPts: 47,
  },
  {
    squadId: 'agg',
    squadName: 'AGG',
    wwcdCount: 1,
    placementPts: 28,
    killPts: 39,
  },
];