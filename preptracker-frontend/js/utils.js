// ================= CURRENT USER =================
function setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// ================= ROUTE PROTECTION =================
function requireLogin() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "index.html";
    }
    return user;
}