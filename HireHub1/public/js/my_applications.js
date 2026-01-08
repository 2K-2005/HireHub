const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "fresher") {
  alert("Please login as Fresher");
  window.location = "/login.html";
}

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location = "/login.html";
};

const container = document.getElementById("applicationsContainer");

// Load my applications
async function loadApplications() {
  try {
    const res = await fetch("/api/applications/my-applications", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    if (!data.apps || data.apps.length === 0) {
      container.innerHTML = "<p>No applications yet.</p>";
      return;
    }

    container.innerHTML = "";

    data.apps.forEach(app => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${app.jobTitle || "Job"}</h3>
        <p><b>Applied On:</b> ${new Date(app.createdAt).toLocaleDateString()}</p>
        <p>
          <b>Status:</b>
          <span class="status ${app.status}">
            ${app.status.toUpperCase()}
          </span>
        </p>

        ${app.status === "applied" ? `
          <button class="withdraw-btn" onclick="withdraw('${app._id}')">
            Withdraw Application
          </button>
        ` : ""}
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error loading applications</p>";
  }
}

// Withdraw application
async function withdraw(id) {
  if (!confirm("Are you sure you want to withdraw this application?")) return;

  const res = await fetch("/api/applications/" + id, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();
  alert(data.msg || "Application withdrawn");
  loadApplications();
}

loadApplications();
