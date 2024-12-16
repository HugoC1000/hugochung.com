// Physics constants
const GRAVITY = 9.8;  // m/s²

const DOM = {
    // Sliders
    velocity: {
        slider: document.getElementById('velocitySlider'),
        value: document.getElementById('velocityValue')
    },
    angle: {
        slider: document.getElementById('angleSlider'),
        value: document.getElementById('angleValue')
    },
    height: {
        slider: document.getElementById('heightSlider'),
        value: document.getElementById('heightValue')
    },
    xPos: {
        slider: document.getElementById('xPosSlider'),
        value: document.getElementById('xPosValue')
    },
    timeMultiplier: {
        slider: document.getElementById('timeMultiplier'),
        value: document.getElementById('timeMultiplierValue')
    },
    // Time Slider Controls
    time: {
        slider: document.getElementById('timeSlider'),
        value: document.getElementById('timeSliderValue'),
        decrementBtn: document.getElementById('decrementTimeBtn'),
        incrementBtn: document.getElementById('incrementTimeBtn')
    },
    // Results Display
    results: {
        finalVelocity: document.getElementById('finalVelocity'),
        finalVelocityX: document.getElementById('finalVelocityX'),
        finalVelocityY: document.getElementById('finalVelocityY'),
        horizontalDistance: document.getElementById('horizontalDistance'),
        timeOfFlight: document.getElementById('timeOfFlight'),
        maxHeight: document.getElementById('maxHeight')
    },
    simulateBtn: document.getElementById('simulateBtn')
};

// Canvas Configuration
const canvas = new fabric.Canvas('simulationCanvas', {
    width: 800,
    height: 500,
    backgroundColor: '#f0f0f0',
    renderOnAddRemove: false,
    stateful: false
});

// Visualization Objects
const VisualizationObjects = {
    ball: null,
    groundLine: null,
    trajectoryLine: null,
    velocityArrow: null,
    xVelocityArrow: null,
    yVelocityArrow: null
};

// Calculation Utilities
const Calculations = {
    /**
     * Convert degrees to radians
     * @param {number} degrees 
     * @returns {number} radians
     */
    degreesToRadians: (degrees) => degrees * Math.PI / 180,

    /**
     * Calculate initial velocity components
     * @param {number} initialSpeed 
     * @param {number} angleRadians 
     * @returns {Object} Velocity components
     */
    calculateVelocityComponents: (initialSpeed, angleRadians) => ({
        x: initialSpeed * Math.cos(angleRadians),
        y: initialSpeed * Math.sin(angleRadians)
    }),

    /**
     * Calculate time of flight
     * @param {number} initialVelocityY 
     * @param {number} initialHeight 
     * @returns {number} Time of flight
     */
    calculateTimeOfFlight: (initialVelocityY, initialHeight) => 
        (initialVelocityY + Math.sqrt(initialVelocityY * initialVelocityY + 2 * GRAVITY * initialHeight)) / GRAVITY,

    /**
     * Calculate horizontal distance
     * @param {number} initialVelocityX 
     * @param {number} timeOfFlight 
     * @param {number} initialXPosition 
     * @returns {number} Horizontal distance
     */
    calculateHorizontalDistance: (initialVelocityX, timeOfFlight, initialXPosition) => 
        initialXPosition + initialVelocityX * timeOfFlight,

    /**
     * Calculate maximum height
     * @param {number} initialVelocityY 
     * @param {number} initialHeight 
     * @returns {number} Maximum height
     */
    calculateMaxHeight: (initialVelocityY, initialHeight) => 
        initialHeight + (initialVelocityY * initialVelocityY) / (2 * GRAVITY),

    /**
     * Calculate final velocity components
     * @param {number} initialVelocityX 
     * @param {number} initialVelocityY 
     * @param {number} timeOfFlight 
     * @returns {Object} Final velocity components
     */
    calculateFinalVelocity: (initialVelocityX, initialVelocityY, timeOfFlight) => {
        const finalVelocityY = initialVelocityY - GRAVITY * timeOfFlight;
        return {
            x: initialVelocityX,
            y: finalVelocityY,
            total: Math.sqrt(initialVelocityX * initialVelocityX + finalVelocityY * finalVelocityY)
        };
    },

    calculateBallPositionFromTime: (initialXPosition, initialHeight, initialVelocityX, initialVelocityY, timeOfFlight) => {
        const positionX = initialXPosition + initialVelocityX * timeOfFlight;
        const positionY = initialHeight + initialVelocityY * timeOfFlight - 0.5 * GRAVITY * timeOfFlight * timeOfFlight;
        return { x: positionX, y: positionY };
    }
};

// Visualization Helpers
const VisualizationHelpers = {
    /**
     * Scale X coordinate for canvas
     * @param {number} x 
     * @returns {number} Scaled X coordinate
     */
    scaleX: (x) => x * 20,

    /**
     * Scale Y coordinate for canvas
     * @param {number} y 
     * @returns {number} Scaled Y coordinate
     */
    scaleY: (y) => canvas.height - 20 - (y * 20),

    /**
     * Draw ground line
     */
    drawGroundLine: () => {
        const groundY = canvas.height - 20;
        const groundLine = new fabric.Line([0, groundY, canvas.width, groundY], {
            stroke: 'black',
            strokeWidth: 2
        });
        canvas.add(groundLine);
        canvas.renderAll();
        VisualizationObjects.groundLine = groundLine;
    }
    
};

let animationFrame = null;

// Slider Update Handlers
function setupSliderHandlers() {
    const updateSliderDisplay = (slider, valueDisplay, unit = '') => {
        valueDisplay.textContent = `${slider.value}${unit}`;
        updatePreSimulationVisualization();
    };

    DOM.velocity.slider.oninput = () => updateSliderDisplay(DOM.velocity.slider, DOM.velocity.value, ' m/s');
    DOM.angle.slider.oninput = () => updateSliderDisplay(DOM.angle.slider, DOM.angle.value, '°');
    DOM.height.slider.oninput = () => updateSliderDisplay(DOM.height.slider, DOM.height.value, ' m');
    DOM.xPos.slider.oninput = () => updateSliderDisplay(DOM.xPos.slider, DOM.xPos.value, ' m');
    DOM.timeMultiplier.slider.oninput = () => updateSliderDisplay(DOM.timeMultiplier.slider, DOM.timeMultiplier.value, 'x');
}

// Create initial visualization objects
function initializeVisualizationObjects() {
    // Retrieve initial values from sliders
    const initialSpeed = Number(DOM.velocity.slider.value);
    const angleDegrees = Number(DOM.angle.slider.value);
    const initialHeight = Number(DOM.height.slider.value);
    const initialXPosition = Number(DOM.xPos.slider.value);

    // Convert angle to radians
    const angleRadians = Calculations.degreesToRadians(angleDegrees);

    // Calculate initial velocity components
    const initialVelocity = Calculations.calculateVelocityComponents(initialSpeed, angleRadians);

    // Create Ball
    VisualizationObjects.ball = new fabric.Circle({
        radius: 10,
        fill: 'black',
        left: VisualizationHelpers.scaleX(initialXPosition) - 10,
        top: VisualizationHelpers.scaleY(initialHeight),
        originY: 'bottom'
    });
    canvas.add(VisualizationObjects.ball);

    // Create Velocity Arrow
    VisualizationObjects.velocityArrow = new fabric.Line([
        VisualizationHelpers.scaleX(initialXPosition),
        VisualizationHelpers.scaleY(initialHeight),
        VisualizationHelpers.scaleX(initialXPosition) + initialSpeed * 5 * Math.cos(angleRadians),
        VisualizationHelpers.scaleY(initialHeight) - initialSpeed * 5 * Math.sin(angleRadians)
    ], {
        stroke: 'purple',
        strokeWidth: 5,
        opacity: 1
    });
    canvas.add(VisualizationObjects.velocityArrow);

    // Create X Velocity Arrow
    VisualizationObjects.xVelocityArrow = new fabric.Line([
        VisualizationHelpers.scaleX(initialXPosition),
        VisualizationHelpers.scaleY(initialHeight),
        VisualizationHelpers.scaleX(initialXPosition) + initialVelocity.x * 5,
        VisualizationHelpers.scaleY(initialHeight)
    ], {
        stroke: 'green',
        strokeWidth: 2
    });
    canvas.add(VisualizationObjects.xVelocityArrow);

    // Create Y Velocity Arrow
    VisualizationObjects.yVelocityArrow = new fabric.Line([
        VisualizationHelpers.scaleX(initialXPosition),
        VisualizationHelpers.scaleY(initialHeight),
        VisualizationHelpers.scaleX(initialXPosition),
        VisualizationHelpers.scaleY(initialHeight) - initialVelocity.y * 5
    ], {
        stroke: 'red',
        strokeWidth: 2
    });
    canvas.add(VisualizationObjects.yVelocityArrow);

    // Draw ground line
    VisualizationHelpers.drawGroundLine();

    // Render canvas
    canvas.renderAll();
}

function updatePreSimulationVisualization() {
    // Retrieve current slider values
    const initialSpeed = Number(DOM.velocity.slider.value);
    const angleDegrees = Number(DOM.angle.slider.value);
    const initialHeight = Number(DOM.height.slider.value);
    const initialXPosition = Number(DOM.xPos.slider.value);

    // Convert angle to radians
    const angleRadians = Calculations.degreesToRadians(angleDegrees);

    // Calculate initial velocity components
    const initialVelocity = Calculations.calculateVelocityComponents(initialSpeed, angleRadians);

    // Update ball position
    if (!VisualizationObjects.ball) {
        VisualizationObjects.ball = new fabric.Circle({
            radius: 10,
            fill: 'red',
            originY: 'bottom'
        });
        canvas.add(VisualizationObjects.ball);
    }

    // Position the ball
    VisualizationObjects.ball.set({
        left: VisualizationHelpers.scaleX(initialXPosition) - VisualizationObjects.ball.radius,
        top: VisualizationHelpers.scaleY(initialHeight)
    });

    // Create or update velocity arrow
    if (!VisualizationObjects.velocityArrow) {
        VisualizationObjects.velocityArrow = new fabric.Line([0, 0, 0, 0], {
            stroke: 'purple',
            strokeWidth: 5,
            opacity: 1
        });
        canvas.add(VisualizationObjects.velocityArrow);
    }

    // Calculate velocity arrow end point
    const ballCenterX = VisualizationObjects.ball.left + VisualizationObjects.ball.radius;
    const ballBottomY = VisualizationObjects.ball.top;
    const velocityArrowLength = initialSpeed * 5;
    const vArrowEndX = ballCenterX + velocityArrowLength * Math.cos(angleRadians);
    const vArrowEndY = ballBottomY - velocityArrowLength * Math.sin(angleRadians);

    // Update velocity arrow
    VisualizationObjects.velocityArrow.set({
        x1: ballCenterX,
        y1: ballBottomY,
        x2: vArrowEndX,
        y2: vArrowEndY
    });

    // Create or update X and Y velocity component arrows
    if (!VisualizationObjects.xVelocityArrow) {
        VisualizationObjects.xVelocityArrow = new fabric.Line([0, 0, 0, 0], {
            stroke: 'green',
            strokeWidth: 2
        });
        canvas.add(VisualizationObjects.xVelocityArrow);
    }

    if (!VisualizationObjects.yVelocityArrow) {
        VisualizationObjects.yVelocityArrow = new fabric.Line([0, 0, 0, 0], {
            stroke: 'red',
            strokeWidth: 2
        });
        canvas.add(VisualizationObjects.yVelocityArrow);
    }

    // Update X and Y velocity arrows
    VisualizationObjects.xVelocityArrow.set({
        x1: ballCenterX,
        y1: ballBottomY,
        x2: ballCenterX + initialVelocity.x * 5,
        y2: ballBottomY
    });

    VisualizationObjects.yVelocityArrow.set({
        x1: ballCenterX,
        y1: ballBottomY,
        x2: ballCenterX,
        y2: ballBottomY - initialVelocity.y * 5
    });

    // Ensure ground line is drawn
    VisualizationHelpers.drawGroundLine();

    // Render all canvas objects
    canvas.renderAll();
}

function simulateTrajectory() {
    // Clear previous animation
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    VisualizationHelpers.drawGroundLine();


    // Clear existing trajectory objects
    canvas.getObjects().forEach(obj => {
        if (obj !== VisualizationObjects.ball && 
            obj !== VisualizationObjects.velocityArrow && 
            obj !== VisualizationObjects.xVelocityArrow && 
            obj !== VisualizationObjects.yVelocityArrow && 
            obj !== VisualizationObjects.groundLine) {
            canvas.remove(obj);
        }
    });

    // Get simulation parameters
    const initialSpeed = Number(DOM.velocity.slider.value);
    const angleDegrees = Number(DOM.angle.slider.value);
    const initialHeight = Number(DOM.height.slider.value);
    const initialXPosition = Number(DOM.xPos.slider.value);
    const timeMultiplier = Number(DOM.timeMultiplier.slider.value);

    // Convert angle to radians
    const angleRadians = Calculations.degreesToRadians(angleDegrees);

    // Calculate initial velocity components
    const initialVelocity = Calculations.calculateVelocityComponents(initialSpeed, angleRadians);

    // Trajectory calculation variables
    let x = initialXPosition;
    let y = initialHeight;
    let t = 0;

    // Trajectory tracking
    let trajectoryPoints = [{
        x: VisualizationHelpers.scaleX(x),
        y: VisualizationHelpers.scaleY(y),
        time: 0
    }];

    const MAX_POINTS = 200;
    const SAMPLE_INTERVAL = 0.05;

    function animate() {
        // Update time with time multiplier
        t += (0.03 * timeMultiplier);

        // Calculate current position
        x = initialXPosition + initialVelocity.x * t;
        y = initialHeight + initialVelocity.y * t - 0.5 * GRAVITY * t * t;

        // Update ball position
        VisualizationObjects.ball.set({
            left: VisualizationHelpers.scaleX(x) - 10,
            top: VisualizationHelpers.scaleY(y)
        });

        // Ball center coordinates
        const ballCenterX = VisualizationObjects.ball.left + VisualizationObjects.ball.radius;
        const ballBottomY = VisualizationObjects.ball.top;

        // Sample trajectory points
        if (trajectoryPoints.length === 0 || 
            (trajectoryPoints.length < MAX_POINTS && 
             Math.floor(t / SAMPLE_INTERVAL) !== Math.floor((t - 0.02) / SAMPLE_INTERVAL))) {
            trajectoryPoints.push({
                x: ballCenterX,
                y: ballBottomY,
                time: t
            });
        }

        // Draw trajectory path
        if (trajectoryPoints.length > 1) {
            const trajectoryPath = new fabric.Polyline(trajectoryPoints, {
                stroke: 'blue',
                fill: false,
                strokeWidth: 2
            });
            canvas.insertAt(trajectoryPath, canvas.getObjects().length - 5);
        }

        // Current velocity components
        const currentVelocityY = initialVelocity.y - GRAVITY * t;

        // Update velocity arrows
        VisualizationObjects.xVelocityArrow.set({
            x1: ballCenterX,
            y1: ballBottomY,
            x2: ballCenterX + initialVelocity.x * 5,
            y2: ballBottomY
        });

        VisualizationObjects.yVelocityArrow.set({
            x1: ballCenterX,
            y1: ballBottomY,
            x2: ballCenterX,
            y2: ballBottomY - currentVelocityY * 5
        });

        canvas.renderAll();

        // Check if ball has reached ground
        if (VisualizationHelpers.scaleY(y) >= canvas.height - 20) {
            // Calculate actual time to ground
            const timeToGround = Calculations.calculateTimeOfFlight(initialVelocity.y, initialHeight);
            
            // Final trajectory point
            trajectoryPoints.push({
                x: VisualizationHelpers.scaleX(initialXPosition + initialVelocity.x * timeToGround),
                y: canvas.height - 20,
                time: timeToGround
            });

            // Draw final trajectory path
            const finalTrajectoryPath = new fabric.Polyline(trajectoryPoints, {
                stroke: 'blue',
                fill: false,
                strokeWidth: 2
            });
            canvas.add(finalTrajectoryPath);

            // Calculate and display trajectory results
            const finalVelocity = Calculations.calculateFinalVelocity(
                initialVelocity.x, 
                initialVelocity.y, 
                timeToGround
            );

            VisualizationObjects.ball.set({
                left: VisualizationHelpers.scaleX(initialXPosition + initialVelocity.x * timeToGround) - 10,
                top: canvas.height - 20
            });


            VisualizationObjects.xVelocityArrow.set({
                x1: ballCenterX,
                y1: ballBottomY,
                x2: ballCenterX + initialVelocity.x * 5,
                y2: ballBottomY
            });

            VisualizationObjects.yVelocityArrow.set({
                x1: ballCenterX,
                y1: ballBottomY,
                x2: ballCenterX,
                y2: ballBottomY - currentVelocityY * 5
            });

            // Update results display
            DOM.results.finalVelocity.textContent = finalVelocity.total.toFixed(3);
            DOM.results.finalVelocityX.textContent = finalVelocity.x.toFixed(3);
            DOM.results.finalVelocityY.textContent = finalVelocity.y.toFixed(3);
            DOM.results.horizontalDistance.textContent = 
                Calculations.calculateHorizontalDistance(
                    initialVelocity.x, 
                    timeToGround, 
                    initialXPosition
                ).toFixed(3);
            DOM.results.timeOfFlight.textContent = timeToGround.toFixed(3);
            DOM.results.maxHeight.textContent = 
                Calculations.calculateMaxHeight(
                    initialVelocity.y, 
                    initialHeight
                ).toFixed(3);

            enableTimeSlider(initialXPosition,initialVelocity, initialHeight, angleRadians, timeToGround);
            drawHorizontalDistanceVisualization(initialXPosition, Calculations.calculateHorizontalDistance(initialVelocity.x, timeToGround, initialXPosition));
            drawVerticalDisplacementVisualization(initialXPosition, initialVelocity, initialHeight, timeToGround);

            // Stop animation
            cancelAnimationFrame(animationFrame);
            return;
        }

        // Continue animation
        animationFrame = requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    function enableTimeSlider(initialXPosition, initialVelocity, initialHeight, angleRadians, timeToGround) {        
        DOM.time.slider.style.display = 'block';
        DOM.time.value.style.display = 'block';
        DOM.time.decrementBtn.style.display = 'block';
        DOM.time.incrementBtn.style.display = 'block';
        
        // Set max value for the slider in hundredths of a second
        DOM.time.slider.max = Math.ceil(timeToGround * 1000.0); // Slider range in increments of 0.001 seconds
        DOM.time.slider.value = DOM.time.slider.max;  
        
        // Display the initial time value
        DOM.time.value.textContent = `${(DOM.time.slider.value / 1000.0).toFixed(3)} s`;
        console.log("Time content: " + DOM.time.value.style.textContent);
        DOM.time.slider.step = 1;
    
        // Existing time slider input handler
        DOM.time.slider.oninput = () => {
            const time = DOM.time.slider.value / 1000.0; // Convert slider value to seconds
            console.log("On input time: " + time);
            DOM.time.value.textContent = `${time.toFixed(3)} s`; 
            updateBallPositionFromTime(initialXPosition, initialVelocity, initialHeight);
            drawHorizontalDistanceVisualization(initialXPosition, Calculations.calculateHorizontalDistance(initialVelocity.x, time, initialXPosition));
            drawVerticalDisplacementVisualization(initialXPosition, initialVelocity, initialHeight, time);
        };
    
        // Setup increment/decrement controls
        setupTimeSliderControls();
    }

    function setupTimeSliderControls() {
        const timeSlider = document.getElementById('timeSlider');
        const decrementBtn = document.getElementById('decrementTimeBtn');
        const incrementBtn = document.getElementById('incrementTimeBtn');
        const timeSliderValue = document.getElementById('timeSliderValue');
    
    
        decrementBtn.addEventListener('click', () => {
            const currentValue = Number(timeSlider.value);
            const step = Number(timeSlider.step);
            
            if (currentValue > Number(timeSlider.min)) {
                timeSlider.value = (currentValue - 1).toFixed(3);
                timeSlider.dispatchEvent(new Event('input'));
            }
        });
    
        incrementBtn.addEventListener('click', () => {
            const currentValue = Number(timeSlider.value);
            const step = Number(timeSlider.step);
            
            if (currentValue < Number(timeSlider.max)) {
                timeSlider.value = (currentValue + 1).toFixed(3);
                timeSlider.dispatchEvent(new Event('input'));
            }
        });
    }
    
    function drawHorizontalDistanceVisualization(initialXPosition, horizontalPosition) {

        canvas.getObjects().forEach(obj => {
            if (obj.customType === 'horizontalDistanceVisualization') {
                canvas.remove(obj);
            }
        });
    
        // Calculate scaled start and end points for the horizontal distance line
        const startX = initialXPosition * 20;
        const endX = ( horizontalPosition) * 20;
        console.log("Horizontaol Position Bar: " + horizontalPosition);
        const groundY = canvas.height - 20;
    
        const distanceLine = new fabric.Line([startX, groundY - 15, endX, groundY - 15], {
            stroke: 'black',
            strokeWidth: 2,
            strokeDashArray: [5, 5], // Dashed line,
            customType: 'horizontalDistanceVisualization'
        });
    
        const startBar = new fabric.Line([startX, groundY - 10, startX, groundY - 20], {
            stroke: 'black',
            strokeWidth: 2,
            customType: 'horizontalDistanceVisualization'
        });
        const endBar = new fabric.Line([endX, groundY - 10, endX, groundY - 20], {
            stroke: 'black',
            strokeWidth: 2,
            customType: 'horizontalDistanceVisualization'
        });
    
        canvas.add(distanceLine);
        canvas.add(startBar);
        canvas.add(endBar);
    
        // Create text to show horizontal distance
        const distanceText = new fabric.Text(`dx: ${horizontalPosition.toFixed(3)} m`, {
            left: (startX + endX) / 2,
            top: groundY - 40,
            fill: 'black',
            fontSize: 10,
            originX: 'center',
            customType: 'horizontalDistanceVisualization'
        });
        canvas.add(distanceText);
    
        canvas.renderAll();
    }
    


    // Update the ball's position based on the slider value
    function updateBallPositionFromTime(initialXPosition, initialVelocity, initialHeight) {
        const time = DOM.time.slider.value / 1000; // Convert slider value to seconds

        const ballPosition = Calculations.calculateBallPositionFromTime(initialXPosition, initialHeight, initialVelocity.x, initialVelocity.y, time)
        console.log("Ball position y: " +  ballPosition.y);
        // Update ball position
        VisualizationObjects.ball.set({
            left: ballPosition.x * 20 - VisualizationObjects.ball.radius,
            top: canvas.height - 20 - Math.max(0, ballPosition.y) * 20 // Ensure it doesn't go below ground
        });


        const ballCenterX = VisualizationObjects.ball.left + VisualizationObjects.ball.radius;
        const ballBottomY = VisualizationObjects.ball.top;

        //Update the velocity vectors

        const currentVelocity = Calculations.calculateFinalVelocity(initialVelocity.x,initialVelocity.y,time);
        
        VisualizationObjects.xVelocityArrow.set({
            x1: ballCenterX,
            y1: ballBottomY,
            x2: ballCenterX + currentVelocity.x * 5,
            y2: ballBottomY
        });

        VisualizationObjects.yVelocityArrow.set({
            x1: ballCenterX,
            y1: ballBottomY,
            x2: ballCenterX,
            y2: ballBottomY - currentVelocity.y * 5
        });

        canvas.renderAll();
    }
    function drawVerticalDisplacementVisualization(initialXPosition, initialVelocity, initialHeight, time) {
        // Remove existing vertical displacement visualization objects
        canvas.getObjects().forEach(obj => {
            if (obj.customType === 'verticalDisplacementVisualization') {
                canvas.remove(obj);
            }
        });
    
        const ballPosition = Calculations.calculateBallPositionFromTime(initialXPosition, initialHeight, initialVelocity.x, initialVelocity.y, time);
        const verticalDisplacement = ballPosition.y - initialHeight;

        canvasXEnd = ballPosition.x * 20;
    
        const groundY = canvas.height - 20;
        const startY = groundY - initialHeight * 20;
        const endY = groundY - ballPosition.y * 20;
    
        // Create vertical displacement line
        const displacementLine = new fabric.Line([canvasXEnd + 25, startY, canvasXEnd + 25, endY], {
            stroke: 'red',
            strokeWidth: 2,
            strokeDashArray: [5, 5], // Dashed line
            customType: 'verticalDisplacementVisualization'
        });
    
        // Create start and end bars
        const startBar = new fabric.Line([canvasXEnd + 15, startY, canvasXEnd + 35, startY], {
            stroke: 'red',
            strokeWidth: 2,
            customType: 'verticalDisplacementVisualization'
        });
        const endBar = new fabric.Line([canvasXEnd + 15, endY, canvasXEnd + 35, endY], {
            stroke: 'red',
            strokeWidth: 2,
            customType: 'verticalDisplacementVisualization'
        });
    
        // Create text to show vertical displacement
        const displacementText = new fabric.Text(`dy: ${verticalDisplacement.toFixed(3)} m`, {
            left: canvasXEnd + 50,
            top: (startY + endY) / 2,
            fill: 'red',
            fontSize: 10,
            originY: 'center',
            customType: 'verticalDisplacementVisualization'
        });
    
        // Add all elements to the canvas
        canvas.add(displacementLine);
        canvas.add(startBar);
        canvas.add(endBar);
        canvas.add(displacementText);
    
        canvas.renderAll();
    }

}

function initializeSimulation() {
    setupSliderHandlers();
    initializeVisualizationObjects();
    VisualizationHelpers.drawGroundLine();
}


initializeSimulation();


// Simulate button click handler
simulateBtn.addEventListener('click', simulateTrajectory);