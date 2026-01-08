document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  if (!token) {
    alert("Login again!");
    return window.location = "login.html";
  }

  // Show username + role
  document.getElementById("usernameDisplay").textContent = username;
  document.getElementById("roleDisplay").textContent = role.toUpperCase();

  // Set profile button
  const btn = document.getElementById("openProfileBtn");
  btn.textContent = role === "fresher" ? "Open Fresher Profile" : "Open Employer Profile";

  btn.onclick = () => {
    window.location = role === "fresher" ? "fresher.html" : "employer.html";
  };

  // Load full profile data
  loadFullProfile(role, token);

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location = "login.html";
  };
});

async function loadFullProfile(role, token) {
  const url = role === "fresher" ? "/api/freshers/me" : "/api/employers/me";

  try {
    const res = await fetch(url, {
      headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();
    const profile = data.fresher || data.employer;

    if (!profile) {
      document.getElementById("profileContainer").innerHTML = "No profile found.";
      return;
    }

    // Build dynamic HTML
    let html = "";
    for (const key of Object.keys(profile)) {
      if (["_id", "userId", "__v"].includes(key)) continue;

      html += `
        <div class="profile-field">
          <b>${formatKey(key)}:</b> ${profile[key] || "N/A"}
        </div>
      `;
    }

    document.getElementById("profileContainer").innerHTML = html;

  } catch (err) {
    document.getElementById("profileContainer").innerHTML = "Failed to load profile.";
  }
}

function formatKey(key) {
  return key.replace(/([A-Z])/g, " $1")
            .replace(/^./, c => c.toUpperCase());
}

const role = localStorage.getItem("role");

// Show CREATE JOB button ONLY for employer
if (role === "employer") {
    document.getElementById("createJobBtn").style.display = "inline-block";
    document.getElementById("savedJobBtn").style.display = "inline-block";
    document.getElementById("manageCandidatesBtn").style.display = "inline-block";

    document.getElementById("createJobBtn").onclick = () => {
        window.location = "create_job.html";
    };
     document.getElementById("savedJobBtn").onclick = () => {
        window.location = "job_list.html";
    };
    document.getElementById("manageCandidatesBtn").onclick = () => {
        window.location = "employer_apps.html";
    };
}

if (role === "fresher") {
    document.getElementById("findJobBtn").style.display = "inline-block";

     document.getElementById("findJobBtn").onclick = () => {
        window.location = "find_job.html";
    };
}

if (role === "fresher") {
  const savedJobBtn = document.getElementById("savedJobBtn");
  savedJobBtn.innerText = "My Applications";
  savedJobBtn.style.display = "inline-block";
  savedJobBtn.onclick = () => {
    window.location = "/my_applications.html";
  };
}

