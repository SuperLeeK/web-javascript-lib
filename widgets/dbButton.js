// ==UserScript==
// @name         DB Button Widget
// @namespace    Widget
// @version      1.0.0
// @description  Download and Check button widget for database operations
// @author       You
// ==/UserScript==

const dbButton = (() => {
  // 스타일 주입 함수
  const injectStyles = () => {
    if (document.querySelector('#db-button-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'db-button-styles';
    style.textContent = `
      .download-button-container {
        display: flex;
        gap: 4px;
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 99999;
      }

      .download-button {
        padding: 8px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        min-width: 80px;
        min-height: 32px;
        font-size: 12px;
        transition: all 0.2s ease;
        background-color: #00ff00;
        color: #ffffff;
      }

      /* 다운로드 가능한 상태의 hover */
      .download-button:not(.downloaded):not(.queued):hover {
        background-color: #00cc00 !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 255, 0, 0.2);
      }

      /* 다운로드 완료된 상태 */
      .download-button.downloaded {
        background-color: #eeeeee !important;
        color: #000000 !important;
      }

      .download-button.downloaded:hover {
        background-color: #cccccc !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
      }

      /* 큐에 추가된 상태의 버튼 스타일 */
      .download-button.queued {
        background-color: #ff9900 !important;
        color: #ffffff !important;
      }

      .download-button.queued:hover {
        background-color: #cc7a00 !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(255, 153, 0, 0.2);
      }

      .check-button {
        padding: 8px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        min-width: 32px;
        min-height: 32px;
        font-size: 12px;
        background-color: #4a90e2;
        color: #ffffff;
        transition: all 0.2s ease;
      }

      .check-button:hover {
        background-color: #357abd !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(74, 144, 226, 0.2);
      }

      .check-button.disabled {
        background-color: #cccccc !important;
        cursor: not-allowed;
      }

      .check-button.disabled:hover {
        transform: none;
        box-shadow: none;
      }
    `;
    document.head.appendChild(style);
  };

  // 다운로드 버튼 클래스
  class DownloadButton {
    constructor(container, onClick) {
      this.button = document.createElement('button');
      this.button.className = 'download-button';
      this.button.textContent = 'Download';
      
      if (onClick) {
        this.button.addEventListener('click', onClick);
      }
      
      container.appendChild(this.button);
    }

    update(status, label = null) {
      // 기존 클래스 제거
      this.button.classList.remove('downloaded', 'queued');
      
      if (status === true) {
        // 다운로드 완료 상태
        this.button.classList.add('downloaded');
        this.button.textContent = label || 'Downloaded';
        this.button.title = 'Already Downloaded';
      } else if (status === 'queue') {
        // 큐 상태
        this.button.classList.add('queued');
        this.button.textContent = label || 'Queued';
        this.button.title = 'In Download Queue';
      } else {
        // 다운로드 가능 상태
        this.button.textContent = label || 'Download';
        this.button.title = 'Click to Download';
      }
    }

    setEnabled(enabled) {
      this.button.disabled = !enabled;
      if (!enabled) {
        this.button.style.opacity = '0.5';
        this.button.style.cursor = 'not-allowed';
      } else {
        this.button.style.opacity = '1';
        this.button.style.cursor = 'pointer';
      }
    }

    getElement() {
      return this.button;
    }
  }

  // 체크 버튼 클래스
  class CheckButton {
    constructor(container, onClick) {
      this.button = document.createElement('button');
      this.button.className = 'check-button';
      this.button.textContent = '✓';
      this.button.title = 'Mark as Downloaded';
      
      if (onClick) {
        this.button.addEventListener('click', onClick);
      }
      
      container.appendChild(this.button);
    }

    update(isDownloaded) {
      if (isDownloaded) {
        this.button.classList.add('disabled');
        this.button.title = 'Already Downloaded';
        this.button.disabled = true;
      } else {
        this.button.classList.remove('disabled');
        this.button.title = 'Mark as Downloaded';
        this.button.disabled = false;
      }
    }

    setEnabled(enabled) {
      this.button.disabled = !enabled;
      if (!enabled) {
        this.button.classList.add('disabled');
      } else {
        this.button.classList.remove('disabled');
      }
    }

    getElement() {
      return this.button;
    }
  }

  // 컨테이너 생성 함수
  const createContainer = (parentElement) => {
    const container = document.createElement('div');
    container.className = 'download-button-container';
    
    if (parentElement) {
      parentElement.appendChild(container);
    }
    
    return container;
  };

  // 메인 함수
  const create = (parentElement, downloadOnClick = null, checkOnClick = null) => {
    // 스타일 주입
    injectStyles();
    
    // 컨테이너 생성
    const container = createContainer(parentElement);
    
    // 버튼들 생성
    const downloadButton = new DownloadButton(container, downloadOnClick);
    const checkButton = new CheckButton(container, checkOnClick);
    
    return {
      downloadButton,
      checkButton,
      container
    };
  };

  return {
    create,
    DownloadButton,
    CheckButton
  };
})();

// 전역으로 노출
if (typeof window !== 'undefined') {
  window.dbButton = dbButton;
}
