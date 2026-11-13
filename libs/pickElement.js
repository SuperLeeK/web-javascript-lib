// pickElement: 마우스로 페이지 요소를 고르고 CSS 선택자를 돌려준다.
//
//   const picked = await pickElement({ ignore: myPanelEl });
//   picked -> { element, selector } | null   (ESC 또는 취소면 null)
//
// - 선택 중에는 대상 요소의 클릭, 마우스다운/업이 페이지 핸들러로 전달되지 않는다.
// - ignore 에 든 요소(및 그 안의 요소)는 하이라이트와 선택에서 제외된다. 호출하는 쪽의 패널 등.
// - 선택자는 한 개의 요소만 가리키는 것을 확인한 뒤 돌려준다.

// 선택 모드가 겹쳐도 커서는 마지막 선택이 끝날 때 원래대로 돌린다.
let pickElementActive = 0;
let pickElementCursor = '';

function pickElement(options) {
    const opts = options || {};
    const ignore = [].concat(opts.ignore || []).filter(Boolean);

    return new Promise((resolve) => {
        let settled = false;
        if (pickElementActive === 0) pickElementCursor = document.body.style.cursor;
        pickElementActive++;

        const overlay = document.createElement('div');
        overlay.id = '__pick_element_overlay__';
        Object.assign(overlay.style, {
            position: 'fixed', pointerEvents: 'none', display: 'none', boxSizing: 'border-box',
            border: '2px dashed #ff4757', backgroundColor: 'rgba(255, 71, 87, 0.15)',
            zIndex: '2147483647'
        });
        document.body.appendChild(overlay);

        const isIgnored = (el) => {
            if (!el || el.nodeType !== 1 || el === overlay) return true;
            return ignore.some((root) => root === el || root.contains(el));
        };

        // 페이지 핸들러로 이벤트가 새지 않게 캡처 단계에서 막는다.
        const block = (e) => {
            if (isIgnored(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
        };

        const onMove = (e) => {
            const el = e.target;
            if (isIgnored(el)) {
                overlay.style.display = 'none';
                return;
            }
            const r = el.getBoundingClientRect();
            Object.assign(overlay.style, {
                display: 'block', top: r.top + 'px', left: r.left + 'px',
                width: r.width + 'px', height: r.height + 'px'
            });
        };

        const onClick = (e) => {
            if (isIgnored(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
            finish({ element: e.target, selector: pickElementSelector(e.target) });
        };

        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            e.stopPropagation();
            finish(null);
        };

        const finish = (result) => {
            if (settled) return;
            settled = true;
            document.removeEventListener('mousemove', onMove, true);
            document.removeEventListener('mousedown', block, true);
            document.removeEventListener('mouseup', block, true);
            document.removeEventListener('pointerdown', block, true);
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', onKey, true);
            overlay.remove();
            pickElementActive--;
            if (pickElementActive === 0) document.body.style.cursor = pickElementCursor;
            resolve(result);
        };

        document.body.style.cursor = 'crosshair';
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mousedown', block, true);
        document.addEventListener('mouseup', block, true);
        document.addEventListener('pointerdown', block, true);
        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', onKey, true);
    });
}

// el 하나만 가리키는 CSS 선택자를 만든다. id 가 있으면 그 기준으로 짧게 만들고,
// 아니면 같은 태그 형제가 있을 때만 :nth-of-type 을 붙여 전체 경로를 만든 뒤,
// 앞쪽 단계를 줄여 가며 유일하게 맞는 가장 짧은 선택자를 고른다.
function pickElementSelector(el) {
    const esc = (s) => (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/([^\w-])/g, '\\$1');

    const isOnlyMatch = (sel) => {
        try {
            const found = document.querySelectorAll(sel);
            return found.length === 1 && found[0] === el;
        } catch (e) {
            return false;
        }
    };

    if (el.id) {
        const idSel = '#' + esc(el.id);
        if (isOnlyMatch(idSel)) return idSel;
    }

    const segs = [];
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
        if (node.id) {
            segs.unshift('#' + esc(node.id));
            break;
        }
        const tag = node.tagName.toLowerCase();
        let seg = tag;
        const parent = node.parentElement;
        if (parent) {
            const sameTag = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
            if (sameTag.length > 1) seg += ':nth-of-type(' + (sameTag.indexOf(node) + 1) + ')';
        }
        segs.unshift(seg);
    }

    for (let i = segs.length - 1; i >= 0; i--) {
        const candidate = segs.slice(i).join(' > ');
        if (isOnlyMatch(candidate)) return candidate;
    }
    return segs.join(' > ');
}

if (typeof window !== 'undefined') {
    window.pickElement = pickElement;
    window.pickElementSelector = pickElementSelector;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = pickElement;
    module.exports.pickElement = pickElement;
    module.exports.pickElementSelector = pickElementSelector;
}

if (typeof exports !== 'undefined') {
    exports.pickElement = pickElement;
    exports.pickElementSelector = pickElementSelector;
}
