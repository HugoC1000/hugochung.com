let num1, num2, operator, correctAnswer;
const operators = ['+', '-', '*', '/'];
const problemElement = document.getElementById('problem');
const answerInput = document.getElementById('answer');
const messageElement = document.getElementById('message');

// Default settings in case none are saved
let settings = {
    add: { min1: 1, max1: 12, min2: 1, max2: 12 },
    sub: { min1: 1, max1: 12, min2: 1, max2: 12 },
    mul: { min1: 1, max1: 12, min2: 1, max2: 12 },
    div: { min1: 1, max1: 12, min2: 1, max2: 12 }
};

// Load saved settings if they exist
const savedSettings = localStorage.getItem('mathSettings');
if (savedSettings) {
    settings = JSON.parse(savedSettings);
}

function generateProblem() {
    operator = operators[Math.floor(Math.random() * operators.length)];
    
    switch(operator) {
        case '+':
            num1 = Math.floor(Math.random() * (settings.add.max1 - settings.add.min1 + 1)) + parseInt(settings.add.min1);
            num2 = Math.floor(Math.random() * (settings.add.max2 - settings.add.min2 + 1)) + parseInt(settings.add.min2);
            correctAnswer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * (settings.sub.max1 - settings.sub.min1 + 1)) + parseInt(settings.sub.min1);
            num2 = Math.floor(Math.random() * (settings.sub.max2 - settings.sub.min2 + 1)) + parseInt(settings.sub.min2);
            correctAnswer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * (settings.mul.max1 - settings.mul.min1 + 1)) + parseInt(settings.mul.min1);
            num2 = Math.floor(Math.random() * (settings.mul.max2 - settings.mul.min2 + 1)) + parseInt(settings.mul.min2);
            correctAnswer = num1 * num2;
            break;
        case '/':
            num2 = Math.floor(Math.random() * (settings.div.max2 - settings.div.min2 + 1)) + parseInt(settings.div.min2);
            correctAnswer = Math.floor(Math.random() * (settings.div.max1 - settings.div.min1 + 1)) + parseInt(settings.div.min1);
            num1 = num2 * correctAnswer; // Ensure clean division
            break;
    }

    problemElement.textContent = `${num1} ${operator} ${num2} = `;
    answerInput.value = '';
    messageElement.textContent = '';
    answerInput.focus();
}

answerInput.addEventListener('input', function() {
    const userAnswer = parseInt(this.value);
    
    if (!isNaN(userAnswer)) {
        if (userAnswer === correctAnswer) {
            generateProblem();
        } else {
            messageElement.textContent = 'Wrong';
            messageElement.style.color = 'red';
        }
    }
});

// Generate first problem when page loads
generateProblem();