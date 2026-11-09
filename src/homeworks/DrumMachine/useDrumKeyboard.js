import { useEffect } from 'react';

export function useDrumKeyboard(
  padMap,
  onTriggerPad,
  isEnabled = true
) {
  useEffect(() => {
    if (!isEnabled) return undefined;

    const ignoredTags = ['INPUT', 'TEXTAREA', 'SELECT'];

    function handleKeyDown(e) {
      // Không xử lý phím được trình duyệt tự động lặp khi giữ lâu
      if (e.repeat) return;

      // Không bắt phím khi người dùng đang nhập dữ liệu
      if (ignoredTags.includes(e.target?.tagName)) return;

      const pad = padMap.get(e.code);

      if (!pad) return;

      e.preventDefault();
      onTriggerPad(pad.id, 'down');
    }

    function handleKeyUp(e) {
      if (ignoredTags.includes(e.target?.tagName)) return;

      const pad = padMap.get(e.code);

      if (!pad) return;

      e.preventDefault();
      onTriggerPad(pad.id, 'up');
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup cả hai event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [padMap, onTriggerPad, isEnabled]);
}
