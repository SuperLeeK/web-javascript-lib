# useTheme 함수

테마 색상 팔레트를 자동으로 생성하는 함수입니다. 기본 색상을 입력하면 50부터 900까지의 색상 팔레트를 자동으로 생성합니다.

## 기본 사용법

```javascript
// 기본 테마 생성
const theme = useTheme();

// 커스텀 색상으로 테마 생성
const theme = useTheme({
  primary: '#0097A7'
});
```

## 색상 팔레트 자동 생성

`useTheme` 함수는 입력된 색상을 기반으로 HSL 색상 공간에서 밝기와 채도를 조정하여 10단계의 색상 팔레트를 생성합니다.

### 생성되는 색상 단계
- `50`: 매우 밝음 (95% 밝기, 30% 채도)
- `100`: 밝음 (90% 밝기, 50% 채도)
- `200`: 연함 (80% 밝기, 70% 채도)
- `300`: 약간 연함 (70% 밝기, 85% 채도)
- `400`: 기본보다 연함 (60% 밝기, 95% 채도)
- `500`: 기본 색상 (50% 밝기, 100% 채도)
- `600`: 기본보다 진함 (40% 밝기, 105% 채도)
- `700`: 진함 (30% 밝기, 110% 채도)
- `800`: 매우 진함 (20% 밝기, 115% 채도)
- `900`: 가장 진함 (10% 밝기, 120% 채도)

## 사용 예제

### 기본 사용법
```javascript
// 기본 테마 생성 (모든 기본 색상 포함)
const theme = useTheme();
console.log(theme.primary['500']); // '#00BCD4'
console.log(theme.primary['400']); // '#26C6DA'
console.log(theme.primary['600']); // '#00ACC1'
```

### 단일 색상 설정
```javascript
const theme = useTheme({
  primary: '#0097A7'
});

// primary 색상의 모든 단계가 자동 생성됨
console.log(theme.primary['50']);   // '#E0F7FA'
console.log(theme.primary['100']);  // '#B2EBF2'
console.log(theme.primary['200']);  // '#80DEEA'
console.log(theme.primary['300']);  // '#4DD0E1'
console.log(theme.primary['400']);  // '#26C6DA'
console.log(theme.primary['500']);  // '#00BCD4'
console.log(theme.primary['600']);  // '#00ACC1'
console.log(theme.primary['700']);  // '#0097A7'
console.log(theme.primary['800']);  // '#00838F'
console.log(theme.primary['900']);  // '#006064'
```

### 특정 단계 색상 설정
```javascript
const theme = useTheme({
  primary: {
    400: '#0097A7'  // 400 단계 색상을 기준으로 팔레트 생성
  }
});

// 400 단계 색상을 기반으로 모든 단계가 생성됨
console.log(theme.primary['400']); // '#0097A7' (입력한 색상)
console.log(theme.primary['500']); // '#00838F' (자동 생성)
console.log(theme.primary['300']); // '#26C6DA' (자동 생성)
```

### 여러 색상 설정
```javascript
const theme = useTheme({
  primary: '#0097A7',
  secondary: '#6C757D',
  success: '#28A745',
  danger: '#DC3545'
});

// 모든 색상의 팔레트가 생성됨
console.log(theme.primary['500']);   // '#00BCD4'
console.log(theme.secondary['500']); // '#6C757D'
console.log(theme.success['500']);   // '#28A745'
console.log(theme.danger['500']);    // '#DC3545'
```

### 혼합 설정
```javascript
const theme = useTheme({
  primary: '#0097A7',
  custom: {
    400: '#FF6B6B'  // 특정 단계 설정
  }
});

console.log(theme.primary['500']); // '#00BCD4'
console.log(theme.custom['400']);  // '#FF6B6B'
console.log(theme.custom['500']);  // '#FF5252' (자동 생성)
```

## 기본 색상들

설정하지 않으면 다음 기본 색상들이 자동으로 포함됩니다:

- `primary`: '#00BCD4' (청록색)
- `secondary`: '#6C757D' (회색)
- `success`: '#28A745' (초록색)
- `danger`: '#DC3545' (빨간색)
- `warning`: '#FFC107' (노란색)
- `info`: '#17A2B8' (파란색)
- `light`: '#F8F9FA' (연한 회색)
- `dark`: '#343A40' (어두운 회색)

## 유틸리티 색상들

테마에는 다음과 같은 유틸리티 색상들도 포함됩니다:

### 그레이스케일
```javascript
theme.gray['50']   // '#F9FAFB'
theme.gray['100']  // '#F3F4F6'
theme.gray['200']  // '#E5E7EB'
theme.gray['300']  // '#D1D5DB'
theme.gray['400']  // '#9CA3AF'
theme.gray['500']  // '#6B7280'
theme.gray['600']  // '#4B5563'
theme.gray['700']  // '#374151'
theme.gray['800']  // '#1F2937'
theme.gray['900']  // '#111827'
```

### 기본 색상
```javascript
theme.white     // '#FFFFFF'
theme.black     // '#000000'
theme.transparent // 'transparent'
```

### 오버레이
```javascript
theme.overlay      // 'rgba(0, 0, 0, 0.5)'
theme.overlayLight // 'rgba(0, 0, 0, 0.1)'
theme.overlayDark  // 'rgba(0, 0, 0, 0.8)'
```

### 그림자
```javascript
theme.shadow      // 'rgba(0, 0, 0, 0.1)'
theme.shadowLight // 'rgba(0, 0, 0, 0.05)'
theme.shadowDark  // 'rgba(0, 0, 0, 0.2)'
```

### 테두리
```javascript
theme.border      // '#E5E7EB'
theme.borderLight // '#F3F4F6'
theme.borderDark  // '#D1D5DB'
```

### 배경
```javascript
theme.background         // '#FFFFFF'
theme.backgroundSecondary // '#F9FAFB'
theme.backgroundTertiary  // '#F3F4F6'
```

### 텍스트
```javascript
theme.text         // '#111827'
theme.textSecondary // '#6B7280'
theme.textTertiary  // '#9CA3AF'
theme.textInverse   // '#FFFFFF'
```

### 상태 색상
```javascript
theme.disabled     // '#F3F4F6'
theme.disabledText // '#9CA3AF'
theme.error        // '#DC3545'
theme.warning      // '#FFC107'
theme.success      // '#28A745'
theme.info         // '#17A2B8'
```

## 실제 사용 예제

### 컴포넌트에서 사용
```javascript
const theme = useTheme({
  primary: '#0097A7',
  secondary: '#6C757D'
});

// CSS 변수로 설정
const root = document.documentElement;
Object.keys(theme).forEach(key => {
  root.style.setProperty(`--${key}`, theme[key]);
});

// 컴포넌트에서 사용
const button = new Button({
  theme: {
    primary: theme.primary['500'],
    primaryHover: theme.primary['600'],
    background: theme.background,
    text: theme.text
  }
});
```

### CSS-in-JS에서 사용
```javascript
const theme = useTheme({
  brand: '#FF6B6B'
});

const styles = {
  button: {
    backgroundColor: theme.brand['500'],
    color: theme.white,
    border: `1px solid ${theme.brand['600']}`,
    '&:hover': {
      backgroundColor: theme.brand['600']
    }
  }
};
```

### Tailwind CSS와 함께 사용
```javascript
const theme = useTheme({
  primary: '#0097A7'
});

// Tailwind 설정에 추가
const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: theme.primary['50'],
          100: theme.primary['100'],
          200: theme.primary['200'],
          300: theme.primary['300'],
          400: theme.primary['400'],
          500: theme.primary['500'],
          600: theme.primary['600'],
          700: theme.primary['700'],
          800: theme.primary['800'],
          900: theme.primary['900']
        }
      }
    }
  }
};
```

### 동적 테마 변경
```javascript
let currentTheme = useTheme({
  primary: '#0097A7'
});

function changeTheme(newPrimaryColor) {
  currentTheme = useTheme({
    primary: newPrimaryColor
  });
  
  // CSS 변수 업데이트
  const root = document.documentElement;
  Object.keys(currentTheme).forEach(key => {
    root.style.setProperty(`--${key}`, currentTheme[key]);
  });
}

// 테마 변경
changeTheme('#FF6B6B');
```

## 색상 변환 알고리즘

`useTheme` 함수는 다음과 같은 알고리즘을 사용합니다:

1. **HEX → HSL 변환**: 입력된 HEX 색상을 HSL 색상 공간으로 변환
2. **밝기 조정**: 각 단계별로 밝기(L)를 조정 (50: 95% → 900: 10%)
3. **채도 조정**: 각 단계별로 채도(S)를 조정 (50: 30% → 900: 120%)
4. **HSL → HEX 변환**: 조정된 HSL 값을 다시 HEX로 변환

이 방식으로 자연스럽고 일관된 색상 팔레트를 생성합니다.

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 문법 사용
- CSS 변수와 호환
- 다양한 모듈 시스템 지원 (CommonJS, ES6, 전역)

## 모듈 시스템 지원

### ES6 모듈
```javascript
import { useTheme } from './libs/useTheme.js';
const theme = useTheme({ primary: '#0097A7' });
```

### CommonJS
```javascript
const { useTheme } = require('./libs/useTheme.js');
const theme = useTheme({ primary: '#0097A7' });
```

### 브라우저 (전역)
```javascript
// useTheme.js를 스크립트로 로드한 후
const theme = window.useTheme({ primary: '#0097A7' });
``` 