class Panel {
  constructor(options = {}) {
    // 기본 설정
    this.config = {
      position: {
        type: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'center-left', 'center-right', 'center'
        style: {} // 추가 스타일 객체
      },
      buttons: [], // 2차원 배열 형태의 버튼 구성
      theme: {
        primary: '#00BCD4', // cyan 컬러
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
    };

    // 설정 업데이트 메서드
    this.updateConfig(options);

    this.id = 'panel-' + Math.random().toString(36).substr(2, 9);
    this.init();
  }

  // 설정 업데이트 메서드 추가
  updateConfig(options = {}) {
    this.config = {
      ...this.config,
      ...options,
      position: {
        type: options.position?.type || this.config.position.type,
        style: { ...this.config.position.style, ...(options.position?.style || {}) }
      },
      theme: { ...this.config.theme, ...(options.theme || {}) },
      layout: { ...this.config.layout, ...(options.layout || {}) }
    };

    // 설정이 변경되면 패널 다시 렌더링
    if (document.getElementById(this.id)) {
      this.init();
    }
  }

  init() {
    this.createContainer();
    this.renderButtons();
  }

  createContainer() {
    const existingPanel = document.getElementById(this.id);
    if (existingPanel) {
      document.body.removeChild(existingPanel);
    }
    
    const container = document.createElement('div');
    container.id = this.id;
    container.style.position = 'fixed';
    container.style.zIndex = '9998';
    container.style.padding = this.config.layout.containerPadding;
    container.style.backgroundColor = this.config.theme.background;
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = this.config.layout.buttonGap;

    // 기본 위치 설정
    switch(this.config.position.type) {
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

    // 추가 스타일 적용
    Object.assign(container.style, this.config.position.style);

    document.body.appendChild(container);
  }

  createButtonRow(rowItems) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = this.config.layout.buttonGap;
    row.style.justifyContent = 'flex-end';

    rowItems?.forEach(item => {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.alignItems = 'center';
      buttonContainer.style.gap = '8px';
      buttonContainer.style.flex = 1;
      buttonContainer.style.width = 'auto';
      
      if (item.title) {
        const title = document.createElement('div');
        title.textContent = item.title;
        title.style.marginLeft = '16px';
        title.style.fontSize = '18px';
        title.style.fontWeight = 'bold';
        title.style.color = this.config.theme.text;
        title.style.whiteSpace = 'nowrap';
        buttonContainer.appendChild(title);
      }

      const controlContainer = document.createElement('div');
      controlContainer.style.minWidth = this.config.layout.minButtonWidth;
      controlContainer.style.height = this.config.layout.buttonHeight;
      controlContainer.style.display = 'flex';
      controlContainer.style.alignItems = 'center';
      controlContainer.style.justifyContent = 'flex-end';

      switch(item.type) {
        case 'none':
          const dummyContainer = document.createElement('div');
          dummyContainer.style.width = '100%';
          dummyContainer.style.height = '100%';
          dummyContainer.style.display = 'flex';
          dummyContainer.style.alignItems = 'center';
          dummyContainer.style.justifyContent = 'flex-end';
          
          if (item.label) {
            const span = document.createElement('span');
            span.textContent = item.label;
            span.style.color = this.config.theme.text;
            dummyContainer.appendChild(span);
          }
          
          controlContainer.appendChild(dummyContainer);
          break;

        case 'button':
          const button = document.createElement('button');
          button.textContent = item.label || '';
          button.style.width = '100%';
          button.style.height = '100%';
          button.style.borderRadius = '4px';
          button.style.border = 'none';
          button.style.cursor = 'pointer';
          button.style.backgroundColor = this.config.theme.primary;
          button.style.transition = 'all 0.3s';
          button.style.color = this.config.theme.text;
          
          button.onmouseover = () => {
            button.style.backgroundColor = this.config.theme.primaryHover;
            button.style.color = 'white';
          };
          
          button.onmouseout = () => {
            button.style.backgroundColor = this.config.theme.primary;
            button.style.color = this.config.theme.text;
          };
          
          button.onclick = item.onClick || (() => {});
          controlContainer.appendChild(button);
          break;

        case 'toggle':
          const toggleContainer = document.createElement('div');
          toggleContainer.style.width = '100%';
          toggleContainer.style.height = '100%';
          toggleContainer.style.display = 'flex';
          toggleContainer.style.alignItems = 'center';
          toggleContainer.style.justifyContent = 'flex-end';
          toggleContainer.style.padding = '0 8px';
          toggleContainer.style.border = 'none';
          
          const toggle = document.createElement('div');
          toggle.style.position = 'relative';
          toggle.style.width = '52px';
          toggle.style.height = '28px';
          toggle.style.backgroundColor = '#E0E0E0';
          toggle.style.borderRadius = '14px';
          toggle.style.cursor = 'pointer';
          toggle.style.transition = 'background-color 0.3s';
          toggle.style.border = 'none';
          
          const slider = document.createElement('div');
          slider.style.position = 'absolute';
          slider.style.width = '24px';
          slider.style.height = '24px';
          slider.style.backgroundColor = 'white';
          slider.style.borderRadius = '50%';
          slider.style.top = '2px';
          slider.style.left = '2px';
          slider.style.transition = 'left 0.3s';
          slider.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          slider.style.border = 'none';
          
          toggle.appendChild(slider);
          toggleContainer.appendChild(toggle);
          controlContainer.appendChild(toggleContainer);

          let isToggled = false;
          toggle.onclick = () => {
            isToggled = !isToggled;
            toggle.style.backgroundColor = isToggled ? this.config.theme.primary : '#E0E0E0';
            slider.style.left = isToggled ? '26px' : '2px';
            if (item.onChange) item.onChange(isToggled);
          };
          break;

        case 'check':
          const checkContainer = document.createElement('div');
          checkContainer.style.width = '100%';
          checkContainer.style.height = '100%';
          checkContainer.style.display = 'flex';
          checkContainer.style.alignItems = 'center';
          checkContainer.style.padding = '0 8px';
          checkContainer.style.borderRadius = '4px';
          
          const label = document.createElement('label');
          label.style.display = 'flex';
          label.style.alignItems = 'center';
          label.style.cursor = 'pointer';
          label.style.width = '100%';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.style.width = '18px';
          checkbox.style.height = '18px';
          checkbox.style.marginRight = '8px';
          checkbox.style.accentColor = this.config.theme.primary;
          
          label.appendChild(checkbox);
          if (item.label) {
            const span = document.createElement('span');
            span.textContent = item.label;
            span.style.color = this.config.theme.text;
            label.appendChild(span);
          }
          
          checkbox.onchange = (e) => {
            if (item.onChange) item.onChange(e.target.checked);
          };
          
          checkContainer.appendChild(label);
          controlContainer.appendChild(checkContainer);
          break;
      }

      buttonContainer.appendChild(controlContainer);
      row.appendChild(buttonContainer);
    });

    return row;
  }

  renderButtons() {
    const container = document.getElementById(this.id);
    if (!container) return;

    container.innerHTML = '';
    this.config.buttons.forEach(rowItems => {
      container.appendChild(this.createButtonRow(rowItems));
    });
  }

  destroy() {
    const panel = document.getElementById(this.id);
    if (panel) {
      document.body.removeChild(panel);
    }
  }
} 