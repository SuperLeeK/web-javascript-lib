/* eslint-disable */
;(function (root, factory) {
  // UMD: CommonJS / AMD / Global(unsafeWindow|window)
  if (typeof module === "object" && module.exports) {
    module.exports = factory(getRoot());
  } else if (typeof define === "function" && define.amd) {
    define([], () => factory(getRoot()));
  } else {
    const api = factory(getRoot());
    const g = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
    g.useValue = api.useValue;
    g.useValueLib = api;
  }

  function getRoot() {
    try { return (typeof unsafeWindow !== "undefined" ? unsafeWindow : window); }
    catch { return undefined; }
  }
})(this, function (root) {
  "use strict";

  // -----------------------------
  // GM helpers with graceful fallback
  // -----------------------------
  const GMX = {
    getValue: (typeof GM_getValue === "function") ? GM_getValue : (key, def) => {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? def : JSON.parse(raw);
      } catch { return def; }
    },
    setValue: (typeof GM_setValue === "function") ? GM_setValue : (key, val) => {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    },
    deleteValue: (typeof GM_deleteValue === "function") ? GM_deleteValue : (key) => {
      try { localStorage.removeItem(key); } catch {}
    },
    addListener: (typeof GM_addValueChangeListener === "function") ? GM_addValueChangeListener : null,
    removeListener: (typeof GM_removeValueChangeListener === "function") ? GM_removeValueChangeListener : null,
  };

  // -----------------------------
  // utils
  // -----------------------------
  function withPrefix(prefix, key) {
    if (!prefix) return key;
    return `${prefix}:${key}`;
  }

  // light box/unbox to allow future format changes
  function box(v) { return { __boxed__: true, v }; }
  function unbox(v, def) {
    if (v && typeof v === "object" && v.__boxed__ === true) return v.v;
    return (v === undefined) ? def : v; // backward-compat
  }

  function isEqual(a, b) {
    if (a === b) return true;
    try { return JSON.stringify(a) === JSON.stringify(b); }
    catch { return false; }
  }

  function debounce(fn, ms) {
    let t = null, lastArgs = null, pending = false;
    return function debounced() {
      lastArgs = arguments;
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        t = null;
        pending = false;
        fn.apply(null, lastArgs);
      }, Math.max(0, ms|0));
      pending = true;
    };
  }

  // local pub/sub fallback when GM listeners not available
  const localBus = new Map(); // key -> Set(cb)
  function emitLocal(key, newVal, oldVal) {
    const subs = localBus.get(key);
    if (!subs) return;
    for (const cb of subs) {
      try { cb(newVal, oldVal, false /*remote*/, key); } catch {}
    }
  }

  // -----------------------------
  // core
  // -----------------------------
  /**
   * useValue
   * @param {string} key
   * @param {*} initialValue
   * @param {Object} [opts]
   * @param {string} [opts.prefix=""]
   * @param {boolean} [opts.persistInitial=false] - 값이 없으면 initial을 즉시 저장
   * @param {number} [opts.pollMs=500] - GM listener 미사용 환경에서 폴링 주기
   * @param {function(any):any} [opts.serialize=(v)=>v] - set 직전 변환(예: Date→ISO)
   * @param {function(any):any} [opts.deserialize=(v)=>v] - get 직후 복원(예: ISO→Date)
   * @param {Object} [opts.sync] - 원격 동기화 훅
   * @param {function(string, any):Promise<void|boolean>} [opts.sync.push] - (key, value) 원격 업로드
   * @param {function(string):Promise<any>} [opts.sync.pull] - (key) 원격에서 최신값 받기
   * @param {Object} [opts.auto] - 자동 동기화 제어
   * @param {boolean} [opts.auto.pullOnInit=true] - 생성 시 즉시 원격 pull 시도
   * @param {number} [opts.auto.pullIntervalMs=0] - 주기적 pull (0=비활성)
   * @param {number} [opts.auto.pushDebounceMs=0] - 변경 시 push 디바운스
   * @param {function(local:any, remote:any):any} [opts.auto.resolver] - 충돌 해결(기본 LWW by ts)
   */
  function useValue(key, initialValue, opts) {
    const settings = Object.assign({
      prefix: "",
      persistInitial: false,
      pollMs: 500,
      serialize: (v) => v,
      deserialize: (v) => v,
      sync: null,
      auto: {
        pullOnInit: true,
        pullIntervalMs: 0,
        pushDebounceMs: 0,
        resolver: defaultResolver,
      }
    }, opts || {});
    // normalize auto
    settings.auto = Object.assign({
      pullOnInit: true,
      pullIntervalMs: 0,
      pushDebounceMs: 0,
      resolver: defaultResolver,
    }, settings.auto || {});

    const storageKey = withPrefix(settings.prefix, key);

    // current cache
    let current = settings.deserialize(unbox(GMX.getValue(storageKey, undefined), initialValue));
    if (current === undefined) current = initialValue;

    if (settings.persistInitial) {
      if (GMX.getValue(storageKey, undefined) === undefined) {
        GMX.setValue(storageKey, box(settings.serialize(initialValue)));
      }
    }

    // GM change subscription or fallback polling
    let gmListenerId = null;
    let pollTimer = null;

    // auto sync
    let pullTimer = null;
    const doPush = (settings.auto.pushDebounceMs > 0)
      ? debounce(pushOnce, settings.auto.pushDebounceMs)
      : pushOnce;

    function value() {
      try {
        current = settings.deserialize(unbox(GMX.getValue(storageKey, undefined), initialValue));
        if (current === undefined) current = initialValue;
      } catch {}
      return current;
    }

    function set(next) {
      const prev = value();
      const nextVal = (typeof next === "function") ? next(prev) : next;
      GMX.setValue(storageKey, box(settings.serialize(nextVal)));

      // local bus for non-GM env
      if (!GMX.addListener) emitLocal(storageKey, nextVal, prev);

      // auto push
      if (settings.sync && typeof settings.sync.push === 'function') {
        doPush(storageKey, nextVal);
      }

      return nextVal;
    }

    function remove() {
      const prev = value();
      GMX.deleteValue(storageKey);
      if (!GMX.addListener) emitLocal(storageKey, undefined, prev);
    }

    function onChange(cb) {
      // Prefer GM cross-tab listener
      if (GMX.addListener) {
        gmListenerId = GMX.addListener(storageKey, function (_key, oldBoxed, newBoxed, isRemote) {
          const oldV = settings.deserialize(unbox(oldBoxed, undefined));
          const newV = settings.deserialize(unbox(newBoxed, undefined));
          current = (newV === undefined) ? initialValue : newV;
          try { cb(current, oldV, !!isRemote, storageKey); } catch {}
        });
        return function off() {
          if (gmListenerId != null && GMX.removeListener) {
            GMX.removeListener(gmListenerId);
            gmListenerId = null;
          }
        };
      }

      // Fallback: polling + local bus
      let last = value();
      let setRef = localBus.get(storageKey);
      if (!setRef) {
        setRef = new Set();
        localBus.set(storageKey, setRef);
      }
      setRef.add(cb);

      pollTimer = setInterval(() => {
        const now = value();
        if (!isEqual(now, last)) {
          try { cb(now, last, false, storageKey); } catch {}
          last = now;
        }
      }, Math.max(100, settings.pollMs));

      return function off() {
        try { clearInterval(pollTimer); } catch {}
        const s = localBus.get(storageKey);
        if (s) {
          s.delete(cb);
          if (s.size === 0) localBus.delete(storageKey);
        }
      };
    }

    function getOrSetDefault(factory) {
      const cur = value();
      if (cur === undefined) {
        const v = (typeof factory === "function") ? factory() : factory;
        set(v);
        return v;
      }
      return cur;
    }

    // -----------------------------
    // sync helpers
    // -----------------------------
    async function pushOnce(k, v) {
      try {
        if (!settings.sync || typeof settings.sync.push !== 'function') return;
        await settings.sync.push(k, v);
      } catch (e) {
        // swallow; network errors are common in userscripts
        // console.warn('[useValue] sync.push error:', e);
      }
    }

    async function pullOnce(k) {
      try {
        if (!settings.sync || typeof settings.sync.pull !== 'function') return;
        const remote = await settings.sync.pull(k);
        if (remote === undefined) return; // nothing
        const local = value();

        const resolved = settings.auto && typeof settings.auto.resolver === 'function'
          ? settings.auto.resolver(local, remote)
          : defaultResolver(local, remote);

        if (!isEqual(resolved, local)) {
          // set() will also push; avoid immediate push loop by writing directly then emitting
          GMX.setValue(storageKey, box(settings.serialize(resolved)));
          if (!GMX.addListener) emitLocal(storageKey, resolved, local);
        }
      } catch (e) {
        // console.warn('[useValue] sync.pull error:', e);
      }
    }

    function startAuto() {
      // initial pull
      if (settings.auto.pullOnInit && settings.sync && typeof settings.sync.pull === 'function') {
        // fire-and-forget
        pullOnce(storageKey);
      }
      // interval pull
      if (settings.auto.pullIntervalMs > 0 && settings.sync && typeof settings.sync.pull === 'function') {
        pullTimer = setInterval(() => pullOnce(storageKey), Math.max(1000, settings.auto.pullIntervalMs|0));
      }
    }

    function stopAuto() {
      try { clearInterval(pullTimer); } catch {}
    }

    // start auto-sync now
    startAuto();

    const api = { key: storageKey, value, set, remove, onChange, getOrSetDefault };
    // (optional) expose read-only opts for advanced usage
    Object.defineProperty(api, 'opts', { enumerable: false, configurable: false, writable: false, value: settings });
    Object.defineProperty(api, 'stopAuto', { enumerable: false, configurable: false, writable: false, value: stopAuto });
    Object.defineProperty(api, 'pull', { enumerable: false, configurable: false, writable: false, value: () => pullOnce(storageKey) });
    Object.defineProperty(api, 'push', { enumerable: false, configurable: false, writable: false, value: () => pushOnce(storageKey, value()) });

    return api;
  }

  // Default conflict resolver: Last-Write-Wins by numeric timestamp
  // If objects have .ts (number) field, choose greater; else prefer remote if different.
  function defaultResolver(local, remote) {
    if (local && typeof local === 'object' && remote && typeof remote === 'object') {
      const lt = Number(isFinite(local.ts) ? local.ts : -Infinity);
      const rt = Number(isFinite(remote.ts) ? remote.ts : -Infinity);
      if (lt !== -Infinity || rt !== -Infinity) {
        return (rt >= lt) ? remote : local;
      }
      // if no ts, prefer remote on difference
      return isEqual(local, remote) ? local : remote;
    }
    return (remote !== undefined) ? remote : local;
  }

  // -----------------------------
  // factory (prefix-aware static API)
  // -----------------------------
  function factory(prefix = "") {
    return {
      useValue: (k, init, opts) => useValue(k, init, Object.assign({ prefix }, opts || {})),
      get: (k, def, deserialize = (v)=>v) => deserialize(unbox(GMX.getValue(withPrefix(prefix, k), undefined), def)),
      set: (k, v, serialize = (v)=>v) => GMX.setValue(withPrefix(prefix, k), box(serialize(v))),
      remove: (k) => GMX.deleteValue(withPrefix(prefix, k)),
    };
  }

  // default export
  const defaultApi = factory("");

  return Object.assign(defaultApi, {
    factory,
    useValue,
  });
});
