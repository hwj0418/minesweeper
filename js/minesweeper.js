/** Constant variables that used to setup games */

const EASY_ROW = (EASY_COL = 9),
  MEDIUM_ROW = (MEDIUM_COL = 16),
  HARD_ROW = 16,
  HARD_COL = 30,
  EASY_MINE = 10,
  MEDIUM_MINE = 40,
  HARD_MINE = 90;

/** Game variables that used in calculation */
let MINE_GRID,
  NUM_MINE = EASY_MINE,
  NUM_FLAG = 0,
  ROWS = EASY_ROW,
  COLS = EASY_COL,
  TIMER,
  FIRST_CLICK = true;

/**
 * Initial game board.
 */
function buildGrid() {
  // Fetch grid and clear out old elements.
  let grid = document.getElementById("minefield");
  grid.innerHTML = "";
  let tile;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      tile = createTile(x, y);
      grid.appendChild(tile);
    }
  }

  let style = window.getComputedStyle(tile);
  let width = parseInt(style.width.slice(0, -2));
  let height = parseInt(style.height.slice(0, -2));

  grid.style.width = COLS * width + "px";
  grid.style.height = ROWS * height + "px";
}

/**
 * Create tile element at index [row, col]
 * @param {Number} row
 * @param {Number} col
 */
function createTile(col, row) {
  let tile = document.createElement("button");
  tile.classList.add("tile");
  tile.classList.add("hidden");
  tile.id = row + "," + col;
  tile.addEventListener("auxclick", function (e) {
    e.preventDefault();
  }); // Middle Click
  tile.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  }); // Right Click
  tile.addEventListener("mousedown", (e) => {
    // e.preventDefault();
    simleyLimbo();
  });
  tile.addEventListener("mouseup", (e) => {
    simleyLimbo();
    handleTileClick(e);
  }); // All Clicks
  return tile;
}

/**
 * generate new mine grid which prevent from putting mines around given index.
 * @param {Number} row
 * @param {Number} col
 */
function setMineGrid(row, col) {
  //helper function to check if selected index should not contain mine
  //non mine area should be the tiles around param index [row, col]
  
  function notMineArea(row_i, col_j){
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if(row_i == row + i || col_j == col + j) return false;
        }
      }
      return true;
    }

  let m = 0;
  while (m < NUM_MINE) {
    let ramdon_row = Math.floor(ROWS * Math.random());
    let ramdon_col = Math.floor(COLS * Math.random());
    if (
      notMineArea(ramdon_row, ramdon_col) &&
      MINE_GRID[ramdon_row][ramdon_col] != 1
    ) {
      MINE_GRID[ramdon_row][ramdon_col] = 1;
      m++;
    }
  }
}

/**
 * Count the number of surrounding mine(s) at index [row, col]
 * @param {Number} row
 * @param {Number} col
 */
function countSurroundingMine(row, col) {
  // if(row < 0 || col < 0 || row >= ROWS || col >= COLS) return 0;
  let mine_count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const row_i = Number(row) + i,
        col_j = Number(col) + j;
      if (row_i >= 0 && row_i < ROWS && col_j < COLS && col_j >= 0)
        mine_count += MINE_GRID[row_i][col_j];
    }
  }
  return mine_count;
}

/**
 * Count the number of surrounding flag(es) at index [row, col]
 * @param {Number} row
 * @param {Number} col
 */
function countSurroundingFlag(row, col) {
  let flag_count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const row_i = Number(row) + i,
        col_j = Number(col) + j;
      if (row_i >= 0 && row_i < ROWS && col_j < COLS && col_j >= 0) {
        let tile = document.getElementById(`${row_i},${col_j}`);
        flag_count += tile.classList.contains("flag") ? 1 : 0;
      }
    }
  }
  return flag_count;
}

/**
 * Reveal tile at given index [row, col]
 */
function reveal_one(row, col) {
  let tile = document.getElementById(`${row},${col}`);
  //tile should not be revealed if it's mine, or it's already opened, or has a flag on it
  if (
    !tile ||
    MINE_GRID[row][col] !== 0 ||
    !tile.classList.contains("hidden") ||
    tile.classList.contains("flag")
  )
    return;
  //count surrounding mine
  const mine_count = countSurroundingMine(row, col);
  tile.classList.remove("hidden");
  //reveal tile and mark it by number of mine(s) surrounded
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
    default:
      reveal_surround(row, col);
      tile.disabled = true;
      break;
  }
}

/**
 * Reveal surrounding tiles at given index [row, col]
 * @param {Number} row
 * @param {Number} col
 */
function reveal_surround(row, col) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const row_i = Number(row) + i,
        col_j = Number(col) + j;
      if (row_i >= 0 && row_i < ROWS && col_j < COLS && col_j >= 0) {
        reveal_one(row_i, col_j);
      }
    }
  }
}

/**
 * Reveal all tiles on the board.
 */
function reveal_all() {
  const n = MINE_GRID.length,
    m = MINE_GRID[0].length;
  //reveal all remainding tile by looping through the board.
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      let tile = document.getElementById(`${i},${j}`);
      if (MINE_GRID[i][j] == 1) {
        tile.classList.contains("flag")
          ? tile.classList.add("mine_marked")
          : tile.classList.add("mine");
      }
      tile.classList.remove("hidden");
      tile.classList.remove("flag");
      tile.disabled = true;
    }
  }
}

/**
 * handle left click on the tile element.
 * Reveal this tile if not opened and not flagged
 * @param {DOMElement} tile
 */
function handleLeftClick(tile) {
  const [row, col] = tile.id.split(",");
  //if this tile is not flagged, and not opened, reveal it
  if (tile.classList.contains("hidden") && !tile.classList.contains("flag")) {
    //check if hit a mine
    if (MINE_GRID[row][col]) {
      //handle mine hit
      window.clearInterval(TIMER);
      tile.classList.add("mine_hit");
      smileyLose();
      reveal_all();
    } else {
      reveal_one(Number(row), Number(col));
    }
  }
}

/**
 * handle right flick on the tile element, toggle flag and change flag count.
 * @param {DOMElement} tile
 */
function handleRightClick(tile) {
  tile.classList.toggle("flag");
  NUM_FLAG += tile.classList.contains("flag") ? 1 : -1;
  document.getElementById("flagCount").innerHTML = NUM_MINE - NUM_FLAG;
}

/**
 * A middle click must reveal all hidden, unflagged, and adjacent tiles
 * This only works if: 
    1. The tile clicked on is revealed.
    2. The tile clicked on has a number on it. 
    3. The number of adjacent flags matches the number on the tile clicked on. 
 **/
function handleMiddleClick(tile) {
  const [row, col] = tile.id.split(",");
  if (tile.classList.contains("hidden")) return; //is not revealed
  if (tile.classList.length == 1) return; //does not have number on it
  // count surrouding flags
  let flag_count = countSurroundingFlag(row, col);
  // if surrounding flags matches the number on the tile
  if (tile.classList.contains(`tile_${flag_count}`)) reveal_surround(row, col);
}

/**
 * Handle general lick on tile, toggle face limbo
 * @param {DOM Event} event
 */
function handleTileClick(event) {
  event.preventDefault();
  if (typeof event === "object") {
    const [row, col] = event.target.id.split(",");
    // console.log("clicked on", row, col);
    switch (event.button) {
      case 0:
        if (FIRST_CLICK) {
          FIRST_CLICK = false;
          setMineGrid(Number(row), Number(col));
          startTimer();
          console.log(MINE_GRID);
        }
        handleLeftClick(event.target);
        break;
      case 1:
        handleMiddleClick(event.target);
        break;
      case 2:
        if (event.target.classList.contains("hidden"))
          handleRightClick(event.target);
        break;
      default:
        console.log(`Unknown button code: ${e.button}`);
        break;
    }
    if (winCheck()) {
      clearInterval(TIMER);
      smileyWin();
      reveal_all();
    }
  }
}

/**
 * After each click, check the wining condition
 */
function winCheck() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      let tile = document.getElementById(`${i},${j}`);
      if (tile.classList.contains("hidden") && MINE_GRID[i][j] == 0)
        return false;
      if (tile.classList.contains("mine_hit")) return false;
    }
  }
  return true;
}

/**
 * Set difficulty by user choice on the dropdown menu
 */
function setDifficulty() {
  let difficultySelector = document.getElementById("difficulty");
  let difficulty = difficultySelector.selectedIndex;
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
    default:
      ROWS = EASY_ROW;
      COLS = EASY_COL;
      NUM_MINE = EASY_MINE;
      break;
  }

  MINE_GRID = [...Array(ROWS)].map(() => Array(COLS).fill(0));
}

/**
 * Initial the game board
 */
function startGame() {
  FIRST_CLICK = true;
  NUM_FLAG = 0;
  smileyUp();
  setDifficulty();
  buildGrid();
  if (document.getElementById("minefield").childElementCount > 0)
    clearInterval(TIMER);
  document.getElementById("timer").innerHTML = 0;
  document.getElementById("flagCount").innerHTML = NUM_MINE;
}

function smileyDown() {
  let smiley = document.getElementById("smiley");
  smiley.classList.add("face_down");
}

function smileyUp() {
  let smiley = document.getElementById("smiley");
  smiley.className = "";
  smiley.classList.add("smiley");
  smiley.classList.add("face_up");
}

function smileyLose() {
  let smiley = document.getElementById("smiley");
  smiley.classList.add("face_lose");
}

function smileyWin() {
  let smiley = document.getElementById("smiley");
  smiley.classList.add("face_win");
}

function simleyLimbo() {
  let smiley = document.getElementById("smiley");
  smiley.classList.toggle("face_limbo");
}

function startTimer() {
  timeValue = 0;
  TIMER = window.setInterval(onTimerTick, 1000);
}

function onTimerTick() {
  timeValue++;
  updateTimer();
}

function updateTimer() {
  document.getElementById("timer").innerHTML = timeValue;
}
