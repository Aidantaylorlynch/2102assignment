// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

function asteroids() {
  const gameLoop = Observable.interval(16.7);
  const keyDownEvents = Observable.fromEvent<KeyboardEvent>(document, 'keydown');
  const keyUpEvents = Observable.fromEvent<KeyboardEvent>(document, 'keyup');

  class Shippyboy {
    shippyboy: Elem;
    rotate: number = 0;
    x: number = 300;
    y: number = 300;
    velocity: number = 0;
    leftKeyDown: boolean = false;
    rightKeyDown: boolean = false;
    forwardKeyDown: boolean = false;

    constructor(ship: Elem) {
      this.shippyboy = ship;
    }

    updateSVGAttributes() {
      const transform = "translate(" + this.x + " " + this.y + ") " + "rotate(" + this.rotate + ")";
      this.shippyboy.attr("transform", transform.toString());
    }

    toRadians(angle: number) {
      return angle * (Math.PI / 180);
    }

    move() {
      // console.log("current rotation", this.rotate)
      // console.log("current rotation mod", this.rotate % 360)
      // console.log("current x", this.x)
      // console.log("current y", this.y)
      // console.log("x rad", this.toRadians(this.x))
      // console.log("y rad", this.toRadians(this.y))
      const adjrot = this.rotate % 360;
      // console.log("sin", Math.sin(this.toRadians(adjrot)))
      // console.log("cos", Math.cos(this.toRadians(adjrot)))
      const adjx = Math.sin(this.toRadians(adjrot))
      const adjy = Math.cos(this.toRadians(adjrot))
      const moveX = 10 * adjx;
      // time y by -1 because its backwards
      const moveY = -1 * 10 * adjy;
      // console.log(moveX)
      // console.log(moveY)
      this.x += moveX * this.velocity;
      this.y += moveY * this.velocity;
      if (this.x < 0) {
        this.x += 600;
      }
      if (this.x > 600) {
        this.x = 0;
      }
      if (this.y < 0) {
        this.y += 600;
      }
      if (this.x > 600) {
        this.y = 0;
      }
      this.updateSVGAttributes();
    }

    setRotation(newRot: number) {
      this.rotate = this.rotate + newRot;
      this.updateSVGAttributes();
    }

    rotateLeft() {
      this.setRotation(-5);
    }

    rotateRight() {
      this.setRotation(5);
    }

    increaseVelocity() {
      if (this.velocity < 1) {
        this.velocity += 0.1;
      }
    }

    slowlyDecreaseVelocity() {
      if (this.velocity > 0) {
        this.velocity -= 0.01;
      }
    }

    setKeyDown(key: string) {
      if (key === "left") {
        this.leftKeyDown = true;
      } else if (key === "right") {
        this.rightKeyDown = true;
      } else if (key === "forward") {
        this.forwardKeyDown = true;
      }
    }

    setKeyUp(key: string) {
      if (key === "left") {
        this.leftKeyDown = false;
      } else if (key === "right") {
        this.rightKeyDown = false;
      } else if (key === "forward") {
        this.forwardKeyDown = false;
      }
    }

    update() {
      if (this.leftKeyDown) {
        this.rotateLeft();
      }
      if (this.rightKeyDown) {
        this.rotateRight();
      }
      if (this.forwardKeyDown) {
        this.increaseVelocity();
      }
      this.slowlyDecreaseVelocity();
      this.move();
    }
  }
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
  // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.
  const svg = document.getElementById("canvas")!;
  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property 

  let g = new Elem(svg,'g')
    .attr("transform","translate(300 300) rotate(180)")  
  
  // create a polygon shape for the space ship as a child of the transform group
  let ship = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:lime;stroke:purple;stroke-width:1")

  const shippyBoy = new Shippyboy(g);
  
  keyDownEvents.map((event) => {
    console.log("keydown")
    return event.key;
  }).subscribe((keyCode) => {
    if(keyCode == "ArrowRight") {
      shippyBoy.setKeyDown("right");
    } 
    if (keyCode == "ArrowLeft") {
      shippyBoy.setKeyDown("left");
    }
    if (keyCode == "ArrowUp") {
      // shippyBoy.move();
      shippyBoy.setKeyDown("forward");
    }
  });

  keyUpEvents.map((event) => {
    console.log("keyup")
    return event.key;
  }).subscribe((keyCode) => {
    if(keyCode == "ArrowRight") {
      shippyBoy.setKeyUp("right");
    } 
    if (keyCode == "ArrowLeft") {
      shippyBoy.setKeyUp("left");
    }
    if (keyCode == "ArrowUp") {
      // shippyBoy.move();
      shippyBoy.setKeyUp("forward");
    }
  });

  gameLoop.subscribe((frame: number) => {
    shippyBoy.update();
  });

}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
