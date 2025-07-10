// 슬라이더 컴포넌트
class Slider {
  constructor(options = {}) {
    // 기본 설정
    this.config = {
      id: null,
      min: 0,
      max: 100,
      value: 50,
      step: 1,
      range: false, // true면 범위 선택, false면 단일 값
      rangeValues: [25, 75], // 범위 선택시 사용
      disabled: false,
      showValue: true,
      showTooltip: true,
      orientation: 'horizontal', // 'horizontal', 'vertical'
      size: 'medium', // 'small', 'medium', 'large'
      theme: {
        primary: '#00BCD4',
        primaryHover: '#0097A7',
        background: '#E9ECEF',
        track: '#DEE2E6',
        thumb: '#FFFFFF',
        text: '#333333',
        disabled: '#F5F5F5',
        disabledText: '#999999'
      },
      onChange: null,
      onInput: null,
      onFocus: null,
      onBlur: null
    };

    // 설정 업데이트
    this.updateConfig(options);
    
    this.id = this.config.id || 'slider-' + Math.random().toString(36).substr(2, 9);
    this.element = null;
    this.sliders = [];
    this.isDragging = false;
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
        trackHeight: '4px',
        thumbSize: '16px',
        fontSize: '12px',
        padding: '8px 0'
      },
      medium: {
        trackHeight: '6px',
        thumbSize: '20px',
        fontSize: '14px',
        padding: '12px 0'
      },
      large: {
        trackHeight: '8px',
        thumbSize: '24px',
        fontSize: '16px',
        padding: '16px 0'
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
    container.className = 'slider-container';
    container.style.display = 'flex';
    container.style.flexDirection = this.config.orientation === 'vertical' ? 'column' : 'row';
    container.style.alignItems = 'center';
    container.style.gap = '12px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.userSelect = 'none';
    container.style.padding = sizeStyles.padding;

    // 슬라이더 래퍼
    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'slider-wrapper';
    sliderWrapper.style.position = 'relative';
    sliderWrapper.style.flex = '1';
    sliderWrapper.style.display = 'flex';
    sliderWrapper.style.alignItems = 'center';
    sliderWrapper.style.minHeight = this.config.orientation === 'vertical' ? '200px' : 'auto';

    // 트랙 생성
    const track = document.createElement('div');
    track.className = 'slider-track';
    track.style.position = 'relative';
    track.style.width = this.config.orientation === 'vertical' ? sizeStyles.trackHeight : '100%';
    track.style.height = this.config.orientation === 'vertical' ? '100%' : sizeStyles.trackHeight;
    track.style.backgroundColor = this.config.theme.track;
    track.style.borderRadius = this.config.orientation === 'vertical' ? `${sizeStyles.trackHeight}px` : `${sizeStyles.trackHeight}px`;
    track.style.cursor = this.config.disabled ? 'not-allowed' : 'pointer';

    // 활성 트랙 (선택된 범위 표시)
    const activeTrack = document.createElement('div');
    activeTrack.className = 'slider-active-track';
    activeTrack.style.position = 'absolute';
    activeTrack.style.backgroundColor = this.config.theme.primary;
    activeTrack.style.borderRadius = this.config.orientation === 'vertical' ? `${sizeStyles.trackHeight}px` : `${sizeStyles.trackHeight}px`;
    activeTrack.style.transition = 'all 0.3s ease';

    if (this.config.orientation === 'vertical') {
      activeTrack.style.width = '100%';
      activeTrack.style.bottom = '0';
    } else {
      activeTrack.style.height = '100%';
      activeTrack.style.left = '0';
    }

    // 슬라이더 생성
    if (this.config.range) {
      this.createRangeSliders(track, activeTrack, sizeStyles);
    } else {
      this.createSingleSlider(track, activeTrack, sizeStyles);
    }

    track.appendChild(activeTrack);
    sliderWrapper.appendChild(track);
    container.appendChild(sliderWrapper);

    // 값 표시
    if (this.config.showValue) {
      const valueDisplay = document.createElement('div');
      valueDisplay.className = 'slider-value';
      valueDisplay.style.fontSize = sizeStyles.fontSize;
      valueDisplay.style.color = this.config.theme.text;
      valueDisplay.style.minWidth = '40px';
      valueDisplay.style.textAlign = 'center';
      
      if (this.config.range) {
        valueDisplay.textContent = `${this.config.rangeValues[0]} - ${this.config.rangeValues[1]}`;
      } else {
        valueDisplay.textContent = this.config.value;
      }
      
      container.appendChild(valueDisplay);
      this.valueDisplay = valueDisplay;
    }

    this.element = container;
    this.track = track;
    this.activeTrack = activeTrack;
    
    this.updateActiveTrack();
  }

  createSingleSlider(track, activeTrack, sizeStyles) {
    const slider = this.createSliderElement(sizeStyles);
    slider.value = this.config.value;
    slider.min = this.config.min;
    slider.max = this.config.max;
    slider.step = this.config.step;
    slider.disabled = this.config.disabled;
    
    track.appendChild(slider);
    this.sliders = [slider];
  }

  createRangeSliders(track, activeTrack, sizeStyles) {
    const slider1 = this.createSliderElement(sizeStyles);
    const slider2 = this.createSliderElement(sizeStyles);
    
    slider1.value = this.config.rangeValues[0];
    slider2.value = this.config.rangeValues[1];
    slider1.min = this.config.min;
    slider2.min = this.config.min;
    slider1.max = this.config.max;
    slider2.max = this.config.max;
    slider1.step = this.config.step;
    slider2.step = this.config.step;
    slider1.disabled = this.config.disabled;
    slider2.disabled = this.config.disabled;
    
    track.appendChild(slider1);
    track.appendChild(slider2);
    this.sliders = [slider1, slider2];
  }

  createSliderElement(sizeStyles) {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'slider-input';
    slider.style.position = 'absolute';
    slider.style.width = '100%';
    slider.style.height = '100%';
    slider.style.background = 'transparent';
    slider.style.outline = 'none';
    slider.style.pointerEvents = 'auto';
    slider.style.appearance = 'none';
    slider.style.webkitAppearance = 'none';
    slider.style.mozAppearance = 'none';
    slider.style.cursor = this.config.disabled ? 'not-allowed' : 'pointer';
    slider.style.zIndex = '2';

    // 썸 스타일
    const thumbSize = sizeStyles.thumbSize;
    slider.style.setProperty('--thumb-size', thumbSize);
    
    // CSS 스타일 추가
    if (!document.getElementById('slider-style')) {
      const style = document.createElement('style');
      style.id = 'slider-style';
      style.textContent = `
        .slider-input::-webkit-slider-thumb {
          appearance: none;
          width: var(--thumb-size);
          height: var(--thumb-size);
          background: #FFFFFF;
          border: 2px solid #00BCD4;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .slider-input::-moz-range-thumb {
          width: var(--thumb-size);
          height: var(--thumb-size);
          background: #FFFFFF;
          border: 2px solid #00BCD4;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        .slider-input::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .slider-input::-ms-thumb {
          width: var(--thumb-size);
          height: var(--thumb-size);
          background: #FFFFFF;
          border: 2px solid #00BCD4;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider-input::-webkit-slider-track {
          background: transparent;
        }
        .slider-input::-moz-range-track {
          background: transparent;
        }
        .slider-input::-ms-track {
          background: transparent;
        }
      `;
      document.head.appendChild(style);
    }

    return slider;
  }

  bindEvents() {
    this.sliders.forEach((slider, index) => {
      // 입력 이벤트
      slider.addEventListener('input', (e) => {
        this.handleInput(e, index);
      });

      // 변경 이벤트
      slider.addEventListener('change', (e) => {
        this.handleChange(e, index);
      });

      // 포커스 이벤트
      slider.addEventListener('focus', (e) => {
        if (this.config.onFocus) {
          this.config.onFocus(e);
        }
      });

      // 블러 이벤트
      slider.addEventListener('blur', (e) => {
        if (this.config.onBlur) {
          this.config.onBlur(e);
        }
      });
    });
  }

  handleInput(e, index) {
    const value = parseFloat(e.target.value);
    
    if (this.config.range) {
      this.config.rangeValues[index] = value;
      
      // 범위 슬라이더에서 값 순서 보장
      if (index === 0 && value > this.config.rangeValues[1]) {
        this.config.rangeValues[0] = this.config.rangeValues[1];
        this.sliders[0].value = this.config.rangeValues[1];
      } else if (index === 1 && value < this.config.rangeValues[0]) {
        this.config.rangeValues[1] = this.config.rangeValues[0];
        this.sliders[1].value = this.config.rangeValues[0];
      }
    } else {
      this.config.value = value;
    }

    this.updateActiveTrack();
    this.updateValueDisplay();
    
    if (this.config.onInput) {
      this.config.onInput(this.config.range ? this.config.rangeValues : this.config.value, e);
    }
  }

  handleChange(e, index) {
    if (this.config.onChange) {
      this.config.onChange(this.config.range ? this.config.rangeValues : this.config.value, e);
    }
  }

  updateActiveTrack() {
    if (!this.activeTrack) return;

    const min = this.config.min;
    const max = this.config.max;
    const range = max - min;

    if (this.config.range) {
      const start = ((this.config.rangeValues[0] - min) / range) * 100;
      const end = ((this.config.rangeValues[1] - min) / range) * 100;
      
      if (this.config.orientation === 'vertical') {
        this.activeTrack.style.bottom = `${start}%`;
        this.activeTrack.style.height = `${end - start}%`;
      } else {
        this.activeTrack.style.left = `${start}%`;
        this.activeTrack.style.width = `${end - start}%`;
      }
    } else {
      const position = ((this.config.value - min) / range) * 100;
      
      if (this.config.orientation === 'vertical') {
        this.activeTrack.style.bottom = '0';
        this.activeTrack.style.height = `${position}%`;
      } else {
        this.activeTrack.style.left = '0';
        this.activeTrack.style.width = `${position}%`;
      }
    }
  }

  updateValueDisplay() {
    if (!this.valueDisplay) return;

    if (this.config.range) {
      this.valueDisplay.textContent = `${this.config.rangeValues[0]} - ${this.config.rangeValues[1]}`;
    } else {
      this.valueDisplay.textContent = this.config.value;
    }
  }

  // 값 설정 메서드
  setValue(value) {
    if (this.config.range) {
      if (Array.isArray(value) && value.length === 2) {
        this.config.rangeValues = value;
        this.sliders[0].value = value[0];
        this.sliders[1].value = value[1];
      }
    } else {
      this.config.value = value;
      this.sliders[0].value = value;
    }
    
    this.updateActiveTrack();
    this.updateValueDisplay();
  }

  // 값 가져오기 메서드
  getValue() {
    return this.config.range ? this.config.rangeValues : this.config.value;
  }

  // 비활성화/활성화 메서드
  setDisabled(disabled) {
    this.config.disabled = disabled;
    this.sliders.forEach(slider => {
      slider.disabled = disabled;
      slider.style.cursor = disabled ? 'not-allowed' : 'pointer';
    });
    
    if (this.track) {
      this.track.style.cursor = disabled ? 'not-allowed' : 'pointer';
    }
  }

  // 최소값 설정
  setMin(min) {
    this.config.min = min;
    this.sliders.forEach(slider => {
      slider.min = min;
    });
    this.updateActiveTrack();
  }

  // 최대값 설정
  setMax(max) {
    this.config.max = max;
    this.sliders.forEach(slider => {
      slider.max = max;
    });
    this.updateActiveTrack();
  }

  // 단계 설정
  setStep(step) {
    this.config.step = step;
    this.sliders.forEach(slider => {
      slider.step = step;
    });
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
window.Slider = Slider; 