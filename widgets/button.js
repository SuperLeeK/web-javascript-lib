/**
 * 버튼 컴포넌트 클래스
 * 
 * 커스터마이징 가능한 버튼 컴포넌트를 생성하고 관리합니다.
 * 다양한 variant, size, 아이콘, 로딩 상태 등을 지원합니다.
 * 
 * @class Button
 * 
 * @example
 * // 기본 버튼 생성
 * const button = new Button({
 *   text: '클릭하세요',
 *   onClick: () => console.log('클릭됨')
 * });
 * button.appendTo('#container');
 * 
 * @example
 * // 아이콘과 함께 버튼 생성
 * const button = new Button({
 *   text: '저장',
 *   icon: '💾',
 *   iconPosition: 'left',
 *   variant: 'success',
 *   size: 'large',
 *   onClick: () => saveData()
 * });
 * button.appendTo(document.body);ㅂ
 * 
 * @example
 * // 로딩 상태가 있는 버튼
 * const button = new Button({
 *   text: '제출',
 *   variant: 'primary',
 *   loading: true,
 *   onClick: () => submitForm()
 * });
 * button.appendTo('#form-container');
 */
class Button {
  /**
   * Button 인스턴스를 생성합니다.
   * 
   * @param {Object} [options={}] - 버튼 설정 옵션
   * @param {string} [options.id] - 버튼의 고유 ID (지정하지 않으면 자동 생성)
   * @param {string} [options.text='Button'] - 버튼에 표시될 텍스트
   * @param {string} [options.type='button'] - 버튼 타입 ('button', 'submit', 'reset')
   * @param {string} [options.variant='primary'] - 버튼 스타일 변형 ('primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline-primary', 'outline-secondary' 등)
   * @param {string} [options.size='medium'] - 버튼 크기 ('small', 'medium', 'large')
   * @param {boolean} [options.disabled=false] - 버튼 비활성화 여부
   * @param {boolean} [options.loading=false] - 로딩 상태 표시 여부
   * @param {string|null} [options.icon=null] - 아이콘 텍스트 또는 HTML
   * @param {string} [options.iconPosition='left'] - 아이콘 위치 ('left', 'right')
   * @param {boolean} [options.fullWidth=false] - 전체 너비 사용 여부
   * @param {boolean} [options.rounded=false] - 둥근 모서리 여부
   * @param {Object} [options.theme] - 테마 색상 설정 (기본값 사용 가능)
   * @param {Function} [options.onClick] - 클릭 이벤트 핸들러
   * @param {Function} [options.onMouseEnter] - 마우스 진입 이벤트 핸들러
   * @param {Function} [options.onMouseLeave] - 마우스 이탈 이벤트 핸들러
   * 
   * @example
   * const button = new Button({
   *   text: '저장',
   *   variant: 'success',
   *   size: 'large',
   *   icon: '💾',
   *   onClick: () => {
   *     console.log('저장됨');
   *   }
   * });
   */
  constructor(options = {}) {
    // 기본 설정
    this.config = {
      id: null,
      text: 'Button',
      type: 'button', // 'button', 'submit', 'reset'
      variant: 'primary', // 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline'
      size: 'medium', // 'small', 'medium', 'large'
      disabled: false,
      loading: false,
      icon: null, // 아이콘 텍스트 또는 HTML
      iconPosition: 'left', // 'left', 'right'
      fullWidth: false,
      rounded: false,
      theme: {
        primary: '#00BCD4',
        primaryHover: '#0097A7',
        secondary: '#6C757D',
        secondaryHover: '#5A6268',
        success: '#28A745',
        successHover: '#218838',
        danger: '#DC3545',
        dangerHover: '#C82333',
        warning: '#FFC107',
        warningHover: '#E0A800',
        info: '#17A2B8',
        infoHover: '#138496',
        light: '#F8F9FA',
        lightHover: '#E2E6EA',
        dark: '#343A40',
        darkHover: '#23272B',
        text: '#FFFFFF',
        textDark: '#212529',
        border: '#DEE2E6'
      },
      onClick: null,
      onMouseEnter: null,
      onMouseLeave: null
    };

    // 설정 업데이트
    this.updateConfig(options);
    
    this.id = this.config.id || 'button-' + Math.random().toString(36).substr(2, 9);
    this.element = null;
    this.init();
  }

  /**
   * 버튼 설정을 업데이트합니다.
   * 
   * @param {Object} [options={}] - 업데이트할 설정 옵션
   * @param {Object} [options.theme] - 테마 색상 설정 (기존 테마와 병합됨)
   * 
   * @example
   * button.updateConfig({
   *   text: '새로운 텍스트',
   *   variant: 'danger',
   *   theme: {
   *     primary: '#FF0000'
   *   }
   * });
   */
  updateConfig(options = {}) {
    this.config = {
      ...this.config,
      ...options,
      theme: { ...this.config.theme, ...(options.theme || {}) }
    };
  }

  /**
   * 현재 크기에 맞는 스타일 객체를 반환합니다.
   * 
   * @returns {Object} 크기별 스타일 객체 (padding, fontSize, borderRadius, iconSize)
   * @private
   */
  getSizeStyles() {
    const sizes = {
      small: {
        padding: '6px 12px',
        fontSize: '12px',
        borderRadius: '4px',
        iconSize: '14px'
      },
      medium: {
        padding: '8px 16px',
        fontSize: '14px',
        borderRadius: '6px',
        iconSize: '16px'
      },
      large: {
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: '8px',
        iconSize: '18px'
      }
    };
    return sizes[this.config.size] || sizes.medium;
  }

  /**
   * 현재 variant에 맞는 스타일 객체를 반환합니다.
   * 
   * @returns {Object} variant별 스타일 객체 (backgroundColor, color, borderColor, hoverBackground 등)
   * @private
   */
  getVariantStyles() {
    const isOutline = this.config.variant.startsWith('outline');
    const baseVariant = isOutline ? this.config.variant.replace('outline-', '') : this.config.variant;
    
    const variants = {
      primary: {
        backgroundColor: this.config.theme.primary,
        color: this.config.theme.text,
        borderColor: this.config.theme.primary,
        hoverBackground: this.config.theme.primaryHover,
        hoverColor: this.config.theme.text,
        hoverBorderColor: this.config.theme.primaryHover
      },
      secondary: {
        backgroundColor: this.config.theme.secondary,
        color: this.config.theme.text,
        borderColor: this.config.theme.secondary,
        hoverBackground: this.config.theme.secondaryHover,
        hoverColor: this.config.theme.text,
        hoverBorderColor: this.config.theme.secondaryHover
      },
      success: {
        backgroundColor: this.config.theme.success,
        color: this.config.theme.text,
        borderColor: this.config.theme.success,
        hoverBackground: this.config.theme.successHover,
        hoverColor: this.config.theme.text,
        hoverBorderColor: this.config.theme.successHover
      },
      danger: {
        backgroundColor: this.config.theme.danger,
        color: this.config.theme.text,
        borderColor: this.config.theme.danger,
        hoverBackground: this.config.theme.dangerHover,
        hoverColor: this.config.theme.text,
        hoverBorderColor: this.config.theme.dangerHover
      },
      warning: {
        backgroundColor: this.config.theme.warning,
        color: this.config.theme.textDark,
        borderColor: this.config.theme.warning,
        hoverBackground: this.config.theme.warningHover,
        hoverColor: this.config.theme.textDark,
        hoverBorderColor: this.config.theme.warningHover
      },
      info: {
        backgroundColor: this.config.theme.info,
        color: this.config.theme.text,
        borderColor: this.config.theme.info,
        hoverBackground: this.config.theme.infoHover,
        hoverColor: this.config.theme.text,
        hoverBorderColor: this.config.theme.infoHover
      },
      light: {
        backgroundColor: this.config.theme.light,
        color: this.config.theme.textDark,
        borderColor: this.config.theme.light,
        hoverBackground: this.config.theme.lightHover,
        hoverColor: this.config.theme.textDark,
        hoverBorderColor: this.config.theme.lightHover
      },
      dark: {
        backgroundColor: this.config.theme.dark,
        color: this.config.theme.text,
        borderColor: this.config.theme.dark,
        hoverBackground: this.config.theme.darkHover,
        hoverColor: this.config.theme.text,
        hoverBorderColor: this.config.theme.darkHover
      }
    };

    const style = variants[baseVariant] || variants.primary;

    if (isOutline) {
      return {
        backgroundColor: 'transparent',
        color: style.backgroundColor,
        borderColor: style.backgroundColor,
        hoverBackground: style.backgroundColor,
        hoverColor: style.color,
        hoverBorderColor: style.backgroundColor
      };
    }

    return style;
  }

  /**
   * 버튼 요소를 초기화합니다.
   * 요소를 생성하고 이벤트를 바인딩합니다.
   * 
   * @private
   */
  init() {
    this.createElement();
    this.bindEvents();
  }

  /**
   * 버튼 DOM 요소를 생성합니다.
   * 
   * @returns {HTMLButtonElement} 생성된 버튼 요소
   * @private
   */
  createElement() {
    const sizeStyles = this.getSizeStyles();
    const variantStyles = this.getVariantStyles();
    
    // 버튼 요소 생성
    const button = document.createElement('button');
    button.id = this.id;
    button.type = this.config.type;
    button.className = 'custom-button';
    
    // 기본 스타일 설정
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.gap = '8px';
    button.style.padding = sizeStyles.padding;
    button.style.fontSize = sizeStyles.fontSize;
    button.style.fontWeight = '500';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.border = `1px solid ${variantStyles.borderColor}`;
    button.style.borderRadius = this.config.rounded ? '50px' : sizeStyles.borderRadius;
    button.style.backgroundColor = variantStyles.backgroundColor;
    button.style.color = variantStyles.color;
    button.style.cursor = this.config.disabled ? 'not-allowed' : 'pointer';
    button.style.transition = 'all 0.3s ease';
    button.style.outline = 'none';
    button.style.userSelect = 'none';
    button.style.whiteSpace = 'nowrap';
    button.style.width = this.config.fullWidth ? '100%' : 'auto';
    button.style.opacity = this.config.disabled ? '0.6' : '1';

    // 아이콘 생성
    if (this.config.icon) {
      const icon = document.createElement('span');
      icon.className = 'button-icon';
      icon.style.fontSize = sizeStyles.iconSize;
      icon.style.display = 'inline-flex';
      icon.style.alignItems = 'center';
      
      if (this.config.icon.startsWith('<')) {
        icon.innerHTML = this.config.icon;
      } else {
        icon.textContent = this.config.icon;
      }
      
      if (this.config.iconPosition === 'left') {
        button.appendChild(icon);
      }
    }

    // 텍스트 생성
    const text = document.createElement('span');
    text.className = 'button-text';
    text.textContent = this.config.text;
    button.appendChild(text);

    // 오른쪽 아이콘 추가
    if (this.config.icon && this.config.iconPosition === 'right') {
      const icon = document.createElement('span');
      icon.className = 'button-icon';
      icon.style.fontSize = sizeStyles.iconSize;
      icon.style.display = 'inline-flex';
      icon.style.alignItems = 'center';
      
      if (this.config.icon.startsWith('<')) {
        icon.innerHTML = this.config.icon;
      } else {
        icon.textContent = this.config.icon;
      }
      
      button.appendChild(icon);
    }

    // 로딩 상태 표시
    if (this.config.loading) {
      this.showLoading(button);
    }

    this.element = button;
    this.variantStyles = variantStyles;
    
    return button;
  }

  /**
   * 버튼에 이벤트 리스너를 바인딩합니다.
   * 클릭, 마우스 이벤트, 키보드 접근성을 지원합니다.
   * 
   * @private
   */
  bindEvents() {
    if (this.config.disabled) return;

    // 클릭 이벤트
    this.element.addEventListener('click', (e) => {
      if (this.config.onClick) {
        this.config.onClick(e);
      }
    });

    // 마우스 이벤트
    this.element.addEventListener('mouseenter', (e) => {
      if (!this.config.disabled && !this.config.loading) {
        this.element.style.backgroundColor = this.variantStyles.hoverBackground;
        this.element.style.color = this.variantStyles.hoverColor;
        this.element.style.borderColor = this.variantStyles.hoverBorderColor;
      }
      
      if (this.config.onMouseEnter) {
        this.config.onMouseEnter(e);
      }
    });

    this.element.addEventListener('mouseleave', (e) => {
      if (!this.config.disabled && !this.config.loading) {
        this.element.style.backgroundColor = this.variantStyles.backgroundColor;
        this.element.style.color = this.variantStyles.color;
        this.element.style.borderColor = this.variantStyles.borderColor;
      }
      
      if (this.config.onMouseLeave) {
        this.config.onMouseLeave(e);
      }
    });

    // 키보드 접근성
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.config.onClick) {
          this.config.onClick(e);
        }
      }
    });
  }

  /**
   * 버튼에 로딩 스피너를 표시합니다.
   * 
   * @param {HTMLButtonElement} button - 로딩 스피너를 표시할 버튼 요소
   * @private
   */
  showLoading(button) {
    // 기존 내용 제거
    button.innerHTML = '';
    
    // 로딩 스피너 생성
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.style.width = '16px';
    spinner.style.height = '16px';
    spinner.style.border = '2px solid transparent';
    spinner.style.borderTop = '2px solid currentColor';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    
    // 애니메이션 스타일 추가
    if (!document.getElementById('button-spinner-style')) {
      const style = document.createElement('style');
      style.id = 'button-spinner-style';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    button.appendChild(spinner);
  }

  /**
   * 버튼의 텍스트를 설정합니다.
   * 
   * @param {string} text - 설정할 텍스트
   * 
   * @example
   * button.setText('새로운 텍스트');
   */
  setText(text) {
    this.config.text = text;
    const textElement = this.element.querySelector('.button-text');
    if (textElement) {
      textElement.textContent = text;
    }
  }

  /**
   * 버튼의 아이콘을 설정합니다.
   * 
   * @param {string} icon - 아이콘 텍스트 또는 HTML
   * @param {string} [position='left'] - 아이콘 위치 ('left', 'right')
   * 
   * @example
   * button.setIcon('⭐', 'right');
   */
  setIcon(icon, position = 'left') {
    this.config.icon = icon;
    this.config.iconPosition = position;
    this.init(); // 요소 재생성
  }

  /**
   * 버튼의 로딩 상태를 설정합니다.
   * 
   * @param {boolean} loading - 로딩 상태 (true: 로딩 표시, false: 일반 상태)
   * 
   * @example
   * button.setLoading(true);  // 로딩 시작
   * // 비동기 작업 수행
   * button.setLoading(false); // 로딩 종료
   */
  setLoading(loading) {
    this.config.loading = loading;
    if (loading) {
      this.showLoading(this.element);
    } else {
      this.init(); // 요소 재생성
    }
  }

  /**
   * 버튼의 비활성화 상태를 설정합니다.
   * 
   * @param {boolean} disabled - 비활성화 여부 (true: 비활성화, false: 활성화)
   * 
   * @example
   * button.setDisabled(true);  // 버튼 비활성화
   * button.setDisabled(false); // 버튼 활성화
   */
  setDisabled(disabled) {
    this.config.disabled = disabled;
    this.element.disabled = disabled;
    this.element.style.cursor = disabled ? 'not-allowed' : 'pointer';
    this.element.style.opacity = disabled ? '0.6' : '1';
  }

  /**
   * 버튼의 variant(스타일 변형)를 변경합니다.
   * 
   * @param {string} variant - 새로운 variant ('primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline-primary' 등)
   * 
   * @example
   * button.setVariant('danger');
   * button.setVariant('outline-primary');
   */
  setVariant(variant) {
    this.config.variant = variant;
    this.init(); // 요소 재생성
  }

  /**
   * 버튼의 크기를 변경합니다.
   * 
   * @param {string} size - 새로운 크기 ('small', 'medium', 'large')
   * 
   * @example
   * button.setSize('large');
   */
  setSize(size) {
    this.config.size = size;
    this.init(); // 요소 재생성
  }

  /**
   * 버튼을 지정된 부모 요소에 추가합니다.
   * 
   * @param {string|HTMLElement} parent - 부모 요소의 셀렉터 또는 HTMLElement
   * @returns {Button} 메서드 체이닝을 위한 자기 자신 반환
   * 
   * @example
   * // 셀렉터로 추가
   * button.appendTo('#container');
   * 
   * @example
   * // HTMLElement로 추가
   * button.appendTo(document.body);
   * 
   * @example
   * // 메서드 체이닝
   * button.setText('저장').setVariant('success').appendTo('#form');
   */
  appendTo(parent) {
    if (typeof parent === 'string') {
      parent = document.querySelector(parent);
    }
    parent.appendChild(this.element);
    return this;
  }

  /**
   * 버튼을 DOM에서 제거합니다.
   * 
   * @example
   * button.remove();
   */
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * 버튼의 DOM 요소를 반환합니다.
   * 
   * @returns {HTMLButtonElement} 버튼 DOM 요소
   * 
   * @example
   * const buttonElement = button.getElement();
   * buttonElement.addEventListener('customEvent', handler);
   */
  getElement() {
    return this.element;
  }
}

// 전역 함수로도 사용할 수 있도록 설정
window.Button = Button; 