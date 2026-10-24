(() => {
  const url = window.EVENTMC_SUPABASE_URL || "";
  const key = window.EVENTMC_SUPABASE_ANON_KEY || "";
  const valid = url.startsWith("https://") && !url.includes("PASTE_") && key.length > 20 && !key.includes("PASTE_");
  window.eventmcSupabaseReady = valid && !!window.supabase?.createClient;
  window.eventmcSupabase = window.eventmcSupabaseReady ? window.supabase.createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
  window.eventmcShowNotice = (el, message, kind = "info") => { if (!el) return; el.textContent = message; el.className = `portal-notice show ${kind}`; };
  window.eventmcEsc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  document.querySelectorAll("#currentYear").forEach(el => el.textContent = new Date().getFullYear());
})();
