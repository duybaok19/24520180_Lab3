/**
 * Represents one skill badge.
 *
 * @typedef {Object} SkillBadgeProps
 * @property {string} id - Unique identifier for the skill.
 * @property {string} name - Name of the skill.
 * @property {string} tier - Skill proficiency tier.
 */

/**
 * Represents a developer profile card.
 *
 * @typedef {Object} DeveloperCardProps
 * @property {string} fullName - Developer's full name.
 * @property {string} role - Developer's professional or gaming role.
 * @property {string} avatarUrl - HTTPS URL of the developer's avatar.
 * @property {Array<{label: string, value: string|number}>} metrics - Profile metrics to display.
 * @property {Array<SkillBadgeProps>} skills - Skills displayed on the card.
 */

export {};
