// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

function asteroids() {
  interface controllable {
    // interface to define some data needed for objects that need to be controlled
    leftKeyDown: boolean;
    rightKeyDown: boolean;
    forwardKeyDown: boolean;
    spacebarDown: boolean;
    setKeyDown: (key: string) => void;
    setKeyUp: (key: string) => void;
  }

  abstract class BasicEntity {
    // the base entity that all our svg elements will extend
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

    // every svg will need to implement their own way to update svg movement depending on svg type
    abstract updateSVGMovementAttributes(): void;
    
    // every svg will need to implement their own way to move
    abstract move(): void;

    // every svg will need to implement their own way to update
    abstract update(): void;

    // height and width are needed for collision detection
    abstract setEntityHeight(): void;

    abstract setEntityWidth(): void;

    destroy() {
      // remove svg from screen
      this.basicEntity.elem.remove();
      // overwrite the whole gameObjects/lasers array to avoid mutating
      gameObjects = gameObjects.filter((gameObject) => {
        return gameObject !== this;
      })
      lasers = lasers.filter((gameObject) => {
        return gameObject !== this;
      })
      // replace observables with new data
      gameObjectsObservable = updateObservableFromArray(gameObjects);
      lasersObservable = updateObservableFromArray(lasers);
    };

    // wrap object so for torus topology
    wrap() {
      if (this.x < 0) {
        this.x += 600;
      }
      if (this.x > 600) {
        this.x = 0;
      }
      if (this.y < 0) {
        this.y += 600;
      }
      if (this.y > 600) {
        this.y = 0;
      }
    }

    setEntity(entity: Elem) {
      this.basicEntity = entity;
    }

    // simple function to convert from angle to radians needed for movement calculations
    toRadians(angle: number) {
      return angle * (Math.PI / 180);
    }

    increaseVelocity() {
      if (this.velocity < 1) {
        this.velocity += 0.1;
      }
    }

    // this will be called each frame to slow the ship down
    slowlyDecreaseVelocity() {
      if (this.velocity > 0) {
        this.velocity -= 0.01;
      }
    }
  }  

  class Ship extends BasicEntity implements controllable {
    spacebarDown: boolean = false;
    leftKeyDown: boolean = false;
    rightKeyDown: boolean = false;
    forwardKeyDown: boolean = false;
    parentElement: HTMLElement;
    rotate: number = 0;
    
    constructor(parentElement: HTMLElement, xStart: number, yStart: number) {
      super(objectTypes.player, xStart, yStart);
      this.setEntityHeight();
      this.setEntityWidth();
      const ship = createPolygon(parentElement, ["-15,20", "15,20", "0,-20"]);
      this.setEntity(ship);
      this.parentElement = parentElement;
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
      // manipulate svg elements. Not happy with the amount of side effects here
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
        this.spacebarDown = true;
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
        this.spacebarDown = false;
      }
    }

    setRotation(newRot: number) {
      this.rotate = this.rotate + newRot;
    }

    rotateLeft() {
      // adjust angle ship is facing
      this.setRotation(-5);
    }

    rotateRight() {
      // adjust angle ship is facing
      this.setRotation(5);
    }

    shoot() {
      // to create a laser, give it the same movement characteristics as the ship to give the illusion of it being 'shot'
      const pewPew = new Laser(this.parentElement, 5, this.x, this.y, this.getXDirection(), this.getYDirection());
      // keep track in both gameObjects and lasers for quick iteration
      gameObjects.push(pewPew);
      lasers.push(pewPew);
      // have to reset the key press, or lots of lasers are fired
      this.spacebarDown = false;
    }

    getXDirection() {
      // get the x component of movement using sin of angle the ship is currently facing
      // use modulo because rotation can go beyond 360
      const adjustedRotation = this.rotate % 360;
      return Math.sin(this.toRadians(adjustedRotation));
    }

    getYDirection() {
      // get the y component of movement using sin of angle the ship is currently facing
      // use modulo because rotation can go beyond 360
      const adjustedRotation = this.rotate % 360;
      return Math.cos(this.toRadians(adjustedRotation));
    }

    move() {
      const xComponentOfMovement = this.getXDirection()
      const yComponentOfMovement = this.getYDirection();
      const moveX = this.speed * xComponentOfMovement;
      // multiply y by -1 because its backwards
      const moveY = -1 * this.speed * yComponentOfMovement;

      // multiple by velocity to achieve thrust like behaviour
      this.x += moveX * this.velocity;
      this.y += moveY * this.velocity;
      // implement wrapping so ship can fly off screen
      this.wrap();
      // transform svg
      this.updateSVGMovementAttributes();
    }
    
    update() {
      // basic update method to be called by gameloop
      if (this.leftKeyDown) {
        this.rotateLeft();
      }
      if (this.rightKeyDown) {
        this.rotateRight();
      }
      if (this.forwardKeyDown) {
        this.increaseVelocity();
      }
      if (this.spacebarDown) {
        this.shoot();
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
      const asteroid = createEllipse(parentElement, this.x, this.y, this.radius, this.radius, "brown");
      this.setEntity(asteroid);
      // set random speed
      this.speed = Math.floor(Math.random() * 5);
      if (this.speed === 0) {
        this.speed = 1;
      }
      // set random direction by picking random number between 0 and 360 to get an angle
      const randomDirection = Math.floor(Math.random() * 360);
      this.xDirection = this.speed * Math.sin(this.toRadians(randomDirection));
      // again multiply by -1 because y direction is backwards
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
      this.wrap();
    }
    update(): void {
      this.move();
    }
  }  

  class Laser extends BasicEntity {
    xDirection: number;
    yDirection: number;
    radius: number;
    constructor(parentElement: HTMLElement, _radius: number, xStart: number, yStart: number, _xDirection: number, _yDirection: number) {
      super(objectTypes.laser, xStart, yStart);
      // this is the movement information given straight from the ship to make it look lie the laser has been shot
      this.xDirection = _xDirection;
      this.yDirection = _yDirection;
      this.radius = _radius;
      this.speed = 10;
      this.setEntityHeight();
      this.setEntityWidth();
      const laser = createEllipse(parentElement, this.x, this.y, this.radius, this.radius, "white");
      this.setEntity(laser);
    }

    updateSVGMovementAttributes(): void {
      this.basicEntity.attr("cx", this.x);
      this.basicEntity.attr("cy", this.y);
    };  

    move(): void {
      // this laser simply needs to move each frame, nothing else
      this.x += this.speed * this.xDirection;
      this.y += -1 * this.speed * this.yDirection;
      this.updateSVGMovementAttributes();
      if (this.x < 0 || this.y < 0 || this.x > 600 || this.y > 600) {
        // destroy laser if it leaves the screen
        this.destroy();
      };
    };

    update(): void {
      this.move();
    };

    setEntityHeight(): void {
      this.height = 5;
    };

    setEntityWidth(): void {
      this.width = 5;
    };
  }

  const gameLoop = Observable.interval(16.7); // gameloop set to 60fps. achieved by dividing 1000/60
  let shippyBoy: Ship; // ship reference
  let gameObjects: Array<BasicEntity> = []; // an array of gameobjects that we can use to test collisions and keep track of everything
  let lasers: Array<BasicEntity> = []; // an array of laser objects that we can use to test collisions for each asteroid
  // object types given to each type of entity for easy checking
  const objectTypes = {
    player: 0,
    asteroid: 1,
    laser: 2
  };
  let score = 0;
  let lasersObservable = Observable.fromArray<BasicEntity>(lasers); // create observable from laser array
  let gameObjectsObservable = Observable.fromArray<BasicEntity>(gameObjects); // create observable from game objects
  const keyDownEventsObservable = Observable.fromEvent<KeyboardEvent>(document, 'keydown'); // observable from document keydown events
  const keyUpEventsObservable = Observable.fromEvent<KeyboardEvent>(document, 'keyup'); // observable from document keyup events

  const createEllipse = (parentElement:HTMLElement, xCenter: number, yCenter: number, xRadius: number, yRadius: number, color: string): Elem => {
    // function to easily create an ellipse
    return new Elem(parentElement, 'ellipse')
      .attr("cx", xCenter)
      .attr("cy", yCenter)
      .attr("rx", xRadius)
      .attr("ry", yRadius)
      .attr("style", "fill:" + color);
  };

  const createPolygon = (parentElement:HTMLElement, pointsList: Array<string>): Elem => {
    // function to easily create a polygon
    return new Elem(parentElement, 'polygon') 
      .attr("points",pointsList.join(" "))
      .attr("style","fill:lime;stroke:purple;stroke-width:1")
  };

  const collision = (entityOne: BasicEntity, entityTwo: BasicEntity): boolean => {
    // function used to detect collions using the same method learnt in this unit from earlier labs (ie checking for overlap)
    if (entityOne.x < entityTwo.x + entityTwo.width &&
        entityOne.x + entityOne.width > entityTwo.x &&
        entityOne.y < entityTwo.y + entityTwo.height &&
        entityOne.y + entityOne.height > entityTwo.y
      ) {
        return true;
      } else {
        return false;
      }
  };

  const updateObservableFromArray = <T>(observable: Array<T>): Observable<T> => {
    // function to replace an observable with a new observable with latest data
    return Observable.fromArray<T>(observable);
  };

  const spawnAsteroid = () => {
    // spawn an ateroid with a random radius
    let radius = Math.floor((Math.random() * 50));
    if (radius < 10) {
      radius += 5;
    }
    gameObjects.push(new Asteroid(svg, radius));
  }

  const resetScore = () => {
    score = 0;
  }

  const incrementScore = () => {
    score += 1;
    updateScoreUI();
  }

  const endGame = () => {
    // set visibility of ui elements
    if (gameOverElement && scoreHeader) {
      setVisibility(gameOverElement, true);
      setVisibility(scoreHeader, false);
    };
  };

  const setVisibility = (ele: HTMLElement, visible: boolean) => {
    visible === true? ele.style.visibility = "visible": ele.style.visibility = "hidden"; 
  }

  const updateScoreUI = () => {
    if (scoreElement) {
      scoreElement.innerText = score.toString();
    }; 
  }

  const reset = () => {
    // remove all existing game objects
    gameObjects.forEach((gameObject) => {
      gameObject.basicEntity.elem.remove();
    })
    gameObjects = [];
    lasers = [];
    resetScore();
    updateScoreUI();
    // reset observables
    gameObjectsObservable = updateObservableFromArray(gameObjects);
    lasersObservable = updateObservableFromArray(lasers);
    // change ui to reflect new game
    if (gameOverElement && scoreHeader) {
      setVisibility(gameOverElement, false);
      setVisibility(scoreHeader, true);
    };
    // spawn new ship
    shippyBoy = new Ship(svg, 300, 300);
    gameObjects.push(shippyBoy);
    spawnAsteroid();
  }

  // setup game
  const svg = document.getElementById("canvas")!;
  const scoreElement = document.getElementById("score");
  const scoreHeader = document.getElementById("scoreHeader");
  const gameOverElement = document.getElementById("gameOver");
  const retryButton = document.getElementById("retryButton");
  shippyBoy = new Ship(svg, 300, 300);
  gameObjects.push(shippyBoy);
  spawnAsteroid();

  if (retryButton) {
    Observable.fromEvent(retryButton, 'click').subscribe((event) => {
      reset();
    });
  }

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
    gameObjectsObservable
      .forEach((gameObject) => {
        gameObject.update();
      })
      .subscribe((gameObject) => {
        if (gameObject.objectType === objectTypes.asteroid) {
          if (collision(shippyBoy, gameObject)) {
            shippyBoy.destroy();
            gameObject.destroy();
            endGame();
          }
          lasersObservable
            .forEach((laser) => {
              if (collision(laser, gameObject)) {
                laser.destroy();
                gameObject.destroy();
                incrementScore();
                spawnAsteroid();
              }
            })
            .subscribe(() => {});
        }
      })
  });

}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
