# AI_FAILURE_AUDIT.md

**Môn:** Web Application Development — Lab 3  
**Phạm vi:** HW1 Studio Drum Kit · HW2 88-Key Polyphonic Piano · HW3 KRAFTON x PUBG VN Arena  
**Sinh viên:** Phan Lê Duy Bảo — 24520180  
**Mục đích:** Ghi nhận lỗi/rủi ro trong code hoặc hướng dẫn do AI đề xuất, cách kiểm tra và cách khắc phục.

> **Lưu ý trung thực học thuật:** Báo cáo này được lập từ quá trình review code và các tình huống đã trao đổi khi thực hiện Lab 3. Những mục ghi **CẦN XÁC NHẬN** chưa được xem là đã tái hiện thành công. Trước khi nộp, hãy chạy kiểm tra tương ứng, chụp bằng chứng thật và điền commit hash thực tế. Không ghi DevTools/test PASS nếu chưa chạy.

---

## Vulnerability 01 — H3-4: Race condition khi dùng chung `claimId`

**Phân loại:** Concurrency / Idempotency  
**Trạng thái:** Đã phát hiện qua review đoạn code API ban đầu; cần chạy test đồng thời để lưu bằng chứng.

### Prompt
Yêu cầu AI viết `src/api/claimDrop.js` với `claimDrop(dropId, claimId, { signal })`, có độ trễ giả lập, xử lý AbortSignal và bảo đảm cùng một `claimId` chỉ trừ tồn kho một lần.

### AI-generated code / điểm có vấn đề
Ở phiên bản ban đầu, kết quả chỉ được ghi vào `processedClaims` sau khi timeout hoàn tất. Trong khoảng thời gian chờ, hai lời gọi đồng thời có cùng `claimId` đều có thể chưa tìm thấy key trong Map và cùng tạo request riêng.

Ví dụ dạng logic có lỗi:

```js
const previous = processedClaims.get(claimId);
if (previous) return Promise.resolve(previous);

return new Promise((resolve) => {
  setTimeout(() => {
    // Trừ serverStock và tạo result
    processedClaims.set(claimId, result);
    resolve(result);
  }, delay);
});
```

### Bug / hậu quả
Hai request đồng thời cùng `claimId` có thể cùng đi qua bước kiểm tra trước khi request đầu tiên lưu kết quả. Điều này phá vỡ tính idempotent và có nguy cơ trừ tồn kho nhiều lần cho một claim logic.

### DevTools Proof / cách xác minh
Chạy test với cùng một `claimId` và gọi đồng thời:

```js
resetServerStock(2);

const [first, second] = await Promise.all([
  claimDrop('drop-1', 'same-claim-id'),
  claimDrop('drop-1', 'same-claim-id'),
]);

console.log(first, second);
```

Kỳ vọng sau khi sửa: cả hai lời gọi nhận cùng kết quả logic và server stock chỉ giảm **1**. Có thể kiểm tra thêm bằng cách gọi một claim ID khác và xác nhận tồn kho còn lại đúng.

**Bằng chứng cần lưu:** ảnh Terminal thể hiện test đồng thời và kết quả; không chụp ảnh minh họa giả lập.

### Engineering Fix
Lưu Promise đang chạy vào `processedClaims` ngay khi tạo, thay vì đợi timeout kết thúc mới lưu. Những lời gọi sau có cùng `claimId` sẽ nhận lại Promise đang chạy. Nếu Promise bị abort, xóa key để có thể retry.

```js
const previousClaim = processedClaims.get(claimId);
if (previousClaim) return previousClaim;

const claimPromise = new Promise((resolve, reject) => {
  // Tạo timeout, xử lý abort và resolve kết quả
});

processedClaims.set(claimId, claimPromise);

claimPromise.catch((error) => {
  if (error.name === 'AbortError') {
    processedClaims.delete(claimId);
  }
});

return claimPromise;
```

**Commit hash:** `[điền hash commit H3-4 sau khi chạy test và commit]`

---

## Vulnerability 02 — H3-2: Hàm tính thời gian nằm ngoài Effect, dễ phát sinh cảnh báo dependency

**Phân loại:** React Effect / Dependency hygiene  
**Trạng thái:** Rủi ro được phát hiện khi review; cần kiểm tra lint/build của phiên bản cuối.

### Prompt
Yêu cầu AI viết `usePubgAirdropTimer(targetEpochMs, serverOffsetMs)` sử dụng `Date.now()` để tính thời gian còn lại, đồng bộ khi tab visible và cleanup interval/listener.

### AI-generated code / điểm có vấn đề
Phiên bản được review khai báo `calcRemaining` ở ngoài `useEffect`, sau đó gọi hàm này bên trong Effect:

```js
const calcRemaining = () =>
  Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs));

useEffect(() => {
  const syncRemaining = () => setRemainingMs(calcRemaining());
  const intervalId = setInterval(syncRemaining, 200);

  // visibilitychange listener và cleanup
}, [targetEpochMs, serverOffsetMs]);
```

Hàm `calcRemaining` là function được tạo lại theo mỗi lần render nhưng không nằm trong dependency array. Một cấu trúc như vậy có thể bị ESLint `react-hooks/exhaustive-deps` cảnh báo và khiến dependency của Effect khó được kiểm tra rõ ràng.

### Bug / hậu quả
Đây là vấn đề về dependency hygiene và khả năng bảo trì Effect. Nếu sau này hàm tính toán phụ thuộc thêm dữ liệu mà dependency array không được cập nhật, callback của interval có thể dùng giá trị cũ. Với phiên bản hiện tại, `targetEpochMs` và `serverOffsetMs` đã có trong dependency array nên không được kết luận rằng timer chắc chắn đang chạy sai.

### DevTools Proof / cách xác minh
- Chạy lệnh build/lint mà dự án cung cấp.
- Kiểm tra cảnh báo `react-hooks/exhaustive-deps`.
- Đổi `targetEpochMs` hoặc `serverOffsetMs` khi component đang mount và quan sát timer có đồng bộ theo giá trị mới không.
- Chuyển tab sang nền rồi quay lại, kiểm tra timer tính lại từ `Date.now()` thay vì trừ dồn số mili giây.

**Bằng chứng cần lưu:** ảnh Terminal kết quả lint/build (nếu có cảnh báo thì lưu trước và sau khi sửa); ảnh trình duyệt khi đổi tab và timer đồng bộ lại.

### Engineering Fix
Đưa hàm đồng bộ và hàm tính thời gian vào bên trong Effect để dependency của Effect thể hiện trực tiếp các giá trị được sử dụng:

```js
useEffect(() => {
  const calcRemaining = () =>
    Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs));

  const syncRemaining = () => {
    setRemainingMs(calcRemaining());
  };

  const intervalId = setInterval(syncRemaining, 200);

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      syncRemaining();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  syncRemaining();

  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [targetEpochMs, serverOffsetMs]);
```

Phần khởi tạo state vẫn cần tính giá trị ban đầu từ `targetEpochMs` và `serverOffsetMs` bằng một biểu thức/hàm thuần phù hợp.

**Commit hash:** `[điền hash commit H3-2 sau khi xác minh và commit]`

---

## Vulnerability 03 — H3-7: Nút Claim chưa chặn thao tác trước thời điểm Airdrop

**Phân loại:** Business logic / UI state guard  
**Trạng thái:** Đã được nêu ra khi review component tích hợp; cần xác nhận với yêu cầu cuối cùng của giảng viên.

### Prompt
Yêu cầu AI tích hợp Arena, hiển thị countdown và nút Claim; trạng thái nút phải phản ánh tình trạng của drop.

### AI-generated code / điểm có vấn đề
Trong phiên bản đầu được review, nút Claim chỉ bị disable khi request đang pending hoặc tồn kho bằng 0:

```jsx
<button
  type="button"
  disabled={pending || drop.remainingStock <= 0}
  onClick={() => claim(drop.id)}
>
  Claim
</button>
```

Điều kiện này không kiểm tra `remainingMs`. Vì vậy, khi countdown vẫn còn thời gian, người dùng vẫn có thể bấm Claim.

### Bug / hậu quả
UI cho phép gửi claim trước thời điểm mở Airdrop. Điều này không phù hợp với luồng sử dụng thông thường của một đợt drop có thời điểm mở cố định. Lưu ý: kiểm tra ở UI chỉ cải thiện trải nghiệm; nếu cần bảo đảm nghiệp vụ, API/backend cũng phải xác thực thời điểm mở.

### DevTools Proof / cách xác minh
- Đặt `dropEpochMs` ở tương lai.
- Mở Arena và xác nhận countdown vẫn lớn hơn 0.
- Kiểm tra nút Claim có bị disable hay không.
- Sau khi sửa, xác nhận nút chỉ được bật khi countdown về 0 và tồn kho còn.
- Thử trạng thái pending và stock bằng 0 để bảo đảm nút vẫn disable.

**Bằng chứng cần lưu:** ảnh màn hình Arena khi countdown còn thời gian và khi Airdrop đã mở; nếu có thể, ghi nhận trạng thái `disabled` trong DevTools Elements.

### Engineering Fix
Tính điều kiện cho phép claim từ trạng thái hiện tại:

```jsx
const canClaim = remainingMs === 0 && drop.remainingStock > 0;

<button
  type="button"
  disabled={pending || !canClaim}
  onClick={() => claim(drop.id)}
>
  Claim
</button>
```

Có thể hiển thị trạng thái tương ứng: “Airdrop chưa mở”, “Có thể Claim”, “Đang xử lý” hoặc “Đã hết hàng”. Không dựa riêng vào trạng thái disabled của nút để bảo vệ tồn kho ở phía server.

**Commit hash:** `[điền hash commit H3-7 sau khi xác minh và commit]`

---

## Tổng kết kiểm toán

| # | Homework | Rủi ro | Cách xử lý |
|---|---|---|---|
| 01 | H3-4 | Cùng `claimId` có thể tạo nhiều request đồng thời | Lưu Promise đang chạy để bảo đảm idempotency |
| 02 | H3-2 | Hàm được gọi trong Effect nằm ngoài Effect, dependency khó kiểm soát | Đưa helper vào Effect và giữ dependency tường minh |
| 03 | H3-7 | Nút Claim có thể bật trước thời điểm mở drop | Kiểm tra `remainingMs` cùng pending và stock |

## Checklist trước khi nộp

- [ ] Cả 3 mục phản ánh đúng code thực tế đã review.
- [ ] Đã chạy các bước xác minh; không ghi kết quả chưa kiểm tra.
- [ ] Có ảnh Terminal/DevTools thật cho từng lỗi.
- [ ] Đã điền commit hash thực tế cho từng phần sửa lỗi.
- [ ] Các commit sửa lỗi đã được push lên GitHub.
- [ ] File này nằm ở root repo với tên chính xác `AI_FAILURE_AUDIT.md`.

> Theo task decomposition, báo cáo phải ghi lỗi AI thực sự gặp và có bằng chứng. Nếu một mục không tái hiện được hoặc không đúng với phiên bản code cuối, hãy thay bằng lỗi thực tế khác đã phát hiện trong HW1/HW2/HW3 thay vì giữ lại chỉ để đủ số lượng.
