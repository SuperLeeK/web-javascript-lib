
/**
 * CSS 문자열을 객체로 변환합니다.
 * 
 * @param {string} css - 변환할 CSS 문자열 (예: "width: 100px; height: 200px;")
 * @returns {Object} CSS 속성을 키로, 숫자 값을 값으로 가지는 객체 (예: { width: 100, height: 200 })
 * 
 * @example
 * cssToObject("width: 100px; height: 200px;")
 * // Returns: { width: 100, height: 200 }
 */
const cssToObject = (css) => {
  const cssObj = {};

  // 각 속성 및 값에 대해 분리
  const properties = css.split(';').filter(Boolean); // 세미콜론으로 구분하고 빈 값 필터링

  properties.forEach(property => {
    const [key, value] = property.split(':').map(item => item.trim());
    cssObj[key] = parseFloat(value.replace('px', ''));
  });

  return cssObj;
};

/**
 * 객체를 CSS 문자열로 변환합니다.
 * 
 * @param {Object} obj - CSS 속성과 숫자 값을 가지는 객체 (예: { width: 100, height: 200 })
 * @returns {string} CSS 문자열 (예: "width: 100px; height: 200px")
 * 
 * @example
 * objectToCss({ width: 100, height: 200 })
 * // Returns: "width: 100px; height: 200px"
 */
const objectToCss = (obj) => {
  return Object.keys(obj).map(key => `${key}: ${obj[key]}px`).join(';');
}

/**
 * 쿼리 스트링을 객체로 변환합니다.
 * 
 * @param {string} queryString - 변환할 쿼리 스트링 (예: "?name=John&age=30")
 * @returns {Object} 키-값 쌍을 가지는 객체 (예: { name: "John", age: "30" })
 * 
 * @example
 * queryStringToObject("?name=John&age=30")
 * // Returns: { name: "John", age: "30" }
 */
function queryStringToObject(queryString) {
  const obj = {};
  const pairs = queryString.substring(1).split('&'); // '?'를 제외한 후 '&'로 분리

  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    obj[decodeURIComponent(key)] = decodeURIComponent(value || ''); // 키와 값을 디코딩하여 객체에 저장
  });

  return obj;
}

/**
 * 객체를 쿼리 스트링으로 변환합니다.
 * 
 * @param {Object} obj - 변환할 객체 (예: { name: "John", age: 30 })
 * @returns {string} 쿼리 스트링 (예: "?name=John&age=30")
 * 
 * @example
 * objectToQueryString({ name: "John", age: 30 })
 * // Returns: "?name=John&age=30"
 */
function objectToQueryString(obj) {
  const queryString = Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
  return `?${queryString}`;
}

/**
 * 조건이 만족될 때까지 대기한 후 콜백을 실행합니다.
 * 
 * @param {Function|boolean} condition - 조건 함수 또는 불리언 값. 함수인 경우 true를 반환할 때까지 대기합니다.
 * @param {Function} [callback] - 조건이 만족되었을 때 실행할 콜백 함수
 * @param {number} [interval=100] - 조건을 확인하는 간격 (밀리초)
 * 
 * @example
 * // 함수 조건 사용
 * waitFor(() => document.readyState === 'complete', () => {
 *   console.log('페이지 로드 완료');
 * });
 * 
 * // 불리언 조건 사용
 * waitFor(true, () => {
 *   console.log('즉시 실행');
 * });
 */
async function waitFor(condition, callback, interval = 100) {
  if (typeof condition === 'function') {
    if (condition()) {
      callback?.();
      return;
    } else {
      setTimeout(waitFor, interval, condition, callback);
    }
  } else if (condition) {
    callback?.();
    return;
  } else {
    setTimeout(waitFor, interval, condition, callback);
  }
}

/**
 * 지정된 시간(초)만큼 대기한 후 콜백을 실행합니다.
 * 
 * @param {number} seconds - 대기할 시간 (초)
 * @param {Function} callback - 대기 후 실행할 콜백 함수
 * 
 * @example
 * waitForSeconds(3, () => {
 *   console.log('3초 후 실행');
 * });
 */
async function waitForSeconds(seconds, callback) {
  setTimeout(callback, seconds * 1000);
}

/**
 * DOM 셀렉터로 요소가 나타날 때까지 대기한 후 콜백을 실행합니다.
 * 
 * @param {string} readySelector - 찾을 요소의 CSS 셀렉터
 * @param {Function} [callback] - 요소가 발견되었을 때 실행할 콜백 함수 (발견된 요소를 인자로 전달)
 * @param {number} [targetNumAttempts=34] - 최대 시도 횟수 (기본값: 34)
 * @throws {Error} 최대 시도 횟수를 초과하면 에러를 발생시킵니다.
 * 
 * @example
 * waitForSelector('.my-element', (element) => {
 *   console.log('요소 발견:', element);
 *   element.style.display = 'block';
 * });
 */
async function waitForSelector(readySelector, callback, targetNumAttempts = 34) {
  var numAttempts = 0;
  var tryNow = function () {
    var elem = document.querySelector(readySelector);
    if (elem) {
      callback?.(elem);
    } else {
      numAttempts++;
      if (numAttempts >= targetNumAttempts) {
        console.warn('Giving up after 34 attempts. Could not find: ' + readySelector);
        throw new Error('Could not find: ' + readySelector);
      } else {
        setTimeout(tryNow, 250 * Math.pow(1.1, numAttempts));
      }
    }
  };
  tryNow();
}

/**
 * 셀렉터로 찾은 요소들 중에서 조건을 만족하는 첫 번째 요소를 반환합니다.
 * 
 * @param {string} selector - CSS 셀렉터
 * @param {Function} condition - 요소를 검사하는 조건 함수 (요소를 인자로 받아 boolean을 반환)
 * @returns {Element|null} 조건을 만족하는 첫 번째 요소 또는 null
 * 
 * @example
 * // textContent가 "호우"인 요소 찾기
 * const element = findElement('.my-class', (el) => el.textContent.trim() === '호우');
 * 
 * // 특정 속성 값을 가진 요소 찾기
 * const element = findElement('div', (el) => el.dataset.id === '123');
 */
function findElement(selector, condition) {
  const elements = document.querySelectorAll(selector);
  for (const element of elements) {
    if (condition(element)) {
      return element;
    }
  }
  return null;
}

/**
 * 셀렉터로 찾은 요소들 중에서 조건을 만족하는 모든 요소를 배열로 반환합니다.
 * 
 * @param {string} selector - CSS 셀렉터
 * @param {Function} condition - 요소를 검사하는 조건 함수 (요소를 인자로 받아 boolean을 반환)
 * @returns {Element[]} 조건을 만족하는 모든 요소의 배열
 * 
 * @example
 * // textContent가 "호우"인 모든 요소 찾기
 * const elements = findElements('.my-class', (el) => el.textContent.trim() === '호우');
 * 
 * // 특정 속성 값을 가진 모든 요소 찾기
 * const elements = findElements('div', (el) => el.dataset.id === '123');
 */
function findElements(selector, condition) {
  const elements = document.querySelectorAll(selector);
  const results = [];
  for (const element of elements) {
    if (condition(element)) {
      results.push(element);
    }
  }
  return results;
}

/**
 * 셀렉터로 찾은 요소들 중에서 textContent가 지정된 텍스트와 일치하는 첫 번째 요소를 반환합니다.
 * 
 * @param {string} selector - CSS 셀렉터
 * @param {string} text - 찾을 텍스트 내용
 * @param {boolean} [exactMatch=true] - 정확히 일치해야 하는지 여부 (기본값: true). false인 경우 포함 여부로 검사
 * @returns {Element|null} 조건을 만족하는 첫 번째 요소 또는 null
 * 
 * @example
 * // textContent가 정확히 "호우"인 요소 찾기
 * const element = findElementByTextContent('.my-class', '호우');
 * 
 * // textContent에 "호우"가 포함된 요소 찾기
 * const element = findElementByTextContent('.my-class', '호우', false);
 */
function findElementByTextContent(selector, text, exactMatch = true) {
  return findElement(selector, (element) => {
    const content = element.textContent.trim();
    return exactMatch ? content === text : content.includes(text);
  });
}

/**
 * 셀렉터로 찾은 요소들 중에서 textContent가 지정된 텍스트와 일치하는 모든 요소를 배열로 반환합니다.
 * 
 * @param {string} selector - CSS 셀렉터
 * @param {string} text - 찾을 텍스트 내용
 * @param {boolean} [exactMatch=true] - 정확히 일치해야 하는지 여부 (기본값: true). false인 경우 포함 여부로 검사
 * @returns {Element[]} 조건을 만족하는 모든 요소의 배열
 * 
 * @example
 * // textContent가 정확히 "호우"인 모든 요소 찾기
 * const elements = findElementsByTextContent('.my-class', '호우');
 * 
 * // textContent에 "호우"가 포함된 모든 요소 찾기
 * const elements = findElementsByTextContent('.my-class', '호우', false);
 */
function findElementsByTextContent(selector, text, exactMatch = true) {
  return findElements(selector, (element) => {
    const content = element.textContent.trim();
    return exactMatch ? content === text : content.includes(text);
  });
}

/**
 * 셀렉터로 찾은 요소들 중에서 특정 속성 값이 지정된 값과 일치하는 첫 번째 요소를 반환합니다.
 * 
 * @param {string} selector - CSS 셀렉터
 * @param {string} property - 확인할 속성 이름 (예: 'id', 'className', 'dataset.id', 'getAttribute'로 접근 가능한 속성)
 * @param {string|number|boolean} value - 찾을 속성 값
 * @returns {Element|null} 조건을 만족하는 첫 번째 요소 또는 null
 * 
 * @example
 * // id가 "myId"인 요소 찾기
 * const element = findElementByProperty('.my-class', 'id', 'myId');
 * 
 * // data-id 속성이 "123"인 요소 찾기
 * const element = findElementByProperty('div', 'dataset.id', '123');
 * 
 * // 특정 클래스를 가진 요소 찾기
 * const element = findElementByProperty('div', 'className', 'active');
 * 
 * // data 속성 접근 (점 표기법 지원)
 * const element = findElementByProperty('div', 'dataset.customValue', 'test');
 */
function findElementByProperty(selector, property, value) {
  return findElement(selector, (element) => {
    // 점 표기법으로 중첩된 속성 접근 (예: 'dataset.id')
    const keys = property.split('.');
    let current = element;

    for (let i = 0; i < keys.length; i++) {
      if (current == null) return false;
      current = current[keys[i]];
    }

    return current === value || String(current) === String(value);
  });
}

/**
 * 셀렉터로 찾은 요소들 중에서 특정 속성 값이 지정된 값과 일치하는 모든 요소를 배열로 반환합니다.
 * 
 * @param {string} selector - CSS 셀렉터
 * @param {string} property - 확인할 속성 이름 (예: 'id', 'className', 'dataset.id', 'getAttribute'로 접근 가능한 속성)
 * @param {string|number|boolean} value - 찾을 속성 값
 * @returns {Element[]} 조건을 만족하는 모든 요소의 배열
 * 
 * @example
 * // id가 "myId"인 모든 요소 찾기
 * const elements = findElementsByProperty('.my-class', 'id', 'myId');
 * 
 * // data-id 속성이 "123"인 모든 요소 찾기
 * const elements = findElementsByProperty('div', 'dataset.id', '123');
 * 
 * // 특정 클래스를 가진 모든 요소 찾기
 * const elements = findElementsByProperty('div', 'className', 'active');
 * 
 * // data 속성 접근 (점 표기법 지원)
 * const elements = findElementsByProperty('div', 'dataset.customValue', 'test');
 */
function findElementsByProperty(selector, property, value) {
  return findElements(selector, (element) => {
    // 점 표기법으로 중첩된 속성 접근 (예: 'dataset.id')
    const keys = property.split('.');
    let current = element;

    for (let i = 0; i < keys.length; i++) {
      if (current == null) return false;
      current = current[keys[i]];
    }

    return current === value || String(current) === String(value);
  });
}

