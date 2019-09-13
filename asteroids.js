"use strict";
function asteroids() {
    class BasicEntity {
        constructor(_objectType, _x, _y) {
            this.velocity = 0;
            this.speed = 5;
            this.objectType = _objectType;
            this.x = _x;
            this.y = _y;
        }
        setEntity(entity) {
            this.basicEntity = entity;
        }
        toRadians(angle) {
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
    class Ship extends BasicEntity {
        constructor(parentElement, xStart, yStart) {
            super(objectTypes.player, xStart, yStart);
            this.spacebar = false;
            this.leftKeyDown = false;
            this.rightKeyDown = false;
            this.forwardKeyDown = false;
            this.rotate = 0;
            this.setEntityHeight();
            this.setEntityWidth();
            const ship = createPolygon(parentElement, ["-15,20", "15,20", "0,-20"]);
            this.setEntity(ship);
        }
        setEntityHeight() {
            this.height = 40;
        }
        setEntityWidth() {
            this.width = 30;
        }
        updateSVGMovementAttributes() {
            const transform = "translate(" + this.x + " " + this.y + ") " + "rotate(" + this.rotate + ")";
            this.basicEntity.attr("transform", transform.toString());
        }
        setKeyDown(key) {
            if (key === "left") {
                this.leftKeyDown = true;
            }
            else if (key === "right") {
                this.rightKeyDown = true;
            }
            else if (key === "forward") {
                this.forwardKeyDown = true;
            }
            else if (key === "spacebar") {
                this.spacebar = true;
            }
        }
        setKeyUp(key) {
            if (key === "left") {
                this.leftKeyDown = false;
            }
            else if (key === "right") {
                this.rightKeyDown = false;
            }
            else if (key === "forward") {
                this.forwardKeyDown = false;
            }
            else if (key === "spacebar") {
                this.spacebar = false;
            }
        }
        setRotation(newRot) {
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
        constructor(parentElement, _radius) {
            super(objectTypes.asteroid, Math.floor((Math.random() * 600)), Math.floor((Math.random() * 600)));
            this.radius = _radius;
            this.setEntityHeight();
            this.setEntityWidth();
            const asteroid = createEllipse(parentElement, this.x, this.y, this.radius, this.radius);
            this.setEntity(asteroid);
            this.speed = Math.floor(Math.random() * 5);
            if (this.speed === 0) {
                this.speed = 1;
            }
            const randomDirection = Math.floor(Math.random() * 360);
            this.xDirection = this.speed * Math.sin(this.toRadians(randomDirection));
            this.yDirection = -1 * this.speed * Math.cos(this.toRadians(randomDirection));
        }
        setEntityHeight() {
            this.height = this.radius * 2;
        }
        setEntityWidth() {
            this.width = this.radius * 2;
        }
        updateSVGMovementAttributes() {
            this.basicEntity.attr("cx", this.x);
            this.basicEntity.attr("cy", this.y);
        }
        move() {
            this.x += this.xDirection;
            this.y += this.yDirection;
            this.updateSVGMovementAttributes();
        }
        update() {
            this.move();
        }
    }
    class Laser extends BasicEntity {
        constructor(xStart, yStart) {
            super(objectTypes.laser, xStart, yStart);
        }
        updateSVGMovementAttributes() {
            throw new Error("Method not implemented.");
        }
        move() {
            throw new Error("Method not implemented.");
        }
        update() {
            throw new Error("Method not implemented.");
        }
        setEntityHeight() {
            throw new Error("Method not implemented.");
        }
        setEntityWidth() {
            throw new Error("Method not implemented.");
        }
    }
    const gameLoop = Observable.interval(16.7);
    const gameObjects = [];
    const objectTypes = {
        player: 0,
        asteroid: 1,
        laser: 2
    };
    const gameObjectsObservable = Observable.fromArray(gameObjects);
    const keyDownEventsObservable = Observable.fromEvent(document, 'keydown');
    const keyUpEventsObservable = Observable.fromEvent(document, 'keyup');
    const createEllipse = (parentElement, xCenter, yCenter, xRadius, yRadius) => {
        return new Elem(parentElement, 'ellipse')
            .attr("cx", xCenter)
            .attr("cy", yCenter)
            .attr("rx", xRadius)
            .attr("ry", yRadius)
            .attr("style", "fill:brown");
    };
    const createPolygon = (parentElement, pointsList) => {
        return new Elem(parentElement, 'polygon')
            .attr("points", pointsList.join(" "))
            .attr("style", "fill:lime;stroke:purple;stroke-width:1");
    };
    const createLine = (parentElement, x1, y1, x2, y2) => {
        return new Elem(parentElement, 'line')
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "white");
    };
    const collision = (entityOne, entityTwo) => {
        if (entityOne.x < entityTwo.x + entityTwo.width &&
            entityOne.x + entityOne.width > entityTwo.x &&
            entityOne.y < entityTwo.y + entityTwo.height &&
            entityOne.y + entityOne.height > entityTwo.y) {
            console.log("collision!");
            return true;
        }
        else {
            return false;
        }
    };
    const svg = document.getElementById("canvas");
    const shippyBoy = new Ship(svg, 300, 300);
    const astyBoy = new Asteroid(svg, 20);
    gameObjects.push(shippyBoy);
    gameObjects.push(astyBoy);
    keyDownEventsObservable.map((event) => {
        return event.key;
    }).subscribe((keyCode) => {
        if (keyCode == "ArrowRight") {
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
        if (keyCode == "ArrowRight") {
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
    gameLoop.subscribe((frame) => {
        gameObjects.forEach((gameObject) => {
            gameObject.update();
            gameObjectsObservable.map((gameObject) => {
                return gameObject;
            }).subscribe((gameObject) => {
                if (gameObject.objectType === objectTypes.asteroid) {
                    if (collision(shippyBoy, gameObject)) {
                        console.log("now do something");
                    }
                }
            });
        });
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map