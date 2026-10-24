document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm"), loginCard = document.getElementById("loginCard"), dashboard = document.getElementById("dashboard");
  const loginNotice = document.getElementById("loginNotice"), dashboardNotice = document.getElementById("dashboardNotice"), list = document.getElementById("applicationList");
  const loginButton = document.getElementById("loginButton"), statusFilter = document.getElementById("statusFilter");
  if (!window.eventmcSupabaseReady) { window.eventmcShowNotice(loginNotice, "Supabase isn't configured yet. Complete SUPABASE-SETUP.md first.", "info"); loginButton.disabled = true; return; }
  let currentUser = null;
  const client = window.eventmcSupabase;
  const showDashboard = yes => { loginCard.classList.toggle("portal-hidden", yes); dashboard.classList.toggle("portal-hidden", !yes); };
  async function loadApplications() {
    list.innerHTML = '<div class="portal-empty">Loading applications…</div>';
    const status = statusFilter.value;
    let query = client.from("staff_applications").select("id,minecraft_username,discord_username,age_range,role_applied_for,previous_experience,why_join,availability,status,created_at,review_notes").order("created_at", { ascending: false });
    if (status !== "all") query = query.eq("status", status);
    const { data, error } = await query;
    if (error) { console.error(error); list.innerHTML = '<div class="portal-empty">Could not load applications. Your account may not have staff permissions. Ask an administrator to check the staff_members table and RLS policies.</div>'; return; }
    if (!data?.length) { list.innerHTML = '<div class="portal-empty">No applications in this filter.</div>'; return; }
    list.innerHTML = data.map(a => `<article class="application-item" data-id="${eventmcEsc(a.id)}"><div class="portal-topline"><div><h3>${eventmcEsc(a.minecraft_username)} <span class="application-status ${eventmcEsc(a.status)}">${eventmcEsc(a.status)}</span></h3><div class="application-meta"><span>Discord: ${eventmcEsc(a.discord_username)}</span><span>Age range: ${eventmcEsc(a.age_range)}</span><span>Applied for: ${eventmcEsc(a.role_applied_for)}</span><span>${eventmcEsc(a.created_at ? new Date(a.created_at).toLocaleString() : "Date unavailable")}</span></div></div></div><div class="application-label">Previous experience</div><div class="application-answer">${eventmcEsc(a.previous_experience)}</div><div class="application-label">Why EventMC?</div><div class="application-answer">${eventmcEsc(a.why_join)}</div>${a.availability ? `<div class="application-label">Availability</div><div class="application-answer">${eventmcEsc(a.availability)}</div>` : ""}${a.review_notes ? `<div class="application-label">Review notes</div><div class="application-answer">${eventmcEsc(a.review_notes)}</div>` : ""}<div class="application-actions"><button class="portal-btn approve" data-action="approved" ${a.status === "approved" ? "disabled" : ""}>Approve</button><button class="portal-btn reject" data-action="rejected" ${a.status === "rejected" ? "disabled" : ""}>Reject</button><button class="portal-btn" data-action="pending" ${a.status === "pending" ? "disabled" : ""}>Mark pending</button></div></article>`).join("");
  }
  async function verifyAndStart(session) {
    if (!session?.user) { currentUser = null; showDashboard(false); return; }
    currentUser = session.user;
    const { data, error } = await client.from("staff_members").select("user_id,active").eq("user_id", currentUser.id).eq("active", true).maybeSingle();
    if (error || !data) { await client.auth.signOut(); showDashboard(false); window.eventmcShowNotice(loginNotice, "This account is signed in but is NOT authorized for the staff panel. Ask an administrator to grant access.", "error"); return; }
    showDashboard(true); await loadApplications();
  }
  loginForm.addEventListener("submit", async e => { e.preventDefault(); loginButton.disabled = true; loginButton.textContent = "SIGNING IN…";
    try { const { data, error } = await client.auth.signInWithPassword({ email: document.getElementById("email").value.trim(), password: document.getElementById("password").value }); if (error) throw error; await verifyAndStart(data.session); }
    catch (err) { window.eventmcShowNotice(loginNotice, err.message || "Sign-in failed.", "error"); }
    finally { loginButton.disabled = false; loginButton.textContent = "SIGN IN SECURELY ↗"; }
  });
  document.getElementById("signOutButton").addEventListener("click", async () => { await client.auth.signOut(); currentUser = null; showDashboard(false); loginForm.reset(); window.eventmcShowNotice(loginNotice, "Signed out.", "info"); });
  document.getElementById("refreshButton").addEventListener("click", loadApplications); statusFilter.addEventListener("change", loadApplications);
  list.addEventListener("click", async e => { const btn = e.target.closest("button[data-action]"); if (!btn || !currentUser) return; const card = btn.closest("[data-id]"); if (!card) return; btn.disabled = true;
    const { error } = await client.from("staff_applications").update({ status: btn.dataset.action, reviewed_by: currentUser.id, reviewed_at: new Date().toISOString() }).eq("id", card.dataset.id);
    if (error) { console.error(error); window.eventmcShowNotice(dashboardNotice, "Could not update this application. Confirm your staff permissions and database policies.", "error"); btn.disabled = false; } else { window.eventmcShowNotice(dashboardNotice, `Application marked ${btn.dataset.action}.`, "success"); await loadApplications(); }
  });
  client.auth.getSession().then(({ data }) => verifyAndStart(data.session));
  client.auth.onAuthStateChange((_event, session) => { if (!session) { currentUser = null; showDashboard(false); } });
});
