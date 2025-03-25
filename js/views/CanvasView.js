export default class CanvasView {
    constructor(container) {
      this.container = container;
      this.app = null;
      this.mask = null;
      this.initializeCanvas();
    }
  
    // Create PIXI Application and mask
    initializeCanvas() {
      const { width, height } = this.container.getBoundingClientRect();
      this.app = new PIXI.Application({
        width: width,
        height: height,
        backgroundColor: 0xffffff
      });
      this.container.innerHTML = "";
      this.container.appendChild(this.app.view);
      this.createMask(width, height);
    }
  
    createMask(w, h) {
      if (this.mask) this.mask.destroy();
      this.mask = new PIXI.Graphics();
      this.mask.beginFill(0xffffff);
      this.mask.drawRect(0, 0, w, h);
      this.mask.endFill();
      this.app.stage.addChild(this.mask);
    }
  
    resizeCanvas() {
      const { width, height } = this.container.getBoundingClientRect();
      if (this.app) {
        this.app.renderer.resize(width, height);
      } else {
        this.initializeCanvas();
      }
      this.createMask(width, height);
    }
  }
  