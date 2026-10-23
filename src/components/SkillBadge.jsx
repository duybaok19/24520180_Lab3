/**
 * Displays a skill name and its proficiency tier.
 *
 * @param {Object} props
 * @param {string} props.id - Unique skill identifier.
 * @param {string} props.name - Name of the skill.
 * @param {string} props.tier - Proficiency tier of the skill.
 * @returns {JSX.Element} A list item containing the skill information.
 */
function SkillBadge({ name = 'Unknown Skill', tier = 'Beginner' }) {
  return <li>{name} ({tier})</li>;
}

export default SkillBadge;
