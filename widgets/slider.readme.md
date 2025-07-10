# Slider 컴포넌트

슬라이더 컴포넌트입니다. 단일 값 선택과 범위 선택을 지원하며, 수평/수직 방향을 모두 지원합니다.

## 기본 사용법

```javascript
// 기본 슬라이더 생성
const slider = new Slider({
  min: 0,
  max: 100,
  value: 50,
  onChange: (value) => {
    console.log('선택된 값:', value);
  }
});

// DOM에 추가
slider.appendTo(document.body);
```

## 옵션 설정

```javascript
const slider = new Slider({
  id: 'my-slider',                    // 고유 ID
  min: 0,                            // 최소값
  max: 100,                          // 최대값
  value: 50,                         // 초기값 (단일 슬라이더)
  step: 1,                           // 단계값
  range: false,                      // 범위 선택 여부 (기본값: false)
  rangeValues: [25, 75],             // 범위 선택시 초기값
  disabled: false,                   // 비활성화 여부
  showValue: true,                   // 값 표시 여부
  showTooltip: true,                 // 툴팁 표시 여부
  orientation: 'horizontal',         // 방향: 'horizontal', 'vertical'
  size: 'medium',                    // 크기: 'small', 'medium', 'large'
  theme: {                           // 테마 설정
    primary: '#00BCD4',
    primaryHover: '#0097A7',
    background: '#E9ECEF',
    track: '#DEE2E6',
    thumb: '#FFFFFF',
    text: '#333333',
    disabled: '#F5F5F5',
    disabledText: '#999999'
  },
  onChange: (value, event) => {      // 값 변경 완료 콜백
    console.log('최종 값:', value);
  },
  onInput: (value, event) => {       // 값 변경 중 콜백
    console.log('변경 중:', value);
  },
  onFocus: (event) => {              // 포커스 이벤트
    console.log('포커스됨');
  },
  onBlur: (event) => {               // 블러 이벤트
    console.log('블러됨');
  }
});
```

## 단일 값 슬라이더

```javascript
const singleSlider = new Slider({
  min: 0,
  max: 100,
  value: 50,
  step: 5,
  onChange: (value) => {
    console.log('선택된 값:', value);
  }
});
```

## 범위 슬라이더

```javascript
const rangeSlider = new Slider({
  min: 0,
  max: 1000,
  range: true,
  rangeValues: [200, 800],
  step: 10,
  onChange: (values) => {
    console.log('선택된 범위:', values); // [200, 800]
  }
});
```

## 수직 슬라이더

```javascript
const verticalSlider = new Slider({
  min: 0,
  max: 100,
  value: 50,
  orientation: 'vertical',
  onChange: (value) => {
    console.log('수직 슬라이더 값:', value);
  }
});
```

## 크기 옵션

- `small`: 작은 크기 (트랙 높이: 4px, 썸 크기: 16px)
- `medium`: 중간 크기 (트랙 높이: 6px, 썸 크기: 20px, 기본값)
- `large`: 큰 크기 (트랙 높이: 8px, 썸 크기: 24px)

## 메서드

### `setValue(value)`
슬라이더 값을 설정합니다.

```javascript
// 단일 슬라이더
slider.setValue(75);

// 범위 슬라이더
slider.setValue([300, 700]);
```

### `getValue()`
현재 슬라이더 값을 반환합니다.

```javascript
const value = slider.getValue();
console.log(value); // 단일 슬라이더: 숫자, 범위 슬라이더: 배열
```

### `setDisabled(disabled)`
슬라이더를 비활성화/활성화합니다.

```javascript
slider.setDisabled(true);   // 비활성화
slider.setDisabled(false);  // 활성화
```

### `setMin(min)`
최소값을 설정합니다.

```javascript
slider.setMin(10);
```

### `setMax(max)`
최대값을 설정합니다.

```javascript
slider.setMax(200);
```

### `setStep(step)`
단계값을 설정합니다.

```javascript
slider.setStep(5);
```

### `appendTo(parent)`
지정된 부모 요소에 슬라이더를 추가합니다.

```javascript
slider.appendTo('#container');           // CSS 선택자
slider.appendTo(document.body);          // DOM 요소
```

### `remove()`
슬라이더를 DOM에서 제거합니다.

```javascript
slider.remove();
```

### `getElement()`
슬라이더의 DOM 요소를 반환합니다.

```javascript
const element = slider.getElement();
```

## 사용 예제

### 기본 슬라이더
```javascript
const volumeSlider = new Slider({
  min: 0,
  max: 100,
  value: 50,
  onChange: (value) => {
    console.log('볼륨:', value);
  }
});
volumeSlider.appendTo(document.body);
```

### 범위 슬라이더 (가격 범위)
```javascript
const priceSlider = new Slider({
  min: 0,
  max: 10000,
  range: true,
  rangeValues: [1000, 5000],
  step: 100,
  onChange: (values) => {
    console.log(`가격 범위: ${values[0]}원 ~ ${values[1]}원`);
  }
});
priceSlider.appendTo(document.body);
```

### 수직 슬라이더
```javascript
const heightSlider = new Slider({
  min: 0,
  max: 200,
  value: 170,
  orientation: 'vertical',
  onChange: (value) => {
    console.log('키:', value + 'cm');
  }
});
heightSlider.appendTo(document.body);
```

### 비활성화 상태
```javascript
const disabledSlider = new Slider({
  min: 0,
  max: 100,
  value: 50,
  disabled: true
});
disabledSlider.appendTo(document.body);
```

### 다양한 크기
```javascript
const smallSlider = new Slider({ min: 0, max: 100, value: 50, size: 'small' });
const mediumSlider = new Slider({ min: 0, max: 100, value: 50, size: 'medium' });
const largeSlider = new Slider({ min: 0, max: 100, value: 50, size: 'large' });

smallSlider.appendTo('#small-container');
mediumSlider.appendTo('#medium-container');
largeSlider.appendTo('#large-container');
```

### 커스텀 테마
```javascript
const customSlider = new Slider({
  min: 0,
  max: 100,
  value: 50,
  theme: {
    primary: '#FF6B6B',        // 빨간색
    primaryHover: '#FF5252',
    background: '#F8F9FA',
    track: '#E9ECEF',
    thumb: '#FFFFFF',
    text: '#2C3E50'
  }
});
customSlider.appendTo(document.body);
```

### 실시간 값 표시
```javascript
const realtimeSlider = new Slider({
  min: 0,
  max: 100,
  value: 0,
  showValue: true,
  onInput: (value) => {
    console.log('실시간 값:', value);
  },
  onChange: (value) => {
    console.log('최종 값:', value);
  }
});
realtimeSlider.appendTo(document.body);
```

### 단계별 슬라이더
```javascript
const stepSlider = new Slider({
  min: 0,
  max: 10,
  value: 5,
  step: 1,
  onChange: (value) => {
    console.log('단계:', value);
  }
});
stepSlider.appendTo(document.body);
```

## 접근성

- 키보드 접근성 지원 (화살표 키, Page Up/Down)
- ARIA 속성 자동 설정 (`role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`)
- 포커스 가능한 요소 (`tabindex="0"`)
- 스크린 리더 지원

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 클래스 문법 사용
- CSS3 트랜지션 및 애니메이션 활용
- CSS 변수 사용 (--thumb-size)
- Flexbox 레이아웃 사용 