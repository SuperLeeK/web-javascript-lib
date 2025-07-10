// 아코디언 컴포넌트
class Accordion {
  constructor(options = {}) {
    // 기본 설정
    this.config = {
      id: null,
      items: [], // [{ title: '제목', content: '내용', expanded: false }]
      multiple: false, // true면 여러 개 동시 열기 가능
      animated: true, // 애니메이션 사용 여부
      size: 'medium', // 'small', 'medium', 'large'
      theme: {
        primary: '#00BCD4',
        primaryHover: '#0097A7',
        background: '#FFFFFF',
        border: '#DEE2E6',
        text: '#333333',
        textLight: '#666666',
        shadow: 'rgba(0, 0, 0, 0.1)'
      },
      onToggle: null,
      onExpand: null,
      onCollapse: null
    };

    // 설정 업데이트
    this.updateConfig(options);
    
    this.id = this.config.id || 'accordion-' + Math.random().toString(36).substr(2, 9);
    this.element = null;
    this.items = [];
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
        fontSize: '12px',
        padding: '8px 12px',
        headerHeight: '32px',
        iconSize: '12px'
      },
      medium: {
        fontSize: '14px',
        padding: '12px 16px',
        headerHeight: '40px',
        iconSize: '16px'
      },
      large: {
        fontSize: '16px',
        padding: '16px 20px',
        headerHeight: '48px',
        iconSize: '20px'
      }
    };
    return sizes[this.config.size] || sizes.medium;
  }

  init() {
    this.createElement();
    this.createItems();
  }

  createElement() {
    const sizeStyles = this.getSizeStyles();
    
    // 컨테이너 생성
    const container = document.createElement('div');
    container.id = this.id;
    container.className = 'accordion-container';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.border = `1px solid ${this.config.theme.border}`;
    container.style.borderRadius = '8px';
    container.style.overflow = 'hidden';
    container.style.boxShadow = `0 2px 8px ${this.config.theme.shadow}`;

    this.element = container;
    return container;
  }

  createItems() {
    this.config.items.forEach((itemConfig, index) => {
      const item = this.createAccordionItem(itemConfig, index);
      this.items.push(item);
      this.element.appendChild(item.element);
    });
  }

  createAccordionItem(itemConfig, index) {
    const sizeStyles = this.getSizeStyles();
    
    // 아이템 컨테이너
    const itemContainer = document.createElement('div');
    itemContainer.className = 'accordion-item';
    itemContainer.style.borderBottom = `1px solid ${this.config.theme.border}`;
    itemContainer.style.overflow = 'hidden';

    // 헤더
    const header = document.createElement('div');
    header.className = 'accordion-header';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.padding = sizeStyles.padding;
    header.style.minHeight = sizeStyles.headerHeight;
    header.style.backgroundColor = this.config.theme.background;
    header.style.cursor = 'pointer';
    header.style.transition = 'all 0.3s ease';
    header.style.userSelect = 'none';

    // 헤더 호버 효과
    header.addEventListener('mouseenter', () => {
      header.style.backgroundColor = this.config.theme.primaryHover;
      header.style.color = '#FFFFFF';
    });

    header.addEventListener('mouseleave', () => {
      header.style.backgroundColor = this.config.theme.background;
      header.style.color = this.config.theme.text;
    });

    // 제목
    const title = document.createElement('div');
    title.className = 'accordion-title';
    title.textContent = itemConfig.title;
    title.style.fontSize = sizeStyles.fontSize;
    title.style.fontWeight = '500';
    title.style.color = this.config.theme.text;
    title.style.flex = '1';

    // 아이콘
    const icon = document.createElement('div');
    icon.className = 'accordion-icon';
    icon.style.width = sizeStyles.iconSize;
    icon.style.height = sizeStyles.iconSize;
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.transition = 'transform 0.3s ease';
    icon.style.fontSize = sizeStyles.iconSize;
    icon.style.color = this.config.theme.text;
    icon.innerHTML = '▼';

    // 콘텐츠
    const content = document.createElement('div');
    content.className = 'accordion-content';
    content.style.padding = sizeStyles.padding;
    content.style.backgroundColor = '#FAFAFA';
    content.style.borderTop = `1px solid ${this.config.theme.border}`;
    content.style.fontSize = sizeStyles.fontSize;
    content.style.color = this.config.theme.textLight;
    content.style.lineHeight = '1.5';

    // 콘텐츠가 문자열인 경우
    if (typeof itemConfig.content === 'string') {
      content.textContent = itemConfig.content;
    } else {
      // DOM 요소인 경우
      content.appendChild(itemConfig.content);
    }

    // 초기 상태 설정
    if (itemConfig.expanded) {
      icon.style.transform = 'rotate(180deg)';
      content.style.display = 'block';
    } else {
      content.style.display = 'none';
    }

    // 애니메이션 설정
    if (this.config.animated) {
      content.style.transition = 'all 0.3s ease';
      content.style.maxHeight = itemConfig.expanded ? 'none' : '0';
      content.style.overflow = 'hidden';
    }

    header.appendChild(title);
    header.appendChild(icon);
    itemContainer.appendChild(header);
    itemContainer.appendChild(content);

    // 클릭 이벤트
    header.addEventListener('click', () => {
      this.toggleItem(index);
    });

    // 키보드 접근성
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleItem(index);
      }
    });

    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', itemConfig.expanded);
    header.setAttribute('aria-controls', `${this.id}-content-${index}`);
    content.id = `${this.id}-content-${index}`;
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', `${this.id}-header-${index}`);
    header.id = `${this.id}-header-${index}`;

    return {
      element: itemContainer,
      header: header,
      content: content,
      icon: icon,
      config: itemConfig,
      index: index,
      expanded: itemConfig.expanded || false
    };
  }

  toggleItem(index) {
    const item = this.items[index];
    if (!item) return;

    if (item.expanded) {
      this.collapseItem(index);
    } else {
      this.expandItem(index);
    }
  }

  expandItem(index) {
    const item = this.items[index];
    if (!item || item.expanded) return;

    // 다중 선택이 아닌 경우 다른 아이템들 닫기
    if (!this.config.multiple) {
      this.items.forEach((otherItem, otherIndex) => {
        if (otherIndex !== index && otherItem.expanded) {
          this.collapseItem(otherIndex);
        }
      });
    }

    // 아이템 열기
    item.expanded = true;
    item.icon.style.transform = 'rotate(180deg)';
    item.header.setAttribute('aria-expanded', 'true');

    if (this.config.animated) {
      item.content.style.display = 'block';
      // 높이 애니메이션을 위한 지연
      setTimeout(() => {
        item.content.style.maxHeight = 'none';
      }, 10);
    } else {
      item.content.style.display = 'block';
    }

    // 콜백 실행
    if (this.config.onExpand) {
      this.config.onExpand(index, item.config);
    }
    if (this.config.onToggle) {
      this.config.onToggle(index, true, item.config);
    }
  }

  collapseItem(index) {
    const item = this.items[index];
    if (!item || !item.expanded) return;

    // 아이템 닫기
    item.expanded = false;
    item.icon.style.transform = 'rotate(0deg)';
    item.header.setAttribute('aria-expanded', 'false');

    if (this.config.animated) {
      item.content.style.maxHeight = '0';
      setTimeout(() => {
        item.content.style.display = 'none';
      }, 300);
    } else {
      item.content.style.display = 'none';
    }

    // 콜백 실행
    if (this.config.onCollapse) {
      this.config.onCollapse(index, item.config);
    }
    if (this.config.onToggle) {
      this.config.onToggle(index, false, item.config);
    }
  }

  // 아이템 추가
  addItem(itemConfig) {
    const index = this.items.length;
    const item = this.createAccordionItem(itemConfig, index);
    this.items.push(item);
    this.element.appendChild(item.element);
    return index;
  }

  // 아이템 제거
  removeItem(index) {
    const item = this.items[index];
    if (!item) return;

    if (item.element.parentNode) {
      item.element.parentNode.removeChild(item.element);
    }
    this.items.splice(index, 1);

    // 인덱스 재정렬
    this.items.forEach((item, newIndex) => {
      item.index = newIndex;
      item.header.setAttribute('aria-controls', `${this.id}-content-${newIndex}`);
      item.content.id = `${this.id}-content-${newIndex}`;
      item.header.id = `${this.id}-header-${newIndex}`;
    });
  }

  // 아이템 업데이트
  updateItem(index, newConfig) {
    const item = this.items[index];
    if (!item) return;

    // 제목 업데이트
    const title = item.header.querySelector('.accordion-title');
    if (title && newConfig.title) {
      title.textContent = newConfig.title;
    }

    // 콘텐츠 업데이트
    if (newConfig.content) {
      item.content.innerHTML = '';
      if (typeof newConfig.content === 'string') {
        item.content.textContent = newConfig.content;
      } else {
        item.content.appendChild(newConfig.content);
      }
    }

    // 확장 상태 업데이트
    if (newConfig.expanded !== undefined) {
      if (newConfig.expanded) {
        this.expandItem(index);
      } else {
        this.collapseItem(index);
      }
    }

    item.config = { ...item.config, ...newConfig };
  }

  // 모든 아이템 열기
  expandAll() {
    this.items.forEach((item, index) => {
      this.expandItem(index);
    });
  }

  // 모든 아이템 닫기
  collapseAll() {
    this.items.forEach((item, index) => {
      this.collapseItem(index);
    });
  }

  // 확장된 아이템 인덱스들 가져오기
  getExpandedItems() {
    return this.items
      .map((item, index) => item.expanded ? index : -1)
      .filter(index => index !== -1);
  }

  // 특정 아이템이 확장되었는지 확인
  isExpanded(index) {
    const item = this.items[index];
    return item ? item.expanded : false;
  }

  // 아이템 개수 가져오기
  getItemCount() {
    return this.items.length;
  }

  // 아이템 설정 가져오기
  getItemConfig(index) {
    const item = this.items[index];
    return item ? item.config : null;
  }

  // 다중 선택 모드 설정
  setMultiple(multiple) {
    this.config.multiple = multiple;
  }

  // 애니메이션 설정
  setAnimated(animated) {
    this.config.animated = animated;
    this.items.forEach(item => {
      if (animated) {
        item.content.style.transition = 'all 0.3s ease';
        item.content.style.maxHeight = item.expanded ? 'none' : '0';
        item.content.style.overflow = 'hidden';
      } else {
        item.content.style.transition = 'none';
        item.content.style.maxHeight = 'none';
        item.content.style.overflow = 'visible';
      }
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
window.Accordion = Accordion; 