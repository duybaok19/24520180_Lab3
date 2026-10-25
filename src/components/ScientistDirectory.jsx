
import { useId, useState } from 'react';
import { SMART_PEOPLE } from '../data/smartPeople.js';

export default function ScientistDirectory() {
  // Independent source state only
  const [people, setPeople] = useState(SMART_PEOPLE);
  const [query, setQuery] = useState('');
  const [minIq, setMinIq] = useState(160);
  const [sortBy, setSortBy] = useState('iq-desc');

  // Accessible form IDs
  const searchId = useId();
  const minIqId = useId();
  const sortId = useId();

  // Derived state: calculate during render, never useEffect
  const normalizedQuery = query.trim().toLowerCase();

  const visible = people
    .filter(
      (person) =>
        person.name.toLowerCase().includes(normalizedQuery) &&
        person.iq >= minIq
    )
    .toSorted((a, b) => {
      if (sortBy === 'age-asc') {
        return a.age - b.age;
      }

      return b.iq - a.iq;
    });

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main>
      <section aria-labelledby="directory-heading">
        <header>
          <h1 id="directory-heading">
            Scientist &amp; Pioneer Directory
          </h1>
          <p>Search and explore the directory.</p>
        </header>

        <form role="search" onSubmit={handleSubmit}>
          <p>
            <label htmlFor={searchId}>Search by name</label>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter a name..."
            />
          </p>

          <p>
            <label htmlFor={minIqId}>Minimum IQ</label>
            <input
              id={minIqId}
              type="number"
              value={minIq}
              onChange={(event) => {
                const value = event.target.valueAsNumber;
                setMinIq(Number.isNaN(value) ? 0 : value);
              }}
            />
          </p>

          <p>
            <label htmlFor={sortId}>Sort by</label>
            <select
              id={sortId}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="iq-desc">IQ: highest first</option>
              <option value="age-asc">Age: lowest first</option>
            </select>
          </p>

          <button type="submit">Search</button>
        </form>

        <section aria-label="Directory results">
          <p role="status" aria-live="polite">
            Showing {visible.length} of {people.length} people
          </p>

          <ul>
            {visible.map((person) => (
              <li key={person.id}>
                <article>
                  <h2>{person.name}</h2>
                  <dl>
                    <dt>Age</dt>
                    <dd>{person.age}</dd>
                    <dt>IQ</dt>
                    <dd>{person.iq}</dd>
                  </dl>
                </article>
              </li>
            ))}
          </ul>

          {visible.length === 0 && (
            <p>No people match your search criteria.</p>
          )}
        </section>
      </section>
    </main>
  );
}
