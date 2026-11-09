/**
 * @typedef {Object} Note
 * @property {number} midi - MIDI note number
 * @property {string} noteName - Tên nốt nhạc, ví dụ C4 hoặc A#3
 * @property {boolean} isBlack - true nếu là phím đen
 * @property {number} freqHz - Tần số của nốt nhạc (Hz)
 */

/**
 * @typedef {Object} RecordedEvent
 * @property {number} midi - MIDI note number
 * @property {number} freqHz - Tần số của nốt nhạc (Hz)
 * @property {number} durationMs - Thời gian giữ phím (milliseconds)
 * @property {number} deltaMs - Khoảng cách thời gian từ sự kiện trước (milliseconds)
 */

/**
 * Tốc độ phát lại bản ghi.
 * @typedef {0.5 | 1 | 2} PlaybackRate
 */

/**
 * Polyphonic Piano invariants:
 *
 * 1. Tối đa 8 giọng (voices) được phát đồng thời.
 *
 * 2. Khi số giọng đang phát đạt giới hạn 8 và có nốt mới,
 *    hệ thống phải giải phóng giọng cũ nhất trước khi tạo giọng mới.
 *
 * 3. Thứ tự cướp giọng là FIFO:
 *    First In, First Out.
 *
 * 4. deltaMs là khoảng thời gian từ sự kiện trước đó
 *    đến sự kiện hiện tại.
 *
 * 5. durationMs là thời gian giữ một phím.
 */
