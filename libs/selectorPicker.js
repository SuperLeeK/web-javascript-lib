// openSelectorPicker: 과녁으로 요소를 고르고, 부모/자식/이전/다음으로 옮기며 선택자를 확정하는 창.
// 어댑블로커의 "선택자 지정" 창을 공통 모듈로 옮긴 것이다.
// 필요: pickElement.js, draggableModal.js 가 먼저 로드되어 있어야 한다.
//
//   const r = await openSelectorPicker({ title: '타이틀 선택자', ignore: [panelEl] });
//   // 또는 기존 선택자로 바로 열기:
//   const r2 = await openSelectorPicker({ title: '타이틀 선택자', initialSelector: '.ne-title' });
//   r -> { selector, element, wildcard } | null   (취소 또는 ESC 면 null)
//
// 옵션
//   title            창 제목
//   initialSelector  있고 일치하는 요소가 있으면 그 요소로 바로 창을 연다. 없으면 과녁 모드로 시작한다
//   ignore           과녁이 무시할 요소들 (패널 등). 이 창 자신은 항상 무시한다
//   wildcard         { domain, checked } 를 주면 와일드카드 체크박스를 보여준다. 결과의 wildcard 로 돌려준다
//   accent           강조 색 (기본 '#ff9800')
//
// 보조 함수
//   evaluateSelector(selector, root?) -> { ok, error, count, elements }   실행 결과를 바로 볼 때 쓴다
//   selectorCandidates(el) -> [{ selector, count }]                       추천 선택자 목록

// 어댑블로커와 같은 규칙: #prefix* 는 [id^="prefix"] 로 바꾼다
function normalizeWildcardSelector(selector) {
    return String(selector || '').replace(/#([a-zA-Z0-9_\-]+)\*/g, (m, prefix) => `[id^="${prefix}"]`);
}

// 확장 문법 :has-text("글") / :contains("글") 을 지원한다 (어댑블로커와 같은 규칙).
// 예: div.item:has-text("1화부터") > a  /  li:has-text(/완결/i)
// 글 조건은 앞쪽 선택자로 후보를 모은 뒤 textContent 로 거른다. 뒤에 > 나 공백 자식 선택자를 붙이면 그 안에서 찾는다.
function queryExtended(selectorStr, root) {
    const scope = root || document;
    const hasTextIdx = selectorStr.indexOf(':has-text(');
    const containsIdx = selectorStr.indexOf(':contains(');
    if (hasTextIdx === -1 && containsIdx === -1) return Array.from(scope.querySelectorAll(selectorStr));

    const keyword = hasTextIdx !== -1 ? ':has-text(' : ':contains(';
    const targetIdx = hasTextIdx !== -1 ? hasTextIdx : containsIdx;
    const prefix = selectorStr.substring(0, targetIdx).trim();
    const rest = selectorStr.substring(targetIdx + keyword.length);
    const closeIdx = rest.indexOf(')');
    if (closeIdx === -1) return Array.from(scope.querySelectorAll(selectorStr)); // 잘못된 문법이면 여기서 오류가 난다

    let pattern = rest.substring(0, closeIdx).trim();
    const suffix = rest.substring(closeIdx + 1);
    let baseSelector = prefix || '*';
    let childSelector = '';
    if (suffix.trim()) {
        const s = suffix.trimStart();
        if (/^[>+~ ]/.test(suffix) || s.startsWith('>') || s.startsWith('+') || s.startsWith('~')) childSelector = s.trim();
        else baseSelector = prefix + suffix.trim();
    }

    if ((pattern.startsWith("'") && pattern.endsWith("'")) || (pattern.startsWith('"') && pattern.endsWith('"'))) {
        pattern = pattern.slice(1, -1);
    }

    const matchText = (text) => {
        if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
            const i = pattern.lastIndexOf('/');
            try { return new RegExp(pattern.slice(1, i), pattern.slice(i + 1)).test(text); } catch (e) { return false; }
        }
        return text.includes(pattern);
    };

    const filtered = Array.from(scope.querySelectorAll(baseSelector)).filter((el) => matchText(el.textContent || ''));
    if (!childSelector) return filtered;

    const results = [];
    filtered.forEach((parent) => results.push(...Array.from(parent.querySelectorAll(':scope ' + childSelector))));
    return Array.from(new Set(results));
}

function evaluateSelector(selector, root) {
    const text = normalizeWildcardSelector(String(selector || '').trim());
    if (!text) return { ok: false, error: '선택자가 비어 있습니다', count: 0, elements: [] };
    try {
        const elements = queryExtended(text, root);
        return { ok: true, error: '', count: elements.length, elements };
    } catch (e) {
        return { ok: false, error: e.message, count: 0, elements: [] };
    }
}

function selectorCandidates(el) {
    const out = [];
    const add = (sel) => { if (sel && !out.includes(sel)) out.push(sel); };
    const tag = el.tagName.toLowerCase();
    const safeClass = (c) => /^[A-Za-z_][\w-]*$/.test(c);
    const classes = Array.from(el.classList || []).filter(safeClass);

    if (typeof window.pickElementSelector === 'function') add(window.pickElementSelector(el));
    if (el.id) add('#' + CSS.escape(el.id));
    classes.forEach((c) => add(`${tag}.${c}`));
    if (classes.length > 1) add(tag + classes.map((c) => '.' + c).join(''));
    classes.forEach((c) => add('.' + c));

    // 가까운 조상의 클래스를 앞에 붙인 형태 (예: .list-item .title)
    let anc = el.parentElement;
    for (let depth = 0; anc && anc !== document.body && depth < 3; depth++, anc = anc.parentElement) {
        const ancClass = Array.from(anc.classList || []).filter(safeClass)[0];
        if (ancClass) {
            add(`.${ancClass} ${classes.length ? tag + '.' + classes[0] : tag}`);
            break;
        }
    }
    add(tag);

    return out
        .map((sel) => {
            const r = evaluateSelector(sel);
            return { selector: sel, ok: r.ok && r.elements.includes(el), count: r.count };
        })
        .filter((x) => x.ok)
        .sort((a, b) => (a.count - b.count) || (a.selector.length - b.selector.length))
        .map((x) => ({ selector: x.selector, count: x.count }));
}

function describeNode(n) {
    let s = n.tagName.toLowerCase();
    if (n.id) s += '#' + n.id;
    const cls = Array.from(n.classList || []).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    return s;
}

function openSelectorModal(startEl, opts) {
    return new Promise((resolve) => {
        const accent = opts.accent || '#ff9800';
        let current = startEl;
        let settled = false;

        const overlay = document.createElement('div');
        overlay.id = '__sel_overlay__';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;pointer-events:none;z-index:1000001;';
        document.body.appendChild(overlay);

        const modal = document.createElement('div');
        modal.id = '__sel_modal__';
        modal.style.cssText = [
            'position:fixed', 'bottom:24px', 'right:24px', 'z-index:1000002', 'width:400px',
            'max-width:calc(100vw - 16px)', 'background:#18181b', 'color:#f4f4f5', 'border-radius:12px',
            'border:1px solid rgba(255,255,255,0.15)', 'box-shadow:0 10px 30px rgba(0,0,0,0.6)',
            'font-family:system-ui,-apple-system,sans-serif', 'font-size:13px', 'box-sizing:border-box', 'overflow:hidden'
        ].join(';');

        const btn = 'padding:5px 8px;background:#27272a;color:#f4f4f5;border:1px solid #3f3f46;border-radius:6px;font-size:11px;cursor:pointer;font-weight:500;';
        const field = 'width:100%;box-sizing:border-box;padding:8px 10px;background:#09090b;color:#4ade80;border:1px solid #3f3f46;border-radius:6px;font-family:monospace;font-size:12px;outline:none;';

        modal.innerHTML = `
            <div data-handle style="padding:12px 16px;background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;cursor:move;user-select:none;">
                <span data-title style="font-weight:600;color:${accent};"></span>
                <button data-close type="button" style="background:none;border:none;color:#a1a1aa;font-size:18px;cursor:pointer;padding:0 4px;line-height:1;">&times;</button>
            </div>
            <div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <span style="color:#a1a1aa;font-size:12px;font-weight:500;">요소 탐색</span>
                    <div style="display:flex;gap:4px;">
                        <button data-nav="parent" type="button" style="${btn}" title="부모 요소">▲ 부모</button>
                        <button data-nav="child" type="button" style="${btn}" title="첫 자식 요소">▼ 자식</button>
                        <button data-nav="prev" type="button" style="${btn}" title="이전 형제 요소">◀ 이전</button>
                        <button data-nav="next" type="button" style="${btn}" title="다음 형제 요소">▶ 다음</button>
                    </div>
                </div>
                <div data-tree style="height:110px;overflow-y:auto;background:#09090b;border:1px solid #27272a;border-radius:6px;padding:6px 8px;font-family:monospace;font-size:11px;color:#a1a1aa;box-sizing:border-box;"></div>
                <div>
                    <label style="display:block;color:#a1a1aa;font-size:12px;margin-bottom:4px;font-weight:500;">선택자 (Selector)</label>
                    <input data-input type="text" style="${field}" />
                    <div data-result style="margin-top:4px;font-size:11px;color:#a1a1aa;font-family:monospace;"></div>
                </div>
                <div>
                    <label style="display:block;color:#a1a1aa;font-size:11px;margin-bottom:4px;font-weight:500;">추천 선택자 (선택 시 입력에 적용)</label>
                    <select data-cands style="width:100%;box-sizing:border-box;height:36px;padding:6px 10px;background:#09090b;color:#4ade80;border:1px solid #3f3f46;border-radius:6px;font-family:monospace;font-size:12px;outline:none;"></select>
                </div>
                ${opts.wildcard ? `
                <label style="display:flex;align-items:center;gap:8px;color:#a1a1aa;font-size:12px;cursor:pointer;user-select:none;">
                    <input data-wild type="checkbox" ${opts.wildcard.checked ? 'checked' : ''} style="width:16px;height:16px;accent-color:${accent};margin:0;" />
                    <span>와일드카드 도메인 적용 <span style="color:#ffab40;font-family:monospace;font-size:11px;">(${opts.wildcard.domain || ''})</span></span>
                </label>` : ''}
                <div style="display:flex;justify-content:flex-end;gap:8px;">
                    <button data-cancel type="button" style="padding:6px 14px;background:#27272a;color:#d4d4d8;border:1px solid #3f3f46;border-radius:6px;font-size:12px;cursor:pointer;">취소</button>
                    <button data-confirm type="button" style="padding:6px 16px;background:${accent};color:#09090b;font-weight:600;border:none;border-radius:6px;font-size:12px;cursor:pointer;">확인 및 적용</button>
                </div>
            </div>`;
        modal.querySelector('[data-title]').textContent = (opts.title || '선택자 지정');
        document.body.appendChild(modal);

        const $ = (sel) => modal.querySelector(sel);
        const input = $('[data-input]');
        const tree = $('[data-tree]');
        const result = $('[data-result]');
        const cands = $('[data-cands]');
        const wild = $('[data-wild]');
        const drag = typeof window.makeDraggable === 'function' ? window.makeDraggable(modal, { handle: $('[data-handle]'), margin: 8 }) : null;

        function finish(value) {
            if (settled) return;
            settled = true;
            document.removeEventListener('keydown', onKey, true);
            window.removeEventListener('scroll', redraw, true);
            window.removeEventListener('resize', redraw);
            if (drag) drag.destroy();
            overlay.remove();
            modal.remove();
            resolve(value);
        }

        function onKey(e) {
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(null); }
        }

        function drawBox(el, background, border) {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) return;
            const box = document.createElement('div');
            box.style.cssText = `position:absolute;pointer-events:none;box-sizing:border-box;background:${background};border:${border};` +
                `top:${r.top + window.pageYOffset}px;left:${r.left + window.pageXOffset}px;width:${r.width}px;height:${r.height}px;`;
            overlay.appendChild(box);
        }

        function redraw() {
            overlay.textContent = '';
            const r = evaluateSelector(input.value);
            if (r.ok) r.elements.slice(0, 100).forEach((el) => { if (!modal.contains(el)) drawBox(el, 'rgba(255,152,0,0.18)', `2px dashed ${accent}`); });
            drawBox(current, 'transparent', '3px solid #22d3ee');
        }

        function updateResult() {
            const r = evaluateSelector(input.value);
            if (!input.value.trim()) {
                result.style.color = '#a1a1aa';
                result.textContent = '선택자를 입력하세요.';
            } else if (!r.ok) {
                result.style.color = '#f87171';
                result.textContent = '잘못된 선택자: ' + r.error;
            } else {
                result.style.color = r.count ? '#4ade80' : '#fbbf24';
                const preview = r.count ? (r.elements[0].innerText || r.elements[0].textContent || '').trim().slice(0, 40) : '';
                result.textContent = `일치 ${r.count}개` + (preview ? ` · 첫 항목: "${preview}"` : '');
            }
        }

        function renderTree() {
            tree.textContent = '';
            const chain = [];
            for (let n = current; n && n.nodeType === 1; n = n.parentElement) chain.unshift(n);
            const line = (depth, n, mark, active) => {
                const row = document.createElement('div');
                row.textContent = mark + describeNode(n);
                row.style.cssText = `padding-left:${depth * 12}px;white-space:nowrap;cursor:pointer;border-radius:3px;` +
                    (active ? `color:${accent};font-weight:700;background:rgba(255,152,0,0.12);` : '');
                row.addEventListener('click', () => { current = n; sync(true); });
                tree.appendChild(row);
            };
            chain.forEach((n, i) => line(i, n, n === current ? '▶ ' : '▲ ', n === current));
            const kids = Array.from(current.children).slice(0, 20);
            kids.forEach((k) => line(chain.length, k, '└ ', false));
        }

        function renderNavButtons() {
            const hasParent = current.parentElement && current.parentElement !== document.documentElement;
            $('[data-nav="parent"]').disabled = !hasParent;
            $('[data-nav="child"]').disabled = !current.firstElementChild;
            $('[data-nav="prev"]').disabled = !current.previousElementSibling;
            $('[data-nav="next"]').disabled = !current.nextElementSibling;
            modal.querySelectorAll('[data-nav]').forEach((b) => { b.style.opacity = b.disabled ? '0.4' : '1'; });
        }

        // resetInput: 탐색으로 요소가 바뀌면 추천 1순위를 입력에 넣는다
        function sync(resetInput) {
            const list = selectorCandidates(current);
            cands.textContent = '';
            list.forEach((c) => {
                const opt = document.createElement('option');
                opt.value = c.selector;
                opt.textContent = `[${c.count}] ${c.selector}`;
                cands.appendChild(opt);
            });
            if (resetInput) input.value = list.length ? list[0].selector : describeNode(current);
            cands.value = input.value;
            renderTree();
            renderNavButtons();
            updateResult();
            redraw();
        }

        $('[data-close]').addEventListener('click', () => finish(null));
        $('[data-cancel]').addEventListener('click', () => finish(null));
        $('[data-confirm]').addEventListener('click', () => {
            const sel = input.value.trim();
            const r = evaluateSelector(sel);
            if (!r.ok) { updateResult(); return; }
            finish({ selector: sel, element: current, wildcard: wild ? wild.checked : false });
        });
        modal.querySelector('[data-nav="parent"]').addEventListener('click', () => { if (current.parentElement) { current = current.parentElement; sync(true); } });
        modal.querySelector('[data-nav="child"]').addEventListener('click', () => { if (current.firstElementChild) { current = current.firstElementChild; sync(true); } });
        modal.querySelector('[data-nav="prev"]').addEventListener('click', () => { if (current.previousElementSibling) { current = current.previousElementSibling; sync(true); } });
        modal.querySelector('[data-nav="next"]').addEventListener('click', () => { if (current.nextElementSibling) { current = current.nextElementSibling; sync(true); } });
        input.addEventListener('input', () => { updateResult(); redraw(); cands.value = input.value; });
        cands.addEventListener('change', () => { input.value = cands.value; updateResult(); redraw(); });
        document.addEventListener('keydown', onKey, true);
        window.addEventListener('scroll', redraw, true);
        window.addEventListener('resize', redraw);

        if (startEl && opts.initialSelector && evaluateSelector(opts.initialSelector).ok) input.value = opts.initialSelector;
        sync(!(opts.initialSelector && input.value === opts.initialSelector));
        input.focus();
    });
}

async function openSelectorPicker(options) {
    const opts = options || {};
    let start = null;
    if (opts.initialSelector) {
        const r = evaluateSelector(opts.initialSelector);
        if (r.ok && r.elements.length) start = r.elements[0];
    }
    if (!start) {
        if (typeof window.pickElement !== 'function') {
            alert('pickElement 를 불러오지 못했습니다. 먼저 pickElement.js 를 로드하세요.');
            return null;
        }
        const picked = await window.pickElement({ ignore: opts.ignore || [] });
        if (!picked) return null;
        start = picked.element;
    }
    return openSelectorModal(start, opts);
}

if (typeof window !== 'undefined') {
    window.openSelectorPicker = openSelectorPicker;
    window.evaluateSelector = evaluateSelector;
    window.selectorCandidates = selectorCandidates;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = openSelectorPicker;
    module.exports.openSelectorPicker = openSelectorPicker;
    module.exports.evaluateSelector = evaluateSelector;
    module.exports.selectorCandidates = selectorCandidates;
}

if (typeof exports !== 'undefined') {
    exports.openSelectorPicker = openSelectorPicker;
    exports.evaluateSelector = evaluateSelector;
    exports.selectorCandidates = selectorCandidates;
}
