/**
 * Tampermonkey 환경에서 사용할 API 클라이언트
 * 외부 라이브러리 없이 순수 JavaScript로 구현
 */
class API {
  constructor() {
    this.baseURL = '';
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * API 클라이언트 초기화
   * @param {Object} config - 설정 객체
   * @param {string} config.baseURL - 기본 URL
   * @param {Object} config.headers - 기본 헤더
   */
  static init(config = {}) {
    if (!API.instance) {
      API.instance = new API();
    }

    if (config.baseURL) {
      API.instance.baseURL = config.baseURL;
    }

    if (config.headers) {
      API.instance.defaultHeaders = {
        ...API.instance.defaultHeaders,
        ...config.headers
      };
    }

    return API.instance;
  }

  /**
   * GET 요청
   * @param {string} endpoint - 엔드포인트
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise} 응답 Promise
   */
  static async get(endpoint, params = {}) {
    const instance = API.instance || API.init();
    return instance._request('GET', endpoint, null, params);
  }

  /**
   * POST 요청
   * @param {string} endpoint - 엔드포인트
   * @param {Object} body - 요청 본문
   * @returns {Promise} 응답 Promise
   */
  static async post(endpoint, body = {}) {
    const instance = API.instance || API.init();
    return instance._request('POST', endpoint, body);
  }

  /**
   * PUT 요청
   * @param {string} endpoint - 엔드포인트
   * @param {Object} body - 요청 본문
   * @returns {Promise} 응답 Promise
   */
  static async put(endpoint, body = {}) {
    const instance = API.instance || API.init();
    return instance._request('PUT', endpoint, body);
  }

  /**
   * DELETE 요청
   * @param {string} endpoint - 엔드포인트
   * @returns {Promise} 응답 Promise
   */
  static async delete(endpoint) {
    const instance = API.instance || API.init();
    return instance._request('DELETE', endpoint);
  }

  /**
   * 내부 요청 처리 메서드
   * @param {string} method - HTTP 메서드
   * @param {string} endpoint - 엔드포인트
   * @param {Object} body - 요청 본문
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise} 응답 Promise
   */
  async _request(method, endpoint, body = null, params = {}) {
    try {
      // URL 구성
      let url = `${this.baseURL}/${endpoint}`.replace('//', '/');

      // 쿼리 파라미터 추가
      if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += (url.includes('?') ? '&' : '?') + queryString;
      }

      // 요청 옵션 구성
      const options = {
        method: method,
        headers: { ...this.defaultHeaders }
      };

      // 본문이 있으면 추가
      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      // 요청 실행
      const response = await fetch(url, options);

      // 응답 처리
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // JSON 응답 파싱
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }

    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  }

  /**
   * 헤더 설정
   * @param {string} key - 헤더 키
   * @param {string} value - 헤더 값
   */
  static setHeader(key, value) {
    const instance = API.instance || API.init();
    instance.defaultHeaders[key] = value;
  }

  /**
   * 헤더 제거
   * @param {string} key - 헤더 키
   */
  static removeHeader(key) {
    const instance = API.instance || API.init();
    delete instance.defaultHeaders[key];
  }

  /**
   * 기본 URL 설정
   * @param {string} baseURL - 기본 URL
   */
  static setBaseURL(baseURL) {
    const instance = API.instance || API.init();
    instance.baseURL = baseURL;
  }
}

// Tampermonkey에서 사용할 수 있도록 전역 객체에 할당
if (typeof window !== 'undefined') {
  window.API = API;
}

// CommonJS 환경 지원
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}

// ES6 모듈 지원
if (typeof exports !== 'undefined') {
  exports.API = API;
}