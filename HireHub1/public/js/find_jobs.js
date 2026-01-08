// find-jobs.js
document.addEventListener("DOMContentLoaded", () => {
  const qEl = document.getElementById("q");
  const jobTypeEl = document.getElementById("jobType");
  const locEl = document.getElementById("location");
  const jobsList = document.getElementById("jobsList");
  const searchBtn = document.getElementById("searchBtn");

  async function searchJobs() {
    const q = qEl.value.trim();
    const jobType = jobTypeEl.value;
    const location = locEl.value.trim();

    let url = `/api/jobs?limit=100`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (jobType && jobType !== "all") url += `&jobType=${encodeURIComponent(jobType)}`;
    if (location) url += `&location=${encodeURIComponent(location)}`;

    jobsList.innerHTML = `<div class="empty">Searching...</div>`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      renderJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      jobsList.innerHTML = `<div class="empty">Unable to fetch results. Try again later.</div>`;
    }
  }

  function renderJobs(list) {
    if (!list || list.length === 0) {
      jobsList.innerHTML = `<div class="empty">No jobs match your search.</div>`;
      return;
    }

    jobsList.innerHTML = list.map(job => {
      const descr = (job.description || "").length > 400 ? (job.description.slice(0,400) + '...') : (job.description || '');
      return `
        <article class="job-card">
          <div class="job-row">
            <div>
              <h3 style="margin:0">${escapeHtml(job.title)}</h3>
              <div class="job-meta">${escapeHtml(job.employerName || "Employer")} • ${escapeHtml(job.jobType || "")} • ${escapeHtml(job.location || "N/A")}</div>
            </div>
            <div class="job-actions">
              <button class="btn-view" data-id="${job._id}">View</button>
              <button class="btn-apply" data-id="${job._id}">Apply</button>
            </div>
          </div>
          <p style="margin-top:12px; color:#cbd5e1;">${escapeHtml(descr)}</p>
          <div style="margin-top:8px; font-size:13px; color:#9aa5b1">Posted: ${new Date(job.createdAt).toLocaleString()}</div>
        </article>
      `;
    }).join("");

    // attach click handlers
    jobsList.querySelectorAll(".btn-view").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        window.location = `/job_view.html?id=${id}`; // optional job detail page
      });
    });

    jobsList.querySelectorAll(".btn-apply").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.dataset.id;
        // if you have an apply flow, redirect or open modal. For now show alert.
        if (!localStorage.getItem("token")) {
          if (!confirm("You must be logged in as a fresher to apply. Go to login?")) return;
          return window.location = "/login.html";
        }
        alert("Apply flow not implemented yet. We'll add it next — job id: " + id);
      });
    });
  }

  // basic HTML escape
  function escapeHtml(s) {
    if (!s) return "";
    return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  }

  // wire search
  searchBtn.addEventListener("click", searchJobs);
  // enter key on keyword
  qEl.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); searchJobs(); } });

  // initial load - show recent jobs
  (async () => {
    try {
      // load recent jobs
      const res = await fetch("/api/jobs?limit=20");
      const data = await res.json();
      renderJobs(data.jobs || []);
    } catch (err) {
      jobsList.innerHTML = `<div class="empty">Could not load jobs.</div>`;
    }
  })();
});
