document.addEventListener('DOMContentLoaded', () => {
  const questionElement = document.getElementById('quadratic');
  const answerForm = document.getElementById('answer-form');
  const userAnswerInput = document.getElementById('userAnswer');
  const feedbackElement = document.getElementById('feedback');
  const questionsSolvedElement = document.getElementById('questions-solved');

  let currentQuestion;
  let questionsSolved = 0;

  let timer;
  let secondsElapsed = 0;

  function startStopwatch() {
    timer = setInterval(() => {
      secondsElapsed++;
      updateStopwatchDisplay();
    }, 1000);
  }

  function updateStopwatchDisplay() {
    const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const seconds = String(secondsElapsed % 60).padStart(2, '0');
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
  }

  userAnswerInput.addEventListener('input', function () {
    const userAnswer = this.value.trim();

    if (userAnswer.includes('(') || userAnswer.includes('x')) {
      const isCorrect = checkAnswer();
      if (isCorrect) {
        questionsSolved++;
        questionsSolvedElement.textContent = `Questions Solved: ${questionsSolved}`;
        generateQuadratic();
        feedbackElement.textContent = '';
        userAnswerInput.value = '';
      }
    }
  });

  function generateQuadratic() {
    let a, b, c;
    do {
      a = Math.floor(Math.random() * 3) + 1;
      b = Math.floor(Math.random() * 21) - 10;
      c = Math.floor(Math.random() * 21) - 10;
    } while (!isFactorable(a, b, c));

    currentQuestion = { a, b, c };

    questionElement.textContent = `${a > 1 ? `${a}x²` : 'x²'} ${b !== 0 ? `${b > 0 ? '+' : ''}${b}x` : ''} ${c > 0 ? `+ ${c}` : c < 0 ? c : ''}`;
  }

  function isFactorable(a, b, c) {
    const discriminant = b * b - 4 * a * c;
    return discriminant >= 0 && Number.isInteger(Math.sqrt(discriminant));
  }

  function parseFactor(factor) {
    const binomialRegex = /^\(?([+-]?\d*)x\s*([+-]?\s*\d+)?\)?$/;
    const monomialRegex = /^\(?([+-]?\d*)x\)?$/;

    let match = factor.match(binomialRegex);
    if (match) {
      const coefficient = match[1] ? parseInt(match[1].replace(/\s/g, '')) : 1;
      const constant = match[2] ? parseInt(match[2].replace(/\s/g, '')) : 0;
      return { coefficient, constant };
    }

    match = factor.match(monomialRegex);
    if (match) {
      const coefficient = match[1] ? parseInt(match[1].replace(/\s/g, '')) : 1;
      return { coefficient, constant: 0 };
    }

    return null;
  }

  function checkAnswer() {
    const userAnswer = userAnswerInput.value.trim();
    const factorMatch = userAnswer.match(/\(([^)]+)\)\(([^)]+)\)/);

    if (!factorMatch) {
      feedbackElement.textContent = 'Invalid format! Use (ax + b)(cx + d) or monomials like (x)(x+b).';
      feedbackElement.style.color = 'red';
      return false;
    }

    const [_, factor1, factor2] = factorMatch;
    const factor1Parts = parseFactor(factor1);
    const factor2Parts = parseFactor(factor2);

    if (!factor1Parts || !factor2Parts) {
      feedbackElement.textContent = 'Invalid factors. Ensure proper numeric values.';
      feedbackElement.style.color = 'red';
      return false;
    }

    const { coefficient: p, constant: q } = factor1Parts;
    const { coefficient: r, constant: s } = factor2Parts;

    const a = p * r;
    const b = p * s + q * r;
    const c = q * s;

    if (a === currentQuestion.a && b === currentQuestion.b && c === currentQuestion.c) {
      feedbackElement.textContent = 'Correct! Well done.';
      feedbackElement.style.color = 'green';
      return true;
    } else {
      feedbackElement.textContent = 'Incorrect. Try again.';
      feedbackElement.style.color = 'red';
      return false;
    }
  }

  generateQuadratic();
  startStopwatch();
});
