# Accordion 컴포넌트

아코디언 컴포넌트입니다. 접을 수 있는 섹션들을 지원하며, 다중 선택 모드와 애니메이션 효과를 제공합니다.

## 기본 사용법

```javascript
// 기본 아코디언 생성
const accordion = new Accordion({
  items: [
    { title: '섹션 1', content: '섹션 1의 내용입니다.' },
    { title: '섹션 2', content: '섹션 2의 내용입니다.' },
    { title: '섹션 3', content: '섹션 3의 내용입니다.' }
  ]
});

// DOM에 추가
accordion.appendTo(document.body);
```

## 옵션 설정

```javascript
const accordion = new Accordion({
  id: 'my-accordion',                 // 고유 ID
  items: [                            // 아이템 배열
    {
      title: '섹션 제목',
      content: '섹션 내용 (문자열 또는 DOM 요소)',
      expanded: false                 // 초기 확장 상태
    }
  ],
  multiple: false,                    // 다중 선택 모드 (기본값: false)
  animated: true,                     // 애니메이션 사용 여부 (기본값: true)
  size: 'medium',                     // 크기: 'small', 'medium', 'large'
  theme: {                            // 테마 설정
    primary: '#00BCD4',
    primaryHover: '#0097A7',
    background: '#FFFFFF',
    border: '#DEE2E6',
    text: '#333333',
    textLight: '#666666',
    shadow: 'rgba(0, 0, 0, 0.1)'
  },
  onToggle: (index, expanded, config) => { // 토글 이벤트
    console.log(`섹션 ${index}: ${expanded ? '열림' : '닫힘'}`);
  },
  onExpand: (index, config) => {      // 확장 이벤트
    console.log(`섹션 ${index} 확장됨`);
  },
  onCollapse: (index, config) => {    // 축소 이벤트
    console.log(`섹션 ${index} 축소됨`);
  }
});
```

## 단일 선택 모드 (기본)

```javascript
const singleAccordion = new Accordion({
  items: [
    { title: 'FAQ 1', content: '자주 묻는 질문 1의 답변입니다.' },
    { title: 'FAQ 2', content: '자주 묻는 질문 2의 답변입니다.' },
    { title: 'FAQ 3', content: '자주 묻는 질문 3의 답변입니다.' }
  ],
  multiple: false // 한 번에 하나의 섹션만 열림
});
```

## 다중 선택 모드

```javascript
const multipleAccordion = new Accordion({
  items: [
    { title: '메뉴 1', content: '메뉴 1의 내용입니다.' },
    { title: '메뉴 2', content: '메뉴 2의 내용입니다.' },
    { title: '메뉴 3', content: '메뉴 3의 내용입니다.' }
  ],
  multiple: true // 여러 섹션을 동시에 열 수 있음
});
```

## 크기 옵션

- `small`: 작은 크기 (폰트: 12px, 패딩: 8px 12px)
- `medium`: 중간 크기 (폰트: 14px, 패딩: 12px 16px, 기본값)
- `large`: 큰 크기 (폰트: 16px, 패딩: 16px 20px)

## 메서드

### `addItem(itemConfig)`
새로운 아이템을 추가합니다.

```javascript
const newIndex = accordion.addItem({
  title: '새로운 섹션',
  content: '새로운 내용',
  expanded: false
});
```

### `removeItem(index)`
지정된 인덱스의 아이템을 제거합니다.

```javascript
accordion.removeItem(0);
```

### `updateItem(index, newConfig)`
지정된 인덱스의 아이템을 업데이트합니다.

```javascript
accordion.updateItem(0, {
  title: '업데이트된 제목',
  content: '업데이트된 내용'
});
```

### `expandItem(index)`
지정된 인덱스의 아이템을 확장합니다.

```javascript
accordion.expandItem(0);
```

### `collapseItem(index)`
지정된 인덱스의 아이템을 축소합니다.

```javascript
accordion.collapseItem(0);
```

### `toggleItem(index)`
지정된 인덱스의 아이템을 토글합니다.

```javascript
accordion.toggleItem(0);
```

### `expandAll()`
모든 아이템을 확장합니다.

```javascript
accordion.expandAll();
```

### `collapseAll()`
모든 아이템을 축소합니다.

```javascript
accordion.collapseAll();
```

### `getExpandedItems()`
현재 확장된 아이템들의 인덱스를 반환합니다.

```javascript
const expandedIndices = accordion.getExpandedItems();
console.log(expandedIndices); // [0, 2] (예시)
```

### `isExpanded(index)`
지정된 인덱스의 아이템이 확장되었는지 확인합니다.

```javascript
const isExpanded = accordion.isExpanded(0);
console.log(isExpanded); // true 또는 false
```

### `getItemCount()`
아이템 개수를 반환합니다.

```javascript
const count = accordion.getItemCount();
console.log(count); // 아이템 개수
```

### `getItemConfig(index)`
지정된 인덱스의 아이템 설정을 반환합니다.

```javascript
const config = accordion.getItemConfig(0);
console.log(config); // { title: '...', content: '...', expanded: false }
```

### `setMultiple(multiple)`
다중 선택 모드를 설정합니다.

```javascript
accordion.setMultiple(true);  // 다중 선택 모드 활성화
accordion.setMultiple(false); // 단일 선택 모드 활성화
```

### `setAnimated(animated)`
애니메이션 사용 여부를 설정합니다.

```javascript
accordion.setAnimated(true);  // 애니메이션 활성화
accordion.setAnimated(false); // 애니메이션 비활성화
```

### `appendTo(parent)`
지정된 부모 요소에 아코디언을 추가합니다.

```javascript
accordion.appendTo('#container');           // CSS 선택자
accordion.appendTo(document.body);          // DOM 요소
```

### `remove()`
아코디언을 DOM에서 제거합니다.

```javascript
accordion.remove();
```

### `getElement()`
아코디언의 DOM 요소를 반환합니다.

```javascript
const element = accordion.getElement();
```

## 사용 예제

### 기본 FAQ 아코디언
```javascript
const faqAccordion = new Accordion({
  items: [
    {
      title: '서비스 이용 방법은?',
      content: '회원가입 후 로그인하여 서비스를 이용하실 수 있습니다.'
    },
    {
      title: '결제 방법은?',
      content: '신용카드, 계좌이체, 간편결제 등 다양한 방법을 지원합니다.'
    },
    {
      title: '환불 정책은?',
      content: '구매 후 7일 이내에 환불 신청이 가능합니다.'
    }
  ],
  onToggle: (index, expanded) => {
    console.log(`FAQ ${index + 1}: ${expanded ? '열림' : '닫힘'}`);
  }
});

faqAccordion.appendTo(document.body);
```

### 다중 선택 메뉴
```javascript
const menuAccordion = new Accordion({
  items: [
    {
      title: '사용자 관리',
      content: '사용자 목록, 권한 관리, 프로필 설정 등'
    },
    {
      title: '콘텐츠 관리',
      content: '게시글, 댓글, 파일 업로드 등'
    },
    {
      title: '시스템 설정',
      content: '환경 설정, 백업, 로그 관리 등'
    }
  ],
  multiple: true,
  onExpand: (index) => {
    console.log(`메뉴 ${index + 1} 확장됨`);
  }
});

menuAccordion.appendTo(document.body);
```

### 동적 아이템 추가
```javascript
const dynamicAccordion = new Accordion({
  items: [
    { title: '기존 섹션', content: '기존 내용' }
  ]
});

dynamicAccordion.appendTo(document.body);

// 새 아이템 추가
const newIndex = dynamicAccordion.addItem({
  title: '동적 추가된 섹션',
  content: '동적으로 추가된 내용입니다.',
  expanded: true
});

console.log('새로 추가된 아이템 인덱스:', newIndex);
```

### DOM 요소를 콘텐츠로 사용
```javascript
const customContent = document.createElement('div');
customContent.innerHTML = `
  <h3>커스텀 콘텐츠</h3>
  <p>HTML 요소를 콘텐츠로 사용할 수 있습니다.</p>
  <button onclick="alert('버튼 클릭!')">테스트 버튼</button>
`;

const customAccordion = new Accordion({
  items: [
    {
      title: '커스텀 콘텐츠 섹션',
      content: customContent
    }
  ]
});

customAccordion.appendTo(document.body);
```

### 초기 확장 상태 설정
```javascript
const expandedAccordion = new Accordion({
  items: [
    { title: '첫 번째 섹션', content: '첫 번째 내용', expanded: true },
    { title: '두 번째 섹션', content: '두 번째 내용', expanded: false },
    { title: '세 번째 섹션', content: '세 번째 내용', expanded: true }
  ],
  multiple: true
});

expandedAccordion.appendTo(document.body);
```

### 다양한 크기
```javascript
const smallAccordion = new Accordion({
  items: [
    { title: '작은 크기', content: '작은 크기 아코디언' }
  ],
  size: 'small'
});

const largeAccordion = new Accordion({
  items: [
    { title: '큰 크기', content: '큰 크기 아코디언' }
  ],
  size: 'large'
});

smallAccordion.appendTo('#small-container');
largeAccordion.appendTo('#large-container');
```

### 커스텀 테마
```javascript
const customAccordion = new Accordion({
  items: [
    { title: '커스텀 테마', content: '커스텀 테마가 적용된 아코디언' }
  ],
  theme: {
    primary: '#FF6B6B',        // 빨간색
    primaryHover: '#FF5252',
    background: '#FFFFFF',
    border: '#E8E8E8',
    text: '#2C3E50',
    textLight: '#7F8C8D',
    shadow: 'rgba(231, 76, 60, 0.1)'
  }
});

customAccordion.appendTo(document.body);
```

### 애니메이션 비활성화
```javascript
const noAnimationAccordion = new Accordion({
  items: [
    { title: '애니메이션 없음', content: '애니메이션이 비활성화된 아코디언' }
  ],
  animated: false
});

noAnimationAccordion.appendTo(document.body);
```

## 접근성

- 키보드 접근성 지원 (Enter, Space 키)
- ARIA 속성 자동 설정 (`role="button"`, `aria-expanded`, `aria-controls`)
- 포커스 가능한 요소 (`tabindex="0"`)
- 스크린 리더 지원

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 클래스 문법 사용
- CSS3 트랜지션 및 애니메이션 활용
- Flexbox 레이아웃 사용 