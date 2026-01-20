const API_URL = "http://localhost:3000";

/* SIGNUP */
function signup() {
  const name = document.getElementById("name").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    document.getElementById("signup-error").innerText = "Passwords do not match";
    return;
  }

  fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = "login.html";
      } else {
        document.getElementById("signup-error").innerText = data.message;
      }
    });
}

/* LOGIN */
function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", username);

        window.location.href = "main.html";
      } else {
        document.getElementById("login-error").innerText = "Invalid credentials";
      }
    });
}
