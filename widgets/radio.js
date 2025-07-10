// 라디오 버튼 컴포넌트
class Radio {
  constructor(options = {}) {
    // 기본 설정
    this.config = {
      id: null,
      name: 'radio-group',
      label: 'Radio Button',
      value: '',
      checked: false,
      disabled: false,
      size: 'medium', // 'small', 'medium', 'large'
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
    
    this.id = this.config.id || 'radio-' + Math.random().toString(36).substr(2, 9);
    this.element = null;
    this.radio = null;
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
        radioSize: '14px',
        fontSize: '12px',
        padding: '4px 8px',
        dotSize: '6px'
      },
      medium: {
        radioSize: '16px',
        fontSize: '14px',
        padding: '6px 12px',
        dotSize: '8px'
      },
      large: {
        radioSize: '20px',
        fontSize: '16px',
        padding: '8px 16px',
        dotSize: '10px'
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
    container.className = 'radio-container';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.userSelect = 'none';
    container.style.cursor = this.config.disabled ? 'not-allowed' : 'pointer';

    // 라디오 래퍼
    const radioWrapper = document.createElement('div');
    radioWrapper.className = 'radio-wrapper';
    radioWrapper.style.position = 'relative';
    radioWrapper.style.display = 'inline-flex';
    radioWrapper.style.alignItems = 'center';
    radioWrapper.style.justifyContent = 'center';

    // 실제 라디오 버튼 (숨김)
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = this.id + '-input';
    radio.name = this.config.name;
    radio.value = this.config.value;
    radio.checked = this.config.checked;
    radio.disabled = this.config.disabled;
    radio.style.position = 'absolute';
    radio.style.opacity = '0';
    radio.style.pointerEvents = 'none';

    // 커스텀 라디오 버튼
    const customRadio = document.createElement('div');
    customRadio.className = 'custom-radio';
    customRadio.style.width = sizeStyles.radioSize;
    customRadio.style.height = sizeStyles.radioSize;
    customRadio.style.border = `2px solid ${this.config.disabled ? this.config.theme.disabled : this.config.theme.border}`;
    customRadio.style.borderRadius = '50%';
    customRadio.style.backgroundColor = this.config.disabled ? this.config.theme.disabled : this.config.theme.background;
    customRadio.style.display = 'flex';
    customRadio.style.alignItems = 'center';
    customRadio.style.justifyContent = 'center';
    customRadio.style.transition = 'all 0.3s ease';
    customRadio.style.position = 'relative';

    // 라디오 점
    const radioDot = document.createElement('div');
    radioDot.className = 'radio-dot';
    radioDot.style.width = sizeStyles.dotSize;
    radioDot.style.height = sizeStyles.dotSize;
    radioDot.style.backgroundColor = this.config.theme.primary;
    radioDot.style.borderRadius = '50%';
    radioDot.style.transition = 'all 0.3s ease';
    radioDot.style.opacity = '0';
    radioDot.style.transform = 'scale(0)';

    // 라벨
    const label = document.createElement('label');
    label.htmlFor = this.id + '-input';
    label.textContent = this.config.label;
    label.style.fontSize = sizeStyles.fontSize;
    label.style.color = this.config.disabled ? this.config.theme.disabledText : this.config.theme.text;
    label.style.cursor = this.config.disabled ? 'not-allowed' : 'pointer';
    label.style.marginLeft = '8px';

    customRadio.appendChild(radioDot);
    radioWrapper.appendChild(radio);
    radioWrapper.appendChild(customRadio);
    container.appendChild(radioWrapper);
    container.appendChild(label);

    this.element = container;
    this.radio = radio;
    this.customRadio = customRadio;
    this.radioDot = radioDot;
    
    this.updateVisualState();
  }

  bindEvents() {
    if (this.config.disabled) return;

    // 클릭 이벤트
    this.element.addEventListener('click', (e) => {
      e.preventDefault();
      this.select();
    });

    // 라디오 직접 변경 이벤트
    this.radio.addEventListener('change', (e) => {
      this.config.checked = e.target.checked;
      this.updateVisualState();
      
      if (this.config.onChange) {
        this.config.onChange(this.config.checked, this.config.value, e);
      }
    });

    // 포커스 이벤트
    this.radio.addEventListener('focus', (e) => {
      if (this.config.onFocus) {
        this.config.onFocus(e);
      }
    });

    // 블러 이벤트
    this.radio.addEventListener('blur', (e) => {
      if (this.config.onBlur) {
        this.config.onBlur(e);
      }
    });

    // 키보드 접근성
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.select();
      }
    });

    this.element.setAttribute('tabindex', '0');
  }

  select() {
    if (this.config.disabled) return;

    // 같은 그룹의 다른 라디오 버튼들 해제
    const radios = document.querySelectorAll(`input[name="${this.config.name}"]`);
    radios.forEach(r => {
      r.checked = false;
      const container = document.getElementById(r.id.replace('-input', ''));
      if (container && container !== this.element) {
        const dot = container.querySelector('.radio-dot');
        if (dot) {
          dot.style.opacity = '0';
          dot.style.transform = 'scale(0)';
        }
      }
    });

    // 현재 라디오 버튼 선택
    this.config.checked = true;
    this.radio.checked = true;
    this.updateVisualState();
    
    if (this.config.onChange) {
      this.config.onChange(true, this.config.value);
    }
  }

  updateVisualState() {
    if (!this.customRadio || !this.radioDot) return;

    if (this.config.checked) {
      this.customRadio.style.borderColor = this.config.theme.primary;
      this.radioDot.style.opacity = '1';
      this.radioDot.style.transform = 'scale(1)';
    } else {
      this.customRadio.style.borderColor = this.config.theme.border;
      this.radioDot.style.opacity = '0';
      this.radioDot.style.transform = 'scale(0)';
    }

    if (this.config.disabled) {
      this.customRadio.style.backgroundColor = this.config.theme.disabled;
      this.customRadio.style.borderColor = this.config.theme.disabled;
    }
  }

  // 상태 설정 메서드
  setChecked(checked) {
    this.config.checked = checked;
    this.radio.checked = checked;
    this.updateVisualState();
  }

  // 상태 가져오기 메서드
  getChecked() {
    return this.config.checked;
  }

  // 값 가져오기 메서드
  getValue() {
    return this.config.value;
  }

  // 비활성화/활성화 메서드
  setDisabled(disabled) {
    this.config.disabled = disabled;
    this.radio.disabled = disabled;
    this.element.style.cursor = disabled ? 'not-allowed' : 'pointer';
    
    const label = this.element.querySelector('label');
    if (label) {
      label.style.cursor = disabled ? 'not-allowed' : 'pointer';
      label.style.color = disabled ? this.config.theme.disabledText : this.config.theme.text;
    }
    
    this.updateVisualState();
  }

  // 라벨 설정
  setLabel(label) {
    this.config.label = label;
    const labelElement = this.element.querySelector('label');
    if (labelElement) {
      labelElement.textContent = label;
    }
  }

  // 값 설정
  setValue(value) {
    this.config.value = value;
    this.radio.value = value;
  }

  // 그룹 이름 설정
  setName(name) {
    this.config.name = name;
    this.radio.name = name;
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

// 라디오 그룹 헬퍼 클래스
class RadioGroup {
  constructor(options = {}) {
    this.config = {
      name: 'radio-group',
      value: null,
      radios: [],
      onChange: null
    };

    this.updateConfig(options);
    this.radios = [];
    this.init();
  }

  updateConfig(options = {}) {
    this.config = {
      ...this.config,
      ...options
    };
  }

  init() {
    this.createRadios();
  }

  createRadios() {
    this.config.radios.forEach(radioConfig => {
      const radio = new Radio({
        ...radioConfig,
        name: this.config.name,
        checked: radioConfig.value === this.config.value,
        onChange: (checked, value) => {
          if (checked) {
            this.config.value = value;
            if (this.config.onChange) {
              this.config.onChange(value);
            }
          }
        }
      });
      this.radios.push(radio);
    });
  }

  // 선택된 값 가져오기
  getValue() {
    return this.config.value;
  }

  // 값 설정
  setValue(value) {
    this.config.value = value;
    this.radios.forEach(radio => {
      radio.setChecked(radio.getValue() === value);
    });
  }

  // 라디오 버튼들 반환
  getRadios() {
    return this.radios;
  }

  // 모든 라디오 버튼을 DOM에 추가
  appendTo(parent) {
    this.radios.forEach(radio => {
      radio.appendTo(parent);
    });
    return this;
  }

  // 모든 라디오 버튼 제거
  remove() {
    this.radios.forEach(radio => {
      radio.remove();
    });
  }
}

// 전역 함수로도 사용할 수 있도록 설정
window.Radio = Radio;
window.RadioGroup = RadioGroup; 