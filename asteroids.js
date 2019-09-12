"use strict";
function asteroids() {
    const gameLoop = Observable.interval(16.7);
    const keyDownEvents = Observable.fromEvent(document, 'keydown');
    const keyUpEvents = Observable.fromEvent(document, 'keyup');
    class Shippyboy {
        constructor(ship) {
            this.rotate = 0;
            this.x = 300;
            this.y = 300;
            this.velocity = 0;
            this.speed = 5;
            this.leftKeyDown = false;
            this.rightKeyDown = false;
            this.forwardKeyDown = false;
            this.shippyboy = ship;
        }
        updateSVGAttributes() {
            const transform = "translate(" + this.x + " " + this.y + ") " + "rotate(" + this.rotate + ")";
            this.shippyboy.attr("transform", transform.toString());
        }
        toRadians(angle) {
            return angle * (Math.PI / 180);
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
            this.updateSVGAttributes();
        }
        setRotation(newRot) {
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
    const svg = document.getElementById("canvas");
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300) rotate(180)");
    let ship = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:lime;stroke:purple;stroke-width:1");
    const shippyBoy = new Shippyboy(g);
    keyDownEvents.map((event) => {
        console.log("keydown");
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
    });
    keyUpEvents.map((event) => {
        console.log("keyup");
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
    });
    gameLoop.subscribe((frame) => {
        shippyBoy.update();
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map