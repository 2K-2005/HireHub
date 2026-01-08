document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) return alert("Login again");

  const body = {
    jobType: document.getElementById("jobType").value,
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    qualifications: document.getElementById("qualifications").value,
    requirements: document.getElementById("requirements").value,
    responsibilities: document.getElementById("responsibilities").value,
    location: document.getElementById("location").value,
    salary: document.getElementById("salary").value
  };

  const res = await fetch("/api/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  alert(data.msg);

  if (res.ok) {
    window.location.href = "/dashboard.html";
  }
});
