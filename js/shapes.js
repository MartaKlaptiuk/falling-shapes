class Shape {
  constructor(x, y, type, color, size, gravity, app, mask) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.size = size;
    this.vy = gravity;
    this.app = app;
    this.shape = null;
    this.area = 0;
    this.mask = mask;

    this.createShape();
  }

  createShape() {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(this.color);

    switch (this.type) {
      case "circle":
        graphics.drawCircle(0, 0, this.size / 2);
        this.area = Math.PI * (this.size / 2) ** 2;
        break;
      case "rectangle":
        graphics.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
        this.area = this.size * this.size;
        break;
      case "triangle":
        graphics.drawPolygon([
          -this.size / 2,
          this.size / 2,
          this.size / 2,
          this.size / 2,
          0,
          -this.size / 2
        ]);
        this.area = (this.size * this.size) / 2;
        break;
      case "pentagon":
        graphics.drawPolygon([
          0,
          -this.size / 2,
          this.size / 2,
          -this.size / 4,
          this.size / 3,
          this.size / 2,
          -this.size / 3,
          this.size / 2,
          -this.size / 2,
          -this.size / 4
        ]);
        this.area = (1.72 * this.size * this.size) / 4;
        break;
      case "star":
        const starPoints = [];
        const numPoints = 5;
        const outerRadius = this.size / 2;
        const innerRadius = this.size / 4;
        for (let i = 0; i < numPoints * 2; i++) {
          const angle = (i * Math.PI) / numPoints;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const xOffset = Math.cos(angle) * radius;
          const yOffset = Math.sin(angle) * radius;
          starPoints.push(xOffset, yOffset);
        }
        graphics.drawPolygon(starPoints);
        this.area = (2.5 * this.size * this.size) / 4;
        break;
      case "irregular":
        this.createIrregularShape(graphics);
        break;
    }

    graphics.endFill();
    this.shape = graphics;
    this.shape.x = this.x;
    this.shape.y = this.y;

    this.shape.mask = this.mask;

    this.shape.interactive = true;
    this.shape.buttonMode = true;
    this.shape.on("pointerdown", () => this.removeShape());

    this.app.stage.addChild(this.shape);
  }

  createIrregularShape(graphics) {
    const numPoints = Math.floor(Math.random() * 6) + 3;
    const angleIncrement = (2 * Math.PI) / numPoints;
    const points = [];
    const vertices = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleIncrement;
      const radius = (Math.random() * this.size) / 2 + this.size / 4;
      const xOffset = Math.cos(angle) * radius;
      const yOffset = Math.sin(angle) * radius;
      points.push(xOffset, yOffset);
      vertices.push({ x: xOffset, y: yOffset });
    }

    graphics.drawPolygon(points);

    this.area = this.calculateArea(vertices);
  }

  calculateArea(vertices) {
    let area = 0;
    const numVertices = vertices.length;

    for (let i = 0; i < numVertices; i++) {
      const j = (i + 1) % numVertices;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }

    return Math.abs(area) / 2;
  }

  removeShape() {
    this.app.stage.removeChild(this.shape);
    fallingShapes.removeShape(this);
  }

  update() {
    this.shape.y += this.vy;
  }
}