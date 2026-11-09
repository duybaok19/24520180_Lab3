import Countdown from './Countdown';
import Leaderboard from './Leaderboard';
import { SAMPLE_DROPS } from './data';
import { useOptimisticClaim } from '../../hooks/useOptimisticClaim';
import { usePubgAirdropTimer } from '../../hooks/usePubgAirdropTimer';
import styles from './KraftonPubgVnArena.module.css';

const currencyVnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

function DropCard({ drop, pending, onClaim }) {
  // Giúp phase tự cập nhật khi countdown chạm thời điểm mở.
  const { remainingMs } = usePubgAirdropTimer(drop.dropEpochMs);

  const phase =
    drop.remainingStock <= 0
      ? 'LOOTED_OUT'
      : remainingMs === 0
        ? 'AIRDROP_LIVE'
        : 'WARMUP';

  const statusId = `drop-status-${drop.id}`;

  const statusText = pending
    ? 'Đang xử lý yêu cầu Claim.'
    : drop.remainingStock <= 0
      ? 'Đã hết hàng.'
      : remainingMs > 0
        ? 'Airdrop chưa mở.'
        : 'Có thể Claim.';

  return (
    <article className={styles.dropCard}>
      <section className={styles.dropInfo}>
        <h3>{drop.title}</h3>

        <p>
          Giá: <strong>{currencyVnd.format(drop.priceVnd)}</strong>
        </p>

        <p>
          Tồn kho: <strong>{drop.remainingStock}</strong>
        </p>

        <Countdown
          targetEpochMs={drop.dropEpochMs}
          phase={phase}
          priceVnd={drop.priceVnd}
        />
      </section>

      <section className={styles.dropActions}>
        <p id={statusId} className={styles.dropStatus}>
          {statusText}
        </p>

        <button
          type="button"
          className={styles.claimButton}
          disabled={pending || drop.remainingStock <= 0}
          aria-describedby={statusId}
          onClick={() => onClaim(drop.id)}
        >
          {pending ? 'Đang xử lý...' : 'Claim'}
        </button>
      </section>
    </article>
  );
}

export default function KraftonPubgVnArena() {
  const {
    drops,
    claim,
    pendingDropIds,
    message,
  } = useOptimisticClaim(SAMPLE_DROPS);

  return (
    <main className={styles.arena}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>KRAFTON × PUBG VIETNAM</p>
        <h1>Airdrop Arena</h1>
        <p>Claim vật phẩm và theo dõi bảng xếp hạng các đội tuyển.</p>
      </header>

      {message && (
        <section
          className={styles.errorMessage}
          role="alert"
        >
          {message}
        </section>
      )}

      <section
        className={styles.dropSection}
        aria-labelledby="drops-heading"
      >
        <h2 id="drops-heading">Airdrop Drops</h2>

        <ul className={styles.dropList}>
          {drops.map((drop) => (
            <li key={drop.id}>
              <DropCard
                drop={drop}
                pending={pendingDropIds.has(drop.id)}
                onClaim={claim}
              />
            </li>
          ))}
        </ul>
      </section>

      <section
        className={styles.leaderboardSection}
        aria-labelledby="leaderboard-heading"
      >
        <h2 id="leaderboard-heading">Championship Leaderboard</h2>

        <section className={styles.tableViewport}>
          <Leaderboard />
        </section>
      </section>
    </main>
  );
}