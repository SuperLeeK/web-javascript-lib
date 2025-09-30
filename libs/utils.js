
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

const objectToCss = (obj) => {
  return Object.keys(obj).map(key => `${key}: ${obj[key]}px`).join(';');
}

// queryString을 객체로 변환하는 함수
function queryStringToObject(queryString) {
  const obj = {};
  const pairs = queryString.substring(1).split('&'); // '?'를 제외한 후 '&'로 분리

  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    obj[decodeURIComponent(key)] = decodeURIComponent(value || ''); // 키와 값을 디코딩하여 객체에 저장
  });

  return obj;
}

// 객체를 queryString으로 변환하는 함수
function objectToQueryString(obj) {
  const queryString = Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
  return `?${queryString}`;
}

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

async function waitForSeconds(seconds, callback) {
  setTimeout(callback, seconds * 1000);
}

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