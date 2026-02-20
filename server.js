require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const session = require("express-session");

const app = express();
const port = process.env.PORT || 3000;
const dataDir = path.join(__dirname, "data");
const submissionsFile = path.join(dataDir, "submissions.json");

// Required for secure cookies to work correctly behind Render's proxy.
app.set("trust proxy", 1);

const adminUser = process.env.ADMIN_USERNAME || "owner";
const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password";


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.ADMIN_SESSION_SECRET || "replace-this-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);
app.use(express.static(path.join(__dirname, "public")));

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(submissionsFile);
  } catch {
    await fs.writeFile(submissionsFile, "[]", "utf-8");
  }
}

async function readSubmissions() {
  const file = await fs.readFile(submissionsFile, "utf-8");
  return JSON.parse(file);
}

async function writeSubmissions(submissions) {
  await fs.writeFile(submissionsFile, JSON.stringify(submissions, null, 2), "utf-8");
}

function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

function normalizeSubmission(body) {
  return {
    id: Date.now().toString(),
    submittedAt: new Date().toISOString(),
    lookedAt: false,
    firstName: (body.firstName || "").trim(),
    lastName: (body.lastName || "").trim(),
    email: (body.email || "").trim(),
    birthPlace: (body.birthPlace || "").trim(),
    birthDate: (body.birthDate || "").trim(),
    birthTime: (body.birthTime || "").trim(),
    personalPower: (body.personalPower || "").trim(),
    fragmentedAreas: (body.fragmentedAreas || "").trim(),
    fullyYourselfMoment: (body.fullyYourselfMoment || "").trim(),
    alignmentInvestment: (body.alignmentInvestment || "").trim(),
    alignedSeenSupported: (body.alignedSeenSupported || "").trim(),
    witnessedTrueSelf: (body.witnessedTrueSelf || "").trim(),
    firstCallPreference: (body.firstCallPreference || "").trim(),
    firstCallPreferenceOther: (body.firstCallPreferenceOther || "").trim()
  };
}

function findSubmissionIndex(submissions, id) {
  return submissions.findIndex((entry) => entry.id === id);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/booking", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "booking.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.post("/api/booking", async (req, res) => {
  const submission = normalizeSubmission(req.body || {});
  if (!submission.firstName || !submission.lastName || !submission.email) {
    return res.status(400).json({
      error: "First name, last name, and email are required."
    });
  }

  try {
    const submissions = await readSubmissions();
    submissions.unshift(submission);
    await writeSubmissions(submissions);
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not save submission." });
  }
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === adminUser && password === adminPassword) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/api/admin/submissions", requireAdmin, async (req, res) => {
  try {
    const submissions = await readSubmissions();
    return res.json({ submissions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not load submissions." });
  }
});

app.patch("/api/admin/submissions/:id/looked-at", requireAdmin, async (req, res) => {
  try {
    const submissions = await readSubmissions();
    const index = findSubmissionIndex(submissions, req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "Submission not found." });
    }

    submissions[index].lookedAt =
      req.body.lookedAt === true || req.body.lookedAt === "true";
    await writeSubmissions(submissions);
    return res.json({ ok: true, submission: submissions[index] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not update submission." });
  }
});

app.delete("/api/admin/submissions/:id", requireAdmin, async (req, res) => {
  try {
    const submissions = await readSubmissions();
    const index = findSubmissionIndex(submissions, req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "Submission not found." });
    }

    submissions.splice(index, 1);
    await writeSubmissions(submissions);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not delete submission." });
  }
});

ensureStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`SalgadoStudio site running on http://localhost:${port}`);
      if (adminPassword === "change-this-password") {
        console.warn("Set ADMIN_PASSWORD in environment before production use.");
      }
    });
  })
  .catch((err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });
