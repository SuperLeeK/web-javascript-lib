/* eslint-disable */
;(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(getRoot());
  } else if (typeof define === "function" && define.amd) {
    define([], () => factory(getRoot()));
  } else {
    const api = factory(getRoot());
    const g = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
    g.useValue = api.useValue;       // tuple API
    g.useValueLib = api;             // factory/low-level helpers
  }
  function getRoot() {
    try { return (typeof unsafeWindow !== "undefined" ? unsafeWindow : window); }
    catch { return undefined; }
  }
})(this, function (root) {
  "use strict";

  // ---- GM fallbacks ----
  const GMX = {
    getValue: (typeof GM_getValue === "function") ? GM_getValue : (k, d)=>{ try{const s=localStorage.getItem(k); return s==null?d:JSON.parse(s);}catch{return d;} },
    setValue: (typeof GM_setValue === "function") ? GM_setValue : (k, v)=>{ try{localStorage.setItem(k, JSON.stringify(v));}catch{} },
    deleteValue: (typeof GM_deleteValue === "function") ? GM_deleteValue : (k)=>{ try{localStorage.removeItem(k);}catch{} },
    addListener: (typeof GM_addValueChangeListener === "function") ? GM_addValueChangeListener : null,
    removeListener: (typeof GM_removeValueChangeListener === "function") ? GM_removeValueChangeListener : null,
  };

  // ---- utils ----
  const isObj = (x) => x && typeof x === 'object';
  const isEqual = (a,b) => { if (a===b) return true; try{ return JSON.stringify(a)===JSON.stringify(b);}catch{return false;} };
  const box = (v)=>({__boxed__:true,v});
  const unbox = (v,d)=> (v&&typeof v==='object'&&v.__boxed__===true) ? v.v : (v===undefined?d:v);
  const withPrefix = (p,k)=> p ? `${p}:${k}` : k;
  const debounce = (fn,ms)=>{ let t=null, lastArgs=null; return function(){ lastArgs=arguments; if(t)clearTimeout(t); t=setTimeout(()=>{t=null; fn.apply(null,lastArgs);}, Math.max(0, ms|0)); } };

  // local pub/sub (non-GM listener env)
  const bus = new Map();
  const emit = (key, nv, ov)=>{ const s=bus.get(key); if(!s) return; for(const cb of s){ try{ cb(nv,ov,false,key);}catch{} } };

  // -------------------------------
  // Tuple API:
  //   const [state, setState] = useValue(WEB_APP_URL, initialValue, options)
  //   - state: 함수(getter)로 제공: 호출 시 최신값 반환 (스냅샷 아님)
  //   - setState(nextOrUpdater): 로컬 갱신 + (옵션에 따라) 원격 push
  //
  // options:
  //   - db: <spreadsheetId>
  //   - sheet: <sheetName>
  //   - token: <shared secret>
  //   - keyField: 'key' (기본), 행의 키로 쓸 필드명
  //   - id: 로컬 저장용 추가 식별자(없으면 keyField 값 사용)
  //   - prefix: 로컬 키 prefix
  //   - serialize(v)/deserialize(v): 저장 전/로드 후 변환 (Date 등)
  //   - auto: { pullOnInit=true, pullIntervalMs=0, pushDebounceMs=0, resolver=defaultResolver }
  // -------------------------------
  function useValue(webAppUrl, initialValue, options){
    const opt = Object.assign({
      db: '',
      sheet: 'kv',
      token: '',
      keyField: 'key',
      id: null,                // 로컬 스토리지 키 구성에 사용할 수 있는 추가 식별자
      prefix: '',
      serialize: (v)=>v,
      deserialize: (v)=>v,
      auto: {
        pullOnInit: true,
        pullIntervalMs: 0,
        pushDebounceMs: 0,
        resolver: defaultResolver, // (local, remote) => final
      },
      // 통신 어댑터 (기본값: Apps Script 웹앱)
      transport: null,
    }, options||{});
    opt.auto = Object.assign({ pullOnInit:true, pullIntervalMs:0, pushDebounceMs:0, resolver: defaultResolver }, opt.auto||{});

    if (typeof webAppUrl !== 'string' || !webAppUrl) throw new Error('useValue(webAppUrl, initialValue, options): webAppUrl required');
    if (!isObj(initialValue)) throw new Error('initialValue must be an object (row)');

    // 키 필드 확인
    const kf = opt.keyField || 'key';
    const initialKey = initialValue[kf];
    if (initialKey === undefined) {
      // 키는 런타임 setState에서 채울 수도 있으므로 강제하지 않음
    }

    // 로컬 저장 키: prefix + sheet + id(or key)
    const localId = String(opt.id ?? initialKey ?? '__noKey__');
    const localKey = withPrefix(opt.prefix, `${opt.sheet}:${localId}`);

    // 통신 어댑터 (Apps Script 기본)
    const transport = opt.transport || makeAppsScriptTransport(webAppUrl, opt.db, opt.sheet, opt.token);

    // 현재값 캐시
    let current = opt.deserialize(unbox(GMX.getValue(localKey, undefined), initialValue));
    if (current === undefined) current = initialValue;

    // 초기 로컬 저장(옵션 없음: 필요시 바로 저장)
    if (GMX.getValue(localKey, undefined) === undefined) {
      GMX.setValue(localKey, box(opt.serialize(current)));
    }

    // push/pull
    const pushDebounced = (opt.auto.pushDebounceMs>0) ? debounce(pushOnce, opt.auto.pushDebounceMs) : pushOnce;
    let pullTimer = null;

    // state getter
    function state(){
      try {
        current = opt.deserialize(unbox(GMX.getValue(localKey, undefined), initialValue));
        if (current === undefined) current = initialValue;
      } catch {}
      return current;
    }

    // setState
    function setState(next){
      const prev = state();
      const nextVal = (typeof next === 'function') ? next(prev) : next;
      if (!isObj(nextVal)) throw new Error('setState expects object (row)');
      GMX.setValue(localKey, box(opt.serialize(nextVal)));
      if (!GMX.addListener) emit(localKey, nextVal, prev);
      // 자동 push
      pushDebounced(nextVal);
      return nextVal;
    }

    // 원격 push
    async function pushOnce(valueObj){
      try {
        // key 필드 확인
        const k = valueObj?.[kf];
        if (!k) return; // 키 없으면 업서트 불가 (사용자가 setState로 key 채운 뒤 재호출)
        await transport.push(opt.sheet, kf, valueObj);
      } catch(e){}
    }

    // 원격 pull + 병합
    async function pullOnce(){
      try {
        const local = state();
        const k = local?.[kf];
        if (!k) return; // 키 없으면 조회 불가
        const remote = await transport.pull(opt.sheet, kf, String(k));
        if (remote === undefined || remote === null) return;
        const resolved = (typeof opt.auto.resolver === 'function') ? opt.auto.resolver(local, remote) : defaultResolver(local, remote);
        if (!isEqual(resolved, local)) {
          GMX.setValue(localKey, box(opt.serialize(resolved)));
          if (!GMX.addListener) emit(localKey, resolved, local);
        }
      } catch(e){}
    }

    // 자동 pull
    if (opt.auto.pullOnInit) { pullOnce(); }
    if ((opt.auto.pullIntervalMs|0) > 0) {
      pullTimer = setInterval(()=>pullOnce(), Math.max(1000, opt.auto.pullIntervalMs|0));
    }

    // 리턴: tuple 형태(요청대로 2개만)
    //   - state: "함수(getter)"로 제공 (항상 최신값을 읽기 위함)
    //   - setState: 객체 또는 (prev)=>객체
    return [ state, setState ];
  }

  // 기본 충돌 해결: LWW(ts) → 없으면 remote 우선
  function defaultResolver(local, remote){
    const lt = Number(isFinite(local?.ts) ? local.ts : -Infinity);
    const rt = Number(isFinite(remote?.ts) ? remote.ts : -Infinity);
    if (isFinite(lt) || isFinite(rt)) return (rt >= lt) ? remote : local;
    return isEqual(local, remote) ? local : remote;
  }

  // Apps Script 전송 어댑터: 자유 컬럼(row) 업서트
  // - row 전체를 그대로 저장 (키: keyField)
  function makeAppsScriptTransport(webAppUrl, db, sheet, token){
    const base = String(webAppUrl).replace(/\/exec.*$/,'/exec'); // 안전
    const headers = { 'Content-Type': 'application/json' };
    // TM 환경이 아니어도 fetch로 대체 가능하도록 방어
    const hasGM = (typeof GM_xmlhttpRequest === 'function');

    function httpPost(json){
      if (hasGM) {
        return new Promise((resolve)=> {
          GM_xmlhttpRequest({
            method: 'POST',
            url: base,
            headers,
            data: JSON.stringify(json),
            onload: ()=> resolve(true),
            onerror: ()=> resolve(false),
          });
        });
      } else {
        return fetch(base, { method:'POST', headers, body: JSON.stringify(json) }).then(()=>true).catch(()=>false);
      }
    }

    function httpGet(params){
      const qs = new URLSearchParams(params).toString();
      const url = `${base}?${qs}`;
      if (hasGM) {
        return new Promise((resolve)=> {
          GM_xmlhttpRequest({
            method: 'GET',
            url,
            onload: (res)=>{
              try{
                const data = JSON.parse(res.responseText);
                resolve(data);
              }catch{ resolve(undefined); }
            },
            onerror: ()=> resolve(undefined),
          });
        });
      } else {
        return fetch(url).then(r=>r.json()).catch(()=>undefined);
      }
    }

    return {
      // row 업서트: { keyField: 'key', valueObj: {...} }
      async push(sheetName, keyField, valueObj){
        const payload = {
          db, sheet: sheetName,
          mode: 'upsertRow',
          keyField,
          row: valueObj,
          ...(token ? { token } : {}),
        };
        await httpPost(payload);
      },
      // 단건 조회
      async pull(sheetName, keyField, keyValue){
        const data = await httpGet({
          db, sheet: sheetName,
          keyField,
          key: keyValue,
          ...(token ? { token } : {}),
        });
        return data;
      }
    };
  }

  // factory (저수준)
  function factory(){ return { useValue }; }

  return { useValue, factory };
});
