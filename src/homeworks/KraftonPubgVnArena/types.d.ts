// src/homeworks/KraftonPubgVnArena/types.d.ts

/**
 * Các giai đoạn của một đợt Airdrop.
 *
 * WARMUP      : Chưa đến thời điểm mở.
 * AIRDROP_LIVE: Đang mở nhận crate.
 * LOOTED_OUT  : Đã hết hàng.
 * EXPIRED     : Đợt Airdrop đã hết hạn.
 */
export type DropPhase =
  | 'WARMUP'
  | 'AIRDROP_LIVE'
  | 'LOOTED_OUT'
  | 'EXPIRED';

/**
 * Thông tin một đợt Airdrop.
 */
export interface PubgCrateDrop {
  readonly id: string;
  readonly title: string;
  readonly priceVnd: number;
  readonly remainingStock: number;
  readonly dropEpochMs: number;
}

/**
 * Thông tin thành tích của một squad.
 *
 * Lưu ý: squadId 'roy' được dùng cho Roy Esports
 * theo phần mô tả, thay cho 'ge' trong contract slide.
 */
export interface PubgVnSquadStanding {
  readonly squadId: 'te' | 'ces' | 'roy' | 'agg';
  readonly squadName: string;
  readonly wwcdCount: number;
  readonly placementPts: number;
  readonly killPts: number;
}

/**
 * Kết quả của thao tác Claim.
 *
 * Thành công: { ok: true }
 * Thất bại: { ok: false, status: 409 | 500, message: string }
 */
export type ClaimResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      status: 409 | 500;
      message: string;
    };

/**
 * Bảng chuyển trạng thái Airdrop:
 *
 * WARMUP
 *   └── Đến thời điểm drop → AIRDROP_LIVE
 *
 * AIRDROP_LIVE
 *   ├── Hết hàng → LOOTED_OUT
 *   └── Hết hạn → EXPIRED
 *
 * LOOTED_OUT và EXPIRED là trạng thái kết thúc.
 */