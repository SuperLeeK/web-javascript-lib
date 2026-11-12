/**
 * 화면의 버튼을 클릭해 핸들러를 추출하고, 지정한 이름의 함수로 등록합니다.
 * 스크립트를 넣어도 바로 실행되지 않습니다. 필요할 때 호출하세요.
 *
 * 핸들러 탐색 순서: React onClick(__reactProps) → inline onclick → el.click().
 *
 * 등록은 두 곳에 남습니다.
 * - 전역: options.target. 기본값은 unsafeWindow 가 있으면 그 객체, 없으면 window.
 *   Tampermonkey @require 안에서는 페이지 콘솔이 보는 전역이 unsafeWindow 입니다.
 *   할당이 실패하면 경고만 찍고, 레지스트리 등록은 유지합니다.
 * - 레지스트리: 이름이 확정된 함수는 항상 아래 객체에 저장됩니다. 셋은 같은 객체입니다.
 *     bindUniversalButton.bound
 *     bindUniversalButtonAsync.bound
 *     window.WJLBound          (unsafeWindow 가 있으면 그 쪽에도 같은 참조)
 *   유저스크립트에서는 샌드박스 쪽 참조를 꺼내 페이지의 WJL.bound 로 다시 노출하면 됩니다.
 *     const bound = bindUniversalButton.bound;
 *     WJL.bound = bound;
 *
 * @example
 * <script src="libs/bindUniversalButton.js"></script>
 * <script>bindUniversalButton();</script>
 *
 * @example
 * const picked = await bindUniversalButtonAsync({ name: 'tempFn' });
 * if (picked) picked.fn();
 *
 * @example
 * // 페이지 전역에는 올리지 않고 레지스트리에만 둔다
 * const picked = await bindUniversalButtonAsync({ name: 'tempFn', register: false });
 * bindUniversalButton.bound.tempFn();
 * window.WJLBound.tempFn();
 *
 * @param {Object} [options]
 * @param {string} [options.name] 있으면 이름 입력 폼을 건너뛰고 이 이름으로 등록합니다. 예: "tempFn"
 * @param {boolean} [options.register=true] false 이면 target[name] 전역 할당만 생략합니다. bound 에는 남습니다.
 * @param {Object} [options.target] 전역 등록 대상. 기본값은 unsafeWindow || window.
 * @returns {Function} 선택 모드를 종료하는 cleanup. 인자 없이 호출하면 이전과 같습니다.
 */
function bindUniversalButton(options) {
    const opts = normalizeBindOptions(options);
    if (opts.name && !isValidFnName(opts.name)) {
        console.error(INVALID_FN_NAME_MSG);
        return function cleanup() {};
    }
    return startButtonBind(opts, null);
}

/**
 * bindUniversalButton 과 같은 선택 UI로 핸들러를 고르고, 이름이 확정되면 resolve 합니다.
 * ESC, 취소 버튼, 또는 가리킨 요소 없이 클릭하면 null. 잘못된 options.name 이면 reject.
 *
 * @param {Object} [options] bindUniversalButton 과 같은 옵션
 * @param {string} [options.name]
 * @param {boolean} [options.register=true]
 * @param {Object} [options.target]
 * @returns {Promise<{name: string, fn: Function, mode: string, element: Element}|null>}
 */
function bindUniversalButtonAsync(options) {
    const opts = normalizeBindOptions(options);
    if (opts.name && !isValidFnName(opts.name)) {
        return Promise.reject(new Error(INVALID_FN_NAME_MSG));
    }
    return new Promise((resolve) => {
        startButtonBind(opts, resolve);
    });
}

const bound = {};
const FN_NAME_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const INVALID_FN_NAME_MSG = '올바른 자바스크립트 함수 이름을 입력하세요.';
const RESERVED_GLOBAL_NAMES = { WJLBound: true };

function isValidFnName(name) {
    return FN_NAME_RE.test(name);
}

function looksLikeDomEvent(value) {
    return !!value
        && typeof value === 'object'
        && typeof value.type === 'string'
        && typeof value.preventDefault === 'function'
        && typeof value.stopPropagation === 'function';
}

// 페이지 콘솔에서 호출하려면 샌드박스 window 가 아니라 페이지 전역에 올려야 한다.
function defaultRegistrationTarget() {
    try {
        if (typeof unsafeWindow !== 'undefined' && unsafeWindow) return unsafeWindow;
    } catch (e) {}
    return typeof window !== 'undefined' ? window : undefined;
}

function normalizeBindOptions(options) {
    if (!options || typeof options !== 'object' || looksLikeDomEvent(options)) {
        return { name: '', register: true, target: defaultRegistrationTarget() };
    }
    const name = typeof options.name === 'string' ? options.name.trim() : '';
    const register = options.register !== false;
    const hasTarget = Object.prototype.hasOwnProperty.call(options, 'target') && options.target != null;
    return {
        name: name,
        register: register,
        target: hasTarget ? options.target : defaultRegistrationTarget()
    };
}

function extractButtonHandler(targetEl) {
    let current = targetEl;
    for (let i = 0; i < 4 && current; i++) {
        const propsKey = Object.keys(current).find(k => k.startsWith('__reactProps'));
        if (propsKey && typeof current[propsKey]?.onClick === 'function') {
            const rawFn = current[propsKey].onClick;
            return {
                fn: () => rawFn({ preventDefault: () => {}, stopPropagation: () => {} }),
                mode: 'React onClick'
            };
        }
        current = current.parentElement;
    }

    const capturedEl = targetEl;
    if (typeof capturedEl.onclick === 'function') {
        return {
            fn: () => capturedEl.onclick(),
            mode: 'Inline onclick'
        };
    }

    // addEventListener 로 등록된 일반 JS / Vue / Angular 이벤트
    return {
        fn: () => capturedEl.click(),
        mode: 'Native DOM .click()'
    };
}

function registerBoundFunction(fnName, fn, mode, opts) {
    bound[fnName] = fn;

    if (!opts.register) {
        console.log(`🎉 [${mode}] 레지스트리 등록 완료! bindUniversalButton.bound.${fnName}()`);
        return;
    }

    if (RESERVED_GLOBAL_NAMES[fnName]) {
        console.warn(`⚠️ [${mode}] ${fnName} 이름은 레지스트리 전역이라 함수로 덮어쓰지 않습니다. bindUniversalButton.bound.${fnName}() 로 호출하세요.`);
        return;
    }

    try {
        const target = opts.target;
        if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
            throw new TypeError('registration target is not an object');
        }
        target[fnName] = fn;
        console.log(`🎉 [${mode}] 등록 완료! 콘솔에서 ${fnName}() 실행 가능`);
    } catch (err) {
        console.warn(`⚠️ [${mode}] 전역 등록 실패 (${fnName}). bindUniversalButton.bound.${fnName}() 로 호출하세요.`, err);
    }
}

function showNameForm(fn, mode, element, opts, done) {
    const modal = document.createElement('div');
    modal.id = '__universal_binder_form__';
    Object.assign(modal.style, {
        position: 'fixed', top: '20px', right: '20px', zIndex: '1000000',
        background: '#1e1e1e', color: '#fff', padding: '16px',
        borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        fontFamily: 'sans-serif', fontSize: '13px', border: '1px solid #444'
    });

    modal.innerHTML = `
        <form id="__binder_inner_form__" style="display:flex; flex-direction:column; gap:10px; margin:0;">
            <div style="font-weight:bold; color:#60a5fa;">✅ 추출 완료 (${mode})</div>
            <input type="text" id="__fn_name_input__" placeholder="등록할 함수명 (예: tempFn)" required
                style="padding:6px 8px; border-radius:4px; border:1px solid #555; background:#2d2d2d; color:#fff; outline:none;" />
            <div style="display:flex; gap:6px; justify-content:flex-end;">
                <button type="button" id="__binder_cancel__" style="padding:5px 10px; background:#444; color:#fff; border:none; border-radius:4px; cursor:pointer;">취소</button>
                <button type="submit" style="padding:5px 10px; background:#2563eb; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">등록</button>
            </div>
        </form>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector('#__fn_name_input__');
    input.focus();

    let formClosed = false;
    const closeForm = (result, logCancel) => {
        if (formClosed) return;
        formClosed = true;
        document.removeEventListener('keydown', onFormKey, true);
        modal.remove();
        if (logCancel) console.log('❌ 선택 취소');
        done(result);
    };

    const onFormKey = (e) => {
        if (e.key === 'Escape') closeForm(null, true);
    };

    modal.querySelector('#__binder_cancel__').onclick = () => closeForm(null, false);
    modal.querySelector('#__binder_inner_form__').onsubmit = (ev) => {
        ev.preventDefault();
        const fnName = input.value.trim();
        if (!isValidFnName(fnName)) {
            alert(INVALID_FN_NAME_MSG);
            return;
        }
        registerBoundFunction(fnName, fn, mode, opts);
        closeForm({ name: fnName, fn: fn, mode: mode, element: element }, false);
    };

    document.addEventListener('keydown', onFormKey, true);
}

function startButtonBind(opts, finish) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', border: '2px dashed #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)', pointerEvents: 'none',
        zIndex: '999999', display: 'none', transition: 'all 0.05s ease'
    });
    document.body.appendChild(overlay);

    let targetEl = null;
    let settled = false;
    const done = (result) => {
        if (settled) return;
        settled = true;
        if (typeof finish === 'function') finish(result);
    };

    const onMouseMove = (e) => {
        const el = e.target.closest('button, [role="button"], a, input[type="button"], input[type="submit"]') || e.target;
        if (el === overlay || el.closest('#__universal_binder_form__')) return;
        targetEl = el;
        const rect = el.getBoundingClientRect();
        Object.assign(overlay.style, {
            display: 'block', top: rect.top + 'px', left: rect.left + 'px',
            width: rect.width + 'px', height: rect.height + 'px'
        });
    };

    const cleanup = () => {
        document.removeEventListener('mousemove', onMouseMove, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
        overlay.remove();
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            cleanup();
            console.log('❌ 선택 취소');
            done(null);
        }
    };

    const onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const picked = targetEl;
        cleanup();

        if (!picked) {
            done(null);
            return;
        }

        const extracted = extractButtonHandler(picked);
        if (opts.name) {
            registerBoundFunction(opts.name, extracted.fn, extracted.mode, opts);
            done({ name: opts.name, fn: extracted.fn, mode: extracted.mode, element: picked });
            return;
        }
        showNameForm(extracted.fn, extracted.mode, picked, opts, done);
    };

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    console.log('🎯 등록할 버튼을 클릭하세요. (ESC: 취소)');

    return cleanup;
}

function publishBoundRegistry() {
    const targets = [];
    const push = (value) => {
        if (value && targets.indexOf(value) === -1) targets.push(value);
    };
    if (typeof window !== 'undefined') push(window);
    try {
        if (typeof unsafeWindow !== 'undefined') push(unsafeWindow);
    } catch (e) {}
    for (let i = 0; i < targets.length; i++) {
        try {
            targets[i].WJLBound = bound;
        } catch (e) {}
    }
}

bindUniversalButton.bound = bound;
bindUniversalButtonAsync.bound = bound;

if (typeof window !== 'undefined') {
    window.bindUniversalButton = bindUniversalButton;
    window.bindUniversalButtonAsync = bindUniversalButtonAsync;
}

publishBoundRegistry();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = bindUniversalButton;
    module.exports.bindUniversalButton = bindUniversalButton;
    module.exports.bindUniversalButtonAsync = bindUniversalButtonAsync;
    module.exports.bound = bound;
}

if (typeof exports !== 'undefined') {
    exports.bindUniversalButton = bindUniversalButton;
    exports.bindUniversalButtonAsync = bindUniversalButtonAsync;
    exports.bound = bound;
}
