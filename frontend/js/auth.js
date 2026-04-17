const API = "https://todo-app-xn6y.onrender.com";

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

  fetch(`${API}/signup`, {
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

let mfaEmail = ""; // To store email pending OTP

/* LOGIN */
function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (data.mfaRequired) {
          // Transition to OTP screen
          mfaEmail = data.email;
          document.getElementById("login-section").classList.add("hidden");
          document.getElementById("otp-section").classList.remove("hidden");
          document.getElementById("otp-error").innerText = "";
        } else {
          // Fallback if no MFA configured for some reason (backward compatibility)
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", username);
          window.location.href = "main.html";
        }
      } else {
        document.getElementById("login-error").innerText = data.message || "Invalid credentials";
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("login-error").innerText = "Server error occurred";
    });
}

/* VERIFY OTP */
function verifyOtp() {
  const otp = document.getElementById("otp-input").value;
  if (!otp || otp.length !== 6) {
    document.getElementById("otp-error").innerText = "Please enter a 6-digit code";
    return;
  }

  fetch(`${API}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: mfaEmail, otp })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        window.location.href = "main.html";
      } else {
        document.getElementById("otp-error").innerText = data.message || "Invalid OTP";
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("otp-error").innerText = "Server error occurred";
    });
}

/* RESEND OTP */
function resendOtp() {
  if (!mfaEmail) return;

  document.getElementById("otp-error").innerText = "Resending OTP...";
  document.getElementById("otp-error").classList.replace("text-red-500", "text-blue-500");

  fetch(`${API}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: mfaEmail })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("otp-error").innerText = "OTP Resent successfully!";
        document.getElementById("otp-error").classList.replace("text-blue-500", "text-emerald-500");
        setTimeout(() => {
            document.getElementById("otp-error").innerText = "";
            document.getElementById("otp-error").classList.replace("text-emerald-500", "text-red-500");
        }, 3000);
      } else {
        document.getElementById("otp-error").innerText = data.message || "Failed to resend";
        document.getElementById("otp-error").classList.replace("text-blue-500", "text-red-500");
      }
    })
    .catch(err => {
      document.getElementById("otp-error").innerText = "Server error occurred";
      document.getElementById("otp-error").classList.replace("text-blue-500", "text-red-500");
    });
}
