# UIT S3T - LAB 3 AI GOVERNANCE RULES

1. **STACK:** React 19 + Vite + ES2024.
2. **NO LEGACY APIS:** Ban `class extends React.Component`, `ReactDOM.render`, `defaultProps`, `keyCode`, and `window.alert`.
3. **ZERO DIV-SOUP:** Use semantic elements such as `<main>`, `<section>`, `<article>`, `<header>`, `<dl>`, `<dt>`, `<dd>`, `<figure>`, and `<output>`.
4. **ACCESSIBLE FORMS:** Pair every `<input>` and `<select>` with `<label htmlFor={id}>`, using React 19 `useId()`.
5. **STATE HYGIENE:** Use immutable updates only. Never synchronize derived filter/sort state inside `useEffect`.
6. **EFFECT CLEANUP:** Every timer, listener, or fetch in `useEffect` must return cleanup logic or use `AbortController` where appropriate.