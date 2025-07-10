# Button 컴포넌트

다양한 스타일과 옵션을 지원하는 재사용 가능한 버튼 컴포넌트입니다.

## 기본 사용법

```javascript
// 기본 버튼 생성
const button = new Button({
  text: '클릭하세요',
  onClick: () => {
    console.log('버튼이 클릭되었습니다!');
  }
});

// DOM에 추가
button.appendTo(document.body);
```

## 옵션 설정

```javascript
const button = new Button({
  id: 'my-button',                    // 고유 ID
  text: '제출',                       // 버튼 텍스트
  type: 'submit',                     // 버튼 타입: 'button', 'submit', 'reset'
  variant: 'primary',                 // 스타일 변형
  size: 'medium',                     // 크기: 'small', 'medium', 'large'
  disabled: false,                    // 비활성화 여부
  loading: false,                     // 로딩 상태
  icon: '✓',                         // 아이콘 (텍스트 또는 HTML)
  iconPosition: 'left',               // 아이콘 위치: 'left', 'right'
  fullWidth: false,                   // 전체 너비 사용
  rounded: false,                     // 둥근 모서리
  theme: {                            // 커스텀 테마
    primary: '#00BCD4',
    // ... 기타 색상
  },
  onClick: (e) => {                   // 클릭 이벤트
    console.log('클릭됨');
  },
  onMouseEnter: (e) => {              // 마우스 진입 이벤트
    console.log('마우스 진입');
  },
  onMouseLeave: (e) => {              // 마우스 이탈 이벤트
    console.log('마우스 이탈');
  }
});
```

## 변형 (Variants)

### 기본 변형
- `primary` - 기본 파란색 버튼
- `secondary` - 회색 버튼
- `success` - 초록색 버튼
- `danger` - 빨간색 버튼
- `warning` - 노란색 버튼
- `info` - 하늘색 버튼
- `light` - 밝은 회색 버튼
- `dark` - 어두운 회색 버튼

### 아웃라인 변형
- `outline-primary` - 파란색 아웃라인
- `outline-secondary` - 회색 아웃라인
- `outline-success` - 초록색 아웃라인
- `outline-danger` - 빨간색 아웃라인
- `outline-warning` - 노란색 아웃라인
- `outline-info` - 하늘색 아웃라인
- `outline-light` - 밝은 회색 아웃라인
- `outline-dark` - 어두운 회색 아웃라인

## 크기 옵션

- `small`: 작은 크기 (6px 12px 패딩)
- `medium`: 중간 크기 (8px 16px 패딩, 기본값)
- `large`: 큰 크기 (12px 24px 패딩)

## 메서드

### `setText(text)`
버튼 텍스트를 변경합니다.

```javascript
button.setText('새로운 텍스트');
```

### `setIcon(icon, position)`
아이콘을 설정합니다.

```javascript
button.setIcon('★', 'left');    // 왼쪽에 별 아이콘
button.setIcon('→', 'right');   // 오른쪽에 화살표 아이콘
button.setIcon('<svg>...</svg>', 'left'); // HTML 아이콘
```

### `setLoading(loading)`
로딩 상태를 설정합니다.

```javascript
button.setLoading(true);   // 로딩 스피너 표시
button.setLoading(false);  // 로딩 스피너 숨김
```

### `setDisabled(disabled)`
버튼을 비활성화/활성화합니다.

```javascript
button.setDisabled(true);   // 비활성화
button.setDisabled(false);  // 활성화
```

### `setVariant(variant)`
버튼 스타일을 변경합니다.

```javascript
button.setVariant('success');        // 성공 스타일
button.setVariant('outline-danger'); // 빨간색 아웃라인
```

### `setSize(size)`
버튼 크기를 변경합니다.

```javascript
button.setSize('large');  // 큰 크기
button.setSize('small');  // 작은 크기
```

### `appendTo(parent)`
지정된 부모 요소에 버튼을 추가합니다.

```javascript
button.appendTo('#container');           // CSS 선택자
button.appendTo(document.body);          // DOM 요소
```

### `remove()`
버튼을 DOM에서 제거합니다.

```javascript
button.remove();
```

### `getElement()`
버튼의 DOM 요소를 반환합니다.

```javascript
const element = button.getElement();
```

## 사용 예제

### 기본 버튼들
```javascript
// 기본 버튼
const primaryBtn = new Button({
  text: '기본 버튼',
  variant: 'primary',
  onClick: () => console.log('기본 버튼 클릭')
});

// 성공 버튼
const successBtn = new Button({
  text: '성공',
  variant: 'success',
  onClick: () => console.log('성공!')
});

// 위험 버튼
const dangerBtn = new Button({
  text: '삭제',
  variant: 'danger',
  onClick: () => console.log('삭제됨')
});

// 컨테이너에 추가
const container = document.getElementById('button-container');
primaryBtn.appendTo(container);
successBtn.appendTo(container);
dangerBtn.appendTo(container);
```

### 아이콘이 있는 버튼
```javascript
// 왼쪽 아이콘
const saveBtn = new Button({
  text: '저장',
  icon: '💾',
  iconPosition: 'left',
  variant: 'success',
  onClick: () => console.log('저장됨')
});

// 오른쪽 아이콘
const nextBtn = new Button({
  text: '다음',
  icon: '→',
  iconPosition: 'right',
  variant: 'primary',
  onClick: () => console.log('다음으로')
});
```

### 로딩 상태 버튼
```javascript
const submitBtn = new Button({
  text: '제출',
  variant: 'primary',
  onClick: async () => {
    submitBtn.setLoading(true);
    submitBtn.setText('처리 중...');
    
    try {
      await someAsyncOperation();
      submitBtn.setText('완료!');
      submitBtn.setVariant('success');
    } catch (error) {
      submitBtn.setText('오류 발생');
      submitBtn.setVariant('danger');
    } finally {
      submitBtn.setLoading(false);
    }
  }
});
```

### 아웃라인 버튼
```javascript
const outlineBtn = new Button({
  text: '아웃라인 버튼',
  variant: 'outline-primary',
  onClick: () => console.log('아웃라인 버튼 클릭')
});
```

### 전체 너비 버튼
```javascript
const fullWidthBtn = new Button({
  text: '전체 너비 버튼',
  fullWidth: true,
  variant: 'dark',
  onClick: () => console.log('전체 너비 버튼 클릭')
});
```

### 둥근 모서리 버튼
```javascript
const roundedBtn = new Button({
  text: '둥근 버튼',
  rounded: true,
  variant: 'info',
  onClick: () => console.log('둥근 버튼 클릭')
});
```

### 다양한 크기
```javascript
const smallBtn = new Button({ text: '작은 버튼', size: 'small' });
const mediumBtn = new Button({ text: '중간 버튼', size: 'medium' });
const largeBtn = new Button({ text: '큰 버튼', size: 'large' });
```

### 커스텀 테마
```javascript
const customBtn = new Button({
  text: '커스텀 버튼',
  theme: {
    primary: '#FF6B6B',        // 빨간색
    primaryHover: '#FF5252',
    secondary: '#4ECDC4',      // 청록색
    secondaryHover: '#45B7AA'
  },
  variant: 'primary'
});
```

## 접근성

- 키보드 접근성 지원 (Enter, Space 키)
- 적절한 ARIA 속성
- 포커스 가능한 요소
- 시각적 피드백 (호버, 포커스 상태)

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 클래스 문법 사용
- CSS3 트랜지션 및 애니메이션 활용
- Flexbox 레이아웃 사용 