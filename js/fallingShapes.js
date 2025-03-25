class FallingShapes {
  constructor() {
    this.gravity = 0.2;
    this.shapeRate = 1;
    this.shapes = [];
    this.isDeleting = false;

    this.container = document.getElementById("canvas");
    this.resizeCanvas();

    window.addEventListener("resize", () => this.resizeCanvas());
    this.app.ticker.add(this.animate.bind(this));
    this.updateShapeInterval();
  }

  initialize() {
    console.log("FallingShapes initialized");
    // Put any initialization logic here (e.g., set up the PIXI app, etc.)
  }

  resizeCanvas() {
    const { width, height } = this.container.getBoundingClientRect();

    if (this.app) {
      this.app.renderer.resize(width, height);
    } else {
      this.app = new PIXI.Application({
        width: width,
        height: height,
        backgroundColor: 0xffffff
      });
      this.container.appendChild(this.app.view);
    }

    // Update mask
    if (this.mask) this.mask.destroy();
    this.mask = new PIXI.Graphics();
    this.mask.beginFill(0xffffff);
    this.mask.drawRect(0, 0, width, height);
    this.mask.endFill();
    this.app.stage.addChild(this.mask);
  }
  createShape(x, y) {
    const types = [
      "triangle",
      "rectangle",
      "circle",
      "pentagon",
      "star",
      "irregular"
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = Math.random() * 0xffffff;
    const size = Math.random() * 50 + 20;

    x = Math.max(size / 2, Math.min(this.app.renderer.width - size / 2, x));

    const shape = new Shape(
      x,
      y,
      type,
      color,
      size,
      this.gravity,
      this.app,
      this.mask
    );
    this.shapes.push(shape);
    this.updateStats();
  }

  removeShape(shape) {
    this.isDeleting = true;
    this.shapes = this.shapes.filter((s) => s !== shape);
    this.updateStats();

    setTimeout(() => {
      this.isDeleting = false;
    }, 300);
  }

  updateStats() {
    const visibleShapes = this.shapes.filter(
      (shape) => shape.shape.y <= this.app.renderer.height
    );
    document.getElementById("shapeCount").textContent = visibleShapes.length;
    document.getElementById("shapeArea").textContent = visibleShapes
      .reduce((sum, shape) => sum + shape.area, 0)
      .toFixed(2);
  }

  animate() {
    this.shapes.forEach((shape, index) => {
      shape.update();

      if (shape.y - shape.size > this.app.renderer.height) {
        this.shapes.splice(index, 1);
        shape.destroy();
      }
    });

    this.updateStats();
  }

  changeShapeRate(value) {
    this.shapeRate = Math.max(1, this.shapeRate + value);
    document.getElementById("shapeRate").textContent = this.shapeRate;
    this.updateShapeInterval();
  }

  changeGravity(value) {
    this.gravity = Math.max(0.05, this.gravity + value * 0.05);
    document.getElementById("gravityValue").textContent =
      this.gravity.toFixed(2);
    this.shapes.forEach((shape) => (shape.vy = this.gravity));
  }

  updateShapeInterval() {
    clearInterval(this.shapeInterval);
    this.shapeInterval = setInterval(() => {
      for (let i = 0; i < this.shapeRate; i++) {
        this.createShape(Math.random() * this.app.renderer.width, -30);
      }
    }, 1000);
  }
  onCanvasClick(event) {
    if (this.isDeleting) return;

    const rect = this.app.view.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.createShape(x, y);
  }

  onCanvasTouch(event) {
    if (this.isDeleting) return;

    const rect = this.app.view.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.createShape(x, y);
  }
}

document
  .getElementById("canvas")
  .addEventListener("click", (event) => fallingShapes.onCanvasClick(event));

document.getElementById("canvas").addEventListener("touchstart", (event) => {
  if (event.touches.length === 1) {
    fallingShapes.onCanvasTouch(event);
  }
});