import { useEffect, useState } from 'react';
import { fetchKraftonPubgTelemetry } from '../api/fetchKraftonPubgTelemetry.js';

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

  useEffect(() => {
    const controller = new AbortController();

    setView({
      status: 'LOADING',
      data: null,
      error: null,
    });

    fetchKraftonPubgTelemetry(squadId, {
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
  }, [squadId, retryTick]);

  if (view.status === 'IDLE') {
    return <p>Telemetry is idle.</p>;
  }

  if (view.status === 'LOADING') {
    return <p>Loading PUBG telemetry...</p>;
  }

  if (view.status === 'ERROR') {
    return <p>Telemetry error: {view.error}</p>;
  }

  const squad = view.data;

  return (
    <article aria-live="polite">
      <header>
        <h2>{squad.name}</h2>
        <p>{squad.id.toUpperCase()}</p>
      </header>

      <dl>
        <dt>Map</dt>
        <dd>{squad.map}</dd>

        <dt>Phase</dt>
        <dd>{squad.phase}</dd>

        <dt>Alive</dt>
        <dd>{squad.alive}</dd>

        <dt>Kills</dt>
        <dd>{squad.kills}</dd>

        <dt>WWCD</dt>
        <dd>{squad.wwcdProb}%</dd>

        <dt>Status</dt>
        <dd>{squad.status}</dd>
      </dl>
    </article>
  );
}
