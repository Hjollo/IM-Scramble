let words = [];
let unusedWords = [];
let currentWord = null;
let score = 0;
let time = 0;
let timerInterval = null;

const scrambledWordEl = document.getElementById("scrambled-word");
const letterBoxesEl = document.getElementById("letter-boxes");
const messageEl = document.getElementById("message");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const guessInput = document.getElementById("guess-input");
const listContainer = document.getElementById("list-content");
const wordListBox = document.getElementById("word-list");

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    words = data;
    unusedWords = [...words];
    populateWordList();
    pickNewWord();
    guessInput.focus();
  });

function startTimer() {
  timerInterval = setInterval(() => {
    time++;
    timerEl.textContent = time;
  }, 1000);
}
startTimer();

function scramble(word) {
  return word.split(" ").map(part => part.split("").sort(() => Math.random() - 0.5).join("")).join(" ");
}

function pickNewWord() {
  if (unusedWords.length === 0) {
    scrambledWordEl.textContent = "FERDIG!";
    letterBoxesEl.innerHTML = "";
    guessInput.disabled = true;
    messageEl.textContent = "Alle ord er brukt.";
    return;
  }

  const index = Math.floor(Math.random() * unusedWords.length);
  currentWord = unusedWords.splice(index, 1)[0];

  const scrambled = scramble(currentWord.word);
  createScrambledWord(scrambled);
  createLetterBoxes(currentWord.word);

  guessInput.value = "";
  guessInput.disabled = false;
  messageEl.textContent = "";
  guessInput.focus();
}

function createScrambledWord(scrambled) {
  scrambledWordEl.innerHTML = "";
  for (let char of scrambled) {
    if (char === " ") {
      const space = document.createElement("div");
      space.style.width = "20px";
      scrambledWordEl.appendChild(space);
      continue;
    }
    const letterDiv = document.createElement("div");
    letterDiv.className = "scrambled-letter";
    letterDiv.textContent = char;
    letterDiv.draggable = true;

    letterDiv.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text", char);
    });

    letterDiv.addEventListener("mousedown", () => guessInput.focus());
    letterDiv.addEventListener("touchstart", () => guessInput.focus());

    scrambledWordEl.appendChild(letterDiv);
  }
}

function createLetterBoxes(word) {
  letterBoxesEl.innerHTML = "";

  const scrambledLetters = scrambledWordEl.querySelectorAll(".scrambled-letter");
  let letterWidth = 40;
  let letterHeight = 50;
  if (scrambledLetters.length > 0) {
    letterWidth = scrambledLetters[0].offsetWidth;
    letterHeight = scrambledLetters[0].offsetHeight;
  }

  for (let char of word) {
    if (char === " ") {
      const space = document.createElement("div");
      space.style.width = `${letterWidth}px`;
      letterBoxesEl.appendChild(space);
      continue;
    }
    const box = document.createElement("div");
    box.className = "letter-box";
    box.dataset.letter = char.toLowerCase();
    box.style.width = `${letterWidth}px`;
    box.style.height = `${letterHeight}px`;

    box.addEventListener("dragover", e => e.preventDefault());

    box.addEventListener("drop", e => {
      const letter = e.dataTransfer.getData("text").toLowerCase();
      box.textContent = letter;
      if (letter === box.dataset.letter) {
        box.classList.add("correct");
        box.classList.remove("wrong");
      } else {
        box.classList.add("wrong");
        box.classList.remove("correct");
      }
      guessInput.focus();
    });

    letterBoxesEl.appendChild(box);
  }
}

guessInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const guess = guessInput.value.trim().toLowerCase();
    const correct = currentWord.word.toLowerCase();
    if (guess === correct) {
      score++;
      scoreEl.textContent = score;

      const scoreContainer = scoreEl.parentElement;
      scoreContainer.classList.remove("score-pop");
      void scoreContainer.offsetWidth;
      scoreContainer.classList.add("score-pop");

      const plusOne = document.createElement("div");
      plusOne.className = "score-float";
      plusOne.textContent = "+1";
      scoreContainer.appendChild(plusOne);

      plusOne.addEventListener("animationend", () => {
        plusOne.remove();
      });

      messageEl.textContent = "Riktig!";
      pickNewWord();
    } else {
      messageEl.textContent = "Feil, prøv igjen.";
    }
  }
});

function populateWordList() {
  listContainer.innerHTML = "";
  const sortedWords = [...words].sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()));
  sortedWords.forEach(w => {
    const li = document.createElement("li");

    const wordDiv = document.createElement("div");
    wordDiv.className = "word-text";
    wordDiv.textContent = w.word;

    const descDiv = document.createElement("div");
    descDiv.className = "word-description";
    descDiv.textContent = w.description;

    li.appendChild(wordDiv);
    li.appendChild(descDiv);

    listContainer.appendChild(li);
  });
}


document.getElementById("new-word-btn").addEventListener("click", () => {
  pickNewWord();
  guessInput.focus();
});

document.getElementById("toggle-list-btn").addEventListener("click", () => {
  wordListBox.classList.toggle("hidden");
  guessInput.focus();
});


