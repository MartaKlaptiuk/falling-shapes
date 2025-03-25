import FallingShapesController from "./controllers/FallingShapesController.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = new FallingShapesController();
  app.initialize();
});
