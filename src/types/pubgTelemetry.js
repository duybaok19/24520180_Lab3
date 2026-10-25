/**
 * @typedef {Object} SquadTelemetry
 * @property {'ces' | 'te' | 'ge'} id - Stable squad identifier.
 * @property {string} name - Squad name.
 * @property {'Erangel' | 'Miramar' | 'Taego'} map - Current map.
 * @property {number} phase - Current match phase.
 * @property {number} alive - Number of surviving squad members.
 * @property {number} kills - Total squad kills.
 * @property {number} wwcdProb - Win probability percentage.
 * @property {string} status - Current tactical status.
 */

/**
 * @typedef {
 *   | { status: 'IDLE', data: null, error: null }
 *   | { status: 'LOADING', data: null, error: null }
 *   | { status: 'SUCCESS', data: SquadTelemetry, error: null }
 *   | { status: 'ERROR', data: null, error: string }
 * } ViewState
 */

export {};
