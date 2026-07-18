/**
 * Page Hook — Neutralized for local-only operation.
 * Original: intercepts XMLHttpRequest to add apikey headers for lov.powerkits.net.
 * Since the extension is 100% local (all backend calls mocked in background.js),
 * the original hook was causing 403 on Supabase Storage uploads by injecting
 * an invalid 'apikey' header into every XHR request.
 */
(function() {
  'use strict';
  console.log('[PageHook] Disabled (local mode)');
})();
