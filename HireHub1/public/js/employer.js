document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "employer") {
    alert("Access denied. Login again.");
    return window.location = "login.html";
  }

  // Load existing profile
  loadEmployerProfile();

  // Save profile
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      companyName: document.getElementById("companyName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      location: document.getElementById("location").value.trim(),
      industry: document.getElementById("industry").value.trim(),
      size: document.getElementById("size").value.trim(),
      website: document.getElementById("website").value.trim(),
      description: document.getElementById("description").value.trim(),
      requirements: document.getElementById("requirements").value.trim(),
      aboutHR: document.getElementById("aboutHR").value.trim(),
      linkedin: document.getElementById("linkedin").value.trim()
    };

    const res = await fetch("/api/employers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok) {
      alert("Employer Profile Saved ✔");
    } else {
      alert(data.message || "Error saving profile");
    }
  });

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location = "login.html";
  };
});


async function loadEmployerProfile() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/api/employers/me", {
      headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    if (!res.ok || !data.employer) return;

    const e = data.employer;

    document.getElementById("companyName").value = e.companyName || "";
    document.getElementById("phone").value = e.phone || "";
    document.getElementById("location").value = e.location || "";
    document.getElementById("industry").value = e.industry || "";
    document.getElementById("size").value = e.size || "";
    document.getElementById("website").value = e.website || "";
    document.getElementById("description").value = e.description || "";
    document.getElementById("requirements").value = e.requirements || "";
    document.getElementById("aboutHR").value = e.aboutHR || "";
    document.getElementById("linkedin").value = e.linkedin || "";
  } catch (err) {
    console.log("Error loading employer:", err);
  }
}
