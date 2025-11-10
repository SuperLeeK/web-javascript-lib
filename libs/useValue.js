/* eslint-disable */
;(function (root, factory) {
  // UMD: CommonJS / AMD / Global(unsafeWindow|window)
  if (typeof module === "object" && module.exports) {
    module.exports = factory(getRoot());
  } else if (typeof define === "function" && define.amd) {
    define([], () => factory(getRoot()));
  } else {
    const api = factory(getRoot());
    (root || (typeof unsafeWindow !== "undefined" ? unsafeWindow : window)).useValue = api.useValue;
    (root || (typeof unsafeWindow !== "undefined" ? unsafeWindow : window)).useValueLib = api;
  }

  function getRoot() {
    try { return (typeof unsafeWindow !== "undefined" ? unsafeWindow : window); }
    catch { return undefined; }
  }
})(this, function (root) {
  "use strict";

  // ---- GM helpers with graceful fallback ----
  const GM = {
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

  // ---- util: key prefixer ----
  function withPrefix(prefix, key) {
    if (!prefix) return key;
    return `${prefix}:${key}`;
  }

  // ---- safe JSON boxing (type-safe, future-proof) ----
  function box(v) { return { __boxed__: true, v }; }
  function unbox(v, def) {
    if (v && typeof v === "object" && v.__boxed__ === true) return v.v;
    // backward compatibility if someone wrote plain JSON earlier
    return (v === undefined) ? def : v;
  }

  // ---- minimal pub/sub for non-GM environments ----
  const localBus = new Map(); // key -> Set(callback)
  function emitLocal(key, newVal, oldVal) {
    const subs = localBus.get(key);
    if (!subs) return;
    for (const cb of subs) {
      try { cb(newVal, oldVal, false /*remote*/, key); } catch {}
    }
  }

  /**
   * useValue
   * @param {string} key - logical key (without namespace prefix)
   * @param {*} initialValue - fallback value if not set
   * @param {Object} [opts]
   * @param {string} [opts.prefix=""] - namespace prefix (e.g., "4KHD" or script name)
   * @param {boolean} [opts.persistInitial=false] - 저장값이 없을 때 initialValue를 즉시 저장할지 여부
   * @param {number} [opts.pollMs=500] - GM_changeListener가 없을 때 폴링 주기(ms)
   * @returns {Object} api
   *
   *  const state = useValue('visited-123', false, { prefix: '4KHD' });
   *  const v = state.value();        // 읽기
   *  state.set(true);                // 쓰기
   *  const off = state.onChange((newV, oldV, remote, k) => { ... });
   *  state.remove();
   */
  function useValue(key, initialValue, opts) {
    const settings = Object.assign({ prefix: "", persistInitial: false, pollMs: 500 }, opts || {});
    const storageKey = withPrefix(settings.prefix, key);

    // Initialize
    let current = unbox(GM.getValue(storageKey, undefined), initialValue);
    if (current === undefined) current = initialValue;

    if (settings.persistInitial) {
      // 저장값이 없으면 initialValue를 저장
      if (GM.getValue(storageKey, undefined) === undefined) {
        GM.setValue(storageKey, box(initialValue));
      }
    }

    // GM listener (cross-tab) or local polling fallback
    let listenerId = null;
    let pollTimer = null;

    function value() {
      // 항상 최신값을 읽음
      try {
        current = unbox(GM.getValue(storageKey, undefined), initialValue);
        if (current === undefined) current = initialValue;
      } catch {}
      return current;
    }

    function set(next) {
      const prev = value();
      const nextVal = (typeof next === "function") ? next(prev) : next;
      GM.setValue(storageKey, box(nextVal));

      // 로컬 이벤트 버스 (fallback)
      if (!GM.addListener) emitLocal(storageKey, nextVal, prev);

      return nextVal;
    }

    function remove() {
      const prev = value();
      GM.deleteValue(storageKey);

      if (!GM.addListener) emitLocal(storageKey, undefined, prev);
    }

    // subscribe to changes
    function onChange(cb) {
      // Priority: GM_addValueChangeListener (cross-tab & same-tab)
      if (GM.addListener) {
        listenerId = GM.addListener(storageKey, function (_key, oldBoxed, newBoxed, isRemote) {
          const oldV = unbox(oldBoxed, undefined);
          const newV = unbox(newBoxed, undefined);
          current = (newV === undefined) ? initialValue : newV;
          try { cb(current, oldV, !!isRemote, storageKey); } catch {}
        });
        return function off() {
          if (listenerId != null && GM.removeListener) {
            GM.removeListener(listenerId);
            listenerId = null;
          }
        };
      }

      // Fallback: polling + localBus
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
        try {
          clearInterval(pollTimer);
        } catch {}
        const s = localBus.get(storageKey);
        if (s) {
          s.delete(cb);
          if (s.size === 0) localBus.delete(storageKey);
        }
      };
    }

    // helpers
    function getOrSetDefault(factory) {
      const cur = value();
      if (cur === undefined) {
        const v = (typeof factory === "function") ? factory() : factory;
        set(v);
        return v;
      }
      return cur;
    }

    return { key: storageKey, value, set, remove, onChange, getOrSetDefault };
  }

  // shallow-ish equality (JSON fallback)
  function isEqual(a, b) {
    if (a === b) return true;
    try { return JSON.stringify(a) === JSON.stringify(b); }
    catch { return false; }
  }

  // convenience static API (prefix aware)
  function factory(prefix = "") {
    return {
      useValue: (k, init, opts) => useValue(k, init, Object.assign({ prefix }, opts || {})),
      get: (k, def) => unbox(GM.getValue(withPrefix(prefix, k), undefined), def),
      set: (k, v) => GM.setValue(withPrefix(prefix, k), box(v)),
      remove: (k) => GM.deleteValue(withPrefix(prefix, k)),
    };
  }

  // default export (no prefix)
  const defaultApi = factory("");

  // named + default
  return Object.assign(defaultApi, {
    factory,
    useValue,
  });
});
