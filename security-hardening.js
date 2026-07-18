/**
 * Security Hardening — Intelligent Edition
 * Anti-inspection protections without self-destruct.
 * Version adaptée pour Lovable Enhance (sans side effects destructeurs).
 */
(function() {
  'use strict';

  // ============================================================
  // API exposée (lock + destroy no-op)
  // ============================================================

  var _locked = {};

  function _lock(n, v) {
    if (_locked[n]) return;
    _locked[n] = true;
    try {
      Object.defineProperty(window, n, {
        configurable: false,
        writable: false,
        value: v
      });
    } catch(e) {}
  }

  // destroy = no-op (pas de self-destruct)
  function _destroy() {
    console.warn('[Security] destroy() called — ignored (intelligent mode)');
  }

  // ============================================================
  // DevTools detection — passive (juste flag, pas de kill)
  // ============================================================

  (function _dg() {
    var start = Date.now();
    debugger; // Uniquement ralenti si DevTools ouvert
    var elapsed = Date.now() - start;
    if (elapsed > 80) {
      // DevTools détecté — on ne fait rien de destructeur
      // Tu peux logger ici si besoin
    }
    setTimeout(_dg, 4000); // Moins agressif que l'original (toutes les 1.5s)
  })();

  // ============================================================
  // Console silencieuse
  // ============================================================

  var _cls = ['log','warn','error','info','debug','trace','dir','dirxml','group','groupEnd','table','assert','profile','profileEnd','count','timeEnd'];
  for (var _i = 0; _i < _cls.length; _i++) {
    try {
      if (console && console[_cls[_i]]) {
        console[_cls[_i]] = function(){};
      }
    } catch(e) {}
  }

  // ============================================================
  // React DevTools désactivé
  // ============================================================

  try {
    Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
      configurable: false,
      writable: false,
      value: undefined
    });
  } catch(e) {}

  // ============================================================
  // Function.prototype.toString protégé
  // ============================================================

  try {
    var _fp = Function.prototype.toString;
    Function.prototype.toString = function() {
      return _fp.call(this);
    };
    Object.defineProperty(Function.prototype, 'toString', {
      configurable: false,
      writable: false
    });
  } catch(e) {}

  // ============================================================
  // API globale exposée
  // ============================================================

  window._pkS = {
    lock: _lock,
    destroy: _destroy
  };

  try {
    Object.defineProperty(window, '_pkS', { configurable: false, writable: false });
  } catch(e) {}

  console.log('[Security] Hardening active (intelligent mode)');
})();
