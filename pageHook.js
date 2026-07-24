/**
 * Page Hook — Lovable credit bypass & error suppression.
 *
 * Injects into MAIN world to:
 * 1. Suppress error metadata in XHR/Fetch/WebSocket payloads (stops credit/limit tracking).
 * 2. Relay the data-ql-bypass flag set by content-bridge.js.
 * 3. Safe: never modifies /storage/v1/ requests (avoids 403).
 */
(function() {
  'use strict';

  if (window.__pkPageHookReady) return;
  window.__pkPageHookReady = true;

  // ── helpers ──────────────────────────────────────────────
  function isBypassActive() {
    try { return document.documentElement.getAttribute('data-ql-bypass') === '1'; } catch(e) {}
    return false;
  }

  function shouldProcess(url) {
    if (!url || typeof url !== 'string') return false;
    // Never touch Supabase Storage (causes 403 on uploads)
    if (url.indexOf('/storage/v1/') !== -1) return false;
    return true;
  }

  /** Clear fix_error_metadata.errors and similar credit-tracking fields. */
  function suppressErrorMetadata(obj) {
    if (!obj || typeof obj !== 'object') return;
    try {
      // Top-level fix_error_metadata
      if (obj.fix_error_metadata && typeof obj.fix_error_metadata === 'object') {
        if (Array.isArray(obj.fix_error_metadata.errors) && obj.fix_error_metadata.errors.length > 0) {
          obj.fix_error_metadata.errors = [];
        }
      }
      // Nested in messages[] (WebSocket batches)
      if (Array.isArray(obj.messages)) {
        obj.messages.forEach(function(msg) {
          if (msg && msg.fix_error_metadata && typeof msg.fix_error_metadata === 'object') {
            if (Array.isArray(msg.fix_error_metadata.errors) && msg.fix_error_metadata.errors.length > 0) {
              msg.fix_error_metadata.errors = [];
            }
          }
        });
      }
      // Clear error_count if present
      if (typeof obj.error_count === 'number' && obj.error_count > 0) {
        obj.error_count = 0;
      }
      if (Array.isArray(obj.errors) && obj.errors.length > 0) {
        obj.errors = [];
      }
    } catch(e) {}
  }

  /** Try to parse + suppress in a JSON string; return modified string or original on failure. */
  function suppressInBody(body) {
    if (!body || typeof body !== 'string') return body;
    try {
      var parsed = JSON.parse(body);
      if (parsed && typeof parsed === 'object') {
        suppressErrorMetadata(parsed);
        return JSON.stringify(parsed);
      }
    } catch(e) {}
    return body;
  }

  // ── XHR intercept (prototype patch) ──────────────────────
  var OrigXHROpen   = XMLHttpRequest.prototype.open;
  var OrigXHRSend   = XMLHttpRequest.prototype.send;
  var xhrMeta       = new WeakMap();

  XMLHttpRequest.prototype.open = function(method, url) {
    xhrMeta.set(this, { url: url || '' });
    return OrigXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    var meta = xhrMeta.get(this) || {};
    if (isBypassActive() && shouldProcess(meta.url) && body && typeof body === 'string') {
      body = suppressInBody(body);
    }
    return OrigXHRSend.call(this, body);
  };

  // ── Fetch intercept ──────────────────────────────────────
  var OrigFetch = window.fetch;
  window.fetch = function(input, init) {
    var url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    init = init || {};

    // Suppress error metadata in outgoing fetch body
    if (isBypassActive() && shouldProcess(url) && init.body && typeof init.body === 'string') {
      init.body = suppressInBody(init.body);
    }

    return OrigFetch.call(window, input, init).then(function(response) {
      // Suppress error metadata in incoming fetch response
      if (isBypassActive() && shouldProcess(url)) {
        var clone = response.clone();
        clone.text().then(function(text) {
          try {
            var parsed = JSON.parse(text);
            suppressErrorMetadata(parsed);
            // Can't modify the original response, but suppression is best-effort
          } catch(e) {}
        }).catch(function() {});
      }
      return response;
    });
  };

  // ── WebSocket intercept ──────────────────────────────────
  var OrigWSSend = WebSocket.prototype.send;

  WebSocket.prototype.send = function(data) {
    if (isBypassActive() && typeof data === 'string') {
      data = suppressInBody(data);
    }
    return OrigWSSend.call(this, data);
  };

  // ── Bypass signal from postMessage (relay) ───────────────
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'qlBypassState') {
      if (event.data.active) {
        try { document.documentElement.setAttribute('data-ql-bypass', '1'); } catch(e) {}
        try { localStorage.setItem('__ql_bypass_active', '1'); } catch(e) {}
      } else {
        try { document.documentElement.removeAttribute('data-ql-bypass'); } catch(e) {}
        try { localStorage.removeItem('__ql_bypass_active'); } catch(e) {}
      }
    }
  });

  // ── Bootstrap: if content-bridge already set the flag ────
  try {
    if (localStorage.getItem('__ql_bypass_active') === '1') {
      document.documentElement.setAttribute('data-ql-bypass', '1');
    }
  } catch(e) {}

  console.log('[PageHook] Active — error suppression + data-ql-bypass relay (/storage/v1/ excluded)');
})();
