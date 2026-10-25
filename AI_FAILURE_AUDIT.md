# AI Failure Audit — Lab 3

## Exercise 1 — DeveloperCard and SkillBadge

### Failure 1: Component Filename Case Mismatch

**Prompt / Task:**  
Create and integrate the `SkillBadge` component into the developer profile card.

**AI Code / Initial Implementation:**  
The component file was initially named `Skillbadge.jsx`, while the standardized filename became `SkillBadge.jsx`.

**Bug:**  
The filename used inconsistent capitalization. On case-sensitive filesystems, an import whose capitalization does not match the actual filename can fail to resolve the module.

**DevTools / Git Proof:**  
Git confirms that the file was renamed:

- Before: `src/components/Skillbadge.jsx`
- After: `src/components/SkillBadge.jsx`

No original runtime error screenshot is currently available, so an actual module-resolution failure has not been independently verified.

**Engineering Fix:**  
Standardized the filename to `SkillBadge.jsx` to match the component name and import convention.

**Fix Commit:** `ff43e857594f7950404c545aa9788a2c3b70969a`

---

### Failure 2: SkillBadge Props Contract Mismatch

**Prompt / Task:**  
Implement `SkillBadge` according to the shared component contract.

**AI Code / Initial Implementation:**
```jsx
function SkillBadge({ name = 'Unknown Skill', tier = 'Beginner' }) {
  return <li>{name} ({tier})</li>;
}
```

**Bug:**  
The shared `SkillBadgeProps` contract defines `id`, `name`, and `tier`, but the initial function signature did not accept `id`. Meanwhile, `DeveloperCard` passed all three props.

This was a contract mismatch. The available evidence does not establish that it caused a runtime failure.

**DevTools / Git Proof:**  
The contract is defined in `src/components/component_contracts.js`. The caller in `src/components/DeveloperCard.jsx` passes `key={skill.id}` and `id={skill.id}`.

Git shows the function signature changing to include `id` in commit `8e8e488`.

No DevTools runtime error has been verified for this case.

**Engineering Fix:**
```jsx
function SkillBadge({ id, name = 'Unknown Skill', tier = 'Beginner' }) {
  return <li>{name} ({tier})</li>;
}
```

**Fix Commit:** `8e8e4882a393dae3b82cb0f175747a6b4519ce26`

---

## Exercise 2 — Scientist Directory

### Audit Status

No independently verified AI-generated failure has been established from the available Git history.

**Code Reviewed:**  
The `ScientistDirectory` implementation in commit `8e9092a` uses:

- `useState` for independent user-controlled state.
- `.filter()` for search and minimum-IQ filtering.
- `.toSorted()` to create a sorted result without mutating the original array.
- `useId()` for accessible form control IDs.

**Potential Failure Categories Checked:**

- Unnecessary `useEffect` for synchronizing derived filtered results.
- In-place array mutation using `.sort()`.
- Unstable list keys such as `key={index}`.

The reviewed code uses a derived list during rendering, `.toSorted()`, and stable person IDs. These patterns do not establish any of the above failures.

**DevTools / Git Proof:**  
Commit `8e9092a` contains the search, IQ filter, and sorting implementation. No verified AI-generated bug, failing test, or DevTools error has been identified from the available evidence.

**Engineering Fix:**  
No additional fix is claimed because a specific failure has not been verified.

---

## Exercise 3 — PUBG VN Telemetry

### Audit Status

No independently verified AI-generated failure has been established from the available Git history.

**Code Reviewed:**  
The initial telemetry implementation in commit `455ff69` includes:

- A four-state status model: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- An `AbortController` passed to the fetch function.
- Handling for `AbortError`.
- Cleanup using `controller.abort()`.
- An effect dependency array containing `squadId` and `retryTick`.

The later implementation in commit `8614917` adds squad selection, skeleton loading UI, an error alert, and a retry button.

**Potential Failure Categories Checked:**

- Missing `AbortController` cleanup.
- Missing or incorrect effect dependencies.
- Stale asynchronous requests overwriting newer data.

The initial implementation already includes cancellation and cleanup. The supplied diffs do not demonstrate a confirmed stale-request bug or an AI-generated dependency error.

**DevTools / Git Proof:**  
Commits `455ff69` and `8614917` establish the initial implementation and subsequent UI enhancements. No verified failing request trace or stale-data reproduction has been provided.

**Engineering Fix:**  
No additional bug fix is claimed because a specific failure has not been verified.
