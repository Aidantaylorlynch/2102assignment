// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

function asteroids() {
  interface controllable {
    leftKeyDown: boolean;
    rightKeyDown: boolean;
    forwardKeyDown: boolean;
    spacebar: boolean;
    setKeyDown: (key: string) => void;
    setKeyUp: (key: string) => void;
  }

  abstract class BasicEntity {
    basicEntity!: Elem;
    objectType: number;
    x: number;
    y: number;
    velocity: number = 0;
    speed: number = 5;
    height!: number;
    width!: number;
  

    constructor(_objectType: number, _x: number, _y: number) {
      this.objectType = _objectType;
      this.x = _x;
      this.y = _y;
    }

    abstract updateSVGMovementAttributes(): void;

    abstract move(): void;

    abstract update(): void;

    abstract setEntityHeight(): void;

    abstract setEntityWidth(): void;

    setEntity(entity: Elem) {
      this.basicEntity = entity;
    }

    toRadians(angle: number) {
      return angle * (Math.PI / 180);
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
  }  

  class Ship extends BasicEntity implements controllable {
    spacebar: boolean = false;
    leftKeyDown: boolean = false;
    rightKeyDown: boolean = false;
    forwardKeyDown: boolean = false;
    rotate: number = 0;
    
    constructor(parentElement: HTMLElement, xStart: number, yStart: number) {
      super(objectTypes.player, xStart, yStart);
      this.setEntityHeight();
      this.setEntityWidth();
      const ship = createPolygon(parentElement, ["-15,20", "15,20", "0,-20"]);
      this.setEntity(ship);
    }

    setEntityHeight(): void {
      // hard coding because we only need to set it once
      this.height = 40;
    }

    setEntityWidth(): void {
      // hard coding because we only need to set it once
      this.width = 30;
    }

    updateSVGMovementAttributes() {
      const transform = "translate(" + this.x + " " + this.y + ") " + "rotate(" + this.rotate + ")";
      this.basicEntity.attr("transform", transform.toString());
    }
    
    setKeyDown(key: string) {
      if (key === "left") {
        this.leftKeyDown = true;
      } else if (key === "right") {
        this.rightKeyDown = true;
      } else if (key === "forward") {
        this.forwardKeyDown = true;
      } else if (key === "spacebar") {
        this.spacebar = true;
      }
    }

    setKeyUp(key: string) {
      if (key === "left") {
        this.leftKeyDown = false;
      } else if (key === "right") {
        this.rightKeyDown = false;
      } else if (key === "forward") {
        this.forwardKeyDown = false;
      } else if (key === "spacebar") {
        this.spacebar = false;
      }
    }

    setRotation(newRot: number) {
      this.rotate = this.rotate + newRot;
    }

    rotateLeft() {
      this.setRotation(-5);
    }

    rotateRight() {
      this.setRotation(5);
    }

    shoot() {
      const lasyBoy = new Laser(this.x, this.y);
    }

    move() {
      const adjustedRotation = this.rotate % 360;

      const xComponentOfMovement = Math.sin(this.toRadians(adjustedRotation));
      const yComponentOfMovement = Math.cos(this.toRadians(adjustedRotation));
      const moveX = this.speed * xComponentOfMovement;
      // time y by -1 because its backwards
      const moveY = -1 * this.speed * yComponentOfMovement;

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
      this.updateSVGMovementAttributes();
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

  class Asteroid extends BasicEntity {
    xDirection: number;
    yDirection: number;
    radius: number;
    constructor(parentElement: HTMLElement, _radius: number) {
      // spawn an asteroid randomly
      super(objectTypes.asteroid, Math.floor((Math.random() * 600)), Math.floor((Math.random() * 600)));
      this.radius = _radius;
      this.setEntityHeight();
      this.setEntityWidth();
      const asteroid = createEllipse(parentElement, this.x, this.y, this.radius, this.radius);
      this.setEntity(asteroid);
      // set random speed
      this.speed = Math.floor(Math.random() * 5);
      if (this.speed === 0) {
        this.speed = 1;
      }
      // set random direction by picking random number between 0 and 360 to get an angle
      const randomDirection = Math.floor(Math.random() * 360);
      this.xDirection = this.speed * Math.sin(this.toRadians(randomDirection));
      this.yDirection = -1 * this.speed * Math.cos(this.toRadians(randomDirection));
    }

    setEntityHeight(): void {
      this.height = this.radius * 2;
    }

    setEntityWidth(): void {
      this.width = this.radius * 2;
    }

    updateSVGMovementAttributes(): void {
      this.basicEntity.attr("cx", this.x);
      this.basicEntity.attr("cy", this.y);
    }    

    move(): void {
      this.x += this.xDirection;
      this.y += this.yDirection;
      this.updateSVGMovementAttributes();
    }
    update(): void {
      this.move();
    }
  }  

  class Laser extends BasicEntity {
    constructor(xStart: number, yStart: number) {
      super(objectTypes.laser, xStart, yStart);
    }
    updateSVGMovementAttributes(): void {
      throw new Error("Method not implemented.");
    }    move(): void {
      throw new Error("Method not implemented.");
    }
    update(): void {
      throw new Error("Method not implemented.");
    }
    setEntityHeight(): void {
      throw new Error("Method not implemented.");
    }
    setEntityWidth(): void {
      throw new Error("Method not implemented.");
    }
  }

  const gameLoop = Observable.interval(16.7);
  const gameObjects: Array<BasicEntity> = [];
  const objectTypes = {
    player: 0,
    asteroid: 1,
    laser: 2
  };
  
  const gameObjectsObservable = Observable.fromArray<BasicEntity>(gameObjects);
  const keyDownEventsObservable = Observable.fromEvent<KeyboardEvent>(document, 'keydown');
  const keyUpEventsObservable = Observable.fromEvent<KeyboardEvent>(document, 'keyup');

  const createEllipse = (parentElement:HTMLElement, xCenter: number, yCenter: number, xRadius: number, yRadius: number): Elem => {
    return new Elem(parentElement, 'ellipse')
      .attr("cx", xCenter)
      .attr("cy", yCenter)
      .attr("rx", xRadius)
      .attr("ry", yRadius)
      .attr("style", "fill:brown")
  };
  const createPolygon = (parentElement:HTMLElement, pointsList: Array<string>): Elem => {
    return new Elem(parentElement, 'polygon') 
      .attr("points",pointsList.join(" "))
      .attr("style","fill:lime;stroke:purple;stroke-width:1")
  };
  const createLine = (parentElement:HTMLElement, x1: number, y1: number, x2: number, y2: number) => {
    return new Elem(parentElement, 'line') 
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke","white")
  }
  const collision = (entityOne: BasicEntity, entityTwo: BasicEntity): boolean => {
    if (entityOne.x < entityTwo.x + entityTwo.width &&
        entityOne.x + entityOne.width > entityTwo.x &&
        entityOne.y < entityTwo.y + entityTwo.height &&
        entityOne.y + entityOne.height > entityTwo.y
      ) {
        console.log("collision!")
        return true;
      } else {
        return false;
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

  // let g = new Elem(svg,'g')

  // create a polygon shape for the space ship as a child of the transform group
  // let ship = new Elem(svg, 'polygon') 
  //   .attr("points","-15,20 15,20 0,-20")
  //   .attr("style","fill:lime;stroke:purple;stroke-width:1")
  
  // let ship = createPolygon(svg, ["-15,20", "15,20", "0,-20"]);
  
  // let asteroid = createEllipse(svg, 200, 200, 30, 30);

  const shippyBoy = new Ship(svg, 300, 300);
  const astyBoy = new Asteroid(svg, 20);
  // createLine(svg, 20, 20, 25, 25);

  gameObjects.push(shippyBoy);
  gameObjects.push(astyBoy);

  keyDownEventsObservable.map((event) => {
    return event.key;
  }).subscribe((keyCode) => {
    if(keyCode == "ArrowRight") {
      shippyBoy.setKeyDown("right");
    } 
    if (keyCode == "ArrowLeft") {
      shippyBoy.setKeyDown("left");
    }
    if (keyCode == "ArrowUp") {
      shippyBoy.setKeyDown("forward");
    }
    if (keyCode == " ") {
      shippyBoy.setKeyDown("spacebar");
    }
  });

  keyUpEventsObservable.map((event) => {
    return event.key;
  }).subscribe((keyCode) => {
    if(keyCode == "ArrowRight") {
      shippyBoy.setKeyUp("right");
    } 
    if (keyCode == "ArrowLeft") {
      shippyBoy.setKeyUp("left");
    }
    if (keyCode == "ArrowUp") {
      shippyBoy.setKeyUp("forward");
    }
    if (keyCode == " ") {
      shippyBoy.setKeyUp("spacebar");
    }
  });

  gameLoop.subscribe((frame: number) => {
    gameObjects.forEach((gameObject) => {
      gameObject.update();
      gameObjectsObservable.map((gameObject) => {
        return gameObject;
      }).subscribe((gameObject) => {
        if (gameObject.objectType === objectTypes.asteroid) {
          if (collision(shippyBoy, gameObject)) {
            console.log("now do something")
            // do something you bastard
          }
        }
      })
    });
  });

}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
