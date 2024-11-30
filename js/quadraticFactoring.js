document.addEventListener('DOMContentLoaded', () => {
    const questionElement = document.getElementById('quadratic');
    const answerForm = document.getElementById('answer-form');
    const userAnswerInput = document.getElementById('user-answer');
    const feedbackElement = document.getElementById('feedback');
    const newQuestionButton = document.getElementById('new-question');
  
    let currentQuestion;
  
    // Function to generate a random quadratic equation
    function generateQuadratic() {
      const a = Math.floor(Math.random() * 3) + 1; // Coefficient of x² (1 to 3)
      const b = Math.floor(Math.random() * 21) - 10; // Coefficient of x (-10 to 10)
      const c = Math.floor(Math.random() * 21) - 10; // Constant term (-10 to 10)
  
      currentQuestion = { a, b, c };
      questionElement.textContent = `${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}`;
    }
  
    // Function to check if the user's factors are correct
    function checkAnswer(event) {
      event.preventDefault();
      const userAnswer = userAnswerInput.value.trim();
      
      // Parse the user input into factors
      const factorMatch = userAnswer.match(/\(([^)]+)\)\(([^)]+)\)/);
      if (!factorMatch) {
        feedbackElement.textContent = 'Invalid format! Use (ax + b)(cx + d).';
        feedbackElement.style.color = 'red';
        return;
      }
  
      const [_, factor1, factor2] = factorMatch;
      const [p, q] = factor1.split('x').map(Number); // Parse first factor (px + q)
      const [r, s] = factor2.split('x').map(Number); // Parse second factor (rx + s)
  
      if (isNaN(p) || isNaN(q) || isNaN(r) || isNaN(s)) {
        feedbackElement.textContent = 'Invalid factors. Ensure proper numeric values.';
        feedbackElement.style.color = 'red';
        return;
      }
  
      // Validate the factors
      const a = p * r;
      const b = p * s + q * r;
      const c = q * s;
  
      if (a === currentQuestion.a && b === currentQuestion.b && c === currentQuestion.c) {
        feedbackElement.textContent = 'Correct! Well done.';
        feedbackElement.style.color = 'green';
      } else {
        feedbackElement.textContent = 'Incorrect. Try again.';
        feedbackElement.style.color = 'red';
      }
    }
  
    // Event listener for generating a new question
    newQuestionButton.addEventListener('click', () => {
      generateQuadratic();
      feedbackElement.textContent = '';
      userAnswerInput.value = '';
    });
  
    // Event listener for submitting an answer
    answerForm.addEventListener('submit', checkAnswer);
  
    // Generate the first quadratic when the page loads
    generateQuadratic();
  });
  