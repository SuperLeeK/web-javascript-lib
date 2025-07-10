# Spinner 컴포넌트

로딩 스피너 컴포넌트입니다. 다양한 애니메이션 타입을 지원하며, 오버레이 모드와 텍스트 표시 기능을 제공합니다.

## 기본 사용법

```javascript
// 기본 스피너 생성
const spinner = new Spinner({
  text: '로딩 중...',
  show: () => {
    spinner.show();
  }
});

// DOM에 추가
spinner.appendTo(document.body);
```

## 옵션 설정

```javascript
const spinner = new Spinner({
  id: 'my-spinner',                   // 고유 ID
  type: 'spinner',                    // 타입: 'spinner', 'dots', 'bars', 'pulse', 'ripple'
  size: 'medium',                     // 크기: 'small', 'medium', 'large'
  color: '#00BCD4',                   // 스피너 색상
  text: '로딩 중...',                 // 표시할 텍스트
  textColor: '#333333',               // 텍스트 색상
  overlay: false,                     // 전체 화면 오버레이 여부
  theme: {                            // 테마 설정
    primary: '#00BCD4',
    background: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    text: '#333333'
  }
});
```

## 스피너 타입

### 기본 스피너 (spinner)
```javascript
const spinner = new Spinner({
  type: 'spinner',
  text: '로딩 중...'
});
```

### 점 애니메이션 (dots)
```javascript
const dotsSpinner = new Spinner({
  type: 'dots',
  text: '처리 중...'
});
```

### 바 애니메이션 (bars)
```javascript
const barsSpinner = new Spinner({
  type: 'bars',
  text: '업로드 중...'
});
```

### 펄스 애니메이션 (pulse)
```javascript
const pulseSpinner = new Spinner({
  type: 'pulse',
  text: '저장 중...'
});
```

### 리플 애니메이션 (ripple)
```javascript
const rippleSpinner = new Spinner({
  type: 'ripple',
  text: '연결 중...'
});
```

## 크기 옵션

- `small`: 작은 크기 (스피너: 20px, 텍스트: 12px)
- `medium`: 중간 크기 (스피너: 32px, 텍스트: 14px, 기본값)
- `large`: 큰 크기 (스피너: 48px, 텍스트: 16px)

## 메서드

### `show()`
스피너를 표시합니다.

```javascript
spinner.show();
```

### `hide()`
스피너를 숨깁니다.

```javascript
spinner.hide();
```

### `isShown()`
스피너가 표시되고 있는지 확인합니다.

```javascript
const isVisible = spinner.isShown();
console.log(isVisible); // true 또는 false
```

### `setText(text)`
스피너 텍스트를 변경합니다.

```javascript
spinner.setText('새로운 텍스트');
```

### `setColor(color)`
스피너 색상을 변경합니다.

```javascript
spinner.setColor('#FF6B6B');
```

### `setSize(size)`
스피너 크기를 변경합니다.

```javascript
spinner.setSize('large');
```

### `setType(type)`
스피너 타입을 변경합니다.

```javascript
spinner.setType('dots');
```

### `appendTo(parent)`
지정된 부모 요소에 스피너를 추가합니다.

```javascript
spinner.appendTo('#container');           // CSS 선택자
spinner.appendTo(document.body);          // DOM 요소
```

### `remove()`
스피너를 DOM에서 제거합니다.

```javascript
spinner.remove();
```

### `getElement()`
스피너의 DOM 요소를 반환합니다.

```javascript
const element = spinner.getElement();
```

## 사용 예제

### 기본 스피너
```javascript
const spinner = new Spinner({
  text: '페이지 로딩 중...'
});

spinner.appendTo(document.body);
spinner.show();

// 3초 후 숨기기
setTimeout(() => {
  spinner.hide();
}, 3000);
```

### 오버레이 스피너
```javascript
const overlaySpinner = new Spinner({
  text: '데이터 처리 중...',
  overlay: true,
  type: 'dots'
});

// 전체 화면에 표시
overlaySpinner.show();

// 작업 완료 후 숨기기
setTimeout(() => {
  overlaySpinner.hide();
}, 5000);
```

### 다양한 타입의 스피너
```javascript
const spinners = [
  new Spinner({ type: 'spinner', text: '기본 스피너' }),
  new Spinner({ type: 'dots', text: '점 애니메이션' }),
  new Spinner({ type: 'bars', text: '바 애니메이션' }),
  new Spinner({ type: 'pulse', text: '펄스 애니메이션' }),
  new Spinner({ type: 'ripple', text: '리플 애니메이션' })
];

spinners.forEach((spinner, index) => {
  spinner.appendTo(`#spinner-${index}`);
  spinner.show();
});
```

### 다양한 크기
```javascript
const smallSpinner = new Spinner({ size: 'small', text: '작은 스피너' });
const mediumSpinner = new Spinner({ size: 'medium', text: '중간 스피너' });
const largeSpinner = new Spinner({ size: 'large', text: '큰 스피너' });

smallSpinner.appendTo('#small-container');
mediumSpinner.appendTo('#medium-container');
largeSpinner.appendTo('#large-container');
```

### 커스텀 색상
```javascript
const customSpinner = new Spinner({
  type: 'pulse',
  color: '#FF6B6B',
  text: '커스텀 색상',
  textColor: '#2C3E50'
});

customSpinner.appendTo(document.body);
customSpinner.show();
```

### 동적 텍스트 변경
```javascript
const dynamicSpinner = new Spinner({
  text: '초기 로딩...'
});

dynamicSpinner.appendTo(document.body);
dynamicSpinner.show();

// 텍스트 동적 변경
setTimeout(() => {
  dynamicSpinner.setText('데이터 처리 중...');
}, 1000);

setTimeout(() => {
  dynamicSpinner.setText('완료!');
}, 2000);

setTimeout(() => {
  dynamicSpinner.hide();
}, 3000);
```

### API 호출과 함께 사용
```javascript
const apiSpinner = new Spinner({
  text: '데이터 가져오는 중...',
  overlay: true
});

async function fetchData() {
  apiSpinner.show();
  
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    apiSpinner.setText('완료!');
    setTimeout(() => {
      apiSpinner.hide();
    }, 1000);
    
    return data;
  } catch (error) {
    apiSpinner.setText('오류 발생!');
    setTimeout(() => {
      apiSpinner.hide();
    }, 2000);
    
    throw error;
  }
}
```

### 타입 동적 변경
```javascript
const changingSpinner = new Spinner({
  type: 'spinner',
  text: '타입 변경 예제'
});

changingSpinner.appendTo(document.body);
changingSpinner.show();

// 타입을 순차적으로 변경
const types = ['spinner', 'dots', 'bars', 'pulse', 'ripple'];
let currentIndex = 0;

setInterval(() => {
  changingSpinner.setType(types[currentIndex]);
  currentIndex = (currentIndex + 1) % types.length;
}, 2000);
```

## 접근성

- 스크린 리더 지원
- 적절한 ARIA 속성
- 키보드 접근성
- 시각적 피드백

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 클래스 문법 사용
- CSS3 애니메이션 활용
- Flexbox 레이아웃 사용 