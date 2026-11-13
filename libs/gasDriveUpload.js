// uploadToDrive: Google Apps Script 웹 앱 URL로 파일을 보내 구글 드라이브에 저장한다.
// 백엔드는 내 드라이브/{siteName}/{novelTitle}/{fileName} 에 저장하고, 같은 이름 파일은 휴지통으로 보낸다.
//
//   const res = await uploadToDrive({
//       url: 'https://script.google.com/macros/s/.../exec',   // 필수: 호출하는 쪽이 입력
//       siteName: 'marumaru',
//       novelTitle: '소설 제목',
//       fileName: '소설 제목 1~10화.txt',
//       content: '본문 텍스트',
//       isBase64: false                                       // true면 content 를 base64 로 본다
//   });
//   res -> { status: 'success', fileId, fileName, fileUrl, folder }
//
// 실패하면 Error 를 던진다. URL 은 lib 에 넣지 않는다 (lib 저장소는 공개다).

const GAS_WEB_APP_RE = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/(exec|dev)(\?.*)?$/;

function uploadToDrive(options) {
    const opts = options || {};
    const url = String(opts.url || '').trim();
    if (!GAS_WEB_APP_RE.test(url)) {
        return Promise.reject(new Error('GAS 웹 앱 URL 형식이 아닙니다. https://script.google.com/macros/s/.../exec 를 입력하세요.'));
    }
    if (!opts.fileName) {
        return Promise.reject(new Error('fileName 이 필요합니다.'));
    }

    const payload = {
        fileName: opts.fileName,
        content: opts.content == null ? '' : opts.content,
        isBase64: !!opts.isBase64,
        siteName: opts.siteName || '',
        novelTitle: opts.novelTitle || ''
    };
    const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 60000;

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    return fetch(url, {
        method: 'POST',
        // text/plain 으로 보내면 브라우저가 CORS 사전 요청을 생략해 GAS 웹 앱이 그대로 받는다.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
    }).then(async (response) => {
        let res = null;
        try {
            res = await response.json();
        } catch (e) {
            throw new Error('GAS 응답을 해석하지 못했습니다. HTTP ' + response.status);
        }
        if (!res || res.status !== 'success') {
            throw new Error((res && res.message) || '드라이브 전송 실패');
        }
        return res;
    }).catch((err) => {
        if (err && err.name === 'AbortError') {
            throw new Error('드라이브 업로드 시간 초과 (' + (timeoutMs / 1000).toFixed(1).replace(/\.0$/, '') + '초)');
        }
        throw err;
    }).finally(() => {
        if (timer) clearTimeout(timer);
    });
}

if (typeof window !== 'undefined') {
    window.uploadToDrive = uploadToDrive;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = uploadToDrive;
    module.exports.uploadToDrive = uploadToDrive;
}

if (typeof exports !== 'undefined') {
    exports.uploadToDrive = uploadToDrive;
}
