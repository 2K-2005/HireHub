async function api(path, method = "GET", body) {
  const token = localStorage.getItem("token");
  if (!token) return window.location = "/login.html";

  const res = await fetch("/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return res;
}

async function loadMyProfile() {
  const res = await api("/freshers/me");
  if (!res || !res.ok) return;

  const data = await res.json();
  if (!data.fresher) return;

  const f = data.fresher;

  document.getElementById("name").value = f.name || "";
  document.getElementById("email").value = f.email || "";
  document.getElementById("phone").value = f.phone || "";
  document.getElementById("location").value = f.location || "";
  document.getElementById("headline").value = f.headline || "";
  document.getElementById("skills").value = (f.skills || []).join(",");
  document.getElementById("education").value = f.education || "";
  document.getElementById("projects").value = f.projects || "";
  document.getElementById("github").value = f.github || "";
  document.getElementById("linkedin").value = f.linkedin || "";
  document.getElementById("resumeLink").value = f.resumeLink || "";
  document.getElementById("about").value = f.about || "";
}

document.addEventListener("DOMContentLoaded", () => {
  loadMyProfile();

  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      location: document.getElementById("location").value.trim(),
      headline: document.getElementById("headline").value.trim(),
      skills: document.getElementById("skills").value.trim(),
      education: document.getElementById("education").value.trim(),
      projects: document.getElementById("projects").value.trim(),
      github: document.getElementById("github").value.trim(),
      linkedin: document.getElementById("linkedin").value.trim(),
      resumeLink: document.getElementById("resumeLink").value.trim(),
      about: document.getElementById("about").value.trim()
    };

    const res = await api("/freshers", "POST", body);
    const data = await res.json();

    if (res.ok) {
      alert("Profile Saved ✔");
    } else {
      alert(data.message || "Error saving profile");
    }
  });
});
