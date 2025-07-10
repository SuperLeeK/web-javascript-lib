// 버튼 컴포넌트
class Button {
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

  // 변형에 따른 스타일 설정
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

  init() {
    this.createElement();
    this.bindEvents();
  }

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

  // 텍스트 설정
  setText(text) {
    this.config.text = text;
    const textElement = this.element.querySelector('.button-text');
    if (textElement) {
      textElement.textContent = text;
    }
  }

  // 아이콘 설정
  setIcon(icon, position = 'left') {
    this.config.icon = icon;
    this.config.iconPosition = position;
    this.init(); // 요소 재생성
  }

  // 로딩 상태 설정
  setLoading(loading) {
    this.config.loading = loading;
    if (loading) {
      this.showLoading(this.element);
    } else {
      this.init(); // 요소 재생성
    }
  }

  // 비활성화/활성화
  setDisabled(disabled) {
    this.config.disabled = disabled;
    this.element.disabled = disabled;
    this.element.style.cursor = disabled ? 'not-allowed' : 'pointer';
    this.element.style.opacity = disabled ? '0.6' : '1';
  }

  // 변형 변경
  setVariant(variant) {
    this.config.variant = variant;
    this.init(); // 요소 재생성
  }

  // 크기 변경
  setSize(size) {
    this.config.size = size;
    this.init(); // 요소 재생성
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
window.Button = Button; 