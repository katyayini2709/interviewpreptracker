const API_URL = "http://localhost:5000/api";
document.addEventListener("DOMContentLoaded", function () {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  // Welcome text
  const welcomeText = document.getElementById("welcomeText");
  if (welcomeText) {
    welcomeText.innerText = "Welcome, " + currentUser.name;
  }

  loadDashboard();
});

// ================= LOAD DASHBOARD =================
async function loadDashboard() {
  const currentUser = getCurrentUser();

  try {
    const res = await fetch(`${API_URL}/questions/${currentUser.id}`);
    const questions = await res.json();

    displayStats(questions);
    displayQuestions(questions);

  } catch (err) {
    alert("Failed to load dashboard");
  }
}

// ================= STATS =================
function displayStats(questions) {
  const total = questions.length;
  const completed = questions.filter(q => q.completed).length;
  const pending = total - completed;

  document.getElementById("totalCount").innerText = total;
  document.getElementById("completedCount").innerText = completed;
  document.getElementById("pendingCount").innerText = pending;

  const progress = total === 0 ? 0 : (completed / total) * 100;
  document.getElementById("progressFill").style.width = progress + "%";
  document.getElementById("progressText").innerText =
    progress.toFixed(1) + "% Completed";
}

// ================= DISPLAY QUESTIONS =================
function displayQuestions(questions) {
  const list = document.getElementById("questionList");
  list.innerHTML = "";

  if (questions.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>No Questions Found</h3>
        <p>Add questions to start tracking your preparation.</p>
      </div>
    `;
    return;
  }

  questions.forEach((q) => {
    const card = document.createElement("div");
    card.className = "question-card";

    card.innerHTML = `
      <h4>${q.question}</h4>
      <span class="badge ${q.difficulty.toLowerCase()}">
        ${q.difficulty}
      </span>

      <div class="question-meta">
        Company: ${q.company} | Subject: ${q.subject}
      </div>

      <div class="question-actions">
        <button onclick="toggleComplete('${q.id}')">
          ${q.completed ? "Mark Pending" : "Mark Complete"}
        </button>
        <button onclick="deleteQuestion('${q.id}')">Delete</button>
      </div>
    `;

    if (q.completed) {
      card.style.opacity = "0.6";
    }

    list.appendChild(card);
  });
}

// ================= TOGGLE =================
async function toggleComplete(id) {
  try {
    await fetch(`${API_URL}/questions/${id}/toggle`, {
      method: "PUT",
    });

    loadDashboard();

  } catch (err) {
    alert("Failed to update");
  }
}

// ================= DELETE =================
async function deleteQuestion(id) {
  if (!confirm("Are you sure you want to delete this question?")) return;

  try {
    await fetch(`${API_URL}/questions/${id}`, {
      method: "DELETE",
    });

    loadDashboard();

  } catch (err) {
    alert("Failed to delete");
  }
}