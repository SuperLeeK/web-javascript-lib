/**
 * 화면의 버튼을 클릭해 핸들러를 추출하고, 지정한 이름의 전역 함수로 등록합니다.
 * 스크립트를 넣어도 바로 실행되지 않습니다. 필요할 때 bindUniversalButton()을 호출하세요.
 *
 * @example
 * <script src="libs/bindUniversalButton.js"></script>
 * <script>bindUniversalButton();</script>
 *
 * @returns {Function} 선택 모드를 종료하는 cleanup
 */
function bindUniversalButton() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', border: '2px dashed #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)', pointerEvents: 'none',
        zIndex: '999999', display: 'none', transition: 'all 0.05s ease'
    });
    document.body.appendChild(overlay);

    let targetEl = null;

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
        }
    };

    const onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        cleanup();

        if (!targetEl) return;

        let extractedFn = null;
        let mode = 'DOM Click (범용)';

        // 1. React 핸들러 탐색
        let current = targetEl;
        for (let i = 0; i < 4 && current; i++) {
            const propsKey = Object.keys(current).find(k => k.startsWith('__reactProps'));
            if (propsKey && typeof current[propsKey]?.onClick === 'function') {
                const rawFn = current[propsKey].onClick;
                extractedFn = () => rawFn({ preventDefault: () => {}, stopPropagation: () => {} });
                mode = 'React onClick';
                break;
            }
            current = current.parentElement;
        }

        // 2. React가 아니면 인라인 onclick 또는 네이티브 click() 트리거로 래핑
        if (!extractedFn) {
            const capturedEl = targetEl;
            if (typeof capturedEl.onclick === 'function') {
                extractedFn = () => capturedEl.onclick();
                mode = 'Inline onclick';
            } else {
                // addEventListener로 등록된 일반 JS / Vue / Angular 이벤트 실행
                extractedFn = () => capturedEl.click();
                mode = 'Native DOM .click()';
            }
        }

        showNameForm(extractedFn, mode);
    };

    const showNameForm = (fn, mode) => {
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
                <input type="text" id="__fn_name_input__" placeholder="등록할 함수명 (예: bow)" required
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

        modal.querySelector('#__binder_cancel__').onclick = () => modal.remove();
        modal.querySelector('#__binder_inner_form__').onsubmit = (ev) => {
            ev.preventDefault();
            const fnName = input.value.trim();
            if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(fnName)) {
                alert('올바른 자바스크립트 함수 이름을 입력하세요.');
                return;
            }
            window[fnName] = fn;
            console.log(`🎉 [${mode}] 등록 완료! 콘솔에서 ${fnName}() 실행 가능`);
            modal.remove();
        };
    };

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    console.log('🎯 등록할 버튼을 클릭하세요. (ESC: 취소)');

    return cleanup;
}

window.bindUniversalButton = bindUniversalButton;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = bindUniversalButton;
}

if (typeof exports !== 'undefined') {
    exports.bindUniversalButton = bindUniversalButton;
}
