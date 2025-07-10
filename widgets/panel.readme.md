# Panel 컴포넌트

고정 위치 패널 컴포넌트입니다. 화면의 특정 위치에 고정되어 표시되며, 버튼, 토글, 체크박스 등의 컨트롤을 포함할 수 있습니다.

## 기본 사용법

```javascript
// 기본 패널 생성
const panel = new Panel({
  position: {
    type: 'bottom-right'
  },
  buttons: [
    [
      {
        type: 'button',
        label: '저장',
        onClick: () => {
          console.log('저장 버튼 클릭');
        }
      }
    ]
  ]
});
```

## 옵션 설정

```javascript
const panel = new Panel({
  position: {
    type: 'bottom-right', // 위치 타입
    style: {} // 추가 스타일 객체
  },
  buttons: [ // 2차원 배열 형태의 버튼 구성
    [
      {
        type: 'button', // 'button', 'toggle', 'check', 'none'
        label: '버튼 라벨',
        title: '섹션 제목', // 선택사항
        onClick: () => {}, // 클릭 이벤트
        onChange: () => {} // 상태 변경 이벤트 (toggle, check용)
      }
    ]
  ],
  theme: {
    primary: '#00BCD4',
    primaryHover: '#0097A7',
    background: '#FFFFFF',
    text: '#333333',
    border: '#E0E0E0'
  },
  layout: {
    containerPadding: '16px',
    buttonGap: '12px',
    buttonHeight: '40px',
    minButtonWidth: '100px'
  }
});
```

## 위치 옵션

- `top-left`: 좌상단
- `top-right`: 우상단
- `bottom-left`: 좌하단
- `bottom-right`: 우하단 (기본값)
- `top-center`: 상단 중앙
- `bottom-center`: 하단 중앙
- `center-left`: 좌측 중앙
- `center-right`: 우측 중앙
- `center`: 화면 중앙

## 컨트롤 타입

### Button (버튼)
```javascript
{
  type: 'button',
  label: '저장',
  onClick: () => {
    console.log('저장 버튼 클릭');
  }
}
```

### Toggle (토글 스위치)
```javascript
{
  type: 'toggle',
  label: '알림',
  onChange: (isOn) => {
    console.log('알림 상태:', isOn);
  }
}
```

### Check (체크박스)
```javascript
{
  type: 'check',
  label: '자동 저장',
  onChange: (isChecked) => {
    console.log('자동 저장:', isChecked);
  }
}
```

### None (라벨만)
```javascript
{
  type: 'none',
  label: '상태: 활성화'
}
```

## 메서드

### `updateConfig(options)`
패널 설정을 업데이트합니다.

```javascript
panel.updateConfig({
  position: { type: 'top-right' },
  theme: { primary: '#FF6B6B' }
});
```

### `destroy()`
패널을 제거합니다.

```javascript
panel.destroy();
```

## 사용 예제

### 기본 설정 패널
```javascript
const settingsPanel = new Panel({
  position: { type: 'top-right' },
  buttons: [
    [
      { title: '설정' },
      {
        type: 'toggle',
        label: '다크 모드',
        onChange: (isOn) => {
          document.body.classList.toggle('dark-mode', isOn);
        }
      }
    ],
    [
      {
        type: 'check',
        label: '자동 저장',
        onChange: (isChecked) => {
          console.log('자동 저장:', isChecked);
        }
      },
      {
        type: 'button',
        label: '저장',
        onClick: () => {
          console.log('설정 저장됨');
        }
      }
    ]
  ]
});
```

### 게임 컨트롤 패널
```javascript
const gamePanel = new Panel({
  position: { type: 'bottom-left' },
  theme: {
    primary: '#FF6B6B',
    primaryHover: '#FF5252',
    background: '#2C3E50',
    text: '#FFFFFF'
  },
  buttons: [
    [
      { title: '게임 컨트롤' },
      {
        type: 'button',
        label: '일시정지',
        onClick: () => {
          console.log('게임 일시정지');
        }
      }
    ],
    [
      {
        type: 'toggle',
        label: '사운드',
        onChange: (isOn) => {
          console.log('사운드:', isOn ? '켜짐' : '꺼짐');
        }
      },
      {
        type: 'button',
        label: '종료',
        onClick: () => {
          console.log('게임 종료');
        }
      }
    ]
  ]
});
```

### 알림 패널
```javascript
const notificationPanel = new Panel({
  position: { type: 'top-center' },
  buttons: [
    [
      { title: '알림' },
      {
        type: 'none',
        label: '새 메시지: 3개'
      }
    ],
    [
      {
        type: 'button',
        label: '모두 읽음',
        onClick: () => {
          console.log('모든 메시지를 읽음으로 표시');
        }
      },
      {
        type: 'button',
        label: '닫기',
        onClick: () => {
          notificationPanel.destroy();
        }
      }
    ]
  ]
});
```

### 커스텀 스타일 패널
```javascript
const customPanel = new Panel({
  position: {
    type: 'center',
    style: {
      border: '2px solid #FF6B6B',
      borderRadius: '20px'
    }
  },
  theme: {
    primary: '#FF6B6B',
    primaryHover: '#FF5252',
    background: 'rgba(255, 255, 255, 0.95)',
    text: '#2C3E50'
  },
  layout: {
    containerPadding: '24px',
    buttonGap: '16px',
    buttonHeight: '48px',
    minButtonWidth: '120px'
  },
  buttons: [
    [
      {
        type: 'button',
        label: '확인',
        onClick: () => {
          console.log('확인됨');
        }
      },
      {
        type: 'button',
        label: '취소',
        onClick: () => {
          customPanel.destroy();
        }
      }
    ]
  ]
});
```

### 동적 업데이트
```javascript
const dynamicPanel = new Panel({
  position: { type: 'bottom-right' },
  buttons: [
    [
      {
        type: 'none',
        label: '로딩 중...'
      }
    ]
  ]
});

// 3초 후 버튼 업데이트
setTimeout(() => {
  dynamicPanel.updateConfig({
    buttons: [
      [
        {
          type: 'button',
          label: '완료',
          onClick: () => {
            console.log('작업 완료');
          }
        }
      ]
    ]
  });
}, 3000);
```

## 접근성

- 키보드 접근성 지원
- 포커스 가능한 요소
- 적절한 ARIA 속성
- 스크린 리더 지원

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 클래스 문법 사용
- CSS3 트랜지션 및 애니메이션 활용
- Flexbox 레이아웃 사용 