const API_URL = "http://localhost:5000/api";
document.addEventListener("DOMContentLoaded", function () {
  const currentUser = getCurrentUser();

  // LOGIN CHECK
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById("questionForm");
  if (form) {
    form.addEventListener("submit", saveQuestion);
  }
});

// ===== SAVE QUESTION =====
async function saveQuestion(e) {
  e.preventDefault();

  const currentUser = getCurrentUser();

  const question = document.getElementById("questionText").value.trim();
  const company = document.getElementById("company").value.trim();
  const subject = document.getElementById("subject").value;
  const difficulty = document.getElementById("difficulty").value;

  if (!question || !company || !subject || !difficulty) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        question,
        company,
        subject,
        difficulty,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add question");
      return;
    }

    alert("Question added successfully!");
    window.location.href = "dashboard.html";

  } catch (err) {
    alert("Server error");
  }
}