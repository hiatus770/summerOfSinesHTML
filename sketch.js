let n = 20;
let globalTime = 0.0;
let drawPath = true;

// Get width and height from html
let screenWidthX = window.innerWidth/2;
let screenHeightY = window.innerHeight/2;
let midScreenX = screenWidthX / 2;
let midScreenY = screenHeightY / 2;
let midScreen = { X: midScreenX, Y: midScreenY };
// List of values 
let drawColor = [255, 255, 255, 255];


// Create global empty array for path
let path = [];

// Make tracer
let tracer = [];

// List of constants c 
let c = [[]];

// List of circles
let circles = []; // using circ class 

let temp = [];

/// Create path image 
let img;

class circ {
    constructor(x, y, real, imaginary, v) {
        this.x = x;
        this.y = y;
        this.real = real;
        this.imaginary = imaginary;
        this.v = v;
        this.radius = Math.sqrt(real * real + imaginary * imaginary);
        this.offset = atan2(imaginary, real);
    }

    drawCirc(time) {
        let theta = (this.v * time) + this.offset;
        let xOff = this.radius * Math.cos(theta);
        let yOff = this.radius * Math.sin(theta);
        strokeWeight(2);
        line(this.x, this.y, this.x + xOff, this.y - yOff);

        let arrowSize = this.radius / 20 + 1;
        let x1 = this.x + xOff;
        let y1 = this.y - yOff;
        let x2 = this.x + xOff - arrowSize * cos(theta + PI / 6);
        let y2 = this.y - yOff + arrowSize * sin(theta + PI / 6);
        let x3 = this.x + xOff - arrowSize * cos(theta - PI / 6);
        let y3 = this.y - yOff + arrowSize * sin(theta - PI / 6);

        stroke(255, 255, 255);
        fill(255, 255, 255, 10);
        triangle(x1, y1, x2, y2, x3, y3);

    }
    getXEnd(time) {
        let theta = (this.v * time) + this.offset;
        let xOff = this.radius * cos(theta);
        let yOff = this.radius * sin(theta);
        return this.x + xOff;
    }

    getYEnd(time) {
        let theta = (this.v * time) + this.offset;
        let xOff = this.radius * cos(theta);
        let yOff = this.radius * sin(theta);
        return this.y - yOff;
    }

    getXcos(time) {
        let theta = (this.v * time) + this.offset;
        let xOff = this.radius * cos(theta);
        return xOff;
    }

    getYsin(time) {
        let theta = (this.v * time) + this.offset;
        let yOff = this.radius * sin(theta);
        return yOff;
    }
}

function calculateConstant(index) {
    let dt = (2 * PI) / (path.length-1);
    let index2 = index - (n / 2);
    let realSum = 0.0;
    let imaginarySum = 0.0;

    for (let i = 1; i < path.length; i++) {
        let realF = path[i][0];
        let imaginaryF = path[i][1];
        let t = dt * i;

        realSum += realF * cos(index2 * t) + imaginaryF * sin(index2 * t);
        imaginarySum += imaginaryF * cos(index2 * t) - realF * sin(index2 * t);
    }
    realSum /= (2 * PI);
    imaginarySum /= (2 * PI);
    realSum *= dt;
    imaginarySum *= dt;
    c[index][0] = realSum;
    c[index][1] = imaginarySum;
}

function regularInterval() {
    // The amount of poitns should be a minimum of the amount of circles
    // This function will fix points to regular intervals and by certain step size to make sure there are enough points
    // First start by adding a lot of midpoitns between each point
    let temp = [];
    if (path.length < n * 5){
        for (let i = 0; i < path.length - 1; i++) {
            let x1 = path[i][0];
            let y1 = path[i][1];
            let x2 = path[i + 1][0];
            let y2 = path[i + 1][1];
            let midX = (x1 + x2) / 2;
            let midY = (y1 + y2) / 2;
            temp.push([x1, y1]);
            temp.push([midX, midY]);
        }
        temp.push([path[path.length - 1][0], path[path.length - 1][1]]);
    } else {
        temp = path;
    }

    // Now make the distance between each point a certain step size
    let stepSize = 1 * (n**(1/3))/20;
    let temp2 = [];
    let curDist = 0;
    for (let i = 0; i < temp.length - 1; i++) {
        curDist += dist(temp[i][0], temp[i][1], temp[i + 1][0], temp[i + 1][1]);
        if (curDist >= stepSize) {
            temp2.push([temp[i][0], temp[i][1]]);
            curDist = 0;
        } 
    }
    temp2.push([temp[temp.length - 1][0], temp[temp.length - 1][1]]);
    path = temp2;
}

function setup() {
    createCanvas(screenWidthX, screenHeightY);
    if (!drawPath) {
        console.log("Drawing path");
        stroke(255);

        regularInterval();

        // new 2d array with length n and 2 
        c = new Array(n);
        for (let i = 0; i < n; i++) {
            c[i] = new Array(2);
        }
        for (let i = 0; i < n; i++) {
            calculateConstant(i);
        }

        // ------------------ IMAGE ------------------
        img = createImage(screenWidthX, screenHeightY);
        img.loadPixels();
        let pg = createGraphics(screenWidthX, screenHeightY);
        pg.background(0);
        pg.strokeWeight(3);
        for (let i = 0; i < path.length - 1; i++) {
            pg.stroke(200, 200, 200, 255);
            pg.fill(255, 255, 255, 255);
            pg.line(midScreen.X + path[i][0], midScreen.Y - path[i][1], midScreen.X + path[i + 1][0], midScreen.Y - path[i + 1][1]);
        }
        // set pg to img
        img = pg;
        img.updatePixels();

        // ------------------ CIRCLE INITILAIZATION ------------------
        cList = new Array(n);
        for (let i = 0; i < n; i++) {
            cList[i] = new circ(midScreen.X, midScreen.X, c[i][0], c[i][1], i - (n / 2));
        }


    } else {

        background(0);
        stroke(255);

    }



}

// Conver tthe above code into p5.js javascript into the new draw() 
function draw() {
    if (drawPath) {
        if (mouseIsPressed) {

            // User instructions
            fill(255);
            textSize(20);
            strokeWeight(0);
            stroke(drawColor);
            text("Click to draw, press any key to draw fourier", 10, 30);

            strokeWeight(3); 
            temp = [mouseX - midScreen.X, midScreen.Y - mouseY];
            noFill();
            if (path.length == 0) {
                path.push(temp);
            } else {
                path.push(temp);
                if (path.length > 2) {
                    line(midScreen.X + path[path.length - 2][0], midScreen.Y - path[path.length - 2][1], midScreen.X + path[path.length - 1][0], midScreen.Y - path[path.length - 1][1]);
                }
            }
        }
        if (keyIsPressed) {
            drawPath = false;
            // Delay for 500ms
            let delay = millis() + 500;
            while (millis() < delay) {
                // do nothing
            }

            let log = "";
            for (let i = 1; i < path.length; i++) {
                log += path[i][0] + " + " + path[i][1] + "i, ";
            }


            setup();
        }
    } else {
        background(0);
        image(img, 0, 0);

        fill(255);
        textSize(10);
        stroke(255);
        strokeWeight(0);
        text("Circles: " + str(n), 10, 20);
        // points 
        text ("Points: " + str(path.length), 10, 30);
        // Frames per second
        // Color based on fps from 0 to 60
        fill(255 * (frameRate() / 60), 255 * (1 - (frameRate() / 60)), 0, 255); 
        text("FPS: " + str(frameRate()), 10, 40);

        // User instructions
        fill(255);
        textSize(20);
        strokeWeight(0);
        stroke(drawColor);


        let prevX = midScreen.X;
        let prevY = midScreen.Y;


        stroke(255, 0, 0, 100);
        for (let i = 0; i < n; i++) {
            cList[i].x = prevX;
            cList[i].y = prevY;
            stroke(70);
            noFill();
            circle(prevX, prevY, cList[i].radius * 2);
            stroke(255, 255, 255, 100);
            noFill();
            cList[i].drawCirc(globalTime);
            prevX = cList[i].getXEnd(globalTime);
            prevY = cList[i].getYEnd(globalTime);
            if (i == n - 1) {
                let temp = [[prevX, prevY]];
                tracer.push(temp);
            }
            if (tracer.length > 1000 && tracer.length != 0) {
                tracer.shift();
            }
        }
        // Draw the path
        for (let i = 0; i < tracer.length - 1; i++) {
            let temp = tracer[i];
            let temp2 = tracer[i + 1];
            
            // Make color based on globaltime
            let redval = 255 * (sin(globalTime) + 1) / 2;
            let greenval = 255 * (sin(globalTime + PI / 2) + 1) / 2;
            let blueval = 255 * (sin(globalTime + PI) + 1) / 2;
            
            stroke(redval, greenval, blueval, 255); 
            line(temp[0][0], temp[0][1], temp2[0][0], temp2[0][1]);
        }

        if (globalTime > 2 * PI) {
            globalTime = 0;
        }
        globalTime += 0.02;

        if (keyIsPressed) {
            //  Rest
            if (key == 'r') {
                globalTime = 0;
                // reset path 
                tracer = [];
            }
            if (key == 'i') {
                // Increase N and reset everything
                tracer = [];
                n += 4;
                background(0);
                globalTime = 0;
                setup();

            }
        }
        // if mouse is pressed reset the drawing 
        if (mouseIsPressed) {
            // redraw path
            background(0);
            path = [];
            tracer = [];
            drawPath = true;
            setup();
        }
    }
}
