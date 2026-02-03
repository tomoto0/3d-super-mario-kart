import { Game } from "./core/Game.js";

const canvas = document.getElementById("battle-canvas");
const hudRoot = document.getElementById("ui-hud");
const menu = document.getElementById("main-menu");
const loading = document.getElementById("loading-overlay");
const startBtn = document.getElementById("start-battle");
const practiceBtn = document.getElementById("practice-battle");
const stageButtons = Array.from(document.querySelectorAll(".stage-card"));

let selectedStage = "grassland";

const game = new Game({ canvas, hudRoot });

const setSelectedStage = (stageId) => {
  selectedStage = stageId;
  stageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.stage === stageId);
  });
};

stageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setSelectedStage(button.dataset.stage);
  });
});

const startGame = ({ practice }) => {
  menu.classList.add("hidden");
  loading.classList.remove("hidden");

  window.setTimeout(() => {
    loading.classList.add("hidden");
    game.start(selectedStage, { practice });
  }, 240);
};

startBtn.addEventListener("click", () => startGame({ practice: false }));
practiceBtn.addEventListener("click", () => startGame({ practice: true }));

window.addEventListener("resize", () => game.resize());

setSelectedStage(selectedStage);
