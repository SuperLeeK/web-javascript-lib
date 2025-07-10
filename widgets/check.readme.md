# Check 컴포넌트

체크박스 컴포넌트입니다. 기본 체크박스와 스위치 스타일을 지원하며, 다양한 옵션을 제공합니다.

## 기본 사용법

```javascript
// 기본 체크박스 생성
const check = new Check({
  label: '동의합니다',
  onChange: (checked) => {
    console.log('체크 상태:', checked);
  }
});

// DOM에 추가
check.appendTo(document.body);
```

## 옵션 설정

```javascript
const check = new Check({
  id: 'my-check',                    // 고유 ID
  label: '체크박스 라벨',             // 라벨 텍스트
  checked: false,                    // 초기 상태 (기본값: false)
  disabled: false,                   // 비활성화 여부 (기본값: false)
  indeterminate: false,              // 중간 상태 (기본값: false)
  size: 'medium',                    // 크기: 'small', 'medium', 'large'
  variant: 'default',                // 스타일: 'default', 'switch'
  theme: {                           // 테마 설정
    primary: '#00BCD4',
    primaryHover: '#0097A7',
    background: '#FFFFFF',
    border: '#DEE2E6',
    text: '#333333',
    disabled: '#F5F5F5',
    disabledText: '#999999'
  },
  onChange: (checked, event) => {    // 상태 변경 콜백
    console.log('체크 상태:', checked);
  },
  onFocus: (event) => {              // 포커스 이벤트
    console.log('포커스됨');
  },
  onBlur: (event) => {               // 블러 이벤트
    console.log('블러됨');
  }
});
```

## 변형 (Variants)

### 기본 체크박스
```javascript
const check = new Check({
  label: '기본 체크박스',
  variant: 'default'
});
```

### 스위치 스타일
```javascript
const check = new Check({
  label: '스위치 스타일',
  variant: 'switch'
});
```

## 크기 옵션

- `small`: 작은 크기 (14px)
- `medium`: 중간 크기 (16px, 기본값)
- `large`: 큰 크기 (20px)

## 메서드

### `setChecked(checked)`
체크박스 상태를 설정합니다.

```javascript
check.setChecked(true);   // 체크
check.setChecked(false);  // 체크 해제
```

### `getChecked()`
현재 체크박스 상태를 반환합니다.

```javascript
const isChecked = check.getChecked();
console.log(isChecked); // true 또는 false
```

### `setDisabled(disabled)`
체크박스를 비활성화/활성화합니다.

```javascript
check.setDisabled(true);   // 비활성화
check.setDisabled(false);  // 활성화
```

### `setIndeterminate(indeterminate)`
중간 상태를 설정합니다.

```javascript
check.setIndeterminate(true);   // 중간 상태 (일부 선택)
check.setIndeterminate(false);  // 일반 상태
```

### `setLabel(label)`
라벨 텍스트를 변경합니다.

```javascript
check.setLabel('새로운 라벨');
```

### `appendTo(parent)`
지정된 부모 요소에 체크박스를 추가합니다.

```javascript
check.appendTo('#container');           // CSS 선택자
check.appendTo(document.body);          // DOM 요소
```

### `remove()`
체크박스를 DOM에서 제거합니다.

```javascript
check.remove();
```

### `getElement()`
체크박스의 DOM 요소를 반환합니다.

```javascript
const element = check.getElement();
```

## 사용 예제

### 기본 체크박스
```javascript
const check = new Check({
  label: '이용약관에 동의합니다',
  onChange: (checked) => {
    if (checked) {
      console.log('이용약관에 동의했습니다.');
    } else {
      console.log('이용약관 동의를 취소했습니다.');
    }
  }
});
check.appendTo(document.body);
```

### 스위치 스타일
```javascript
const switchCheck = new Check({
  label: '알림 받기',
  variant: 'switch',
  checked: true,
  onChange: (checked) => {
    console.log('알림 설정:', checked ? '켜짐' : '꺼짐');
  }
});
switchCheck.appendTo(document.body);
```

### 중간 상태 (indeterminate)
```javascript
const indeterminateCheck = new Check({
  label: '전체 선택',
  indeterminate: true,
  onChange: (checked) => {
    if (checked) {
      console.log('모든 항목 선택');
    } else {
      console.log('모든 항목 선택 해제');
    }
  }
});
indeterminateCheck.appendTo(document.body);
```

### 비활성화 상태
```javascript
const disabledCheck = new Check({
  label: '비활성화된 체크박스',
  disabled: true,
  checked: true
});
disabledCheck.appendTo(document.body);
```

### 다양한 크기
```javascript
const smallCheck = new Check({ label: '작은 체크박스', size: 'small' });
const mediumCheck = new Check({ label: '중간 체크박스', size: 'medium' });
const largeCheck = new Check({ label: '큰 체크박스', size: 'large' });

smallCheck.appendTo('#small-container');
mediumCheck.appendTo('#medium-container');
largeCheck.appendTo('#large-container');
```

### 커스텀 테마
```javascript
const customCheck = new Check({
  label: '커스텀 테마',
  theme: {
    primary: '#FF6B6B',        // 빨간색
    primaryHover: '#FF5252',
    background: '#FFFFFF',
    border: '#E8E8E8',
    text: '#2C3E50'
  }
});
customCheck.appendTo(document.body);
```

## 접근성

- 키보드 접근성 지원 (Enter, Space 키)
- ARIA 속성 자동 설정 (`role="checkbox"`, `aria-checked`)
- 포커스 가능한 요소 (`tabindex="0"`)
- 라벨과 체크박스 연결 (`htmlFor` 속성)

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 클래스 문법 사용
- CSS3 트랜지션 및 애니메이션 활용
- Flexbox 레이아웃 사용 