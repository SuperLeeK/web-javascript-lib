/*!
 * useDownload.js
 * version: 1.3.0
 * deps: JSZip (global), Toast (global Toast.success / Toast.error)
 * env: Tampermonkey/Greasemonkey (GM_xmlhttpRequest, GM_download)
 */
(function () {
  'use strict';

  function assertEnv() {
    if (typeof JSZip === 'undefined') throw new Error('JSZip 미로드 (@require jszip 필요)');
    if (typeof GM_xmlhttpRequest !== 'function') throw new Error('GM_xmlhttpRequest 불가 (@grant 필요)');
    if (typeof GM_download !== 'function') throw new Error('GM_download 불가 (@grant 필요)');
  }

  const sanitize = (name) =>
    (name || 'file').replace(/[\\/:*?"<>|]/g, '_').trim() || 'file';

  const inferFilenameFromUrl = (url) => {
    try {
      const u = new URL(url, location.href);
      const last = u.pathname.split('/').filter(Boolean).pop() || 'file';
      return sanitize(decodeURIComponent(last));
    } catch { return 'file'; }
  };

  const parseFilenameFromContentDisposition = (value) => {
    if (!value) return null;
    const utf8 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(value);
    if (utf8) return sanitize(decodeURIComponent(utf8[1]));
    const quoted = /filename\s*=\s*"([^"]+)"/i.exec(value);
    if (quoted) return sanitize(quoted[1]);
    const bare = /filename\s*=\s*([^;]+)/i.exec(value);
    if (bare) return sanitize(bare[1]);
    return null;
  };

  function fetchArrayBuffer(url, fallbackName) {
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
              filename: nameFromCD || fallbackName || inferFilenameFromUrl(url),
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

  async function mapWithConcurrency(items, worker, concurrency = 4, onEachDone) {
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
              try { onEachDone && onEachDone(done, items.length); } catch {}
              if (done === items.length) resolve(results);
              else pump();
            });
        }
      };
      pump();
    });
  }

  // string[] | {url, filename?}[] -> {url, filename?}[]
  function normalizeUrls(urls) {
    if (!Array.isArray(urls)) return [];
    if (urls.length === 0) return [];
    if (typeof urls[0] === 'string') return urls.map(u => ({ url: u }));
    return urls.map(x => ({ url: String(x.url), filename: x.filename ? String(x.filename) : undefined }));
  }

  /**
   * @param {Array<string|{url:string, filename?:string}>} urls
   * @param {string} folderName  - zipName = `${folderName}.zip`, 내부 폴더도 동일 이름
   * @param {{concurrency?:number}} [options]
   * @param {(p:{current:number,total:number,percent:number})=>void} [onProgress]
   */
  async function download(urls, folderName, { concurrency = 4 } = {}, onProgress) {
    assertEnv();

    const list = normalizeUrls(urls);
    if (!list.length) {
      const msg = 'urls 가 비어있습니다.';
      if (typeof Toast?.error === 'function') Toast.error(msg);
      throw new Error(msg);
    }

    const safeFolder = sanitize(folderName || 'download');
    const zipName = `${safeFolder}.zip`;

    // 1) fetch all — 파일 단위 진행률
    const totalFetch = list.length;
    const reportFetch = (done) => {
      if (typeof onProgress === 'function') {
        const percent = totalFetch ? (done / totalFetch) * 100 : 100;
        try { onProgress({ current: done, total: totalFetch, percent }); } catch {}
      }
    };
    reportFetch(0);

    const results = await mapWithConcurrency(
      list,
      (item) => fetchArrayBuffer(item.url, item.filename && sanitize(item.filename)),
      concurrency,
      (done) => reportFetch(done)
    );

    const successes = results
      .map((r, i) => ({ r, item: list[i] }))
      .filter(x => x.r?.ok)
      .map(x => ({
        arrayBuffer: x.r.val.arrayBuffer,
        filename: sanitize(x.item.filename || x.r.val.filename),
        srcUrl: x.item.url
      }));

    const failures = results
      .map((r, i) => ({ r, item: list[i] }))
      .filter(x => !x.r?.ok);

    if (!successes.length) {
      const msg = '모든 다운로드가 실패했습니다. (@connect 도메인/권한 확인)';
      if (typeof Toast?.error === 'function') Toast.error(msg);
      throw new Error(msg);
    }

    // 2) ZIP — 압축 진행률 (0~100)
    const zip = new JSZip();
    const dir = zip.folder(safeFolder);
    const used = new Set();
    const ensureUnique = (name) => {
      let n = 1;
      let base = name, ext = '';
      const dot = name.lastIndexOf('.');
      if (dot >= 0) { base = name.slice(0, dot); ext = name.slice(dot); }
      let cur = name;
      while (used.has(cur)) cur = `${base} (${n++})${ext}`;
      used.add(cur);
      return cur;
    };
    successes.forEach(({ arrayBuffer, filename }) => {
      const unique = ensureUnique(filename);
      dir.file(unique, arrayBuffer);
    });

    const blob = await zip.generateAsync({ type: 'blob' }, (meta) => {
      if (typeof onProgress === 'function') {
        const p = Math.max(0, Math.min(100, meta.percent || 0));
        try { onProgress({ current: Math.round(p), total: 100, percent: p }); } catch {}
      }
    });

    // 3) save once — 완료 알림
    const objUrl = URL.createObjectURL(blob);
    try {
      // 저장 직전 100% 한 번 보냄 (zip 단계가 이미 100 찍었으면 중복일 수 있음)
      if (typeof onProgress === 'function') {
        try { onProgress({ current: 100, total: 100, percent: 100 }); } catch {}
      }

      await new Promise((resolve, reject) => {
        GM_download({
          url: objUrl,
          name: zipName,
          saveAs: true,
          onload: () => resolve(),
          onerror: (e) => reject(e),
          ontimeout: () => reject(new Error('GM_download timeout')),
        });
      });

      const okMsg = failures.length
        ? `완료: ${zipName} (성공 ${successes.length} / 실패 ${failures.length})`
        : `완료: ${zipName} (총 ${successes.length}개)`;
      if (typeof Toast?.success === 'function') Toast.success(okMsg);
      if (failures.length) console.warn('실패 URL:', failures.map(f => f.item.url));
    } catch (e) {
      const errMsg = `ZIP 저장 오류: ${e?.message || e}`;
      if (typeof Toast?.error === 'function') Toast.error(errMsg);
      throw e;
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  }

  const api = { download, version: '1.3.0' };
  if (typeof window !== 'undefined') window.useDownload = api;
  if (typeof unsafeWindow !== 'undefined') unsafeWindow.useDownload = api;
})();
