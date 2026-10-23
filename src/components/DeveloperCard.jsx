
import { Fragment } from 'react';
import SkillBadge from './SkillBadge';
import styles from './Developer.module.css';

/**
 * @typedef {Object} SkillBadgeProps
 * @property {string} id
 * @property {string} name
 * @property {string} tier
 */

/**
 * Displays a developer profile using semantic HTML.
 * 
 * @param {Object} props
 * @param {string} props.fullName - Developer's full name.
 * @param {string} props.role - Developer's role.
 * @param {string} props.avatarUrl - HTTPS URL of the developer's avatar.
 * @param {Record<string, number|string>} props.metrics - Developer metrics.
 * @param {{id: string, name: string, tier: string}[]} props.skills - Developer skills.
 * @returns {JSX.Element}
 */
function DeveloperCard({
  fullName = 'Developer Name',
  role = 'Frontend Developer',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop',
  metrics = {
    Projects: 3,
    Experience: '2 years',
  },
  skills = [
    { id: 'react', name: 'React', tier: 'Advanced' },
    { id: 'css', name: 'CSS', tier: 'Intermediate' },
  ],
}) {
  return (
    <article className={styles.card} aria-labelledby="dev-heading">
      <header className={styles.header}>
        <img
          width="64"
          height="64"
          alt={fullName}
          src={avatarUrl}
        />

        <hgroup>
          <h2 id="dev-heading">{fullName}</h2>
          <p>{role}</p>
        </hgroup>
      </header>

      <dl className={styles.metrics}>
        {Object.entries(metrics).map(([k, v]) => (
          <Fragment key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </Fragment>
        ))}
      </dl>

      <ul className={styles.skills} aria-label="Engineered Skills">
        {skills.map((skill) => (
          <SkillBadge
            key={skill.id}
            id={skill.id}
            name={skill.name}
            tier={skill.tier}
          />
        ))}
      </ul>
    </article>
  );
}

export default DeveloperCard;
