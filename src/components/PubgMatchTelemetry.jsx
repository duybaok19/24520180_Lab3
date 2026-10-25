import { useEffect, useState } from 'react';
import { fetchKraftonPubgTelemetry } from '../api/fetchKraftonPubgTelemetry.js';
import './PubgMatchTelemetry.css';

/**
 * @param {{ squadId?: 'ces' | 'te' | 'ge' }} props
 */
export default function PubgMatchTelemetry({ squadId = 'te' }) {
  const [view, setView] = useState({
    status: 'IDLE',
    data: null,
    error: null,
  });

  const [retryTick, setRetryTick] = useState(0);
  const [selectedSquadId, setSelectedSquadId] = useState(squadId);

  const squads = [
    { id: 'ces', label: 'CES' },
    { id: 'te', label: 'TE' },
    { id: 'ge', label: 'GE' },
  ];

  useEffect(() => {
    const controller = new AbortController();

    setView({
      status: 'LOADING',
      data: null,
      error: null,
    });

    fetchKraftonPubgTelemetry(selectedSquadId, {
      signal: controller.signal,
    })
      .then((data) => {
        setView({
          status: 'SUCCESS',
          data,
          error: null,
        });
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return;
        }

        setView({
          status: 'ERROR',
          data: null,
          error: err.message,
        });
      });

    return () => {
      controller.abort();
    };
  }, [selectedSquadId, retryTick]);

  return (
    <main className="pubg-telemetry">
      <header>
        <h1>KRAFTON PUBG Vietnam Live Telemetry</h1>
      </header>

      <nav aria-label="Select squad" className="squad-selector">
        {squads.map((squad) => (
          <button
            key={squad.id}
            type="button"
            aria-pressed={selectedSquadId === squad.id}
            onClick={() => setSelectedSquadId(squad.id)}
          >
            {squad.label}
          </button>
        ))}
      </nav>

      {view.status === 'IDLE' && (
        <p>Telemetry is idle.</p>
      )}

      {view.status === 'LOADING' && (
        <section
          className="telemetry-skeleton"
          aria-busy="true"
          aria-label="Loading match telemetry"
        >
          <p>Syncing KRAFTON Radar...</p>

          <span className="skeleton-bar skeleton-title" />
          <span className="skeleton-bar" />
          <span className="skeleton-bar" />
          <span className="skeleton-bar" />
        </section>
      )}

      {view.status === 'ERROR' && (
        <section role="alert" className="telemetry-error">
          <p>Blue-Zone Link Lost: {view.error}</p>

          <button
            type="button"
            onClick={() => setRetryTick((tick) => tick + 1)}
          >
            Reconnect Satellite (Retry)
          </button>
        </section>
      )}

      {view.status === 'SUCCESS' && (
        <article aria-live="polite">
          <header>
            <h2>{view.data.name}</h2>
            <p>{view.data.id.toUpperCase()}</p>
          </header>

          <dl>
            <dt>Map</dt>
            <dd>{view.data.map}</dd>

            <dt>Phase</dt>
            <dd>{view.data.phase}</dd>

            <dt>Alive</dt>
            <dd>{view.data.alive}</dd>

            <dt>Kills</dt>
            <dd>{view.data.kills}</dd>

            <dt>WWCD</dt>
            <dd>{view.data.wwcdProb}%</dd>

            <dt>Status</dt>
            <dd>{view.data.status}</dd>
          </dl>
        </article>
      )}
    </main>
  );
}
