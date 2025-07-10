# ToggleSwitch 컴포넌트

토글 스위치 컴포넌트입니다. ON/OFF 상태를 전환할 수 있는 인터랙티브한 UI 요소를 제공합니다.

## 기본 사용법

```javascript
// 기본 토글 스위치 생성
const toggle = new ToggleSwitch();

// DOM에 추가
toggle.appendTo(document.body);
```

## 옵션 설정

```javascript
const toggle = new ToggleSwitch({
  checked: true,                    // 초기 상태 (기본값: false)
  disabled: false,                  // 비활성화 여부 (기본값: false)
  size: 'medium',                   // 크기: 'small', 'medium', 'large' (기본값: 'medium')
  showLabels: true,                 // 라벨 표시 여부 (기본값: true)
  labels: {                         // 라벨 텍스트
    on: 'ON',
    off: 'OFF'
  },
  theme: {                          // 테마 설정
    primary: '#00BCD4',             // 활성화 색상
    primaryHover: '#0097A7',        // 호버 색상
    background: '#E0E0E0',          // 비활성화 배경색
    disabled: '#F5F5F5',            // 비활성화 색상
    text: '#333333'                 // 텍스트 색상
  },
  onChange: (checked) => {          // 상태 변경 콜백
    console.log('Toggle state:', checked);
  }
});
```

## 크기 옵션

- `small`: 40px × 20px
- `medium`: 50px × 25px (기본값)
- `large`: 60px × 30px

## 메서드

### `setChecked(checked)`
토글 상태를 설정합니다.

```javascript
toggle.setChecked(true);   // ON으로 설정
toggle.setChecked(false);  // OFF로 설정
```

### `getChecked()`
현재 토글 상태를 반환합니다.

```javascript
const isChecked = toggle.getChecked();
console.log(isChecked); // true 또는 false
```

### `setDisabled(disabled)`
토글을 비활성화/활성화합니다.

```javascript
toggle.setDisabled(true);   // 비활성화
toggle.setDisabled(false);  // 활성화
```

### `appendTo(parent)`
지정된 부모 요소에 토글을 추가합니다.

```javascript
toggle.appendTo('#container');           // CSS 선택자
toggle.appendTo(document.body);          // DOM 요소
```

### `remove()`
토글을 DOM에서 제거합니다.

```javascript
toggle.remove();
```

### `getElement()`
토글의 DOM 요소를 반환합니다.

```javascript
const element = toggle.getElement();
```

## 사용 예제

### 기본 토글 스위치
```javascript
const toggle = new ToggleSwitch({
  onChange: (checked) => {
    console.log('Toggle is now:', checked ? 'ON' : 'OFF');
  }
});
toggle.appendTo(document.body);
```

### 커스텀 라벨
```javascript
const toggle = new ToggleSwitch({
  labels: {
    on: '활성화',
    off: '비활성화'
  },
  onChange: (checked) => {
    if (checked) {
      console.log('기능이 활성화되었습니다.');
    } else {
      console.log('기능이 비활성화되었습니다.');
    }
  }
});
toggle.appendTo(document.body);
```

### 다양한 크기
```javascript
// 작은 크기
const smallToggle = new ToggleSwitch({ size: 'small' });
smallToggle.appendTo('#small-container');

// 큰 크기
const largeToggle = new ToggleSwitch({ size: 'large' });
largeToggle.appendTo('#large-container');
```

### 커스텀 테마
```javascript
const toggle = new ToggleSwitch({
  theme: {
    primary: '#FF6B6B',        // 빨간색
    primaryHover: '#FF5252',
    background: '#E8E8E8',
    text: '#2C3E50'
  }
});
toggle.appendTo(document.body);
```

### 비활성화 상태
```javascript
const toggle = new ToggleSwitch({
  disabled: true,
  checked: true
});
toggle.appendTo(document.body);
```

## 접근성

- 키보드 접근성 지원 (Enter, Space 키)
- ARIA 속성 자동 설정 (`role="switch"`, `aria-checked`)
- 포커스 가능한 요소 (`tabindex="0"`)

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 클래스 문법 사용
- CSS3 트랜지션 및 애니메이션 활용 