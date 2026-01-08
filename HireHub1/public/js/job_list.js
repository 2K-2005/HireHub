async function loadJobs() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login again");
    window.location = "/login.html";
    return;
  }

  const res = await fetch("/api/jobs/my-jobs", {
    headers: { "Authorization": token }
  });

  const data = await res.json();
  const box = document.getElementById("jobsContainer");

  if (!data.jobs || data.jobs.length === 0) {
    box.innerHTML = "<p>No jobs created yet.</p>";
    return;
  }

  box.innerHTML = data.jobs
    .map(job => `
      <div class="job-card">
        <h2>${job.title}</h2>
        <p><b>Category:</b> ${job.jobType}</p>
        <p><b>Location:</b> ${job.location}</p>
        <p><b>Salary:</b> ${job.salary}</p>
        <p>${job.description}</p>

        <button onclick="editJob('${job._id}')" class="btn-edit">Edit</button>
        <button onclick="deleteJob('${job._id}')" class="btn-delete">Delete</button>
      </div>
    `)
    .join("");
}

async function deleteJob(id) {
  if (!confirm("Delete this job?")) return;

  const token = localStorage.getItem("token");

  const res = await fetch("/api/jobs/" + id, {
    method: "DELETE",
    headers: { "Authorization": token }
  });

  const data = await res.json();
  alert(data.msg);
  loadJobs();
}

function editJob(id) {
  window.location = "/edit_job.html?id=" + id;
}

loadJobs();
