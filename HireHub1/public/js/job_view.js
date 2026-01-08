// job-view.js
const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");
const jobCard = document.getElementById("jobCard");
const applyForm = document.getElementById("applyForm");

if (!jobId) {
  jobCard.innerHTML = "Invalid job id.";
} else {
  // load job detail (public endpoint)
  (async function loadJob() {
    try {
      const res = await fetch("/api/jobs?limit=1&q=&jobId=" + encodeURIComponent(jobId));
      // Note: our search route doesn't support jobId param — simpler: fetch /api/jobs/my endpoint isn't public.
      // Instead call /api/jobs (we'll add a quick job-by-id fetch)
      const singleRes = await fetch("/api/jobs/" + jobId); // we'll add this endpoint; if not present, fallback
      if (singleRes.ok) {
        const jd = await singleRes.json();
        renderJob(jd.job);
        return;
      }
    } catch (err) {
      // fallback: try generic list search by id
    }

    // fallback: ask server for job listing via search route (if not present)
    try {
      const res2 = await fetch("/api/jobs?limit=1");
      const j = await res2.json();
      const found = (j.jobs || []).find(x => x._id === jobId);
      if (found) return renderJob(found);
      jobCard.innerHTML = "Job not found.";
    } catch (err) {
      jobCard.innerHTML = "Unable to load job.";
    }
  })();
}

function renderJob(job) {
  if (!job) { jobCard.innerHTML = "Job not found"; return; }
  jobCard.innerHTML = `
    <h2>${escape(job.title)}</h2>
    <div class="small">${escape(job.employerName || "Employer")} • ${escape(job.jobType)} • ${escape(job.location || "N/A")}</div>
    <p style="margin-top:12px; color:#cbd5e1;">${escape(job.description || "")}</p>
    <div style="margin-top:10px;" class="small">Posted: ${new Date(job.createdAt).toLocaleString()}</div>
  `;
}

function escape(s){ if(!s) return ""; return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

// APPLY
applyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) { alert("Please login as fresher to apply"); return window.location = "/login.html"; }
  // check role
  const role = localStorage.getItem("role");
  if (role !== "fresher") { alert("Only freshers can apply"); return; }

  const body = {
    jobId,
    resumeLink: document.getElementById("resumeLink").value.trim(),
    coverLetter: document.getElementById("coverLetter").value.trim()
  };

  const res = await fetch("/api/applications/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify(body)
  });

  const j = await res.json();
  if (res.ok) {
    alert("Application submitted ✔");
    window.location = "/dashboard.html";
  } else {
    alert(j.msg || j.message || "Error applying");
  }
});
