// makeDraggable: 요소를 마우스나 터치로 끌어 옮긴다. 창 밖으로는 나가지 않는다.
// 창 크기가 바뀌거나 요소 크기가 바뀌어도 다시 창 안으로 맞춘다. 요소가 창보다 크면 창에 맞게 줄인다.
//
//   const d = makeDraggable(modalEl, { handle: headerEl, margin: 8 });
//   d.clamp();     // 수동으로 다시 맞추기 (보통 필요 없음)
//   d.destroy();   // 리스너 제거
//
// - handle 을 생략하면 요소 전체를 끌 수 있다. 버튼, 입력칸, 링크 위에서는 끌지 않는다.
// - 요소는 position: fixed 여야 한다. 처음 끌 때 transform 중앙정렬을 left/top 픽셀로 바꾼다.

function makeDraggable(el, options) {
    const opts = options || {};
    const handle = opts.handle || el;
    const margin = Number.isFinite(opts.margin) ? opts.margin : 8;
    let drag = null;

    const clampRange = (value, lo, hi) => (hi < lo ? lo : Math.min(Math.max(value, lo), hi));
    const isVisible = () => el.isConnected && getComputedStyle(el).display !== 'none';

    // transform 중앙정렬 상태를 현재 화면 위치의 left/top 픽셀로 한 번 바꾼다.
    function ensurePinned() {
        if (el.dataset.dragPinned === '1') return;
        const r = el.getBoundingClientRect();
        el.style.transform = 'none';
        el.style.left = r.left + 'px';
        el.style.top = r.top + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.dataset.dragPinned = '1';
    }

    function clamp() {
        if (!isVisible()) return;
        ensurePinned();
        // 창보다 크면 창 안에 들어가도록 최대 크기를 먼저 제한한다.
        el.style.maxWidth = Math.max(0, window.innerWidth - margin * 2) + 'px';
        el.style.maxHeight = Math.max(0, window.innerHeight - margin * 2) + 'px';
        const r = el.getBoundingClientRect();
        const left = clampRange(r.left, margin, window.innerWidth - r.width - margin);
        const top = clampRange(r.top, margin, window.innerHeight - r.height - margin);
        el.style.left = left + 'px';
        el.style.top = top + 'px';
    }

    function onDown(e) {
        if (e.button !== undefined && e.button !== 0) return;
        if (e.target.closest && e.target.closest('button, input, textarea, select, a, label')) return;
        ensurePinned();
        const r = el.getBoundingClientRect();
        drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
        try { handle.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
        e.preventDefault();
    }

    function onMove(e) {
        if (!drag || e.pointerId !== drag.id) return;
        const r = el.getBoundingClientRect();
        const left = clampRange(e.clientX - drag.dx, margin, window.innerWidth - r.width - margin);
        const top = clampRange(e.clientY - drag.dy, margin, window.innerHeight - r.height - margin);
        el.style.left = left + 'px';
        el.style.top = top + 'px';
    }

    function onUp(e) {
        if (drag && e.pointerId === drag.id) drag = null;
    }

    handle.addEventListener('pointerdown', onDown);
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
    window.addEventListener('resize', clamp);

    // 요소가 보이거나 크기가 바뀔 때도 다시 맞춘다 (display 전환, 내용 변화 포함).
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => clamp());
        ro.observe(el);
    }

    return {
        clamp,
        destroy() {
            handle.removeEventListener('pointerdown', onDown);
            handle.removeEventListener('pointermove', onMove);
            handle.removeEventListener('pointerup', onUp);
            handle.removeEventListener('pointercancel', onUp);
            window.removeEventListener('resize', clamp);
            if (ro) ro.disconnect();
        }
    };
}

if (typeof window !== 'undefined') {
    window.makeDraggable = makeDraggable;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = makeDraggable;
    module.exports.makeDraggable = makeDraggable;
}

if (typeof exports !== 'undefined') {
    exports.makeDraggable = makeDraggable;
}
