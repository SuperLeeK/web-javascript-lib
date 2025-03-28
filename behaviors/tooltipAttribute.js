export function enableTooltips() {
  const createTooltip = ({
    target,
    message,
    position = 'top',
    bgColor = '#333',
    color = '#fff',
    motion = 'fade',
    delay = 0,
    duration = 2000,
    onHide = null,
  }) => {
    const tooltip = document.createElement('div');
    const arrow = document.createElement('div');
    tooltip.appendChild(arrow);
    document.body.appendChild(tooltip);

    // 기본 스타일
    Object.assign(tooltip.style, {
      position: 'absolute',
      padding: '6px 10px',
      borderRadius: '6px',
      fontSize: '14px',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      backgroundColor: bgColor,
      color,
      maxWidth: 'calc(100vw - 20px)',
    });

    // 화살표 기본
    Object.assign(arrow.style, {
      position: 'absolute',
      width: '0',
      height: '0',
      border: 'none',
    });

    const setArrowStyle = () => {
      switch (position) {
        case 'bottom':
          Object.assign(arrow.style, {
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${bgColor}`,
          });
          break;
        case 'left':
          Object.assign(arrow.style, {
            top: '50%',
            right: '-6px',
            transform: 'translateY(-50%)',
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: `6px solid ${bgColor}`,
          });
          break;
        case 'right':
          Object.assign(arrow.style, {
            top: '50%',
            left: '-6px',
            transform: 'translateY(-50%)',
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: `6px solid ${bgColor}`,
          });
          break;
        case 'top':
        default:
          Object.assign(arrow.style, {
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `6px solid ${bgColor}`,
          });
          break;
      }
    };

    const show = () => {
      const rect = target.getBoundingClientRect();
      const scrollY = window.scrollY || 0;
      const scrollX = window.scrollX || 0;

      let x = rect.left + rect.width / 2 + scrollX;
      let y = rect.top + scrollY;

      tooltip.innerText = message;
      tooltip.appendChild(arrow);
      setArrowStyle();

      // 기본 위치 설정
      switch (position) {
        case 'bottom':
          y = rect.bottom + 6 + scrollY;
          tooltip.style.transform = motion === 'slide' ? 'translate(-50%, 20px)' : 'translate(-50%, 10px)';
          break;
        case 'left':
          x = rect.left - 6 + scrollX;
          y = rect.top + rect.height / 2 + scrollY;
          tooltip.style.transform = motion === 'slide' ? 'translate(-120%, -50%)' : 'translate(-105%, -50%)';
          break;
        case 'right':
          x = rect.right + 6 + scrollX;
          y = rect.top + rect.height / 2 + scrollY;
          tooltip.style.transform = motion === 'slide' ? 'translate(20%, -50%)' : 'translate(5%, -50%)';
          break;
        case 'top':
        default:
          y = rect.top - 6 + scrollY;
          tooltip.style.transform = motion === 'slide' ? 'translate(-50%, -120%)' : 'translate(-50%, -100%)';
          break;
      }

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;

      // 툴팁 보이기
      requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
      });

      // 화면 넘어가지 않도록 보정
      requestAnimationFrame(() => {
        const tipRect = tooltip.getBoundingClientRect();
        const padding = 8;
        const overflowRight = tipRect.right - window.innerWidth;
        const overflowLeft = -tipRect.left;

        if (overflowRight > 0) {
          tooltip.style.left = `${x - overflowRight - padding}px`;
        }
        if (overflowLeft > 0) {
          tooltip.style.left = `${x + overflowLeft + padding}px`;
        }
      });

      // 툴팁 숨기기 및 제거
      setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
          tooltip.remove();
          if (typeof window[onHide] === 'function') {
            window[onHide](target);
          }
        }, 300);
      }, duration);
    };

    setTimeout(show, delay);
  };

  const elements = document.querySelectorAll('[tooltip]');
  elements.forEach(el => {
    const handler = () => {
      const content = el.getAttribute('tooltip');
      if (!content) return;

      createTooltip({
        target: el,
        message: content,
        position: el.getAttribute('tooltip-position') || 'top',
        bgColor: el.getAttribute('tooltip-bg') || '#333',
        color: el.getAttribute('tooltip-color') || '#fff',
        motion: el.getAttribute('tooltip-motion') || 'fade',
        delay: parseInt(el.getAttribute('tooltip-delay') || '0', 10),
        duration: parseInt(el.getAttribute('tooltip-duration') || '2000', 10),
        onHide: el.getAttribute('tooltip-on-hide'),
      });
    };

    const useHover = el.getAttribute('tooltip-hover') === 'true';

    if (useHover) {
      el.addEventListener('mouseenter', handler);
      el.addEventListener('mouseleave', () => {
        // 자동 제거는 개별 툴팁에서 처리됨
      });
    } else {
      el.addEventListener('click', handler);
      el.addEventListener('touchstart', handler);
      el.addEventListener('focusin', handler);
    }
  });
}
