// 체크박스 컴포넌트
class Check {
  constructor(options = {}) {
    // 기본 설정
    this.config = {
      id: null,
      label: 'Checkbox',
      checked: false,
      disabled: false,
      indeterminate: false,
      size: 'medium', // 'small', 'medium', 'large'
      variant: 'default', // 'default', 'switch', 'custom'
      theme: {
        primary: '#00BCD4',
        primaryHover: '#0097A7',
        background: '#FFFFFF',
        border: '#DEE2E6',
        text: '#333333',
        disabled: '#F5F5F5',
        disabledText: '#999999'
      },
      onChange: null,
      onFocus: null,
      onBlur: null
    };

    // 설정 업데이트
    this.updateConfig(options);
    
    this.id = this.config.id || 'check-' + Math.random().toString(36).substr(2, 9);
    this.element = null;
    this.checkbox = null;
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
        checkboxSize: '14px',
        fontSize: '12px',
        padding: '4px 8px',
        iconSize: '8px'
      },
      medium: {
        checkboxSize: '16px',
        fontSize: '14px',
        padding: '6px 12px',
        iconSize: '10px'
      },
      large: {
        checkboxSize: '20px',
        fontSize: '16px',
        padding: '8px 16px',
        iconSize: '12px'
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
    container.className = 'check-container';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.userSelect = 'none';
    container.style.cursor = this.config.disabled ? 'not-allowed' : 'pointer';

    if (this.config.variant === 'switch') {
      this.createSwitchElement(container, sizeStyles);
    } else {
      this.createCheckboxElement(container, sizeStyles);
    }

    this.element = container;
    return container;
  }

  createCheckboxElement(container, sizeStyles) {
    // 체크박스 래퍼
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-wrapper';
    checkboxWrapper.style.position = 'relative';
    checkboxWrapper.style.display = 'inline-flex';
    checkboxWrapper.style.alignItems = 'center';
    checkboxWrapper.style.justifyContent = 'center';

    // 실제 체크박스 (숨김)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = this.id + '-input';
    checkbox.checked = this.config.checked;
    checkbox.disabled = this.config.disabled;
    checkbox.indeterminate = this.config.indeterminate;
    checkbox.style.position = 'absolute';
    checkbox.style.opacity = '0';
    checkbox.style.pointerEvents = 'none';

    // 커스텀 체크박스
    const customCheckbox = document.createElement('div');
    customCheckbox.className = 'custom-checkbox';
    customCheckbox.style.width = sizeStyles.checkboxSize;
    customCheckbox.style.height = sizeStyles.checkboxSize;
    customCheckbox.style.border = `2px solid ${this.config.disabled ? this.config.theme.disabled : this.config.theme.border}`;
    customCheckbox.style.borderRadius = '3px';
    customCheckbox.style.backgroundColor = this.config.disabled ? this.config.theme.disabled : this.config.theme.background;
    customCheckbox.style.display = 'flex';
    customCheckbox.style.alignItems = 'center';
    customCheckbox.style.justifyContent = 'center';
    customCheckbox.style.transition = 'all 0.3s ease';
    customCheckbox.style.position = 'relative';

    // 체크 아이콘
    const checkIcon = document.createElement('div');
    checkIcon.className = 'check-icon';
    checkIcon.style.width = sizeStyles.iconSize;
    checkIcon.style.height = sizeStyles.iconSize;
    checkIcon.style.border = `2px solid ${this.config.theme.background}`;
    checkIcon.style.borderTop = 'none';
    checkIcon.style.borderLeft = 'none';
    checkIcon.style.transform = 'rotate(45deg)';
    checkIcon.style.transition = 'all 0.3s ease';
    checkIcon.style.opacity = '0';

    // 라벨
    const label = document.createElement('label');
    label.htmlFor = this.id + '-input';
    label.textContent = this.config.label;
    label.style.fontSize = sizeStyles.fontSize;
    label.style.color = this.config.disabled ? this.config.theme.disabledText : this.config.theme.text;
    label.style.cursor = this.config.disabled ? 'not-allowed' : 'pointer';
    label.style.marginLeft = '8px';

    customCheckbox.appendChild(checkIcon);
    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(customCheckbox);
    container.appendChild(checkboxWrapper);
    container.appendChild(label);

    this.checkbox = checkbox;
    this.customCheckbox = customCheckbox;
    this.checkIcon = checkIcon;
    
    this.updateVisualState();
  }

  createSwitchElement(container, sizeStyles) {
    // 스위치 래퍼
    const switchWrapper = document.createElement('div');
    switchWrapper.className = 'switch-wrapper';
    switchWrapper.style.position = 'relative';
    switchWrapper.style.display = 'inline-flex';
    switchWrapper.style.alignItems = 'center';

    // 실제 체크박스 (숨김)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = this.id + '-input';
    checkbox.checked = this.config.checked;
    checkbox.disabled = this.config.disabled;
    checkbox.style.position = 'absolute';
    checkbox.style.opacity = '0';
    checkbox.style.pointerEvents = 'none';

    // 스위치 배경
    const switchBackground = document.createElement('div');
    switchBackground.className = 'switch-background';
    switchBackground.style.width = '40px';
    switchBackground.style.height = '20px';
    switchBackground.style.backgroundColor = this.config.checked ? this.config.theme.primary : this.config.theme.border;
    switchBackground.style.borderRadius = '10px';
    switchBackground.style.transition = 'all 0.3s ease';
    switchBackground.style.position = 'relative';
    switchBackground.style.opacity = this.config.disabled ? '0.6' : '1';

    // 스위치 썸
    const switchThumb = document.createElement('div');
    switchThumb.className = 'switch-thumb';
    switchThumb.style.width = '16px';
    switchThumb.style.height = '16px';
    switchThumb.style.backgroundColor = '#FFFFFF';
    switchThumb.style.borderRadius = '50%';
    switchThumb.style.position = 'absolute';
    switchThumb.style.top = '2px';
    switchThumb.style.left = this.config.checked ? '22px' : '2px';
    switchThumb.style.transition = 'all 0.3s ease';
    switchThumb.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

    // 라벨
    const label = document.createElement('label');
    label.htmlFor = this.id + '-input';
    label.textContent = this.config.label;
    label.style.fontSize = sizeStyles.fontSize;
    label.style.color = this.config.disabled ? this.config.theme.disabledText : this.config.theme.text;
    label.style.cursor = this.config.disabled ? 'not-allowed' : 'pointer';
    label.style.marginLeft = '12px';

    switchBackground.appendChild(switchThumb);
    switchWrapper.appendChild(checkbox);
    switchWrapper.appendChild(switchBackground);
    container.appendChild(switchWrapper);
    container.appendChild(label);

    this.checkbox = checkbox;
    this.switchBackground = switchBackground;
    this.switchThumb = switchThumb;
    
    this.updateVisualState();
  }

  bindEvents() {
    if (this.config.disabled) return;

    // 클릭 이벤트
    this.element.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleState();
    });

    // 체크박스 직접 변경 이벤트
    this.checkbox.addEventListener('change', (e) => {
      this.config.checked = e.target.checked;
      this.updateVisualState();
      
      if (this.config.onChange) {
        this.config.onChange(this.config.checked, e);
      }
    });

    // 포커스 이벤트
    this.checkbox.addEventListener('focus', (e) => {
      if (this.config.onFocus) {
        this.config.onFocus(e);
      }
    });

    // 블러 이벤트
    this.checkbox.addEventListener('blur', (e) => {
      if (this.config.onBlur) {
        this.config.onBlur(e);
      }
    });

    // 키보드 접근성
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleState();
      }
    });

    this.element.setAttribute('tabindex', '0');
  }

  toggleState() {
    if (this.config.disabled) return;

    this.config.checked = !this.config.checked;
    this.checkbox.checked = this.config.checked;
    this.updateVisualState();
    
    if (this.config.onChange) {
      this.config.onChange(this.config.checked);
    }
  }

  updateVisualState() {
    if (this.config.variant === 'switch') {
      this.updateSwitchState();
    } else {
      this.updateCheckboxState();
    }
  }

  updateCheckboxState() {
    if (!this.customCheckbox || !this.checkIcon) return;

    if (this.config.checked) {
      this.customCheckbox.style.backgroundColor = this.config.theme.primary;
      this.customCheckbox.style.borderColor = this.config.theme.primary;
      this.checkIcon.style.opacity = '1';
    } else {
      this.customCheckbox.style.backgroundColor = this.config.theme.background;
      this.customCheckbox.style.borderColor = this.config.theme.border;
      this.checkIcon.style.opacity = '0';
    }

    if (this.config.disabled) {
      this.customCheckbox.style.backgroundColor = this.config.theme.disabled;
      this.customCheckbox.style.borderColor = this.config.theme.disabled;
    }
  }

  updateSwitchState() {
    if (!this.switchBackground || !this.switchThumb) return;

    if (this.config.checked) {
      this.switchBackground.style.backgroundColor = this.config.theme.primary;
      this.switchThumb.style.left = '22px';
    } else {
      this.switchBackground.style.backgroundColor = this.config.theme.border;
      this.switchThumb.style.left = '2px';
    }
  }

  // 상태 설정 메서드
  setChecked(checked) {
    this.config.checked = checked;
    this.checkbox.checked = checked;
    this.updateVisualState();
  }

  // 상태 가져오기 메서드
  getChecked() {
    return this.config.checked;
  }

  // 비활성화/활성화 메서드
  setDisabled(disabled) {
    this.config.disabled = disabled;
    this.checkbox.disabled = disabled;
    this.element.style.cursor = disabled ? 'not-allowed' : 'pointer';
    
    const label = this.element.querySelector('label');
    if (label) {
      label.style.cursor = disabled ? 'not-allowed' : 'pointer';
      label.style.color = disabled ? this.config.theme.disabledText : this.config.theme.text;
    }
    
    this.updateVisualState();
  }

  // indeterminate 상태 설정
  setIndeterminate(indeterminate) {
    this.config.indeterminate = indeterminate;
    this.checkbox.indeterminate = indeterminate;
    
    if (indeterminate && this.checkIcon) {
      this.checkIcon.style.opacity = '1';
      this.checkIcon.style.transform = 'rotate(45deg) scale(0.5)';
    } else if (this.checkIcon) {
      this.checkIcon.style.transform = 'rotate(45deg)';
    }
  }

  // 라벨 설정
  setLabel(label) {
    this.config.label = label;
    const labelElement = this.element.querySelector('label');
    if (labelElement) {
      labelElement.textContent = label;
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
window.Check = Check; 