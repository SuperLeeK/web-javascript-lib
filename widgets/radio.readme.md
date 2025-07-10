# Radio 컴포넌트

라디오 버튼 컴포넌트입니다. 개별 라디오 버튼과 그룹 기능을 지원하며, 단일 선택을 보장합니다.

## 기본 사용법

```javascript
// 개별 라디오 버튼 생성
const radio = new Radio({
  name: 'gender',
  label: '남성',
  value: 'male',
  onChange: (checked, value) => {
    console.log('선택된 값:', value);
  }
});

// DOM에 추가
radio.appendTo(document.body);
```

## 옵션 설정

```javascript
const radio = new Radio({
  id: 'my-radio',                    // 고유 ID
  name: 'radio-group',               // 그룹 이름
  label: '라디오 버튼 라벨',          // 라벨 텍스트
  value: 'option1',                  // 값
  checked: false,                    // 초기 상태 (기본값: false)
  disabled: false,                   // 비활성화 여부 (기본값: false)
  size: 'medium',                    // 크기: 'small', 'medium', 'large'
  theme: {                           // 테마 설정
    primary: '#00BCD4',
    primaryHover: '#0097A7',
    background: '#FFFFFF',
    border: '#DEE2E6',
    text: '#333333',
    disabled: '#F5F5F5',
    disabledText: '#999999'
  },
  onChange: (checked, value, event) => { // 상태 변경 콜백
    console.log('선택 상태:', checked, '값:', value);
  },
  onFocus: (event) => {              // 포커스 이벤트
    console.log('포커스됨');
  },
  onBlur: (event) => {               // 블러 이벤트
    console.log('블러됨');
  }
});
```

## RadioGroup 사용법

여러 라디오 버튼을 그룹으로 관리할 때 사용합니다.

```javascript
const radioGroup = new RadioGroup({
  name: 'gender',
  value: 'male', // 초기 선택값
  radios: [
    { label: '남성', value: 'male' },
    { label: '여성', value: 'female' },
    { label: '기타', value: 'other' }
  ],
  onChange: (value) => {
    console.log('선택된 성별:', value);
  }
});

// 모든 라디오 버튼을 DOM에 추가
radioGroup.appendTo(document.body);
```

## 크기 옵션

- `small`: 작은 크기 (14px)
- `medium`: 중간 크기 (16px, 기본값)
- `large`: 큰 크기 (20px)

## 메서드

### `setChecked(checked)`
라디오 버튼 상태를 설정합니다.

```javascript
radio.setChecked(true);   // 선택
radio.setChecked(false);  // 선택 해제
```

### `getChecked()`
현재 라디오 버튼 상태를 반환합니다.

```javascript
const isChecked = radio.getChecked();
console.log(isChecked); // true 또는 false
```

### `getValue()`
라디오 버튼의 값을 반환합니다.

```javascript
const value = radio.getValue();
console.log(value); // 설정된 값
```

### `setDisabled(disabled)`
라디오 버튼을 비활성화/활성화합니다.

```javascript
radio.setDisabled(true);   // 비활성화
radio.setDisabled(false);  // 활성화
```

### `setLabel(label)`
라벨 텍스트를 변경합니다.

```javascript
radio.setLabel('새로운 라벨');
```

### `setValue(value)`
라디오 버튼의 값을 설정합니다.

```javascript
radio.setValue('new-value');
```

### `setName(name)`
그룹 이름을 설정합니다.

```javascript
radio.setName('new-group');
```

### `appendTo(parent)`
지정된 부모 요소에 라디오 버튼을 추가합니다.

```javascript
radio.appendTo('#container');           // CSS 선택자
radio.appendTo(document.body);          // DOM 요소
```

### `remove()`
라디오 버튼을 DOM에서 제거합니다.

```javascript
radio.remove();
```

### `getElement()`
라디오 버튼의 DOM 요소를 반환합니다.

```javascript
const element = radio.getElement();
```

## RadioGroup 메서드

### `getValue()`
선택된 값을 반환합니다.

```javascript
const selectedValue = radioGroup.getValue();
console.log(selectedValue);
```

### `setValue(value)`
선택할 값을 설정합니다.

```javascript
radioGroup.setValue('female');
```

### `getRadios()`
모든 라디오 버튼 인스턴스를 반환합니다.

```javascript
const radios = radioGroup.getRadios();
console.log(radios); // Radio 인스턴스 배열
```

### `appendTo(parent)`
모든 라디오 버튼을 DOM에 추가합니다.

```javascript
radioGroup.appendTo(document.body);
```

### `remove()`
모든 라디오 버튼을 제거합니다.

```javascript
radioGroup.remove();
```

## 사용 예제

### 개별 라디오 버튼들
```javascript
// 성별 선택
const maleRadio = new Radio({
  name: 'gender',
  label: '남성',
  value: 'male',
  onChange: (checked, value) => {
    if (checked) console.log('남성 선택됨');
  }
});

const femaleRadio = new Radio({
  name: 'gender',
  label: '여성',
  value: 'female',
  onChange: (checked, value) => {
    if (checked) console.log('여성 선택됨');
  }
});

maleRadio.appendTo('#gender-container');
femaleRadio.appendTo('#gender-container');
```

### RadioGroup 사용
```javascript
const genderGroup = new RadioGroup({
  name: 'gender',
  value: 'male',
  radios: [
    { label: '남성', value: 'male' },
    { label: '여성', value: 'female' },
    { label: '기타', value: 'other' }
  ],
  onChange: (value) => {
    console.log('선택된 성별:', value);
  }
});

genderGroup.appendTo(document.body);
```

### 연령대 선택
```javascript
const ageGroup = new RadioGroup({
  name: 'age',
  radios: [
    { label: '10대', value: '10s' },
    { label: '20대', value: '20s' },
    { label: '30대', value: '30s' },
    { label: '40대', value: '40s' },
    { label: '50대 이상', value: '50s+' }
  ],
  onChange: (value) => {
    console.log('선택된 연령대:', value);
  }
});

ageGroup.appendTo(document.body);
```

### 비활성화 상태
```javascript
const disabledRadio = new Radio({
  name: 'disabled-group',
  label: '비활성화된 옵션',
  value: 'disabled',
  disabled: true
});

disabledRadio.appendTo(document.body);
```

### 다양한 크기
```javascript
const smallRadio = new Radio({ name: 'size', label: '작은 크기', value: 'small', size: 'small' });
const mediumRadio = new Radio({ name: 'size', label: '중간 크기', value: 'medium', size: 'medium' });
const largeRadio = new Radio({ name: 'size', label: '큰 크기', value: 'large', size: 'large' });

smallRadio.appendTo('#small-container');
mediumRadio.appendTo('#medium-container');
largeRadio.appendTo('#large-container');
```

### 커스텀 테마
```javascript
const customRadio = new Radio({
  name: 'custom',
  label: '커스텀 테마',
  value: 'custom',
  theme: {
    primary: '#FF6B6B',        // 빨간색
    primaryHover: '#FF5252',
    background: '#FFFFFF',
    border: '#E8E8E8',
    text: '#2C3E50'
  }
});

customRadio.appendTo(document.body);
```

## 접근성

- 키보드 접근성 지원 (Enter, Space 키)
- ARIA 속성 자동 설정 (`role="radio"`, `aria-checked`)
- 포커스 가능한 요소 (`tabindex="0"`)
- 라벨과 라디오 버튼 연결 (`htmlFor` 속성)
- 그룹 내 자동 선택 해제 기능

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 클래스 문법 사용
- CSS3 트랜지션 및 애니메이션 활용
- Flexbox 레이아웃 사용 