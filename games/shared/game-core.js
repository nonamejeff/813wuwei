// Shared utilities
export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickDistractors(items, correctItem, count) {
  const candidates = items.filter((option) => option.name !== correctItem.name);
  return shuffle(candidates).slice(0, count);
}

// Game state management
export class QuizGame {
  constructor(options = {}) {
    this.items = options.items || [];
    this.distractorCount = options.distractorCount || 3;
    this.onRoundStart = options.onRoundStart || (() => {});
    this.onRoundEnd = options.onRoundEnd || (() => {});
    this.onFeedback = options.onFeedback || (() => {});
    
    this.gameActive = false;
    this.inputLocked = false;
    this.roundEvaluated = false;
    this.itemOrder = [];
    this.currentItemIndex = 0;
    this.correctItem = null;
    this.choices = [];
    this.selectedChoice = null;
  }

  startRound() {
    if (this.items.length < this.distractorCount + 1) {
      this.onFeedback(`Add at least ${this.distractorCount + 1} items to play.`);
      return;
    }

    this.inputLocked = false;
    this.roundEvaluated = false;
    this.selectedChoice = null;
    this.onFeedback("");

    if (this.itemOrder.length === 0 || this.currentItemIndex >= this.itemOrder.length) {
      this.itemOrder = shuffle(this.items);
      this.currentItemIndex = 0;
    }

    this.correctItem = this.itemOrder[this.currentItemIndex];
    this.choices = shuffle([this.correctItem, ...pickDistractors(this.items, this.correctItem, this.distractorCount)]);

    this.onRoundStart({
      correctItem: this.correctItem,
      choices: this.choices,
      itemIndex: this.currentItemIndex,
      totalItems: this.itemOrder.length
    });
  }

  selectChoice(index) {
    if (!this.gameActive || this.inputLocked || this.roundEvaluated) {
      return;
    }

    const chosen = this.choices[index];
    if (!chosen) {
      return;
    }

    this.selectedChoice = chosen;
    const isCorrect = this.selectedChoice.name === this.correctItem.name;
    
    this.evaluateRound(isCorrect);
  }

  evaluateRound(isCorrect) {
    this.roundEvaluated = true;
    this.inputLocked = true;

    const feedback = isCorrect 
      ? `Correct — ${this.correctItem.name}`
      : `Wrong — correct answer: ${this.correctItem.name}`;

    this.onRoundEnd({
      correctItem: this.correctItem,
      selectedChoice: this.selectedChoice,
      isCorrect,
      feedback
    });

    this.onFeedback(feedback);
  }

  nextRound() {
    if (!this.gameActive || !this.roundEvaluated) {
      return;
    }
    
    if (this.currentItemIndex + 1 >= this.itemOrder.length) {
      this.itemOrder = shuffle(this.items);
      this.currentItemIndex = 0;
    } else {
      this.currentItemIndex += 1;
    }
    
    this.startRound();
  }

  start() {
    if (this.gameActive) {
      return;
    }
    
    this.gameActive = true;
    this.itemOrder = shuffle(this.items);
    this.currentItemIndex = 0;
    this.startRound();
  }

  reset() {
    this.gameActive = false;
    this.inputLocked = false;
    this.roundEvaluated = false;
    this.itemOrder = [];
    this.currentItemIndex = 0;
    this.correctItem = null;
    this.choices = [];
    this.selectedChoice = null;
  }
}