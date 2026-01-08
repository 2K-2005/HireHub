// Get Job ID from URL
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get("id");

if (!jobId) {
  alert("Invalid job");
  window.location = "/job_list.html";
}

async function loadJobData() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/jobs/my-jobs", {
    headers: { "Authorization": token }
  });

  const data = await res.json();

  // Find job by ID
  const job = data.jobs.find(j => j._id === jobId);

  if (!job) {
    alert("Job not found!");
    window.location = "/job_list.html";
    return;
  }

  // Fill form with existing job details
  document.getElementById("title").value = job.title;
  document.getElementById("jobType").value = job.jobType;
  document.getElementById("location").value = job.location;
  document.getElementById("salary").value = job.salary;
  document.getElementById("description").value = job.description;
}

loadJobData();


document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  const body = {
    title: document.getElementById("title").value,
    category: document.getElementById("jobType").value,
    location: document.getElementById("location").value,
    salary: document.getElementById("salary").value,
    description: document.getElementById("description").value
  };

  const res = await fetch("/api/jobs/" + jobId, {
    method: "PUT",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  alert(data.msg);

  if (res.ok) {
    window.location = "/job_list.html";
  }
});


function goBack() {
  window.location = "/job_list.html";
}
