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

    // Angle Arrow
    angleArrow = new fabric.Line([ball.left, ball.top, ball.left, ball.top], {
        stroke: 'green',
        strokeWidth: 5,
        opacity: 1
    });
    canvas.add(angleArrow);

    // Velocity Arrow
    velocityArrow = new fabric.Line([ball.left, ball.top, ball.left, ball.top], {
        stroke: 'purple',
        strokeWidth: 5,
        opacity: 1
    });
    canvas.add(velocityArrow);

    // X and Y Velocity Arrows (initially hidden)
    xVelocityArrow = new fabric.Line([0, 0, 0, 0], {
        stroke: 'blue',
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

    console.log("Visualization Update Inputs:");
    console.log("Velocity:", velocity);
    console.log("Angle:", angle);
    console.log("Height:", height);
    console.log("X Position:", xPos);
    console.log("Radian Angle:", radAngle);
    console.log("Velocity X:", vx);
    console.log("Velocity Y:", vy);

    // Update ball position
    ball.set({
        left: xPos * 20 - 10,
        top: canvas.height - 20 - (height * 20),
        originY: 'bottom'
    });

    // Calculate the bottom-middle position of the ball
    const ballCenterX = ball.left + ball.radius;
    const ballBottomY = ball.top;

    console.log("Ball Center X:", ballCenterX);
    console.log("Ball Bottom Y:", ballBottomY);

    // Update Angle Arrow
    const arrowLength = 10;
    const endX = ballCenterX + arrowLength * Math.cos(radAngle);
    const endY = ballBottomY - arrowLength * Math.sin(radAngle);
    
    console.log("Angle Arrow Calculation:");
    console.log("Start X:", ballCenterX);
    console.log("Start Y:", ballBottomY);
    console.log("End X:", endX);
    console.log("End Y:", endY);

    angleArrow.set({
        x1: ballCenterX,
        y1: ballBottomY,
        x2: endX,
        y2: endY
    });

    // Update Velocity Arrow
    const velocityArrowLength = velocity * 5;
    const vArrowEndX = ballCenterX + velocityArrowLength * Math.cos(radAngle);
    const vArrowEndY = ballBottomY - velocityArrowLength * Math.sin(radAngle);
    
    console.log("Velocity Arrow Calculation:");
    console.log("Start X:", ballCenterX);
    console.log("Start Y:", ballBottomY);
    console.log("End X:", vArrowEndX);
    console.log("End Y:", vArrowEndY);

    velocityArrow.set({
        x1: ballCenterX,
        y1: ballBottomY,
        x2: vArrowEndX,
        y2: vArrowEndY
    });

    angleArrow.setCoords();
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
            trajectoryPoints.push({
                x: ballCenterX,
                y: ballBottomY,
                time: t
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
            drawHorizontalDistanceVisualization(xPos, vx, t); 
            cancelAnimationFrame(animationFrame);
            calculateTrajectoryResults(velocity, angle, height, xPos);
            return;
        }

        animationFrame = requestAnimationFrame(animate);
    }


    function enableTimeSlider(xStart, initialVx, initialVy, initialHeight, angleRad, simulationTime) {
        const timeSlider = document.getElementById('timeSlider');
        const timeSliderValue = document.getElementById('timeSliderValue');
    
        timeSlider.style.display = 'block';
        timeSliderValue.style.display = 'block';
    
        timeSlider.max = Math.ceil(simulationTime * 100); // Slider range in increments of 0.01 seconds
        timeSlider.value = timeSlider.max;
        timeSliderValue.textContent = `${(timeSlider.max/100).toFixed(2)} s`; // Display initial time value
    
        timeSlider.oninput = () => updateBallPositionFromTime(
            xStart, initialVx, initialVy, initialHeight, angleRad, timeSlider
        );
    }

    function drawHorizontalDistanceVisualization(xStart, initialVx, simulationTime) {
        // Calculate horizontal distance
        const horizontalDistance = xStart + initialVx * simulationTime;
    
        // Create a line from start to end point
        const startX = xPos * 20;
        const endX = (xStart + initialVx * simulationTime) * 20;
        const groundY = canvas.height - 20;
    
        const distanceLine = new fabric.Line([startX, groundY - 15, endX, groundY - 15], {
            stroke: 'black',
            strokeWidth: 2,
            strokeDashArray: [5, 5]  // Dashed line
        });

        const startBar = new fabric.Line([startX, groundY - 5, startX, groundY - 25],{
            stroke: 'black',
            strokeWidth: 3
        });
        const endBar = new fabric.Line([endX, groundY - 5, endX, groundY - 25],{
            stroke: 'black',
            strokeWidth: 3
        });
        canvas.add(distanceLine);
        canvas.add(startBar);
        canvas.add(endBar);
    
        // Create text to show horizontal distance
        const distanceText = new fabric.Text(`dx: ${horizontalDistance.toFixed(2)} m`, {
            left: (startX + endX) / 2,
            top: groundY - 30,
            fill: 'black',
            fontSize: 12,
            originX: 'center'
        });
        canvas.add(distanceText);
    
        canvas.renderAll();

    }


    // Update the ball's position based on the slider value
    function updateBallPositionFromTime(xStart, vx, vy, height, angleRad, slider) {
        const time = slider.value / 100; // Convert slider value to seconds
        const timeSliderValue = document.getElementById('timeSliderValue');

        const x = xStart + vx * time;
        const y = height + vy * time - 0.5 * GRAVITY * time * time;

        // Update ball position
        ball.set({
            left: x * 20 - 10,
            top: canvas.height - 20 - Math.max(0, y) * 20 // Ensure it doesn't go below ground
        });

        // Update the time display
        timeSliderValue.textContent = `${time.toFixed(2)} s`;

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
    
        // Calculate position on canvas
        const maxHeightPointX = maxHeightX * 20;
        const maxHeightPointY = canvas.height - 20 - (maxHeight * 20);
    
        // Create a red dot at the max height point
        const maxHeightDot = new fabric.Circle({
            radius: 6,
            fill: 'red',
            left: maxHeightPointX,
            top: maxHeightPointY,
            originX: 'center',
            originY: 'bottom'
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
            fontSize: 12,
            originX: 'left'
        });
    
        // Create text annotation with max height details
        const maxHeightText = new fabric.Text(
            `X Dist: ${maxHeightX.toFixed(2)} m\nTime: ${timeToMaxHeight.toFixed(2)} s`, 
            {
                left: maxHeightPointX,
                top: maxHeightPointY - 15,
                fill: 'black',
                fontSize: 12,
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
    
        // Vertical distance traveled
        const verticalDistance = maxHeight + height;
    
        // Update results in the DOM
        document.getElementById('finalVelocity').textContent = finalVelocity.toFixed(2);
        document.getElementById('finalVelocityX').textContent = finalVx.toFixed(2);
        document.getElementById('finalVelocityY').textContent = finalVy.toFixed(2);
        document.getElementById('horizontalDistance').textContent = horizontalDistance.toFixed(2);
        document.getElementById('verticalDistance').textContent = verticalDistance.toFixed(2);
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
