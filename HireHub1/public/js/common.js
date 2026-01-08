async function loadCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return window.location = "/login.html";
  const res = await fetch("/auth/me", { headers: { "Authorization": "Bearer " + token }});
  if (!res.ok) { localStorage.removeItem("token"); return window.location = "/login.html"; }
  const user = await res.json();
  document.getElementById("whoami").innerText = user.username + " (" + user.role + ")";
  const roleDash = document.getElementById("roleDash");
  if (roleDash) roleDash.href = user.role === "fresher" ? "/fresher.html" : "/employer.html";
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location = "/login.html";
  });
}
loadCurrentUser();
