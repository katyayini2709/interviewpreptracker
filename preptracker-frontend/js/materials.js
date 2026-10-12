const API_URL = "http://localhost:5000/api";
document.addEventListener("DOMContentLoaded", function () {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    loadMaterials();
});

// ===== LOAD =====
async function loadMaterials() {
    const currentUser = getCurrentUser();

    try {
        const res = await fetch(`${API_URL}/materials/${currentUser.id}`);
        const materials = await res.json();

        const list = document.getElementById("materialsList");
        list.innerHTML = "";

        if (materials.length === 0) {
            list.innerHTML = "<p style='text-align:center'>No materials added yet</p>";
            return;
        }

        materials.forEach((m) => {
            const li = document.createElement("li");

            li.innerHTML = `
                <a href="${m.link}" target="_blank">${m.title}</a>
                <button onclick="deleteMaterial('${m.id}')">Delete</button>
            `;

            list.appendChild(li);
        });

    } catch (err) {
        alert("Failed to load materials");
    }
}

// ===== ADD =====
async function addMaterial() {
    const currentUser = getCurrentUser();

    const title = document.getElementById("materialTitle").value.trim();
    const link = document.getElementById("materialLink").value.trim();

    if (!title || !link) {
        alert("Please fill all fields");
        return;
    }

    try {
        await fetch(`${API_URL}/materials`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: currentUser.id,
                title,
                link
            }),
        });

        document.getElementById("materialTitle").value = "";
        document.getElementById("materialLink").value = "";

        loadMaterials();

    } catch (err) {
        alert("Failed to add material");
    }
}

// ===== DELETE =====
async function deleteMaterial(id) {
    if (!confirm("Delete this material?")) return;

    try {
        await fetch(`${API_URL}/materials/${id}`, {
            method: "DELETE",
        });

        loadMaterials();

    } catch (err) {
        alert("Failed to delete");
    }
}