import { useId, useState } from 'react';
import { SAMPLE_SQUADS } from './data';

export default function Leaderboard() {
  // Chỉ có 4 state gốc theo yêu cầu.
  const [standings] = useState(SAMPLE_SQUADS);
  const [query, setQuery] = useState('');
  const [minKillPts, setMinKillPts] = useState(0);
  const [sortBy, setSortBy] = useState('wwcd-desc');

  // ID cho các label và control.
  const queryId = useId();
  const minKillPtsId = useId();
  const sortById = useId();

  // Lọc và sắp xếp trực tiếp trong render.
  const visibleStandings = standings
    .filter((squad) => {
      const matchesQuery = squad.squadName
        .toLowerCase()
        .includes(query.trim().toLowerCase());

      const matchesKillPts = squad.killPts >= minKillPts;

      return matchesQuery && matchesKillPts;
    })
    .toSorted((a, b) => {
      switch (sortBy) {
        case 'placement-desc':
          return b.placementPts - a.placementPts;

        case 'kill-desc':
          return b.killPts - a.killPts;

        case 'wwcd-desc':
        default:
          return b.wwcdCount - a.wwcdCount;
      }
    });

  return (
    <section className="leaderboard" aria-labelledby="leaderboard-title">
      <h2 id="leaderboard-title">PUBG Vietnam Leaderboard</h2>

      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <p>
          <label htmlFor={queryId}>Tìm kiếm đội tuyển</label>
          <input
            id={queryId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nhập tên đội tuyển..."
          />
        </p>

        <p>
          <label htmlFor={minKillPtsId}>
            Điểm hạ gục tối thiểu
          </label>
          <input
            id={minKillPtsId}
            type="number"
            min="0"
            value={minKillPts}
            onChange={(event) => {
              const value = event.target.valueAsNumber;
              setMinKillPts(Number.isNaN(value) ? 0 : value);
            }}
          />
        </p>

        <p>
          <label htmlFor={sortById}>Sắp xếp theo</label>
          <select
            id={sortById}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="wwcd-desc">WWCD giảm dần</option>
            <option value="placement-desc">Placement Points giảm dần</option>
            <option value="kill-desc">Kill Points giảm dần</option>
          </select>
        </p>
      </form>

      <output role="status" aria-live="polite">
        Tìm thấy {visibleStandings.length} đội tuyển.
      </output>

      <table>
        <caption>Bảng xếp hạng các đội tuyển PUBG Vietnam</caption>

        <thead>
          <tr>
            <th scope="col">Đội tuyển</th>
            <th scope="col">WWCD</th>
            <th scope="col">Placement Pts</th>
            <th scope="col">Kill Pts</th>
            <th scope="col">Tổng điểm</th>
          </tr>
        </thead>

        <tbody>
          {visibleStandings.map((squad) => (
            <tr key={squad.squadId}>
              <th scope="row">{squad.squadName}</th>
              <td>{squad.wwcdCount}</td>
              <td>{squad.placementPts}</td>
              <td>{squad.killPts}</td>
              <td>{squad.placementPts + squad.killPts}</td>
            </tr>
          ))}

          {visibleStandings.length === 0 && (
            <tr>
              <td colSpan="5">Không tìm thấy đội tuyển phù hợp.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}