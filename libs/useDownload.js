/*!
 * useDownload.js
 * version: 1.0.0
 * dependency: JSZip (global JSZip), Toast (global Toast.success / Toast.error)
 * environment: Tampermonkey/Greasemonkey (GM_xmlhttpRequest, GM_download available)
 */
(function () {
  'use strict';

  function assertEnv() {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip 이 로드되지 않았습니다. (userscript에 @require jszip 추가 필요)');
    }
    if (typeof GM_xmlhttpRequest !== 'function') {
      throw new Error('GM_xmlhttpRequest 를 사용할 수 없습니다. (userscript에 @grant GM_xmlhttpRequest 필요)');
    }
    if (typeof GM_download !== 'function') {
      throw new Error('GM_download 를 사용할 수 없습니다. (userscript에 @grant GM_download 필요)');
    }
  }

  const sanitizeFilename = (name) =>
    (name || 'file').replace(/[\\/:*?"<>|]/g, '_').trim() || 'file';

  const inferFilenameFromUrl = (url) => {
    try {
      const u = new URL(url, location.href);
      const last = u.pathname.split('/').filter(Boolean).pop() || 'file';
      return sanitizeFilename(decodeURIComponent(last));
    } catch { return 'file'; }
  };

  const parseFilenameFromContentDisposition = (value) => {
    if (!value) return null;
    const utf8 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(value);
    if (utf8) return sanitizeFilename(decodeURIComponent(utf8[1]));
    const quoted = /filename\s*=\s*"([^"]+)"/i.exec(value);
    if (quoted) return sanitizeFilename(quoted[1]);
    const bare = /filename\s*=\s*([^;]+)/i.exec(value);
    if (bare) return sanitizeFilename(bare[1]);
    return null;
  };

  function fetchArrayBuffer(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        responseType: 'arraybuffer',
        timeout: 120000,
        onload: (res) => {
          if (res.status >= 200 && res.status < 300 && res.response) {
            const cdHeaderLine = res.responseHeaders
              ?.split(/\r?\n/)
              ?.find(h => /^content-disposition:/i.test(h));
            const cdVal = cdHeaderLine ? cdHeaderLine.split(':',2)[1] : null;
            const nameFromCD = parseFilenameFromContentDisposition(cdVal);
            resolve({
              arrayBuffer: res.response,
              filename: nameFromCD || inferFilenameFromUrl(url),
            });
          } else {
            reject(new Error(`HTTP ${res.status} for ${url}`));
          }
        },
        onerror: () => reject(new Error(`Network error for ${url}`)),
        ontimeout: () => reject(new Error(`Timeout for ${url}`)),
      });
    });
  }

  async function mapWithConcurrency(items, worker, concurrency = 4) {
    let i = 0, active = 0, done = 0;
    const results = new Array(items.length);
    return new Promise((resolve) => {
      const pump = () => {
        while (active < concurrency && i < items.length) {
          const idx = i++, item = items[idx];
          active++;
          Promise.resolve(worker(item, idx))
            .then(val => { results[idx] = { ok: true, val }; })
            .catch(err => { results[idx] = { ok: false, err }; })
            .finally(() => {
              active--; done++;
              if (done === items.length) resolve(results);
              else pump();
            });
        }
      };
      pump();
    });
  }

  async function download(urls, zipName, { concurrency = 4 } = {}) {
    assertEnv();

    if (!Array.isArray(urls) || urls.length === 0) {
      const msg = 'urls 가 비어있습니다.';
      if (typeof Toast?.error === 'function') Toast.error(msg);
      throw new Error(msg);
    }

    const finalZip = sanitizeFilename(
      zipName?.endsWith('.zip') ? zipName : `${zipName || 'download'}.zip`
    );

    // 1) fetch all with concurrency
    const results = await mapWithConcurrency(urls, (u) => fetchArrayBuffer(u), concurrency);

    const successes = results
      .map((r, i) => ({ r, url: urls[i] }))
      .filter(x => x.r?.ok)
      .map(x => ({ ...x.r.val, srcUrl: x.url }));

    const failures = results
      .map((r, i) => ({ r, url: urls[i] }))
      .filter(x => !x.r?.ok);

    if (successes.length === 0) {
      const msg = '모든 다운로드가 실패했습니다. (@connect 도메인을 확인하세요)';
      if (typeof Toast?.error === 'function') Toast.error(msg);
      throw new Error(msg);
    }

    // 2) zip
    const zip = new JSZip();
    successes.forEach(({ arrayBuffer, filename }) => {
      let name = filename;
      let n = 1;
      while (zip.file(name)) {
        const dot = name.lastIndexOf('.');
        const base = dot >= 0 ? name.slice(0, dot) : name;
        const ext  = dot >= 0 ? name.slice(dot) : '';
        name = `${base} (${n++})${ext}`;
      }
      zip.file(name, arrayBuffer);
    });

    const blob = await zip.generateAsync({ type: 'blob' });

    // 3) save once
    const objUrl = URL.createObjectURL(blob);
    try {
      await new Promise((resolve, reject) => {
        GM_download({
          url: objUrl,
          name: finalZip,
          saveAs: true,
          onload: () => resolve(),
          onerror: (e) => reject(e),
          ontimeout: () => reject(new Error('GM_download timeout')),
        });
      });

      const okMsg = failures.length
        ? `완료: ${finalZip} (성공 ${successes.length} / 실패 ${failures.length})`
        : `완료: ${finalZip} (총 ${successes.length}개)`;
      if (typeof Toast?.success === 'function') Toast.success(okMsg);
      if (failures.length) console.warn('실패 URL:', failures.map(f => f.url));
    } catch (e) {
      const errMsg = `ZIP 저장 중 오류: ${e?.message || e}`;
      if (typeof Toast?.error === 'function') Toast.error(errMsg);
      throw e;
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  }

  // 공개 API
  const api = { download, version: '1.0.0' };

  // 전역 노출
  if (typeof window !== 'undefined') {
    window.useDownload = api;
  }
  if (typeof unsafeWindow !== 'undefined') {
    unsafeWindow.useDownload = api;
  }
})();
