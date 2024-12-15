// Physics constants
const GRAVITY = 9.8;  // m/s²

// Canvas and Fabric setup
const canvas = new fabric.Canvas('simulationCanvas', {
    width: 800,
    height: 500,
    backgroundColor: '#f0f0f0',
    renderOnAddRemove: false, // Disable automatic rendering
    stateful: false // Disable object state tracking
});


// DOM Elements
const velocitySlider = document.getElementById('velocitySlider');
const angleSlider = document.getElementById('angleSlider');
const heightSlider = document.getElementById('heightSlider');
const xPosSlider = document.getElementById('xPosSlider');
const timeMultiplierSlider = document.getElementById('timeMultiplier');
const simulateBtn = document.getElementById('simulateBtn');

const velocityValue = document.getElementById('velocityValue');
const angleValue = document.getElementById('angleValue');
const heightValue = document.getElementById('heightValue');
const xPosValue = document.getElementById('xPosValue');
const timeMultiplierValue = document.getElementById('timeMultiplierValue');


// Visualization objects
let ball, groundLine, trajectoryLine, velocityArrow, angleArrow, xVelocityArrow, yVelocityArrow;
let animationFrame = null;

// Update value displays
velocitySlider.oninput = () => {
    velocityValue.textContent = `${velocitySlider.value} m/s`;
    updateVisualization();
};
angleSlider.oninput = () => {
    angleValue.textContent = `${angleSlider.value}°`;
    updateVisualization();
};
heightSlider.oninput = () => {
    heightValue.textContent = `${heightSlider.value} m`;
    updateVisualization();
};
xPosSlider.oninput = () => {
    xPosValue.textContent = `${xPosSlider.value} m`;
    updateVisualization();
};

timeMultiplierSlider.oninput = () => {
    timeMultiplierValue.textContent = `${timeMultiplierSlider.value}x`;
    updateVisualization();
}

// Create initial visualization objects
function initializeVisualization() {

    
    // Ball
    ball = new fabric.Circle({
        radius: 10,
        fill: 'red',
        left: Number(xPosSlider.value) * 20 - 10,
        top: canvas.height - 20 - Number(heightSlider.value) * 20 ,
        originY: 'bottom' 
    });

    

    console.log("Ball tops")

    console.log(canvas.height - 20 - Number(heightSlider.value) * 20 );
    console.log(ball.top);
    canvas.add(ball);

    // Velocity Arrow
    velocityArrow = new fabric.Line([ball.left, ball.top, ball.left, ball.top], {
        stroke: 'purple',
        strokeWidth: 5,
        opacity: 1
    });
    canvas.add(velocityArrow);

    // X and Y Velocity Arrows (initially hidden)
    xVelocityArrow = new fabric.Line([0, 0, 0, 0], {
        stroke: 'green',
        strokeWidth: 2
    });
    yVelocityArrow = new fabric.Line([0, 0, 0, 0], {
        stroke: 'red',
        strokeWidth: 2
    });
    canvas.add(xVelocityArrow, yVelocityArrow);

    updateVisualization();
}
function drawGroundLine() {
    // Adjust ground level for the new canvas height
    const groundY = canvas.height - 20; // Ground is 20px from the bottom of the canvas

    // Create a horizontal line for y = 0
    const groundLine = new fabric.Line([0, groundY, canvas.width, groundY], {
        stroke: 'black',
        strokeWidth: 2
    });
    canvas.add(groundLine);
}

function updateVisualization() {
    const velocity = Number(velocitySlider.value);
    const angle = Number(angleSlider.value);
    const height = Number(heightSlider.value);
    const xPos = Number(xPosSlider.value);

    const radAngle = angle * Math.PI / 180;
    const vx = velocity * Math.cos(radAngle);
    const vy = velocity * Math.sin(radAngle);

    // console.log("Visualization Update Inputs:");
    // console.log("Velocity:", velocity);
    // console.log("Angle:", angle);
    // console.log("Height:", height);
    // console.log("X Position:", xPos);
    // console.log("Radian Angle:", radAngle);
    // console.log("Velocity X:", vx);
    // console.log("Velocity Y:", vy);

    // Update ball position
    ball.set({
        left: xPos * 20 - 10,
        top: canvas.height - 20 - (height * 20),
        originY: 'bottom'
    });

    // Calculate the bottom-middle position of the ball
    const ballCenterX = ball.left + ball.radius;
    const ballBottomY = ball.top;

    // console.log("Ball Center X:", ballCenterX);
    // console.log("Ball Bottom Y:", ballBottomY);    
    // console.log("Angle Arrow Calculation:");
    // console.log("Start X:", ballCenterX);
    // console.log("Start Y:", ballBottomY);
    // console.log("End X:", endX);
    // console.log("End Y:", endY);

    // Update Velocity Arrow
    const velocityArrowLength = velocity * 5;
    const vArrowEndX = ballCenterX + velocityArrowLength * Math.cos(radAngle);
    const vArrowEndY = ballBottomY - velocityArrowLength * Math.sin(radAngle);
    
    // console.log("Velocity Arrow Calculation:");
    // console.log("Start X:", ballCenterX);
    // console.log("Start Y:", ballBottomY);
    // console.log("End X:", vArrowEndX);
    // console.log("End Y:", vArrowEndY);

    velocityArrow.set({
        x1: ballCenterX,
        y1: ballBottomY,
        x2: vArrowEndX,
        y2: vArrowEndY
    });

    velocityArrow.setCoords();

    drawGroundLine();

    canvas.renderAll();
}

function simulateTrajectory() {
    // Clear previous animation and trajectory
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    // Remove previous trajectory and simulation objects
    canvas.getObjects().forEach(obj => {
        if (obj !== ball && obj !== angleArrow && obj !== velocityArrow && 
            obj !== xVelocityArrow && obj !== yVelocityArrow) {
                obj.dispose();
                canvas.remove(obj);
            }
        });

    canvas.renderOnAddRemove = false;

    drawGroundLine();

    const velocity = Number(velocitySlider.value);
    const angle = Number(angleSlider.value);
    const height = Number(heightSlider.value);
    const xPos = Number(xPosSlider.value);
    const timeMultiplier = Number(timeMultiplierSlider.value);

    const radAngle = angle * Math.PI / 180;
    const vx = velocity * Math.cos(radAngle);
    const vy = velocity * Math.sin(radAngle);

    // Trajectory calculation variables
    let x = xPos;
    let y = height;
    let t = 0;

    ball.set({
        left: x * 20 - 10,
        top: canvas.height - 20 - (y * 20)
    });

    let trajectoryPoints = [{x: ball.left + ball.radius, y: ball.top, t: 0}];
    let trajectoryPath = null;
    const MAX_POINTS = 200;
    const SAMPLE_INTERVAL = 0.05;

    let numOfCalculations = 0;

    function animate() {
        t += (0.03 * timeMultiplier);
        numOfCalculations++;
        x = xPos + vx * t;
        y = height + vy * t - 0.5 * GRAVITY * t * t;

        ball.set({
            left: x * 20 - 10,
            top: canvas.height - 20 - (y * 20)
        });

        const ballCenterX = ball.left + ball.radius;
        const ballBottomY = ball.top;

        if (trajectoryPoints.length === 0 || 
            (trajectoryPoints.length < MAX_POINTS && 
             Math.floor(t / SAMPLE_INTERVAL) !== Math.floor((t - 0.02) / SAMPLE_INTERVAL))) {
            trajectoryPoints.push({
                x: ballCenterX,
                y: ballBottomY,
                time: t
            });
        }

        if (trajectoryPoints.length > 1) {
            const path = new fabric.Polyline(trajectoryPoints, {
                stroke: 'blue',
                fill: false,
                strokeWidth: 2
            });
            canvas.insertAt(path, canvas.getObjects().length - 5);
        }

        const currentVx = vx;
        const currentVy = vy - GRAVITY * t;

        xVelocityArrow.set({
            x1: ballCenterX,
            y1: ballBottomY,
            x2: ballCenterX + currentVx * 5,
            y2: ballBottomY
        });

        yVelocityArrow.set({
            x1: ballCenterX,
            y1: ballBottomY,
            x2: ballCenterX,
            y2: ballBottomY - currentVy * 5
        });


        canvas.renderAll();

        //Once simulation finishes. 
        if (canvas.height - 20 - (y * 20) >= canvas.height-20) {
            const actualTime = (vy + Math.sqrt(vy * vy + 2 * GRAVITY * height)) / GRAVITY
            t = actualTime;
            trajectoryPoints.push({
                x: (xPos + vx * actualTime) * 20 ,
                y: canvas.height - 20,
                time: t
            });

            ball.set({
                left: x * 20 - 10,
                top: canvas.height - 20
            });

            const trajectoryPath = new fabric.Polyline(trajectoryPoints, {
                stroke: 'blue',
                fill: false,
                strokeWidth: 2
            });

            canvas.insertAt(trajectoryPath, canvas.getObjects().length - 5);
            drawMaxHeightAnnotation(
                Number(velocitySlider.value), 
                Number(angleSlider.value), 
                Number(heightSlider.value), 
                Number(xPosSlider.value)
            );
            enableTimeSlider(xPos, vx, vy, height, radAngle, t);
            const horizontalDistance = calculateHorizontalDistance(vx, radAngle, t);
            drawHorizontalDistanceVisualization(xPos, horizontalDistance); 
            cancelAnimationFrame(animationFrame);
            calculateTrajectoryResults(velocity, angle, height, xPos);
            return;
        }

        animationFrame = requestAnimationFrame(animate);
    }

    function enableTimeSlider(xStart, initialVx, initialVy, initialHeight, angleRad, simulationTime) {
        const timeSlider = document.getElementById('timeSlider');
        const timeSliderValue = document.getElementById('timeSliderValue');
        const decrementBtn = document.getElementById('decrementTimeBtn');
        const incrementBtn = document.getElementById('incrementTimeBtn');
        
        timeSlider.style.display = 'block';
        timeSliderValue.style.display = 'block';
        decrementBtn.style.display = 'block';
        incrementBtn.style.display = 'block';

        decrementBtn.disabled = false;
        incrementBtn.disabled = false;
        
        // Set max value for the slider in hundredths of a second
        timeSlider.max = Math.ceil(simulationTime * 1000.0); // Slider range in increments of 0.001 seconds
        timeSlider.value = timeSlider.max;  
        
        // Display the initial time value
        timeSliderValue.textContent = `${(timeSlider.value / 1000.0).toFixed(3)} s`;
    
        timeSlider.step = 1;
    
        // Existing time slider input handler
        timeSlider.oninput = () => {
            const time = timeSlider.value / 1000.0; // Convert slider value to seconds
            timeSliderValue.textContent = `${time.toFixed(3)} s`; 
            updateBallPositionFromTime(xStart, initialVx, initialVy, initialHeight, angleRad, timeSlider);
            const horizontalDistance = calculateHorizontalDistance(initialVx, angleRad, time);
            drawHorizontalDistanceVisualization(xStart, horizontalDistance);
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
                timeSlider.value = (currentValue - step).toFixed(3);
                timeSlider.dispatchEvent(new Event('input'));
            }
        });
    
        incrementBtn.addEventListener('click', () => {
            const currentValue = Number(timeSlider.value);
            const step = Number(timeSlider.step);
            
            if (currentValue < Number(timeSlider.max)) {
                timeSlider.value = (currentValue + step).toFixed(3);
                timeSlider.dispatchEvent(new Event('input'));
            }
        });
    }
    
    
    function calculateHorizontalDistance(initialVx, angleRad, time) {
        console.log("Max heightX: " + vx * time + ", " + "Time: " + time);
        return vx * time; // Horizontal distance traveled at the given time
    }
    
    function drawHorizontalDistanceVisualization(xStart, horizontalDistance) {

        canvas.getObjects().forEach(obj => {
            if (obj.customType === 'horizontalDistanceVisualization') {
                canvas.remove(obj);
            }
        });
    
        // Calculate scaled start and end points for the horizontal distance line
        const startX = xStart * 20;
        const endX = (xStart + horizontalDistance) * 20;
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
        const distanceText = new fabric.Text(`dx: ${horizontalDistance.toFixed(2)} m`, {
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
    function updateBallPositionFromTime(xStart, vx, vy, height, angleRad, slider) {
        const time = slider.value / 1000; // Convert slider value to seconds
        const timeSliderValue = document.getElementById('timeSliderValue');

        const x = xStart + vx * time;
        const y = height + vy * time - 0.5 * GRAVITY * time * time;

        // Update ball position
        ball.set({
            left: x * 20 - 10,
            top: canvas.height - 20 - Math.max(0, y) * 20 // Ensure it doesn't go below ground
        });


        const ballCenterX = ball.left + ball.radius;
        const ballBottomY = ball.top;

        //Update the velocity vectors
         
        const currentVx = vx;
        const currentVy = vy - GRAVITY * time;

        xVelocityArrow.set({
            x1: ballCenterX,
            y1: ballBottomY,
            x2: ballCenterX + currentVx * 5,
            y2: ballBottomY
        });

        yVelocityArrow.set({
            x1: ballCenterX,
            y1: ballBottomY,
            x2: ballCenterX,
            y2: ballBottomY - currentVy * 5
        });



        canvas.renderAll();
    }

    function drawMaxHeightAnnotation(velocity, angle, height, xPos) {
        // Convert angle to radians
        const radAngle = angle * Math.PI / 180;
    
        // Initial velocity components
        const vx = velocity * Math.cos(radAngle);
        const vy = velocity * Math.sin(radAngle);
    
        // Calculate time to reach max height
        const timeToMaxHeight = vy / GRAVITY;
    
        // Calculate max height using kinematic equation
        const maxHeight = height + (vy * vy) / (2 * GRAVITY);
    
        // Calculate horizontal distance at max height
        const maxHeightX = xPos + vx * timeToMaxHeight;
        console.log("Max heightX: " + maxHeightX + "Time: " + timeToMaxHeight);
    
        // Calculate position on canvas
        const maxHeightPointX = maxHeightX * 20;
        const maxHeightPointY = canvas.height - 20 - (maxHeight * 20);
    
        // Create a red dot at the max height point
        const maxHeightDot = new fabric.Circle({
            radius: 6,
            fill: 'yellow',
            left: maxHeightPointX,
            top: maxHeightPointY,
            originX: 'center',
            originY: 'center'
        });

        // Create a line from start to highest point
        const startY = canvas.height - 20 - (height * 20);
        const endY = canvas.height - 20 - (maxHeight * 20);
    
        const distanceLine = new fabric.Line([maxHeightPointX, startY, maxHeightPointX, endY], {
            stroke: 'black',
            strokeWidth: 2,
            strokeDashArray: [5, 5]  // Dashed line
        });

        const startBar = new fabric.Line([maxHeightPointX - 5, startY, maxHeightPointX + 5, startY],{
            stroke: 'black',
            strokeWidth: 2
        });
        const endBar = new fabric.Line([maxHeightPointX - 5, endY, maxHeightPointX + 5, endY],{
            stroke: 'black',
            strokeWidth: 2
        });

        const distanceText = new fabric.Text(`dy: ${(maxHeight - height).toFixed(2)} m`, {
            left: maxHeightPointX + 10,
            top: (startY + endY) / 2,
            fill: 'black',
            fontSize: 10,
            originX: 'left'
        });
    
        // Create text annotation with max height details
        const maxHeightText = new fabric.Text(
            `X Dist: ${maxHeightX.toFixed(2)} m\nTime: ${timeToMaxHeight.toFixed(2)} s`, 
            {
                left: maxHeightPointX,
                top: maxHeightPointY - 15,
                fill: 'black',
                fontSize: 10,
                originX: 'center',
                originY: 'bottom'
            }
        );
    
        // Add dot and text to the canvas
        canvas.add(maxHeightDot, maxHeightText);
        canvas.add(distanceLine, startBar, endBar, distanceText);
        canvas.renderAll();
    }

    function calculateTrajectoryResults(velocity, angle, height, xPos) {
        // Convert angle to radians
        const radAngle = angle * Math.PI / 180;
    
        // Initial velocity components
        const vx = velocity * Math.cos(radAngle);
        const vy = velocity * Math.sin(radAngle);
    
        // Time to reach ground (using quadratic formula for displacement)
        const timeOfFlight = (vy + Math.sqrt(vy * vy + 2 * GRAVITY * height)) / GRAVITY;
    
        // Horizontal distance
        const horizontalDistance = xPos + vx * timeOfFlight;
    
        // Maximum height
        const maxHeight = height + (vy * vy) / (2 * GRAVITY);
    
        // Final velocity components at ground
        const finalVx = vx;
        const finalVy = vy - GRAVITY * timeOfFlight;
        const finalVelocity = Math.sqrt(finalVx * finalVx + finalVy * finalVy);
    
        // Update results in the DOM
        document.getElementById('finalVelocity').textContent = finalVelocity.toFixed(2);
        document.getElementById('finalVelocityX').textContent = finalVx.toFixed(2);
        document.getElementById('finalVelocityY').textContent = finalVy.toFixed(2);
        document.getElementById('horizontalDistance').textContent = horizontalDistance.toFixed(2);
        document.getElementById('timeOfFlight').textContent = timeOfFlight.toFixed(2);
        document.getElementById('maxHeight').textContent = maxHeight.toFixed(2);
    }
    

    animate();
}





// Initialize simulation on page load
initializeVisualization();
drawGroundLine();

// Simulate button click handler
simulateBtn.addEventListener('click', simulateTrajectory);