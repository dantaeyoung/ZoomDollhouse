/*
 * @name Flocking
 * @description Demonstration of <a href="http://www.red3d.com/cwr/">Craig Reynolds' "Flocking" behavior</a>.<br>
 * (Rules: Cohesion, Separation, Alignment.)<br>
 * From <a href="http://natureofcode.com">natureofcode.com</a>.
 */
let boids = [];

var roomnames = ["MSRED", "UP", "CCCP", "Conservation", "HP", "MArch500N", "MArch500S", "MArch600N", "MArch600S", "MArch700", "MSHP301", "MSUD206", "UD", "WoodShop", "MakerSpace", "March", "MSRED", "MSUP202", "UPPhD", "GSAPP", "RED"];

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('sketch-holder');

  // Add an initial set of boids into the system
  for (let i = 0; i < 20; i++) {
    boids[i] = new Boid(roomnames[i], random(width), random(height));
  }
  window.boids = boids;
  textAlign(CENTER, CENTER);
  textFont('Helvetica');
}

function draw() {
  background(255);
  // Run all the boids
  for (let i = 0; i < boids.length; i++) {
    boids[i].run(boids);
  }
}

// Boid class
// Methods for Separation, Cohesion, Alignment added
class Boid {
  constructor(name, x, y) {
    this.name = name;
    this.acceleration = createVector(0, 0);
    this.velocity = p5.Vector.random2D();
    this.position = createVector(x, y);
    this.r = 80.0;
    this.maxspeed = 2;    // Maximum speed
    this.maxforce = 0.05; // Maximum steering force
  }

  run(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
  }
  
  // Forces go into acceleration
  applyForce(force) {
    this.acceleration.add(force);
  }
  
  // We accumulate a new acceleration each time based on three rules
  flock(boids) {
    let sep = this.separate(boids); // Separation
    let ali = this.align(boids);    // Alignment
    let coh = this.cohesion(boids); // Cohesion
    let foc = this.focus(boids); // Focus
    // Arbitrarily weight these forces
    sep.mult(3.6);
    ali.mult(2.0);
      coh.mult(1.0);
      foc.mult(0.5);
    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
    this.applyForce(foc);
  }
  
  // Method to update location
  update() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
  }
  
  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  }
  
  // Draw boid as a circle
    render() {

          if (mouseIsPressed) {
    fill(200,127, 127);
    stroke(255);
  } else {
    fill(100,127, 127);
    stroke(237, 34, 93);
  }
        //    fill(100,127, 127);
        noStroke(200);
        //khk    stroke(0, 255,00);
    ellipse(this.position.x, this.position.y, this.r, this.r);
    textSize(22);
    fill(100, 202, 153);
    text(this.name + ":\n 2 people", this.position.x, this.position.y);
    
  }
  
  // Wraparound
  borders() {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  }
  
  // Separation
  // Method checks for nearby boids and steers away
  separate(boids) {
    let steer = createVector(0, 0);
    let count = 0;
    var thisdesiredseparation = this.r * 1;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < thisdesiredseparation)) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, boids[i].position);
        diff.normalize();
        diff.div(d); // Weight by distance
        steer.add(diff);
        count++; // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }
  
    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }
  
  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  align(boids) {
    let sum = createVector(0, 0);
    let count = 0;
    var thisneighbordist = this.r;

    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);

      if ((d > 0) && (d < thisneighbordist)) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }
  
  // Cohesion
  // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
  cohesion(boids) {
    let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    
    var thisneighbordist = this.r * 1.5;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);


      if ((d > 0) && (d < thisneighbordist)) {
        sum.add(boids[i].position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  }
    // Focus
  focus(boids) {
    return this.seek(createVector(mouseX, mouseY));
  }  

}


