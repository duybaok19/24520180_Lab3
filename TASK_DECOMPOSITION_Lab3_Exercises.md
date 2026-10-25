# TASK_DECOMPOSITION.md — Lab 3: Production React 19, Fiber Hooks & Concurrent UI

**Môn:** Web Application Development — Lab 3
**Phạm vi:** Exercise 1, 2, 3 (In-Class Sprint 1 / 2 / 3)
**Sinh viên:** _(điền họ tên + MSSV)_ | **Ngày:** _(điền ngày)_

> **RULE (Anti-Monolithic):** Mỗi prompt chỉ giải quyết **1 sub-task**. Copy nguyên một Exercise vào ChatGPT/Claude/Cursor = 0% phần Git & Audit (15%). Quy trình mỗi sub-task: **Slice → Contract → Prompt (kèm project-rules.md) → Verify → Commit**.

---

## 0. Bản đồ tổng quan (đọc trước khi làm)

| Block | Thời gian | Việc | Commit (đúng theo slide) |
|---|---|---|---|
| 1 | 00–40' | Setup Vite + React 19, `project-rules.md`, `TASK_DECOMPOSITION.md` | `chore: init react19 vite & rules` |
| 2 | 40–75' | **Exercise 1** — `DeveloperCard` + `SkillBadge` | `feat(ex1): implement semantic DeveloperCard and SkillBadge` → `style(ex1): add responsive 375px CSS module` |
| 3 | 75–120' | **Exercise 2** — `ScientistDirectory` | `feat(ex2): normalize smartPeople schema with stable IDs` → `feat(ex2): add search, IQ filter & toSorted` → `feat(ex2): add delete/reset & live status` |
| 4 | 120–155' | **Exercise 3** — `PubgMatchTelemetry` | `feat(ex3): implement PUBG VN 4-state telemetry & AbortController` → `feat(ex3): add skeleton UI & retry alert` |
| 5 | 155–180' | Live Defense 3 phút (đóng toàn bộ AI) | — |

**Tổng: 8 commit** (slide yêu cầu tối thiểu 6–8). Mỗi commit = 1 dòng trong `git log --oneline`; thầy sẽ đối chiếu với file này.

**Cấu trúc thư mục đích:**
```
project-rules.md
TASK_DECOMPOSITION.md
AI_FAILURE_AUDIT.md
src/components/DeveloperCard.jsx (+ .module.css), SkillBadge.jsx
src/components/ScientistDirectory.jsx
src/components/PubgMatchTelemetry.jsx
```

---

## BLOCK 1 — Setup & WBS (00–40')

### S-1: Khởi tạo Vite + React 19
Lệnh (không cần AI):
```
npm create vite@latest lab3 -- --template react
cd lab3 && npm install && git init
npm ls react        # xác nhận react@19.x
```
Sửa `src/main.jsx` đúng chuẩn bắt buộc: `createRoot(document.getElementById('root'))` + `<StrictMode>`; **cấm** `ReactDOM.render`, `import * as React`.
**Verify:** `npm run dev` chạy, không warning trong Console.

### S-2: Tạo `project-rules.md` (đưa cho AI ở MỌI prompt)
```
# UIT S3T - LAB 3 AI GOVERNANCE RULES (.cursorrules)
1. STACK: React 19 + Vite + ES2024.
2. NO LEGACY APIS: Ban class extends React.Component, ReactDOM.render,
   defaultProps, keyCode, window.alert.
3. ZERO DIV-SOUP: Use <main>, <section>, <article>, <header>, <dl>,
   <dt>, <dd>, <figure>, <output>.
4. A11Y FORMS: Pair every <input>/<select> with <label htmlFor={id}>
   using React 19 useId().
5. STATE HYGIENE: Immutable updates only. Never sync derived
   filter/sort state inside useEffect.
6. EFFECT CLEANUP: Every timer, listener, or fetch in useEffect MUST
   return a cleanup / AbortController.
```
### S-3: Tạo `TASK_DECOMPOSITION.md` (chính file này) → đây là bước "define sub-tasks BEFORE calling AI".
### S-4: Commit
`git add project-rules.md TASK_DECOMPOSITION.md . && git commit -m "chore: init react19 vite & rules"`

---

## BLOCK 2 — EXERCISE 1: Semantic Engineer & Pro-Gamer Profile Card (35')

**Mục tiêu:** `<DeveloperCard />` + `<SkillBadge />`, **0 thẻ `<div>`**, CSS Modules, đúng ở 375px, ảnh HTTPS có `width/height`.

| Task | Sub-task | Output | Trạng thái |
|---|---|---|---|
| T1.1 | Contract props (JSDoc) | comment trong file | [ ] |
| T1.2 | `SkillBadge` | `SkillBadge.jsx` | [ ] |
| T1.3 | `DeveloperCard` (semantic + dl + Fragment key) | `DeveloperCard.jsx` | [ ] |
| T1.4 | Verify zero-div / HTTPS → **Commit 1** | — | [ ] |
| T1.5 | CSS Module responsive 375px → **Commit 2** | `DeveloperCard.module.css` | [ ] |

### T1.1 — Contract trước khi code (tự viết hoặc prompt ngắn)
```
Chỉ viết JSDoc (KHÔNG viết JSX) mô tả props cho 2 component:
- SkillBadge({ id: string, name: string, tier: string })
- DeveloperCard({ fullName, role, avatarUrl, metrics: Record<string, number|string>, skills: SkillBadgeProps[] })
Mọi prop có giá trị mặc định dùng ES6 default parameter (cấm defaultProps).
```

### T1.2 — SkillBadge
```
[đính kèm project-rules.md]
Viết src/components/SkillBadge.jsx: function component thuần, nhận
{ name, tier }, render MỘT thẻ <li> hiển thị "{name} ({tier})".
Không <div>, không class component, không import * as React.
Chỉ viết component này.
```

### T1.3 — DeveloperCard
```
[đính kèm project-rules.md + SkillBadge.jsx]
Viết src/components/DeveloperCard.jsx với yêu cầu:
- Thẻ gốc <article aria-labelledby="dev-heading">.
- <header> chứa <img> (width="64" height="64", alt = fullName, src
  PHẢI là https) và <hgroup> gồm <h2 id="dev-heading">{fullName}</h2>
  + <p>{role}</p>.
- Metrics hiển thị bằng <dl>: Object.entries(metrics).map(([k, v]) =>
  <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>).
- Skills: <ul aria-label="Engineered Skills"> map <SkillBadge/> với
  key = skill.id (KHÔNG dùng index).
- ES6 default parameters cho mọi prop. Import styles từ
  './DeveloperCard.module.css'.
- TUYỆT ĐỐI không dùng thẻ <div>. Chưa viết CSS.
```

### T1.4 — Verify rồi Commit 1
```
grep -n '<div'   src/components/DeveloperCard.jsx    # kỳ vọng: 0 kết quả
grep -n 'http://' src/components/DeveloperCard.jsx   # kỳ vọng: 0 kết quả
```
DevTools → Elements → **Accessibility tree**: `article → header + dl + list`.
`git commit -m "feat(ex1): implement semantic DeveloperCard and SkillBadge"`

### T1.5 — CSS Module 375px → Commit 2
```
[đính kèm DeveloperCard.jsx + project-rules.md]
Viết DeveloperCard.module.css cho các class styles.card, .header,
.metrics, .skills. Yêu cầu: mobile-first (viết cho 375px trước),
KHÔNG hardcode hex — dùng CSS custom properties (var(--...)) khai
báo ở :root; .metrics dùng CSS Grid (2 cột dt/dd); .skills dùng
Flexbox flex-wrap + gap; không có scroll ngang ở 375px. Không dùng
inline style. Chỉ viết file CSS này.
```
**Verify:** DevTools Device Toolbar → iPhone SE (375px) → **0 horizontal scroll**.
`git commit -m "style(ex1): add responsive 375px CSS module"`

**✅ Checkpoint 1 (phút 75):** 0 `<div>` · 0 `http://` · Accessibility tree đúng · 375px sạch · `git log` có 2 commit ex1.

---

## BLOCK 3 — EXERCISE 2: Interactive Scientist & Pioneer Directory (45')

**Mục tiêu:** Danh sách tương tác với **derived state** (cấm `useEffect` cho lọc/sắp xếp), form accessible bằng `useId()`, `valueAsNumber`, `.toSorted()`.

| Task | Sub-task | Commit |
|---|---|---|
| T2.1 | Dataset `SMART_PEOPLE` với ID ổn định | Commit 1 |
| T2.2 | State gốc + derived `visible` (filter + `toSorted`) + form search/IQ/sort | Commit 2 |
| T2.3 | Delete (immutable) + Reset + `<output role="status">` | Commit 3 |
| T2.4 | Audit Profiler / 0 useEffect / label | — |

### T2.1 — Schema ổn định → Commit 1
Dataset bắt buộc (6 người, `id` cố định `sp-1`…`sp-6`):
```
Johann Goethe (82, IQ 210) · Albert Einstein (76, 205) · Leonardo da Vinci (67, 180)
Isaac Newton (84, 190) · James Maxwell (48, 190) · William Sidis (46, 200)
```
```
[đính kèm project-rules.md]
Tạo src/data/smartPeople.js export const SMART_PEOPLE = [...] gồm 6
object { id, name, age, iq } với id ổn định 'sp-1'..'sp-6' (KHÔNG
dùng Math.random()/index). Thêm JSDoc kiểu cho Person. Chỉ viết file
dữ liệu, không viết component.
```
`git commit -m "feat(ex2): normalize smartPeople schema with stable IDs"`

T2.1 — Schema ổn định → Commit 1

Dataset bắt buộc (7 người: 6 nhà khoa học theo slide + bản thân em, id cố định sp-1…sp-7):

Johann Goethe (82, IQ 210) · Albert Einstein (76, 205) · Leonardo da Vinci (67, 180)
Isaac Newton (84, 190) · James Maxwell (48, 190) · William Sidis (46, 200)
+ [TÊN CỦA EM] ([TUỔI], IQ [SỐ])   ← sp-7



⚠️ Lưu ý bộ lọc mặc định minIq = 160 (theo slide): nếu IQ em đặt < 160 thì dòng của em sẽ bị ẩn khi mở trang và <output> chỉ báo 6. Chọn một trong hai: (a) đặt IQ của em ≥ 160, hoặc (b) hạ minIq mặc định xuống 0. Dù chọn cách nào cũng nhớ khi Live Defense là bộ đếm phải đúng (7 khi lọc rỗng, và Reset phải khôi phục đủ 7 người).

[đính kèm project-rules.md]
Tạo src/data/smartPeople.js export const SMART_PEOPLE = [...] gồm 7
object { id, name, age, iq } với id ổn định 'sp-1'..'sp-7' (KHÔNG
dùng Math.random()/index). Sáu người đầu: Johann Goethe 82/210,
Albert Einstein 76/205, Leonardo da Vinci 67/180, Isaac Newton 84/190,
James Maxwell 48/190, William Sidis 46/200. Người thứ bảy (sp-7):
name '[TÊN CỦA EM]', age [TUỔI], iq [SỐ]. Thêm JSDoc kiểu cho Person.
Chỉ viết file dữ liệu, không viết component.

git commit -m "feat(ex2): normalize smartPeople schema with stable IDs"
### T2.3 — Delete / Reset / Live status → Commit 3
```
[đính kèm ScientistDirectory.jsx hiện tại]
Chỉ bổ sung vào component:
- Nút <button type="button"> "Delete" cho mỗi dòng: setPeople(prev
  => prev.filter(p => p.id !== id)) (immutable).
- Nút "Reset" khôi phục từ SMART_PEOPLE (setPeople(SMART_PEOPLE)).
- <output role="status" aria-live="polite">Found {visible.length}
  pioneers</output>.
- Mỗi nút Delete có aria-label nêu tên người bị xoá.
Không thêm useEffect, không thêm state dẫn xuất.
```
`git commit -m "feat(ex2): add delete/reset & live status"`

### T2.4 — Verification Gate (làm trước khi sang Block 4)
- `grep -n useEffect src/components/ScientistDirectory.jsx` → **0 kết quả**.
- React DevTools **Profiler**: gõ **1 ký tự** vào ô search = **đúng 1 render pass**.
- Xoá "Johann Goethe": focus + key các dòng còn lại giữ nguyên, không remount.
- Mỗi `<input>/<select>` có `<label>` (click label → focus input).

**✅ Checkpoint 2 (phút 120):** `git log` có 3 commit ex2 đúng tên.

---

## BLOCK 4 — EXERCISE 3: KRAFTON PUBG Vietnam Live Telemetry (35')

**Mục tiêu:** `<PubgMatchTelemetry squadId />` — máy trạng thái 4 trạng thái (`IDLE|LOADING|SUCCESS|ERROR`), mô phỏng mất gói 35% trên Erangel/Miramar, `AbortController` khi đổi squad, skeleton 220px, **không** `window.alert`.

Dataset bắt buộc:
```
ces — Cerberus Esports · Erangel · Phase 6 · alive 4 · kills 14 · WWCD 68% · In Safe Zone
te  — The Expendables  · Miramar · Phase 7 · alive 4 · kills 18 · WWCD 82% · Holding High Ground
ge  — Genius Esports   · Taego   · Phase 5 · alive 3 · kills 9  · WWCD 41% · Rotating Blue Zone
```

| Task | Sub-task | Commit |
|---|---|---|
| T3.1 | Contract `ViewState` + dataset | (gộp Commit 1) |
| T3.2 | Mock `fetchKraftonPubgTelemetry` biết huỷ + mất gói 35% | (gộp Commit 1) |
| T3.3 | Component: useEffect + AbortController + 4-state | **Commit 1** |
| T3.4 | Skeleton 220px pulsing + `aria-busy` | (gộp Commit 2) |
| T3.5 | Error `<section role="alert">` + nút Retry | **Commit 2** |
| T3.6 | Squad selector + audit Slow 3G / click nhanh | — |

### T3.1 — Contract
```
Chỉ viết JSDoc/TypeScript type (không logic):
type ViewState = { status:'IDLE', data:null, error:null }
 | { status:'LOADING', data:null, error:null }
 | { status:'SUCCESS', data:SquadTelemetry, error:null }
 | { status:'ERROR', data:null, error:string };
SquadTelemetry { id, name, map, phase, alive, kills, wwcdProb, status }.
Một object state duy nhất; cấm isLoading/isError rời rạc.
```
### T3.2 — Mock API (phần dễ sai nhất — mock PHẢI tôn trọng `signal`)
```
Viết src/api/fetchKraftonPubgTelemetry.js:
fetchKraftonPubgTelemetry(squadId, { signal }) trả Promise: chờ
600–1200ms (setTimeout) rồi resolve dữ liệu squad từ PUBG_VN_SQUADS.
Nếu squad.map là 'Erangel' hoặc 'Miramar' thì 35% reject
Error('Satellite packet lost'). Nếu signal.aborted (kể cả khi bị
huỷ giữa chừng) thì clearTimeout và reject
new DOMException('Aborted','AbortError'). Squad không tồn tại ->
reject Error('Unknown squad'). Chỉ viết hàm này.
```
### T3.3 — Component 4-state + AbortController → Commit 1
```
[đính kèm project-rules.md + mock API]
Viết src/components/PubgMatchTelemetry.jsx:
- Props: { squadId = 'te' }.
- useState: view ({status,data,error}) khởi tạo IDLE, retryTick (0).
- useEffect deps [squadId, retryTick]: tạo new AbortController();
  setView LOADING; gọi fetch với { signal }; .then -> SUCCESS;
  .catch: NẾU err.name === 'AbortError' thì return (không hiện lỗi
  giả), ngược lại setView ERROR với err.message. Cleanup:
  return () => controller.abort().
- Render SUCCESS: <article aria-live="polite"> hiển thị tên squad,
  map, phase, alive, kills, WWCD, status (dùng <dl>).
- Chưa làm skeleton/lỗi đẹp. Không window.alert, không useEffect
  thứ hai, không class component.
```
`git commit -m "feat(ex3): implement PUBG VN 4-state telemetry & AbortController"`

### T3.4 + T3.5 — Skeleton & Retry → Commit 2
```
[đính kèm PubgMatchTelemetry.jsx]
Bổ sung vào component:
1) LOADING: <section aria-busy="true"> cao cố định 220px, có hiệu
   ứng pulsing bằng CSS (keyframes, màu từ CSS variables, không
   hardcode hex) và dòng chữ "Syncing KRAFTON Radar...".
2) ERROR: <section role="alert"> hiện "Blue-Zone Link Lost: {error}"
   + <button type="button"> "Reconnect Satellite (Retry)" onClick =
   setRetryTick(t => t + 1).
3) Thêm thanh chọn squad (3 <button type="button"> CES / TE / GE,
   aria-pressed) để đổi squadId (state nâng ở App hoặc state nội bộ).
Chỉ thêm 3 phần này, không đổi logic effect.
```
`git commit -m "feat(ex3): add skeleton UI & retry alert"`

### T3.6 — Verification Gate (Checkpoint 3)
- DevTools → Network **Slow 3G**: skeleton 220px xuất hiện, **CLS = 0.00** (không giật layout khi dữ liệu về).
- Bấm nhanh **CES → TE → GE**: Network hiện các request cũ **(canceled)**, UI chỉ hiện kết quả squad cuối, **không** có banner lỗi giả.
- Ép lỗi (chọn Erangel/Miramar nhiều lần): `role="alert"` hiện, nút Retry bấm được bằng Tab+Enter, không có `alert()` popup.
- React StrictMode double-invoke: không rò rỉ request/timer.

**✅ Checkpoint 3 (phút 155):** `git log --oneline` đủ 8 commit.

---

## BLOCK 5 — Chuẩn bị Live Defense (60–180 giây, đóng hết AI)

Thầy sẽ chạy `git log --oneline --graph` (30s) → kiểm DevTools/375px (30s) → ra **1 đề đột biến** (60–180s). Tự luyện 3 đề mẫu trong slide:

| Đề | Sửa ở file nào | Gợi ý nhanh |
|---|---|---|
| A (Ex2): thêm nút ⭐ Watchlist + checkbox "Show Watchlisted Only", **không useEffect** | `ScientistDirectory.jsx` | thêm state `watchIds` (Set/mảng id), cập nhật immutable; lọc thêm trong biểu thức `visible`; checkbox có `<label>` |
| B (Ex3): auto-polling 5s + nút Pause | `PubgMatchTelemetry.jsx` | state `isPaused`; `setInterval` trong effect, deps `[squadId, isPaused]`, cleanup `clearInterval` + `abort()` — **tránh stale closure** |
| C (Ex1+Ex2): nâng `selectedId` lên `<App/>` để click dòng Ex2 cập nhật `DeveloperCard` Ex1 | `App.jsx` + 2 component | truyền `selectedId`/`onSelect` qua props, KHÔNG tạo state trùng ở con |

Phải giải thích được: vì sao dùng `Object.is` trong `setState`; vì sao cleanup bắt buộc; vì sao `key` không dùng index.

---

## AI_FAILURE_AUDIT.md (15% — ghi NGAY khi gặp lỗi, đừng để cuối buổi)

Cần **≥ 3 lỗi thật** của AI, mỗi lỗi theo mẫu: *Prompt → AI Code → Bug → DevTools Proof → Engineering Fix (commit hash)*. Các nhóm lỗi AI hay mắc ở Lab này để em đối chiếu:
1. Tạo thêm `useState` + `useEffect` đồng bộ danh sách đã lọc (Ex2) → render 2 lần.
2. Mock fetch/`useEffect` quên `AbortController` hoặc `deps` rỗng `[]` → stale closure, request cũ ghi đè (Ex3).
3. `key={index}`, `<div>` thừa, `http://`, `alert()`, `defaultProps` lọt vào code (vi phạm project-rules).
4. `.sort()` mutate mảng thay vì `.toSorted()`.

Chỉ ghi những lỗi **em thực sự gặp và đã chứng minh bằng DevTools/git diff**; không bịa.

---

## Checklist nộp bài cuối
- [ ] `project-rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md` ở root
- [ ] 8 commit đúng tên, `git log --oneline` dán bên dưới
- [ ] Ex1: 0 `<div>`, 0 `http://`, 375px không scroll ngang
- [ ] Ex2: 0 `useEffect`, 100% input có `<label htmlFor>`, Profiler 1 render/ký tự
- [ ] Ex3: CLS 0.00 trên Slow 3G, request huỷ khi đổi squad, `role="alert"` + Retry
- [ ] Lighthouse Accessibility = 100

```
git log --oneline:
c720cbe (HEAD -> main, origin/main) docs(lab3): add AI failure audit
63c046e feat(app): integrate scientist directory and PUBG telemetry
8614917 feat(ex3): add skeleton UI & retry alert
455ff69 feat(ex3): implement PUBG VN 4-state telemetry & AbortController
ffd16a2 feat(ex3): add mock PUBG telemetry API
21c7689 docs(ex3): define telemetry state contracts
d4a8019 style(ex2): improve scientist directory layout
11972f0 feat(ex2): add delete/reset & live status
8e9092a feat(ex2): add search, IQ filter & toSorted
:...skipping...
c720cbe (HEAD -> main, origin/main) docs(lab3): add AI failure audit
63c046e feat(app): integrate scientist directory and PUBG telemetry
8614917 feat(ex3): add skeleton UI & retry alert
455ff69 feat(ex3): implement PUBG VN 4-state telemetry & AbortController
ffd16a2 feat(ex3): add mock PUBG telemetry API
21c7689 docs(ex3): define telemetry state contracts
d4a8019 style(ex2): improve scientist directory layout
11972f0 feat(ex2): add delete/reset & live status
8e9092a feat(ex2): add search, IQ filter & toSorted
f177116 feat(ex2): normalize smartPeople schema with stable IDs
:...skipping...
c720cbe (HEAD -> main, origin/main) docs(lab3): add AI failure audit
63c046e feat(app): integrate scientist directory and PUBG telemetry
8614917 feat(ex3): add skeleton UI & retry alert
455ff69 feat(ex3): implement PUBG VN 4-state telemetry & AbortController
ffd16a2 feat(ex3): add mock PUBG telemetry API
21c7689 docs(ex3): define telemetry state contracts
d4a8019 style(ex2): improve scientist directory layout
11972f0 feat(ex2): add delete/reset & live status
8e9092a feat(ex2): add search, IQ filter & toSorted
f177116 feat(ex2): normalize smartPeople schema with stable IDs
4ee139c docs(lab3): add task decomposition for exercises
8e8e488 fix(ex1): align SkillBadge props contract
ff43e85 fix(ex1): standardize SkillBadge filename
41e38f9 merge: combine GitHub README with local project
fb6a9ca chore: initialize React 19 Lab 3 project
:...skipping...
c720cbe (HEAD -> main, origin/main) docs(lab3): add AI failure audit
63c046e feat(app): integrate scientist directory and PUBG telemetry
8614917 feat(ex3): add skeleton UI & retry alert
455ff69 feat(ex3): implement PUBG VN 4-state telemetry & AbortController
ffd16a2 feat(ex3): add mock PUBG telemetry API
21c7689 docs(ex3): define telemetry state contracts
d4a8019 style(ex2): improve scientist directory layout
11972f0 feat(ex2): add delete/reset & live status
8e9092a feat(ex2): add search, IQ filter & toSorted
f177116 feat(ex2): normalize smartPeople schema with stable IDs
4ee139c docs(lab3): add task decomposition for exercises
8e8e488 fix(ex1): align SkillBadge props contract
ff43e85 fix(ex1): standardize SkillBadge filename
41e38f9 merge: combine GitHub README with local project
fb6a9ca chore: initialize React 19 Lab 3 project
adcc78d Initial commit

```
