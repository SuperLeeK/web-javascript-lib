# Toast 컴포넌트

토스트 메시지 컴포넌트입니다. 사용자에게 알림, 성공, 경고, 오류 메시지를 표시할 수 있습니다.

## 기본 사용법

```javascript
// 기본 토스트 메시지
Toast.show('저장되었습니다.');

// 성공 메시지
Toast.success('성공적으로 저장되었습니다.');

// 오류 메시지
Toast.error('저장에 실패했습니다.');

// 경고 메시지
Toast.warning('주의하세요!');

// 정보 메시지
Toast.info('새로운 업데이트가 있습니다.');
```

## 초기화 및 설정

```javascript
// 토스트 초기화 및 설정
Toast.init({
  position: 'bottom-right' // 기본 위치 설정
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

## 메서드

### `show(message, type, duration)`
토스트 메시지를 표시합니다.

```javascript
Toast.show('메시지', 'success', 5000);
```

**매개변수:**
- `message`: 표시할 메시지
- `type`: 메시지 타입 ('success', 'error', 'warning', 'info')
- `duration`: 표시 시간 (밀리초, 기본값: 3000)

### `success(message, duration)`
성공 메시지를 표시합니다.

```javascript
Toast.success('성공적으로 처리되었습니다.', 4000);
```

### `error(message, duration)`
오류 메시지를 표시합니다.

```javascript
Toast.error('오류가 발생했습니다.', 5000);
```

### `warning(message, duration)`
경고 메시지를 표시합니다.

```javascript
Toast.warning('주의하세요!', 3000);
```

### `info(message, duration)`
정보 메시지를 표시합니다.

```javascript
Toast.info('새로운 알림이 있습니다.', 3000);
```

## 사용 예제

### 기본 사용법
```javascript
// 간단한 알림
Toast.show('작업이 완료되었습니다.');

// 성공 메시지
Toast.success('파일이 성공적으로 업로드되었습니다.');

// 오류 메시지
Toast.error('네트워크 연결에 실패했습니다.');

// 경고 메시지
Toast.warning('이 작업은 되돌릴 수 없습니다.');

// 정보 메시지
Toast.info('새로운 버전이 사용 가능합니다.');
```

### 커스텀 위치 설정
```javascript
// 토스트 위치를 상단 중앙으로 설정
Toast.init({
  position: 'top-center'
});

Toast.success('상단 중앙에 표시됩니다.');
```

### 다양한 지속 시간
```javascript
// 짧은 메시지 (1초)
Toast.info('빠른 알림', 1000);

// 긴 메시지 (10초)
Toast.warning('중요한 경고 메시지', 10000);

// 기본 지속 시간 (3초)
Toast.success('기본 지속 시간');
```

### API 호출과 함께 사용
```javascript
async function saveData() {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      Toast.success('데이터가 성공적으로 저장되었습니다.');
    } else {
      Toast.error('저장에 실패했습니다.');
    }
  } catch (error) {
    Toast.error('네트워크 오류가 발생했습니다.');
  }
}
```

### 폼 제출과 함께 사용
```javascript
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      Toast.success('메시지가 성공적으로 전송되었습니다.');
      e.target.reset();
    } else {
      Toast.error('메시지 전송에 실패했습니다.');
    }
  } catch (error) {
    Toast.error('서버 연결에 실패했습니다.');
  }
});
```

### 파일 업로드와 함께 사용
```javascript
document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  
  if (!file) {
    Toast.warning('파일을 선택해주세요.');
    return;
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    Toast.info('파일을 업로드하는 중...');
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      Toast.success('파일이 성공적으로 업로드되었습니다.');
    } else {
      Toast.error('파일 업로드에 실패했습니다.');
    }
  } catch (error) {
    Toast.error('업로드 중 오류가 발생했습니다.');
  }
});
```

### 로그인과 함께 사용
```javascript
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      Toast.success('로그인되었습니다.');
      window.location.href = '/dashboard';
    } else {
      Toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  } catch (error) {
    Toast.error('로그인 중 오류가 발생했습니다.');
  }
});
```

### 조건부 메시지
```javascript
function validateForm() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  
  if (!name.trim()) {
    Toast.warning('이름을 입력해주세요.');
    return false;
  }
  
  if (!email.includes('@')) {
    Toast.warning('올바른 이메일 주소를 입력해주세요.');
    return false;
  }
  
  Toast.success('모든 필드가 올바르게 입력되었습니다.');
  return true;
}
```

## 스타일 커스터마이징

토스트는 CSS 변수를 통해 스타일을 커스터마이징할 수 있습니다:

```css
/* 토스트 컨테이너 스타일 */
#toast-container {
  --toast-bg-success: #52c41a;
  --toast-bg-error: #ff4d4f;
  --toast-bg-warning: #faad14;
  --toast-bg-info: #1890ff;
  --toast-color: white;
  --toast-border-radius: 4px;
  --toast-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

## 접근성

- 스크린 리더 지원
- 키보드 접근성
- 적절한 색상 대비
- 자동 사라짐 기능

## 브라우저 호환성

- 모든 모던 브라우저 지원
- ES6 문법 사용
- CSS3 애니메이션 활용
- Flexbox 레이아웃 사용 