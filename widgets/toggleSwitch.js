// 토글 스위치 컴포넌트
class ToggleSwitch {
  constructor(options = {}) {
    // 기본 설정
    this.config = {
      id: null,
      checked: false,
      disabled: false,
      size: 'medium', // 'small', 'medium', 'large'
      theme: {
        primary: '#00BCD4',
        primaryHover: '#0097A7',
        background: '#E0E0E0',
        disabled: '#F5F5F5',
        text: '#333333'
      },
      labels: {
        on: 'ON',
        off: 'OFF'
      },
      onChange: null,
      showLabels: true
    };

    // 설정 업데이트
    this.updateConfig(options);
    
    this.id = this.config.id || 'toggle-' + Math.random().toString(36).substr(2, 9);
    this.element = null;
    this.init();
  }

  // 설정 업데이트 메서드
  updateConfig(options = {}) {
    this.config = {
      ...this.config,
      ...options,
      theme: { ...this.config.theme, ...(options.theme || {}) },
      labels: { ...this.config.labels, ...(options.labels || {}) }
    };
  }

  // 크기에 따른 스타일 설정
  getSizeStyles() {
    const sizes = {
      small: {
        width: '40px',
        height: '20px',
        thumbSize: '16px',
        fontSize: '10px'
      },
      medium: {
        width: '50px',
        height: '25px',
        thumbSize: '21px',
        fontSize: '12px'
      },
      large: {
        width: '60px',
        height: '30px',
        thumbSize: '26px',
        fontSize: '14px'
      }
    };
    return sizes[this.config.size] || sizes.medium;
  }

  init() {
    this.createElement();
    this.bindEvents();
  }

  createElement() {
    const sizeStyles = this.getSizeStyles();
    
    // 컨테이너 생성
    const container = document.createElement('div');
    container.id = this.id;
    container.style.display = 'inline-flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.userSelect = 'none';

    // 토글 스위치 생성
    const toggle = document.createElement('div');
    toggle.className = 'toggle-switch';
    toggle.style.position = 'relative';
    toggle.style.width = sizeStyles.width;
    toggle.style.height = sizeStyles.height;
    toggle.style.backgroundColor = this.config.checked ? this.config.theme.primary : this.config.theme.background;
    toggle.style.borderRadius = '50px';
    toggle.style.cursor = this.config.disabled ? 'not-allowed' : 'pointer';
    toggle.style.transition = 'all 0.3s ease';
    toggle.style.opacity = this.config.disabled ? '0.6' : '1';

    // 썸(움직이는 원형 부분) 생성
    const thumb = document.createElement('div');
    thumb.className = 'toggle-thumb';
    thumb.style.position = 'absolute';
    thumb.style.top = '2px';
    thumb.style.left = this.config.checked ? `calc(100% - ${sizeStyles.thumbSize} - 2px)` : '2px';
    thumb.style.width = sizeStyles.thumbSize;
    thumb.style.height = sizeStyles.thumbSize;
    thumb.style.backgroundColor = 'white';
    thumb.style.borderRadius = '50%';
    thumb.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    thumb.style.transition = 'all 0.3s ease';

    // 라벨 생성
    if (this.config.showLabels) {
      const label = document.createElement('span');
      label.className = 'toggle-label';
      label.textContent = this.config.checked ? this.config.labels.on : this.config.labels.off;
      label.style.fontSize = sizeStyles.fontSize;
      label.style.fontWeight = 'bold';
      label.style.color = this.config.theme.text;
      label.style.minWidth = '20px';
      label.style.textAlign = 'center';
      container.appendChild(label);
    }

    toggle.appendChild(thumb);
    container.appendChild(toggle);

    this.element = container;
    this.thumb = thumb;
    this.toggle = toggle;
    
    return container;
  }

  bindEvents() {
    if (this.config.disabled) return;

    this.toggle.addEventListener('click', () => {
      this.toggleState();
    });

    // 키보드 접근성
    this.toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleState();
      }
    });

    this.toggle.setAttribute('tabindex', '0');
    this.toggle.setAttribute('role', 'switch');
    this.toggle.setAttribute('aria-checked', this.config.checked);
  }

  toggleState() {
    if (this.config.disabled) return;

    this.config.checked = !this.config.checked;
    this.updateVisualState();
    
    // 콜백 실행
    if (this.config.onChange) {
      this.config.onChange(this.config.checked);
    }
  }

  updateVisualState() {
    const sizeStyles = this.getSizeStyles();
    
    // 배경색 업데이트
    this.toggle.style.backgroundColor = this.config.checked ? this.config.theme.primary : this.config.theme.background;
    
    // 썸 위치 업데이트
    this.thumb.style.left = this.config.checked ? `calc(100% - ${sizeStyles.thumbSize} - 2px)` : '2px';
    
    // 라벨 업데이트
    const label = this.element.querySelector('.toggle-label');
    if (label) {
      label.textContent = this.config.checked ? this.config.labels.on : this.config.labels.off;
    }
    
    // ARIA 속성 업데이트
    this.toggle.setAttribute('aria-checked', this.config.checked);
  }

  // 상태 설정 메서드
  setChecked(checked) {
    this.config.checked = checked;
    this.updateVisualState();
  }

  // 상태 가져오기 메서드
  getChecked() {
    return this.config.checked;
  }

  // 비활성화/활성화 메서드
  setDisabled(disabled) {
    this.config.disabled = disabled;
    this.toggle.style.cursor = disabled ? 'not-allowed' : 'pointer';
    this.toggle.style.opacity = disabled ? '0.6' : '1';
    
    if (disabled) {
      this.toggle.removeEventListener('click', this.toggleState);
      this.toggle.removeEventListener('keydown', this.handleKeydown);
    } else {
      this.bindEvents();
    }
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
}

// 전역 함수로도 사용할 수 있도록 설정
window.ToggleSwitch = ToggleSwitch; 