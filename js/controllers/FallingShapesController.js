import CanvasView from "../views/CanvasView.js";
import Shape from "../models/Shape.js";

export default class FallingShapesController {
  constructor() {
    this.gravity = 0.2;
    this.shapeRate = 1;
    this.shapes = [];
    this.shapeInterval = null;

    // This flag is used to prevent creating a new shape
    // if a user is actually clicking on a shape (to remove it).
    this.isDeleting = false;

    // HTML elements
    this.canvasContainer = document.getElementById("canvas");
    this.shapeCountEl = document.getElementById("shapeCount");
    this.shapeAreaEl = document.getElementById("shapeArea");
    this.shapeRateEl = document.getElementById("shapeRate");
    this.gravityValueEl = document.getElementById("gravityValue");

    // View
    this.view = new CanvasView(this.canvasContainer);

    // Bind controls
    this.bindControls();
  }

  initialize() {
    this.view.resizeCanvas();
    this.view.app.ticker.add(() => this.animate());
    this.updateShapeInterval();
  }

  bindControls() {
    // Canvas clicks and touches
    this.canvasContainer.addEventListener("click", (e) => this.onCanvasClick(e));
    this.canvasContainer.addEventListener(
        "touchstart",
        (event) => {
          // Prevent the synthetic "click" from firing
          event.preventDefault();
          // Create the shape only once
          if (event.touches.length === 1) {
            this.onCanvasTouch(event);
          }
        },
        { passive: false } // allows event.preventDefault() to work in mobile browsers
      );

    // Rate
    document.getElementById("decreaseRate").addEventListener("click", () => this.changeShapeRate(-1));
    document.getElementById("increaseRate").addEventListener("click", () => this.changeShapeRate(1));

    // Gravity
    document.getElementById("decreaseGravity").addEventListener("click", () => this.changeGravity(-1));
    document.getElementById("increaseGravity").addEventListener("click", () => this.changeGravity(1));
  }

  // Interval for automatic shape creation
  updateShapeInterval() {
    if (this.shapeInterval) clearInterval(this.shapeInterval);
    this.shapeInterval = setInterval(() => {
      for (let i = 0; i < this.shapeRate; i++) {
        this.createRandomShape();
      }
    }, 1000);
  }

  createRandomShape() {
    const size = Math.random() * 40 + 20;
  
    const startY = -size - 10;
  
    const randomX = Math.random() * this.view.app.renderer.width;
    this.createShape(randomX, startY, size);
  }
  

  createShape(x, y) {
    // Random size
    const size = Math.random() * 40 + 20;
    const clampedX = Math.max(size / 2, Math.min(this.view.app.renderer.width - size / 2, x));

    // Random type & color
    const types = ["triangle", "rectangle", "pentagon", "hexagon", "circle", "ellipse", "star", "irregular"];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = Math.floor(Math.random() * 0xffffff);

    const shape = new Shape(
      clampedX,
      y,
      type,
      color,
      size,
      this.gravity,
      this.view.app,
      this.view.mask,
      (shapeRef) => this.removeShape(shapeRef)
    );

    this.shapes.push(shape);
    this.updateStats();
  }

  removeShape(shape) {
    // Block new shape creation on this click
    this.isDeleting = true;
  
    this.view.app.stage.removeChild(shape.shape);
  
    shape.destroy();
  
    this.shapes = this.shapes.filter((s) => s !== shape);
  
    this.updateStats();
  
    setTimeout(() => {
      this.isDeleting = false;
    }, 300);
  }

  animate() {
    // Move shapes
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const s = this.shapes[i];
      s.update();
      // Remove if out of bottom
      if (s.shape.y - s.size > this.view.app.renderer.height) {
        s.destroy();
        this.shapes.splice(i, 1);
      }
    }
    this.updateStats();
  }

  onCanvasClick(event) {
    // If we are in a 'removing shape' phase, skip creating a new one
    if (this.isDeleting) return;

    const rect = this.view.app.view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.createShape(x, y);
  }

  onCanvasTouch(event) {
    if (this.isDeleting) return;
    
    if (event.touches.length === 1) {
      const rect = this.view.app.view.getBoundingClientRect();
      const touch = event.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.createShape(x, y);
    }
  }

  // Increase or decrease shape generation rate
  changeShapeRate(value) {
    this.shapeRate = Math.max(1, this.shapeRate + value);
    this.shapeRateEl.textContent = this.shapeRate;
    this.updateShapeInterval();
  }

  // Increase or decrease gravity
  changeGravity(value) {
    this.gravity = Math.max(0.05, this.gravity + value * 0.05);
    this.gravityValueEl.textContent = this.gravity.toFixed(2);
    this.shapes.forEach((s) => (s.vy = this.gravity));
  }

  updateStats() {
    // Only count shapes that have at least partially entered the canvas
    const visibleShapes = this.shapes.filter((shape) => {
      const topEdge = shape.shape.y - shape.size / 2;
      const bottomEdge = shape.shape.y + shape.size / 2;
      // Return true if it is within the canvas vertical bounds
      return bottomEdge >= 0 && topEdge <= this.view.app.renderer.height;
    });
  
    document.getElementById("shapeCount").textContent = visibleShapes.length;
  
    // Sum the area of only the visible shapes
    const totalArea = visibleShapes.reduce((acc, cur) => acc + cur.area, 0);
    document.getElementById("shapeArea").textContent = totalArea.toFixed(2);
  }
  
}
