# web-javascript-lib

브라우저 `<script>`와 Tampermonkey `@require`에서 쓰는 프론트 헬퍼 모음입니다.

## bindUniversalButton

`libs/bindUniversalButton.js`는 화면의 버튼을 집어 핸들러를 함수로 뽑습니다. 탐색 순서는 React `onClick`(`__reactProps`) → inline `onclick` → `el.click()` 입니다.

```html
<script src="libs/bindUniversalButton.js"></script>
<script>bindUniversalButton();</script>
```

```javascript
// @require https://raw.githubusercontent.com/SuperLeeK/web-javascript-lib/main/libs/bindUniversalButton.js
```

`bindUniversalButton()`은 바로 cleanup 함수를 반환합니다. 버튼을 고르고 이름을 확정하는 과정은 기다리지 않습니다. 인자 없이 호출하면 이전과 같이 이름 입력 폼을 띄웁니다.

`bindUniversalButtonAsync(options)`는 같은 UI를 쓰고, 이름이 확정되면 Promise가 결과로 resolve 됩니다. ESC 또는 취소 버튼이면 `null`입니다.

```javascript
const picked = await bindUniversalButtonAsync({ name: 'tempFn' });
// picked: { name: 'tempFn', fn, mode, element } | null
if (picked) picked.fn();

const registryOnly = await bindUniversalButtonAsync({
    name: 'tempFn',
    register: false
});
```

### 옵션

| 옵션 | 기본값 | 설명 |
| --- | --- | --- |
| `name` | 없음 | 문자열이면 이름 입력 폼을 건너뛰고 그 이름으로 등록합니다. 예: `"tempFn"` |
| `register` | `true` | `false`이면 `target[name] = fn` 전역 할당만 생략합니다. 레지스트리에는 남습니다. |
| `target` | `unsafeWindow` 또는 `window` | 전역 등록 대상. Tampermonkey 샌드박스에서는 페이지 전역인 `unsafeWindow`가 기본입니다. |

잘못된 `name`(식별자가 아닌 문자열)은 비동기 호출에서 reject 되고, 동기 호출에서는 선택 UI를 열지 않은 채 빈 cleanup을 반환합니다.

전역 할당이 막혀 있거나 `target`이 객체가 아니면 예외를 던지지 않습니다. 경고를 남기고 레지스트리 등록은 유지하며, async 호출은 결과 객체로 resolve 됩니다.

동기 함수도 같은 옵션을 받습니다. `bindUniversalButton({ name: 'tempFn' })`은 cleanup을 즉시 반환하고, 버튼을 고른 뒤에 그 이름으로 등록합니다.

### 레지스트리

이름이 확정된 함수는 공유 객체 `bound`에도 저장됩니다. 아래는 모두 같은 객체입니다.

- `bindUniversalButton.bound`
- `bindUniversalButtonAsync.bound`
- `window.WJLBound`
- `unsafeWindow.WJLBound` (`unsafeWindow`가 있을 때)

샌드박스에서 페이지로 넘길 때는 라이브러리가 넣어 둔 참조를 다시 노출하면 됩니다. 광고차단 유저스크립트는 이 객체를 `WJL.bound`로 두면 됩니다.

```javascript
const bound = bindUniversalButton.bound; // 또는 window.WJLBound
WJL.bound = bound;
bound.tempFn();
```

`WJLBound`라는 이름은 레지스트리 전역이라 함수 이름으로 덮어쓰지 않습니다. 그 이름이 필요하면 `bindUniversalButton.bound.WJLBound()`로 호출합니다.

Node에서 `require('./libs/bindUniversalButton.js')`는 `bindUniversalButton` 함수를 반환합니다. `bindUniversalButtonAsync`와 `bound`는 그 함수의 속성입니다.
