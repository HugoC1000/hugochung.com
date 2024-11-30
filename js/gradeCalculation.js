document.addEventListener("DOMContentLoaded", () => {
    const subjects = [
        "apCsp",
        "math", "physics", "socials", 
        "pe", "english", "chemistry", "career", "apStats"
    ];


    let goal = document.getElementById("targetGrade").value/100*900 || 0; 
    const maxPoints = 900;

    // Update event listeners for min/max inputs
    subjects.forEach(subject => {
        const minInput = document.getElementById(`${subject}-min`);
        const maxInput = document.getElementById(`${subject}-max`);

        [minInput, maxInput].forEach(input => {
            input.addEventListener("input", (e) => {
                validateMinMaxInputs(subject);
                updateGradeColor(e.target);
                updateResults();
            });
        });
    });

        // Add event listeners for course name editing
     const editButtons = document.querySelectorAll('.edit-name-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const container = e.target.closest('.course-name-container');
                const label = container.querySelector('.course-label');
                const input = container.querySelector('.course-name-input');
                
                if (input.style.display === 'none') {
                    // Switch to edit mode
                    input.value = label.textContent;
                    label.style.display = 'none';
                    input.style.display = 'inline-block';
                    e.target.textContent = '✓';
                    input.focus();
                } else {
                    // Save the edit
                    label.textContent = input.value;
                    label.style.display = 'inline-block';
                    input.style.display = 'none';
                    e.target.textContent = '✎';
                }
            });
        });
        // Add event listener for Enter key on course name inputs
        const courseNameInputs = document.querySelectorAll('.course-name-input');
        courseNameInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const container = e.target.closest('.course-name-container');
                    const button = container.querySelector('.edit-name-btn');
                    button.click();
                }
            });
        });


    document.getElementById("targetGrade").addEventListener("input", (e) => {
        goal = e.target.value/100*900 || 0;
        updateResults();
    });
  

    function validateMinMaxInputs(subject) {
        const minInput = document.getElementById(`${subject}-min`);
        const maxInput = document.getElementById(`${subject}-max`);
        
        const min = parseFloat(minInput.value) || 0;
        const max = parseFloat(maxInput.value) || 0;
        
    }

     // Add event listeners for confidence selects
     const confidenceSelects = document.querySelectorAll('.confidence-select');
     confidenceSelects.forEach(select => {
         select.addEventListener('change', (e) => {
             // Remove existing classes from the select itself
             e.target.classList.remove('confidence-unsure', 'confidence-moderate', 'confidence-certain');
             
             // Add new confidence class to the select
             e.target.classList.add(`confidence-${e.target.value}`);
             
             // Set the background color directly
             e.target.style.backgroundColor = 
                 e.target.value === 'unsure' ? '#eb3737' :
                 e.target.value === 'moderate' ? '#e39d53' : 
                 e.target.value === 'certain' ? '#38ed38' : '';
         });
     });
    function updateResults() {
        let minTotal = 0;
        let maxTotal = 0;
    
        for (const subject of subjects) {
            const minInput = document.getElementById(`${subject}-min`);
            const maxInput = document.getElementById(`${subject}-max`);
            const confidence = document.querySelector(`.confidence-select[data-for="${subject}"]`).value;
            
            const minValue = parseFloat(minInput.value) || 0;
            const maxValue = parseFloat(maxInput.value) || 0;
    
            if (minValue >= 0 && maxValue <= 100) {
                switch(confidence) {
                    case 'certain':
                        minTotal += maxValue;
                        maxTotal += maxValue;
                        break;
                    case 'moderate':
                        minTotal += minValue;
                        maxTotal += maxValue;
                        break;
                    case 'unsure':
                        minTotal += Math.max(0, minValue - 5);
                        maxTotal += Math.min(100, maxValue + 5);
                        break;
                    default:
                        minTotal += minValue;
                        maxTotal += maxValue;
                }
            }
        }
    
        const minPercentage = ((minTotal / maxPoints) * 100).toFixed(2);
        const maxPercentage = ((maxTotal / maxPoints) * 100).toFixed(2);
        const goal = parseFloat(document.getElementById("targetGrade").value)/100*900 || 0;
        const targetPercentage = ((goal / maxPoints) * 100).toFixed(2);
    
        const outputElement = document.getElementById("output");
        outputElement.innerHTML = `
            <p>Minimum: ${minTotal}/${maxPoints} (${minPercentage}%)</p>
            <p>Maximum: ${maxTotal}/${maxPoints} (${maxPercentage}%)</p>
            <p>Target: ${goal}/${maxPoints} (${targetPercentage}%)</p>
        `;
    
        if (minTotal >= goal) {
            outputElement.innerHTML += `<p class="success">You'll definitely meet your goal!</p>`;
        } else if (maxTotal >= goal) {
            outputElement.innerHTML += `<p class="moderate">You might meet your goal.</p>`;
        } else {
            outputElement.innerHTML += `<p class="fail">You're unlikely to meet your goal with current grades.</p>`;
        }
    
        // Fix: Call updateProgressBar instead of updateProgressBars
        updateProgressBar(minTotal, maxTotal); // Update progress bar with minimum total
    }

    // Function to update the progress bar
    function updateProgressBar(minTotal, maxTotal) {
        const progressBarMin = document.getElementById("progressBarMin");
        const progressBarMax = document.getElementById("progressBarMax");
        const thresholdMarker = document.getElementById("thresholdMarker");
        
        // Calculate percentages (capped at 100%)
        const minHeight = Math.min(100, (minTotal / maxPoints) * 100);
        const maxHeight = Math.min(100, (maxTotal / maxPoints) * 100);
        
        // Update the bars
        progressBarMin.style.height = `${minHeight}%`;
        progressBarMax.style.height = `${maxHeight}%`;
        
        // Update threshold marker
        const goal = parseFloat(document.getElementById("targetGrade").value)/100*900 || 0;
        const thresholdPosition = Math.min(100, (goal / maxPoints) * 100);
        thresholdMarker.style.bottom = `${thresholdPosition}%`;
    }
    
    // Function to update input background color based on grade
    function updateGradeColor(input) {
        const value = parseFloat(input.value);
        if (isNaN(value) || value < 0 || value > 100) {
            input.style.background = 'white';
            input.style.color = 'black';
            return;
        }

        if (value < 60) {
            // Solid red for anything below 60%
            input.style.background = 'rgb(255, 0, 0)';
        } else {
            // Calculate gradient only for 60-100%
            // Map 60-100 to 0-1 for color calculation
            const normalizedValue = (value - 70) / 40;
            const red = Math.floor(255 * (1 - normalizedValue));
            const green = Math.floor(255 * normalizedValue);
            input.style.background = `rgb(${red}, ${green}, 0)`;
        }
        
        // Adjust text color for readability
        input.style.color = value >= 60 && value <= 75 ? 'white' : 'black';
    }

    // Timer variables
    let timerInterval;
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    let isRunning = false;

    // Problem counter variable
    let problemCount = 0;

    // Problem counter functions
    function incrementCount() {
        problemCount++;
        updateCountDisplay();
        // Add a visual feedback animation
        const countDisplay = document.getElementById('problemCount');
        countDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            countDisplay.style.transform = 'scale(1)';
        }, 200);
    }

    function resetCount() {
        problemCount = 0;
        updateCountDisplay();
    }

    function updateCountDisplay() {
        document.getElementById('problemCount').textContent = problemCount;
    }

    // Event listeners for counter
    document.getElementById('incrementCount').addEventListener('click', incrementCount);
    document.getElementById('resetCount').addEventListener('click', resetCount);

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat && !e.target.matches('input, textarea')) {
            // Prevent space from scrolling the page
            e.preventDefault();
            incrementCount();
        }
        if (e.key.toLowerCase() === 'r' && !e.repeat && !e.target.matches('input, textarea')) {
            resetCount();
        }
    });

    // Initialize counter display
    updateCountDisplay();

    // Optional: Save count to localStorage
    function saveCount() {
        localStorage.setItem('problemCount', problemCount);
    }

    function loadCount() {
        const savedCount = localStorage.getItem('problemCount');
        if (savedCount !== null) {
            problemCount = parseInt(savedCount);
            updateCountDisplay();
        }
    }

    // Save count when updated
    const originalIncrementCount = incrementCount;
    incrementCount = () => {
        originalIncrementCount();
        saveCount();
    };

    // Load saved count on page load
    loadCount();

    // Timer functions
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timerInterval = setInterval(updateTimer, 1000);
            document.getElementById('startTimer').disabled = true;
            document.getElementById('stopTimer').disabled = false;
        }
    }

    function stopTimer() {
        if (isRunning) {
            isRunning = false;
            clearInterval(timerInterval);
            document.getElementById('startTimer').disabled = false;
            document.getElementById('stopTimer').disabled = true;
        }
    }

    function resetTimer() {
        stopTimer();
        seconds = 0;
        minutes = 0;
        hours = 0;
        updateTimerDisplay();
    }

    function updateTimer() {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
            if (minutes >= 60) {
                minutes = 0;
                hours++;
            }
        }
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    // Event listeners for timer
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('stopTimer').addEventListener('click', stopTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
});