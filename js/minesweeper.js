var time = 0;
const EASY_ROW = (EASY_COL = 9),
  MEDIUM_ROW = (MEDIUM_COL = 16),
  HARD_ROW = 30,
  HARD_COL = 16,
  EASY_MINE = 10,
  MEDIUM_MINE = 40,
  HARD_MINE = 90;

let MINE_GRID,
  NUM_MINE = EASY_MINE,
  ROWS = EASY_ROW,
  COLS = EASY_COL;

function buildGrid() {
  // Fetch grid and clear out old elements.
  var grid = document.getElementById("minefield");
  grid.innerHTML = "";
  // Build DOM Grid
  setMineGrid();

  var tile;
  for (var y = 0; y < ROWS; y++) {
    for (var x = 0; x < COLS; x++) {
      tile = createTile(x, y);
      grid.appendChild(tile);
    }
  }

  var style = window.getComputedStyle(tile);

  var width = parseInt(style.width.slice(0, -2));
  var height = parseInt(style.height.slice(0, -2));

  grid.style.width = COLS * width + "px";
  grid.style.height = ROWS * height + "px";
}

function setMineGrid() {
  let mine = [...Array(ROWS)].map((e) => Array(COLS).fill(0));
  let m = 0;
  while (m < NUM_MINE) {
    let ramdon_row = Math.ceil(ROWS * Math.random()) - 1;
    let ramdon_col = Math.ceil(COLS * Math.random()) - 1;

    if (mine[ramdon_row][ramdon_col] != 1) {
      mine[ramdon_row][ramdon_col] = 1;
      m++;
    }
  }
  MINE_GRID = mine;
}

function countSurroundingMine(row, col) {
  return new Promise((resolve, reject) => {
    let mine_count = 0;
    if (col < COLS - 1 && MINE_GRID[row][col + 1]) {
      mine_count += MINE_GRID[row][col + 1];
    }
    if (col > 0 && MINE_GRID[row][col - 1]) {
      mine_count += MINE_GRID[row][col - 1];
    }
    if (row < ROWS - 1 && MINE_GRID[row + 1][col]) {
      mine_count += MINE_GRID[row + 1][col];
    }
    if (row > 0 && MINE_GRID[row - 1][col]) {
      mine_count += MINE_GRID[row - 1][col];
    }
    if (col + 1 < COLS && row + 1 < ROWS && MINE_GRID[row + 1][col + 1]) {
      mine_count += MINE_GRID[row + 1][col + 1];
    }
    if (row > 0 && col + 1 < COLS && MINE_GRID[row - 1][col + 1]) {
      mine_count += MINE_GRID[row - 1][col + 1];
    }
    if (row < ROWS - 1 && col > 0 && MINE_GRID[row + 1][col - 1]) {
      mine_count += MINE_GRID[row + 1][col - 1];
    }
    if (row > 0 && col > 0 && MINE_GRID[row - 1][col - 1]) {
      mine_count += MINE_GRID[row - 1][col - 1];
    }
    return resolve(mine_count);
  });
}

function createTile(x, y) {
  var tile = document.createElement("button");

  tile.classList.add("tile");
  tile.classList.add("hidden");
  tile.id = y + "," + x;
  tile.addEventListener("auxclick", function (e) {
    e.preventDefault();
  }); // Middle Click
  tile.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  }); // Right Click
  tile.addEventListener("mouseup", handleTileClick); // All Clicks

  return tile;
}

async function reveal_one(row, col) {
  let tile = document.getElementById(`${row},${col}`);
  if (MINE_GRID[row][col] == 1 || !tile.classList.contains("hidden")) return;
  //count surrounding mine
  const mine_count = await countSurroundingMine(row, col);
  tile.classList.remove("hidden");
  tile.disabled = true;
  if (mine_count > 0) {
    //if more than 0 mine surround
    //reveal tile but mark it by number of mine(s) surrounded
    switch (mine_count) {
      case 1:
        tile.classList.add("tile_1");
        break;
      case 2:
        tile.classList.add("tile_2");
        break;
      case 3:
        tile.classList.add("tile_3");
        break;
      case 4:
        tile.classList.add("tile_4");
        break;
      case 5:
        tile.classList.add("tile_5");
        break;
      case 6:
        tile.classList.add("tile_6");
        break;
      case 7:
        tile.classList.add("tile_7");
        break;
      case 8:
        tile.classList.add("tile_8");
        break;
    }
  }else{
    if(col + 1 < COLS) reveal_one(row, col + 1);
    if(col > 0) reveal_one(row, col - 1);
    if(row + 1 < ROWS) reveal_one(row + 1, col);
    if(row > 0) reveal_one(row - 1, col);
    if(col + 1 < COLS && row + 1 < ROWS) reveal_one(row + 1, col + 1);
    if(col + 1 < COLS && row > 0) reveal_one(row - 1, col + 1);
    if(col > 0 && row + 1 < ROWS) reveal_one(row + 1, col - 1);
    if(col > 0 && row > 0) reveal_one(row - 1, col - 1);
  }
  
}

function reveal_all() {
  const n = MINE_GRID.length,
    m = MINE_GRID[0].length;
  //reveal all remainding tile
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      let tile = document.getElementById(`${i},${j}`);
      if (MINE_GRID[i][j] == 1) {
        tile.classList.contains("flag") < 0
          ? tile.classList.add("mine")
          : tile.classList.add("mine_marked");
      }
      tile.classList.remove("hidden");
      tile.disabled = true;
    }
  }
}

function handleLeftClick(tile) {
  const index = tile.id.split(",");
  //if this tile is not flagged, and not opened, reveal it
  if (!tile.classList.contains("flag") && tile.classList.contains("hidden")) {
    //check if hit a mine
    if (MINE_GRID[index[0]][index[1]]) {
      //handle mine hit
      tile.classList.add("mine_hit");
      reveal_all();
    } else {
      reveal_one(Number(index[0]), Number(index[1]));
    }
  }
}

function handleRightClick(tile) {
  const [row, col] = tile.id.split(",");
  tile.classList.toggle("flag");
  if (tile.classList.contains("flag") > 0 && MINE_GRID[row][col]) NUM_MINE--;
  if (!tile.classList.contains("flag") > 0 && MINE_GRID[row][col]) NUM_MINE--;
  if (NUM_MINE == 0) {
    alter("You Won!");
    reveal_all();
  }
}

function handleMiddleClick(tile) {
  const [row, col] = tile.name.split(",");
}

function handleTileClick(event) {
  event.preventDefault();
  if (typeof event === "object") {
    const index = event.target.id.split(",");
    switch (event.button) {
      case 0:
        console.log("Reveal if not flagged", index);
        handleLeftClick(event.target);
        break;
      case 1:
        /* 
				reveal all hidden, unflagged, and adjacent tiles iff
				1. The tile clicked on is revealed.
        2. The tile clicked on has a number on it. 
        3. The number of adjacent flags matches the number on the tile clicked on.
				*/
        console.log("Reveal surrounding tiles ", index);
        handleMiddleClick(event.target);
        break;
      case 2:
        console.log("flag/unflag.", index);
        handleRightClick(event.target);
        break;
      default:
        console.log(`Unknown button code: ${e.button}`);
    }
  }
}

function setDifficulty() {
  var difficultySelector = document.getElementById("difficulty");
  var difficulty = difficultySelector.selectedIndex;
  console.log(difficulty);
  //TODO implement me
  switch (difficulty) {
    case 0:
      ROWS = EASY_ROW;
      COLS = EASY_COL;
      NUM_MINE = EASY_MINE;
      break;
    case 1:
      ROWS = MEDIUM_ROW;
      COLS = MEDIUM_COL;
      NUM_MINE = MEDIUM_MINE;
      break;
    case 2:
      ROWS = HARD_ROW;
      COLS = HARD_COL;
      NUM_MINE = HARD_MINE;
      break;
  }
}

function startGame() {
  buildGrid();
  startTimer();
  console.log(ROWS, COLS, NUM_MINE);
  console.log(MINE_GRID);
}

function smileyDown() {
  var smiley = document.getElementById("smiley");
  smiley.classList.add("face_down");
}

function smileyUp() {
  var smiley = document.getElementById("smiley");
  smiley.classList.remove("face_down");
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
