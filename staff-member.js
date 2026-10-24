"use strict";
(() => {
  const host = document.getElementById("memberProfile");
  if (!host) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const members = window.EVENTMC_STAFF_PROFILES || [];
  const member = members.find(item => item.id === id);
  if (!member) {
    host.innerHTML = '<div class="member-not-found"><div class="section-kicker">STAFF DIRECTORY</div><h1>PROFILE <span class="yellow">NOT FOUND.</span></h1><p>This staff profile could not be found. Please return to the staff team page and choose a member.</p><a class="button button-primary" href="staff.html">Back to Staff Team ↗</a></div>';
    document.title = "EventMC | Staff Profile Not Found";
    return;
  }
  document.title = `EventMC | ${member.name}`;
  const safe = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[ch]));
  host.innerHTML = `<div class="member-profile-art"><img class="member-profile-avatar" src="./${safe(member.image)}" alt="${safe(member.name)}" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><div class="member-avatar-fallback" hidden>${safe(member.name.slice(0,1).toUpperCase())}</div><span class="member-profile-status"><i></i> EVENTMC STAFF</span></div><div class="member-profile-copy"><div class="section-kicker">MEET THE TEAM</div><h1>${safe(member.name)}<span class="profile-period">.</span></h1><span class="staff-role member-role">${safe(member.role)}</span><h2>ABOUT <span class="yellow">${safe(member.name)}</span></h2><p class="member-description">${safe(member.description)}</p><div class="member-profile-note"><span>✦</span><p>Part of the team helping build and support the EventMC community.</p></div><div class="member-profile-actions"><a class="button button-primary" href="staff.html">← All Staff Members</a><a class="button button-outline" href="https://discord.gg/d8NJ4SGXV" target="_blank" rel="noopener noreferrer">Join Discord ↗</a></div></div>`;
})();
