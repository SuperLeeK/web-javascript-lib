/*!
 * useDownload.js (GM_download edition)
 * version: 2.0.0-gm
 * deps: Toast (global Toast.success / Toast.error)
 * env: Tampermonkey/Greasemonkey (GM_xmlhttpRequest, GM_download)
 * NOTE:
 *  - ZIP 생성 없음. 여러 파일을 개별 저장합니다.
 *  - ZIP 묶기는 OS/외부 API에서 수행하세요. (파일명 접두어로 그룹핑)
 */
(function () {
  'use strict';

  function assertEnv() {
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

  // 중복 파일명 방지용 – 같은 실행 배치 안에서만 보장(OS 레벨 충돌 방지는 보장 못함)
  function uniquifyNames(pairs) {
    const used = new Map(); // base -> count
    return pairs.map(({ url, name }) => {
      const dot = name.lastIndexOf('.');
      const base = dot >= 0 ? name.slice(0, dot) : name;
      const ext  = dot >= 0 ? name.slice(dot) : '';
      const key  = name.toLowerCase();

      if (!used.has(key)) {
        used.set(key, 1);
        return { url, name };
      }
      // 중복 발생 → base (n).ext
      let n = used.get(key) + 1;
      let candidate = `${base} (${n})${ext}`;
      while (used.has(candidate.toLowerCase())) {
        n += 1;
        candidate = `${base} (${n})${ext}`;
      }
      used.set(key, n);
      used.set(candidate.toLowerCase(), 1);
      return { url, name: candidate };
    });
  }

  async function mapWithConcurrency(items, worker, concurrency = 1, onEachDone) {
    let i = 0, active = 0, done = 0;
    const res = new Array(items.length);
    return new Promise((resolve) => {
      const pump = () => {
        while (active < concurrency && i < items.length) {
          const idx = i++;
          active++;
          Promise.resolve(worker(items[idx], idx))
            .then(v => { res[idx] = { ok: true, val: v }; })
            .catch(e => { res[idx] = { ok: false, err: e }; })
            .finally(() => {
              active--; done++;
              try { onEachDone && onEachDone(done, items.length); } catch {}
              if (done === items.length) resolve(res);
              else pump();
            });
        }
      };
      pump();
    });
  }

  // string[] | {url, filename?}[] -> [{url, filename?}]
  function normalizeUrls(urls) {
    if (!Array.isArray(urls)) return [];
    if (urls.length === 0) return [];
    if (typeof urls[0] === 'string') return urls.map(u => ({ url: u }));
    return urls.map(x => ({ url: String(x.url), filename: x.filename ? String(x.filename) : undefined }));
  }

  /** GM_download 직행 */
  function gmDownloadDirect(fileUrl, name, { saveAs = false, timeout = 60000 } = {}) {
    return new Promise((resolve, reject) => {
      let done = false;
      const finish = (ok, err) => { if (done) return; done = true; ok ? resolve() : reject(err); };
      const t = setTimeout(() => finish(false, new Error('GM_download timeout')), timeout);

      try {
        GM_download({
          url: fileUrl,
          name,
          saveAs,
          onload: () => { clearTimeout(t); finish(true); },
          onerror: (e) => { clearTimeout(t); finish(false, e); },
          ontimeout: () => { clearTimeout(t); finish(false, new Error('timeout')); }
        });
      } catch (e) {
        clearTimeout(t);
        finish(false, e);
      }
    });
  }

  /** GM_xhr로 Blob 받고 blob:URL로 GM_download (Referer/헤더 강제 가능) */
  function gmDownloadViaXHR(fileUrl, name, reqOpt = {}, { saveAs = false, timeout = 60000 } = {}) {
    const {
      referer = location.href,
      headers = {},
      anonymous = false,
      xhrTimeout = Math.max(timeout, 60000)
    } = reqOpt;

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: fileUrl,
        // Tampermonkey는 referer 속성을 지원 (문서화는 제한적, 실제 동작 일반적)
        referer,
        headers: {
          'Accept': headers.Accept || 'image/avif,image/webp,image/*,*/*;q=0.8',
          'Accept-Language': headers['Accept-Language'] || (navigator.language || 'en-US,en;q=0.9'),
          ...headers
        },
        responseType: 'blob',
        anonymous,
        timeout: xhrTimeout,
        onload: (res) => {
          const blob = res.response;
          const objUrl = URL.createObjectURL(blob);
          GM_download({
            url: objUrl,
            name,
            saveAs,
            onload: () => { URL.revokeObjectURL(objUrl); resolve(); },
            onerror: (e) => { URL.revokeObjectURL(objUrl); reject(e); },
            ontimeout: () => { URL.revokeObjectURL(objUrl); reject(new Error('timeout')); }
          });
        },
        onerror: (e) => reject(e),
        ontimeout: () => reject(new Error('timeout')),
      });
    });
  }

  /**
   * 메인 API: 여러 파일을 개별 저장 (ZIP 없음)
   *
   * @param {Array<string|{url:string, filename?:string}>} urls
   * @param {string} folderName           - 접두어로 사용 (예: "제목" → "제목-001.webp")
   * @param {{
   *   concurrency?: number,              // 동시 다운로드 개수(기본 3)
   *   saveAs?: boolean,                  // 각 파일 저장 시 파일선택창(기본 false)
   *   timeoutMs?: number,                // GM_download 타임아웃(기본 60000)
   *   request?: { referer?:string, headers?:object, anonymous?:boolean }, // XHR 경로 옵션
   *   prefixMode?: 'prepend'|'none'      // 파일명 접두어 전략 (기본 'prepend')
   * }} [options]
   * @param {(p:{current:number,total:number,percent:number})=>void} [onProgress]
   * @return {Promise<{successes:Array<{url:string,name:string}>,failures:Array<{url:string,name:string,err:any}>}>}
   */
  async function download(urls, folderName, options = {}, onProgress) {
    assertEnv();

    const {
      concurrency = 3,
      saveAs = false,
      timeoutMs = 60000,
      request = {},
      prefixMode = 'prepend'
    } = options;

    const list = normalizeUrls(urls);
    if (!list.length) {
      const msg = 'urls 가 비어있습니다.';
      if (typeof Toast?.error === 'function') Toast.error(msg);
      throw new Error(msg);
    }

    // 파일명 결정 + 접두어 적용
    const prefix = sanitize(folderName || '');
    const pairs = list.map((item, idx) => {
      const baseName = sanitize(item.filename || inferFilenameFromUrl(item.url) || `file-${idx + 1}`);
      const name = (prefix && prefixMode === 'prepend' && !baseName.startsWith(prefix + '-'))
        ? `${prefix}-${baseName}`
        : baseName;
      return { url: item.url, name };
    });

    // 실행 배치 내 중복명 예방
    const jobs = uniquifyNames(pairs);

    const total = jobs.length;
    let current = 0;
    const progress = () => {
      try {
        onProgress && onProgress({
          current,
          total,
          percent: total ? Math.floor((current / total) * 100) : 100
        });
      } catch {}
    };
    progress();

    // preferXHR: 리퍼러/헤더 지정 시 곧장 XHR 경로 사용
    const preferXHR = !!(request && (request.referer || (request.headers && Object.keys(request.headers).length)));

    const results = await mapWithConcurrency(
      jobs,
      async ({ url, name }) => {
        if (preferXHR) {
          await gmDownloadViaXHR(url, name, request, { saveAs, timeout: timeoutMs });
        } else {
          try {
            await gmDownloadDirect(url, name, { saveAs, timeout: timeoutMs });
          } catch (e) {
            // 핫링크 방지/혼합콘텐츠 등으로 실패 → XHR 폴백
            await gmDownloadViaXHR(url, name, request, { saveAs, timeout: timeoutMs });
          }
        }
        current++; progress();
        return { url, name };
      },
      Math.max(1, concurrency),
      // 파일 단위 완료 시마다 호출됨(위에서 current++로 처리)
      null
    );

    const successes = results
      .map((r, i) => ({ r, j: jobs[i] }))
      .filter(x => x.r?.ok)
      .map(x => ({ url: x.j.url, name: x.j.name }));

    const failures = results
      .map((r, i) => ({ r, j: jobs[i] }))
      .filter(x => !x.r?.ok)
      .map(x => ({ url: x.j.url, name: x.j.name, err: x.r.err }));

    if (successes.length) {
      const msg = failures.length
        ? `다운로드 완료 (성공 ${successes.length} / 실패 ${failures.length})`
        : `다운로드 완료 (총 ${successes.length}개)`;
      if (typeof Toast?.success === 'function') Toast.success(msg);
      if (failures.length) console.warn('[useDownload] 실패 항목:', failures);
    } else {
      const msg = '모든 다운로드가 실패했습니다. (@connect 도메인/권한 및 referer/headers 확인)';
      if (typeof Toast?.error === 'function') Toast.error(msg);
      throw new Error(msg);
    }

    return { successes, failures };
  }

  const api = { download, version: '2.0.0-gm' };
  if (typeof window !== 'undefined') window.useDownload = api;
  if (typeof unsafeWindow !== 'undefined') unsafeWindow.useDownload = api;
})();
