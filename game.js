(() => {
  "use strict";

  const CODE = "BCBDAA";
  const STORAGE_KEY = "flemingMoldyDishEscapeV2";
  const order = ["observation", "question", "hypothesis", "experiment", "results", "conclusion"];
  const letters = { observation: "B", question: "C", hypothesis: "B", experiment: "D", results: "A", conclusion: "A" };

  const puzzles = {
    observation: {
      number: 1,
      step: "OBSERVATION",
      title: "What did Fleming observe?",
      prompt: "Fleming examines the contaminated bacterial culture plate. Which observation best describes what he sees?",
      hint: "Choose the statement that describes what is happening on the culture plate, without making a claim about treatment, resistance, or cause.",
      correct: ["B"],
      choices: [
        ["A", "The mold definitely produces an antibiotic that can treat every bacterial infection."],
        ["B", "Bacterial growth is reduced in the area surrounding the mold."],
        ["C", "All bacteria on the plate have become resistant to the mold."],
        ["D", "The mold and bacteria grow equally well everywhere on the plate."]
      ],
      explanation: "Reduced bacterial growth around the mold is the observation. The observation alone does not explain why growth is reduced."
    },
    question: {
      number: 2,
      step: "SCIENTIFIC QUESTION",
      title: "Ask the scientific question",
      prompt: "Fleming needs a question that can be investigated scientifically. Which is the best choice?",
      hint: "A scientific question can be investigated with evidence. Choose one that asks about the mold and bacterial growth on the culture plate.",
      correct: ["C"],
      choices: [
        ["A", "Is mold always harmful?"],
        ["B", "Why is nature interesting?"],
        ["C", "Does the mold inhibit the growth of the bacteria on the culture plate?"],
        ["D", "Will penicillin cure every disease in humans?"]
      ],
      explanation: "This question is focused on a measurable effect of the mold on bacterial growth on the plate."
    },
    hypothesis: {
      number: 3,
      step: "HYPOTHESIS",
      title: "Propose an explanation",
      prompt: "Fleming proposes a possible explanation for the lack of bacterial growth near the mold. Which hypothesis is most appropriate?",
      hint: "Choose a possible explanation that can be tested. Avoid general statements and answers that assume the result or name a famous antibiotic without evidence.",
      correct: ["B"],
      choices: [
        ["A", "Mold is always better at growing than bacteria."],
        ["B", "If the mold produces a substance that inhibits the bacteria, then bacterial growth will be reduced near the mold."],
        ["C", "The bacteria disappeared because all bacteria die naturally after a few days."],
        ["D", "Penicillin must be the answer because it is a famous antibiotic."]
      ],
      explanation: "This is a possible, testable explanation for why bacterial growth is reduced near the mold."
    },
    experiment: {
      number: 4,
      step: "EXPERIMENT",
      title: "Design a fair test",
      prompt: "Fleming's team wants to test whether the mold inhibits bacterial growth. Which features should be kept the same when comparing experimental plates? Select all that apply.",
      hint: "Keep the starting bacteria, growth medium, and incubation conditions consistent. The plate's mold or mold product is the factor being tested, so that condition should vary.",
      correct: ["A", "B", "D"],
      multiSelect: true,
      choices: [
        ["A", "The starting amount of bacteria"],
        ["B", "The type of growth medium"],
        ["C", "Whether the plate receives the mold or its tested product"],
        ["D", "The incubation conditions"]
      ],
      explanation: "A, B, and D should be kept the same: the starting amount of bacteria, growth medium, and incubation conditions. C is the factor the team is testing, so it should vary. Record D—the last letter in the correct set—as the archive letter for Lock 4."
    },
    results: {
      number: 5,
      step: "RESULTS AND ANALYSIS",
      title: "Analyze the evidence",
      prompt: "Imagine that a follow-up experiment produces these results. Which interpretation is best supported by the data?",
      hint: "Compare the two conditions as stated. Choose the interpretation that describes the evidence without making claims about every bacterium or treating people.",
      correct: ["A"],
      extra: '<div class="data-table-wrap"><table class="data-table"><caption>Follow-up experiment results</caption><thead><tr><th scope="col">Experimental condition</th><th scope="col">Bacterial growth</th></tr></thead><tbody><tr><th scope="row">Bacteria grown without mold product</th><td>Heavy growth</td></tr><tr><th scope="row">Bacteria grown with mold product</th><td>Little or no growth near the tested substance</td></tr></tbody></table></div>',
      choices: [
        ["A", "Under the tested conditions, the mold product inhibited bacterial growth."],
        ["B", "The mold product kills every kind of bacterium."],
        ["C", "The mold product is safe for humans because it inhibits bacteria."],
        ["D", "The experiment proves that the mold product will cure infections."]
      ],
      explanation: "The data support inhibition of bacterial growth under the conditions tested. They do not show that every kind of bacterium is affected, establish safety for people, or prove that the product cures infections."
    },
    conclusion: {
      number: 6,
      step: "CONCLUSION",
      title: "Draw a conclusion",
      prompt: "The results support Fleming's idea that the mold produces something that inhibits bacterial growth. What is the best conclusion?",
      hint: "A conclusion should reflect what the results support and identify what still needs to be studied. It should not overstate the evidence.",
      correct: ["A"],
      choices: [
        ["A", "The results support the hypothesis, and further experiments are needed to identify and study the substance."],
        ["B", "The hypothesis is now a scientific law."],
        ["C", "No additional research is needed because the results prove the substance is a medicine."],
        ["D", "The results prove that all molds produce penicillin."]
      ],
      explanation: "The conclusion reflects the evidence while recognizing that identifying and studying the substance requires further experiments."
    }
  };

  const dialog = document.getElementById("puzzle-dialog");
  const briefingDialog = document.getElementById("briefing-dialog");
  const briefingButton = document.getElementById("briefing-button");
  const briefingTitle = document.getElementById("briefing-title");
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
      const checked = state.solved[currentPuzzle] && puzzle.correct.includes(letter) ? " checked" : "";
      const disabled = state.solved[currentPuzzle] ? " disabled" : "";
      const type = puzzle.multiSelect ? "checkbox" : "radio";
      return `<label class="answer-option" for="${id}"><input id="${id}" type="${type}" name="answer" value="${letter}"${checked}${disabled}><span><strong>${letter}.</strong> ${escapeText(text)}</span></label>`;
    }).join("");
    const legend = puzzle.multiSelect ? "Select all that apply" : "Choose one answer";
    return `${puzzle.extra || ""}<fieldset class="answer-set"><legend>${legend}</legend>${options}</fieldset>`;
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
      puzzleBody.innerHTML = `<div class="ending-card"><div class="ending-symbol" aria-hidden="true">✓</div><h3>Evidence recovered</h3><p>Your code: <strong class="ending-code">${CODE}</strong></p><p>The results support Fleming’s idea that the mold produces something that inhibits bacterial growth. Further experiments are needed to identify and study the substance.</p><p><strong>Important historical note:</strong> Fleming’s 1928 observation involved a mold later identified as <em>Penicillium</em> and a bacterial culture in which growth was inhibited around the mold. His observation was an important starting point, but developing penicillin into a practical medicine required further research by other scientists, including Howard Florey and Ernst Chain.</p><p><strong>Debrief:</strong> Why is an observation alone not enough to establish a scientific explanation? Consider testing hypotheses, controlling variables, collecting evidence, and repeating experiments.</p></div>`;
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
    const puzzle = puzzles[currentPuzzle];
    const selected = [...puzzleForm.querySelectorAll('input[name="answer"]:checked')].map((input) => input.value).sort();
    const correct = puzzle.correct.slice().sort();
    if (!selected.length) {
      feedback.textContent = "Select an answer before checking the lock.";
      feedback.className = "feedback is-error";
      return;
    }
    if (selected.length === correct.length && selected.every((value, index) => value === correct[index])) {
      state.solved[currentPuzzle] = true;
      saveState();
      updateProgress();
      feedback.textContent = puzzle.multiSelect
        ? `Correct. You selected ${puzzle.correct.join(", ")}. Record ${letters[currentPuzzle]} for Lock ${String(puzzle.number).padStart(2, "0")}. ${puzzle.explanation}`
        : `Correct. Record ${letters[currentPuzzle]} for Lock ${String(puzzle.number).padStart(2, "0")}. ${puzzle.explanation}`;
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

  briefingButton.addEventListener("click", () => {
    briefingDialog.showModal();
    briefingTitle.focus();
  });
  document.getElementById("close-briefing-icon").addEventListener("click", () => briefingDialog.close());
  document.getElementById("close-briefing").addEventListener("click", () => briefingDialog.close());
  briefingDialog.addEventListener("click", (event) => {
    if (event.target === briefingDialog) briefingDialog.close();
  });
  briefingDialog.addEventListener("close", () => briefingButton.focus());

  document.getElementById("reset-button").addEventListener("click", () => {
    if (!window.confirm("Reset all six locks and clear the saved progress in this browser?")) return;
    state = emptyState();
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* Continue with the in-memory reset. */ }
    updateProgress();
    showToast("Progress reset. Start again with Lock 01.");
  });

  updateProgress();
})();
