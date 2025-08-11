var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// ../node_modules/react/cjs/react.production.min.js
var exports_react_production_min = {};
__export(exports_react_production_min, {
  version: () => $version,
  useTransition: () => $useTransition,
  useSyncExternalStore: () => $useSyncExternalStore,
  useState: () => $useState,
  useRef: () => $useRef,
  useReducer: () => $useReducer,
  useMemo: () => $useMemo,
  useLayoutEffect: () => $useLayoutEffect,
  useInsertionEffect: () => $useInsertionEffect,
  useImperativeHandle: () => $useImperativeHandle,
  useId: () => $useId,
  useEffect: () => $useEffect,
  useDeferredValue: () => $useDeferredValue,
  useDebugValue: () => $useDebugValue,
  useContext: () => $useContext,
  useCallback: () => $useCallback,
  unstable_act: () => $unstable_act,
  startTransition: () => $startTransition,
  memo: () => $memo,
  lazy: () => $lazy,
  isValidElement: () => $isValidElement,
  forwardRef: () => $forwardRef,
  createRef: () => $createRef,
  createFactory: () => $createFactory,
  createElement: () => $createElement,
  createContext: () => $createContext,
  cloneElement: () => $cloneElement,
  act: () => $act,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: () => $__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Suspense: () => $Suspense,
  StrictMode: () => $StrictMode,
  PureComponent: () => $PureComponent,
  Profiler: () => $Profiler,
  Fragment: () => $Fragment,
  Component: () => $Component,
  Children: () => $Children
});
function A(a) {
  if (a === null || typeof a !== "object")
    return null;
  a = z && a[z] || a["@@iterator"];
  return typeof a === "function" ? a : null;
}
function E(a, b, e) {
  this.props = a;
  this.context = b;
  this.refs = D;
  this.updater = e || B;
}
function F() {}
function G(a, b, e) {
  this.props = a;
  this.context = b;
  this.refs = D;
  this.updater = e || B;
}
function M(a, b, e) {
  var d, c = {}, k = null, h = null;
  if (b != null)
    for (d in b.ref !== undefined && (h = b.ref), b.key !== undefined && (k = "" + b.key), b)
      J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
  var g = arguments.length - 2;
  if (g === 1)
    c.children = e;
  else if (1 < g) {
    for (var f = Array(g), m = 0;m < g; m++)
      f[m] = arguments[m + 2];
    c.children = f;
  }
  if (a && a.defaultProps)
    for (d in g = a.defaultProps, g)
      c[d] === undefined && (c[d] = g[d]);
  return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
}
function N(a, b) {
  return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
}
function O(a) {
  return typeof a === "object" && a !== null && a.$$typeof === l;
}
function escape(a) {
  var b = { "=": "=0", ":": "=2" };
  return "$" + a.replace(/[=:]/g, function(a2) {
    return b[a2];
  });
}
function Q(a, b) {
  return typeof a === "object" && a !== null && a.key != null ? escape("" + a.key) : b.toString(36);
}
function R(a, b, e, d, c) {
  var k = typeof a;
  if (k === "undefined" || k === "boolean")
    a = null;
  var h = false;
  if (a === null)
    h = true;
  else
    switch (k) {
      case "string":
      case "number":
        h = true;
        break;
      case "object":
        switch (a.$$typeof) {
          case l:
          case n:
            h = true;
        }
    }
  if (h)
    return h = a, c = c(h), a = d === "" ? "." + Q(h, 0) : d, I(c) ? (e = "", a != null && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
      return a2;
    })) : c != null && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
  h = 0;
  d = d === "" ? "." : d + ":";
  if (I(a))
    for (var g = 0;g < a.length; g++) {
      k = a[g];
      var f = d + Q(k, g);
      h += R(k, b, e, f, c);
    }
  else if (f = A(a), typeof f === "function")
    for (a = f.call(a), g = 0;!(k = a.next()).done; )
      k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
  else if (k === "object")
    throw b = String(a), Error("Objects are not valid as a React child (found: " + (b === "[object Object]" ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
  return h;
}
function S(a, b, e) {
  if (a == null)
    return a;
  var d = [], c = 0;
  R(a, d, "", "", function(a2) {
    return b.call(e, a2, c++);
  });
  return d;
}
function T(a) {
  if (a._status === -1) {
    var b = a._result;
    b = b();
    b.then(function(b2) {
      if (a._status === 0 || a._status === -1)
        a._status = 1, a._result = b2;
    }, function(b2) {
      if (a._status === 0 || a._status === -1)
        a._status = 2, a._result = b2;
    });
    a._status === -1 && (a._status = 0, a._result = b);
  }
  if (a._status === 1)
    return a._result.default;
  throw a._result;
}
function X() {
  throw Error("act(...) is not supported in production builds of React.");
}
var l, n, p, q, r, t, u, v, w, x, y, z, B, C, D, H, I, J, K, L, P, U, V, W, $Children, $Component, $Fragment, $Profiler, $PureComponent, $StrictMode, $Suspense, $__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, $act, $cloneElement = function(a, b, e) {
  if (a === null || a === undefined)
    throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
  var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
  if (b != null) {
    b.ref !== undefined && (k = b.ref, h = K.current);
    b.key !== undefined && (c = "" + b.key);
    if (a.type && a.type.defaultProps)
      var g = a.type.defaultProps;
    for (f in b)
      J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = b[f] === undefined && g !== undefined ? g[f] : b[f]);
  }
  var f = arguments.length - 2;
  if (f === 1)
    d.children = e;
  else if (1 < f) {
    g = Array(f);
    for (var m = 0;m < f; m++)
      g[m] = arguments[m + 2];
    d.children = g;
  }
  return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
}, $createContext = function(a) {
  a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
  a.Provider = { $$typeof: t, _context: a };
  return a.Consumer = a;
}, $createElement, $createFactory = function(a) {
  var b = M.bind(null, a);
  b.type = a;
  return b;
}, $createRef = function() {
  return { current: null };
}, $forwardRef = function(a) {
  return { $$typeof: v, render: a };
}, $isValidElement, $lazy = function(a) {
  return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
}, $memo = function(a, b) {
  return { $$typeof: x, type: a, compare: b === undefined ? null : b };
}, $startTransition = function(a) {
  var b = V.transition;
  V.transition = {};
  try {
    a();
  } finally {
    V.transition = b;
  }
}, $unstable_act, $useCallback = function(a, b) {
  return U.current.useCallback(a, b);
}, $useContext = function(a) {
  return U.current.useContext(a);
}, $useDebugValue = function() {}, $useDeferredValue = function(a) {
  return U.current.useDeferredValue(a);
}, $useEffect = function(a, b) {
  return U.current.useEffect(a, b);
}, $useId = function() {
  return U.current.useId();
}, $useImperativeHandle = function(a, b, e) {
  return U.current.useImperativeHandle(a, b, e);
}, $useInsertionEffect = function(a, b) {
  return U.current.useInsertionEffect(a, b);
}, $useLayoutEffect = function(a, b) {
  return U.current.useLayoutEffect(a, b);
}, $useMemo = function(a, b) {
  return U.current.useMemo(a, b);
}, $useReducer = function(a, b, e) {
  return U.current.useReducer(a, b, e);
}, $useRef = function(a) {
  return U.current.useRef(a);
}, $useState = function(a) {
  return U.current.useState(a);
}, $useSyncExternalStore = function(a, b, e) {
  return U.current.useSyncExternalStore(a, b, e);
}, $useTransition = function() {
  return U.current.useTransition();
}, $version = "18.3.1";
var init_react_production_min = __esm(() => {
  l = Symbol.for("react.element");
  n = Symbol.for("react.portal");
  p = Symbol.for("react.fragment");
  q = Symbol.for("react.strict_mode");
  r = Symbol.for("react.profiler");
  t = Symbol.for("react.provider");
  u = Symbol.for("react.context");
  v = Symbol.for("react.forward_ref");
  w = Symbol.for("react.suspense");
  x = Symbol.for("react.memo");
  y = Symbol.for("react.lazy");
  z = Symbol.iterator;
  B = { isMounted: function() {
    return false;
  }, enqueueForceUpdate: function() {}, enqueueReplaceState: function() {}, enqueueSetState: function() {} };
  C = Object.assign;
  D = {};
  E.prototype.isReactComponent = {};
  E.prototype.setState = function(a, b) {
    if (typeof a !== "object" && typeof a !== "function" && a != null)
      throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, a, b, "setState");
  };
  E.prototype.forceUpdate = function(a) {
    this.updater.enqueueForceUpdate(this, a, "forceUpdate");
  };
  F.prototype = E.prototype;
  H = G.prototype = new F;
  H.constructor = G;
  C(H, E.prototype);
  H.isPureReactComponent = true;
  I = Array.isArray;
  J = Object.prototype.hasOwnProperty;
  K = { current: null };
  L = { key: true, ref: true, __self: true, __source: true };
  P = /\/+/g;
  U = { current: null };
  V = { transition: null };
  W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
  $Children = { map: S, forEach: function(a, b, e) {
    S(a, function() {
      b.apply(this, arguments);
    }, e);
  }, count: function(a) {
    var b = 0;
    S(a, function() {
      b++;
    });
    return b;
  }, toArray: function(a) {
    return S(a, function(a2) {
      return a2;
    }) || [];
  }, only: function(a) {
    if (!O(a))
      throw Error("React.Children.only expected to receive a single React element child.");
    return a;
  } };
  $Component = E;
  $Fragment = p;
  $Profiler = r;
  $PureComponent = G;
  $StrictMode = q;
  $Suspense = w;
  $__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
  $act = X;
  $createElement = M;
  $isValidElement = O;
  $unstable_act = X;
});

// ../node_modules/react/index.js
var require_react = __commonJS((exports, module) => {
  init_react_production_min();
  if (true) {
    module.exports = exports_react_production_min;
  } else {}
});

// ../node_modules/react/cjs/react-jsx-runtime.production.min.js
var exports_react_jsx_runtime_production_min = {};
__export(exports_react_jsx_runtime_production_min, {
  jsxs: () => $jsxs,
  jsx: () => $jsx,
  Fragment: () => $Fragment2
});
function q2(c, a, g) {
  var b, d = {}, e = null, h = null;
  g !== undefined && (e = "" + g);
  a.key !== undefined && (e = "" + a.key);
  a.ref !== undefined && (h = a.ref);
  for (b in a)
    m.call(a, b) && !p2.hasOwnProperty(b) && (d[b] = a[b]);
  if (c && c.defaultProps)
    for (b in a = c.defaultProps, a)
      d[b] === undefined && (d[b] = a[b]);
  return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n2.current };
}
var f, k, l2, m, n2, p2, $Fragment2, $jsx, $jsxs;
var init_react_jsx_runtime_production_min = __esm(() => {
  f = __toESM(require_react(), 1);
  k = Symbol.for("react.element");
  l2 = Symbol.for("react.fragment");
  m = Object.prototype.hasOwnProperty;
  n2 = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
  p2 = { key: true, ref: true, __self: true, __source: true };
  $Fragment2 = l2;
  $jsx = q2;
  $jsxs = q2;
});

// ../node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS((exports, module) => {
  init_react_jsx_runtime_production_min();
  if (true) {
    module.exports = exports_react_jsx_runtime_production_min;
  } else {}
});

// ../node_modules/scheduler/cjs/scheduler.production.min.js
var require_scheduler_production_min = __commonJS((exports) => {
  function f2(a, b) {
    var c = a.length;
    a.push(b);
    a:
      for (;0 < c; ) {
        var d = c - 1 >>> 1, e = a[d];
        if (0 < g(e, b))
          a[d] = b, a[c] = e, c = d;
        else
          break a;
      }
  }
  function h(a) {
    return a.length === 0 ? null : a[0];
  }
  function k2(a) {
    if (a.length === 0)
      return null;
    var b = a[0], c = a.pop();
    if (c !== b) {
      a[0] = c;
      a:
        for (var d = 0, e = a.length, w2 = e >>> 1;d < w2; ) {
          var m2 = 2 * (d + 1) - 1, C2 = a[m2], n3 = m2 + 1, x2 = a[n3];
          if (0 > g(C2, c))
            n3 < e && 0 > g(x2, C2) ? (a[d] = x2, a[n3] = c, d = n3) : (a[d] = C2, a[m2] = c, d = m2);
          else if (n3 < e && 0 > g(x2, c))
            a[d] = x2, a[n3] = c, d = n3;
          else
            break a;
        }
    }
    return b;
  }
  function g(a, b) {
    var c = a.sortIndex - b.sortIndex;
    return c !== 0 ? c : a.id - b.id;
  }
  if (typeof performance === "object" && typeof performance.now === "function") {
    l3 = performance;
    exports.unstable_now = function() {
      return l3.now();
    };
  } else {
    p3 = Date, q3 = p3.now();
    exports.unstable_now = function() {
      return p3.now() - q3;
    };
  }
  var l3;
  var p3;
  var q3;
  var r2 = [];
  var t2 = [];
  var u2 = 1;
  var v2 = null;
  var y2 = 3;
  var z2 = false;
  var A2 = false;
  var B2 = false;
  var D2 = typeof setTimeout === "function" ? setTimeout : null;
  var E2 = typeof clearTimeout === "function" ? clearTimeout : null;
  var F2 = typeof setImmediate !== "undefined" ? setImmediate : null;
  typeof navigator !== "undefined" && navigator.scheduling !== undefined && navigator.scheduling.isInputPending !== undefined && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function G2(a) {
    for (var b = h(t2);b !== null; ) {
      if (b.callback === null)
        k2(t2);
      else if (b.startTime <= a)
        k2(t2), b.sortIndex = b.expirationTime, f2(r2, b);
      else
        break;
      b = h(t2);
    }
  }
  function H2(a) {
    B2 = false;
    G2(a);
    if (!A2)
      if (h(r2) !== null)
        A2 = true, I2(J2);
      else {
        var b = h(t2);
        b !== null && K2(H2, b.startTime - a);
      }
  }
  function J2(a, b) {
    A2 = false;
    B2 && (B2 = false, E2(L2), L2 = -1);
    z2 = true;
    var c = y2;
    try {
      G2(b);
      for (v2 = h(r2);v2 !== null && (!(v2.expirationTime > b) || a && !M2()); ) {
        var d = v2.callback;
        if (typeof d === "function") {
          v2.callback = null;
          y2 = v2.priorityLevel;
          var e = d(v2.expirationTime <= b);
          b = exports.unstable_now();
          typeof e === "function" ? v2.callback = e : v2 === h(r2) && k2(r2);
          G2(b);
        } else
          k2(r2);
        v2 = h(r2);
      }
      if (v2 !== null)
        var w2 = true;
      else {
        var m2 = h(t2);
        m2 !== null && K2(H2, m2.startTime - b);
        w2 = false;
      }
      return w2;
    } finally {
      v2 = null, y2 = c, z2 = false;
    }
  }
  var N2 = false;
  var O2 = null;
  var L2 = -1;
  var P2 = 5;
  var Q2 = -1;
  function M2() {
    return exports.unstable_now() - Q2 < P2 ? false : true;
  }
  function R2() {
    if (O2 !== null) {
      var a = exports.unstable_now();
      Q2 = a;
      var b = true;
      try {
        b = O2(true, a);
      } finally {
        b ? S2() : (N2 = false, O2 = null);
      }
    } else
      N2 = false;
  }
  var S2;
  if (typeof F2 === "function")
    S2 = function() {
      F2(R2);
    };
  else if (typeof MessageChannel !== "undefined") {
    T2 = new MessageChannel, U2 = T2.port2;
    T2.port1.onmessage = R2;
    S2 = function() {
      U2.postMessage(null);
    };
  } else
    S2 = function() {
      D2(R2, 0);
    };
  var T2;
  var U2;
  function I2(a) {
    O2 = a;
    N2 || (N2 = true, S2());
  }
  function K2(a, b) {
    L2 = D2(function() {
      a(exports.unstable_now());
    }, b);
  }
  exports.unstable_IdlePriority = 5;
  exports.unstable_ImmediatePriority = 1;
  exports.unstable_LowPriority = 4;
  exports.unstable_NormalPriority = 3;
  exports.unstable_Profiling = null;
  exports.unstable_UserBlockingPriority = 2;
  exports.unstable_cancelCallback = function(a) {
    a.callback = null;
  };
  exports.unstable_continueExecution = function() {
    A2 || z2 || (A2 = true, I2(J2));
  };
  exports.unstable_forceFrameRate = function(a) {
    0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P2 = 0 < a ? Math.floor(1000 / a) : 5;
  };
  exports.unstable_getCurrentPriorityLevel = function() {
    return y2;
  };
  exports.unstable_getFirstCallbackNode = function() {
    return h(r2);
  };
  exports.unstable_next = function(a) {
    switch (y2) {
      case 1:
      case 2:
      case 3:
        var b = 3;
        break;
      default:
        b = y2;
    }
    var c = y2;
    y2 = b;
    try {
      return a();
    } finally {
      y2 = c;
    }
  };
  exports.unstable_pauseExecution = function() {};
  exports.unstable_requestPaint = function() {};
  exports.unstable_runWithPriority = function(a, b) {
    switch (a) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        a = 3;
    }
    var c = y2;
    y2 = a;
    try {
      return b();
    } finally {
      y2 = c;
    }
  };
  exports.unstable_scheduleCallback = function(a, b, c) {
    var d = exports.unstable_now();
    typeof c === "object" && c !== null ? (c = c.delay, c = typeof c === "number" && 0 < c ? d + c : d) : c = d;
    switch (a) {
      case 1:
        var e = -1;
        break;
      case 2:
        e = 250;
        break;
      case 5:
        e = 1073741823;
        break;
      case 4:
        e = 1e4;
        break;
      default:
        e = 5000;
    }
    e = c + e;
    a = { id: u2++, callback: b, priorityLevel: a, startTime: c, expirationTime: e, sortIndex: -1 };
    c > d ? (a.sortIndex = c, f2(t2, a), h(r2) === null && a === h(t2) && (B2 ? (E2(L2), L2 = -1) : B2 = true, K2(H2, c - d))) : (a.sortIndex = e, f2(r2, a), A2 || z2 || (A2 = true, I2(J2)));
    return a;
  };
  exports.unstable_shouldYield = M2;
  exports.unstable_wrapCallback = function(a) {
    var b = y2;
    return function() {
      var c = y2;
      y2 = b;
      try {
        return a.apply(this, arguments);
      } finally {
        y2 = c;
      }
    };
  };
});

// ../node_modules/scheduler/index.js
var require_scheduler = __commonJS((exports, module) => {
  var scheduler_production_min = __toESM(require_scheduler_production_min(), 1);
  if (true) {
    module.exports = scheduler_production_min;
  } else {}
});

// ../node_modules/react-dom/cjs/react-dom.production.min.js
var exports_react_dom_production_min = {};
__export(exports_react_dom_production_min, {
  version: () => $version2,
  unstable_renderSubtreeIntoContainer: () => $unstable_renderSubtreeIntoContainer,
  unstable_batchedUpdates: () => $unstable_batchedUpdates,
  unmountComponentAtNode: () => $unmountComponentAtNode,
  render: () => $render,
  hydrateRoot: () => $hydrateRoot,
  hydrate: () => $hydrate,
  flushSync: () => $flushSync,
  findDOMNode: () => $findDOMNode,
  createRoot: () => $createRoot,
  createPortal: () => $createPortal,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: () => $__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED2
});
function p3(a) {
  for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1;c < arguments.length; c++)
    b += "&args[]=" + encodeURIComponent(arguments[c]);
  return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
function fa(a, b) {
  ha(a, b);
  ha(a + "Capture", b);
}
function ha(a, b) {
  ea[a] = b;
  for (a = 0;a < b.length; a++)
    da.add(b[a]);
}
function oa(a) {
  if (ja.call(ma, a))
    return true;
  if (ja.call(la, a))
    return false;
  if (ka.test(a))
    return ma[a] = true;
  la[a] = true;
  return false;
}
function pa(a, b, c, d) {
  if (c !== null && c.type === 0)
    return false;
  switch (typeof b) {
    case "function":
    case "symbol":
      return true;
    case "boolean":
      if (d)
        return false;
      if (c !== null)
        return !c.acceptsBooleans;
      a = a.toLowerCase().slice(0, 5);
      return a !== "data-" && a !== "aria-";
    default:
      return false;
  }
}
function qa(a, b, c, d) {
  if (b === null || typeof b === "undefined" || pa(a, b, c, d))
    return true;
  if (d)
    return false;
  if (c !== null)
    switch (c.type) {
      case 3:
        return !b;
      case 4:
        return b === false;
      case 5:
        return isNaN(b);
      case 6:
        return isNaN(b) || 1 > b;
    }
  return false;
}
function v2(a, b, c, d, e, f2, g) {
  this.acceptsBooleans = b === 2 || b === 3 || b === 4;
  this.attributeName = d;
  this.attributeNamespace = e;
  this.mustUseProperty = c;
  this.propertyName = a;
  this.type = b;
  this.sanitizeURL = f2;
  this.removeEmptyString = g;
}
function sa(a) {
  return a[1].toUpperCase();
}
function ta(a, b, c, d) {
  var e = z2.hasOwnProperty(b) ? z2[b] : null;
  if (e !== null ? e.type !== 0 : d || !(2 < b.length) || b[0] !== "o" && b[0] !== "O" || b[1] !== "n" && b[1] !== "N")
    qa(b, c, e, d) && (c = null), d || e === null ? oa(b) && (c === null ? a.removeAttribute(b) : a.setAttribute(b, "" + c)) : e.mustUseProperty ? a[e.propertyName] = c === null ? e.type === 3 ? false : "" : c : (b = e.attributeName, d = e.attributeNamespace, c === null ? a.removeAttribute(b) : (e = e.type, c = e === 3 || e === 4 && c === true ? "" : "" + c, d ? a.setAttributeNS(d, b, c) : a.setAttribute(b, c)));
}
function Ka(a) {
  if (a === null || typeof a !== "object")
    return null;
  a = Ja && a[Ja] || a["@@iterator"];
  return typeof a === "function" ? a : null;
}
function Ma(a) {
  if (La === undefined)
    try {
      throw Error();
    } catch (c) {
      var b = c.stack.trim().match(/\n( *(at )?)/);
      La = b && b[1] || "";
    }
  return `
` + La + a;
}
function Oa(a, b) {
  if (!a || Na)
    return "";
  Na = true;
  var c = Error.prepareStackTrace;
  Error.prepareStackTrace = undefined;
  try {
    if (b)
      if (b = function() {
        throw Error();
      }, Object.defineProperty(b.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect === "object" && Reflect.construct) {
        try {
          Reflect.construct(b, []);
        } catch (l3) {
          var d = l3;
        }
        Reflect.construct(a, [], b);
      } else {
        try {
          b.call();
        } catch (l3) {
          d = l3;
        }
        a.call(b.prototype);
      }
    else {
      try {
        throw Error();
      } catch (l3) {
        d = l3;
      }
      a();
    }
  } catch (l3) {
    if (l3 && d && typeof l3.stack === "string") {
      for (var e = l3.stack.split(`
`), f2 = d.stack.split(`
`), g = e.length - 1, h = f2.length - 1;1 <= g && 0 <= h && e[g] !== f2[h]; )
        h--;
      for (;1 <= g && 0 <= h; g--, h--)
        if (e[g] !== f2[h]) {
          if (g !== 1 || h !== 1) {
            do
              if (g--, h--, 0 > h || e[g] !== f2[h]) {
                var k2 = `
` + e[g].replace(" at new ", " at ");
                a.displayName && k2.includes("<anonymous>") && (k2 = k2.replace("<anonymous>", a.displayName));
                return k2;
              }
            while (1 <= g && 0 <= h);
          }
          break;
        }
    }
  } finally {
    Na = false, Error.prepareStackTrace = c;
  }
  return (a = a ? a.displayName || a.name : "") ? Ma(a) : "";
}
function Pa(a) {
  switch (a.tag) {
    case 5:
      return Ma(a.type);
    case 16:
      return Ma("Lazy");
    case 13:
      return Ma("Suspense");
    case 19:
      return Ma("SuspenseList");
    case 0:
    case 2:
    case 15:
      return a = Oa(a.type, false), a;
    case 11:
      return a = Oa(a.type.render, false), a;
    case 1:
      return a = Oa(a.type, true), a;
    default:
      return "";
  }
}
function Qa(a) {
  if (a == null)
    return null;
  if (typeof a === "function")
    return a.displayName || a.name || null;
  if (typeof a === "string")
    return a;
  switch (a) {
    case ya:
      return "Fragment";
    case wa:
      return "Portal";
    case Aa:
      return "Profiler";
    case za:
      return "StrictMode";
    case Ea:
      return "Suspense";
    case Fa:
      return "SuspenseList";
  }
  if (typeof a === "object")
    switch (a.$$typeof) {
      case Ca:
        return (a.displayName || "Context") + ".Consumer";
      case Ba:
        return (a._context.displayName || "Context") + ".Provider";
      case Da:
        var b = a.render;
        a = a.displayName;
        a || (a = b.displayName || b.name || "", a = a !== "" ? "ForwardRef(" + a + ")" : "ForwardRef");
        return a;
      case Ga:
        return b = a.displayName || null, b !== null ? b : Qa(a.type) || "Memo";
      case Ha:
        b = a._payload;
        a = a._init;
        try {
          return Qa(a(b));
        } catch (c) {}
    }
  return null;
}
function Ra(a) {
  var b = a.type;
  switch (a.tag) {
    case 24:
      return "Cache";
    case 9:
      return (b.displayName || "Context") + ".Consumer";
    case 10:
      return (b._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return a = b.render, a = a.displayName || a.name || "", b.displayName || (a !== "" ? "ForwardRef(" + a + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return b;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Qa(b);
    case 8:
      return b === za ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof b === "function")
        return b.displayName || b.name || null;
      if (typeof b === "string")
        return b;
  }
  return null;
}
function Sa(a) {
  switch (typeof a) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return a;
    case "object":
      return a;
    default:
      return "";
  }
}
function Ta(a) {
  var b = a.type;
  return (a = a.nodeName) && a.toLowerCase() === "input" && (b === "checkbox" || b === "radio");
}
function Ua(a) {
  var b = Ta(a) ? "checked" : "value", c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b), d = "" + a[b];
  if (!a.hasOwnProperty(b) && typeof c !== "undefined" && typeof c.get === "function" && typeof c.set === "function") {
    var { get: e, set: f2 } = c;
    Object.defineProperty(a, b, { configurable: true, get: function() {
      return e.call(this);
    }, set: function(a2) {
      d = "" + a2;
      f2.call(this, a2);
    } });
    Object.defineProperty(a, b, { enumerable: c.enumerable });
    return { getValue: function() {
      return d;
    }, setValue: function(a2) {
      d = "" + a2;
    }, stopTracking: function() {
      a._valueTracker = null;
      delete a[b];
    } };
  }
}
function Va(a) {
  a._valueTracker || (a._valueTracker = Ua(a));
}
function Wa(a) {
  if (!a)
    return false;
  var b = a._valueTracker;
  if (!b)
    return true;
  var c = b.getValue();
  var d = "";
  a && (d = Ta(a) ? a.checked ? "true" : "false" : a.value);
  a = d;
  return a !== c ? (b.setValue(a), true) : false;
}
function Xa(a) {
  a = a || (typeof document !== "undefined" ? document : undefined);
  if (typeof a === "undefined")
    return null;
  try {
    return a.activeElement || a.body;
  } catch (b) {
    return a.body;
  }
}
function Ya(a, b) {
  var c = b.checked;
  return A2({}, b, { defaultChecked: undefined, defaultValue: undefined, value: undefined, checked: c != null ? c : a._wrapperState.initialChecked });
}
function Za(a, b) {
  var c = b.defaultValue == null ? "" : b.defaultValue, d = b.checked != null ? b.checked : b.defaultChecked;
  c = Sa(b.value != null ? b.value : c);
  a._wrapperState = { initialChecked: d, initialValue: c, controlled: b.type === "checkbox" || b.type === "radio" ? b.checked != null : b.value != null };
}
function ab(a, b) {
  b = b.checked;
  b != null && ta(a, "checked", b, false);
}
function bb(a, b) {
  ab(a, b);
  var c = Sa(b.value), d = b.type;
  if (c != null)
    if (d === "number") {
      if (c === 0 && a.value === "" || a.value != c)
        a.value = "" + c;
    } else
      a.value !== "" + c && (a.value = "" + c);
  else if (d === "submit" || d === "reset") {
    a.removeAttribute("value");
    return;
  }
  b.hasOwnProperty("value") ? cb(a, b.type, c) : b.hasOwnProperty("defaultValue") && cb(a, b.type, Sa(b.defaultValue));
  b.checked == null && b.defaultChecked != null && (a.defaultChecked = !!b.defaultChecked);
}
function db(a, b, c) {
  if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
    var d = b.type;
    if (!(d !== "submit" && d !== "reset" || b.value !== undefined && b.value !== null))
      return;
    b = "" + a._wrapperState.initialValue;
    c || b === a.value || (a.value = b);
    a.defaultValue = b;
  }
  c = a.name;
  c !== "" && (a.name = "");
  a.defaultChecked = !!a._wrapperState.initialChecked;
  c !== "" && (a.name = c);
}
function cb(a, b, c) {
  if (b !== "number" || Xa(a.ownerDocument) !== a)
    c == null ? a.defaultValue = "" + a._wrapperState.initialValue : a.defaultValue !== "" + c && (a.defaultValue = "" + c);
}
function fb(a, b, c, d) {
  a = a.options;
  if (b) {
    b = {};
    for (var e = 0;e < c.length; e++)
      b["$" + c[e]] = true;
    for (c = 0;c < a.length; c++)
      e = b.hasOwnProperty("$" + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = true);
  } else {
    c = "" + Sa(c);
    b = null;
    for (e = 0;e < a.length; e++) {
      if (a[e].value === c) {
        a[e].selected = true;
        d && (a[e].defaultSelected = true);
        return;
      }
      b !== null || a[e].disabled || (b = a[e]);
    }
    b !== null && (b.selected = true);
  }
}
function gb(a, b) {
  if (b.dangerouslySetInnerHTML != null)
    throw Error(p3(91));
  return A2({}, b, { value: undefined, defaultValue: undefined, children: "" + a._wrapperState.initialValue });
}
function hb(a, b) {
  var c = b.value;
  if (c == null) {
    c = b.children;
    b = b.defaultValue;
    if (c != null) {
      if (b != null)
        throw Error(p3(92));
      if (eb(c)) {
        if (1 < c.length)
          throw Error(p3(93));
        c = c[0];
      }
      b = c;
    }
    b == null && (b = "");
    c = b;
  }
  a._wrapperState = { initialValue: Sa(c) };
}
function ib(a, b) {
  var c = Sa(b.value), d = Sa(b.defaultValue);
  c != null && (c = "" + c, c !== a.value && (a.value = c), b.defaultValue == null && a.defaultValue !== c && (a.defaultValue = c));
  d != null && (a.defaultValue = "" + d);
}
function jb(a) {
  var b = a.textContent;
  b === a._wrapperState.initialValue && b !== "" && b !== null && (a.value = b);
}
function kb(a) {
  switch (a) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function lb(a, b) {
  return a == null || a === "http://www.w3.org/1999/xhtml" ? kb(b) : a === "http://www.w3.org/2000/svg" && b === "foreignObject" ? "http://www.w3.org/1999/xhtml" : a;
}
function ob(a, b) {
  if (b) {
    var c = a.firstChild;
    if (c && c === a.lastChild && c.nodeType === 3) {
      c.nodeValue = b;
      return;
    }
  }
  a.textContent = b;
}
function rb(a, b, c) {
  return b == null || typeof b === "boolean" || b === "" ? "" : c || typeof b !== "number" || b === 0 || pb.hasOwnProperty(a) && pb[a] ? ("" + b).trim() : b + "px";
}
function sb(a, b) {
  a = a.style;
  for (var c in b)
    if (b.hasOwnProperty(c)) {
      var d = c.indexOf("--") === 0, e = rb(c, b[c], d);
      c === "float" && (c = "cssFloat");
      d ? a.setProperty(c, e) : a[c] = e;
    }
}
function ub(a, b) {
  if (b) {
    if (tb[a] && (b.children != null || b.dangerouslySetInnerHTML != null))
      throw Error(p3(137, a));
    if (b.dangerouslySetInnerHTML != null) {
      if (b.children != null)
        throw Error(p3(60));
      if (typeof b.dangerouslySetInnerHTML !== "object" || !("__html" in b.dangerouslySetInnerHTML))
        throw Error(p3(61));
    }
    if (b.style != null && typeof b.style !== "object")
      throw Error(p3(62));
  }
}
function vb(a, b) {
  if (a.indexOf("-") === -1)
    return typeof b.is === "string";
  switch (a) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return false;
    default:
      return true;
  }
}
function xb(a) {
  a = a.target || a.srcElement || window;
  a.correspondingUseElement && (a = a.correspondingUseElement);
  return a.nodeType === 3 ? a.parentNode : a;
}
function Bb(a) {
  if (a = Cb(a)) {
    if (typeof yb !== "function")
      throw Error(p3(280));
    var b = a.stateNode;
    b && (b = Db(b), yb(a.stateNode, a.type, b));
  }
}
function Eb(a) {
  zb ? Ab ? Ab.push(a) : Ab = [a] : zb = a;
}
function Fb() {
  if (zb) {
    var a = zb, b = Ab;
    Ab = zb = null;
    Bb(a);
    if (b)
      for (a = 0;a < b.length; a++)
        Bb(b[a]);
  }
}
function Gb(a, b) {
  return a(b);
}
function Hb() {}
function Jb(a, b, c) {
  if (Ib)
    return a(b, c);
  Ib = true;
  try {
    return Gb(a, b, c);
  } finally {
    if (Ib = false, zb !== null || Ab !== null)
      Hb(), Fb();
  }
}
function Kb(a, b) {
  var c = a.stateNode;
  if (c === null)
    return null;
  var d = Db(c);
  if (d === null)
    return null;
  c = d[b];
  a:
    switch (b) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (d = !d.disabled) || (a = a.type, d = !(a === "button" || a === "input" || a === "select" || a === "textarea"));
        a = !d;
        break a;
      default:
        a = false;
    }
  if (a)
    return null;
  if (c && typeof c !== "function")
    throw Error(p3(231, b, typeof c));
  return c;
}
function Nb(a, b, c, d, e, f2, g, h, k2) {
  var l3 = Array.prototype.slice.call(arguments, 3);
  try {
    b.apply(c, l3);
  } catch (m2) {
    this.onError(m2);
  }
}
function Tb(a, b, c, d, e, f2, g, h, k2) {
  Ob = false;
  Pb = null;
  Nb.apply(Sb, arguments);
}
function Ub(a, b, c, d, e, f2, g, h, k2) {
  Tb.apply(this, arguments);
  if (Ob) {
    if (Ob) {
      var l3 = Pb;
      Ob = false;
      Pb = null;
    } else
      throw Error(p3(198));
    Qb || (Qb = true, Rb = l3);
  }
}
function Vb(a) {
  var b = a, c = a;
  if (a.alternate)
    for (;b.return; )
      b = b.return;
  else {
    a = b;
    do
      b = a, (b.flags & 4098) !== 0 && (c = b.return), a = b.return;
    while (a);
  }
  return b.tag === 3 ? c : null;
}
function Wb(a) {
  if (a.tag === 13) {
    var b = a.memoizedState;
    b === null && (a = a.alternate, a !== null && (b = a.memoizedState));
    if (b !== null)
      return b.dehydrated;
  }
  return null;
}
function Xb(a) {
  if (Vb(a) !== a)
    throw Error(p3(188));
}
function Yb(a) {
  var b = a.alternate;
  if (!b) {
    b = Vb(a);
    if (b === null)
      throw Error(p3(188));
    return b !== a ? null : a;
  }
  for (var c = a, d = b;; ) {
    var e = c.return;
    if (e === null)
      break;
    var f2 = e.alternate;
    if (f2 === null) {
      d = e.return;
      if (d !== null) {
        c = d;
        continue;
      }
      break;
    }
    if (e.child === f2.child) {
      for (f2 = e.child;f2; ) {
        if (f2 === c)
          return Xb(e), a;
        if (f2 === d)
          return Xb(e), b;
        f2 = f2.sibling;
      }
      throw Error(p3(188));
    }
    if (c.return !== d.return)
      c = e, d = f2;
    else {
      for (var g = false, h = e.child;h; ) {
        if (h === c) {
          g = true;
          c = e;
          d = f2;
          break;
        }
        if (h === d) {
          g = true;
          d = e;
          c = f2;
          break;
        }
        h = h.sibling;
      }
      if (!g) {
        for (h = f2.child;h; ) {
          if (h === c) {
            g = true;
            c = f2;
            d = e;
            break;
          }
          if (h === d) {
            g = true;
            d = f2;
            c = e;
            break;
          }
          h = h.sibling;
        }
        if (!g)
          throw Error(p3(189));
      }
    }
    if (c.alternate !== d)
      throw Error(p3(190));
  }
  if (c.tag !== 3)
    throw Error(p3(188));
  return c.stateNode.current === c ? a : b;
}
function Zb(a) {
  a = Yb(a);
  return a !== null ? $b(a) : null;
}
function $b(a) {
  if (a.tag === 5 || a.tag === 6)
    return a;
  for (a = a.child;a !== null; ) {
    var b = $b(a);
    if (b !== null)
      return b;
    a = a.sibling;
  }
  return null;
}
function mc(a) {
  if (lc && typeof lc.onCommitFiberRoot === "function")
    try {
      lc.onCommitFiberRoot(kc, a, undefined, (a.current.flags & 128) === 128);
    } catch (b) {}
}
function nc(a) {
  a >>>= 0;
  return a === 0 ? 32 : 31 - (pc(a) / qc | 0) | 0;
}
function tc(a) {
  switch (a & -a) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return a & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return a & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return a;
  }
}
function uc(a, b) {
  var c = a.pendingLanes;
  if (c === 0)
    return 0;
  var d = 0, e = a.suspendedLanes, f2 = a.pingedLanes, g = c & 268435455;
  if (g !== 0) {
    var h = g & ~e;
    h !== 0 ? d = tc(h) : (f2 &= g, f2 !== 0 && (d = tc(f2)));
  } else
    g = c & ~e, g !== 0 ? d = tc(g) : f2 !== 0 && (d = tc(f2));
  if (d === 0)
    return 0;
  if (b !== 0 && b !== d && (b & e) === 0 && (e = d & -d, f2 = b & -b, e >= f2 || e === 16 && (f2 & 4194240) !== 0))
    return b;
  (d & 4) !== 0 && (d |= c & 16);
  b = a.entangledLanes;
  if (b !== 0)
    for (a = a.entanglements, b &= d;0 < b; )
      c = 31 - oc(b), e = 1 << c, d |= a[c], b &= ~e;
  return d;
}
function vc(a, b) {
  switch (a) {
    case 1:
    case 2:
    case 4:
      return b + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return b + 5000;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function wc(a, b) {
  for (var { suspendedLanes: c, pingedLanes: d, expirationTimes: e, pendingLanes: f2 } = a;0 < f2; ) {
    var g = 31 - oc(f2), h = 1 << g, k2 = e[g];
    if (k2 === -1) {
      if ((h & c) === 0 || (h & d) !== 0)
        e[g] = vc(h, b);
    } else
      k2 <= b && (a.expiredLanes |= h);
    f2 &= ~h;
  }
}
function xc(a) {
  a = a.pendingLanes & -1073741825;
  return a !== 0 ? a : a & 1073741824 ? 1073741824 : 0;
}
function yc() {
  var a = rc;
  rc <<= 1;
  (rc & 4194240) === 0 && (rc = 64);
  return a;
}
function zc(a) {
  for (var b = [], c = 0;31 > c; c++)
    b.push(a);
  return b;
}
function Ac(a, b, c) {
  a.pendingLanes |= b;
  b !== 536870912 && (a.suspendedLanes = 0, a.pingedLanes = 0);
  a = a.eventTimes;
  b = 31 - oc(b);
  a[b] = c;
}
function Bc(a, b) {
  var c = a.pendingLanes & ~b;
  a.pendingLanes = b;
  a.suspendedLanes = 0;
  a.pingedLanes = 0;
  a.expiredLanes &= b;
  a.mutableReadLanes &= b;
  a.entangledLanes &= b;
  b = a.entanglements;
  var d = a.eventTimes;
  for (a = a.expirationTimes;0 < c; ) {
    var e = 31 - oc(c), f2 = 1 << e;
    b[e] = 0;
    d[e] = -1;
    a[e] = -1;
    c &= ~f2;
  }
}
function Cc(a, b) {
  var c = a.entangledLanes |= b;
  for (a = a.entanglements;c; ) {
    var d = 31 - oc(c), e = 1 << d;
    e & b | a[d] & b && (a[d] |= b);
    c &= ~e;
  }
}
function Dc(a) {
  a &= -a;
  return 1 < a ? 4 < a ? (a & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
}
function Sc(a, b) {
  switch (a) {
    case "focusin":
    case "focusout":
      Lc = null;
      break;
    case "dragenter":
    case "dragleave":
      Mc = null;
      break;
    case "mouseover":
    case "mouseout":
      Nc = null;
      break;
    case "pointerover":
    case "pointerout":
      Oc.delete(b.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Pc.delete(b.pointerId);
  }
}
function Tc(a, b, c, d, e, f2) {
  if (a === null || a.nativeEvent !== f2)
    return a = { blockedOn: b, domEventName: c, eventSystemFlags: d, nativeEvent: f2, targetContainers: [e] }, b !== null && (b = Cb(b), b !== null && Fc(b)), a;
  a.eventSystemFlags |= d;
  b = a.targetContainers;
  e !== null && b.indexOf(e) === -1 && b.push(e);
  return a;
}
function Uc(a, b, c, d, e) {
  switch (b) {
    case "focusin":
      return Lc = Tc(Lc, a, b, c, d, e), true;
    case "dragenter":
      return Mc = Tc(Mc, a, b, c, d, e), true;
    case "mouseover":
      return Nc = Tc(Nc, a, b, c, d, e), true;
    case "pointerover":
      var f2 = e.pointerId;
      Oc.set(f2, Tc(Oc.get(f2) || null, a, b, c, d, e));
      return true;
    case "gotpointercapture":
      return f2 = e.pointerId, Pc.set(f2, Tc(Pc.get(f2) || null, a, b, c, d, e)), true;
  }
  return false;
}
function Vc(a) {
  var b = Wc(a.target);
  if (b !== null) {
    var c = Vb(b);
    if (c !== null) {
      if (b = c.tag, b === 13) {
        if (b = Wb(c), b !== null) {
          a.blockedOn = b;
          Ic(a.priority, function() {
            Gc(c);
          });
          return;
        }
      } else if (b === 3 && c.stateNode.current.memoizedState.isDehydrated) {
        a.blockedOn = c.tag === 3 ? c.stateNode.containerInfo : null;
        return;
      }
    }
  }
  a.blockedOn = null;
}
function Xc(a) {
  if (a.blockedOn !== null)
    return false;
  for (var b = a.targetContainers;0 < b.length; ) {
    var c = Yc(a.domEventName, a.eventSystemFlags, b[0], a.nativeEvent);
    if (c === null) {
      c = a.nativeEvent;
      var d = new c.constructor(c.type, c);
      wb = d;
      c.target.dispatchEvent(d);
      wb = null;
    } else
      return b = Cb(c), b !== null && Fc(b), a.blockedOn = c, false;
    b.shift();
  }
  return true;
}
function Zc(a, b, c) {
  Xc(a) && c.delete(b);
}
function $c() {
  Jc = false;
  Lc !== null && Xc(Lc) && (Lc = null);
  Mc !== null && Xc(Mc) && (Mc = null);
  Nc !== null && Xc(Nc) && (Nc = null);
  Oc.forEach(Zc);
  Pc.forEach(Zc);
}
function ad(a, b) {
  a.blockedOn === b && (a.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
}
function bd(a) {
  function b(b2) {
    return ad(b2, a);
  }
  if (0 < Kc.length) {
    ad(Kc[0], a);
    for (var c = 1;c < Kc.length; c++) {
      var d = Kc[c];
      d.blockedOn === a && (d.blockedOn = null);
    }
  }
  Lc !== null && ad(Lc, a);
  Mc !== null && ad(Mc, a);
  Nc !== null && ad(Nc, a);
  Oc.forEach(b);
  Pc.forEach(b);
  for (c = 0;c < Qc.length; c++)
    d = Qc[c], d.blockedOn === a && (d.blockedOn = null);
  for (;0 < Qc.length && (c = Qc[0], c.blockedOn === null); )
    Vc(c), c.blockedOn === null && Qc.shift();
}
function ed(a, b, c, d) {
  var e = C2, f2 = cd.transition;
  cd.transition = null;
  try {
    C2 = 1, fd(a, b, c, d);
  } finally {
    C2 = e, cd.transition = f2;
  }
}
function gd(a, b, c, d) {
  var e = C2, f2 = cd.transition;
  cd.transition = null;
  try {
    C2 = 4, fd(a, b, c, d);
  } finally {
    C2 = e, cd.transition = f2;
  }
}
function fd(a, b, c, d) {
  if (dd) {
    var e = Yc(a, b, c, d);
    if (e === null)
      hd(a, b, d, id, c), Sc(a, d);
    else if (Uc(e, a, b, c, d))
      d.stopPropagation();
    else if (Sc(a, d), b & 4 && -1 < Rc.indexOf(a)) {
      for (;e !== null; ) {
        var f2 = Cb(e);
        f2 !== null && Ec(f2);
        f2 = Yc(a, b, c, d);
        f2 === null && hd(a, b, d, id, c);
        if (f2 === e)
          break;
        e = f2;
      }
      e !== null && d.stopPropagation();
    } else
      hd(a, b, d, null, c);
  }
}
function Yc(a, b, c, d) {
  id = null;
  a = xb(d);
  a = Wc(a);
  if (a !== null)
    if (b = Vb(a), b === null)
      a = null;
    else if (c = b.tag, c === 13) {
      a = Wb(b);
      if (a !== null)
        return a;
      a = null;
    } else if (c === 3) {
      if (b.stateNode.current.memoizedState.isDehydrated)
        return b.tag === 3 ? b.stateNode.containerInfo : null;
      a = null;
    } else
      b !== a && (a = null);
  id = a;
  return null;
}
function jd(a) {
  switch (a) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (ec()) {
        case fc:
          return 1;
        case gc:
          return 4;
        case hc:
        case ic:
          return 16;
        case jc:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
function nd() {
  if (md)
    return md;
  var a, b = ld, c = b.length, d, e = "value" in kd ? kd.value : kd.textContent, f2 = e.length;
  for (a = 0;a < c && b[a] === e[a]; a++)
    ;
  var g = c - a;
  for (d = 1;d <= g && b[c - d] === e[f2 - d]; d++)
    ;
  return md = e.slice(a, 1 < d ? 1 - d : undefined);
}
function od(a) {
  var b = a.keyCode;
  "charCode" in a ? (a = a.charCode, a === 0 && b === 13 && (a = 13)) : a = b;
  a === 10 && (a = 13);
  return 32 <= a || a === 13 ? a : 0;
}
function pd() {
  return true;
}
function qd() {
  return false;
}
function rd(a) {
  function b(b2, d, e, f2, g) {
    this._reactName = b2;
    this._targetInst = e;
    this.type = d;
    this.nativeEvent = f2;
    this.target = g;
    this.currentTarget = null;
    for (var c in a)
      a.hasOwnProperty(c) && (b2 = a[c], this[c] = b2 ? b2(f2) : f2[c]);
    this.isDefaultPrevented = (f2.defaultPrevented != null ? f2.defaultPrevented : f2.returnValue === false) ? pd : qd;
    this.isPropagationStopped = qd;
    return this;
  }
  A2(b.prototype, { preventDefault: function() {
    this.defaultPrevented = true;
    var a2 = this.nativeEvent;
    a2 && (a2.preventDefault ? a2.preventDefault() : typeof a2.returnValue !== "unknown" && (a2.returnValue = false), this.isDefaultPrevented = pd);
  }, stopPropagation: function() {
    var a2 = this.nativeEvent;
    a2 && (a2.stopPropagation ? a2.stopPropagation() : typeof a2.cancelBubble !== "unknown" && (a2.cancelBubble = true), this.isPropagationStopped = pd);
  }, persist: function() {}, isPersistent: pd });
  return b;
}
function Pd(a) {
  var b = this.nativeEvent;
  return b.getModifierState ? b.getModifierState(a) : (a = Od[a]) ? !!b[a] : false;
}
function zd() {
  return Pd;
}
function ge(a, b) {
  switch (a) {
    case "keyup":
      return $d.indexOf(b.keyCode) !== -1;
    case "keydown":
      return b.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return true;
    default:
      return false;
  }
}
function he(a) {
  a = a.detail;
  return typeof a === "object" && "data" in a ? a.data : null;
}
function je(a, b) {
  switch (a) {
    case "compositionend":
      return he(b);
    case "keypress":
      if (b.which !== 32)
        return null;
      fe = true;
      return ee;
    case "textInput":
      return a = b.data, a === ee && fe ? null : a;
    default:
      return null;
  }
}
function ke(a, b) {
  if (ie)
    return a === "compositionend" || !ae && ge(a, b) ? (a = nd(), md = ld = kd = null, ie = false, a) : null;
  switch (a) {
    case "paste":
      return null;
    case "keypress":
      if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
        if (b.char && 1 < b.char.length)
          return b.char;
        if (b.which)
          return String.fromCharCode(b.which);
      }
      return null;
    case "compositionend":
      return de && b.locale !== "ko" ? null : b.data;
    default:
      return null;
  }
}
function me(a) {
  var b = a && a.nodeName && a.nodeName.toLowerCase();
  return b === "input" ? !!le[a.type] : b === "textarea" ? true : false;
}
function ne(a, b, c, d) {
  Eb(d);
  b = oe(b, "onChange");
  0 < b.length && (c = new td("onChange", "change", null, c, d), a.push({ event: c, listeners: b }));
}
function re(a) {
  se(a, 0);
}
function te(a) {
  var b = ue(a);
  if (Wa(b))
    return a;
}
function ve(a, b) {
  if (a === "change")
    return b;
}
function Ae() {
  pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
}
function Be(a) {
  if (a.propertyName === "value" && te(qe)) {
    var b = [];
    ne(b, qe, a, xb(a));
    Jb(re, b);
  }
}
function Ce(a, b, c) {
  a === "focusin" ? (Ae(), pe = b, qe = c, pe.attachEvent("onpropertychange", Be)) : a === "focusout" && Ae();
}
function De(a) {
  if (a === "selectionchange" || a === "keyup" || a === "keydown")
    return te(qe);
}
function Ee(a, b) {
  if (a === "click")
    return te(b);
}
function Fe(a, b) {
  if (a === "input" || a === "change")
    return te(b);
}
function Ge(a, b) {
  return a === b && (a !== 0 || 1 / a === 1 / b) || a !== a && b !== b;
}
function Ie(a, b) {
  if (He(a, b))
    return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null)
    return false;
  var c = Object.keys(a), d = Object.keys(b);
  if (c.length !== d.length)
    return false;
  for (d = 0;d < c.length; d++) {
    var e = c[d];
    if (!ja.call(b, e) || !He(a[e], b[e]))
      return false;
  }
  return true;
}
function Je(a) {
  for (;a && a.firstChild; )
    a = a.firstChild;
  return a;
}
function Ke(a, b) {
  var c = Je(a);
  a = 0;
  for (var d;c; ) {
    if (c.nodeType === 3) {
      d = a + c.textContent.length;
      if (a <= b && d >= b)
        return { node: c, offset: b - a };
      a = d;
    }
    a: {
      for (;c; ) {
        if (c.nextSibling) {
          c = c.nextSibling;
          break a;
        }
        c = c.parentNode;
      }
      c = undefined;
    }
    c = Je(c);
  }
}
function Le(a, b) {
  return a && b ? a === b ? true : a && a.nodeType === 3 ? false : b && b.nodeType === 3 ? Le(a, b.parentNode) : ("contains" in a) ? a.contains(b) : a.compareDocumentPosition ? !!(a.compareDocumentPosition(b) & 16) : false : false;
}
function Me() {
  for (var a = window, b = Xa();b instanceof a.HTMLIFrameElement; ) {
    try {
      var c = typeof b.contentWindow.location.href === "string";
    } catch (d) {
      c = false;
    }
    if (c)
      a = b.contentWindow;
    else
      break;
    b = Xa(a.document);
  }
  return b;
}
function Ne(a) {
  var b = a && a.nodeName && a.nodeName.toLowerCase();
  return b && (b === "input" && (a.type === "text" || a.type === "search" || a.type === "tel" || a.type === "url" || a.type === "password") || b === "textarea" || a.contentEditable === "true");
}
function Oe(a) {
  var b = Me(), c = a.focusedElem, d = a.selectionRange;
  if (b !== c && c && c.ownerDocument && Le(c.ownerDocument.documentElement, c)) {
    if (d !== null && Ne(c)) {
      if (b = d.start, a = d.end, a === undefined && (a = b), "selectionStart" in c)
        c.selectionStart = b, c.selectionEnd = Math.min(a, c.value.length);
      else if (a = (b = c.ownerDocument || document) && b.defaultView || window, a.getSelection) {
        a = a.getSelection();
        var e = c.textContent.length, f2 = Math.min(d.start, e);
        d = d.end === undefined ? f2 : Math.min(d.end, e);
        !a.extend && f2 > d && (e = d, d = f2, f2 = e);
        e = Ke(c, f2);
        var g = Ke(c, d);
        e && g && (a.rangeCount !== 1 || a.anchorNode !== e.node || a.anchorOffset !== e.offset || a.focusNode !== g.node || a.focusOffset !== g.offset) && (b = b.createRange(), b.setStart(e.node, e.offset), a.removeAllRanges(), f2 > d ? (a.addRange(b), a.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), a.addRange(b)));
      }
    }
    b = [];
    for (a = c;a = a.parentNode; )
      a.nodeType === 1 && b.push({ element: a, left: a.scrollLeft, top: a.scrollTop });
    typeof c.focus === "function" && c.focus();
    for (c = 0;c < b.length; c++)
      a = b[c], a.element.scrollLeft = a.left, a.element.scrollTop = a.top;
  }
}
function Ue(a, b, c) {
  var d = c.window === c ? c.document : c.nodeType === 9 ? c : c.ownerDocument;
  Te || Qe == null || Qe !== Xa(d) || (d = Qe, ("selectionStart" in d) && Ne(d) ? d = { start: d.selectionStart, end: d.selectionEnd } : (d = (d.ownerDocument && d.ownerDocument.defaultView || window).getSelection(), d = { anchorNode: d.anchorNode, anchorOffset: d.anchorOffset, focusNode: d.focusNode, focusOffset: d.focusOffset }), Se && Ie(Se, d) || (Se = d, d = oe(Re, "onSelect"), 0 < d.length && (b = new td("onSelect", "select", null, b, c), a.push({ event: b, listeners: d }), b.target = Qe)));
}
function Ve(a, b) {
  var c = {};
  c[a.toLowerCase()] = b.toLowerCase();
  c["Webkit" + a] = "webkit" + b;
  c["Moz" + a] = "moz" + b;
  return c;
}
function Ze(a) {
  if (Xe[a])
    return Xe[a];
  if (!We[a])
    return a;
  var b = We[a], c;
  for (c in b)
    if (b.hasOwnProperty(c) && c in Ye)
      return Xe[a] = b[c];
  return a;
}
function ff(a, b) {
  df.set(a, b);
  fa(b, [a]);
}
function nf(a, b, c) {
  var d = a.type || "unknown-event";
  a.currentTarget = c;
  Ub(d, b, undefined, a);
  a.currentTarget = null;
}
function se(a, b) {
  b = (b & 4) !== 0;
  for (var c = 0;c < a.length; c++) {
    var d = a[c], e = d.event;
    d = d.listeners;
    a: {
      var f2 = undefined;
      if (b)
        for (var g = d.length - 1;0 <= g; g--) {
          var h = d[g], k2 = h.instance, l3 = h.currentTarget;
          h = h.listener;
          if (k2 !== f2 && e.isPropagationStopped())
            break a;
          nf(e, h, l3);
          f2 = k2;
        }
      else
        for (g = 0;g < d.length; g++) {
          h = d[g];
          k2 = h.instance;
          l3 = h.currentTarget;
          h = h.listener;
          if (k2 !== f2 && e.isPropagationStopped())
            break a;
          nf(e, h, l3);
          f2 = k2;
        }
    }
  }
  if (Qb)
    throw a = Rb, Qb = false, Rb = null, a;
}
function D2(a, b) {
  var c = b[of];
  c === undefined && (c = b[of] = new Set);
  var d = a + "__bubble";
  c.has(d) || (pf(b, a, 2, false), c.add(d));
}
function qf(a, b, c) {
  var d = 0;
  b && (d |= 4);
  pf(c, a, d, b);
}
function sf(a) {
  if (!a[rf]) {
    a[rf] = true;
    da.forEach(function(b2) {
      b2 !== "selectionchange" && (mf.has(b2) || qf(b2, false, a), qf(b2, true, a));
    });
    var b = a.nodeType === 9 ? a : a.ownerDocument;
    b === null || b[rf] || (b[rf] = true, qf("selectionchange", false, b));
  }
}
function pf(a, b, c, d) {
  switch (jd(b)) {
    case 1:
      var e = ed;
      break;
    case 4:
      e = gd;
      break;
    default:
      e = fd;
  }
  c = e.bind(null, b, c, a);
  e = undefined;
  !Lb || b !== "touchstart" && b !== "touchmove" && b !== "wheel" || (e = true);
  d ? e !== undefined ? a.addEventListener(b, c, { capture: true, passive: e }) : a.addEventListener(b, c, true) : e !== undefined ? a.addEventListener(b, c, { passive: e }) : a.addEventListener(b, c, false);
}
function hd(a, b, c, d, e) {
  var f2 = d;
  if ((b & 1) === 0 && (b & 2) === 0 && d !== null)
    a:
      for (;; ) {
        if (d === null)
          return;
        var g = d.tag;
        if (g === 3 || g === 4) {
          var h = d.stateNode.containerInfo;
          if (h === e || h.nodeType === 8 && h.parentNode === e)
            break;
          if (g === 4)
            for (g = d.return;g !== null; ) {
              var k2 = g.tag;
              if (k2 === 3 || k2 === 4) {
                if (k2 = g.stateNode.containerInfo, k2 === e || k2.nodeType === 8 && k2.parentNode === e)
                  return;
              }
              g = g.return;
            }
          for (;h !== null; ) {
            g = Wc(h);
            if (g === null)
              return;
            k2 = g.tag;
            if (k2 === 5 || k2 === 6) {
              d = f2 = g;
              continue a;
            }
            h = h.parentNode;
          }
        }
        d = d.return;
      }
  Jb(function() {
    var d2 = f2, e2 = xb(c), g2 = [];
    a: {
      var h2 = df.get(a);
      if (h2 !== undefined) {
        var k3 = td, n3 = a;
        switch (a) {
          case "keypress":
            if (od(c) === 0)
              break a;
          case "keydown":
          case "keyup":
            k3 = Rd;
            break;
          case "focusin":
            n3 = "focus";
            k3 = Fd;
            break;
          case "focusout":
            n3 = "blur";
            k3 = Fd;
            break;
          case "beforeblur":
          case "afterblur":
            k3 = Fd;
            break;
          case "click":
            if (c.button === 2)
              break a;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            k3 = Bd;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            k3 = Dd;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            k3 = Vd;
            break;
          case $e:
          case af:
          case bf:
            k3 = Hd;
            break;
          case cf:
            k3 = Xd;
            break;
          case "scroll":
            k3 = vd;
            break;
          case "wheel":
            k3 = Zd;
            break;
          case "copy":
          case "cut":
          case "paste":
            k3 = Jd;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            k3 = Td;
        }
        var t2 = (b & 4) !== 0, J2 = !t2 && a === "scroll", x2 = t2 ? h2 !== null ? h2 + "Capture" : null : h2;
        t2 = [];
        for (var w2 = d2, u2;w2 !== null; ) {
          u2 = w2;
          var F2 = u2.stateNode;
          u2.tag === 5 && F2 !== null && (u2 = F2, x2 !== null && (F2 = Kb(w2, x2), F2 != null && t2.push(tf(w2, F2, u2))));
          if (J2)
            break;
          w2 = w2.return;
        }
        0 < t2.length && (h2 = new k3(h2, n3, null, c, e2), g2.push({ event: h2, listeners: t2 }));
      }
    }
    if ((b & 7) === 0) {
      a: {
        h2 = a === "mouseover" || a === "pointerover";
        k3 = a === "mouseout" || a === "pointerout";
        if (h2 && c !== wb && (n3 = c.relatedTarget || c.fromElement) && (Wc(n3) || n3[uf]))
          break a;
        if (k3 || h2) {
          h2 = e2.window === e2 ? e2 : (h2 = e2.ownerDocument) ? h2.defaultView || h2.parentWindow : window;
          if (k3) {
            if (n3 = c.relatedTarget || c.toElement, k3 = d2, n3 = n3 ? Wc(n3) : null, n3 !== null && (J2 = Vb(n3), n3 !== J2 || n3.tag !== 5 && n3.tag !== 6))
              n3 = null;
          } else
            k3 = null, n3 = d2;
          if (k3 !== n3) {
            t2 = Bd;
            F2 = "onMouseLeave";
            x2 = "onMouseEnter";
            w2 = "mouse";
            if (a === "pointerout" || a === "pointerover")
              t2 = Td, F2 = "onPointerLeave", x2 = "onPointerEnter", w2 = "pointer";
            J2 = k3 == null ? h2 : ue(k3);
            u2 = n3 == null ? h2 : ue(n3);
            h2 = new t2(F2, w2 + "leave", k3, c, e2);
            h2.target = J2;
            h2.relatedTarget = u2;
            F2 = null;
            Wc(e2) === d2 && (t2 = new t2(x2, w2 + "enter", n3, c, e2), t2.target = u2, t2.relatedTarget = J2, F2 = t2);
            J2 = F2;
            if (k3 && n3)
              b: {
                t2 = k3;
                x2 = n3;
                w2 = 0;
                for (u2 = t2;u2; u2 = vf(u2))
                  w2++;
                u2 = 0;
                for (F2 = x2;F2; F2 = vf(F2))
                  u2++;
                for (;0 < w2 - u2; )
                  t2 = vf(t2), w2--;
                for (;0 < u2 - w2; )
                  x2 = vf(x2), u2--;
                for (;w2--; ) {
                  if (t2 === x2 || x2 !== null && t2 === x2.alternate)
                    break b;
                  t2 = vf(t2);
                  x2 = vf(x2);
                }
                t2 = null;
              }
            else
              t2 = null;
            k3 !== null && wf(g2, h2, k3, t2, false);
            n3 !== null && J2 !== null && wf(g2, J2, n3, t2, true);
          }
        }
      }
      a: {
        h2 = d2 ? ue(d2) : window;
        k3 = h2.nodeName && h2.nodeName.toLowerCase();
        if (k3 === "select" || k3 === "input" && h2.type === "file")
          var na = ve;
        else if (me(h2))
          if (we)
            na = Fe;
          else {
            na = De;
            var xa = Ce;
          }
        else
          (k3 = h2.nodeName) && k3.toLowerCase() === "input" && (h2.type === "checkbox" || h2.type === "radio") && (na = Ee);
        if (na && (na = na(a, d2))) {
          ne(g2, na, c, e2);
          break a;
        }
        xa && xa(a, h2, d2);
        a === "focusout" && (xa = h2._wrapperState) && xa.controlled && h2.type === "number" && cb(h2, "number", h2.value);
      }
      xa = d2 ? ue(d2) : window;
      switch (a) {
        case "focusin":
          if (me(xa) || xa.contentEditable === "true")
            Qe = xa, Re = d2, Se = null;
          break;
        case "focusout":
          Se = Re = Qe = null;
          break;
        case "mousedown":
          Te = true;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Te = false;
          Ue(g2, c, e2);
          break;
        case "selectionchange":
          if (Pe)
            break;
        case "keydown":
        case "keyup":
          Ue(g2, c, e2);
      }
      var $a;
      if (ae)
        b: {
          switch (a) {
            case "compositionstart":
              var ba = "onCompositionStart";
              break b;
            case "compositionend":
              ba = "onCompositionEnd";
              break b;
            case "compositionupdate":
              ba = "onCompositionUpdate";
              break b;
          }
          ba = undefined;
        }
      else
        ie ? ge(a, c) && (ba = "onCompositionEnd") : a === "keydown" && c.keyCode === 229 && (ba = "onCompositionStart");
      ba && (de && c.locale !== "ko" && (ie || ba !== "onCompositionStart" ? ba === "onCompositionEnd" && ie && ($a = nd()) : (kd = e2, ld = ("value" in kd) ? kd.value : kd.textContent, ie = true)), xa = oe(d2, ba), 0 < xa.length && (ba = new Ld(ba, a, null, c, e2), g2.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he(c), $a !== null && (ba.data = $a))));
      if ($a = ce ? je(a, c) : ke(a, c))
        d2 = oe(d2, "onBeforeInput"), 0 < d2.length && (e2 = new Ld("onBeforeInput", "beforeinput", null, c, e2), g2.push({ event: e2, listeners: d2 }), e2.data = $a);
    }
    se(g2, b);
  });
}
function tf(a, b, c) {
  return { instance: a, listener: b, currentTarget: c };
}
function oe(a, b) {
  for (var c = b + "Capture", d = [];a !== null; ) {
    var e = a, f2 = e.stateNode;
    e.tag === 5 && f2 !== null && (e = f2, f2 = Kb(a, c), f2 != null && d.unshift(tf(a, f2, e)), f2 = Kb(a, b), f2 != null && d.push(tf(a, f2, e)));
    a = a.return;
  }
  return d;
}
function vf(a) {
  if (a === null)
    return null;
  do
    a = a.return;
  while (a && a.tag !== 5);
  return a ? a : null;
}
function wf(a, b, c, d, e) {
  for (var f2 = b._reactName, g = [];c !== null && c !== d; ) {
    var h = c, k2 = h.alternate, l3 = h.stateNode;
    if (k2 !== null && k2 === d)
      break;
    h.tag === 5 && l3 !== null && (h = l3, e ? (k2 = Kb(c, f2), k2 != null && g.unshift(tf(c, k2, h))) : e || (k2 = Kb(c, f2), k2 != null && g.push(tf(c, k2, h))));
    c = c.return;
  }
  g.length !== 0 && a.push({ event: b, listeners: g });
}
function zf(a) {
  return (typeof a === "string" ? a : "" + a).replace(xf, `
`).replace(yf, "");
}
function Af(a, b, c) {
  b = zf(b);
  if (zf(a) !== b && c)
    throw Error(p3(425));
}
function Bf() {}
function Ef(a, b) {
  return a === "textarea" || a === "noscript" || typeof b.children === "string" || typeof b.children === "number" || typeof b.dangerouslySetInnerHTML === "object" && b.dangerouslySetInnerHTML !== null && b.dangerouslySetInnerHTML.__html != null;
}
function If(a) {
  setTimeout(function() {
    throw a;
  });
}
function Kf(a, b) {
  var c = b, d = 0;
  do {
    var e = c.nextSibling;
    a.removeChild(c);
    if (e && e.nodeType === 8)
      if (c = e.data, c === "/$") {
        if (d === 0) {
          a.removeChild(e);
          bd(b);
          return;
        }
        d--;
      } else
        c !== "$" && c !== "$?" && c !== "$!" || d++;
    c = e;
  } while (c);
  bd(b);
}
function Lf(a) {
  for (;a != null; a = a.nextSibling) {
    var b = a.nodeType;
    if (b === 1 || b === 3)
      break;
    if (b === 8) {
      b = a.data;
      if (b === "$" || b === "$!" || b === "$?")
        break;
      if (b === "/$")
        return null;
    }
  }
  return a;
}
function Mf(a) {
  a = a.previousSibling;
  for (var b = 0;a; ) {
    if (a.nodeType === 8) {
      var c = a.data;
      if (c === "$" || c === "$!" || c === "$?") {
        if (b === 0)
          return a;
        b--;
      } else
        c === "/$" && b++;
    }
    a = a.previousSibling;
  }
  return null;
}
function Wc(a) {
  var b = a[Of];
  if (b)
    return b;
  for (var c = a.parentNode;c; ) {
    if (b = c[uf] || c[Of]) {
      c = b.alternate;
      if (b.child !== null || c !== null && c.child !== null)
        for (a = Mf(a);a !== null; ) {
          if (c = a[Of])
            return c;
          a = Mf(a);
        }
      return b;
    }
    a = c;
    c = a.parentNode;
  }
  return null;
}
function Cb(a) {
  a = a[Of] || a[uf];
  return !a || a.tag !== 5 && a.tag !== 6 && a.tag !== 13 && a.tag !== 3 ? null : a;
}
function ue(a) {
  if (a.tag === 5 || a.tag === 6)
    return a.stateNode;
  throw Error(p3(33));
}
function Db(a) {
  return a[Pf] || null;
}
function Uf(a) {
  return { current: a };
}
function E2(a) {
  0 > Tf || (a.current = Sf[Tf], Sf[Tf] = null, Tf--);
}
function G2(a, b) {
  Tf++;
  Sf[Tf] = a.current;
  a.current = b;
}
function Yf(a, b) {
  var c = a.type.contextTypes;
  if (!c)
    return Vf;
  var d = a.stateNode;
  if (d && d.__reactInternalMemoizedUnmaskedChildContext === b)
    return d.__reactInternalMemoizedMaskedChildContext;
  var e = {}, f2;
  for (f2 in c)
    e[f2] = b[f2];
  d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
  return e;
}
function Zf(a) {
  a = a.childContextTypes;
  return a !== null && a !== undefined;
}
function $f() {
  E2(Wf);
  E2(H2);
}
function ag(a, b, c) {
  if (H2.current !== Vf)
    throw Error(p3(168));
  G2(H2, b);
  G2(Wf, c);
}
function bg(a, b, c) {
  var d = a.stateNode;
  b = b.childContextTypes;
  if (typeof d.getChildContext !== "function")
    return c;
  d = d.getChildContext();
  for (var e in d)
    if (!(e in b))
      throw Error(p3(108, Ra(a) || "Unknown", e));
  return A2({}, c, d);
}
function cg(a) {
  a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || Vf;
  Xf = H2.current;
  G2(H2, a);
  G2(Wf, Wf.current);
  return true;
}
function dg(a, b, c) {
  var d = a.stateNode;
  if (!d)
    throw Error(p3(169));
  c ? (a = bg(a, b, Xf), d.__reactInternalMemoizedMergedChildContext = a, E2(Wf), E2(H2), G2(H2, a)) : E2(Wf);
  G2(Wf, c);
}
function hg(a) {
  eg === null ? eg = [a] : eg.push(a);
}
function ig(a) {
  fg = true;
  hg(a);
}
function jg() {
  if (!gg && eg !== null) {
    gg = true;
    var a = 0, b = C2;
    try {
      var c = eg;
      for (C2 = 1;a < c.length; a++) {
        var d = c[a];
        do
          d = d(true);
        while (d !== null);
      }
      eg = null;
      fg = false;
    } catch (e) {
      throw eg !== null && (eg = eg.slice(a + 1)), ac(fc, jg), e;
    } finally {
      C2 = b, gg = false;
    }
  }
  return null;
}
function tg(a, b) {
  kg[lg++] = ng;
  kg[lg++] = mg;
  mg = a;
  ng = b;
}
function ug(a, b, c) {
  og[pg++] = rg;
  og[pg++] = sg;
  og[pg++] = qg;
  qg = a;
  var d = rg;
  a = sg;
  var e = 32 - oc(d) - 1;
  d &= ~(1 << e);
  c += 1;
  var f2 = 32 - oc(b) + e;
  if (30 < f2) {
    var g = e - e % 5;
    f2 = (d & (1 << g) - 1).toString(32);
    d >>= g;
    e -= g;
    rg = 1 << 32 - oc(b) + e | c << e | d;
    sg = f2 + a;
  } else
    rg = 1 << f2 | c << e | d, sg = a;
}
function vg(a) {
  a.return !== null && (tg(a, 1), ug(a, 1, 0));
}
function wg(a) {
  for (;a === mg; )
    mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
  for (;a === qg; )
    qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
}
function Ag(a, b) {
  var c = Bg(5, null, null, 0);
  c.elementType = "DELETED";
  c.stateNode = b;
  c.return = a;
  b = a.deletions;
  b === null ? (a.deletions = [c], a.flags |= 16) : b.push(c);
}
function Cg(a, b) {
  switch (a.tag) {
    case 5:
      var c = a.type;
      b = b.nodeType !== 1 || c.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
      return b !== null ? (a.stateNode = b, xg = a, yg = Lf(b.firstChild), true) : false;
    case 6:
      return b = a.pendingProps === "" || b.nodeType !== 3 ? null : b, b !== null ? (a.stateNode = b, xg = a, yg = null, true) : false;
    case 13:
      return b = b.nodeType !== 8 ? null : b, b !== null ? (c = qg !== null ? { id: rg, overflow: sg } : null, a.memoizedState = { dehydrated: b, treeContext: c, retryLane: 1073741824 }, c = Bg(18, null, null, 0), c.stateNode = b, c.return = a, a.child = c, xg = a, yg = null, true) : false;
    default:
      return false;
  }
}
function Dg(a) {
  return (a.mode & 1) !== 0 && (a.flags & 128) === 0;
}
function Eg(a) {
  if (I2) {
    var b = yg;
    if (b) {
      var c = b;
      if (!Cg(a, b)) {
        if (Dg(a))
          throw Error(p3(418));
        b = Lf(c.nextSibling);
        var d = xg;
        b && Cg(a, b) ? Ag(d, c) : (a.flags = a.flags & -4097 | 2, I2 = false, xg = a);
      }
    } else {
      if (Dg(a))
        throw Error(p3(418));
      a.flags = a.flags & -4097 | 2;
      I2 = false;
      xg = a;
    }
  }
}
function Fg(a) {
  for (a = a.return;a !== null && a.tag !== 5 && a.tag !== 3 && a.tag !== 13; )
    a = a.return;
  xg = a;
}
function Gg(a) {
  if (a !== xg)
    return false;
  if (!I2)
    return Fg(a), I2 = true, false;
  var b;
  (b = a.tag !== 3) && !(b = a.tag !== 5) && (b = a.type, b = b !== "head" && b !== "body" && !Ef(a.type, a.memoizedProps));
  if (b && (b = yg)) {
    if (Dg(a))
      throw Hg(), Error(p3(418));
    for (;b; )
      Ag(a, b), b = Lf(b.nextSibling);
  }
  Fg(a);
  if (a.tag === 13) {
    a = a.memoizedState;
    a = a !== null ? a.dehydrated : null;
    if (!a)
      throw Error(p3(317));
    a: {
      a = a.nextSibling;
      for (b = 0;a; ) {
        if (a.nodeType === 8) {
          var c = a.data;
          if (c === "/$") {
            if (b === 0) {
              yg = Lf(a.nextSibling);
              break a;
            }
            b--;
          } else
            c !== "$" && c !== "$!" && c !== "$?" || b++;
        }
        a = a.nextSibling;
      }
      yg = null;
    }
  } else
    yg = xg ? Lf(a.stateNode.nextSibling) : null;
  return true;
}
function Hg() {
  for (var a = yg;a; )
    a = Lf(a.nextSibling);
}
function Ig() {
  yg = xg = null;
  I2 = false;
}
function Jg(a) {
  zg === null ? zg = [a] : zg.push(a);
}
function Lg(a, b, c) {
  a = c.ref;
  if (a !== null && typeof a !== "function" && typeof a !== "object") {
    if (c._owner) {
      c = c._owner;
      if (c) {
        if (c.tag !== 1)
          throw Error(p3(309));
        var d = c.stateNode;
      }
      if (!d)
        throw Error(p3(147, a));
      var e = d, f2 = "" + a;
      if (b !== null && b.ref !== null && typeof b.ref === "function" && b.ref._stringRef === f2)
        return b.ref;
      b = function(a2) {
        var b2 = e.refs;
        a2 === null ? delete b2[f2] : b2[f2] = a2;
      };
      b._stringRef = f2;
      return b;
    }
    if (typeof a !== "string")
      throw Error(p3(284));
    if (!c._owner)
      throw Error(p3(290, a));
  }
  return a;
}
function Mg(a, b) {
  a = Object.prototype.toString.call(b);
  throw Error(p3(31, a === "[object Object]" ? "object with keys {" + Object.keys(b).join(", ") + "}" : a));
}
function Ng(a) {
  var b = a._init;
  return b(a._payload);
}
function Og(a) {
  function b(b2, c2) {
    if (a) {
      var d2 = b2.deletions;
      d2 === null ? (b2.deletions = [c2], b2.flags |= 16) : d2.push(c2);
    }
  }
  function c(c2, d2) {
    if (!a)
      return null;
    for (;d2 !== null; )
      b(c2, d2), d2 = d2.sibling;
    return null;
  }
  function d(a2, b2) {
    for (a2 = new Map;b2 !== null; )
      b2.key !== null ? a2.set(b2.key, b2) : a2.set(b2.index, b2), b2 = b2.sibling;
    return a2;
  }
  function e(a2, b2) {
    a2 = Pg(a2, b2);
    a2.index = 0;
    a2.sibling = null;
    return a2;
  }
  function f2(b2, c2, d2) {
    b2.index = d2;
    if (!a)
      return b2.flags |= 1048576, c2;
    d2 = b2.alternate;
    if (d2 !== null)
      return d2 = d2.index, d2 < c2 ? (b2.flags |= 2, c2) : d2;
    b2.flags |= 2;
    return c2;
  }
  function g(b2) {
    a && b2.alternate === null && (b2.flags |= 2);
    return b2;
  }
  function h(a2, b2, c2, d2) {
    if (b2 === null || b2.tag !== 6)
      return b2 = Qg(c2, a2.mode, d2), b2.return = a2, b2;
    b2 = e(b2, c2);
    b2.return = a2;
    return b2;
  }
  function k2(a2, b2, c2, d2) {
    var f3 = c2.type;
    if (f3 === ya)
      return m2(a2, b2, c2.props.children, d2, c2.key);
    if (b2 !== null && (b2.elementType === f3 || typeof f3 === "object" && f3 !== null && f3.$$typeof === Ha && Ng(f3) === b2.type))
      return d2 = e(b2, c2.props), d2.ref = Lg(a2, b2, c2), d2.return = a2, d2;
    d2 = Rg(c2.type, c2.key, c2.props, null, a2.mode, d2);
    d2.ref = Lg(a2, b2, c2);
    d2.return = a2;
    return d2;
  }
  function l3(a2, b2, c2, d2) {
    if (b2 === null || b2.tag !== 4 || b2.stateNode.containerInfo !== c2.containerInfo || b2.stateNode.implementation !== c2.implementation)
      return b2 = Sg(c2, a2.mode, d2), b2.return = a2, b2;
    b2 = e(b2, c2.children || []);
    b2.return = a2;
    return b2;
  }
  function m2(a2, b2, c2, d2, f3) {
    if (b2 === null || b2.tag !== 7)
      return b2 = Tg(c2, a2.mode, d2, f3), b2.return = a2, b2;
    b2 = e(b2, c2);
    b2.return = a2;
    return b2;
  }
  function q3(a2, b2, c2) {
    if (typeof b2 === "string" && b2 !== "" || typeof b2 === "number")
      return b2 = Qg("" + b2, a2.mode, c2), b2.return = a2, b2;
    if (typeof b2 === "object" && b2 !== null) {
      switch (b2.$$typeof) {
        case va:
          return c2 = Rg(b2.type, b2.key, b2.props, null, a2.mode, c2), c2.ref = Lg(a2, null, b2), c2.return = a2, c2;
        case wa:
          return b2 = Sg(b2, a2.mode, c2), b2.return = a2, b2;
        case Ha:
          var d2 = b2._init;
          return q3(a2, d2(b2._payload), c2);
      }
      if (eb(b2) || Ka(b2))
        return b2 = Tg(b2, a2.mode, c2, null), b2.return = a2, b2;
      Mg(a2, b2);
    }
    return null;
  }
  function r2(a2, b2, c2, d2) {
    var e2 = b2 !== null ? b2.key : null;
    if (typeof c2 === "string" && c2 !== "" || typeof c2 === "number")
      return e2 !== null ? null : h(a2, b2, "" + c2, d2);
    if (typeof c2 === "object" && c2 !== null) {
      switch (c2.$$typeof) {
        case va:
          return c2.key === e2 ? k2(a2, b2, c2, d2) : null;
        case wa:
          return c2.key === e2 ? l3(a2, b2, c2, d2) : null;
        case Ha:
          return e2 = c2._init, r2(a2, b2, e2(c2._payload), d2);
      }
      if (eb(c2) || Ka(c2))
        return e2 !== null ? null : m2(a2, b2, c2, d2, null);
      Mg(a2, c2);
    }
    return null;
  }
  function y2(a2, b2, c2, d2, e2) {
    if (typeof d2 === "string" && d2 !== "" || typeof d2 === "number")
      return a2 = a2.get(c2) || null, h(b2, a2, "" + d2, e2);
    if (typeof d2 === "object" && d2 !== null) {
      switch (d2.$$typeof) {
        case va:
          return a2 = a2.get(d2.key === null ? c2 : d2.key) || null, k2(b2, a2, d2, e2);
        case wa:
          return a2 = a2.get(d2.key === null ? c2 : d2.key) || null, l3(b2, a2, d2, e2);
        case Ha:
          var f3 = d2._init;
          return y2(a2, b2, c2, f3(d2._payload), e2);
      }
      if (eb(d2) || Ka(d2))
        return a2 = a2.get(c2) || null, m2(b2, a2, d2, e2, null);
      Mg(b2, d2);
    }
    return null;
  }
  function n3(e2, g2, h2, k3) {
    for (var l4 = null, m3 = null, u2 = g2, w2 = g2 = 0, x2 = null;u2 !== null && w2 < h2.length; w2++) {
      u2.index > w2 ? (x2 = u2, u2 = null) : x2 = u2.sibling;
      var n4 = r2(e2, u2, h2[w2], k3);
      if (n4 === null) {
        u2 === null && (u2 = x2);
        break;
      }
      a && u2 && n4.alternate === null && b(e2, u2);
      g2 = f2(n4, g2, w2);
      m3 === null ? l4 = n4 : m3.sibling = n4;
      m3 = n4;
      u2 = x2;
    }
    if (w2 === h2.length)
      return c(e2, u2), I2 && tg(e2, w2), l4;
    if (u2 === null) {
      for (;w2 < h2.length; w2++)
        u2 = q3(e2, h2[w2], k3), u2 !== null && (g2 = f2(u2, g2, w2), m3 === null ? l4 = u2 : m3.sibling = u2, m3 = u2);
      I2 && tg(e2, w2);
      return l4;
    }
    for (u2 = d(e2, u2);w2 < h2.length; w2++)
      x2 = y2(u2, e2, w2, h2[w2], k3), x2 !== null && (a && x2.alternate !== null && u2.delete(x2.key === null ? w2 : x2.key), g2 = f2(x2, g2, w2), m3 === null ? l4 = x2 : m3.sibling = x2, m3 = x2);
    a && u2.forEach(function(a2) {
      return b(e2, a2);
    });
    I2 && tg(e2, w2);
    return l4;
  }
  function t2(e2, g2, h2, k3) {
    var l4 = Ka(h2);
    if (typeof l4 !== "function")
      throw Error(p3(150));
    h2 = l4.call(h2);
    if (h2 == null)
      throw Error(p3(151));
    for (var u2 = l4 = null, m3 = g2, w2 = g2 = 0, x2 = null, n4 = h2.next();m3 !== null && !n4.done; w2++, n4 = h2.next()) {
      m3.index > w2 ? (x2 = m3, m3 = null) : x2 = m3.sibling;
      var t3 = r2(e2, m3, n4.value, k3);
      if (t3 === null) {
        m3 === null && (m3 = x2);
        break;
      }
      a && m3 && t3.alternate === null && b(e2, m3);
      g2 = f2(t3, g2, w2);
      u2 === null ? l4 = t3 : u2.sibling = t3;
      u2 = t3;
      m3 = x2;
    }
    if (n4.done)
      return c(e2, m3), I2 && tg(e2, w2), l4;
    if (m3 === null) {
      for (;!n4.done; w2++, n4 = h2.next())
        n4 = q3(e2, n4.value, k3), n4 !== null && (g2 = f2(n4, g2, w2), u2 === null ? l4 = n4 : u2.sibling = n4, u2 = n4);
      I2 && tg(e2, w2);
      return l4;
    }
    for (m3 = d(e2, m3);!n4.done; w2++, n4 = h2.next())
      n4 = y2(m3, e2, w2, n4.value, k3), n4 !== null && (a && n4.alternate !== null && m3.delete(n4.key === null ? w2 : n4.key), g2 = f2(n4, g2, w2), u2 === null ? l4 = n4 : u2.sibling = n4, u2 = n4);
    a && m3.forEach(function(a2) {
      return b(e2, a2);
    });
    I2 && tg(e2, w2);
    return l4;
  }
  function J2(a2, d2, f3, h2) {
    typeof f3 === "object" && f3 !== null && f3.type === ya && f3.key === null && (f3 = f3.props.children);
    if (typeof f3 === "object" && f3 !== null) {
      switch (f3.$$typeof) {
        case va:
          a: {
            for (var k3 = f3.key, l4 = d2;l4 !== null; ) {
              if (l4.key === k3) {
                k3 = f3.type;
                if (k3 === ya) {
                  if (l4.tag === 7) {
                    c(a2, l4.sibling);
                    d2 = e(l4, f3.props.children);
                    d2.return = a2;
                    a2 = d2;
                    break a;
                  }
                } else if (l4.elementType === k3 || typeof k3 === "object" && k3 !== null && k3.$$typeof === Ha && Ng(k3) === l4.type) {
                  c(a2, l4.sibling);
                  d2 = e(l4, f3.props);
                  d2.ref = Lg(a2, l4, f3);
                  d2.return = a2;
                  a2 = d2;
                  break a;
                }
                c(a2, l4);
                break;
              } else
                b(a2, l4);
              l4 = l4.sibling;
            }
            f3.type === ya ? (d2 = Tg(f3.props.children, a2.mode, h2, f3.key), d2.return = a2, a2 = d2) : (h2 = Rg(f3.type, f3.key, f3.props, null, a2.mode, h2), h2.ref = Lg(a2, d2, f3), h2.return = a2, a2 = h2);
          }
          return g(a2);
        case wa:
          a: {
            for (l4 = f3.key;d2 !== null; ) {
              if (d2.key === l4)
                if (d2.tag === 4 && d2.stateNode.containerInfo === f3.containerInfo && d2.stateNode.implementation === f3.implementation) {
                  c(a2, d2.sibling);
                  d2 = e(d2, f3.children || []);
                  d2.return = a2;
                  a2 = d2;
                  break a;
                } else {
                  c(a2, d2);
                  break;
                }
              else
                b(a2, d2);
              d2 = d2.sibling;
            }
            d2 = Sg(f3, a2.mode, h2);
            d2.return = a2;
            a2 = d2;
          }
          return g(a2);
        case Ha:
          return l4 = f3._init, J2(a2, d2, l4(f3._payload), h2);
      }
      if (eb(f3))
        return n3(a2, d2, f3, h2);
      if (Ka(f3))
        return t2(a2, d2, f3, h2);
      Mg(a2, f3);
    }
    return typeof f3 === "string" && f3 !== "" || typeof f3 === "number" ? (f3 = "" + f3, d2 !== null && d2.tag === 6 ? (c(a2, d2.sibling), d2 = e(d2, f3), d2.return = a2, a2 = d2) : (c(a2, d2), d2 = Qg(f3, a2.mode, h2), d2.return = a2, a2 = d2), g(a2)) : c(a2, d2);
  }
  return J2;
}
function $g() {
  Zg = Yg = Xg = null;
}
function ah(a) {
  var b = Wg.current;
  E2(Wg);
  a._currentValue = b;
}
function bh(a, b, c) {
  for (;a !== null; ) {
    var d = a.alternate;
    (a.childLanes & b) !== b ? (a.childLanes |= b, d !== null && (d.childLanes |= b)) : d !== null && (d.childLanes & b) !== b && (d.childLanes |= b);
    if (a === c)
      break;
    a = a.return;
  }
}
function ch(a, b) {
  Xg = a;
  Zg = Yg = null;
  a = a.dependencies;
  a !== null && a.firstContext !== null && ((a.lanes & b) !== 0 && (dh = true), a.firstContext = null);
}
function eh(a) {
  var b = a._currentValue;
  if (Zg !== a)
    if (a = { context: a, memoizedValue: b, next: null }, Yg === null) {
      if (Xg === null)
        throw Error(p3(308));
      Yg = a;
      Xg.dependencies = { lanes: 0, firstContext: a };
    } else
      Yg = Yg.next = a;
  return b;
}
function gh(a) {
  fh === null ? fh = [a] : fh.push(a);
}
function hh(a, b, c, d) {
  var e = b.interleaved;
  e === null ? (c.next = c, gh(b)) : (c.next = e.next, e.next = c);
  b.interleaved = c;
  return ih(a, d);
}
function ih(a, b) {
  a.lanes |= b;
  var c = a.alternate;
  c !== null && (c.lanes |= b);
  c = a;
  for (a = a.return;a !== null; )
    a.childLanes |= b, c = a.alternate, c !== null && (c.childLanes |= b), c = a, a = a.return;
  return c.tag === 3 ? c.stateNode : null;
}
function kh(a) {
  a.updateQueue = { baseState: a.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function lh(a, b) {
  a = a.updateQueue;
  b.updateQueue === a && (b.updateQueue = { baseState: a.baseState, firstBaseUpdate: a.firstBaseUpdate, lastBaseUpdate: a.lastBaseUpdate, shared: a.shared, effects: a.effects });
}
function mh(a, b) {
  return { eventTime: a, lane: b, tag: 0, payload: null, callback: null, next: null };
}
function nh(a, b, c) {
  var d = a.updateQueue;
  if (d === null)
    return null;
  d = d.shared;
  if ((K2 & 2) !== 0) {
    var e = d.pending;
    e === null ? b.next = b : (b.next = e.next, e.next = b);
    d.pending = b;
    return ih(a, c);
  }
  e = d.interleaved;
  e === null ? (b.next = b, gh(d)) : (b.next = e.next, e.next = b);
  d.interleaved = b;
  return ih(a, c);
}
function oh(a, b, c) {
  b = b.updateQueue;
  if (b !== null && (b = b.shared, (c & 4194240) !== 0)) {
    var d = b.lanes;
    d &= a.pendingLanes;
    c |= d;
    b.lanes = c;
    Cc(a, c);
  }
}
function ph(a, b) {
  var { updateQueue: c, alternate: d } = a;
  if (d !== null && (d = d.updateQueue, c === d)) {
    var e = null, f2 = null;
    c = c.firstBaseUpdate;
    if (c !== null) {
      do {
        var g = { eventTime: c.eventTime, lane: c.lane, tag: c.tag, payload: c.payload, callback: c.callback, next: null };
        f2 === null ? e = f2 = g : f2 = f2.next = g;
        c = c.next;
      } while (c !== null);
      f2 === null ? e = f2 = b : f2 = f2.next = b;
    } else
      e = f2 = b;
    c = { baseState: d.baseState, firstBaseUpdate: e, lastBaseUpdate: f2, shared: d.shared, effects: d.effects };
    a.updateQueue = c;
    return;
  }
  a = c.lastBaseUpdate;
  a === null ? c.firstBaseUpdate = b : a.next = b;
  c.lastBaseUpdate = b;
}
function qh(a, b, c, d) {
  var e = a.updateQueue;
  jh = false;
  var { firstBaseUpdate: f2, lastBaseUpdate: g } = e, h = e.shared.pending;
  if (h !== null) {
    e.shared.pending = null;
    var k2 = h, l3 = k2.next;
    k2.next = null;
    g === null ? f2 = l3 : g.next = l3;
    g = k2;
    var m2 = a.alternate;
    m2 !== null && (m2 = m2.updateQueue, h = m2.lastBaseUpdate, h !== g && (h === null ? m2.firstBaseUpdate = l3 : h.next = l3, m2.lastBaseUpdate = k2));
  }
  if (f2 !== null) {
    var q3 = e.baseState;
    g = 0;
    m2 = l3 = k2 = null;
    h = f2;
    do {
      var { lane: r2, eventTime: y2 } = h;
      if ((d & r2) === r2) {
        m2 !== null && (m2 = m2.next = {
          eventTime: y2,
          lane: 0,
          tag: h.tag,
          payload: h.payload,
          callback: h.callback,
          next: null
        });
        a: {
          var n3 = a, t2 = h;
          r2 = b;
          y2 = c;
          switch (t2.tag) {
            case 1:
              n3 = t2.payload;
              if (typeof n3 === "function") {
                q3 = n3.call(y2, q3, r2);
                break a;
              }
              q3 = n3;
              break a;
            case 3:
              n3.flags = n3.flags & -65537 | 128;
            case 0:
              n3 = t2.payload;
              r2 = typeof n3 === "function" ? n3.call(y2, q3, r2) : n3;
              if (r2 === null || r2 === undefined)
                break a;
              q3 = A2({}, q3, r2);
              break a;
            case 2:
              jh = true;
          }
        }
        h.callback !== null && h.lane !== 0 && (a.flags |= 64, r2 = e.effects, r2 === null ? e.effects = [h] : r2.push(h));
      } else
        y2 = { eventTime: y2, lane: r2, tag: h.tag, payload: h.payload, callback: h.callback, next: null }, m2 === null ? (l3 = m2 = y2, k2 = q3) : m2 = m2.next = y2, g |= r2;
      h = h.next;
      if (h === null)
        if (h = e.shared.pending, h === null)
          break;
        else
          r2 = h, h = r2.next, r2.next = null, e.lastBaseUpdate = r2, e.shared.pending = null;
    } while (1);
    m2 === null && (k2 = q3);
    e.baseState = k2;
    e.firstBaseUpdate = l3;
    e.lastBaseUpdate = m2;
    b = e.shared.interleaved;
    if (b !== null) {
      e = b;
      do
        g |= e.lane, e = e.next;
      while (e !== b);
    } else
      f2 === null && (e.shared.lanes = 0);
    rh |= g;
    a.lanes = g;
    a.memoizedState = q3;
  }
}
function sh(a, b, c) {
  a = b.effects;
  b.effects = null;
  if (a !== null)
    for (b = 0;b < a.length; b++) {
      var d = a[b], e = d.callback;
      if (e !== null) {
        d.callback = null;
        d = c;
        if (typeof e !== "function")
          throw Error(p3(191, e));
        e.call(d);
      }
    }
}
function xh(a) {
  if (a === th)
    throw Error(p3(174));
  return a;
}
function yh(a, b) {
  G2(wh, b);
  G2(vh, a);
  G2(uh, th);
  a = b.nodeType;
  switch (a) {
    case 9:
    case 11:
      b = (b = b.documentElement) ? b.namespaceURI : lb(null, "");
      break;
    default:
      a = a === 8 ? b.parentNode : b, b = a.namespaceURI || null, a = a.tagName, b = lb(b, a);
  }
  E2(uh);
  G2(uh, b);
}
function zh() {
  E2(uh);
  E2(vh);
  E2(wh);
}
function Ah(a) {
  xh(wh.current);
  var b = xh(uh.current);
  var c = lb(b, a.type);
  b !== c && (G2(vh, a), G2(uh, c));
}
function Bh(a) {
  vh.current === a && (E2(uh), E2(vh));
}
function Ch(a) {
  for (var b = a;b !== null; ) {
    if (b.tag === 13) {
      var c = b.memoizedState;
      if (c !== null && (c = c.dehydrated, c === null || c.data === "$?" || c.data === "$!"))
        return b;
    } else if (b.tag === 19 && b.memoizedProps.revealOrder !== undefined) {
      if ((b.flags & 128) !== 0)
        return b;
    } else if (b.child !== null) {
      b.child.return = b;
      b = b.child;
      continue;
    }
    if (b === a)
      break;
    for (;b.sibling === null; ) {
      if (b.return === null || b.return === a)
        return null;
      b = b.return;
    }
    b.sibling.return = b.return;
    b = b.sibling;
  }
  return null;
}
function Eh() {
  for (var a = 0;a < Dh.length; a++)
    Dh[a]._workInProgressVersionPrimary = null;
  Dh.length = 0;
}
function P2() {
  throw Error(p3(321));
}
function Mh(a, b) {
  if (b === null)
    return false;
  for (var c = 0;c < b.length && c < a.length; c++)
    if (!He(a[c], b[c]))
      return false;
  return true;
}
function Nh(a, b, c, d, e, f2) {
  Hh = f2;
  M2 = b;
  b.memoizedState = null;
  b.updateQueue = null;
  b.lanes = 0;
  Fh.current = a === null || a.memoizedState === null ? Oh : Ph;
  a = c(d, e);
  if (Jh) {
    f2 = 0;
    do {
      Jh = false;
      Kh = 0;
      if (25 <= f2)
        throw Error(p3(301));
      f2 += 1;
      O2 = N2 = null;
      b.updateQueue = null;
      Fh.current = Qh;
      a = c(d, e);
    } while (Jh);
  }
  Fh.current = Rh;
  b = N2 !== null && N2.next !== null;
  Hh = 0;
  O2 = N2 = M2 = null;
  Ih = false;
  if (b)
    throw Error(p3(300));
  return a;
}
function Sh() {
  var a = Kh !== 0;
  Kh = 0;
  return a;
}
function Th() {
  var a = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  O2 === null ? M2.memoizedState = O2 = a : O2 = O2.next = a;
  return O2;
}
function Uh() {
  if (N2 === null) {
    var a = M2.alternate;
    a = a !== null ? a.memoizedState : null;
  } else
    a = N2.next;
  var b = O2 === null ? M2.memoizedState : O2.next;
  if (b !== null)
    O2 = b, N2 = a;
  else {
    if (a === null)
      throw Error(p3(310));
    N2 = a;
    a = { memoizedState: N2.memoizedState, baseState: N2.baseState, baseQueue: N2.baseQueue, queue: N2.queue, next: null };
    O2 === null ? M2.memoizedState = O2 = a : O2 = O2.next = a;
  }
  return O2;
}
function Vh(a, b) {
  return typeof b === "function" ? b(a) : b;
}
function Wh(a) {
  var b = Uh(), c = b.queue;
  if (c === null)
    throw Error(p3(311));
  c.lastRenderedReducer = a;
  var d = N2, e = d.baseQueue, f2 = c.pending;
  if (f2 !== null) {
    if (e !== null) {
      var g = e.next;
      e.next = f2.next;
      f2.next = g;
    }
    d.baseQueue = e = f2;
    c.pending = null;
  }
  if (e !== null) {
    f2 = e.next;
    d = d.baseState;
    var h = g = null, k2 = null, l3 = f2;
    do {
      var m2 = l3.lane;
      if ((Hh & m2) === m2)
        k2 !== null && (k2 = k2.next = { lane: 0, action: l3.action, hasEagerState: l3.hasEagerState, eagerState: l3.eagerState, next: null }), d = l3.hasEagerState ? l3.eagerState : a(d, l3.action);
      else {
        var q3 = {
          lane: m2,
          action: l3.action,
          hasEagerState: l3.hasEagerState,
          eagerState: l3.eagerState,
          next: null
        };
        k2 === null ? (h = k2 = q3, g = d) : k2 = k2.next = q3;
        M2.lanes |= m2;
        rh |= m2;
      }
      l3 = l3.next;
    } while (l3 !== null && l3 !== f2);
    k2 === null ? g = d : k2.next = h;
    He(d, b.memoizedState) || (dh = true);
    b.memoizedState = d;
    b.baseState = g;
    b.baseQueue = k2;
    c.lastRenderedState = d;
  }
  a = c.interleaved;
  if (a !== null) {
    e = a;
    do
      f2 = e.lane, M2.lanes |= f2, rh |= f2, e = e.next;
    while (e !== a);
  } else
    e === null && (c.lanes = 0);
  return [b.memoizedState, c.dispatch];
}
function Xh(a) {
  var b = Uh(), c = b.queue;
  if (c === null)
    throw Error(p3(311));
  c.lastRenderedReducer = a;
  var { dispatch: d, pending: e } = c, f2 = b.memoizedState;
  if (e !== null) {
    c.pending = null;
    var g = e = e.next;
    do
      f2 = a(f2, g.action), g = g.next;
    while (g !== e);
    He(f2, b.memoizedState) || (dh = true);
    b.memoizedState = f2;
    b.baseQueue === null && (b.baseState = f2);
    c.lastRenderedState = f2;
  }
  return [f2, d];
}
function Yh() {}
function Zh(a, b) {
  var c = M2, d = Uh(), e = b(), f2 = !He(d.memoizedState, e);
  f2 && (d.memoizedState = e, dh = true);
  d = d.queue;
  $h(ai.bind(null, c, d, a), [a]);
  if (d.getSnapshot !== b || f2 || O2 !== null && O2.memoizedState.tag & 1) {
    c.flags |= 2048;
    bi(9, ci.bind(null, c, d, e, b), undefined, null);
    if (Q2 === null)
      throw Error(p3(349));
    (Hh & 30) !== 0 || di(c, b, e);
  }
  return e;
}
function di(a, b, c) {
  a.flags |= 16384;
  a = { getSnapshot: b, value: c };
  b = M2.updateQueue;
  b === null ? (b = { lastEffect: null, stores: null }, M2.updateQueue = b, b.stores = [a]) : (c = b.stores, c === null ? b.stores = [a] : c.push(a));
}
function ci(a, b, c, d) {
  b.value = c;
  b.getSnapshot = d;
  ei(b) && fi(a);
}
function ai(a, b, c) {
  return c(function() {
    ei(b) && fi(a);
  });
}
function ei(a) {
  var b = a.getSnapshot;
  a = a.value;
  try {
    var c = b();
    return !He(a, c);
  } catch (d) {
    return true;
  }
}
function fi(a) {
  var b = ih(a, 1);
  b !== null && gi(b, a, 1, -1);
}
function hi(a) {
  var b = Th();
  typeof a === "function" && (a = a());
  b.memoizedState = b.baseState = a;
  a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Vh, lastRenderedState: a };
  b.queue = a;
  a = a.dispatch = ii.bind(null, M2, a);
  return [b.memoizedState, a];
}
function bi(a, b, c, d) {
  a = { tag: a, create: b, destroy: c, deps: d, next: null };
  b = M2.updateQueue;
  b === null ? (b = { lastEffect: null, stores: null }, M2.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, c === null ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
  return a;
}
function ji() {
  return Uh().memoizedState;
}
function ki(a, b, c, d) {
  var e = Th();
  M2.flags |= a;
  e.memoizedState = bi(1 | b, c, undefined, d === undefined ? null : d);
}
function li(a, b, c, d) {
  var e = Uh();
  d = d === undefined ? null : d;
  var f2 = undefined;
  if (N2 !== null) {
    var g = N2.memoizedState;
    f2 = g.destroy;
    if (d !== null && Mh(d, g.deps)) {
      e.memoizedState = bi(b, c, f2, d);
      return;
    }
  }
  M2.flags |= a;
  e.memoizedState = bi(1 | b, c, f2, d);
}
function mi(a, b) {
  return ki(8390656, 8, a, b);
}
function $h(a, b) {
  return li(2048, 8, a, b);
}
function ni(a, b) {
  return li(4, 2, a, b);
}
function oi(a, b) {
  return li(4, 4, a, b);
}
function pi(a, b) {
  if (typeof b === "function")
    return a = a(), b(a), function() {
      b(null);
    };
  if (b !== null && b !== undefined)
    return a = a(), b.current = a, function() {
      b.current = null;
    };
}
function qi(a, b, c) {
  c = c !== null && c !== undefined ? c.concat([a]) : null;
  return li(4, 4, pi.bind(null, b, a), c);
}
function ri() {}
function si(a, b) {
  var c = Uh();
  b = b === undefined ? null : b;
  var d = c.memoizedState;
  if (d !== null && b !== null && Mh(b, d[1]))
    return d[0];
  c.memoizedState = [a, b];
  return a;
}
function ti(a, b) {
  var c = Uh();
  b = b === undefined ? null : b;
  var d = c.memoizedState;
  if (d !== null && b !== null && Mh(b, d[1]))
    return d[0];
  a = a();
  c.memoizedState = [a, b];
  return a;
}
function ui(a, b, c) {
  if ((Hh & 21) === 0)
    return a.baseState && (a.baseState = false, dh = true), a.memoizedState = c;
  He(c, b) || (c = yc(), M2.lanes |= c, rh |= c, a.baseState = true);
  return b;
}
function vi(a, b) {
  var c = C2;
  C2 = c !== 0 && 4 > c ? c : 4;
  a(true);
  var d = Gh.transition;
  Gh.transition = {};
  try {
    a(false), b();
  } finally {
    C2 = c, Gh.transition = d;
  }
}
function wi() {
  return Uh().memoizedState;
}
function xi(a, b, c) {
  var d = yi(a);
  c = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
  if (zi(a))
    Ai(b, c);
  else if (c = hh(a, b, c, d), c !== null) {
    var e = R2();
    gi(c, a, d, e);
    Bi(c, b, d);
  }
}
function ii(a, b, c) {
  var d = yi(a), e = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
  if (zi(a))
    Ai(b, e);
  else {
    var f2 = a.alternate;
    if (a.lanes === 0 && (f2 === null || f2.lanes === 0) && (f2 = b.lastRenderedReducer, f2 !== null))
      try {
        var g = b.lastRenderedState, h = f2(g, c);
        e.hasEagerState = true;
        e.eagerState = h;
        if (He(h, g)) {
          var k2 = b.interleaved;
          k2 === null ? (e.next = e, gh(b)) : (e.next = k2.next, k2.next = e);
          b.interleaved = e;
          return;
        }
      } catch (l3) {} finally {}
    c = hh(a, b, e, d);
    c !== null && (e = R2(), gi(c, a, d, e), Bi(c, b, d));
  }
}
function zi(a) {
  var b = a.alternate;
  return a === M2 || b !== null && b === M2;
}
function Ai(a, b) {
  Jh = Ih = true;
  var c = a.pending;
  c === null ? b.next = b : (b.next = c.next, c.next = b);
  a.pending = b;
}
function Bi(a, b, c) {
  if ((c & 4194240) !== 0) {
    var d = b.lanes;
    d &= a.pendingLanes;
    c |= d;
    b.lanes = c;
    Cc(a, c);
  }
}
function Ci(a, b) {
  if (a && a.defaultProps) {
    b = A2({}, b);
    a = a.defaultProps;
    for (var c in a)
      b[c] === undefined && (b[c] = a[c]);
    return b;
  }
  return b;
}
function Di(a, b, c, d) {
  b = a.memoizedState;
  c = c(d, b);
  c = c === null || c === undefined ? b : A2({}, b, c);
  a.memoizedState = c;
  a.lanes === 0 && (a.updateQueue.baseState = c);
}
function Fi(a, b, c, d, e, f2, g) {
  a = a.stateNode;
  return typeof a.shouldComponentUpdate === "function" ? a.shouldComponentUpdate(d, f2, g) : b.prototype && b.prototype.isPureReactComponent ? !Ie(c, d) || !Ie(e, f2) : true;
}
function Gi(a, b, c) {
  var d = false, e = Vf;
  var f2 = b.contextType;
  typeof f2 === "object" && f2 !== null ? f2 = eh(f2) : (e = Zf(b) ? Xf : H2.current, d = b.contextTypes, f2 = (d = d !== null && d !== undefined) ? Yf(a, e) : Vf);
  b = new b(c, f2);
  a.memoizedState = b.state !== null && b.state !== undefined ? b.state : null;
  b.updater = Ei;
  a.stateNode = b;
  b._reactInternals = a;
  d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f2);
  return b;
}
function Hi(a, b, c, d) {
  a = b.state;
  typeof b.componentWillReceiveProps === "function" && b.componentWillReceiveProps(c, d);
  typeof b.UNSAFE_componentWillReceiveProps === "function" && b.UNSAFE_componentWillReceiveProps(c, d);
  b.state !== a && Ei.enqueueReplaceState(b, b.state, null);
}
function Ii(a, b, c, d) {
  var e = a.stateNode;
  e.props = c;
  e.state = a.memoizedState;
  e.refs = {};
  kh(a);
  var f2 = b.contextType;
  typeof f2 === "object" && f2 !== null ? e.context = eh(f2) : (f2 = Zf(b) ? Xf : H2.current, e.context = Yf(a, f2));
  e.state = a.memoizedState;
  f2 = b.getDerivedStateFromProps;
  typeof f2 === "function" && (Di(a, b, f2, c), e.state = a.memoizedState);
  typeof b.getDerivedStateFromProps === "function" || typeof e.getSnapshotBeforeUpdate === "function" || typeof e.UNSAFE_componentWillMount !== "function" && typeof e.componentWillMount !== "function" || (b = e.state, typeof e.componentWillMount === "function" && e.componentWillMount(), typeof e.UNSAFE_componentWillMount === "function" && e.UNSAFE_componentWillMount(), b !== e.state && Ei.enqueueReplaceState(e, e.state, null), qh(a, c, e, d), e.state = a.memoizedState);
  typeof e.componentDidMount === "function" && (a.flags |= 4194308);
}
function Ji(a, b) {
  try {
    var c = "", d = b;
    do
      c += Pa(d), d = d.return;
    while (d);
    var e = c;
  } catch (f2) {
    e = `
Error generating stack: ` + f2.message + `
` + f2.stack;
  }
  return { value: a, source: b, stack: e, digest: null };
}
function Ki(a, b, c) {
  return { value: a, source: null, stack: c != null ? c : null, digest: b != null ? b : null };
}
function Li(a, b) {
  try {
    console.error(b.value);
  } catch (c) {
    setTimeout(function() {
      throw c;
    });
  }
}
function Ni(a, b, c) {
  c = mh(-1, c);
  c.tag = 3;
  c.payload = { element: null };
  var d = b.value;
  c.callback = function() {
    Oi || (Oi = true, Pi = d);
    Li(a, b);
  };
  return c;
}
function Qi(a, b, c) {
  c = mh(-1, c);
  c.tag = 3;
  var d = a.type.getDerivedStateFromError;
  if (typeof d === "function") {
    var e = b.value;
    c.payload = function() {
      return d(e);
    };
    c.callback = function() {
      Li(a, b);
    };
  }
  var f2 = a.stateNode;
  f2 !== null && typeof f2.componentDidCatch === "function" && (c.callback = function() {
    Li(a, b);
    typeof d !== "function" && (Ri === null ? Ri = new Set([this]) : Ri.add(this));
    var c2 = b.stack;
    this.componentDidCatch(b.value, { componentStack: c2 !== null ? c2 : "" });
  });
  return c;
}
function Si(a, b, c) {
  var d = a.pingCache;
  if (d === null) {
    d = a.pingCache = new Mi;
    var e = new Set;
    d.set(b, e);
  } else
    e = d.get(b), e === undefined && (e = new Set, d.set(b, e));
  e.has(c) || (e.add(c), a = Ti.bind(null, a, b, c), b.then(a, a));
}
function Ui(a) {
  do {
    var b;
    if (b = a.tag === 13)
      b = a.memoizedState, b = b !== null ? b.dehydrated !== null ? true : false : true;
    if (b)
      return a;
    a = a.return;
  } while (a !== null);
  return null;
}
function Vi(a, b, c, d, e) {
  if ((a.mode & 1) === 0)
    return a === b ? a.flags |= 65536 : (a.flags |= 128, c.flags |= 131072, c.flags &= -52805, c.tag === 1 && (c.alternate === null ? c.tag = 17 : (b = mh(-1, 1), b.tag = 2, nh(c, b, 1))), c.lanes |= 1), a;
  a.flags |= 65536;
  a.lanes = e;
  return a;
}
function Xi(a, b, c, d) {
  b.child = a === null ? Vg(b, null, c, d) : Ug(b, a.child, c, d);
}
function Yi(a, b, c, d, e) {
  c = c.render;
  var f2 = b.ref;
  ch(b, e);
  d = Nh(a, b, c, d, f2, e);
  c = Sh();
  if (a !== null && !dh)
    return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
  I2 && c && vg(b);
  b.flags |= 1;
  Xi(a, b, d, e);
  return b.child;
}
function $i(a, b, c, d, e) {
  if (a === null) {
    var f2 = c.type;
    if (typeof f2 === "function" && !aj(f2) && f2.defaultProps === undefined && c.compare === null && c.defaultProps === undefined)
      return b.tag = 15, b.type = f2, bj(a, b, f2, d, e);
    a = Rg(c.type, null, d, b, b.mode, e);
    a.ref = b.ref;
    a.return = b;
    return b.child = a;
  }
  f2 = a.child;
  if ((a.lanes & e) === 0) {
    var g = f2.memoizedProps;
    c = c.compare;
    c = c !== null ? c : Ie;
    if (c(g, d) && a.ref === b.ref)
      return Zi(a, b, e);
  }
  b.flags |= 1;
  a = Pg(f2, d);
  a.ref = b.ref;
  a.return = b;
  return b.child = a;
}
function bj(a, b, c, d, e) {
  if (a !== null) {
    var f2 = a.memoizedProps;
    if (Ie(f2, d) && a.ref === b.ref)
      if (dh = false, b.pendingProps = d = f2, (a.lanes & e) !== 0)
        (a.flags & 131072) !== 0 && (dh = true);
      else
        return b.lanes = a.lanes, Zi(a, b, e);
  }
  return cj(a, b, c, d, e);
}
function dj(a, b, c) {
  var d = b.pendingProps, e = d.children, f2 = a !== null ? a.memoizedState : null;
  if (d.mode === "hidden")
    if ((b.mode & 1) === 0)
      b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G2(ej, fj), fj |= c;
    else {
      if ((c & 1073741824) === 0)
        return a = f2 !== null ? f2.baseLanes | c : c, b.lanes = b.childLanes = 1073741824, b.memoizedState = { baseLanes: a, cachePool: null, transitions: null }, b.updateQueue = null, G2(ej, fj), fj |= a, null;
      b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
      d = f2 !== null ? f2.baseLanes : c;
      G2(ej, fj);
      fj |= d;
    }
  else
    f2 !== null ? (d = f2.baseLanes | c, b.memoizedState = null) : d = c, G2(ej, fj), fj |= d;
  Xi(a, b, e, c);
  return b.child;
}
function gj(a, b) {
  var c = b.ref;
  if (a === null && c !== null || a !== null && a.ref !== c)
    b.flags |= 512, b.flags |= 2097152;
}
function cj(a, b, c, d, e) {
  var f2 = Zf(c) ? Xf : H2.current;
  f2 = Yf(b, f2);
  ch(b, e);
  c = Nh(a, b, c, d, f2, e);
  d = Sh();
  if (a !== null && !dh)
    return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
  I2 && d && vg(b);
  b.flags |= 1;
  Xi(a, b, c, e);
  return b.child;
}
function hj(a, b, c, d, e) {
  if (Zf(c)) {
    var f2 = true;
    cg(b);
  } else
    f2 = false;
  ch(b, e);
  if (b.stateNode === null)
    ij(a, b), Gi(b, c, d), Ii(b, c, d, e), d = true;
  else if (a === null) {
    var { stateNode: g, memoizedProps: h } = b;
    g.props = h;
    var k2 = g.context, l3 = c.contextType;
    typeof l3 === "object" && l3 !== null ? l3 = eh(l3) : (l3 = Zf(c) ? Xf : H2.current, l3 = Yf(b, l3));
    var m2 = c.getDerivedStateFromProps, q3 = typeof m2 === "function" || typeof g.getSnapshotBeforeUpdate === "function";
    q3 || typeof g.UNSAFE_componentWillReceiveProps !== "function" && typeof g.componentWillReceiveProps !== "function" || (h !== d || k2 !== l3) && Hi(b, g, d, l3);
    jh = false;
    var r2 = b.memoizedState;
    g.state = r2;
    qh(b, d, g, e);
    k2 = b.memoizedState;
    h !== d || r2 !== k2 || Wf.current || jh ? (typeof m2 === "function" && (Di(b, c, m2, d), k2 = b.memoizedState), (h = jh || Fi(b, c, h, d, r2, k2, l3)) ? (q3 || typeof g.UNSAFE_componentWillMount !== "function" && typeof g.componentWillMount !== "function" || (typeof g.componentWillMount === "function" && g.componentWillMount(), typeof g.UNSAFE_componentWillMount === "function" && g.UNSAFE_componentWillMount()), typeof g.componentDidMount === "function" && (b.flags |= 4194308)) : (typeof g.componentDidMount === "function" && (b.flags |= 4194308), b.memoizedProps = d, b.memoizedState = k2), g.props = d, g.state = k2, g.context = l3, d = h) : (typeof g.componentDidMount === "function" && (b.flags |= 4194308), d = false);
  } else {
    g = b.stateNode;
    lh(a, b);
    h = b.memoizedProps;
    l3 = b.type === b.elementType ? h : Ci(b.type, h);
    g.props = l3;
    q3 = b.pendingProps;
    r2 = g.context;
    k2 = c.contextType;
    typeof k2 === "object" && k2 !== null ? k2 = eh(k2) : (k2 = Zf(c) ? Xf : H2.current, k2 = Yf(b, k2));
    var y2 = c.getDerivedStateFromProps;
    (m2 = typeof y2 === "function" || typeof g.getSnapshotBeforeUpdate === "function") || typeof g.UNSAFE_componentWillReceiveProps !== "function" && typeof g.componentWillReceiveProps !== "function" || (h !== q3 || r2 !== k2) && Hi(b, g, d, k2);
    jh = false;
    r2 = b.memoizedState;
    g.state = r2;
    qh(b, d, g, e);
    var n3 = b.memoizedState;
    h !== q3 || r2 !== n3 || Wf.current || jh ? (typeof y2 === "function" && (Di(b, c, y2, d), n3 = b.memoizedState), (l3 = jh || Fi(b, c, l3, d, r2, n3, k2) || false) ? (m2 || typeof g.UNSAFE_componentWillUpdate !== "function" && typeof g.componentWillUpdate !== "function" || (typeof g.componentWillUpdate === "function" && g.componentWillUpdate(d, n3, k2), typeof g.UNSAFE_componentWillUpdate === "function" && g.UNSAFE_componentWillUpdate(d, n3, k2)), typeof g.componentDidUpdate === "function" && (b.flags |= 4), typeof g.getSnapshotBeforeUpdate === "function" && (b.flags |= 1024)) : (typeof g.componentDidUpdate !== "function" || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 4), typeof g.getSnapshotBeforeUpdate !== "function" || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 1024), b.memoizedProps = d, b.memoizedState = n3), g.props = d, g.state = n3, g.context = k2, d = l3) : (typeof g.componentDidUpdate !== "function" || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 4), typeof g.getSnapshotBeforeUpdate !== "function" || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 1024), d = false);
  }
  return jj(a, b, c, d, f2, e);
}
function jj(a, b, c, d, e, f2) {
  gj(a, b);
  var g = (b.flags & 128) !== 0;
  if (!d && !g)
    return e && dg(b, c, false), Zi(a, b, f2);
  d = b.stateNode;
  Wi.current = b;
  var h = g && typeof c.getDerivedStateFromError !== "function" ? null : d.render();
  b.flags |= 1;
  a !== null && g ? (b.child = Ug(b, a.child, null, f2), b.child = Ug(b, null, h, f2)) : Xi(a, b, h, f2);
  b.memoizedState = d.state;
  e && dg(b, c, true);
  return b.child;
}
function kj(a) {
  var b = a.stateNode;
  b.pendingContext ? ag(a, b.pendingContext, b.pendingContext !== b.context) : b.context && ag(a, b.context, false);
  yh(a, b.containerInfo);
}
function lj(a, b, c, d, e) {
  Ig();
  Jg(e);
  b.flags |= 256;
  Xi(a, b, c, d);
  return b.child;
}
function nj(a) {
  return { baseLanes: a, cachePool: null, transitions: null };
}
function oj(a, b, c) {
  var d = b.pendingProps, e = L2.current, f2 = false, g = (b.flags & 128) !== 0, h;
  (h = g) || (h = a !== null && a.memoizedState === null ? false : (e & 2) !== 0);
  if (h)
    f2 = true, b.flags &= -129;
  else if (a === null || a.memoizedState !== null)
    e |= 1;
  G2(L2, e & 1);
  if (a === null) {
    Eg(b);
    a = b.memoizedState;
    if (a !== null && (a = a.dehydrated, a !== null))
      return (b.mode & 1) === 0 ? b.lanes = 1 : a.data === "$!" ? b.lanes = 8 : b.lanes = 1073741824, null;
    g = d.children;
    a = d.fallback;
    return f2 ? (d = b.mode, f2 = b.child, g = { mode: "hidden", children: g }, (d & 1) === 0 && f2 !== null ? (f2.childLanes = 0, f2.pendingProps = g) : f2 = pj(g, d, 0, null), a = Tg(a, d, c, null), f2.return = b, a.return = b, f2.sibling = a, b.child = f2, b.child.memoizedState = nj(c), b.memoizedState = mj, a) : qj(b, g);
  }
  e = a.memoizedState;
  if (e !== null && (h = e.dehydrated, h !== null))
    return rj(a, b, g, d, h, e, c);
  if (f2) {
    f2 = d.fallback;
    g = b.mode;
    e = a.child;
    h = e.sibling;
    var k2 = { mode: "hidden", children: d.children };
    (g & 1) === 0 && b.child !== e ? (d = b.child, d.childLanes = 0, d.pendingProps = k2, b.deletions = null) : (d = Pg(e, k2), d.subtreeFlags = e.subtreeFlags & 14680064);
    h !== null ? f2 = Pg(h, f2) : (f2 = Tg(f2, g, c, null), f2.flags |= 2);
    f2.return = b;
    d.return = b;
    d.sibling = f2;
    b.child = d;
    d = f2;
    f2 = b.child;
    g = a.child.memoizedState;
    g = g === null ? nj(c) : { baseLanes: g.baseLanes | c, cachePool: null, transitions: g.transitions };
    f2.memoizedState = g;
    f2.childLanes = a.childLanes & ~c;
    b.memoizedState = mj;
    return d;
  }
  f2 = a.child;
  a = f2.sibling;
  d = Pg(f2, { mode: "visible", children: d.children });
  (b.mode & 1) === 0 && (d.lanes = c);
  d.return = b;
  d.sibling = null;
  a !== null && (c = b.deletions, c === null ? (b.deletions = [a], b.flags |= 16) : c.push(a));
  b.child = d;
  b.memoizedState = null;
  return d;
}
function qj(a, b) {
  b = pj({ mode: "visible", children: b }, a.mode, 0, null);
  b.return = a;
  return a.child = b;
}
function sj(a, b, c, d) {
  d !== null && Jg(d);
  Ug(b, a.child, null, c);
  a = qj(b, b.pendingProps.children);
  a.flags |= 2;
  b.memoizedState = null;
  return a;
}
function rj(a, b, c, d, e, f2, g) {
  if (c) {
    if (b.flags & 256)
      return b.flags &= -257, d = Ki(Error(p3(422))), sj(a, b, g, d);
    if (b.memoizedState !== null)
      return b.child = a.child, b.flags |= 128, null;
    f2 = d.fallback;
    e = b.mode;
    d = pj({ mode: "visible", children: d.children }, e, 0, null);
    f2 = Tg(f2, e, g, null);
    f2.flags |= 2;
    d.return = b;
    f2.return = b;
    d.sibling = f2;
    b.child = d;
    (b.mode & 1) !== 0 && Ug(b, a.child, null, g);
    b.child.memoizedState = nj(g);
    b.memoizedState = mj;
    return f2;
  }
  if ((b.mode & 1) === 0)
    return sj(a, b, g, null);
  if (e.data === "$!") {
    d = e.nextSibling && e.nextSibling.dataset;
    if (d)
      var h = d.dgst;
    d = h;
    f2 = Error(p3(419));
    d = Ki(f2, d, undefined);
    return sj(a, b, g, d);
  }
  h = (g & a.childLanes) !== 0;
  if (dh || h) {
    d = Q2;
    if (d !== null) {
      switch (g & -g) {
        case 4:
          e = 2;
          break;
        case 16:
          e = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          e = 32;
          break;
        case 536870912:
          e = 268435456;
          break;
        default:
          e = 0;
      }
      e = (e & (d.suspendedLanes | g)) !== 0 ? 0 : e;
      e !== 0 && e !== f2.retryLane && (f2.retryLane = e, ih(a, e), gi(d, a, e, -1));
    }
    tj();
    d = Ki(Error(p3(421)));
    return sj(a, b, g, d);
  }
  if (e.data === "$?")
    return b.flags |= 128, b.child = a.child, b = uj.bind(null, a), e._reactRetry = b, null;
  a = f2.treeContext;
  yg = Lf(e.nextSibling);
  xg = b;
  I2 = true;
  zg = null;
  a !== null && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a.id, sg = a.overflow, qg = b);
  b = qj(b, d.children);
  b.flags |= 4096;
  return b;
}
function vj(a, b, c) {
  a.lanes |= b;
  var d = a.alternate;
  d !== null && (d.lanes |= b);
  bh(a.return, b, c);
}
function wj(a, b, c, d, e) {
  var f2 = a.memoizedState;
  f2 === null ? a.memoizedState = { isBackwards: b, rendering: null, renderingStartTime: 0, last: d, tail: c, tailMode: e } : (f2.isBackwards = b, f2.rendering = null, f2.renderingStartTime = 0, f2.last = d, f2.tail = c, f2.tailMode = e);
}
function xj(a, b, c) {
  var d = b.pendingProps, e = d.revealOrder, f2 = d.tail;
  Xi(a, b, d.children, c);
  d = L2.current;
  if ((d & 2) !== 0)
    d = d & 1 | 2, b.flags |= 128;
  else {
    if (a !== null && (a.flags & 128) !== 0)
      a:
        for (a = b.child;a !== null; ) {
          if (a.tag === 13)
            a.memoizedState !== null && vj(a, c, b);
          else if (a.tag === 19)
            vj(a, c, b);
          else if (a.child !== null) {
            a.child.return = a;
            a = a.child;
            continue;
          }
          if (a === b)
            break a;
          for (;a.sibling === null; ) {
            if (a.return === null || a.return === b)
              break a;
            a = a.return;
          }
          a.sibling.return = a.return;
          a = a.sibling;
        }
    d &= 1;
  }
  G2(L2, d);
  if ((b.mode & 1) === 0)
    b.memoizedState = null;
  else
    switch (e) {
      case "forwards":
        c = b.child;
        for (e = null;c !== null; )
          a = c.alternate, a !== null && Ch(a) === null && (e = c), c = c.sibling;
        c = e;
        c === null ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
        wj(b, false, e, c, f2);
        break;
      case "backwards":
        c = null;
        e = b.child;
        for (b.child = null;e !== null; ) {
          a = e.alternate;
          if (a !== null && Ch(a) === null) {
            b.child = e;
            break;
          }
          a = e.sibling;
          e.sibling = c;
          c = e;
          e = a;
        }
        wj(b, true, c, null, f2);
        break;
      case "together":
        wj(b, false, null, null, undefined);
        break;
      default:
        b.memoizedState = null;
    }
  return b.child;
}
function ij(a, b) {
  (b.mode & 1) === 0 && a !== null && (a.alternate = null, b.alternate = null, b.flags |= 2);
}
function Zi(a, b, c) {
  a !== null && (b.dependencies = a.dependencies);
  rh |= b.lanes;
  if ((c & b.childLanes) === 0)
    return null;
  if (a !== null && b.child !== a.child)
    throw Error(p3(153));
  if (b.child !== null) {
    a = b.child;
    c = Pg(a, a.pendingProps);
    b.child = c;
    for (c.return = b;a.sibling !== null; )
      a = a.sibling, c = c.sibling = Pg(a, a.pendingProps), c.return = b;
    c.sibling = null;
  }
  return b.child;
}
function yj(a, b, c) {
  switch (b.tag) {
    case 3:
      kj(b);
      Ig();
      break;
    case 5:
      Ah(b);
      break;
    case 1:
      Zf(b.type) && cg(b);
      break;
    case 4:
      yh(b, b.stateNode.containerInfo);
      break;
    case 10:
      var d = b.type._context, e = b.memoizedProps.value;
      G2(Wg, d._currentValue);
      d._currentValue = e;
      break;
    case 13:
      d = b.memoizedState;
      if (d !== null) {
        if (d.dehydrated !== null)
          return G2(L2, L2.current & 1), b.flags |= 128, null;
        if ((c & b.child.childLanes) !== 0)
          return oj(a, b, c);
        G2(L2, L2.current & 1);
        a = Zi(a, b, c);
        return a !== null ? a.sibling : null;
      }
      G2(L2, L2.current & 1);
      break;
    case 19:
      d = (c & b.childLanes) !== 0;
      if ((a.flags & 128) !== 0) {
        if (d)
          return xj(a, b, c);
        b.flags |= 128;
      }
      e = b.memoizedState;
      e !== null && (e.rendering = null, e.tail = null, e.lastEffect = null);
      G2(L2, L2.current);
      if (d)
        break;
      else
        return null;
    case 22:
    case 23:
      return b.lanes = 0, dj(a, b, c);
  }
  return Zi(a, b, c);
}
function Dj(a, b) {
  if (!I2)
    switch (a.tailMode) {
      case "hidden":
        b = a.tail;
        for (var c = null;b !== null; )
          b.alternate !== null && (c = b), b = b.sibling;
        c === null ? a.tail = null : c.sibling = null;
        break;
      case "collapsed":
        c = a.tail;
        for (var d = null;c !== null; )
          c.alternate !== null && (d = c), c = c.sibling;
        d === null ? b || a.tail === null ? a.tail = null : a.tail.sibling = null : d.sibling = null;
    }
}
function S2(a) {
  var b = a.alternate !== null && a.alternate.child === a.child, c = 0, d = 0;
  if (b)
    for (var e = a.child;e !== null; )
      c |= e.lanes | e.childLanes, d |= e.subtreeFlags & 14680064, d |= e.flags & 14680064, e.return = a, e = e.sibling;
  else
    for (e = a.child;e !== null; )
      c |= e.lanes | e.childLanes, d |= e.subtreeFlags, d |= e.flags, e.return = a, e = e.sibling;
  a.subtreeFlags |= d;
  a.childLanes = c;
  return b;
}
function Ej(a, b, c) {
  var d = b.pendingProps;
  wg(b);
  switch (b.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return S2(b), null;
    case 1:
      return Zf(b.type) && $f(), S2(b), null;
    case 3:
      d = b.stateNode;
      zh();
      E2(Wf);
      E2(H2);
      Eh();
      d.pendingContext && (d.context = d.pendingContext, d.pendingContext = null);
      if (a === null || a.child === null)
        Gg(b) ? b.flags |= 4 : a === null || a.memoizedState.isDehydrated && (b.flags & 256) === 0 || (b.flags |= 1024, zg !== null && (Fj(zg), zg = null));
      Aj(a, b);
      S2(b);
      return null;
    case 5:
      Bh(b);
      var e = xh(wh.current);
      c = b.type;
      if (a !== null && b.stateNode != null)
        Bj(a, b, c, d, e), a.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
      else {
        if (!d) {
          if (b.stateNode === null)
            throw Error(p3(166));
          S2(b);
          return null;
        }
        a = xh(uh.current);
        if (Gg(b)) {
          d = b.stateNode;
          c = b.type;
          var f2 = b.memoizedProps;
          d[Of] = b;
          d[Pf] = f2;
          a = (b.mode & 1) !== 0;
          switch (c) {
            case "dialog":
              D2("cancel", d);
              D2("close", d);
              break;
            case "iframe":
            case "object":
            case "embed":
              D2("load", d);
              break;
            case "video":
            case "audio":
              for (e = 0;e < lf.length; e++)
                D2(lf[e], d);
              break;
            case "source":
              D2("error", d);
              break;
            case "img":
            case "image":
            case "link":
              D2("error", d);
              D2("load", d);
              break;
            case "details":
              D2("toggle", d);
              break;
            case "input":
              Za(d, f2);
              D2("invalid", d);
              break;
            case "select":
              d._wrapperState = { wasMultiple: !!f2.multiple };
              D2("invalid", d);
              break;
            case "textarea":
              hb(d, f2), D2("invalid", d);
          }
          ub(c, f2);
          e = null;
          for (var g in f2)
            if (f2.hasOwnProperty(g)) {
              var h = f2[g];
              g === "children" ? typeof h === "string" ? d.textContent !== h && (f2.suppressHydrationWarning !== true && Af(d.textContent, h, a), e = ["children", h]) : typeof h === "number" && d.textContent !== "" + h && (f2.suppressHydrationWarning !== true && Af(d.textContent, h, a), e = ["children", "" + h]) : ea.hasOwnProperty(g) && h != null && g === "onScroll" && D2("scroll", d);
            }
          switch (c) {
            case "input":
              Va(d);
              db(d, f2, true);
              break;
            case "textarea":
              Va(d);
              jb(d);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof f2.onClick === "function" && (d.onclick = Bf);
          }
          d = e;
          b.updateQueue = d;
          d !== null && (b.flags |= 4);
        } else {
          g = e.nodeType === 9 ? e : e.ownerDocument;
          a === "http://www.w3.org/1999/xhtml" && (a = kb(c));
          a === "http://www.w3.org/1999/xhtml" ? c === "script" ? (a = g.createElement("div"), a.innerHTML = "<script></script>", a = a.removeChild(a.firstChild)) : typeof d.is === "string" ? a = g.createElement(c, { is: d.is }) : (a = g.createElement(c), c === "select" && (g = a, d.multiple ? g.multiple = true : d.size && (g.size = d.size))) : a = g.createElementNS(a, c);
          a[Of] = b;
          a[Pf] = d;
          zj(a, b, false, false);
          b.stateNode = a;
          a: {
            g = vb(c, d);
            switch (c) {
              case "dialog":
                D2("cancel", a);
                D2("close", a);
                e = d;
                break;
              case "iframe":
              case "object":
              case "embed":
                D2("load", a);
                e = d;
                break;
              case "video":
              case "audio":
                for (e = 0;e < lf.length; e++)
                  D2(lf[e], a);
                e = d;
                break;
              case "source":
                D2("error", a);
                e = d;
                break;
              case "img":
              case "image":
              case "link":
                D2("error", a);
                D2("load", a);
                e = d;
                break;
              case "details":
                D2("toggle", a);
                e = d;
                break;
              case "input":
                Za(a, d);
                e = Ya(a, d);
                D2("invalid", a);
                break;
              case "option":
                e = d;
                break;
              case "select":
                a._wrapperState = { wasMultiple: !!d.multiple };
                e = A2({}, d, { value: undefined });
                D2("invalid", a);
                break;
              case "textarea":
                hb(a, d);
                e = gb(a, d);
                D2("invalid", a);
                break;
              default:
                e = d;
            }
            ub(c, e);
            h = e;
            for (f2 in h)
              if (h.hasOwnProperty(f2)) {
                var k2 = h[f2];
                f2 === "style" ? sb(a, k2) : f2 === "dangerouslySetInnerHTML" ? (k2 = k2 ? k2.__html : undefined, k2 != null && nb(a, k2)) : f2 === "children" ? typeof k2 === "string" ? (c !== "textarea" || k2 !== "") && ob(a, k2) : typeof k2 === "number" && ob(a, "" + k2) : f2 !== "suppressContentEditableWarning" && f2 !== "suppressHydrationWarning" && f2 !== "autoFocus" && (ea.hasOwnProperty(f2) ? k2 != null && f2 === "onScroll" && D2("scroll", a) : k2 != null && ta(a, f2, k2, g));
              }
            switch (c) {
              case "input":
                Va(a);
                db(a, d, false);
                break;
              case "textarea":
                Va(a);
                jb(a);
                break;
              case "option":
                d.value != null && a.setAttribute("value", "" + Sa(d.value));
                break;
              case "select":
                a.multiple = !!d.multiple;
                f2 = d.value;
                f2 != null ? fb(a, !!d.multiple, f2, false) : d.defaultValue != null && fb(a, !!d.multiple, d.defaultValue, true);
                break;
              default:
                typeof e.onClick === "function" && (a.onclick = Bf);
            }
            switch (c) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                d = !!d.autoFocus;
                break a;
              case "img":
                d = true;
                break a;
              default:
                d = false;
            }
          }
          d && (b.flags |= 4);
        }
        b.ref !== null && (b.flags |= 512, b.flags |= 2097152);
      }
      S2(b);
      return null;
    case 6:
      if (a && b.stateNode != null)
        Cj(a, b, a.memoizedProps, d);
      else {
        if (typeof d !== "string" && b.stateNode === null)
          throw Error(p3(166));
        c = xh(wh.current);
        xh(uh.current);
        if (Gg(b)) {
          d = b.stateNode;
          c = b.memoizedProps;
          d[Of] = b;
          if (f2 = d.nodeValue !== c) {
            if (a = xg, a !== null)
              switch (a.tag) {
                case 3:
                  Af(d.nodeValue, c, (a.mode & 1) !== 0);
                  break;
                case 5:
                  a.memoizedProps.suppressHydrationWarning !== true && Af(d.nodeValue, c, (a.mode & 1) !== 0);
              }
          }
          f2 && (b.flags |= 4);
        } else
          d = (c.nodeType === 9 ? c : c.ownerDocument).createTextNode(d), d[Of] = b, b.stateNode = d;
      }
      S2(b);
      return null;
    case 13:
      E2(L2);
      d = b.memoizedState;
      if (a === null || a.memoizedState !== null && a.memoizedState.dehydrated !== null) {
        if (I2 && yg !== null && (b.mode & 1) !== 0 && (b.flags & 128) === 0)
          Hg(), Ig(), b.flags |= 98560, f2 = false;
        else if (f2 = Gg(b), d !== null && d.dehydrated !== null) {
          if (a === null) {
            if (!f2)
              throw Error(p3(318));
            f2 = b.memoizedState;
            f2 = f2 !== null ? f2.dehydrated : null;
            if (!f2)
              throw Error(p3(317));
            f2[Of] = b;
          } else
            Ig(), (b.flags & 128) === 0 && (b.memoizedState = null), b.flags |= 4;
          S2(b);
          f2 = false;
        } else
          zg !== null && (Fj(zg), zg = null), f2 = true;
        if (!f2)
          return b.flags & 65536 ? b : null;
      }
      if ((b.flags & 128) !== 0)
        return b.lanes = c, b;
      d = d !== null;
      d !== (a !== null && a.memoizedState !== null) && d && (b.child.flags |= 8192, (b.mode & 1) !== 0 && (a === null || (L2.current & 1) !== 0 ? T2 === 0 && (T2 = 3) : tj()));
      b.updateQueue !== null && (b.flags |= 4);
      S2(b);
      return null;
    case 4:
      return zh(), Aj(a, b), a === null && sf(b.stateNode.containerInfo), S2(b), null;
    case 10:
      return ah(b.type._context), S2(b), null;
    case 17:
      return Zf(b.type) && $f(), S2(b), null;
    case 19:
      E2(L2);
      f2 = b.memoizedState;
      if (f2 === null)
        return S2(b), null;
      d = (b.flags & 128) !== 0;
      g = f2.rendering;
      if (g === null)
        if (d)
          Dj(f2, false);
        else {
          if (T2 !== 0 || a !== null && (a.flags & 128) !== 0)
            for (a = b.child;a !== null; ) {
              g = Ch(a);
              if (g !== null) {
                b.flags |= 128;
                Dj(f2, false);
                d = g.updateQueue;
                d !== null && (b.updateQueue = d, b.flags |= 4);
                b.subtreeFlags = 0;
                d = c;
                for (c = b.child;c !== null; )
                  f2 = c, a = d, f2.flags &= 14680066, g = f2.alternate, g === null ? (f2.childLanes = 0, f2.lanes = a, f2.child = null, f2.subtreeFlags = 0, f2.memoizedProps = null, f2.memoizedState = null, f2.updateQueue = null, f2.dependencies = null, f2.stateNode = null) : (f2.childLanes = g.childLanes, f2.lanes = g.lanes, f2.child = g.child, f2.subtreeFlags = 0, f2.deletions = null, f2.memoizedProps = g.memoizedProps, f2.memoizedState = g.memoizedState, f2.updateQueue = g.updateQueue, f2.type = g.type, a = g.dependencies, f2.dependencies = a === null ? null : { lanes: a.lanes, firstContext: a.firstContext }), c = c.sibling;
                G2(L2, L2.current & 1 | 2);
                return b.child;
              }
              a = a.sibling;
            }
          f2.tail !== null && B2() > Gj && (b.flags |= 128, d = true, Dj(f2, false), b.lanes = 4194304);
        }
      else {
        if (!d)
          if (a = Ch(g), a !== null) {
            if (b.flags |= 128, d = true, c = a.updateQueue, c !== null && (b.updateQueue = c, b.flags |= 4), Dj(f2, true), f2.tail === null && f2.tailMode === "hidden" && !g.alternate && !I2)
              return S2(b), null;
          } else
            2 * B2() - f2.renderingStartTime > Gj && c !== 1073741824 && (b.flags |= 128, d = true, Dj(f2, false), b.lanes = 4194304);
        f2.isBackwards ? (g.sibling = b.child, b.child = g) : (c = f2.last, c !== null ? c.sibling = g : b.child = g, f2.last = g);
      }
      if (f2.tail !== null)
        return b = f2.tail, f2.rendering = b, f2.tail = b.sibling, f2.renderingStartTime = B2(), b.sibling = null, c = L2.current, G2(L2, d ? c & 1 | 2 : c & 1), b;
      S2(b);
      return null;
    case 22:
    case 23:
      return Hj(), d = b.memoizedState !== null, a !== null && a.memoizedState !== null !== d && (b.flags |= 8192), d && (b.mode & 1) !== 0 ? (fj & 1073741824) !== 0 && (S2(b), b.subtreeFlags & 6 && (b.flags |= 8192)) : S2(b), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(p3(156, b.tag));
}
function Ij(a, b) {
  wg(b);
  switch (b.tag) {
    case 1:
      return Zf(b.type) && $f(), a = b.flags, a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
    case 3:
      return zh(), E2(Wf), E2(H2), Eh(), a = b.flags, (a & 65536) !== 0 && (a & 128) === 0 ? (b.flags = a & -65537 | 128, b) : null;
    case 5:
      return Bh(b), null;
    case 13:
      E2(L2);
      a = b.memoizedState;
      if (a !== null && a.dehydrated !== null) {
        if (b.alternate === null)
          throw Error(p3(340));
        Ig();
      }
      a = b.flags;
      return a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
    case 19:
      return E2(L2), null;
    case 4:
      return zh(), null;
    case 10:
      return ah(b.type._context), null;
    case 22:
    case 23:
      return Hj(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
function Lj(a, b) {
  var c = a.ref;
  if (c !== null)
    if (typeof c === "function")
      try {
        c(null);
      } catch (d) {
        W2(a, b, d);
      }
    else
      c.current = null;
}
function Mj(a, b, c) {
  try {
    c();
  } catch (d) {
    W2(a, b, d);
  }
}
function Oj(a, b) {
  Cf = dd;
  a = Me();
  if (Ne(a)) {
    if ("selectionStart" in a)
      var c = { start: a.selectionStart, end: a.selectionEnd };
    else
      a: {
        c = (c = a.ownerDocument) && c.defaultView || window;
        var d = c.getSelection && c.getSelection();
        if (d && d.rangeCount !== 0) {
          c = d.anchorNode;
          var { anchorOffset: e, focusNode: f2 } = d;
          d = d.focusOffset;
          try {
            c.nodeType, f2.nodeType;
          } catch (F2) {
            c = null;
            break a;
          }
          var g = 0, h = -1, k2 = -1, l3 = 0, m2 = 0, q3 = a, r2 = null;
          b:
            for (;; ) {
              for (var y2;; ) {
                q3 !== c || e !== 0 && q3.nodeType !== 3 || (h = g + e);
                q3 !== f2 || d !== 0 && q3.nodeType !== 3 || (k2 = g + d);
                q3.nodeType === 3 && (g += q3.nodeValue.length);
                if ((y2 = q3.firstChild) === null)
                  break;
                r2 = q3;
                q3 = y2;
              }
              for (;; ) {
                if (q3 === a)
                  break b;
                r2 === c && ++l3 === e && (h = g);
                r2 === f2 && ++m2 === d && (k2 = g);
                if ((y2 = q3.nextSibling) !== null)
                  break;
                q3 = r2;
                r2 = q3.parentNode;
              }
              q3 = y2;
            }
          c = h === -1 || k2 === -1 ? null : { start: h, end: k2 };
        } else
          c = null;
      }
    c = c || { start: 0, end: 0 };
  } else
    c = null;
  Df = { focusedElem: a, selectionRange: c };
  dd = false;
  for (V2 = b;V2 !== null; )
    if (b = V2, a = b.child, (b.subtreeFlags & 1028) !== 0 && a !== null)
      a.return = b, V2 = a;
    else
      for (;V2 !== null; ) {
        b = V2;
        try {
          var n3 = b.alternate;
          if ((b.flags & 1024) !== 0)
            switch (b.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (n3 !== null) {
                  var { memoizedProps: t2, memoizedState: J2 } = n3, x2 = b.stateNode, w2 = x2.getSnapshotBeforeUpdate(b.elementType === b.type ? t2 : Ci(b.type, t2), J2);
                  x2.__reactInternalSnapshotBeforeUpdate = w2;
                }
                break;
              case 3:
                var u2 = b.stateNode.containerInfo;
                u2.nodeType === 1 ? u2.textContent = "" : u2.nodeType === 9 && u2.documentElement && u2.removeChild(u2.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(p3(163));
            }
        } catch (F2) {
          W2(b, b.return, F2);
        }
        a = b.sibling;
        if (a !== null) {
          a.return = b.return;
          V2 = a;
          break;
        }
        V2 = b.return;
      }
  n3 = Nj;
  Nj = false;
  return n3;
}
function Pj(a, b, c) {
  var d = b.updateQueue;
  d = d !== null ? d.lastEffect : null;
  if (d !== null) {
    var e = d = d.next;
    do {
      if ((e.tag & a) === a) {
        var f2 = e.destroy;
        e.destroy = undefined;
        f2 !== undefined && Mj(b, c, f2);
      }
      e = e.next;
    } while (e !== d);
  }
}
function Qj(a, b) {
  b = b.updateQueue;
  b = b !== null ? b.lastEffect : null;
  if (b !== null) {
    var c = b = b.next;
    do {
      if ((c.tag & a) === a) {
        var d = c.create;
        c.destroy = d();
      }
      c = c.next;
    } while (c !== b);
  }
}
function Rj(a) {
  var b = a.ref;
  if (b !== null) {
    var c = a.stateNode;
    switch (a.tag) {
      case 5:
        a = c;
        break;
      default:
        a = c;
    }
    typeof b === "function" ? b(a) : b.current = a;
  }
}
function Sj(a) {
  var b = a.alternate;
  b !== null && (a.alternate = null, Sj(b));
  a.child = null;
  a.deletions = null;
  a.sibling = null;
  a.tag === 5 && (b = a.stateNode, b !== null && (delete b[Of], delete b[Pf], delete b[of], delete b[Qf], delete b[Rf]));
  a.stateNode = null;
  a.return = null;
  a.dependencies = null;
  a.memoizedProps = null;
  a.memoizedState = null;
  a.pendingProps = null;
  a.stateNode = null;
  a.updateQueue = null;
}
function Tj(a) {
  return a.tag === 5 || a.tag === 3 || a.tag === 4;
}
function Uj(a) {
  a:
    for (;; ) {
      for (;a.sibling === null; ) {
        if (a.return === null || Tj(a.return))
          return null;
        a = a.return;
      }
      a.sibling.return = a.return;
      for (a = a.sibling;a.tag !== 5 && a.tag !== 6 && a.tag !== 18; ) {
        if (a.flags & 2)
          continue a;
        if (a.child === null || a.tag === 4)
          continue a;
        else
          a.child.return = a, a = a.child;
      }
      if (!(a.flags & 2))
        return a.stateNode;
    }
}
function Vj(a, b, c) {
  var d = a.tag;
  if (d === 5 || d === 6)
    a = a.stateNode, b ? c.nodeType === 8 ? c.parentNode.insertBefore(a, b) : c.insertBefore(a, b) : (c.nodeType === 8 ? (b = c.parentNode, b.insertBefore(a, c)) : (b = c, b.appendChild(a)), c = c._reactRootContainer, c !== null && c !== undefined || b.onclick !== null || (b.onclick = Bf));
  else if (d !== 4 && (a = a.child, a !== null))
    for (Vj(a, b, c), a = a.sibling;a !== null; )
      Vj(a, b, c), a = a.sibling;
}
function Wj(a, b, c) {
  var d = a.tag;
  if (d === 5 || d === 6)
    a = a.stateNode, b ? c.insertBefore(a, b) : c.appendChild(a);
  else if (d !== 4 && (a = a.child, a !== null))
    for (Wj(a, b, c), a = a.sibling;a !== null; )
      Wj(a, b, c), a = a.sibling;
}
function Yj(a, b, c) {
  for (c = c.child;c !== null; )
    Zj(a, b, c), c = c.sibling;
}
function Zj(a, b, c) {
  if (lc && typeof lc.onCommitFiberUnmount === "function")
    try {
      lc.onCommitFiberUnmount(kc, c);
    } catch (h) {}
  switch (c.tag) {
    case 5:
      U2 || Lj(c, b);
    case 6:
      var d = X2, e = Xj;
      X2 = null;
      Yj(a, b, c);
      X2 = d;
      Xj = e;
      X2 !== null && (Xj ? (a = X2, c = c.stateNode, a.nodeType === 8 ? a.parentNode.removeChild(c) : a.removeChild(c)) : X2.removeChild(c.stateNode));
      break;
    case 18:
      X2 !== null && (Xj ? (a = X2, c = c.stateNode, a.nodeType === 8 ? Kf(a.parentNode, c) : a.nodeType === 1 && Kf(a, c), bd(a)) : Kf(X2, c.stateNode));
      break;
    case 4:
      d = X2;
      e = Xj;
      X2 = c.stateNode.containerInfo;
      Xj = true;
      Yj(a, b, c);
      X2 = d;
      Xj = e;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!U2 && (d = c.updateQueue, d !== null && (d = d.lastEffect, d !== null))) {
        e = d = d.next;
        do {
          var f2 = e, g = f2.destroy;
          f2 = f2.tag;
          g !== undefined && ((f2 & 2) !== 0 ? Mj(c, b, g) : (f2 & 4) !== 0 && Mj(c, b, g));
          e = e.next;
        } while (e !== d);
      }
      Yj(a, b, c);
      break;
    case 1:
      if (!U2 && (Lj(c, b), d = c.stateNode, typeof d.componentWillUnmount === "function"))
        try {
          d.props = c.memoizedProps, d.state = c.memoizedState, d.componentWillUnmount();
        } catch (h) {
          W2(c, b, h);
        }
      Yj(a, b, c);
      break;
    case 21:
      Yj(a, b, c);
      break;
    case 22:
      c.mode & 1 ? (U2 = (d = U2) || c.memoizedState !== null, Yj(a, b, c), U2 = d) : Yj(a, b, c);
      break;
    default:
      Yj(a, b, c);
  }
}
function ak(a) {
  var b = a.updateQueue;
  if (b !== null) {
    a.updateQueue = null;
    var c = a.stateNode;
    c === null && (c = a.stateNode = new Kj);
    b.forEach(function(b2) {
      var d = bk.bind(null, a, b2);
      c.has(b2) || (c.add(b2), b2.then(d, d));
    });
  }
}
function ck(a, b) {
  var c = b.deletions;
  if (c !== null)
    for (var d = 0;d < c.length; d++) {
      var e = c[d];
      try {
        var f2 = a, g = b, h = g;
        a:
          for (;h !== null; ) {
            switch (h.tag) {
              case 5:
                X2 = h.stateNode;
                Xj = false;
                break a;
              case 3:
                X2 = h.stateNode.containerInfo;
                Xj = true;
                break a;
              case 4:
                X2 = h.stateNode.containerInfo;
                Xj = true;
                break a;
            }
            h = h.return;
          }
        if (X2 === null)
          throw Error(p3(160));
        Zj(f2, g, e);
        X2 = null;
        Xj = false;
        var k2 = e.alternate;
        k2 !== null && (k2.return = null);
        e.return = null;
      } catch (l3) {
        W2(e, b, l3);
      }
    }
  if (b.subtreeFlags & 12854)
    for (b = b.child;b !== null; )
      dk(b, a), b = b.sibling;
}
function dk(a, b) {
  var { alternate: c, flags: d } = a;
  switch (a.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      ck(b, a);
      ek(a);
      if (d & 4) {
        try {
          Pj(3, a, a.return), Qj(3, a);
        } catch (t2) {
          W2(a, a.return, t2);
        }
        try {
          Pj(5, a, a.return);
        } catch (t2) {
          W2(a, a.return, t2);
        }
      }
      break;
    case 1:
      ck(b, a);
      ek(a);
      d & 512 && c !== null && Lj(c, c.return);
      break;
    case 5:
      ck(b, a);
      ek(a);
      d & 512 && c !== null && Lj(c, c.return);
      if (a.flags & 32) {
        var e = a.stateNode;
        try {
          ob(e, "");
        } catch (t2) {
          W2(a, a.return, t2);
        }
      }
      if (d & 4 && (e = a.stateNode, e != null)) {
        var f2 = a.memoizedProps, g = c !== null ? c.memoizedProps : f2, h = a.type, k2 = a.updateQueue;
        a.updateQueue = null;
        if (k2 !== null)
          try {
            h === "input" && f2.type === "radio" && f2.name != null && ab(e, f2);
            vb(h, g);
            var l3 = vb(h, f2);
            for (g = 0;g < k2.length; g += 2) {
              var m2 = k2[g], q3 = k2[g + 1];
              m2 === "style" ? sb(e, q3) : m2 === "dangerouslySetInnerHTML" ? nb(e, q3) : m2 === "children" ? ob(e, q3) : ta(e, m2, q3, l3);
            }
            switch (h) {
              case "input":
                bb(e, f2);
                break;
              case "textarea":
                ib(e, f2);
                break;
              case "select":
                var r2 = e._wrapperState.wasMultiple;
                e._wrapperState.wasMultiple = !!f2.multiple;
                var y2 = f2.value;
                y2 != null ? fb(e, !!f2.multiple, y2, false) : r2 !== !!f2.multiple && (f2.defaultValue != null ? fb(e, !!f2.multiple, f2.defaultValue, true) : fb(e, !!f2.multiple, f2.multiple ? [] : "", false));
            }
            e[Pf] = f2;
          } catch (t2) {
            W2(a, a.return, t2);
          }
      }
      break;
    case 6:
      ck(b, a);
      ek(a);
      if (d & 4) {
        if (a.stateNode === null)
          throw Error(p3(162));
        e = a.stateNode;
        f2 = a.memoizedProps;
        try {
          e.nodeValue = f2;
        } catch (t2) {
          W2(a, a.return, t2);
        }
      }
      break;
    case 3:
      ck(b, a);
      ek(a);
      if (d & 4 && c !== null && c.memoizedState.isDehydrated)
        try {
          bd(b.containerInfo);
        } catch (t2) {
          W2(a, a.return, t2);
        }
      break;
    case 4:
      ck(b, a);
      ek(a);
      break;
    case 13:
      ck(b, a);
      ek(a);
      e = a.child;
      e.flags & 8192 && (f2 = e.memoizedState !== null, e.stateNode.isHidden = f2, !f2 || e.alternate !== null && e.alternate.memoizedState !== null || (fk = B2()));
      d & 4 && ak(a);
      break;
    case 22:
      m2 = c !== null && c.memoizedState !== null;
      a.mode & 1 ? (U2 = (l3 = U2) || m2, ck(b, a), U2 = l3) : ck(b, a);
      ek(a);
      if (d & 8192) {
        l3 = a.memoizedState !== null;
        if ((a.stateNode.isHidden = l3) && !m2 && (a.mode & 1) !== 0)
          for (V2 = a, m2 = a.child;m2 !== null; ) {
            for (q3 = V2 = m2;V2 !== null; ) {
              r2 = V2;
              y2 = r2.child;
              switch (r2.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Pj(4, r2, r2.return);
                  break;
                case 1:
                  Lj(r2, r2.return);
                  var n3 = r2.stateNode;
                  if (typeof n3.componentWillUnmount === "function") {
                    d = r2;
                    c = r2.return;
                    try {
                      b = d, n3.props = b.memoizedProps, n3.state = b.memoizedState, n3.componentWillUnmount();
                    } catch (t2) {
                      W2(d, c, t2);
                    }
                  }
                  break;
                case 5:
                  Lj(r2, r2.return);
                  break;
                case 22:
                  if (r2.memoizedState !== null) {
                    gk(q3);
                    continue;
                  }
              }
              y2 !== null ? (y2.return = r2, V2 = y2) : gk(q3);
            }
            m2 = m2.sibling;
          }
        a:
          for (m2 = null, q3 = a;; ) {
            if (q3.tag === 5) {
              if (m2 === null) {
                m2 = q3;
                try {
                  e = q3.stateNode, l3 ? (f2 = e.style, typeof f2.setProperty === "function" ? f2.setProperty("display", "none", "important") : f2.display = "none") : (h = q3.stateNode, k2 = q3.memoizedProps.style, g = k2 !== undefined && k2 !== null && k2.hasOwnProperty("display") ? k2.display : null, h.style.display = rb("display", g));
                } catch (t2) {
                  W2(a, a.return, t2);
                }
              }
            } else if (q3.tag === 6) {
              if (m2 === null)
                try {
                  q3.stateNode.nodeValue = l3 ? "" : q3.memoizedProps;
                } catch (t2) {
                  W2(a, a.return, t2);
                }
            } else if ((q3.tag !== 22 && q3.tag !== 23 || q3.memoizedState === null || q3 === a) && q3.child !== null) {
              q3.child.return = q3;
              q3 = q3.child;
              continue;
            }
            if (q3 === a)
              break a;
            for (;q3.sibling === null; ) {
              if (q3.return === null || q3.return === a)
                break a;
              m2 === q3 && (m2 = null);
              q3 = q3.return;
            }
            m2 === q3 && (m2 = null);
            q3.sibling.return = q3.return;
            q3 = q3.sibling;
          }
      }
      break;
    case 19:
      ck(b, a);
      ek(a);
      d & 4 && ak(a);
      break;
    case 21:
      break;
    default:
      ck(b, a), ek(a);
  }
}
function ek(a) {
  var b = a.flags;
  if (b & 2) {
    try {
      a: {
        for (var c = a.return;c !== null; ) {
          if (Tj(c)) {
            var d = c;
            break a;
          }
          c = c.return;
        }
        throw Error(p3(160));
      }
      switch (d.tag) {
        case 5:
          var e = d.stateNode;
          d.flags & 32 && (ob(e, ""), d.flags &= -33);
          var f2 = Uj(a);
          Wj(a, f2, e);
          break;
        case 3:
        case 4:
          var g = d.stateNode.containerInfo, h = Uj(a);
          Vj(a, h, g);
          break;
        default:
          throw Error(p3(161));
      }
    } catch (k2) {
      W2(a, a.return, k2);
    }
    a.flags &= -3;
  }
  b & 4096 && (a.flags &= -4097);
}
function hk(a, b, c) {
  V2 = a;
  ik(a, b, c);
}
function ik(a, b, c) {
  for (var d = (a.mode & 1) !== 0;V2 !== null; ) {
    var e = V2, f2 = e.child;
    if (e.tag === 22 && d) {
      var g = e.memoizedState !== null || Jj;
      if (!g) {
        var h = e.alternate, k2 = h !== null && h.memoizedState !== null || U2;
        h = Jj;
        var l3 = U2;
        Jj = g;
        if ((U2 = k2) && !l3)
          for (V2 = e;V2 !== null; )
            g = V2, k2 = g.child, g.tag === 22 && g.memoizedState !== null ? jk(e) : k2 !== null ? (k2.return = g, V2 = k2) : jk(e);
        for (;f2 !== null; )
          V2 = f2, ik(f2, b, c), f2 = f2.sibling;
        V2 = e;
        Jj = h;
        U2 = l3;
      }
      kk(a, b, c);
    } else
      (e.subtreeFlags & 8772) !== 0 && f2 !== null ? (f2.return = e, V2 = f2) : kk(a, b, c);
  }
}
function kk(a) {
  for (;V2 !== null; ) {
    var b = V2;
    if ((b.flags & 8772) !== 0) {
      var c = b.alternate;
      try {
        if ((b.flags & 8772) !== 0)
          switch (b.tag) {
            case 0:
            case 11:
            case 15:
              U2 || Qj(5, b);
              break;
            case 1:
              var d = b.stateNode;
              if (b.flags & 4 && !U2)
                if (c === null)
                  d.componentDidMount();
                else {
                  var e = b.elementType === b.type ? c.memoizedProps : Ci(b.type, c.memoizedProps);
                  d.componentDidUpdate(e, c.memoizedState, d.__reactInternalSnapshotBeforeUpdate);
                }
              var f2 = b.updateQueue;
              f2 !== null && sh(b, f2, d);
              break;
            case 3:
              var g = b.updateQueue;
              if (g !== null) {
                c = null;
                if (b.child !== null)
                  switch (b.child.tag) {
                    case 5:
                      c = b.child.stateNode;
                      break;
                    case 1:
                      c = b.child.stateNode;
                  }
                sh(b, g, c);
              }
              break;
            case 5:
              var h = b.stateNode;
              if (c === null && b.flags & 4) {
                c = h;
                var k2 = b.memoizedProps;
                switch (b.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    k2.autoFocus && c.focus();
                    break;
                  case "img":
                    k2.src && (c.src = k2.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (b.memoizedState === null) {
                var l3 = b.alternate;
                if (l3 !== null) {
                  var m2 = l3.memoizedState;
                  if (m2 !== null) {
                    var q3 = m2.dehydrated;
                    q3 !== null && bd(q3);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(p3(163));
          }
        U2 || b.flags & 512 && Rj(b);
      } catch (r2) {
        W2(b, b.return, r2);
      }
    }
    if (b === a) {
      V2 = null;
      break;
    }
    c = b.sibling;
    if (c !== null) {
      c.return = b.return;
      V2 = c;
      break;
    }
    V2 = b.return;
  }
}
function gk(a) {
  for (;V2 !== null; ) {
    var b = V2;
    if (b === a) {
      V2 = null;
      break;
    }
    var c = b.sibling;
    if (c !== null) {
      c.return = b.return;
      V2 = c;
      break;
    }
    V2 = b.return;
  }
}
function jk(a) {
  for (;V2 !== null; ) {
    var b = V2;
    try {
      switch (b.tag) {
        case 0:
        case 11:
        case 15:
          var c = b.return;
          try {
            Qj(4, b);
          } catch (k2) {
            W2(b, c, k2);
          }
          break;
        case 1:
          var d = b.stateNode;
          if (typeof d.componentDidMount === "function") {
            var e = b.return;
            try {
              d.componentDidMount();
            } catch (k2) {
              W2(b, e, k2);
            }
          }
          var f2 = b.return;
          try {
            Rj(b);
          } catch (k2) {
            W2(b, f2, k2);
          }
          break;
        case 5:
          var g = b.return;
          try {
            Rj(b);
          } catch (k2) {
            W2(b, g, k2);
          }
      }
    } catch (k2) {
      W2(b, b.return, k2);
    }
    if (b === a) {
      V2 = null;
      break;
    }
    var h = b.sibling;
    if (h !== null) {
      h.return = b.return;
      V2 = h;
      break;
    }
    V2 = b.return;
  }
}
function R2() {
  return (K2 & 6) !== 0 ? B2() : Ak !== -1 ? Ak : Ak = B2();
}
function yi(a) {
  if ((a.mode & 1) === 0)
    return 1;
  if ((K2 & 2) !== 0 && Z !== 0)
    return Z & -Z;
  if (Kg.transition !== null)
    return Bk === 0 && (Bk = yc()), Bk;
  a = C2;
  if (a !== 0)
    return a;
  a = window.event;
  a = a === undefined ? 16 : jd(a.type);
  return a;
}
function gi(a, b, c, d) {
  if (50 < yk)
    throw yk = 0, zk = null, Error(p3(185));
  Ac(a, c, d);
  if ((K2 & 2) === 0 || a !== Q2)
    a === Q2 && ((K2 & 2) === 0 && (qk |= c), T2 === 4 && Ck(a, Z)), Dk(a, d), c === 1 && K2 === 0 && (b.mode & 1) === 0 && (Gj = B2() + 500, fg && jg());
}
function Dk(a, b) {
  var c = a.callbackNode;
  wc(a, b);
  var d = uc(a, a === Q2 ? Z : 0);
  if (d === 0)
    c !== null && bc(c), a.callbackNode = null, a.callbackPriority = 0;
  else if (b = d & -d, a.callbackPriority !== b) {
    c != null && bc(c);
    if (b === 1)
      a.tag === 0 ? ig(Ek.bind(null, a)) : hg(Ek.bind(null, a)), Jf(function() {
        (K2 & 6) === 0 && jg();
      }), c = null;
    else {
      switch (Dc(d)) {
        case 1:
          c = fc;
          break;
        case 4:
          c = gc;
          break;
        case 16:
          c = hc;
          break;
        case 536870912:
          c = jc;
          break;
        default:
          c = hc;
      }
      c = Fk(c, Gk.bind(null, a));
    }
    a.callbackPriority = b;
    a.callbackNode = c;
  }
}
function Gk(a, b) {
  Ak = -1;
  Bk = 0;
  if ((K2 & 6) !== 0)
    throw Error(p3(327));
  var c = a.callbackNode;
  if (Hk() && a.callbackNode !== c)
    return null;
  var d = uc(a, a === Q2 ? Z : 0);
  if (d === 0)
    return null;
  if ((d & 30) !== 0 || (d & a.expiredLanes) !== 0 || b)
    b = Ik(a, d);
  else {
    b = d;
    var e = K2;
    K2 |= 2;
    var f2 = Jk();
    if (Q2 !== a || Z !== b)
      uk = null, Gj = B2() + 500, Kk(a, b);
    do
      try {
        Lk();
        break;
      } catch (h) {
        Mk(a, h);
      }
    while (1);
    $g();
    mk.current = f2;
    K2 = e;
    Y !== null ? b = 0 : (Q2 = null, Z = 0, b = T2);
  }
  if (b !== 0) {
    b === 2 && (e = xc(a), e !== 0 && (d = e, b = Nk(a, e)));
    if (b === 1)
      throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B2()), c;
    if (b === 6)
      Ck(a, d);
    else {
      e = a.current.alternate;
      if ((d & 30) === 0 && !Ok(e) && (b = Ik(a, d), b === 2 && (f2 = xc(a), f2 !== 0 && (d = f2, b = Nk(a, f2))), b === 1))
        throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B2()), c;
      a.finishedWork = e;
      a.finishedLanes = d;
      switch (b) {
        case 0:
        case 1:
          throw Error(p3(345));
        case 2:
          Pk(a, tk, uk);
          break;
        case 3:
          Ck(a, d);
          if ((d & 130023424) === d && (b = fk + 500 - B2(), 10 < b)) {
            if (uc(a, 0) !== 0)
              break;
            e = a.suspendedLanes;
            if ((e & d) !== d) {
              R2();
              a.pingedLanes |= a.suspendedLanes & e;
              break;
            }
            a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), b);
            break;
          }
          Pk(a, tk, uk);
          break;
        case 4:
          Ck(a, d);
          if ((d & 4194240) === d)
            break;
          b = a.eventTimes;
          for (e = -1;0 < d; ) {
            var g = 31 - oc(d);
            f2 = 1 << g;
            g = b[g];
            g > e && (e = g);
            d &= ~f2;
          }
          d = e;
          d = B2() - d;
          d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3000 > d ? 3000 : 4320 > d ? 4320 : 1960 * lk(d / 1960)) - d;
          if (10 < d) {
            a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), d);
            break;
          }
          Pk(a, tk, uk);
          break;
        case 5:
          Pk(a, tk, uk);
          break;
        default:
          throw Error(p3(329));
      }
    }
  }
  Dk(a, B2());
  return a.callbackNode === c ? Gk.bind(null, a) : null;
}
function Nk(a, b) {
  var c = sk;
  a.current.memoizedState.isDehydrated && (Kk(a, b).flags |= 256);
  a = Ik(a, b);
  a !== 2 && (b = tk, tk = c, b !== null && Fj(b));
  return a;
}
function Fj(a) {
  tk === null ? tk = a : tk.push.apply(tk, a);
}
function Ok(a) {
  for (var b = a;; ) {
    if (b.flags & 16384) {
      var c = b.updateQueue;
      if (c !== null && (c = c.stores, c !== null))
        for (var d = 0;d < c.length; d++) {
          var e = c[d], f2 = e.getSnapshot;
          e = e.value;
          try {
            if (!He(f2(), e))
              return false;
          } catch (g) {
            return false;
          }
        }
    }
    c = b.child;
    if (b.subtreeFlags & 16384 && c !== null)
      c.return = b, b = c;
    else {
      if (b === a)
        break;
      for (;b.sibling === null; ) {
        if (b.return === null || b.return === a)
          return true;
        b = b.return;
      }
      b.sibling.return = b.return;
      b = b.sibling;
    }
  }
  return true;
}
function Ck(a, b) {
  b &= ~rk;
  b &= ~qk;
  a.suspendedLanes |= b;
  a.pingedLanes &= ~b;
  for (a = a.expirationTimes;0 < b; ) {
    var c = 31 - oc(b), d = 1 << c;
    a[c] = -1;
    b &= ~d;
  }
}
function Ek(a) {
  if ((K2 & 6) !== 0)
    throw Error(p3(327));
  Hk();
  var b = uc(a, 0);
  if ((b & 1) === 0)
    return Dk(a, B2()), null;
  var c = Ik(a, b);
  if (a.tag !== 0 && c === 2) {
    var d = xc(a);
    d !== 0 && (b = d, c = Nk(a, d));
  }
  if (c === 1)
    throw c = pk, Kk(a, 0), Ck(a, b), Dk(a, B2()), c;
  if (c === 6)
    throw Error(p3(345));
  a.finishedWork = a.current.alternate;
  a.finishedLanes = b;
  Pk(a, tk, uk);
  Dk(a, B2());
  return null;
}
function Qk(a, b) {
  var c = K2;
  K2 |= 1;
  try {
    return a(b);
  } finally {
    K2 = c, K2 === 0 && (Gj = B2() + 500, fg && jg());
  }
}
function Rk(a) {
  wk !== null && wk.tag === 0 && (K2 & 6) === 0 && Hk();
  var b = K2;
  K2 |= 1;
  var c = ok.transition, d = C2;
  try {
    if (ok.transition = null, C2 = 1, a)
      return a();
  } finally {
    C2 = d, ok.transition = c, K2 = b, (K2 & 6) === 0 && jg();
  }
}
function Hj() {
  fj = ej.current;
  E2(ej);
}
function Kk(a, b) {
  a.finishedWork = null;
  a.finishedLanes = 0;
  var c = a.timeoutHandle;
  c !== -1 && (a.timeoutHandle = -1, Gf(c));
  if (Y !== null)
    for (c = Y.return;c !== null; ) {
      var d = c;
      wg(d);
      switch (d.tag) {
        case 1:
          d = d.type.childContextTypes;
          d !== null && d !== undefined && $f();
          break;
        case 3:
          zh();
          E2(Wf);
          E2(H2);
          Eh();
          break;
        case 5:
          Bh(d);
          break;
        case 4:
          zh();
          break;
        case 13:
          E2(L2);
          break;
        case 19:
          E2(L2);
          break;
        case 10:
          ah(d.type._context);
          break;
        case 22:
        case 23:
          Hj();
      }
      c = c.return;
    }
  Q2 = a;
  Y = a = Pg(a.current, null);
  Z = fj = b;
  T2 = 0;
  pk = null;
  rk = qk = rh = 0;
  tk = sk = null;
  if (fh !== null) {
    for (b = 0;b < fh.length; b++)
      if (c = fh[b], d = c.interleaved, d !== null) {
        c.interleaved = null;
        var e = d.next, f2 = c.pending;
        if (f2 !== null) {
          var g = f2.next;
          f2.next = e;
          d.next = g;
        }
        c.pending = d;
      }
    fh = null;
  }
  return a;
}
function Mk(a, b) {
  do {
    var c = Y;
    try {
      $g();
      Fh.current = Rh;
      if (Ih) {
        for (var d = M2.memoizedState;d !== null; ) {
          var e = d.queue;
          e !== null && (e.pending = null);
          d = d.next;
        }
        Ih = false;
      }
      Hh = 0;
      O2 = N2 = M2 = null;
      Jh = false;
      Kh = 0;
      nk.current = null;
      if (c === null || c.return === null) {
        T2 = 1;
        pk = b;
        Y = null;
        break;
      }
      a: {
        var f2 = a, g = c.return, h = c, k2 = b;
        b = Z;
        h.flags |= 32768;
        if (k2 !== null && typeof k2 === "object" && typeof k2.then === "function") {
          var l3 = k2, m2 = h, q3 = m2.tag;
          if ((m2.mode & 1) === 0 && (q3 === 0 || q3 === 11 || q3 === 15)) {
            var r2 = m2.alternate;
            r2 ? (m2.updateQueue = r2.updateQueue, m2.memoizedState = r2.memoizedState, m2.lanes = r2.lanes) : (m2.updateQueue = null, m2.memoizedState = null);
          }
          var y2 = Ui(g);
          if (y2 !== null) {
            y2.flags &= -257;
            Vi(y2, g, h, f2, b);
            y2.mode & 1 && Si(f2, l3, b);
            b = y2;
            k2 = l3;
            var n3 = b.updateQueue;
            if (n3 === null) {
              var t2 = new Set;
              t2.add(k2);
              b.updateQueue = t2;
            } else
              n3.add(k2);
            break a;
          } else {
            if ((b & 1) === 0) {
              Si(f2, l3, b);
              tj();
              break a;
            }
            k2 = Error(p3(426));
          }
        } else if (I2 && h.mode & 1) {
          var J2 = Ui(g);
          if (J2 !== null) {
            (J2.flags & 65536) === 0 && (J2.flags |= 256);
            Vi(J2, g, h, f2, b);
            Jg(Ji(k2, h));
            break a;
          }
        }
        f2 = k2 = Ji(k2, h);
        T2 !== 4 && (T2 = 2);
        sk === null ? sk = [f2] : sk.push(f2);
        f2 = g;
        do {
          switch (f2.tag) {
            case 3:
              f2.flags |= 65536;
              b &= -b;
              f2.lanes |= b;
              var x2 = Ni(f2, k2, b);
              ph(f2, x2);
              break a;
            case 1:
              h = k2;
              var { type: w2, stateNode: u2 } = f2;
              if ((f2.flags & 128) === 0 && (typeof w2.getDerivedStateFromError === "function" || u2 !== null && typeof u2.componentDidCatch === "function" && (Ri === null || !Ri.has(u2)))) {
                f2.flags |= 65536;
                b &= -b;
                f2.lanes |= b;
                var F2 = Qi(f2, h, b);
                ph(f2, F2);
                break a;
              }
          }
          f2 = f2.return;
        } while (f2 !== null);
      }
      Sk(c);
    } catch (na) {
      b = na;
      Y === c && c !== null && (Y = c = c.return);
      continue;
    }
    break;
  } while (1);
}
function Jk() {
  var a = mk.current;
  mk.current = Rh;
  return a === null ? Rh : a;
}
function tj() {
  if (T2 === 0 || T2 === 3 || T2 === 2)
    T2 = 4;
  Q2 === null || (rh & 268435455) === 0 && (qk & 268435455) === 0 || Ck(Q2, Z);
}
function Ik(a, b) {
  var c = K2;
  K2 |= 2;
  var d = Jk();
  if (Q2 !== a || Z !== b)
    uk = null, Kk(a, b);
  do
    try {
      Tk();
      break;
    } catch (e) {
      Mk(a, e);
    }
  while (1);
  $g();
  K2 = c;
  mk.current = d;
  if (Y !== null)
    throw Error(p3(261));
  Q2 = null;
  Z = 0;
  return T2;
}
function Tk() {
  for (;Y !== null; )
    Uk(Y);
}
function Lk() {
  for (;Y !== null && !cc(); )
    Uk(Y);
}
function Uk(a) {
  var b = Vk(a.alternate, a, fj);
  a.memoizedProps = a.pendingProps;
  b === null ? Sk(a) : Y = b;
  nk.current = null;
}
function Sk(a) {
  var b = a;
  do {
    var c = b.alternate;
    a = b.return;
    if ((b.flags & 32768) === 0) {
      if (c = Ej(c, b, fj), c !== null) {
        Y = c;
        return;
      }
    } else {
      c = Ij(c, b);
      if (c !== null) {
        c.flags &= 32767;
        Y = c;
        return;
      }
      if (a !== null)
        a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null;
      else {
        T2 = 6;
        Y = null;
        return;
      }
    }
    b = b.sibling;
    if (b !== null) {
      Y = b;
      return;
    }
    Y = b = a;
  } while (b !== null);
  T2 === 0 && (T2 = 5);
}
function Pk(a, b, c) {
  var d = C2, e = ok.transition;
  try {
    ok.transition = null, C2 = 1, Wk(a, b, c, d);
  } finally {
    ok.transition = e, C2 = d;
  }
  return null;
}
function Wk(a, b, c, d) {
  do
    Hk();
  while (wk !== null);
  if ((K2 & 6) !== 0)
    throw Error(p3(327));
  c = a.finishedWork;
  var e = a.finishedLanes;
  if (c === null)
    return null;
  a.finishedWork = null;
  a.finishedLanes = 0;
  if (c === a.current)
    throw Error(p3(177));
  a.callbackNode = null;
  a.callbackPriority = 0;
  var f2 = c.lanes | c.childLanes;
  Bc(a, f2);
  a === Q2 && (Y = Q2 = null, Z = 0);
  (c.subtreeFlags & 2064) === 0 && (c.flags & 2064) === 0 || vk || (vk = true, Fk(hc, function() {
    Hk();
    return null;
  }));
  f2 = (c.flags & 15990) !== 0;
  if ((c.subtreeFlags & 15990) !== 0 || f2) {
    f2 = ok.transition;
    ok.transition = null;
    var g = C2;
    C2 = 1;
    var h = K2;
    K2 |= 4;
    nk.current = null;
    Oj(a, c);
    dk(c, a);
    Oe(Df);
    dd = !!Cf;
    Df = Cf = null;
    a.current = c;
    hk(c, a, e);
    dc();
    K2 = h;
    C2 = g;
    ok.transition = f2;
  } else
    a.current = c;
  vk && (vk = false, wk = a, xk = e);
  f2 = a.pendingLanes;
  f2 === 0 && (Ri = null);
  mc(c.stateNode, d);
  Dk(a, B2());
  if (b !== null)
    for (d = a.onRecoverableError, c = 0;c < b.length; c++)
      e = b[c], d(e.value, { componentStack: e.stack, digest: e.digest });
  if (Oi)
    throw Oi = false, a = Pi, Pi = null, a;
  (xk & 1) !== 0 && a.tag !== 0 && Hk();
  f2 = a.pendingLanes;
  (f2 & 1) !== 0 ? a === zk ? yk++ : (yk = 0, zk = a) : yk = 0;
  jg();
  return null;
}
function Hk() {
  if (wk !== null) {
    var a = Dc(xk), b = ok.transition, c = C2;
    try {
      ok.transition = null;
      C2 = 16 > a ? 16 : a;
      if (wk === null)
        var d = false;
      else {
        a = wk;
        wk = null;
        xk = 0;
        if ((K2 & 6) !== 0)
          throw Error(p3(331));
        var e = K2;
        K2 |= 4;
        for (V2 = a.current;V2 !== null; ) {
          var f2 = V2, g = f2.child;
          if ((V2.flags & 16) !== 0) {
            var h = f2.deletions;
            if (h !== null) {
              for (var k2 = 0;k2 < h.length; k2++) {
                var l3 = h[k2];
                for (V2 = l3;V2 !== null; ) {
                  var m2 = V2;
                  switch (m2.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Pj(8, m2, f2);
                  }
                  var q3 = m2.child;
                  if (q3 !== null)
                    q3.return = m2, V2 = q3;
                  else
                    for (;V2 !== null; ) {
                      m2 = V2;
                      var { sibling: r2, return: y2 } = m2;
                      Sj(m2);
                      if (m2 === l3) {
                        V2 = null;
                        break;
                      }
                      if (r2 !== null) {
                        r2.return = y2;
                        V2 = r2;
                        break;
                      }
                      V2 = y2;
                    }
                }
              }
              var n3 = f2.alternate;
              if (n3 !== null) {
                var t2 = n3.child;
                if (t2 !== null) {
                  n3.child = null;
                  do {
                    var J2 = t2.sibling;
                    t2.sibling = null;
                    t2 = J2;
                  } while (t2 !== null);
                }
              }
              V2 = f2;
            }
          }
          if ((f2.subtreeFlags & 2064) !== 0 && g !== null)
            g.return = f2, V2 = g;
          else
            b:
              for (;V2 !== null; ) {
                f2 = V2;
                if ((f2.flags & 2048) !== 0)
                  switch (f2.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Pj(9, f2, f2.return);
                  }
                var x2 = f2.sibling;
                if (x2 !== null) {
                  x2.return = f2.return;
                  V2 = x2;
                  break b;
                }
                V2 = f2.return;
              }
        }
        var w2 = a.current;
        for (V2 = w2;V2 !== null; ) {
          g = V2;
          var u2 = g.child;
          if ((g.subtreeFlags & 2064) !== 0 && u2 !== null)
            u2.return = g, V2 = u2;
          else
            b:
              for (g = w2;V2 !== null; ) {
                h = V2;
                if ((h.flags & 2048) !== 0)
                  try {
                    switch (h.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Qj(9, h);
                    }
                  } catch (na) {
                    W2(h, h.return, na);
                  }
                if (h === g) {
                  V2 = null;
                  break b;
                }
                var F2 = h.sibling;
                if (F2 !== null) {
                  F2.return = h.return;
                  V2 = F2;
                  break b;
                }
                V2 = h.return;
              }
        }
        K2 = e;
        jg();
        if (lc && typeof lc.onPostCommitFiberRoot === "function")
          try {
            lc.onPostCommitFiberRoot(kc, a);
          } catch (na) {}
        d = true;
      }
      return d;
    } finally {
      C2 = c, ok.transition = b;
    }
  }
  return false;
}
function Xk(a, b, c) {
  b = Ji(c, b);
  b = Ni(a, b, 1);
  a = nh(a, b, 1);
  b = R2();
  a !== null && (Ac(a, 1, b), Dk(a, b));
}
function W2(a, b, c) {
  if (a.tag === 3)
    Xk(a, a, c);
  else
    for (;b !== null; ) {
      if (b.tag === 3) {
        Xk(b, a, c);
        break;
      } else if (b.tag === 1) {
        var d = b.stateNode;
        if (typeof b.type.getDerivedStateFromError === "function" || typeof d.componentDidCatch === "function" && (Ri === null || !Ri.has(d))) {
          a = Ji(c, a);
          a = Qi(b, a, 1);
          b = nh(b, a, 1);
          a = R2();
          b !== null && (Ac(b, 1, a), Dk(b, a));
          break;
        }
      }
      b = b.return;
    }
}
function Ti(a, b, c) {
  var d = a.pingCache;
  d !== null && d.delete(b);
  b = R2();
  a.pingedLanes |= a.suspendedLanes & c;
  Q2 === a && (Z & c) === c && (T2 === 4 || T2 === 3 && (Z & 130023424) === Z && 500 > B2() - fk ? Kk(a, 0) : rk |= c);
  Dk(a, b);
}
function Yk(a, b) {
  b === 0 && ((a.mode & 1) === 0 ? b = 1 : (b = sc, sc <<= 1, (sc & 130023424) === 0 && (sc = 4194304)));
  var c = R2();
  a = ih(a, b);
  a !== null && (Ac(a, b, c), Dk(a, c));
}
function uj(a) {
  var b = a.memoizedState, c = 0;
  b !== null && (c = b.retryLane);
  Yk(a, c);
}
function bk(a, b) {
  var c = 0;
  switch (a.tag) {
    case 13:
      var d = a.stateNode;
      var e = a.memoizedState;
      e !== null && (c = e.retryLane);
      break;
    case 19:
      d = a.stateNode;
      break;
    default:
      throw Error(p3(314));
  }
  d !== null && d.delete(b);
  Yk(a, c);
}
function Fk(a, b) {
  return ac(a, b);
}
function $k(a, b, c, d) {
  this.tag = a;
  this.key = c;
  this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
  this.index = 0;
  this.ref = null;
  this.pendingProps = b;
  this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
  this.mode = d;
  this.subtreeFlags = this.flags = 0;
  this.deletions = null;
  this.childLanes = this.lanes = 0;
  this.alternate = null;
}
function Bg(a, b, c, d) {
  return new $k(a, b, c, d);
}
function aj(a) {
  a = a.prototype;
  return !(!a || !a.isReactComponent);
}
function Zk(a) {
  if (typeof a === "function")
    return aj(a) ? 1 : 0;
  if (a !== undefined && a !== null) {
    a = a.$$typeof;
    if (a === Da)
      return 11;
    if (a === Ga)
      return 14;
  }
  return 2;
}
function Pg(a, b) {
  var c = a.alternate;
  c === null ? (c = Bg(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.type = a.type, c.flags = 0, c.subtreeFlags = 0, c.deletions = null);
  c.flags = a.flags & 14680064;
  c.childLanes = a.childLanes;
  c.lanes = a.lanes;
  c.child = a.child;
  c.memoizedProps = a.memoizedProps;
  c.memoizedState = a.memoizedState;
  c.updateQueue = a.updateQueue;
  b = a.dependencies;
  c.dependencies = b === null ? null : { lanes: b.lanes, firstContext: b.firstContext };
  c.sibling = a.sibling;
  c.index = a.index;
  c.ref = a.ref;
  return c;
}
function Rg(a, b, c, d, e, f2) {
  var g = 2;
  d = a;
  if (typeof a === "function")
    aj(a) && (g = 1);
  else if (typeof a === "string")
    g = 5;
  else
    a:
      switch (a) {
        case ya:
          return Tg(c.children, e, f2, b);
        case za:
          g = 8;
          e |= 8;
          break;
        case Aa:
          return a = Bg(12, c, b, e | 2), a.elementType = Aa, a.lanes = f2, a;
        case Ea:
          return a = Bg(13, c, b, e), a.elementType = Ea, a.lanes = f2, a;
        case Fa:
          return a = Bg(19, c, b, e), a.elementType = Fa, a.lanes = f2, a;
        case Ia:
          return pj(c, e, f2, b);
        default:
          if (typeof a === "object" && a !== null)
            switch (a.$$typeof) {
              case Ba:
                g = 10;
                break a;
              case Ca:
                g = 9;
                break a;
              case Da:
                g = 11;
                break a;
              case Ga:
                g = 14;
                break a;
              case Ha:
                g = 16;
                d = null;
                break a;
            }
          throw Error(p3(130, a == null ? a : typeof a, ""));
      }
  b = Bg(g, c, b, e);
  b.elementType = a;
  b.type = d;
  b.lanes = f2;
  return b;
}
function Tg(a, b, c, d) {
  a = Bg(7, a, d, b);
  a.lanes = c;
  return a;
}
function pj(a, b, c, d) {
  a = Bg(22, a, d, b);
  a.elementType = Ia;
  a.lanes = c;
  a.stateNode = { isHidden: false };
  return a;
}
function Qg(a, b, c) {
  a = Bg(6, a, null, b);
  a.lanes = c;
  return a;
}
function Sg(a, b, c) {
  b = Bg(4, a.children !== null ? a.children : [], a.key, b);
  b.lanes = c;
  b.stateNode = { containerInfo: a.containerInfo, pendingChildren: null, implementation: a.implementation };
  return b;
}
function al(a, b, c, d, e) {
  this.tag = b;
  this.containerInfo = a;
  this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
  this.timeoutHandle = -1;
  this.callbackNode = this.pendingContext = this.context = null;
  this.callbackPriority = 0;
  this.eventTimes = zc(0);
  this.expirationTimes = zc(-1);
  this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
  this.entanglements = zc(0);
  this.identifierPrefix = d;
  this.onRecoverableError = e;
  this.mutableSourceEagerHydrationData = null;
}
function bl(a, b, c, d, e, f2, g, h, k2) {
  a = new al(a, b, c, h, k2);
  b === 1 ? (b = 1, f2 === true && (b |= 8)) : b = 0;
  f2 = Bg(3, null, null, b);
  a.current = f2;
  f2.stateNode = a;
  f2.memoizedState = { element: d, isDehydrated: c, cache: null, transitions: null, pendingSuspenseBoundaries: null };
  kh(f2);
  return a;
}
function cl(a, b, c) {
  var d = 3 < arguments.length && arguments[3] !== undefined ? arguments[3] : null;
  return { $$typeof: wa, key: d == null ? null : "" + d, children: a, containerInfo: b, implementation: c };
}
function dl(a) {
  if (!a)
    return Vf;
  a = a._reactInternals;
  a: {
    if (Vb(a) !== a || a.tag !== 1)
      throw Error(p3(170));
    var b = a;
    do {
      switch (b.tag) {
        case 3:
          b = b.stateNode.context;
          break a;
        case 1:
          if (Zf(b.type)) {
            b = b.stateNode.__reactInternalMemoizedMergedChildContext;
            break a;
          }
      }
      b = b.return;
    } while (b !== null);
    throw Error(p3(171));
  }
  if (a.tag === 1) {
    var c = a.type;
    if (Zf(c))
      return bg(a, c, b);
  }
  return b;
}
function el(a, b, c, d, e, f2, g, h, k2) {
  a = bl(c, d, true, a, e, f2, g, h, k2);
  a.context = dl(null);
  c = a.current;
  d = R2();
  e = yi(c);
  f2 = mh(d, e);
  f2.callback = b !== undefined && b !== null ? b : null;
  nh(c, f2, e);
  a.current.lanes = e;
  Ac(a, e, d);
  Dk(a, d);
  return a;
}
function fl(a, b, c, d) {
  var e = b.current, f2 = R2(), g = yi(e);
  c = dl(c);
  b.context === null ? b.context = c : b.pendingContext = c;
  b = mh(f2, g);
  b.payload = { element: a };
  d = d === undefined ? null : d;
  d !== null && (b.callback = d);
  a = nh(e, b, g);
  a !== null && (gi(a, e, g, f2), oh(a, e, g));
  return g;
}
function gl(a) {
  a = a.current;
  if (!a.child)
    return null;
  switch (a.child.tag) {
    case 5:
      return a.child.stateNode;
    default:
      return a.child.stateNode;
  }
}
function hl(a, b) {
  a = a.memoizedState;
  if (a !== null && a.dehydrated !== null) {
    var c = a.retryLane;
    a.retryLane = c !== 0 && c < b ? c : b;
  }
}
function il(a, b) {
  hl(a, b);
  (a = a.alternate) && hl(a, b);
}
function jl() {
  return null;
}
function ll(a) {
  this._internalRoot = a;
}
function ml(a) {
  this._internalRoot = a;
}
function nl(a) {
  return !(!a || a.nodeType !== 1 && a.nodeType !== 9 && a.nodeType !== 11);
}
function ol(a) {
  return !(!a || a.nodeType !== 1 && a.nodeType !== 9 && a.nodeType !== 11 && (a.nodeType !== 8 || a.nodeValue !== " react-mount-point-unstable "));
}
function pl() {}
function ql(a, b, c, d, e) {
  if (e) {
    if (typeof d === "function") {
      var f2 = d;
      d = function() {
        var a2 = gl(g);
        f2.call(a2);
      };
    }
    var g = el(b, d, a, 0, null, false, false, "", pl);
    a._reactRootContainer = g;
    a[uf] = g.current;
    sf(a.nodeType === 8 ? a.parentNode : a);
    Rk();
    return g;
  }
  for (;e = a.lastChild; )
    a.removeChild(e);
  if (typeof d === "function") {
    var h = d;
    d = function() {
      var a2 = gl(k2);
      h.call(a2);
    };
  }
  var k2 = bl(a, 0, false, null, null, false, false, "", pl);
  a._reactRootContainer = k2;
  a[uf] = k2.current;
  sf(a.nodeType === 8 ? a.parentNode : a);
  Rk(function() {
    fl(b, k2, c, d);
  });
  return k2;
}
function rl(a, b, c, d, e) {
  var f2 = c._reactRootContainer;
  if (f2) {
    var g = f2;
    if (typeof e === "function") {
      var h = e;
      e = function() {
        var a2 = gl(g);
        h.call(a2);
      };
    }
    fl(b, g, a, e);
  } else
    g = ql(c, b, a, e, d);
  return gl(g);
}
var aa, ca, da, ea, ia, ja, ka, la, ma, z2, ra, ua, va, wa, ya, za, Aa, Ba, Ca, Da, Ea, Fa, Ga, Ha, Ia, Ja, A2, La, Na = false, eb, mb, nb, pb, qb, tb, wb = null, yb = null, zb = null, Ab = null, Ib = false, Lb = false, Mb, Ob = false, Pb = null, Qb = false, Rb = null, Sb, ac, bc, cc, dc, B2, ec, fc, gc, hc, ic, jc, kc = null, lc = null, oc, pc, qc, rc = 64, sc = 4194304, C2 = 0, Ec, Fc, Gc, Hc, Ic, Jc = false, Kc, Lc = null, Mc = null, Nc = null, Oc, Pc, Qc, Rc, cd, dd = true, id = null, kd = null, ld = null, md = null, sd, td, ud, vd, wd, xd, yd, Ad, Bd, Cd, Dd, Ed, Fd, Gd, Hd, Id, Jd, Kd, Ld, Md, Nd, Od, Qd, Rd, Sd, Td, Ud, Vd, Wd, Xd, Yd, Zd, $d, ae, be = null, ce, de, ee, fe = false, ie = false, le, pe = null, qe = null, we = false, xe, ye, ze, He, Pe, Qe = null, Re = null, Se = null, Te = false, We, Xe, Ye, $e, af, bf, cf, df, ef, hf, jf, kf, gf, lf, mf, rf, xf, yf, Cf = null, Df = null, Ff, Gf, Hf, Jf, Nf, Of, Pf, uf, of, Qf, Rf, Sf, Tf = -1, Vf, H2, Wf, Xf, eg = null, fg = false, gg = false, kg, lg = 0, mg = null, ng = 0, og, pg = 0, qg = null, rg = 1, sg = "", xg = null, yg = null, I2 = false, zg = null, Kg, Ug, Vg, Wg, Xg = null, Yg = null, Zg = null, fh = null, jh = false, th, uh, vh, wh, L2, Dh, Fh, Gh, Hh = 0, M2 = null, N2 = null, O2 = null, Ih = false, Jh = false, Kh = 0, Lh = 0, Rh, Oh, Ph, Qh, Ei, Mi, Wi, dh = false, mj, zj, Aj, Bj, Cj, Jj = false, U2 = false, Kj, V2 = null, Nj = false, X2 = null, Xj = false, lk, mk, nk, ok, K2 = 0, Q2 = null, Y = null, Z = 0, fj = 0, ej, T2 = 0, pk = null, rh = 0, qk = 0, rk = 0, sk = null, tk = null, fk = 0, Gj = Infinity, uk = null, Oi = false, Pi = null, Ri = null, vk = false, wk = null, xk = 0, yk = 0, zk = null, Ak = -1, Bk = 0, Vk, kl, sl, tl, ul, vl, $__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED2, $createPortal = function(a, b) {
  var c = 2 < arguments.length && arguments[2] !== undefined ? arguments[2] : null;
  if (!nl(b))
    throw Error(p3(200));
  return cl(a, b, null, c);
}, $createRoot = function(a, b) {
  if (!nl(a))
    throw Error(p3(299));
  var c = false, d = "", e = kl;
  b !== null && b !== undefined && (b.unstable_strictMode === true && (c = true), b.identifierPrefix !== undefined && (d = b.identifierPrefix), b.onRecoverableError !== undefined && (e = b.onRecoverableError));
  b = bl(a, 1, false, null, null, c, false, d, e);
  a[uf] = b.current;
  sf(a.nodeType === 8 ? a.parentNode : a);
  return new ll(b);
}, $findDOMNode = function(a) {
  if (a == null)
    return null;
  if (a.nodeType === 1)
    return a;
  var b = a._reactInternals;
  if (b === undefined) {
    if (typeof a.render === "function")
      throw Error(p3(188));
    a = Object.keys(a).join(",");
    throw Error(p3(268, a));
  }
  a = Zb(b);
  a = a === null ? null : a.stateNode;
  return a;
}, $flushSync = function(a) {
  return Rk(a);
}, $hydrate = function(a, b, c) {
  if (!ol(b))
    throw Error(p3(200));
  return rl(null, a, b, true, c);
}, $hydrateRoot = function(a, b, c) {
  if (!nl(a))
    throw Error(p3(405));
  var d = c != null && c.hydratedSources || null, e = false, f2 = "", g = kl;
  c !== null && c !== undefined && (c.unstable_strictMode === true && (e = true), c.identifierPrefix !== undefined && (f2 = c.identifierPrefix), c.onRecoverableError !== undefined && (g = c.onRecoverableError));
  b = el(b, null, a, 1, c != null ? c : null, e, false, f2, g);
  a[uf] = b.current;
  sf(a);
  if (d)
    for (a = 0;a < d.length; a++)
      c = d[a], e = c._getVersion, e = e(c._source), b.mutableSourceEagerHydrationData == null ? b.mutableSourceEagerHydrationData = [c, e] : b.mutableSourceEagerHydrationData.push(c, e);
  return new ml(b);
}, $render = function(a, b, c) {
  if (!ol(b))
    throw Error(p3(200));
  return rl(null, a, b, false, c);
}, $unmountComponentAtNode = function(a) {
  if (!ol(a))
    throw Error(p3(40));
  return a._reactRootContainer ? (Rk(function() {
    rl(null, null, a, false, function() {
      a._reactRootContainer = null;
      a[uf] = null;
    });
  }), true) : false;
}, $unstable_batchedUpdates, $unstable_renderSubtreeIntoContainer = function(a, b, c, d) {
  if (!ol(c))
    throw Error(p3(200));
  if (a == null || a._reactInternals === undefined)
    throw Error(p3(38));
  return rl(a, b, c, false, d);
}, $version2 = "18.3.1-next-f1338f8080-20240426";
var init_react_dom_production_min = __esm(() => {
  aa = __toESM(require_react(), 1);
  ca = __toESM(require_scheduler(), 1);
  da = new Set;
  ea = {};
  ia = !(typeof window === "undefined" || typeof window.document === "undefined" || typeof window.document.createElement === "undefined");
  ja = Object.prototype.hasOwnProperty;
  ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/;
  la = {};
  ma = {};
  z2 = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
    z2[a] = new v2(a, 0, false, a, null, false, false);
  });
  [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
    var b = a[0];
    z2[b] = new v2(b, 1, false, a[1], null, false, false);
  });
  ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
    z2[a] = new v2(a, 2, false, a.toLowerCase(), null, false, false);
  });
  ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
    z2[a] = new v2(a, 2, false, a, null, false, false);
  });
  "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
    z2[a] = new v2(a, 3, false, a.toLowerCase(), null, false, false);
  });
  ["checked", "multiple", "muted", "selected"].forEach(function(a) {
    z2[a] = new v2(a, 3, true, a, null, false, false);
  });
  ["capture", "download"].forEach(function(a) {
    z2[a] = new v2(a, 4, false, a, null, false, false);
  });
  ["cols", "rows", "size", "span"].forEach(function(a) {
    z2[a] = new v2(a, 6, false, a, null, false, false);
  });
  ["rowSpan", "start"].forEach(function(a) {
    z2[a] = new v2(a, 5, false, a.toLowerCase(), null, false, false);
  });
  ra = /[\-:]([a-z])/g;
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
    var b = a.replace(ra, sa);
    z2[b] = new v2(b, 1, false, a, null, false, false);
  });
  "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
    var b = a.replace(ra, sa);
    z2[b] = new v2(b, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
  });
  ["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
    var b = a.replace(ra, sa);
    z2[b] = new v2(b, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
  });
  ["tabIndex", "crossOrigin"].forEach(function(a) {
    z2[a] = new v2(a, 1, false, a.toLowerCase(), null, false, false);
  });
  z2.xlinkHref = new v2("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
  ["src", "href", "action", "formAction"].forEach(function(a) {
    z2[a] = new v2(a, 1, false, a.toLowerCase(), null, true, true);
  });
  ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  va = Symbol.for("react.element");
  wa = Symbol.for("react.portal");
  ya = Symbol.for("react.fragment");
  za = Symbol.for("react.strict_mode");
  Aa = Symbol.for("react.profiler");
  Ba = Symbol.for("react.provider");
  Ca = Symbol.for("react.context");
  Da = Symbol.for("react.forward_ref");
  Ea = Symbol.for("react.suspense");
  Fa = Symbol.for("react.suspense_list");
  Ga = Symbol.for("react.memo");
  Ha = Symbol.for("react.lazy");
  Symbol.for("react.scope");
  Symbol.for("react.debug_trace_mode");
  Ia = Symbol.for("react.offscreen");
  Symbol.for("react.legacy_hidden");
  Symbol.for("react.cache");
  Symbol.for("react.tracing_marker");
  Ja = Symbol.iterator;
  A2 = Object.assign;
  eb = Array.isArray;
  nb = function(a) {
    return typeof MSApp !== "undefined" && MSApp.execUnsafeLocalFunction ? function(b, c, d, e) {
      MSApp.execUnsafeLocalFunction(function() {
        return a(b, c, d, e);
      });
    } : a;
  }(function(a, b) {
    if (a.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in a)
      a.innerHTML = b;
    else {
      mb = mb || document.createElement("div");
      mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";
      for (b = mb.firstChild;a.firstChild; )
        a.removeChild(a.firstChild);
      for (;b.firstChild; )
        a.appendChild(b.firstChild);
    }
  });
  pb = {
    animationIterationCount: true,
    aspectRatio: true,
    borderImageOutset: true,
    borderImageSlice: true,
    borderImageWidth: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    columns: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridArea: true,
    gridRow: true,
    gridRowEnd: true,
    gridRowSpan: true,
    gridRowStart: true,
    gridColumn: true,
    gridColumnEnd: true,
    gridColumnSpan: true,
    gridColumnStart: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,
    fillOpacity: true,
    floodOpacity: true,
    stopOpacity: true,
    strokeDasharray: true,
    strokeDashoffset: true,
    strokeMiterlimit: true,
    strokeOpacity: true,
    strokeWidth: true
  };
  qb = ["Webkit", "ms", "Moz", "O"];
  Object.keys(pb).forEach(function(a) {
    qb.forEach(function(b) {
      b = b + a.charAt(0).toUpperCase() + a.substring(1);
      pb[b] = pb[a];
    });
  });
  tb = A2({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
  if (ia)
    try {
      Mb = {};
      Object.defineProperty(Mb, "passive", { get: function() {
        Lb = true;
      } });
      window.addEventListener("test", Mb, Mb);
      window.removeEventListener("test", Mb, Mb);
    } catch (a) {
      Lb = false;
    }
  Sb = { onError: function(a) {
    Ob = true;
    Pb = a;
  } };
  ac = ca.unstable_scheduleCallback;
  bc = ca.unstable_cancelCallback;
  cc = ca.unstable_shouldYield;
  dc = ca.unstable_requestPaint;
  B2 = ca.unstable_now;
  ec = ca.unstable_getCurrentPriorityLevel;
  fc = ca.unstable_ImmediatePriority;
  gc = ca.unstable_UserBlockingPriority;
  hc = ca.unstable_NormalPriority;
  ic = ca.unstable_LowPriority;
  jc = ca.unstable_IdlePriority;
  oc = Math.clz32 ? Math.clz32 : nc;
  pc = Math.log;
  qc = Math.LN2;
  Kc = [];
  Oc = new Map;
  Pc = new Map;
  Qc = [];
  Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  cd = ua.ReactCurrentBatchConfig;
  sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a) {
    return a.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 };
  td = rd(sd);
  ud = A2({}, sd, { view: 0, detail: 0 });
  vd = rd(ud);
  Ad = A2({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a) {
    return a.relatedTarget === undefined ? a.fromElement === a.srcElement ? a.toElement : a.fromElement : a.relatedTarget;
  }, movementX: function(a) {
    if ("movementX" in a)
      return a.movementX;
    a !== yd && (yd && a.type === "mousemove" ? (wd = a.screenX - yd.screenX, xd = a.screenY - yd.screenY) : xd = wd = 0, yd = a);
    return wd;
  }, movementY: function(a) {
    return "movementY" in a ? a.movementY : xd;
  } });
  Bd = rd(Ad);
  Cd = A2({}, Ad, { dataTransfer: 0 });
  Dd = rd(Cd);
  Ed = A2({}, ud, { relatedTarget: 0 });
  Fd = rd(Ed);
  Gd = A2({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 });
  Hd = rd(Gd);
  Id = A2({}, sd, { clipboardData: function(a) {
    return "clipboardData" in a ? a.clipboardData : window.clipboardData;
  } });
  Jd = rd(Id);
  Kd = A2({}, sd, { data: 0 });
  Ld = rd(Kd);
  Md = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  };
  Nd = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  };
  Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  Qd = A2({}, ud, { key: function(a) {
    if (a.key) {
      var b = Md[a.key] || a.key;
      if (b !== "Unidentified")
        return b;
    }
    return a.type === "keypress" ? (a = od(a), a === 13 ? "Enter" : String.fromCharCode(a)) : a.type === "keydown" || a.type === "keyup" ? Nd[a.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a) {
    return a.type === "keypress" ? od(a) : 0;
  }, keyCode: function(a) {
    return a.type === "keydown" || a.type === "keyup" ? a.keyCode : 0;
  }, which: function(a) {
    return a.type === "keypress" ? od(a) : a.type === "keydown" || a.type === "keyup" ? a.keyCode : 0;
  } });
  Rd = rd(Qd);
  Sd = A2({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 });
  Td = rd(Sd);
  Ud = A2({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd });
  Vd = rd(Ud);
  Wd = A2({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 });
  Xd = rd(Wd);
  Yd = A2({}, Ad, {
    deltaX: function(a) {
      return "deltaX" in a ? a.deltaX : ("wheelDeltaX" in a) ? -a.wheelDeltaX : 0;
    },
    deltaY: function(a) {
      return "deltaY" in a ? a.deltaY : ("wheelDeltaY" in a) ? -a.wheelDeltaY : ("wheelDelta" in a) ? -a.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  });
  Zd = rd(Yd);
  $d = [9, 13, 27, 32];
  ae = ia && "CompositionEvent" in window;
  ia && "documentMode" in document && (be = document.documentMode);
  ce = ia && "TextEvent" in window && !be;
  de = ia && (!ae || be && 8 < be && 11 >= be);
  ee = String.fromCharCode(32);
  le = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
  if (ia) {
    if (ia) {
      ye = "oninput" in document;
      if (!ye) {
        ze = document.createElement("div");
        ze.setAttribute("oninput", "return;");
        ye = typeof ze.oninput === "function";
      }
      xe = ye;
    } else
      xe = false;
    we = xe && (!document.documentMode || 9 < document.documentMode);
  }
  He = typeof Object.is === "function" ? Object.is : Ge;
  Pe = ia && "documentMode" in document && 11 >= document.documentMode;
  We = { animationend: Ve("Animation", "AnimationEnd"), animationiteration: Ve("Animation", "AnimationIteration"), animationstart: Ve("Animation", "AnimationStart"), transitionend: Ve("Transition", "TransitionEnd") };
  Xe = {};
  Ye = {};
  ia && (Ye = document.createElement("div").style, ("AnimationEvent" in window) || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), ("TransitionEvent" in window) || delete We.transitionend.transition);
  $e = Ze("animationend");
  af = Ze("animationiteration");
  bf = Ze("animationstart");
  cf = Ze("transitionend");
  df = new Map;
  ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  for (gf = 0;gf < ef.length; gf++) {
    hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
    ff(jf, "on" + kf);
  }
  ff($e, "onAnimationEnd");
  ff(af, "onAnimationIteration");
  ff(bf, "onAnimationStart");
  ff("dblclick", "onDoubleClick");
  ff("focusin", "onFocus");
  ff("focusout", "onBlur");
  ff(cf, "onTransitionEnd");
  ha("onMouseEnter", ["mouseout", "mouseover"]);
  ha("onMouseLeave", ["mouseout", "mouseover"]);
  ha("onPointerEnter", ["pointerout", "pointerover"]);
  ha("onPointerLeave", ["pointerout", "pointerover"]);
  fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
  fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
  fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
  fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
  fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
  fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
  mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
  rf = "_reactListening" + Math.random().toString(36).slice(2);
  xf = /\r\n?/g;
  yf = /\u0000|\uFFFD/g;
  Ff = typeof setTimeout === "function" ? setTimeout : undefined;
  Gf = typeof clearTimeout === "function" ? clearTimeout : undefined;
  Hf = typeof Promise === "function" ? Promise : undefined;
  Jf = typeof queueMicrotask === "function" ? queueMicrotask : typeof Hf !== "undefined" ? function(a) {
    return Hf.resolve(null).then(a).catch(If);
  } : Ff;
  Nf = Math.random().toString(36).slice(2);
  Of = "__reactFiber$" + Nf;
  Pf = "__reactProps$" + Nf;
  uf = "__reactContainer$" + Nf;
  of = "__reactEvents$" + Nf;
  Qf = "__reactListeners$" + Nf;
  Rf = "__reactHandles$" + Nf;
  Sf = [];
  Vf = {};
  H2 = Uf(Vf);
  Wf = Uf(false);
  Xf = Vf;
  kg = [];
  og = [];
  Kg = ua.ReactCurrentBatchConfig;
  Ug = Og(true);
  Vg = Og(false);
  Wg = Uf(null);
  th = {};
  uh = Uf(th);
  vh = Uf(th);
  wh = Uf(th);
  L2 = Uf(0);
  Dh = [];
  Fh = ua.ReactCurrentDispatcher;
  Gh = ua.ReactCurrentBatchConfig;
  Rh = { readContext: eh, useCallback: P2, useContext: P2, useEffect: P2, useImperativeHandle: P2, useInsertionEffect: P2, useLayoutEffect: P2, useMemo: P2, useReducer: P2, useRef: P2, useState: P2, useDebugValue: P2, useDeferredValue: P2, useTransition: P2, useMutableSource: P2, useSyncExternalStore: P2, useId: P2, unstable_isNewReconciler: false };
  Oh = { readContext: eh, useCallback: function(a, b) {
    Th().memoizedState = [a, b === undefined ? null : b];
    return a;
  }, useContext: eh, useEffect: mi, useImperativeHandle: function(a, b, c) {
    c = c !== null && c !== undefined ? c.concat([a]) : null;
    return ki(4194308, 4, pi.bind(null, b, a), c);
  }, useLayoutEffect: function(a, b) {
    return ki(4194308, 4, a, b);
  }, useInsertionEffect: function(a, b) {
    return ki(4, 2, a, b);
  }, useMemo: function(a, b) {
    var c = Th();
    b = b === undefined ? null : b;
    a = a();
    c.memoizedState = [a, b];
    return a;
  }, useReducer: function(a, b, c) {
    var d = Th();
    b = c !== undefined ? c(b) : b;
    d.memoizedState = d.baseState = b;
    a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a, lastRenderedState: b };
    d.queue = a;
    a = a.dispatch = xi.bind(null, M2, a);
    return [d.memoizedState, a];
  }, useRef: function(a) {
    var b = Th();
    a = { current: a };
    return b.memoizedState = a;
  }, useState: hi, useDebugValue: ri, useDeferredValue: function(a) {
    return Th().memoizedState = a;
  }, useTransition: function() {
    var a = hi(false), b = a[0];
    a = vi.bind(null, a[1]);
    Th().memoizedState = a;
    return [b, a];
  }, useMutableSource: function() {}, useSyncExternalStore: function(a, b, c) {
    var d = M2, e = Th();
    if (I2) {
      if (c === undefined)
        throw Error(p3(407));
      c = c();
    } else {
      c = b();
      if (Q2 === null)
        throw Error(p3(349));
      (Hh & 30) !== 0 || di(d, b, c);
    }
    e.memoizedState = c;
    var f2 = { value: c, getSnapshot: b };
    e.queue = f2;
    mi(ai.bind(null, d, f2, a), [a]);
    d.flags |= 2048;
    bi(9, ci.bind(null, d, f2, c, b), undefined, null);
    return c;
  }, useId: function() {
    var a = Th(), b = Q2.identifierPrefix;
    if (I2) {
      var c = sg;
      var d = rg;
      c = (d & ~(1 << 32 - oc(d) - 1)).toString(32) + c;
      b = ":" + b + "R" + c;
      c = Kh++;
      0 < c && (b += "H" + c.toString(32));
      b += ":";
    } else
      c = Lh++, b = ":" + b + "r" + c.toString(32) + ":";
    return a.memoizedState = b;
  }, unstable_isNewReconciler: false };
  Ph = {
    readContext: eh,
    useCallback: si,
    useContext: eh,
    useEffect: $h,
    useImperativeHandle: qi,
    useInsertionEffect: ni,
    useLayoutEffect: oi,
    useMemo: ti,
    useReducer: Wh,
    useRef: ji,
    useState: function() {
      return Wh(Vh);
    },
    useDebugValue: ri,
    useDeferredValue: function(a) {
      var b = Uh();
      return ui(b, N2.memoizedState, a);
    },
    useTransition: function() {
      var a = Wh(Vh)[0], b = Uh().memoizedState;
      return [a, b];
    },
    useMutableSource: Yh,
    useSyncExternalStore: Zh,
    useId: wi,
    unstable_isNewReconciler: false
  };
  Qh = { readContext: eh, useCallback: si, useContext: eh, useEffect: $h, useImperativeHandle: qi, useInsertionEffect: ni, useLayoutEffect: oi, useMemo: ti, useReducer: Xh, useRef: ji, useState: function() {
    return Xh(Vh);
  }, useDebugValue: ri, useDeferredValue: function(a) {
    var b = Uh();
    return N2 === null ? b.memoizedState = a : ui(b, N2.memoizedState, a);
  }, useTransition: function() {
    var a = Xh(Vh)[0], b = Uh().memoizedState;
    return [a, b];
  }, useMutableSource: Yh, useSyncExternalStore: Zh, useId: wi, unstable_isNewReconciler: false };
  Ei = { isMounted: function(a) {
    return (a = a._reactInternals) ? Vb(a) === a : false;
  }, enqueueSetState: function(a, b, c) {
    a = a._reactInternals;
    var d = R2(), e = yi(a), f2 = mh(d, e);
    f2.payload = b;
    c !== undefined && c !== null && (f2.callback = c);
    b = nh(a, f2, e);
    b !== null && (gi(b, a, e, d), oh(b, a, e));
  }, enqueueReplaceState: function(a, b, c) {
    a = a._reactInternals;
    var d = R2(), e = yi(a), f2 = mh(d, e);
    f2.tag = 1;
    f2.payload = b;
    c !== undefined && c !== null && (f2.callback = c);
    b = nh(a, f2, e);
    b !== null && (gi(b, a, e, d), oh(b, a, e));
  }, enqueueForceUpdate: function(a, b) {
    a = a._reactInternals;
    var c = R2(), d = yi(a), e = mh(c, d);
    e.tag = 2;
    b !== undefined && b !== null && (e.callback = b);
    b = nh(a, e, d);
    b !== null && (gi(b, a, d, c), oh(b, a, d));
  } };
  Mi = typeof WeakMap === "function" ? WeakMap : Map;
  Wi = ua.ReactCurrentOwner;
  mj = { dehydrated: null, treeContext: null, retryLane: 0 };
  zj = function(a, b) {
    for (var c = b.child;c !== null; ) {
      if (c.tag === 5 || c.tag === 6)
        a.appendChild(c.stateNode);
      else if (c.tag !== 4 && c.child !== null) {
        c.child.return = c;
        c = c.child;
        continue;
      }
      if (c === b)
        break;
      for (;c.sibling === null; ) {
        if (c.return === null || c.return === b)
          return;
        c = c.return;
      }
      c.sibling.return = c.return;
      c = c.sibling;
    }
  };
  Aj = function() {};
  Bj = function(a, b, c, d) {
    var e = a.memoizedProps;
    if (e !== d) {
      a = b.stateNode;
      xh(uh.current);
      var f2 = null;
      switch (c) {
        case "input":
          e = Ya(a, e);
          d = Ya(a, d);
          f2 = [];
          break;
        case "select":
          e = A2({}, e, { value: undefined });
          d = A2({}, d, { value: undefined });
          f2 = [];
          break;
        case "textarea":
          e = gb(a, e);
          d = gb(a, d);
          f2 = [];
          break;
        default:
          typeof e.onClick !== "function" && typeof d.onClick === "function" && (a.onclick = Bf);
      }
      ub(c, d);
      var g;
      c = null;
      for (l3 in e)
        if (!d.hasOwnProperty(l3) && e.hasOwnProperty(l3) && e[l3] != null)
          if (l3 === "style") {
            var h = e[l3];
            for (g in h)
              h.hasOwnProperty(g) && (c || (c = {}), c[g] = "");
          } else
            l3 !== "dangerouslySetInnerHTML" && l3 !== "children" && l3 !== "suppressContentEditableWarning" && l3 !== "suppressHydrationWarning" && l3 !== "autoFocus" && (ea.hasOwnProperty(l3) ? f2 || (f2 = []) : (f2 = f2 || []).push(l3, null));
      for (l3 in d) {
        var k2 = d[l3];
        h = e != null ? e[l3] : undefined;
        if (d.hasOwnProperty(l3) && k2 !== h && (k2 != null || h != null))
          if (l3 === "style")
            if (h) {
              for (g in h)
                !h.hasOwnProperty(g) || k2 && k2.hasOwnProperty(g) || (c || (c = {}), c[g] = "");
              for (g in k2)
                k2.hasOwnProperty(g) && h[g] !== k2[g] && (c || (c = {}), c[g] = k2[g]);
            } else
              c || (f2 || (f2 = []), f2.push(l3, c)), c = k2;
          else
            l3 === "dangerouslySetInnerHTML" ? (k2 = k2 ? k2.__html : undefined, h = h ? h.__html : undefined, k2 != null && h !== k2 && (f2 = f2 || []).push(l3, k2)) : l3 === "children" ? typeof k2 !== "string" && typeof k2 !== "number" || (f2 = f2 || []).push(l3, "" + k2) : l3 !== "suppressContentEditableWarning" && l3 !== "suppressHydrationWarning" && (ea.hasOwnProperty(l3) ? (k2 != null && l3 === "onScroll" && D2("scroll", a), f2 || h === k2 || (f2 = [])) : (f2 = f2 || []).push(l3, k2));
      }
      c && (f2 = f2 || []).push("style", c);
      var l3 = f2;
      if (b.updateQueue = l3)
        b.flags |= 4;
    }
  };
  Cj = function(a, b, c, d) {
    c !== d && (b.flags |= 4);
  };
  Kj = typeof WeakSet === "function" ? WeakSet : Set;
  lk = Math.ceil;
  mk = ua.ReactCurrentDispatcher;
  nk = ua.ReactCurrentOwner;
  ok = ua.ReactCurrentBatchConfig;
  ej = Uf(0);
  Vk = function(a, b, c) {
    if (a !== null)
      if (a.memoizedProps !== b.pendingProps || Wf.current)
        dh = true;
      else {
        if ((a.lanes & c) === 0 && (b.flags & 128) === 0)
          return dh = false, yj(a, b, c);
        dh = (a.flags & 131072) !== 0 ? true : false;
      }
    else
      dh = false, I2 && (b.flags & 1048576) !== 0 && ug(b, ng, b.index);
    b.lanes = 0;
    switch (b.tag) {
      case 2:
        var d = b.type;
        ij(a, b);
        a = b.pendingProps;
        var e = Yf(b, H2.current);
        ch(b, c);
        e = Nh(null, b, d, a, e, c);
        var f2 = Sh();
        b.flags |= 1;
        typeof e === "object" && e !== null && typeof e.render === "function" && e.$$typeof === undefined ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, Zf(d) ? (f2 = true, cg(b)) : f2 = false, b.memoizedState = e.state !== null && e.state !== undefined ? e.state : null, kh(b), e.updater = Ei, b.stateNode = e, e._reactInternals = b, Ii(b, d, a, c), b = jj(null, b, d, true, f2, c)) : (b.tag = 0, I2 && f2 && vg(b), Xi(null, b, e, c), b = b.child);
        return b;
      case 16:
        d = b.elementType;
        a: {
          ij(a, b);
          a = b.pendingProps;
          e = d._init;
          d = e(d._payload);
          b.type = d;
          e = b.tag = Zk(d);
          a = Ci(d, a);
          switch (e) {
            case 0:
              b = cj(null, b, d, a, c);
              break a;
            case 1:
              b = hj(null, b, d, a, c);
              break a;
            case 11:
              b = Yi(null, b, d, a, c);
              break a;
            case 14:
              b = $i(null, b, d, Ci(d.type, a), c);
              break a;
          }
          throw Error(p3(306, d, ""));
        }
        return b;
      case 0:
        return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), cj(a, b, d, e, c);
      case 1:
        return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), hj(a, b, d, e, c);
      case 3:
        a: {
          kj(b);
          if (a === null)
            throw Error(p3(387));
          d = b.pendingProps;
          f2 = b.memoizedState;
          e = f2.element;
          lh(a, b);
          qh(b, d, null, c);
          var g = b.memoizedState;
          d = g.element;
          if (f2.isDehydrated)
            if (f2 = { element: d, isDehydrated: false, cache: g.cache, pendingSuspenseBoundaries: g.pendingSuspenseBoundaries, transitions: g.transitions }, b.updateQueue.baseState = f2, b.memoizedState = f2, b.flags & 256) {
              e = Ji(Error(p3(423)), b);
              b = lj(a, b, d, c, e);
              break a;
            } else if (d !== e) {
              e = Ji(Error(p3(424)), b);
              b = lj(a, b, d, c, e);
              break a;
            } else
              for (yg = Lf(b.stateNode.containerInfo.firstChild), xg = b, I2 = true, zg = null, c = Vg(b, null, d, c), b.child = c;c; )
                c.flags = c.flags & -3 | 4096, c = c.sibling;
          else {
            Ig();
            if (d === e) {
              b = Zi(a, b, c);
              break a;
            }
            Xi(a, b, d, c);
          }
          b = b.child;
        }
        return b;
      case 5:
        return Ah(b), a === null && Eg(b), d = b.type, e = b.pendingProps, f2 = a !== null ? a.memoizedProps : null, g = e.children, Ef(d, e) ? g = null : f2 !== null && Ef(d, f2) && (b.flags |= 32), gj(a, b), Xi(a, b, g, c), b.child;
      case 6:
        return a === null && Eg(b), null;
      case 13:
        return oj(a, b, c);
      case 4:
        return yh(b, b.stateNode.containerInfo), d = b.pendingProps, a === null ? b.child = Ug(b, null, d, c) : Xi(a, b, d, c), b.child;
      case 11:
        return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), Yi(a, b, d, e, c);
      case 7:
        return Xi(a, b, b.pendingProps, c), b.child;
      case 8:
        return Xi(a, b, b.pendingProps.children, c), b.child;
      case 12:
        return Xi(a, b, b.pendingProps.children, c), b.child;
      case 10:
        a: {
          d = b.type._context;
          e = b.pendingProps;
          f2 = b.memoizedProps;
          g = e.value;
          G2(Wg, d._currentValue);
          d._currentValue = g;
          if (f2 !== null)
            if (He(f2.value, g)) {
              if (f2.children === e.children && !Wf.current) {
                b = Zi(a, b, c);
                break a;
              }
            } else
              for (f2 = b.child, f2 !== null && (f2.return = b);f2 !== null; ) {
                var h = f2.dependencies;
                if (h !== null) {
                  g = f2.child;
                  for (var k2 = h.firstContext;k2 !== null; ) {
                    if (k2.context === d) {
                      if (f2.tag === 1) {
                        k2 = mh(-1, c & -c);
                        k2.tag = 2;
                        var l3 = f2.updateQueue;
                        if (l3 !== null) {
                          l3 = l3.shared;
                          var m2 = l3.pending;
                          m2 === null ? k2.next = k2 : (k2.next = m2.next, m2.next = k2);
                          l3.pending = k2;
                        }
                      }
                      f2.lanes |= c;
                      k2 = f2.alternate;
                      k2 !== null && (k2.lanes |= c);
                      bh(f2.return, c, b);
                      h.lanes |= c;
                      break;
                    }
                    k2 = k2.next;
                  }
                } else if (f2.tag === 10)
                  g = f2.type === b.type ? null : f2.child;
                else if (f2.tag === 18) {
                  g = f2.return;
                  if (g === null)
                    throw Error(p3(341));
                  g.lanes |= c;
                  h = g.alternate;
                  h !== null && (h.lanes |= c);
                  bh(g, c, b);
                  g = f2.sibling;
                } else
                  g = f2.child;
                if (g !== null)
                  g.return = f2;
                else
                  for (g = f2;g !== null; ) {
                    if (g === b) {
                      g = null;
                      break;
                    }
                    f2 = g.sibling;
                    if (f2 !== null) {
                      f2.return = g.return;
                      g = f2;
                      break;
                    }
                    g = g.return;
                  }
                f2 = g;
              }
          Xi(a, b, e.children, c);
          b = b.child;
        }
        return b;
      case 9:
        return e = b.type, d = b.pendingProps.children, ch(b, c), e = eh(e), d = d(e), b.flags |= 1, Xi(a, b, d, c), b.child;
      case 14:
        return d = b.type, e = Ci(d, b.pendingProps), e = Ci(d.type, e), $i(a, b, d, e, c);
      case 15:
        return bj(a, b, b.type, b.pendingProps, c);
      case 17:
        return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), ij(a, b), b.tag = 1, Zf(d) ? (a = true, cg(b)) : a = false, ch(b, c), Gi(b, d, e), Ii(b, d, e, c), jj(null, b, d, true, a, c);
      case 19:
        return xj(a, b, c);
      case 22:
        return dj(a, b, c);
    }
    throw Error(p3(156, b.tag));
  };
  kl = typeof reportError === "function" ? reportError : function(a) {
    console.error(a);
  };
  ml.prototype.render = ll.prototype.render = function(a) {
    var b = this._internalRoot;
    if (b === null)
      throw Error(p3(409));
    fl(a, b, null, null);
  };
  ml.prototype.unmount = ll.prototype.unmount = function() {
    var a = this._internalRoot;
    if (a !== null) {
      this._internalRoot = null;
      var b = a.containerInfo;
      Rk(function() {
        fl(null, a, null, null);
      });
      b[uf] = null;
    }
  };
  ml.prototype.unstable_scheduleHydration = function(a) {
    if (a) {
      var b = Hc();
      a = { blockedOn: null, target: a, priority: b };
      for (var c = 0;c < Qc.length && b !== 0 && b < Qc[c].priority; c++)
        ;
      Qc.splice(c, 0, a);
      c === 0 && Vc(a);
    }
  };
  Ec = function(a) {
    switch (a.tag) {
      case 3:
        var b = a.stateNode;
        if (b.current.memoizedState.isDehydrated) {
          var c = tc(b.pendingLanes);
          c !== 0 && (Cc(b, c | 1), Dk(b, B2()), (K2 & 6) === 0 && (Gj = B2() + 500, jg()));
        }
        break;
      case 13:
        Rk(function() {
          var b2 = ih(a, 1);
          if (b2 !== null) {
            var c2 = R2();
            gi(b2, a, 1, c2);
          }
        }), il(a, 1);
    }
  };
  Fc = function(a) {
    if (a.tag === 13) {
      var b = ih(a, 134217728);
      if (b !== null) {
        var c = R2();
        gi(b, a, 134217728, c);
      }
      il(a, 134217728);
    }
  };
  Gc = function(a) {
    if (a.tag === 13) {
      var b = yi(a), c = ih(a, b);
      if (c !== null) {
        var d = R2();
        gi(c, a, b, d);
      }
      il(a, b);
    }
  };
  Hc = function() {
    return C2;
  };
  Ic = function(a, b) {
    var c = C2;
    try {
      return C2 = a, b();
    } finally {
      C2 = c;
    }
  };
  yb = function(a, b, c) {
    switch (b) {
      case "input":
        bb(a, c);
        b = c.name;
        if (c.type === "radio" && b != null) {
          for (c = a;c.parentNode; )
            c = c.parentNode;
          c = c.querySelectorAll("input[name=" + JSON.stringify("" + b) + '][type="radio"]');
          for (b = 0;b < c.length; b++) {
            var d = c[b];
            if (d !== a && d.form === a.form) {
              var e = Db(d);
              if (!e)
                throw Error(p3(90));
              Wa(d);
              bb(d, e);
            }
          }
        }
        break;
      case "textarea":
        ib(a, c);
        break;
      case "select":
        b = c.value, b != null && fb(a, !!c.multiple, b, false);
    }
  };
  Gb = Qk;
  Hb = Rk;
  sl = { usingClientEntryPoint: false, Events: [Cb, ue, Db, Eb, Fb, Qk] };
  tl = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" };
  ul = { bundleType: tl.bundleType, version: tl.version, rendererPackageName: tl.rendererPackageName, rendererConfig: tl.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a) {
    a = Zb(a);
    return a === null ? null : a.stateNode;
  }, findFiberByHostInstance: tl.findFiberByHostInstance || jl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined") {
    vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!vl.isDisabled && vl.supportsFiber)
      try {
        kc = vl.inject(ul), lc = vl;
      } catch (a) {}
  }
  $__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED2 = sl;
  $unstable_batchedUpdates = Qk;
});

// ../node_modules/react-dom/index.js
var require_react_dom = __commonJS((exports, module) => {
  init_react_dom_production_min();
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    if (false) {}
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  if (true) {
    checkDCE();
    module.exports = exports_react_dom_production_min;
  } else {}
});

// ../node_modules/react-dom/client.js
var require_client = __commonJS((exports) => {
  var m2 = __toESM(require_react_dom(), 1);
  if (true) {
    exports.createRoot = m2.createRoot;
    exports.hydrateRoot = m2.hydrateRoot;
  } else {}
  var i;
});

// src/components/Root.tsx
var import_react = __toESM(require_react(), 1);
var jsx_runtime = __toESM(require_jsx_runtime(), 1);
var Root = () => {
  const [world, setWorld] = import_react.useState();
  const [loginState, setLoginState] = import_react.useState("");
  import_react.useEffect(() => {
    window.world = world;
  }, [world]);
  console.log("returning Root");
  return /* @__PURE__ */ jsx_runtime.jsx("div", {
    children: /* @__PURE__ */ jsx_runtime.jsx("audio", {
      children: /* @__PURE__ */ jsx_runtime.jsx("source", {
        src: "/silent.mp3",
        type: "audio/mp3"
      })
    })
  });
};

// src/index.tsx
var import_client = __toESM(require_client(), 1);
var jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var App = () => /* @__PURE__ */ jsx_runtime2.jsx("div", {
  className: "App",
  children: /* @__PURE__ */ jsx_runtime2.jsx(Root, {})
});
console.log("MAKING APP");
var domContainer = document.querySelector("#root");
var root = import_client.createRoot(domContainer);
root.render(/* @__PURE__ */ jsx_runtime2.jsx(App, {}));
console.log("RENDERED APP", App, Root);
