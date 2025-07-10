// 토스트 메시지 유틸리티
const Toast = {
  // 기본 설정값 추가
  config: {
    position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'
  },

  // 토스트 초기화 함수 추가
  init: function(options = {}) {
    this.config = { ...this.config, ...options };
  },

  // 토스트 컨테이너 생성
  createContainer: function() {
    if (document.getElementById('toast-container')) return;
    
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    // 위치에 따른 스타일 설정
    switch(this.config.position) {
      case 'top-left':
        container.style.top = '20px';
        container.style.left = '20px';
        break;
      case 'top-right':
        container.style.top = '20px';
        container.style.right = '20px';
        break;
      case 'bottom-left':
        container.style.bottom = '20px';
        container.style.left = '20px';
        break;
      case 'bottom-right':
        container.style.bottom = '20px';
        container.style.right = '20px';
        break;
      case 'top-center':
        container.style.top = '20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        break;
      case 'bottom-center':
        container.style.bottom = '20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        break;
      case 'center-left':
        container.style.left = '20px';
        container.style.top = '50%';
        container.style.transform = 'translateY(-50%)';
        break;
      case 'center-right':
        container.style.right = '20px';
        container.style.top = '50%';
        container.style.transform = 'translateY(-50%)';
        break;
      case 'center':
        container.style.left = '50%';
        container.style.top = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        break;
    }

    document.body.appendChild(container);
  },
  
  // 토스트 메시지 표시
  show: function(message, type = 'info', duration = 3000) {
    this.createContainer();
    const container = document.getElementById('toast-container');
    
    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.style.minWidth = '250px';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.animation = 'toast-in 0.3s ease-out forwards';
    toast.style.transition = 'all 0.3s ease';
    toast.style.overflow = 'hidden';
    
    // 타입에 따른 스타일 설정
    switch(type) {
      case 'success':
        toast.style.backgroundColor = '#52c41a';
        toast.style.color = 'white';
        break;
      case 'error':
        toast.style.backgroundColor = '#ff4d4f';
        toast.style.color = 'white';
        break;
      case 'warning':
        toast.style.backgroundColor = '#faad14';
        toast.style.color = 'white';
        break;
      default: // info
        toast.style.backgroundColor = '#1890ff';
        toast.style.color = 'white';
    }
    
    // 메시지 설정
    toast.textContent = message;
    
    // 컨테이너에 추가
    container.appendChild(toast);
    
    // 애니메이션 스타일 추가
    if (!document.getElementById('toast-style')) {
      const style = document.createElement('style');
      style.id = 'toast-style';
      style.textContent = `
        @keyframes toast-in {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes toast-out {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // 지정된 시간 후 제거
    setTimeout(() => {
      toast.style.animation = 'toast-out 0.3s ease forwards';
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, duration);
    
    return toast;
  },
  
  // 성공 메시지
  success: function(message, duration = 3000) {
    return this.show(message, 'success', duration);
  },
  
  // 에러 메시지
  error: function(message, duration = 3000) {
    return this.show(message, 'error', duration);
  },
  
  // 경고 메시지
  warning: function(message, duration = 3000) {
    return this.show(message, 'warning', duration);
  },
  
  // 정보 메시지
  info: function(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
}; 