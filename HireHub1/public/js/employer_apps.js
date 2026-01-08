// employer-apps.js
const token = localStorage.getItem("token");
if (!token) { alert("Login required"); window.location = "/login.html"; }

async function loadEmployerJobs() {
  // get jobs created by this employer
  const res = await fetch("/api/jobs/my-jobs", { headers: { "Authorization": "Bearer " + token }});
  const j = await res.json();
  const sel = document.getElementById("jobSelect");
  sel.innerHTML = `<option value="">-- Select job --</option>`;
  (j.jobs || []).forEach(job => {
    const opt = document.createElement("option");
    opt.value = job._id;
    opt.textContent = job.title;
    sel.appendChild(opt);
  });
}

async function loadApplicationsForJob(jobId) {
  const res = await fetch("/api/applications/job/" + jobId, { headers: { "Authorization": "Bearer " + token }});
  const j = await res.json();
  renderApplications(j.apps || j.apps === undefined ? (j.apps || []) : j.apps);
}

// render applications
function renderApplications(list) {
  const box = document.getElementById("appsContainer");
  if (!list || list.length === 0) { box.innerHTML = "<p>No applications found.</p>"; return; }

  box.innerHTML = list.map(a => `
    <div class="app-card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3 style="margin:0">${a.fresherName || a.fresherEmail}</h3>
          <div class="small">Applied: ${new Date(a.createdAt).toLocaleString()}</div>
          <div style="margin-top:8px"><b>Resume:</b> <a target="_blank" href="${a.resumeLink}">${a.resumeLink ? 'Open' : '—'}</a></div>
          <div style="margin-top:8px"><b>Cover Letter:</b><div style="margin-top:6px;color:#cbd5e1;">${a.coverLetter || '—'}</div></div>
        </div>
        <div class="actions">
          <button class="btn-shortlist" onclick="updateStatus('${a._id}','shortlisted')">Shortlist</button>
          <button class="btn-reject" onclick="updateStatus('${a._id}','rejected')">Reject</button>
          <button class="btn-hire" onclick="updateStatus('${a._id}','hired')">Hire</button>
        </div>
      </div>
    </div>
  `).join("");
}

async function updateStatus(id, status) {
  if (!confirm("Set status to " + status + "?")) return;
  const res = await fetch("/api/applications/" + id + "/status", {
    method: "PUT",
    headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  const j = await res.json();
  alert(j.msg || j.message || "Updated");
  // reload current list (if filtered)
  const sel = document.getElementById("jobSelect");
  if (sel.value) loadApplicationsForJob(sel.value);
  else loadAllApplications();
}

async function loadAllApplications() {
  const res = await fetch("/api/applications/employer/all", { headers: { "Authorization": "Bearer " + token }});
  const j = await res.json();
  renderApplications(j.apps || j.apps);
}

document.getElementById("loadApps").addEventListener("click", () => {
  const sel = document.getElementById("jobSelect");
  if (!sel.value) return alert("Select a job");
  loadApplicationsForJob(sel.value);
});
document.getElementById("loadAll").addEventListener("click", loadAllApplications);

loadEmployerJobs();
