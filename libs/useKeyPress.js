// useKeyPress.js

function useKeyPress(targetKey, callback) {
  // 이벤트 리스너 함수
  function handleKeyPress(event) {
    if (event.key === targetKey) {
      callback(event);  // 해당 키가 눌렸을 때 콜백 호출
    }
  }

  // 'keydown' 이벤트 리스너 등록
  document.addEventListener('keydown', handleKeyPress);

  // 반환된 객체에 이벤트 리스너를 제거하는 함수 포함
  return () => {
    document.removeEventListener('keydown', handleKeyPress);
  };
}

// useKeyPress.js

// useKeyPress.js

function useKeysPress(targetKeys, callback) {
  // 눌린 키를 추적할 Set 객체
  const pressedKeys = new Set();
  // 물리적 키(code)와 논리적 키(key) 매핑 관리
  const activeCodes = new Map();

  // 'keydown' 이벤트 리스너 함수
  function handleKeyDown(event) {
    pressedKeys.add(event.key);
    activeCodes.set(event.code, event.key);

    // targetKeys와 pressedKeys의 개수가 다르면 정확히 일치하는 조합이 아님
    if (pressedKeys.size !== targetKeys.length) return;

    // targetKeys에 있는 모든 키가 현재 눌린 키(pressedKeys)에 정확히 포함되어 있는지 확인
    if (targetKeys.every(key => pressedKeys.has(key))) {
      callback(event);  // 모든 키가 눌렸을 때 콜백 호출
    }
  }

  // 'keyup' 이벤트 리스너 함수
  function handleKeyUp(event) {
    pressedKeys.delete(event.key);

    // Shift 해제로 인해 event.key값이 바뀐 경우 대비 (+가 =로 바뀌는 현상 등)
    if (activeCodes.has(event.code)) {
      pressedKeys.delete(activeCodes.get(event.code));
      activeCodes.delete(event.code);
    }
  }

  function handleBlur() {
    pressedKeys.clear();
    activeCodes.clear();
  }

  // 이벤트 리스너 등록
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', handleBlur);

  // 이벤트 리스너 제거 함수 반환
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('blur', handleBlur);
  };
}

// 현재 눌려진 단일 키를 가져오는 함수
function useGetKeyPress() {
  let pressedKey = null;
  let pressedCode = null;

  function handleKeyDown(event) {
    pressedKey = event.key;
    pressedCode = event.code;
  }

  function handleKeyUp(event) {
    if (pressedKey === event.key || pressedCode === event.code) {
      pressedKey = null;
      pressedCode = null;
    }
  }

  function handleBlur() {
    pressedKey = null;
    pressedCode = null;
  }

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', handleBlur);

  return {
    getKey: () => pressedKey,
    removeListener: () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    }
  };
}

// 현재 눌려진 여러 키들을 배열로 가져오는 함수
function useGetKeysPress() {
  const pressedKeys = new Set();
  const activeCodes = new Map();

  function handleKeyDown(event) {
    pressedKeys.add(event.key);
    activeCodes.set(event.code, event.key);
  }

  function handleKeyUp(event) {
    pressedKeys.delete(event.key);
    if (activeCodes.has(event.code)) {
      pressedKeys.delete(activeCodes.get(event.code));
      activeCodes.delete(event.code);
    }
  }

  function handleBlur() {
    pressedKeys.clear();
    activeCodes.clear();
  }

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  window.addEventListener('blur', handleBlur);

  return {
    getKeys: () => Array.from(pressedKeys),
    removeListener: () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    }
  };
}