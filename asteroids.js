"use strict";
function asteroids() {
    class Shippyboy {
        constructor(ship) {
            this.rotate = 0;
            this.x = 300;
            this.y = 300;
            this.shippyboy = ship;
        }
        setPossy() {
            const possy = "translate(" + this.x + " " + this.y + ") " + "rotate(" + this.rotate + ")";
            this.shippyboy.attr("transform", possy.toString());
        }
        toRadians(angle) {
            return angle * (Math.PI / 180);
        }
        move() {
            console.log("current rotation", this.rotate);
            console.log("current rotation mod", this.rotate % 360);
            console.log("current x", this.x);
            console.log("current y", this.y);
            console.log("x rad", this.toRadians(this.x));
            console.log("y rad", this.toRadians(this.y));
            const adjrot = this.rotate % 360;
            console.log("sin", Math.sin(this.toRadians(adjrot)));
            console.log("cos", Math.cos(this.toRadians(adjrot)));
            const adjx = Math.sin(this.toRadians(adjrot));
            const adjy = Math.cos(this.toRadians(adjrot));
            const moveX = 10 * adjx;
            const moveY = -1 * 10 * adjy;
            console.log(moveX);
            console.log(moveY);
            this.x += moveX;
            this.y += moveY;
            this.setPossy();
        }
        setRotate(newRot) {
            this.rotate = this.rotate + newRot;
            this.setPossy();
        }
    }
    const svg = document.getElementById("canvas");
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300) rotate(180)");
    let ship = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:lime;stroke:purple;stroke-width:1");
    const shippyBoy = new Shippyboy(g);
    Observable.fromEvent(document, 'keydown')
        .map((event) => {
        return event.key;
    })
        .subscribe((keyCode) => {
        if (keyCode == "ArrowRight") {
            shippyBoy.setRotate(20);
        }
        else if (keyCode == "ArrowLeft") {
            shippyBoy.setRotate(-20);
        }
        else if (keyCode == "ArrowUp") {
            shippyBoy.move();
        }
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map