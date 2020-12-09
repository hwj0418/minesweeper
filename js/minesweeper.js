var time = 0;
const EASY_ROW = (EASY_COL = 9),
  MEDIUM_ROW = (MEDIUM_COL = 16),
  HARD_ROW = 30,
  HARD_COL = 16,
  EASY_MINE = 10,
  MEDIUM_MINE = 40,
  HARD_MINE = 90;

let DIFFICULTY = 0,
  MINE;

function buildGrid() {
  // Fetch grid and clear out old elements.
  var grid = document.getElementById("minefield");
  grid.innerHTML = "";
  let rows, columns, num_mine;

  switch (DIFFICULTY) {
    case 0:
      rows = EASY_ROW;
      columns = EASY_COL;
      num_mine = EASY_MINE;
      break;
    case 1:
      rows = MEDIUM_ROW;
      columns = MEDIUM_COL;
      num_mine = MEDIUM_MINE;
      break;
    case 2:
      rows = HARD_ROW;
      columns = HARD_COL;
      num_mine = HARD_MINE;
      break;
  }

  // Build DOM Grid

  setMine(rows, columns, num_mine);

  var tile;
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < columns; x++) {
      tile = createTile(x, y);
      grid.appendChild(tile);
    }
  }

  var style = window.getComputedStyle(tile);

  var width = parseInt(style.width.slice(0, -2));
  var height = parseInt(style.height.slice(0, -2));

  grid.style.width = columns * width + "px";
  grid.style.height = rows * height + "px";
  console.log(MINE);
}

function setMine(rows, cols, num_mine) {
  let mine = [...Array(rows)].map((e) => Array(cols).fill(0));
  let m = 0;
  while (m < num_mine) {
    let ramdon_row = Math.ceil(rows * Math.random()) - 1;
    let ramdon_col = Math.ceil(cols * Math.random()) - 1;

    if (mine[ramdon_row][ramdon_col] != 1) {
      mine[ramdon_row][ramdon_col] = 1;
      m++;
    }
  }
  MINE = mine;
}

function countSurroundingMine(x, y){

}

function createTile(x, y) {
  var tile = document.createElement("button");

  tile.classList.add("tile");
  tile.classList.add("hidden");
  tile.name = x + "," + y;

  tile.addEventListener("auxclick", function (e) {
    e.preventDefault();
  }); // Middle Click
  tile.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  }); // Right Click
  tile.addEventListener("mouseup", handleTileClick); // All Clicks

  return tile;
}

function startGame() {
  buildGrid();
  startTimer();
}

function smileyDown() {
  var smiley = document.getElementById("smiley");
  smiley.classList.add("face_down");
}

function smileyUp() {
  var smiley = document.getElementById("smiley");
  smiley.classList.remove("face_down");
}

function handleTileClick(event) {
  event.preventDefault();
  if (typeof event === "object") {
    const index = event.target.name.split(",");
    switch (event.button) {
      case 0:
        console.log("Reveal if not flagged", index);
        break;
      case 1:
				/* 
				reveal all hidden, unflagged, and adjacent tiles iff
				1. The tile clicked on is revealed.
        2. The tile clicked on has a number on it. 
        3. The number of adjacent flags matches the number on the tile clicked on.
				*/
        console.log("Reveal surrounding tiles ", index);
        break;
      case 2:
				console.log("flag/unflag.", index);
        break;
      default:
        console.log(`Unknown button code: ${e.button}`);
    }
  }
}

function setDifficulty() {
  var difficultySelector = document.getElementById("difficulty");
  var difficulty = difficultySelector.selectedIndex;

  //TODO implement me
  DIFFICULTY = difficulty;
}

function startTimer() {
  timeValue = 0;
  window.setInterval(onTimerTick, 1000);
}

function onTimerTick() {
  timeValue++;
  updateTimer();
}

function updateTimer() {
  document.getElementById("timer").innerHTML = timeValue;
}
