# TASK_DECOMPOSITION.md — Lab 3 Homework (HW1, HW2, HW3)

**Môn:** Web Application Development — Lab 3: Production React 19, Fiber Hooks & Concurrent UI
**Phạm vi:** HW1 Studio Drum Kit · HW2 88-Key Polyphonic Piano · HW3 KRAFTON x PUBG VN Arena (không làm Bonus)
**Sinh viên:** *Phan Lê Duy Bảo 24520180*

> **RULE (Anti-Monolithic):** 1 prompt = 1 sub-task. Không dán nguyên đề HW vào AI (one-shot = 0% phần Git & Audit). Mọi prompt đính kèm `project-rules.md` của Lab 3. Quy trình mỗi bước: **Contract → Prompt → Verify → Commit**.

**Ràng buộc chung (từ project-rules.md):** React 19 + Vite + ES2024 · `createRoot` + `StrictMode` · cấm class component, `ReactDOM.render`, `defaultProps`, `import * as React`, `keyCode`, `window.alert`, `http://`, `key={index}` · không `<div>` thừa (dùng `<main> <section> <article> <ul> <dl> <output>`) · mọi input có `<label htmlFor>` + `useId()` · state immutable · mọi timer/listener/fetch trong `useEffect` có cleanup · 375px không scroll ngang.

**Cấu trúc thư mục:**

```
src/homeworks/DrumMachine/       (HW1)
src/homeworks/GrandPiano88/      (HW2)
src/homeworks/KraftonPubgVnArena/(HW3)
```

> **Về số commit:** slide Lab 3 không nêu số commit riêng cho từng HW, chỉ yêu cầu tối thiểu 6–8 commit nhỏ cho cả bài. Bản chia dưới đây (HW1 = 7, HW2 = 7, HW3 = 8 → **22 commit**) là cách chia của mình để mỗi commit chỉ chứa một sub-task; nếu thầy nói số khác thì gộp/tách lại.

---



# HW1 — Production Studio Drum Kit (WCAG 2.2 AA, Lighthouse 100)

**Mục tiêu:** Drum Kit phím `w a s d j k l`, dùng `e.code`, chống lặp phím, không bắt phím khi đang gõ trong ô nhập, có nhật ký bấm + đồng hồ decibel cho người khiếm thính, pad là `<button aria-pressed>`.


| Task | Sub-task                                                                 | Commit                                             | Xong |
| ---- | ------------------------------------------------------------------------ | -------------------------------------------------- | ---- |
| H1-1 | Contract: `padMap`, kiểu `Pad`                                           | `docs(hw1): define drum pad contract`              | [ ]  |
| H1-2 | Markup ngữ nghĩa các pad (chưa có logic)                                 | `feat(hw1): semantic drum pad markup`              | [ ]  |
| H1-3 | Hook `useDrumKeyboard` (e.code, repeat, input isolation, cleanup)        | `feat(hw1): add useDrumKeyboard hook`              | [ ]  |
| H1-4 | Tạo tiếng trống bằng Web Audio (`drumSynth.js`, không cần file âm thanh) | `feat(hw1): synthesize drum sounds with web audio` | [ ]  |
| H1-5 | Kích hoạt âm thanh + trạng thái `isActive`                               | `feat(hw1): trigger sound and active state`        | [ ]  |
| H1-6 | Nhật ký bấm `<output aria-live>` + decibel meter                         | `feat(hw1): add accessible hit log and meter`      | [ ]  |
| H1-7 | CSS 375px + audit WCAG/Lighthouse                                        | `fix(hw1): wcag 2.2 aa and 375px compliance`       | [ ]  |




### H1-1 — Contract

```
[đính kèm project-rules.md]
Chỉ viết JSDoc/TypeScript type (không logic) cho Drum Kit:
type Pad = { id: string; label: string; code: string; voice: DrumVoice }
type DrumVoice = 'kick'|'snare'|'hihat'|'openhat'|'tom'|'clap'|'crash'
trong đó code là một trong 'KeyW','KeyA','KeyS','KeyD','KeyJ','KeyK','KeyL'
(mỗi phím một voice khác nhau). Viết hằng PAD_LIST (7 pad) và padMap =
new Map(code -> Pad) (dùng Map để tra O(1)). Chỉ file dữ liệu
src/homeworks/DrumMachine/pads.js, không viết component.
```

> Âm thanh: thư mục Lab 1 của em không có file `.wav`, nên HW1 **tự tạo tiếng trống bằng Web Audio** (task H1-4), không cần tải file nào.



### H1-2 — Markup ngữ nghĩa

```
[đính kèm project-rules.md + pads.js]
Viết src/homeworks/DrumMachine/DrumMachine.jsx (CHƯA có logic bàn phím
hay âm thanh): <main> chứa <h1>, <section aria-label="Drum pads"> với
<ul> các <li> mỗi cái một <button type="button" aria-pressed="false">
hiển thị label + phím tắt (ví dụ "Kick — W"). Không <div>. Chỉ markup.
```



### H1-3 — useDrumKeyboard

```
[đính kèm project-rules.md + pads.js]
Viết src/homeworks/DrumMachine/useDrumKeyboard.js:
useDrumKeyboard(padMap, onTriggerPad, isEnabled = true), dùng useEffect:
- if (!isEnabled) return undefined.
- Gắn window 'keydown' và 'keyup'. Dùng e.code (KHÔNG dùng keyCode/e.key).
- keydown: if (e.repeat) return; bỏ qua nếu e.target.tagName thuộc
  ['INPUT','TEXTAREA','SELECT']; tra padMap.get(e.code); nếu có thì
  e.preventDefault() và gọi onTriggerPad(pad.id, 'down').
- keyup: tra tương tự và gọi onTriggerPad(pad.id, 'up').
- Cleanup: removeEventListener cho CẢ HAI listener.
- deps: [padMap, onTriggerPad, isEnabled].
Chỉ viết hook, không viết component.
```



### H1-4 — Tạo tiếng trống bằng Web Audio

```
[đính kèm project-rules.md + pads.js]
Viết src/homeworks/DrumMachine/drumSynth.js (không UI, không React):
- getContext(): tạo AudioContext LƯỜI (lần đầu gọi), resume() nếu
  state === 'suspended'; trả về ctx dùng chung.
- playDrum(voice): switch theo DrumVoice, mỗi voice tạo node mới rồi tự
  gỡ khi kết thúc (osc/source.onended -> disconnect):
  kick = sine hạ tần 150Hz->50Hz, gain giảm nhanh ~0.3s;
  snare = noise ngắn qua bandpass + một sine ~180Hz;
  hihat = noise qua highpass, ~0.05s; openhat = giống hihat ~0.3s;
  tom = sine 200Hz->100Hz ~0.25s; clap = vài burst noise ngắn liên tiếp;
  crash = noise qua highpass, giảm dần ~1s.
- Mỗi voice dùng gain.gain.setValueAtTime rồi
  exponentialRampToValueAtTime(0.0001, ...) để không bị tiếng "bụp".
- Noise tạo bằng AudioBuffer ngẫu nhiên (Math.random), không tải file.
Chỉ viết file này. Giải thích ngắn vì sao phải gỡ node khi kết thúc.
```

**Verify H1-4:** mở Console, gọi thử `playDrum('kick')` trong một handler bấm nút → nghe được; gọi 20 lần liên tiếp không lỗi, Console 0 warning.

### H1-5 — Kích hoạt âm thanh + isActive

```
[đính kèm DrumMachine.jsx, useDrumKeyboard.js, pads.js, drumSynth.js]
Bổ sung DrumMachine: state activeIds (mảng id, cập nhật immutable);
handler onTrigger(id, phase) dùng useCallback: 'down' -> thêm id vào
activeIds và gọi playDrum(pad.voice); 'up' -> gỡ id. Nút bấm chuột/chạm
dùng onPointerDown/onPointerUp gọi cùng handler (lần chạm đầu tiên là
user gesture để mở AudioContext). aria-pressed={activeIds.includes(id)}.
Gọi useDrumKeyboard(padMap, onTrigger). Không thêm nhật ký/meter.
```



### H1-6 — Nhật ký + decibel meter

```
[đính kèm DrumMachine.jsx]
Bổ sung cho người khiếm thính: (1) state hits (mảng tối đa 10 mục
gần nhất, thêm bằng [...prev, entry].slice(-10), entry gồm
id=crypto.randomUUID(), label, time); (2) <output aria-live="polite"
aria-label="Hit history"> chứa <ol> hiển thị các lần bấm, key=entry.id;
(3) thanh âm lượng trực quan bằng phần tử <meter min=0 max=100
value={level}> có aria-label, level tăng khi bấm và giảm dần về 0 bằng
một timer trong useEffect CÓ cleanup (clearInterval/clearTimeout).
Không dùng alert(). Chỉ thêm 2 phần này.
```



### H1-7 — CSS + audit

```
[đính kèm DrumMachine.jsx + CSS hiện tại]
Viết/sửa DrumMachine.module.css và rà soát WCAG 2.2 AA, CHỈ sửa lỗi:
contrast chữ/nền >= 4.5:1, :focus-visible rõ ràng (không outline:none
trống), target tối thiểu 24x24px (khuyến nghị 44px), trạng thái pad
active không chỉ phân biệt bằng màu (thêm viền/chữ), layout mobile-first
đúng ở 375px không scroll ngang, màu qua CSS variables. Liệt kê lỗi đã sửa.
```

**Verify HW1:** Lighthouse Accessibility = **100** (chụp ảnh) · Tab qua mọi pad, Enter/Space kích hoạt được · gõ trong `<input>` thử → pad KHÔNG kêu · giữ phím → chỉ kêu 1 lần · bật UniKey gõ tiếng Việt, pad vẫn đúng (nhờ `e.code`) · Console 0 warning.

---



# HW2 — 88-Key Polyphonic Piano & Concurrent FIFO Sequencer

**Mục tiêu:** 88 phím sinh bằng thuật toán, đa âm 8 giọng với "cướp giọng" FIFO, bấm 1 phím chỉ render lại 1 phím, ghi và phát lại ở 0.5x/1.0x/2.0x, huỷ được bằng `AbortController`.


| Task | Sub-task                                              | Commit                                                 | Xong |
| ---- | ----------------------------------------------------- | ------------------------------------------------------ | ---- |
| H2-1 | Contract kiểu dữ liệu                                 | `docs(hw2): define piano and sequencer contracts`      | [ ]  |
| H2-2 | `generateKeys()` thuần (88 phím, 52 trắng/36 đen)     | `feat(hw2): generate 88 keys algorithmically`          | [ ]  |
| H2-3 | `PolyphonicSynth` (Map, 8 giọng, FIFO stealing, ramp) | `feat(hw2): polyphonic synth with fifo voice stealing` | [ ]  |
| H2-4 | `PianoKey` (`React.memo`) + bố cục bàn phím           | `feat(hw2): memoized piano keys and layout`            | [ ]  |
| H2-5 | Bộ ghi/phát lại FIFO (tốc độ 0.5/1/2, abortable)      | `feat(hw2): fifo recorder and abortable replay`        | [ ]  |
| H2-6 | Nối UI: Record/Play/Stop + cleanup khi unmount        | `feat(hw2): wire sequencer controls and cleanup`       | [ ]  |
| H2-7 | Audit Profiler / rò rỉ / giọng thứ 9 / Lighthouse     | `fix(hw2): render isolation and audio cleanup`         | [ ]  |




### H2-1 — Contract

```
[đính kèm project-rules.md]
Chỉ viết JSDoc/TypeScript type (không logic):
Note { midi:number, noteName:string, isBlack:boolean, freqHz:number }
RecordedEvent { midi:number, freqHz:number, durationMs:number, deltaMs:number }
trong đó deltaMs là khoảng cách từ sự kiện TRƯỚC, durationMs là thời
gian giữ phím. type PlaybackRate = 0.5 | 1 | 2.
Mô tả invariant: tối đa 8 giọng đồng thời; thứ tự cướp giọng = FIFO.
```



### H2-2 — generateKeys

```
[đính kèm Note type]
Viết hàm thuần generateKeys() trong keys.js trả mảng 88 Note từ midi 21
(A0) đến 108 (C8). freqHz = 440 * 2 ** ((midi - 69) / 12). noteName
theo tên nốt + octave (ví dụ 'C4' = midi 60). isBlack = true cho các
nốt thăng (C#, D#, F#, G#, A#). Cấm viết tay 88 phần tử. Kèm 4
console.assert: length === 88, đếm phím trắng === 52, phím đen === 36,
midi 69 -> 440Hz.
```



### H2-3 — PolyphonicSynth

```
[đính kèm project-rules.md + Note types]
Viết class PolyphonicSynth trong PolyphonicSynth.js:
- constructor(maxVoices = 8): ctx = null (KHÔNG tạo AudioContext ở
  constructor), voices = new Map() (midi -> { osc, gain }).
- noteOn(midi, freqHz): tạo AudioContext lười (lần đầu, và resume() nếu
  'suspended'); nếu voices.has(midi) thì return; nếu voices.size >=
  maxVoices thì lấy oldestMidi = voices.keys().next().value và gọi
  noteOff(oldestMidi) (FIFO stealing); tạo oscillator + gain nối tới
  destination, gain đặt 0.2, osc.start(); voices.set(midi, ...).
- noteOff(midi): nếu có voice thì gain.gain.exponentialRampToValueAtTime
  (0.0001, ctx.currentTime + 0.04) rồi osc.stop(ctx.currentTime + 0.05);
  gắn osc.onended để disconnect osc+gain; voices.delete(midi) ngay.
- dispose(): noteOff tất cả voice rồi ctx.close().
Không viết UI. Giải thích ngắn vì sao dùng ramp trước stop.
```



### H2-4 — PianoKey + layout

```
[đính kèm project-rules.md + keys.js]
Viết PianoKey.jsx và Piano.jsx:
- PianoKey = memo(function PianoKey({ midi, noteName, isBlack,
  isPressed, onNoteOn, onNoteOff })): một <button type="button"
  aria-pressed={isPressed} aria-label={noteName}> (className theo
  isBlack), onPointerDown -> onNoteOn(midi), onPointerUp/onPointerLeave
  -> onNoteOff(midi).
- Piano.jsx: generateKeys() gọi MỘT LẦN ngoài component (hằng module),
  state pressedMidis (Set được thay mới bằng new Set mỗi lần cập nhật,
  hoặc mảng id immutable); onNoteOn/onNoteOff bọc useCallback với deps
  ổn định để memo không bị phá; render <ul> với key = note.midi.
- Bàn phím cuộn ngang TRONG container riêng (overflow-x:auto), trang
  không được scroll ngang ở 375px. Không <div>.
```



### H2-5 — Ghi & phát lại FIFO

```
[đính kèm RecordedEvent type]
Viết sequencer.js (không UI):
- class Recorder: start() lưu thời điểm bắt đầu bằng performance.now();
  noteDown(midi, freqHz) / noteUp(midi) ghép thành RecordedEvent với
  durationMs, deltaMs tính từ sự kiện trước; events là mảng FIFO; stop()
  trả bản sao mảng; không mutate mảng đã trả ra.
- async function replay(events, rate, { noteOn, noteOff, signal }): với
  mỗi event (theo thứ tự), await sleep(event.deltaMs / rate, signal),
  gọi noteOn, rồi lên lịch noteOff sau durationMs / rate; mọi sleep phải
  abortable: khi signal.aborted thì clearTimeout, reject AbortError
  và dừng vòng lặp, đồng thời noteOff các nốt đang giữ.
- sleep(ms, signal) tự viết bằng setTimeout + addEventListener('abort').
Chỉ logic, không UI, không import React.
```



### H2-6 — Nối UI + cleanup

```
[đính kèm Piano.jsx, PolyphonicSynth.js, sequencer.js]
Bổ sung Controls trong Piano: nút Record / Stop Recording / Play / Stop
Sequence (type="button"); <select> chọn tốc độ 0.5x/1x/2x có <label
htmlFor> với useId(); synth giữ bằng useRef; mỗi lần Play tạo
AbortController mới lưu trong useRef; Stop Sequence gọi abort(); bắt
AbortError và KHÔNG hiện lỗi giả. useEffect cleanup khi unmount: abort()
+ synth.dispose(). Trạng thái ('IDLE'|'RECORDING'|'PLAYING') là MỘT
state duy nhất, không dùng nhiều boolean. Không dùng alert().
```



### H2-7 — Audit

```
[đính kèm toàn bộ code HW2]
Rà soát và chỉ ra (không viết lại toàn bộ): (1) callback nào tạo mới
mỗi render làm memo vô hiệu; (2) có chỗ nào mutate state/Set trực tiếp;
(3) oscillator/gain/AudioContext có bị rò rỉ khi unmount hoặc khi
Stop; (4) listener 'abort' có được gỡ sau mỗi sleep chưa. Mỗi lỗi:
dòng code + cách sửa ngắn.
```

**Verify HW2:** React DevTools **Profiler**: bấm 1 phím → chỉ **1** `PianoKey` render · chơi 9 nốt cùng lúc → nốt đầu tiên bị cắt (đúng FIFO) và không có tiếng "bụp" · đếm DOM: 88 phím (52 trắng + 36 đen) · Record → Play ở 0.5x/1x/2x đúng nhịp · Stop Sequence im ngay, không còn nốt kẹt · chuyển trang/unmount, Console không lỗi, tab Memory không tăng đều.

---



# HW3 — KRAFTON x PUBG Vietnam Championship & Airdrop Arena

**Mục tiêu:** Đếm ngược airdrop không trôi (kể cả tab chạy nền), nhận vé/crate kiểu lạc quan có rollback khi 409, bảng xếp hạng squad lọc/sắp xếp bằng derived state.

> ⚠️ **Dữ liệu:** số liệu squad và tồn kho là **dữ liệu mẫu tự đặt**, không phải kết quả thật của giải; ghi rõ "sample data" trong code/README.
> ⚠️ **Chưa khớp trong slide:** contract ghi `squadId: 'te'|'ces'|'ge'|'agg'`, nhưng phần mô tả yêu cầu lại nêu The Expendables, Cerberus Esports, **Roy Esports**, AGG. Bản dưới dùng 4 squad của phần mô tả (`te`, `ces`, `roy`, `agg`) — nhớ ghi chú thay đổi này (hoặc hỏi thầy).


| Task | Sub-task                                                      | Commit                                                         | Xong |
| ---- | ------------------------------------------------------------- | -------------------------------------------------------------- | ---- |
| H3-1 | Contract: `DropPhase`, `PubgCrateDrop`, `PubgVnSquadStanding` | `docs(hw3): define pubg vn arena contracts`                    | [ ]  |
| H3-2 | Hook `usePubgAirdropTimer` (Date.now + visibilitychange)      | `feat(hw3): drift-free airdrop timer hook`                     | [ ]  |
| H3-3 | UI đếm ngược + phase + thông báo accessible                   | `feat(hw3): countdown ui with phase announcements`             | [ ]  |
| H3-4 | Mock API claim (409, abortable)                               | `feat(hw3): mock claim api with 409 conflict`                  | [ ]  |
| H3-5 | Optimistic claim + rollback + khoá claimId                    | `feat(hw3): optimistic claim with rollback and in-flight lock` | [ ]  |
| H3-6 | Leaderboard: lọc/sắp xếp derived state                        | `feat(hw3): leaderboard with derived filter and sort`          | [ ]  |
| H3-7 | Ráp trang Arena + CSS Modules 375px                           | `feat(hw3): assemble arena page responsive 375px`              | [ ]  |
| H3-8 | Audit + `AI_FAILURE_AUDIT.md`                                 | `docs(hw3): add ai failure audit`                              | [ ]  |




### H3-1 — Contract

```
[đính kèm project-rules.md]
Chỉ viết type/JSDoc (không logic):
type DropPhase = 'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED';
PubgCrateDrop { readonly id; title; priceVnd:number; remainingStock:number;
dropEpochMs:number }; PubgVnSquadStanding { readonly squadId:'te'|'ces'|
'roy'|'agg'; squadName; wwcdCount; placementPts; killPts }.
ClaimResult = { ok:true } | { ok:false, status:409|500, message:string }.
Mô tả bảng chuyển phase: WARMUP -> AIRDROP_LIVE (đến giờ) ->
LOOTED_OUT (hết hàng) hoặc EXPIRED (hết hạn). Tạo file dữ liệu mẫu 2
drop (1 vé VIP PVS Grand Finals, 1 G-Coin Crate) và 4 squad, gắn
nhãn rõ là dữ liệu mẫu.
```



### H3-2 — usePubgAirdropTimer

```
[đính kèm project-rules.md]
Viết src/hooks/usePubgAirdropTimer.js: usePubgAirdropTimer(targetEpochMs,
serverOffsetMs = 0) trả { remainingMs, isLive }.
- calcRemaining = Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs)).
- useState(calcRemaining); useEffect: setInterval 200ms gọi lại
  calcRemaining (KHÔNG đếm cộng dồn), thêm listener
  document 'visibilitychange' gọi đồng bộ ngay khi
  document.visibilityState === 'visible'.
- Cleanup: clearInterval + removeEventListener.
- deps [targetEpochMs, serverOffsetMs]. isLive = remainingMs === 0.
Chỉ viết hook, không UI.
```



### H3-3 — Countdown UI

```
[đính kèm hook + types]
Viết Countdown.jsx: nhận { targetEpochMs, phase }; hiển thị
<time dateTime=ISO>HH:MM:SS</time> bằng hàm formatRemaining(ms) thuần;
badge phase (chữ, không chỉ màu). KHÔNG đặt aria-live trên phần tử cập
nhật mỗi giây; thay vào đó một <output role="status" aria-live=
"polite"> riêng chỉ đổi nội dung khi còn 60 giây và khi phase đổi thành
AIRDROP_LIVE. Giá hiển thị tiền VND bằng Intl.NumberFormat('vi-VN',
{style:'currency',currency:'VND'}). Không <div>.
```



### H3-4 — Mock claim API

```
Viết src/api/claimDrop.js: claimDrop(dropId, claimId, { signal }) trả
Promise<ClaimResult>. Giữ "tồn kho server" trong biến module; chờ
400–900ms bằng setTimeout (clearTimeout + reject
DOMException('Aborted','AbortError') nếu signal.aborted); nếu stock
server > 0 thì giảm 1 và resolve {ok:true}; nếu stock = 0 thì
resolve {ok:false,status:409,message:'Looted Out'}. Cùng claimId gọi
lại phải idempotent (không trừ 2 lần: lưu Set claimId đã xử lý). Thêm
hàm resetServerStock(n) để test.
```



### H3-5 — Optimistic claim + rollback

```
[đính kèm project-rules.md + claimDrop.js + types]
Viết hook useOptimisticClaim(initialDrops) trong useOptimisticClaim.js:
- state drops; useRef inFlight (Set claimId) làm khoá chống bấm trùng.
- claim(dropId): nếu đang có request in-flight cho drop đó thì return;
  sinh claimId = crypto.randomUUID(); TRỪ remainingStock NGAY bằng
  setDrops(prev => prev.map(...)) (immutable, optimistic).
- Gọi claimDrop; nếu res.ok === false với status 409 thì ROLLBACK bằng
  functional update "cộng lại 1 cho đúng drop" (KHÔNG ghi đè bằng snapshot
  cũ, tránh mất cập nhật khi có nhiều claim) và đặt message lỗi; nếu
  thành công giữ nguyên; luôn gỡ claimId khỏi inFlight trong finally.
- AbortController trong useRef, abort() khi unmount (cleanup); bỏ qua
  AbortError.
- Trả { drops, claim, pendingDropIds, message }.
Không UI, không window.alert.
```



### H3-6 — Leaderboard

```
[đính kèm project-rules.md + types + dữ liệu mẫu]
Viết Leaderboard.jsx: state gốc CHỈ gồm standings, query, minKillPts,
sortBy ('wwcd-desc' | 'placement-desc' | 'kill-desc'). Danh sách hiển
thị tính TRONG RENDER: standings.filter(tên chứa query, không phân biệt
hoa thường && killPts >= minKillPts).toSorted(theo sortBy). CẤM
useEffect và CẤM state thứ hai cho danh sách đã lọc. Form role="search"
với mỗi control có <label htmlFor> + useId(); ô số dùng
e.target.valueAsNumber (NaN -> 0); <select> sắp xếp có label. Bảng
dùng <table><caption> với <th scope="col">, key = squadId;
<output role="status" aria-live="polite"> báo số squad tìm thấy; tổng
điểm = placementPts + killPts tính khi render.
```



### H3-7 — Ráp Arena + CSS

```
[đính kèm các component/hook đã có]
Viết KraftonPubgVnArena.jsx ráp: <main><h1>, <section> Countdown, <section>
danh sách drop với nút "Claim" (<button type="button">, disabled khi
đang pending hoặc hết hàng, có aria-describedby tới thông báo trạng
thái), <section> Leaderboard. Message lỗi/rollback hiển thị trong
<section role="alert">. Viết KraftonPubgVnArena.module.css mobile-first
cho 375px (Grid/Flex, gap, màu qua CSS variables, không scroll ngang,
bảng có thể cuộn ngang TRONG khung riêng). Không <div>. Không đổi logic.
```



### H3-8 — Audit + báo cáo

```
[đính kèm code HW3]
Đóng vai reviewer: tìm tối đa 3 vấn đề nghiêm trọng nhất về stale
closure / thiếu cleanup / race condition khi rollback / timer drift.
Mỗi vấn đề: dòng code + hậu quả + cách sửa ngắn, không viết lại toàn bộ.
```

**Verify HW3:** Đổi tab sang tab khác ~1 phút rồi quay lại → đồng hồ tự khớp ngay (không lệch) · Bấm "Claim" liên tục → chỉ 1 request đi (khoá claimId), stock giảm 1 · `resetServerStock(0)` rồi Claim → stock UI giảm rồi **hoàn lại**, hiện `role="alert"` "Looted Out" · gõ 1 ký tự vào ô tìm squad → Profiler 1 render pass, **0** `useEffect` trong Leaderboard · giá hiển thị dạng `₫` theo `vi-VN` · Lighthouse Accessibility 100 · 375px không scroll ngang.

---



# AI_FAILURE_AUDIT.md (15% — gộp chung cho cả 3 HW, tối thiểu 3 lỗi)

Ghi NGAY khi gặp lỗi, đừng chờ cuối tuần. Mỗi lỗi theo mẫu: **Prompt → AI Code → Bug → DevTools Proof → Engineering Fix (commit hash)**. Chỉ ghi lỗi **em thực sự gặp** và có bằng chứng; các điểm hay phát sinh để em canh chừng:


| HW  | Chỗ AI hay sai                                                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HW1 | Tạo `AudioContext` mới mỗi lần bấm (rò rỉ, trình duyệt giới hạn số context) hoặc quên `resume()`; không gỡ node âm thanh sau khi phát; dùng `e.key`/`keyCode`; quên `if (e.repeat)`; không bỏ qua phím khi đang gõ trong `<input>`; quên gỡ listener `keyup`; `aria-live` quá ồn |
| HW2 | Tạo `AudioContext` ở constructor/khi render; không `ramp` trước `stop` (tiếng "bụp"); callback mới mỗi render làm `React.memo` vô tác dụng; không dọn oscillator khi unmount; `Set` bị mutate trực tiếp                                                                          |
| HW3 | `setInterval` đếm cộng dồn (drift); quên `visibilitychange`; rollback bằng snapshot cũ (ghi đè mất cập nhật); không có khoá `claimId` (double claim); `useEffect` đồng bộ danh sách đã lọc; mock không tôn trọng `signal`                                                        |


---



# Checklist nộp bài

- [ ] `project-rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md` ở root repo
- [ ] 3 thư mục `DrumMachine/`, `GrandPiano88/`, `KraftonPubgVnArena/` trong `src/homeworks/`
- [ ] 22 commit đúng tên ở trên (hoặc theo số thầy yêu cầu), dán `git log --oneline` bên dưới
- [ ] Lighthouse Accessibility = 100 cho từng HW, 375px không scroll ngang
- [ ] 0 API cũ (class, `ReactDOM.render`, `defaultProps`, `keyCode`, `alert`, `http://`, `key={index}`)
- [ ] `AI_FAILURE_AUDIT.md` có ≥ 3 lỗi thật kèm bằng chứng
- [ ] Biết giải thích từng dòng: vì sao `e.code` thay `keyCode`, vì sao ramp trước `stop`, vì sao `memo` cần callback ổn định, vì sao rollback dùng functional update, vì sao cleanup là bắt buộc (Live Defense 25%, đóng hết AI)

```
git log --oneline
```

*(dán kết quả vào đây trước khi nộp)*