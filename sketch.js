let n = 20;
let globalTime = 0.0;
let drawPath = true;
let timeStep = 0.01;
// Get width and height from html
let screenWidthX = window.innerWidth / 1.5;
let screenHeightY = window.innerHeight / 1.5;
let midScreenX = screenWidthX / 2;
let midScreenY = screenHeightY / 2;
let midScreen = { X: midScreenX, Y: midScreenY };
// List of values 
let drawColor = [255, 255, 255, 255];
let mouseInCanvas = true;
let canvas; 

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
    let dt = (2 * PI) / (path.length - 1);
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

function addMidPoints(path){
    temp = [];
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
    return temp; 
}

function regularInterval() {
    // The amount of poitns should be a minimum of the amount of circles
    // This function will fix points to regular intervals and by certain step size to make sure there are enough points
    // First start by adding a lot of midpoitns between each poin 
    
    let temp = [];
    if (path.length < n * 5) {
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
    let stepSize = 1 * (n ** (1 / 3)) / 20;
    let temp2 = [];
    let curDist = 0;
    for (let i = 0; i < temp.length - 1; i++) {
        curDist += dist(temp[i][0], temp[i][1], temp[i + 1][0], temp[i + 1][1]);
        if (curDist >= stepSize) {
            temp2.push([temp[i][0], temp[i][1]]);
            curDist = 0;
        }
        
    }
   
    // Now add midpoints again to make sure there are enough points
    while (temp2.length < n) {
        temp2 = addMidPoints(temp2);
    } 

    path = temp2;

}

function setup() {
    // REmove last canvas as welll

 
    canvas = createCanvas(screenWidthX, screenHeightY);
    canvas.parent("canvas-holder");

    button.style.display = "block";
    button.style.left = "50%";
    button.style.top = "50%";
    // Text 
    button.innerHTML = "Draw Fourier";


    // add functionality
    button.onclick = function () {
        drawPath = false;
        // add a delay
        let timer = millis();
        while (millis() - timer < 1000) {
            // do nothing
        }
        // remove last path point
        path.pop();
        setup();
    }

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
let vel; 
let button = document.getElementById("fourierButton");
// Conver tthe above code into p5.js javascript into the new draw() 
function draw() {
    // ------------------ Variable updator from html ------------------


    if (drawPath) {
        // Draw button to draw fourier
        // fOURIER BUTTON

        if (mouseIsPressed && (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)) {
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
        // Check if mouse is prsesed in bottom left corner to draw fourier
        if (keyIsPressed) {
            // REmove last path point
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
        text("Points: " + str(path.length), 10, 30);
        // Frames per second
        // Color based on fps from 0 to 60
        fill(255 * (frameRate() / 60), 255 * (1 - (frameRate() / 60)), 0, 255);
        text("FPS: " + str(frameRate()), 10, 40);

        // Velocity, calculated by the distance between the last two points of the tracer
        fill(255);
        if (frameCount % 5 == 0) {
            vel = dist(path[path.length - 1][0], path[path.length - 1][1], path[path.length - 2][0], path[path.length - 2][1]) / (1 / frameRate());
        }       
        text("Velocity: " + str(vel), 10, 50); 


        // User instructions
        fill(255);
        textSize(20);
        strokeWeight(0);
        stroke(drawColor);


        let prevX = midScreen.X;
        let prevY = midScreen.Y;


        stroke(255, 0, 0, 100);
        // print circle list
        cList = cList.sort((a, b) => b.radius - a.radius);

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
        globalTime += timeStep;

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
            if (key == "s"){
                // Save constants in the following format radius [value, value, value ... value] and phase [value, value, value ... value] and the initial point
                let log = "r_{c}=[";
                for (let i = 0; i < n; i++) {
                    log += cList[i].radius + ", ";
                }
                // remove last commaii
                log = log.substring(0, log.length - 2);
                log += "]\nv_{c}=[";
                for (let i = 0; i < n; i++) {
                    log += cList[i].v + ", ";
                }
                // remove last comma 
                log = log.substring(0, log.length - 2);

               
                log += "]\na_{c}=["; 
                for (let i = 0; i < n; i++) {
                    log += cList[i].offset + PI + ", ";
                }
                log = log.substring(0, log.length - 2);
                log += "]"; 

               
                console.log(log);
                
                // copy to clipboard
                navigator.clipboard.writeText(log);
                // add a delay
                let delay = millis() + 500;
                while (millis() < delay) {
                    // do nothing
                }


            }
        }
        // if mouse is pressed reset the drawingo also make sure it is inside the window 
        if (mouseIsPressed) {
            if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
                // redraw path
                background(0);
                path = [];
                tracer = [];
                drawPath = true;
                setup();
            }
        }
    }
}

function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - 1; j++) {
      if (parseFloat(arr[j].radius) < parseFloat(arr[j + 1].radius)) {
        let tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  return arr;
}