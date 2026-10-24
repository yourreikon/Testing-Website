document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("applicationForm");
  if (!form) return;
  const notice = document.getElementById("formNotice");
  const button = document.getElementById("submitApplication");
  if (!window.eventmcSupabaseReady) { window.eventmcShowNotice(notice, "The application system is not configured yet. Please try again later or contact EventMC staff on Discord.", "info"); button.disabled = true; return; }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true; button.textContent = "SUBMITTING…";
    const data = new FormData(form);
    const payload = { minecraft_username: String(data.get("mcName")).trim(), discord_username: String(data.get("discordName")).trim(), age_range: String(data.get("ageRange")), role_applied_for: String(data.get("role")), previous_experience: String(data.get("experience")).trim(), why_join: String(data.get("whyJoin")).trim(), availability: String(data.get("availability") || "").trim(), status: "pending" };
    try {
      const { error } = await window.eventmcSupabase.from("staff_applications").insert(payload);
      if (error) throw error;
      form.reset(); window.eventmcShowNotice(notice, "Application submitted successfully. The EventMC staff team can now review it privately.", "success");
    } catch (err) { console.error(err); window.eventmcShowNotice(notice, "We couldn't submit your application. The system may still need setup. Please contact EventMC staff on Discord.", "error"); }
    finally { button.disabled = false; button.textContent = "SUBMIT APPLICATION ↗"; }
  });
});
