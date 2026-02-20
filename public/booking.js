const form = document.getElementById("bookingForm");
const stepCount = document.getElementById("stepCount");
const progressBar = document.getElementById("progressBar");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const submitButton = document.getElementById("submitButton");
const thankYou = document.getElementById("thankYou");
const otherPreference = document.getElementById("otherPreference");
const otherPreferenceText = document.getElementById("otherPreferenceText");

const steps = Array.from(document.querySelectorAll(".step"));
const totalSteps = steps.length;
let currentStep = 1;
const visitedSteps = new Set([1]);

function allStepsVisited() {
  return visitedSteps.size === totalSteps;
}

function updateStepView() {
  steps.forEach((step, index) => {
    const isActive = index + 1 === currentStep;
    step.classList.toggle("hidden", !isActive);
  });

  stepCount.textContent = `Step ${currentStep} of ${totalSteps}`;
  progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;

  backButton.disabled = currentStep === 1;
  backButton.classList.toggle("opacity-40", currentStep === 1);

  const lastStep = currentStep === totalSteps;
  nextButton.classList.toggle("hidden", lastStep);
  submitButton.classList.toggle("hidden", !lastStep);
}

function validateCurrentStep() {
  const activeStep = steps[currentStep - 1];
  const fields = Array.from(activeStep.querySelectorAll("input, textarea, select"));

  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  return true;
}

function updateOtherPreferenceVisibility() {
  const isOtherSelected = otherPreference.checked;
  otherPreferenceText.classList.toggle("hidden", !isOtherSelected);
  otherPreferenceText.required = isOtherSelected;
}

backButton.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep -= 1;
    updateStepView();
  }
});

nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) {
    return;
  }

  if (currentStep < totalSteps) {
    currentStep += 1;
    visitedSteps.add(currentStep);
    updateStepView();
  }
});

document.querySelectorAll('input[name="firstCallPreference"]').forEach((radio) => {
  radio.addEventListener("change", updateOtherPreferenceVisibility);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateCurrentStep()) {
    return;
  }

  if (!allStepsVisited()) {
    alert("Please visit each step before submitting.");
    return;
  }

  const isConfirmed = window.confirm("Are you sure you want to submit your questionnaire?");
  if (!isConfirmed) {
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Failed to submit your answers.");
    }

    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
  } catch (error) {
    alert("There was a problem submitting your form. Please try again.");
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
  }
});

form.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
    event.preventDefault();
  }
});

updateOtherPreferenceVisibility();
updateStepView();
