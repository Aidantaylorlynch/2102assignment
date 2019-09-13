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
        destroy() {
            this.basicEntity.elem.remove();
            gameObjects = gameObjects.filter((gameObject) => {
                return gameObject !== this;
            });
            lasers = lasers.filter((gameObject) => {
                return gameObject !== this;
            });
            gameObjectsObservable = updateObservableFromArray(gameObjects);
            lasersObservable = updateObservableFromArray(lasers);
        }
        ;
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
            this.spacebarDown = false;
            this.leftKeyDown = false;
            this.rightKeyDown = false;
            this.forwardKeyDown = false;
            this.rotate = 0;
            this.setEntityHeight();
            this.setEntityWidth();
            const ship = createPolygon(parentElement, ["-15,20", "15,20", "0,-20"]);
            this.setEntity(ship);
            this.parentElement = parentElement;
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
                this.spacebarDown = true;
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
                this.spacebarDown = false;
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
            const pewPew = new Laser(this.parentElement, 5, this.x, this.y, this.getXDirection(), this.getYDirection());
            gameObjects.push(pewPew);
            lasers.push(pewPew);
            this.spacebarDown = false;
        }
        getXDirection() {
            const adjustedRotation = this.rotate % 360;
            return Math.sin(this.toRadians(adjustedRotation));
        }
        getYDirection() {
            const adjustedRotation = this.rotate % 360;
            return Math.cos(this.toRadians(adjustedRotation));
        }
        move() {
            const xComponentOfMovement = this.getXDirection();
            const yComponentOfMovement = this.getYDirection();
            const moveX = this.speed * xComponentOfMovement;
            const moveY = -1 * this.speed * yComponentOfMovement;
            this.x += moveX * this.velocity;
            this.y += moveY * this.velocity;
            this.wrap();
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
            if (this.spacebarDown) {
                this.shoot();
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
            const asteroid = createEllipse(parentElement, this.x, this.y, this.radius, this.radius, "brown");
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
            this.wrap();
        }
        ;
        update() {
            this.move();
        }
        ;
    }
    class Laser extends BasicEntity {
        constructor(parentElement, _radius, xStart, yStart, _xDirection, _yDirection) {
            super(objectTypes.laser, xStart, yStart);
            this.xDirection = _xDirection;
            this.yDirection = _yDirection;
            this.radius = _radius;
            this.speed = 10;
            this.setEntityHeight();
            this.setEntityWidth();
            const laser = createEllipse(parentElement, this.x, this.y, this.radius, this.radius, "white");
            this.setEntity(laser);
        }
        updateSVGMovementAttributes() {
            this.basicEntity.attr("cx", this.x);
            this.basicEntity.attr("cy", this.y);
        }
        ;
        move() {
            this.x += this.speed * this.xDirection;
            this.y += -1 * this.speed * this.yDirection;
            this.updateSVGMovementAttributes();
            if (this.x < 0 || this.y < 0 || this.x > 600 || this.y > 600) {
                this.destroy();
            }
            ;
        }
        ;
        update() {
            this.move();
        }
        ;
        setEntityHeight() {
            this.height = 5;
        }
        ;
        setEntityWidth() {
            this.width = 5;
        }
        ;
    }
    const gameLoop = Observable.interval(16.7);
    let shippyBoy;
    let gameObjects = [];
    let lasers = [];
    const objectTypes = {
        player: 0,
        asteroid: 1,
        laser: 2
    };
    let score = 0;
    let lasersObservable = Observable.fromArray(lasers);
    let gameObjectsObservable = Observable.fromArray(gameObjects);
    const keyDownEventsObservable = Observable.fromEvent(document, 'keydown');
    const keyUpEventsObservable = Observable.fromEvent(document, 'keyup');
    const svg = document.getElementById("canvas");
    const scoreElement = document.getElementById("score");
    const scoreHeader = document.getElementById("scoreHeader");
    const gameOverElement = document.getElementById("gameOver");
    const retryButton = document.getElementById("retryButton");
    const createEllipse = (parentElement, xCenter, yCenter, xRadius, yRadius, color) => {
        return new Elem(parentElement, 'ellipse')
            .attr("cx", xCenter)
            .attr("cy", yCenter)
            .attr("rx", xRadius)
            .attr("ry", yRadius)
            .attr("style", "fill:" + color);
    };
    const createPolygon = (parentElement, pointsList) => {
        return new Elem(parentElement, 'polygon')
            .attr("points", pointsList.join(" "))
            .attr("style", "fill:lime;stroke:purple;stroke-width:1");
    };
    const collision = (entityOne, entityTwo) => {
        if (entityOne.x < entityTwo.x + entityTwo.width &&
            entityOne.x + entityOne.width > entityTwo.x &&
            entityOne.y < entityTwo.y + entityTwo.height &&
            entityOne.y + entityOne.height > entityTwo.y) {
            return true;
        }
        else {
            return false;
        }
    };
    const updateObservableFromArray = (observable) => {
        return Observable.fromArray(observable);
    };
    const spawnAsteroid = () => {
        let radius = Math.floor((Math.random() * 50));
        if (radius < 10) {
            radius += 5;
        }
        gameObjects.push(new Asteroid(svg, radius));
    };
    const resetScore = () => {
        score = 0;
    };
    const incrementScore = () => {
        score += 1;
        updateScoreUI();
    };
    const endGame = () => {
        if (gameOverElement && scoreHeader) {
            setVisibility(gameOverElement, true);
            setVisibility(scoreHeader, false);
        }
        ;
    };
    const setVisibility = (ele, visible) => {
        visible === true ? ele.style.visibility = "visible" : ele.style.visibility = "hidden";
    };
    const updateScoreUI = () => {
        if (scoreElement) {
            scoreElement.innerText = score.toString();
        }
        ;
    };
    const reset = () => {
        gameObjects.forEach((gameObject) => {
            gameObject.basicEntity.elem.remove();
        });
        gameObjects = [];
        lasers = [];
        resetScore();
        updateScoreUI();
        gameObjectsObservable = updateObservableFromArray(gameObjects);
        lasersObservable = updateObservableFromArray(lasers);
        if (gameOverElement && scoreHeader) {
            setVisibility(gameOverElement, false);
            setVisibility(scoreHeader, true);
        }
        ;
        shippyBoy = new Ship(svg, 300, 300);
        gameObjects.push(shippyBoy);
        spawnAsteroid();
    };
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
                    .subscribe(() => { });
            }
        });
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map