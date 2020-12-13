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
  NUM_FLAG = 0,
  MINE_COUNT,
  ROWS = EASY_ROW,
  COLS = EASY_COL;

var time = document.getElementById("timer");
var timer = setInterval(function () {
  let seconds = parseFloat(time.innerHTML) + 1;
  time.innerHTML = seconds;
}, 1000);

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
  MINE_GRID = [];
  let mine = Array(NUM_MINE).fill(1).concat(Array(ROWS * COLS - NUM_MINE).fill(0));
  for (let i = (ROWS * COLS) - 1; i >= 0; i--) {
    [mine[i], mine[Math.floor(Math.random() * i)]] = [mine[Math.floor(Math.random() * i)], mine[i]];
  }
  while(mine.length) MINE_GRID.push(mine.splice(0, ROWS));
  
  // let mine = [...Array(ROWS)].map((e) => Array(COLS).fill(0));
  // let m = 0;
  // while (m < NUM_MINE) {
  //   let ramdon_row = Math.ceil(ROWS * Math.random()) - 1;
  //   let ramdon_col = Math.ceil(COLS * Math.random()) - 1;

  //   if (mine[ramdon_row][ramdon_col] != 1) {
  //     mine[ramdon_row][ramdon_col] = 1;
  //     m++;
  //   }
  // }
  // MINE_GRID = mine;
}

function countSurroundingMine(row, col) {
  return new Promise((resolve, reject) => {
    let mine_count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const row_i = Number(row) + i,
          col_j = Number(col) + j;
        if (row_i >= 0 && row_i < ROWS && col_j < COLS && col_j >= 0)
          mine_count += MINE_GRID[row_i][col_j];
      }
    }
    return resolve(mine_count);
  });
}

function countSurroundingFlag(row, col) {
  return new Promise((resolve, reject) => {
    let flag_count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const row_i = Number(row) + i,
          col_j = Number(col) + j;
        if (row_i >= 0 && row_i < ROWS && col_j < COLS && col_j >= 0) {
          let tile = document.getElementById(`${row_i},${col_j}`);
          console.log(
            "couting flag on ",
            row,
            col,
            row_i,
            col_j,
            tile.classList.contains("flag")
          );
          flag_count += tile.classList.contains("flag") ? 1 : 0;
        }
      }
    }
    return resolve(flag_count);
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
  tile.addEventListener("mousedown", (e) => {
    e.preventDefault();
    // tile.classList.remove("hidden");
  });
  tile.addEventListener("mouseup", (e) => {
    // tile.classList.add("hidden");
    handleTileClick(e);
  }); // All Clicks
  return tile;
}

async function reveal_one(row, col) {
  // console.log(`revealing ${[row, col]}`);
  let tile = document.getElementById(`${row},${col}`);
  if (
    MINE_GRID[row][col] !== 0 ||
    !tile.classList.contains("hidden") ||
    tile.classList.contains("flag")
  )
    return;
  //count surrounding mine
  const mine_count = await countSurroundingMine(row, col);
  tile.classList.remove("hidden");

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
  } else {
    reveal_surround(row, col);
    tile.disabled = true;
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
        tile.classList.contains("flag")
          ? tile.classList.add("mine_marked")
          : tile.classList.add("mine");
      }
      tile.classList.remove("hidden");
      tile.disabled = true;
    }
  }
}

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

function handleLeftClick(tile) {
  const [row, col] = tile.id.split(",");
  //if this tile is not flagged, and not opened, reveal it
  if (tile.classList.contains("hidden")) {
    //check if hit a mine
    if (MINE_GRID[row][col]) {
      //handle mine hit
      clearInterval(timer);
      tile.classList.add("mine_hit");
      smileyLose();
      reveal_all();
    } else {
      reveal_one(Number(row), Number(col));
    }
  }
}

function handleRightClick(tile) {
  const [row, col] = tile.id.split(",");
  // tile.classList.toggle("flag");
  if (tile.classList.contains("flag")) {
    NUM_FLAG--;
    tile.classList.remove("flag");
  } else {
    NUM_FLAG++;
    tile.classList.add("flag");
  }
  if (tile.classList.contains("flag") && MINE_GRID[row][col]) MINE_COUNT--;
  if (!tile.classList.contains("flag") && MINE_GRID[row][col]) MINE_COUNT++;
  if (MINE_COUNT == 0 && NUM_FLAG == NUM_MINE) {
    clearInterval(timer);
    smileyWin();
    reveal_all();
  }
}

/* - A middle click must reveal all hidden, unflagged, and adjacent tiles
This only works if: 
    1. The tile clicked on is revealed.
    2. The tile clicked on has a number on it. 
    3. The number of adjacent flags matches the number on the tile clicked on. */
async function handleMiddleClick(tile) {
  const [row, col] = tile.id.split(",");
  if (tile.classList.contains("hidden")) return; //is not revealed
  if (tile.classList.length == 1) return; //does not have number on it
  // count surrouding flags
  let flag_count = await countSurroundingFlag(row, col);
  // if surrounding flags matches the number on the tile
  console.log(
    `tile_${flag_count}`,
    tile.classList,
    tile.classList.contains(`tile_${flag_count}`)
  );
  if (tile.classList.contains(`tile_${flag_count}`)) reveal_surround(row, col);
}

function handleTileClick(event) {
  event.preventDefault();
  if (typeof event === "object") {
    const index = event.target.id.split(",");
    switch (event.button) {
      case 0:
        console.log("left click", index);
        handleLeftClick(event.target);
        break;
      case 1:
        console.log("middle click", index);
        handleMiddleClick(event.target);
        break;
      case 2:
        console.log("right click", index);
        if (event.target.classList.contains("hidden"))
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
    default:
      ROWS = EASY_ROW;
      COLS = EASY_COL;
      NUM_MINE = EASY_MINE;
      break;
  }
  NUM_FLAG = 0;
  MINE_COUNT = NUM_MINE;
}

function startGame() {
  smileyUp();
  setDifficulty();
  buildGrid();
  console.log("mine grid:", MINE_GRID);
}

function smileyDown() {
  var smiley = document.getElementById("smiley");
  smiley.classList.add("face_down");
}

function smileyUp() {
  var smiley = document.getElementById("smiley");
  smiley.className = "";
  smiley.classList.add("smiley");
  smiley.classList.add("face_up");
}

function smileyLose() {
  var smiley = document.getElementById("smiley");
  smiley.classList.add("face_lose");
}

function smileyWin() {
  var smiley = document.getElementById("smiley");
  smiley.classList.add("face_win");
}
