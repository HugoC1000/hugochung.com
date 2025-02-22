document.addEventListener("DOMContentLoaded", () => {
    const subjects = [
        "math",
        "english", "pe", "elective1", 
        "elective2", "elective3", "elective4", "elective5", "elective6"
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
                const confidence = updateConfidence(subject); // Get confidence level
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
    
    
    function updateConfidence(subject) {
        const minInput = document.getElementById(`${subject}-min`);
        const maxInput = document.getElementById(`${subject}-max`);
        const confidenceIndicator = document.querySelector(`.confidence-indicator[data-for="${subject}"]`);
        
        if (!minInput || !maxInput || !confidenceIndicator) {
            console.error(`Missing elements for subject: ${subject}`);
            return;
        }
        
        const min = parseFloat(minInput.value) || 0;
        const max = parseFloat(maxInput.value) || 0;
        
        const range = max - min;

        const normalizedRange = Math.min(range, 10) / 7; // Cap at 10% range
        
        // Use cubic scaling for more dramatic color transition
        const scaledRange = Math.pow(normalizedRange, 4); 
        
        // Green is highest when range is smallest
        const green = Math.floor(255 * (1 - scaledRange));
        // Red increases as range increases
        const red = Math.floor(255 * scaledRange);
        const blue = 0;
        
        confidenceIndicator.style.color = `rgb(${red}, ${green}, ${blue})`;
        
        if (range === 0) {
            confidenceIndicator.textContent = 'Exact';
        } else if(range <= 3){
            confidenceIndicator.textContent = `Certain ±${(range/2).toFixed(1)}%`;
        }else if(range <= 7){
            confidenceIndicator.textContent = `Maybe ±${(range/2).toFixed(1)}%`;
        }else{
            confidenceIndicator.textContent = `Unsure ±${(range/2).toFixed(1)}%`;
        }
        
        if (range <= 3) return 'certain';
        if (range <= 7) return 'moderate';
        return 'unsure';
    }

    function updateResults() {
        let minTotal = 0;
        let maxTotal = 0;
    
        for (const subject of subjects) {
            const minInput = document.getElementById(`${subject}-min`);
            const maxInput = document.getElementById(`${subject}-max`);
            const minValue = parseFloat(minInput.value) || 0;
            const maxValue = parseFloat(maxInput.value) || 0;

            minTotal += minValue;
            maxTotal += maxValue;
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
});