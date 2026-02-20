const loginCard = document.getElementById("loginCard");
const submissionsCard = document.getElementById("submissionsCard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const submissionsList = document.getElementById("submissionsList");
const logoutButton = document.getElementById("logoutButton");

function renderSubmission(submission) {
  const card = document.createElement("article");
  card.className = "rounded-2xl border border-gold/30 bg-midnight/45 p-4";
  if (submission.lookedAt) {
    card.classList.add("opacity-80");
  }

  const fields = [
    ["Submitted", new Date(submission.submittedAt).toLocaleString()],
    ["Status", submission.lookedAt ? "Looked at" : "New"],
    ["Name", `${submission.firstName} ${submission.lastName}`.trim()],
    ["Email", submission.email],
    ["Birth place", submission.birthPlace],
    ["Birth date", submission.birthDate],
    ["Birth time", submission.birthTime],
    ["Personal Power", submission.personalPower],
    ["Fragmented areas", submission.fragmentedAreas],
    ["Fully yourself moment", submission.fullyYourselfMoment],
    ["Alignment investment", submission.alignmentInvestment],
    ["Aligned, seen, supported", submission.alignedSeenSupported],
    ["Witnessed true self", submission.witnessedTrueSelf],
    ["First call preference", submission.firstCallPreference],
    ["First call preference (other)", submission.firstCallPreferenceOther]
  ];

  fields.forEach(([label, value]) => {
    const row = document.createElement("p");
    row.className = "mb-2";

    const labelSpan = document.createElement("span");
    labelSpan.className = "text-gold";
    labelSpan.textContent = `${label}:`;

    row.appendChild(labelSpan);
    row.append(` ${value || "-"}`);
    card.appendChild(row);
  });

  const actions = document.createElement("div");
  actions.className = "mt-4 flex flex-wrap gap-2";

  const lookedAtButton = document.createElement("button");
  lookedAtButton.type = "button";
  lookedAtButton.className =
    "rounded-full border border-gold/60 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gold transition hover:bg-gold/15";
  lookedAtButton.textContent = submission.lookedAt ? "Mark Unseen" : "Mark Looked At";
  lookedAtButton.addEventListener("click", async () => {
    await fetch(`/api/admin/submissions/${submission.id}/looked-at`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ lookedAt: !submission.lookedAt })
    });
    await loadSubmissions();
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className =
    "rounded-full border border-red-300/70 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-200 transition hover:bg-red-300/10";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    const isConfirmed = window.confirm("Delete this submission permanently?");
    if (!isConfirmed) {
      return;
    }

    await fetch(`/api/admin/submissions/${submission.id}`, {
      method: "DELETE"
    });
    await loadSubmissions();
  });

  actions.appendChild(lookedAtButton);
  actions.appendChild(deleteButton);
  card.appendChild(actions);

  return card;
}

async function loadSubmissions() {
  const response = await fetch("/api/admin/submissions", { credentials: "same-origin" });
  if (response.status === 401) {
    loginCard.classList.remove("hidden");
    submissionsCard.classList.add("hidden");
    return false;
  }

  if (!response.ok) {
    throw new Error("Could not load submissions");
  }

  const data = await response.json();
  submissionsList.innerHTML = "";

  if (!data.submissions.length) {
    submissionsList.innerHTML = '<p class="text-cream/85">No submissions yet.</p>';
  } else {
    data.submissions.forEach((submission) => {
      submissionsList.appendChild(renderSubmission(submission));
    });
  }

  loginCard.classList.add("hidden");
  submissionsCard.classList.remove("hidden");
  return true;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.classList.add("hidden");

  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  const response = await fetch("/admin/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    loginError.textContent = "Login failed. Check credentials.";
    loginError.classList.remove("hidden");
    return;
  }

  loginForm.reset();
  const isAuthorized = await loadSubmissions();
  if (!isAuthorized) {
    loginError.textContent = "Login succeeded, but session was not established. Use HTTPS and verify server env vars.";
    loginError.classList.remove("hidden");
  }
});

logoutButton.addEventListener("click", async () => {
  await fetch("/admin/logout", { method: "POST" });
  submissionsCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
});

loadSubmissions().catch(() => {
  loginCard.classList.remove("hidden");
  submissionsCard.classList.add("hidden");
});
