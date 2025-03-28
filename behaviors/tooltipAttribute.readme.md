# 🎯 Tooltip 시스템 사용 가이드

툴팁 시스템은 HTML 요소에 `tooltip` 속성을 추가하여 사용할 수 있습니다.
필수 속성은 `tooltip` 하나뿐이며, 나머지는 선택적으로 커스터마이징이 가능합니다.

---

## ✅ 1. 기본 사용법

가장 단순한 툴팁:

```html
<button tooltip="삭제됩니다">🗑️ 삭제</button>
```

- 클릭 시 툴팁이 뜨고, 2초 후 자동 사라집니다.
- 기본 위치는 `top`입니다.

---

## ✅ 2. 커스터마이징 옵션

| 속성명             | 설명                                                  | 기본값  |
| ------------------ | ----------------------------------------------------- | ------- |
| `tooltip`          | 툴팁에 표시할 텍스트                                  | (필수)  |
| `tooltip-position` | 툴팁이 표시될 방향 (`top`, `bottom`, `left`, `right`) | `top`   |
| `tooltip-delay`    | 툴팁이 나타나기 전 지연(ms)                           | `0`     |
| `tooltip-duration` | 툴팁이 유지되는 시간(ms)                              | `2000`  |
| `tooltip-motion`   | 애니메이션 종류 (`fade`, `slide`)                     | `fade`  |
| `tooltip-bg`       | 툴팁 배경색                                           | `#333`  |
| `tooltip-color`    | 툴팁 글자색                                           | `#fff`  |
| `tooltip-hover`    | `true`일 경우 hover 시 툴팁 표시                      | `false` |
| `tooltip-on-hide`  | 툴팁이 사라질 때 호출할 함수 이름                     | 없음    |

---

## ✅ 3. 예시들

### 🎈 기본 툴팁

```html
<button tooltip="삭제됩니다">🗑️ 삭제</button>
```

### 🎯 아래쪽에 슬라이드로 뜨는 툴팁 (0.3초 딜레이)

```html
<button
  tooltip="설정 저장됨"
  tooltip-position="bottom"
  tooltip-motion="slide"
  tooltip-delay="300"
>
  💾 저장
</button>
```

### 🕓 3초 동안 유지되는 툴팁

```html
<button tooltip="정보 전송됨" tooltip-duration="3000">📤 전송</button>
```

### 🎨 배경과 글자색 커스터마이징

```html
<button tooltip="위험한 작업입니다" tooltip-bg="crimson" tooltip-color="#fff">
  ⚠️ 위험
</button>
```

### 🖱️ Hover로 툴팁 띄우기

```html
<button tooltip="툴팁입니다" tooltip-hover="true">🖱️ Hover</button>
```

### 🔁 사라질 때 콜백 함수 실행

```html
<button tooltip="삭제됩니다" tooltip-on-hide="onTooltipGone">🗑️ 삭제</button>

<script>
  function onTooltipGone(el) {
    console.log("툴팁 사라짐!", el);
  }
</script>
```

---

## ✅ 4. 기타 정보

- 툴팁은 여러 개 동시에 표시 가능합니다.
- 화면 밖으로 넘어가지 않도록 자동으로 위치가 보정됩니다.
- `enableTooltips()` 함수를 호출하면 자동으로 활성화됩니다.

---

필요한 기능은 이 외에도 계속 확장 가능합니다!
