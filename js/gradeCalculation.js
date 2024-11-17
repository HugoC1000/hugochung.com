document.addEventListener("DOMContentLoaded", () => {
    const subjects = [
      "apCsp", "math", "physics", "socials", 
      "pe", "english", "chemistry", "career", "apStats"
    ];
  
    let goal = document.getElementById("targetGrade").value || 0; 
    const maxPoints = 900;
  
    // Attach event listeners to all input fields
    subjects.forEach(subject => {
      const inputField = document.getElementById(subject);
      inputField.addEventListener("input", updateResults);
    });

    // Update goal when target grade changes
    document.getElementById("targetGrade").addEventListener("input", (e) => {
        goal = e.target.value || 0;
        updateResults();
    });
  
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
  
    // Add event listeners to grade inputs for gradient colors
    subjects.forEach(subject => {
        const inputField = document.getElementById(subject);
        inputField.addEventListener("input", (e) => {
            updateGradeColor(e.target);
            updateResults();
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
  
    // Function to calculate and display the results
    function updateResults() {
        let totalScore = 0;
        let allFieldsFilled = true;
    
        for (const subject of subjects) {
            const value = document.getElementById(subject).value;
            const numericValue = parseFloat(value);
    
            if (value === "" || isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
                totalScore += 0;
                const inputField = document.getElementById(subject);
                inputField.style.background = 'rgb(255, 0, 0)';
                inputField.style.color = 'white';
            } else {
                totalScore += numericValue;
            }
        }
    
        const averagePercentage = ((totalScore / maxPoints) * 100).toFixed(2);
        const outputText = `${totalScore}/${maxPoints} = ${averagePercentage}%`;
    
        const outputElement = document.getElementById("output");
        const targetGradeAverage = ((goal / maxPoints) * 100).toFixed(2);
        outputElement.innerHTML = `<p>${outputText}</p>`;
    
        if (totalScore >= goal) {
            outputElement.innerHTML += `<p class="success">Congratulations! You met the goal of ${goal} points (${targetGradeAverage}%)!</p>`;
        } else {
            outputElement.innerHTML += `<p class="fail">You scored below the goal of ${goal} points (${targetGradeAverage}%). Keep trying!</p>`;
        }
    
        updateProgressBar(totalScore);
    }
  
    // Function to update the progress bar
    function updateProgressBar(totalScore) {
      const progressBar = document.getElementById("progressBar");
      const progressBarHeight = (totalScore / maxPoints) * 100;  
      progressBar.style.height = `${progressBarHeight}%`;
  
      // Update the threshold marker position
      const thresholdMarker = document.getElementById("thresholdMarker");
      const thresholdPosition = (goal / maxPoints) * 100; 
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
        input.style.color = value >= 60 && value > 75 ? 'black' : 'white';
    }
  });