(() => {
  "use strict";

  const CODE = "BCBCAA";
  const STORAGE_KEY = "flemingMoldyDishEscapeV1";
  const order = ["observation", "question", "hypothesis", "experiment", "results", "conclusion"];
  const letters = { observation: "B", question: "C", hypothesis: "B", experiment: "C", results: "A", conclusion: "A" };

  const puzzles = {
    observation: {
      number: 1,
      step: "OBSERVATION",
      title: "What can you observe?",
      prompt: "Fleming returns to a bacterial culture plate and notices a mold colony. Which statement describes visible evidence without adding an explanation?",
      hint: "An observation reports what is seen or measured. Avoid claims about what caused the pattern or what it could do in a patient.",
      choices: [
        ["A", "The mold released penicillin and killed the bacteria."],
        ["B", "A clear area surrounds the mold colony; bacterial colonies are visible farther away."],
        ["C", "The mold can be used to treat infections in people."],
        ["D", "The bacteria changed their genes to resist the mold."]
      ],
      explanation: "The clear area and the colonies farther away describe a visible pattern. They do not yet explain its cause."
    },
    question: {
      number: 2,
      step: "QUESTION",
      title: "Ask a testable question",
      prompt: "The team wants to test whether material from the mold culture affects bacterial growth. Which question is specific and measurable?",
      hint: "Look for a question that compares two conditions and names an outcome the team can measure.",
      choices: [
        ["A", "Is mold always helpful?"],
        ["B", "Why is nature interesting?"],
        ["C", "Under matched lab conditions, does filtered liquid from a mold culture reduce bacterial growth compared with processed mold-free broth?"],
        ["D", "Will mold cure every bacterial infection?"]
      ],
      explanation: "This question names the material being tested, a comparison condition, and a measurable outcome: bacterial growth."
    },
    hypothesis: {
      number: 3,
      step: "HYPOTHESIS",
      title: "Propose an explanation",
      prompt: "Which hypothesis gives a testable explanation and a measurable prediction?",
      hint: "A useful hypothesis links a possible cause to a predicted result that could support or challenge the idea.",
      choices: [
        ["A", "Mold often grows where bacteria also grow."],
        ["B", "If a growth-inhibiting factor is present in liquid from the mold culture, then bacteria exposed to its filtered liquid will show a larger average clear zone than bacteria exposed to processed mold-free broth, because the factor reduces bacterial growth."],
        ["C", "All bacteria can be killed by medicine."],
        ["D", "The substance must be penicillin because penicillin is famous."]
      ],
      explanation: "The hypothesis proposes a possible factor and predicts a measurable difference between the treatment and control."
    },
    experiment: {
      number: 4,
      step: "EXPERIMENT",
      title: "Choose a fair test",
      prompt: "The team compares filtered liquid from the mold culture with processed broth that never contained mold. Which design best tests the hypothesis fairly?",
      hint: "Keep conditions the same, use a control, repeat the comparison, and change only the source of the liquid applied to the plates.",
      choices: [
        ["A", "Use a different amount of bacteria on each plate and incubate them for different lengths of time."],
        ["B", "Use different bacterial species and different agar for the two liquids."],
        ["C", "Use replicate plates with the same bacterial strain and starting amount; apply equal volumes of filtered mold-culture liquid or identically processed mold-free broth; keep the agar, disks, and incubation conditions the same; then measure clear-zone diameters."],
        ["D", "Place mold directly on every plate and change the incubation time until a clear area appears."]
      ],
      explanation: "The liquid source is the independent variable. Clear-zone diameter is the dependent variable. Processed mold-free broth is the negative control. The bacterial strain and amount, agar, disks, liquid volume, and incubation conditions are held constant. Replicate plates help show whether the pattern is consistent."
    },
    results: {
      number: 5,
      step: "RESULTS AND ANALYSIS",
      title: "Analyze the evidence",
      prompt: "These fictional teaching results come from a follow-up test. Which interpretation is best supported?",
      hint: "Find the mean for the three treatment measurements: add them, then divide by three. A clear zone shows reduced visible growth around the substance; it does not by itself show that all cells were killed.",
      extra: '<div class="data-table-wrap"><table class="data-table"><caption>Fictional follow-up data — clear-zone diameter</caption><thead><tr><th scope="col">Condition</th><th scope="col">Replicate 1</th><th scope="col">Replicate 2</th><th scope="col">Replicate 3</th></tr></thead><tbody><tr><th scope="row">Filtered mold-culture liquid</th><td>12 mm</td><td>14 mm</td><td>13 mm</td></tr><tr><th scope="row">Processed mold-free broth</th><td>0 mm</td><td>0 mm</td><td>0 mm</td></tr></tbody></table></div>',
      choices: [
        ["A", "The mean clear zone is 13 mm with mold-culture liquid and 0 mm with the control, supporting reduced bacterial growth around the tested liquid."],
        ["B", "The mean is 39 mm, so the liquid destroyed every bacterial cell."],
        ["C", "The results prove that the liquid cures bacterial infections."],
        ["D", "Every mold must produce a substance that works against all bacteria."]
      ],
      explanation: "The mold-culture liquid has a mean clear-zone diameter of 13 mm; the control mean is 0 mm. This supports reduced visible growth under the tested conditions. The data do not establish that cells were killed, identify the active substance, or show that it treats infections."
    },
    conclusion: {
      number: 6,
      step: "CONCLUSION",
      title: "Draw a supported conclusion",
      prompt: "The results support the prediction that filtered liquid from this mold culture reduces visible bacterial growth in the test. Which conclusion stays within the evidence?",
      hint: "Connect the conclusion to the specific organism, material, outcome, and conditions tested. Leave broader claims for future studies.",
      choices: [
        ["A", "Under the tested conditions, filtered liquid from this mold culture reduced visible growth of this bacterial culture compared with the control. Further tests are needed to identify the cause and investigate broader uses."],
        ["B", "Fleming proved a scientific law that explains all bacterial growth."],
        ["C", "Every mold produces an antibiotic that works on all bacteria."],
        ["D", "The liquid is a safe and effective medicine for patients."]
      ],
      explanation: "This conclusion matches the tested material, bacterial culture, comparison, and outcome. Identifying the substance and establishing medical use would require much more evidence."
    }
  };

  const dialog = document.getElementById("puzzle-dialog");
  const dialogKicker = document.getElementById("dialog-kicker");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogPrompt = document.getElementById("dialog-prompt");
  const puzzleBody = document.getElementById("puzzle-body");
  const puzzleForm = document.getElementById("puzzle-form");
  const hintButton = document.getElementById("hint-button");
  const hintText = document.getElementById("hint-text");
  const feedback = document.getElementById("feedback");
  const checkButton = document.getElementById("check-button");
  const closeButton = document.getElementById("close-dialog");
  const cancelButton = document.getElementById("cancel-button");
  const toast = document.getElementById("toast");
  const archiveStatus = document.querySelector(".status-light");
  let state = loadState();
  let currentPuzzle = null;
  let lastTrigger = null;
  let toastTimer = null;

  function emptyState() {
    return { solved: Object.fromEntries(order.map((key) => [key, false])), completed: false };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return emptyState();
      const clean = emptyState();
      for (const key of order) clean.solved[key] = Boolean(saved.solved && saved.solved[key]);
      clean.completed = Boolean(saved.completed);
      return clean;
    } catch (_) {
      return emptyState();
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* Progress still works for this visit. */ }
  }

  function solvedCount() {
    return order.filter((key) => state.solved[key]).length;
  }

  function updateProgress() {
    const count = solvedCount();
    document.getElementById("progress-label").textContent = `${count} OF 6 LOCKS OPEN`;
    document.getElementById("progress-count").textContent = `${count} / 6`;
    document.getElementById("progress-bar").value = count;
    for (const key of order) {
      const item = document.querySelector(`[data-clue="${key}"]`);
      const button = document.querySelector(`[data-object="${key}"]`);
      if (item) {
        item.classList.toggle("is-solved", state.solved[key]);
        item.querySelector(".clue-letter").textContent = state.solved[key] ? letters[key] : "—";
      }
      if (button) {
        if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.getAttribute("aria-label");
        button.classList.toggle("is-solved", state.solved[key]);
        button.setAttribute("aria-label", state.solved[key] ? `${button.dataset.defaultLabel} (unlocked)` : button.dataset.defaultLabel);
      }
    }
    archiveStatus.style.background = count === 6 ? "#9db08b" : "#c97960";
    archiveStatus.style.boxShadow = count === 6 ? "0 0 10px rgba(157, 176, 139, .7)" : "0 0 10px rgba(201, 121, 96, .7)";
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function renderChoices(puzzle) {
    const options = puzzle.choices.map(([letter, text], index) => {
      const id = `answer-${puzzle.number}-${letter}`;
      const checked = state.solved[currentPuzzle] && letter === letters[currentPuzzle] ? " checked" : "";
      const disabled = state.solved[currentPuzzle] ? " disabled" : "";
      return `<label class="answer-option" for="${id}"><input id="${id}" type="radio" name="answer" value="${letter}"${checked}${disabled}><span><strong>${letter}.</strong> ${escapeText(text)}</span></label>`;
    }).join("");
    return `${puzzle.extra || ""}<fieldset class="answer-set"><legend>Choose one answer</legend>${options}</fieldset>`;
  }

  function openPuzzle(key, trigger) {
    const puzzle = puzzles[key];
    if (!puzzle) return;
    const index = order.indexOf(key);
    const requiredPrevious = order.slice(0, index).find((prior) => !state.solved[prior]);
    if (requiredPrevious) {
      const nextNum = String(order.indexOf(requiredPrevious) + 1).padStart(2, "0");
      showToast(`Complete Lock ${nextNum} first to follow the investigation.`);
      return;
    }
    lastTrigger = trigger;
    currentPuzzle = key;
    dialogKicker.textContent = `LOCK ${String(puzzle.number).padStart(2, "0")} / ${puzzle.step}`;
    dialogTitle.textContent = puzzle.title;
    dialogPrompt.textContent = puzzle.prompt;
    puzzleBody.innerHTML = renderChoices(puzzle);
    hintText.textContent = puzzle.hint;
    hintText.hidden = true;
    hintButton.setAttribute("aria-expanded", "false");
    feedback.textContent = state.solved[key] ? `Lock already open. Your recovered letter is ${letters[key]}. ${puzzle.explanation}` : "";
    feedback.className = state.solved[key] ? "feedback is-success" : "feedback";
    checkButton.hidden = state.solved[key];
    checkButton.disabled = state.solved[key];
    dialog.showModal();
    dialogTitle.focus();
  }

  function openArchive(trigger) {
    if (solvedCount() < 6) {
      const nextIndex = order.findIndex((key) => !state.solved[key]);
      const nextNum = String(nextIndex + 1).padStart(2, "0");
      showToast(`The archive is sealed. Open Lock ${nextNum} first.`);
      return;
    }
    lastTrigger = trigger;
    currentPuzzle = "archive";
    dialogKicker.textContent = "FINAL ARCHIVE / MASTER CODE";
    dialogTitle.textContent = state.completed ? "Case file recovered" : "Enter the archive code";
    dialogPrompt.textContent = state.completed
      ? "The archive is open. Review the evidence summary below."
      : "Arrange the six recovered letters in scientific-method order, then enter the code to open Fleming’s lab archive.";
    hintText.hidden = true;
    hintButton.setAttribute("aria-expanded", "false");
    feedback.textContent = "";
    feedback.className = "feedback";
    checkButton.hidden = true;
    checkButton.disabled = true;
    if (state.completed) {
      puzzleBody.innerHTML = `<div class="ending-card"><div class="ending-symbol" aria-hidden="true">✓</div><h3>Evidence recovered</h3><p>Your code: <strong class="ending-code">${CODE}</strong></p><p>The observation led to a test. The results support limited inhibition under these conditions, but they do not identify the active substance or establish medical use.</p><p>Historical note: Fleming’s 1928 observation was an important starting point. Developing penicillin into a practical medicine required substantial further work by other scientists, including Howard Florey and Ernst Chain.</p></div>`;
    } else {
      puzzleBody.innerHTML = `<div class="system-restored"><span class="restore-symbol" aria-hidden="true">↗</span><p>Six locks open. The research notes are ready for the final code.</p><strong aria-hidden="true">6/6</strong></div><div class="keypad-form" id="keypad-form" role="group" aria-label="Archive code"><label class="visually-hidden" for="keypad-input">Six-letter archive code</label><input class="keypad-input" id="keypad-input" name="code" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="6" aria-describedby="keypad-feedback" placeholder="______"><button class="button button-primary" id="keypad-submit" type="button">Unlock archive <span aria-hidden="true">→</span></button></div><p class="keypad-feedback" id="keypad-feedback" aria-live="polite"></p><p class="completion-note">Enter one letter from each lock, in order. The final note distinguishes the historical observation from the fictional follow-up data in this activity.</p>`;
      window.setTimeout(() => document.getElementById("keypad-input")?.focus(), 30);
      const submitCode = () => {
        const input = document.getElementById("keypad-input");
        const message = document.getElementById("keypad-feedback");
        if ((input.value || "").replace(/\s+/g, "").toUpperCase() === CODE) {
          state.completed = true;
          saveState();
          message.textContent = "Code accepted. The archive is open.";
          message.style.color = "#d8e4c7";
          window.setTimeout(() => { dialog.close(); openArchive(trigger); }, 350);
        } else {
          message.textContent = "That code does not match the recovered letters. Check the six locks in order and try again.";
          message.style.color = "#f0c3b1";
          input.select();
        }
      };
      document.getElementById("keypad-submit").addEventListener("click", submitCode);
      document.getElementById("keypad-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") { event.preventDefault(); submitCode(); }
      });
    }
    dialog.showModal();
    dialogTitle.focus();
  }

  document.querySelectorAll(".hotspot").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.object;
      if (key === "archive") openArchive(button);
      else openPuzzle(key, button);
    });
  });

  puzzleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentPuzzle || !puzzles[currentPuzzle] || state.solved[currentPuzzle]) return;
    const selected = puzzleForm.querySelector('input[name="answer"]:checked');
    if (!selected) {
      feedback.textContent = "Select an answer before checking the lock.";
      feedback.className = "feedback is-error";
      return;
    }
    if (selected.value === letters[currentPuzzle]) {
      state.solved[currentPuzzle] = true;
      saveState();
      updateProgress();
      feedback.textContent = `Correct. Record ${letters[currentPuzzle]} for Lock ${String(puzzles[currentPuzzle].number).padStart(2, "0")}. ${puzzles[currentPuzzle].explanation}`;
      feedback.className = "feedback is-success";
      checkButton.hidden = true;
      checkButton.disabled = true;
      puzzleBody.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    } else {
      feedback.textContent = "That answer does not fit the evidence yet. Review the choices or open a hint, then try again.";
      feedback.className = "feedback is-error";
    }
  });

  hintButton.addEventListener("click", () => {
    hintText.hidden = !hintText.hidden;
    hintButton.setAttribute("aria-expanded", String(!hintText.hidden));
  });

  function closeDialog() {
    dialog.close();
  }
  closeButton.addEventListener("click", closeDialog);
  cancelButton.addEventListener("click", closeDialog);
  dialog.addEventListener("close", () => {
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  document.getElementById("reset-button").addEventListener("click", () => {
    if (!window.confirm("Reset all six locks and clear the saved progress in this browser?")) return;
    state = emptyState();
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* Continue with the in-memory reset. */ }
    updateProgress();
    showToast("Progress reset. Start again with Lock 01.");
  });

  updateProgress();
})();
