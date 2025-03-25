export default class Shape {
    constructor(x, y, type, color, size, gravity, app, mask, removeCallback) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.color = color;
      this.size = size;
      this.vy = gravity;
      this.app = app;
      this.mask = mask;
      this.shape = null;
      this.area = 0;
      this.removeCallback = removeCallback;
  
      this.createShape();
    }
  
    // Create shape using PIXI.Graphics
    createShape() {
      const g = new PIXI.Graphics();
      g.beginFill(this.color);
  
      switch (this.type) {
        case "triangle":
          this.drawTriangle(g);
          break;
        case "rectangle":
          this.drawRectangle(g);
          break;
        case "pentagon":
          this.drawPolygon(g, 5);
          break;
        case "hexagon":
          this.drawPolygon(g, 6);
          break;
        case "circle":
          this.drawCircle(g);
          break;
        case "ellipse":
          this.drawEllipse(g);
          break;
        case "star":
          this.drawStar(g);
          break;
        case "irregular":
          this.drawIrregular(g);
          break;
        default:
          this.drawCircle(g);
      }
  
      g.endFill();
      this.shape = g;
      this.shape.x = this.x;
      this.shape.y = this.y;
      this.shape.mask = this.mask;
  
      // Enable interaction
      this.shape.interactive = true;
      this.shape.buttonMode = true;
      this.shape.on("pointerdown", (event) => {      
        // Remove the shape
        this.removeCallback(this);
      });
  
      this.app.stage.addChild(this.shape);
    }
  
    drawTriangle(g) {
      g.drawPolygon([
        -this.size / 2, this.size / 2,
        this.size / 2, this.size / 2,
        0, -this.size / 2
      ]);
      this.area = (this.size * this.size) / 2;
    }
  
    drawRectangle(g) {
      g.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
      this.area = this.size * this.size;
    }
  
    drawPolygon(g, sides) {
      // Regular polygon
      const angleStep = (2 * Math.PI) / sides;
      const points = [];
      for (let i = 0; i < sides; i++) {
        const angle = i * angleStep;
        const px = Math.cos(angle) * (this.size / 2);
        const py = Math.sin(angle) * (this.size / 2);
        points.push(px, py);
      }
      g.drawPolygon(points);
  
      const rad = this.size / 2;
      this.area = (sides * rad * rad * Math.sin((2 * Math.PI) / sides)) / 2;
    }
  
    drawCircle(g) {
      g.drawCircle(0, 0, this.size / 2);
      this.area = Math.PI * (this.size / 2) ** 2;
    }
  
    drawEllipse(g) {
      // Using same size for width/height ratio
      g.drawEllipse(0, 0, this.size / 2, (this.size / 2) * 0.6);
      this.area = Math.PI * (this.size / 2) * ((this.size / 2) * 0.6);
    }
  
    drawStar(g) {
      const starPoints = [];
      const numPoints = 5;
      const outerR = this.size / 2;
      const innerR = this.size / 4;
      for (let i = 0; i < numPoints * 2; i++) {
        const angle = (i * Math.PI) / numPoints;
        const r = i % 2 === 0 ? outerR : innerR;
        starPoints.push(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      g.drawPolygon(starPoints);

      this.area = 2.5 * (this.size / 2) * (this.size / 2);
    }
  
    drawIrregular(g) {
      // Random number of points
      const pointsCount = Math.floor(Math.random() * 5) + 3;
      const angleInc = (2 * Math.PI) / pointsCount;
      const points = [];
      const vertices = [];
  
      for (let i = 0; i < pointsCount; i++) {
        const angle = i * angleInc;
        const r = (Math.random() * this.size) / 2 + this.size / 4;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        points.push(px, py);
        vertices.push({ x: px, y: py });
      }
      g.drawPolygon(points);
      this.area = this.calcPolygonArea(vertices);
    }
  
    calcPolygonArea(vertices) {
      let area = 0;
      for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        area += vertices[i].x * vertices[j].y;
        area -= vertices[j].x * vertices[i].y;
      }
      return Math.abs(area) / 2;
    }
  
    update() {
      this.shape.y += this.vy;
    }
  
    destroy() {
      this.shape.destroy();
    }
  }
  