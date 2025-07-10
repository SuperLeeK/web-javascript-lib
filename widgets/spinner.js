// 스피너 컴포넌트
class Spinner {
  constructor(options = {}) {
    // 기본 설정
    this.config = {
      id: null,
      type: 'spinner', // 'spinner', 'dots', 'bars', 'pulse', 'ripple'
      size: 'medium', // 'small', 'medium', 'large'
      color: '#00BCD4',
      text: '',
      textColor: '#333333',
      overlay: false, // true면 전체 화면 오버레이
      theme: {
        primary: '#00BCD4',
        background: '#FFFFFF',
        overlay: 'rgba(0, 0, 0, 0.5)',
        text: '#333333'
      }
    };

    // 설정 업데이트
    this.updateConfig(options);
    
    this.id = this.config.id || 'spinner-' + Math.random().toString(36).substr(2, 9);
    this.element = null;
    this.isVisible = false;
    this.init();
  }

  // 설정 업데이트 메서드
  updateConfig(options = {}) {
    this.config = {
      ...this.config,
      ...options,
      theme: { ...this.config.theme, ...(options.theme || {}) }
    };
  }

  // 크기에 따른 스타일 설정
  getSizeStyles() {
    const sizes = {
      small: {
        spinnerSize: '20px',
        fontSize: '12px',
        padding: '8px'
      },
      medium: {
        spinnerSize: '32px',
        fontSize: '14px',
        padding: '16px'
      },
      large: {
        spinnerSize: '48px',
        fontSize: '16px',
        padding: '24px'
      }
    };
    return sizes[this.config.size] || sizes.medium;
  }

  init() {
    this.createElement();
  }

  createElement() {
    const sizeStyles = this.getSizeStyles();
    
    // 컨테이너 생성
    const container = document.createElement('div');
    container.id = this.id;
    container.className = 'spinner-container';
    container.style.display = 'none';
    container.style.position = this.config.overlay ? 'fixed' : 'relative';
    container.style.top = this.config.overlay ? '0' : 'auto';
    container.style.left = this.config.overlay ? '0' : 'auto';
    container.style.width = this.config.overlay ? '100%' : 'auto';
    container.style.height = this.config.overlay ? '100%' : 'auto';
    container.style.backgroundColor = this.config.overlay ? this.config.theme.overlay : 'transparent';
    container.style.zIndex = this.config.overlay ? '9999' : 'auto';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.fontFamily = 'Arial, sans-serif';

    // 스피너 래퍼
    const spinnerWrapper = document.createElement('div');
    spinnerWrapper.className = 'spinner-wrapper';
    spinnerWrapper.style.display = 'flex';
    spinnerWrapper.style.flexDirection = 'column';
    spinnerWrapper.style.alignItems = 'center';
    spinnerWrapper.style.gap = '12px';
    spinnerWrapper.style.padding = sizeStyles.padding;
    spinnerWrapper.style.backgroundColor = this.config.theme.background;
    spinnerWrapper.style.borderRadius = '8px';
    spinnerWrapper.style.boxShadow = this.config.overlay ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none';

    // 스피너 요소 생성
    const spinnerElement = this.createSpinnerElement(sizeStyles);
    
    // 텍스트
    if (this.config.text) {
      const text = document.createElement('div');
      text.className = 'spinner-text';
      text.textContent = this.config.text;
      text.style.fontSize = sizeStyles.fontSize;
      text.style.color = this.config.textColor || this.config.theme.text;
      text.style.textAlign = 'center';
      text.style.marginTop = '8px';
      spinnerWrapper.appendChild(text);
    }

    spinnerWrapper.appendChild(spinnerElement);
    container.appendChild(spinnerWrapper);

    this.element = container;
    this.spinnerElement = spinnerElement;
  }

  createSpinnerElement(sizeStyles) {
    const spinnerSize = sizeStyles.spinnerSize;
    
    switch (this.config.type) {
      case 'dots':
        return this.createDotsSpinner(spinnerSize);
      case 'bars':
        return this.createBarsSpinner(spinnerSize);
      case 'pulse':
        return this.createPulseSpinner(spinnerSize);
      case 'ripple':
        return this.createRippleSpinner(spinnerSize);
      default:
        return this.createDefaultSpinner(spinnerSize);
    }
  }

  createDefaultSpinner(size) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-default';
    spinner.style.width = size;
    spinner.style.height = size;
    spinner.style.border = `3px solid ${this.config.theme.background}`;
    spinner.style.borderTop = `3px solid ${this.config.color}`;
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    
    this.addSpinnerStyles();
    return spinner;
  }

  createDotsSpinner(size) {
    const container = document.createElement('div');
    container.className = 'spinner-dots';
    container.style.display = 'flex';
    container.style.gap = '4px';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.backgroundColor = this.config.color;
      dot.style.borderRadius = '50%';
      dot.style.animation = `bounce 1.4s ease-in-out infinite both`;
      dot.style.animationDelay = `${i * 0.16}s`;
      container.appendChild(dot);
    }

    this.addDotsStyles();
    return container;
  }

  createBarsSpinner(size) {
    const container = document.createElement('div');
    container.className = 'spinner-bars';
    container.style.display = 'flex';
    container.style.gap = '2px';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.height = size;

    for (let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.style.width = '4px';
      bar.style.height = '100%';
      bar.style.backgroundColor = this.config.color;
      bar.style.animation = `bars 1.2s ease-in-out infinite both`;
      bar.style.animationDelay = `${i * 0.1}s`;
      container.appendChild(bar);
    }

    this.addBarsStyles();
    return container;
  }

  createPulseSpinner(size) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-pulse';
    spinner.style.width = size;
    spinner.style.height = size;
    spinner.style.backgroundColor = this.config.color;
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'pulse 1.2s ease-in-out infinite both';
    
    this.addPulseStyles();
    return spinner;
  }

  createRippleSpinner(size) {
    const container = document.createElement('div');
    container.className = 'spinner-ripple';
    container.style.position = 'relative';
    container.style.width = size;
    container.style.height = size;

    const ripple1 = document.createElement('div');
    ripple1.style.position = 'absolute';
    ripple1.style.top = '0';
    ripple1.style.left = '0';
    ripple1.style.width = '100%';
    ripple1.style.height = '100%';
    ripple1.style.border = `2px solid ${this.config.color}`;
    ripple1.style.borderRadius = '50%';
    ripple1.style.animation = 'ripple 1.2s linear infinite';

    const ripple2 = document.createElement('div');
    ripple2.style.position = 'absolute';
    ripple2.style.top = '0';
    ripple2.style.left = '0';
    ripple2.style.width = '100%';
    ripple2.style.height = '100%';
    ripple2.style.border = `2px solid ${this.config.color}`;
    ripple2.style.borderRadius = '50%';
    ripple2.style.animation = 'ripple 1.2s linear infinite';
    ripple2.style.animationDelay = '0.6s';

    container.appendChild(ripple1);
    container.appendChild(ripple2);
    
    this.addRippleStyles();
    return container;
  }

  addSpinnerStyles() {
    if (!document.getElementById('spinner-default-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-default-style';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  addDotsStyles() {
    if (!document.getElementById('spinner-dots-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-dots-style';
      style.textContent = `
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  addBarsStyles() {
    if (!document.getElementById('spinner-bars-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-bars-style';
      style.textContent = `
        @keyframes bars {
          0%, 40%, 100% {
            transform: scaleY(0.4);
          }
          20% {
            transform: scaleY(1);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  addPulseStyles() {
    if (!document.getElementById('spinner-pulse-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-pulse-style';
      style.textContent = `
        @keyframes pulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  addRippleStyles() {
    if (!document.getElementById('spinner-ripple-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-ripple-style';
      style.textContent = `
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 스피너 표시
  show() {
    if (this.isVisible) return;
    
    this.element.style.display = 'flex';
    this.isVisible = true;
    
    if (this.config.overlay) {
      document.body.appendChild(this.element);
    }
  }

  // 스피너 숨김
  hide() {
    if (!this.isVisible) return;
    
    this.element.style.display = 'none';
    this.isVisible = false;
    
    if (this.config.overlay && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  // 텍스트 설정
  setText(text) {
    this.config.text = text;
    const textElement = this.element.querySelector('.spinner-text');
    if (textElement) {
      textElement.textContent = text;
    } else if (text) {
      const newText = document.createElement('div');
      newText.className = 'spinner-text';
      newText.textContent = text;
      newText.style.fontSize = this.getSizeStyles().fontSize;
      newText.style.color = this.config.textColor || this.config.theme.text;
      newText.style.textAlign = 'center';
      newText.style.marginTop = '8px';
      
      const wrapper = this.element.querySelector('.spinner-wrapper');
      wrapper.appendChild(newText);
    }
  }

  // 색상 설정
  setColor(color) {
    this.config.color = color;
    this.updateSpinnerColor();
  }

  updateSpinnerColor() {
    const spinnerElement = this.spinnerElement;
    if (!spinnerElement) return;

    switch (this.config.type) {
      case 'dots':
        const dots = spinnerElement.querySelectorAll('div');
        dots.forEach(dot => {
          dot.style.backgroundColor = this.config.color;
        });
        break;
      case 'bars':
        const bars = spinnerElement.querySelectorAll('div');
        bars.forEach(bar => {
          bar.style.backgroundColor = this.config.color;
        });
        break;
      case 'pulse':
        spinnerElement.style.backgroundColor = this.config.color;
        break;
      case 'ripple':
        const ripples = spinnerElement.querySelectorAll('div');
        ripples.forEach(ripple => {
          ripple.style.borderColor = this.config.color;
        });
        break;
      default:
        spinnerElement.style.borderTopColor = this.config.color;
        break;
    }
  }

  // 크기 설정
  setSize(size) {
    this.config.size = size;
    const sizeStyles = this.getSizeStyles();
    
    // 스피너 크기 업데이트
    if (this.spinnerElement) {
      if (this.config.type === 'default' || this.config.type === 'pulse') {
        this.spinnerElement.style.width = sizeStyles.spinnerSize;
        this.spinnerElement.style.height = sizeStyles.spinnerSize;
      } else if (this.config.type === 'ripple') {
        this.spinnerElement.style.width = sizeStyles.spinnerSize;
        this.spinnerElement.style.height = sizeStyles.spinnerSize;
      }
    }

    // 텍스트 크기 업데이트
    const textElement = this.element.querySelector('.spinner-text');
    if (textElement) {
      textElement.style.fontSize = sizeStyles.fontSize;
    }

    // 래퍼 패딩 업데이트
    const wrapper = this.element.querySelector('.spinner-wrapper');
    if (wrapper) {
      wrapper.style.padding = sizeStyles.padding;
    }
  }

  // 타입 변경
  setType(type) {
    this.config.type = type;
    
    // 기존 스피너 제거
    if (this.spinnerElement) {
      this.spinnerElement.remove();
    }
    
    // 새 스피너 생성
    const sizeStyles = this.getSizeStyles();
    this.spinnerElement = this.createSpinnerElement(sizeStyles);
    
    const wrapper = this.element.querySelector('.spinner-wrapper');
    wrapper.insertBefore(this.spinnerElement, wrapper.firstChild);
  }

  // DOM에 추가
  appendTo(parent) {
    if (typeof parent === 'string') {
      parent = document.querySelector(parent);
    }
    parent.appendChild(this.element);
    return this;
  }

  // DOM에서 제거
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  // 요소 반환
  getElement() {
    return this.element;
  }

  // 표시 상태 확인
  isShown() {
    return this.isVisible;
  }
}

// 전역 함수로도 사용할 수 있도록 설정
window.Spinner = Spinner; 