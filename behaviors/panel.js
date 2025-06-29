const Panel = {
  config: {
    position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'
    buttons: [], // 2차원 배열 형태의 버튼 구성
    gap: '10px', // 버튼 간격
    buttonWidth: '120px', // 버튼 기본 너비
  },

  init: function(options = {}) {
    this.config = { ...this.config, ...options };
    this.createContainer();
    this.renderButtons();
  },

  createContainer: function() {
    if (document.getElementById('panel-container')) {
      document.body.removeChild(document.getElementById('panel-container'));
    }
    
    const container = document.createElement('div');
    container.id = 'panel-container';
    container.style.position = 'fixed';
    container.style.zIndex = '9998';
    container.style.padding = '20px';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = this.config.gap;

    // 위치 설정
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
    }

    document.body.appendChild(container);
  },

  createButtonRow: function(rowItems) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = this.config.gap;

    rowItems.forEach(item => {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.flex = '1';
      
      if (item.title) {
        const title = document.createElement('div');
        title.textContent = item.title;
        title.style.marginBottom = '5px';
        title.style.fontSize = '12px';
        title.style.color = '#666';
        buttonContainer.appendChild(title);
      }

      switch(item.type) {
        case 'button':
          const button = document.createElement('button');
          button.textContent = item.label || '';
          button.style.width = '100%';
          button.style.padding = '8px';
          button.style.border = '1px solid #ddd';
          button.style.borderRadius = '4px';
          button.style.cursor = 'pointer';
          button.onclick = item.onClick || (() => {});
          buttonContainer.appendChild(button);
          break;

        case 'toggle':
          const toggle = document.createElement('div');
          toggle.style.position = 'relative';
          toggle.style.width = '50px';
          toggle.style.height = '24px';
          toggle.style.backgroundColor = '#ddd';
          toggle.style.borderRadius = '12px';
          toggle.style.cursor = 'pointer';
          toggle.style.transition = 'background-color 0.3s';
          
          const slider = document.createElement('div');
          slider.style.position = 'absolute';
          slider.style.width = '20px';
          slider.style.height = '20px';
          slider.style.backgroundColor = 'white';
          slider.style.borderRadius = '50%';
          slider.style.top = '2px';
          slider.style.left = '2px';
          slider.style.transition = 'left 0.3s';
          
          toggle.appendChild(slider);
          buttonContainer.appendChild(toggle);

          let isToggled = false;
          toggle.onclick = () => {
            isToggled = !isToggled;
            toggle.style.backgroundColor = isToggled ? '#1890ff' : '#ddd';
            slider.style.left = isToggled ? '28px' : '2px';
            if (item.onChange) item.onChange(isToggled);
          };
          break;

        case 'check':
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.style.marginRight = '8px';
          
          const label = document.createElement('label');
          label.appendChild(checkbox);
          if (item.label) {
            label.appendChild(document.createTextNode(item.label));
          }
          
          checkbox.onchange = (e) => {
            if (item.onChange) item.onChange(e.target.checked);
          };
          
          buttonContainer.appendChild(label);
          break;
      }

      row.appendChild(buttonContainer);
    });

    return row;
  },

  renderButtons: function() {
    const container = document.getElementById('panel-container');
    if (!container) return;

    container.innerHTML = '';
    this.config.buttons.forEach(rowItems => {
      container.appendChild(this.createButtonRow(rowItems));
    });
  }
}; 