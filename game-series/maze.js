
console.log(randomSequence(8));
// Sample output for 10 item sequence
// [ 4, 1, 7, 8, 9, 6, 2, 3, 0, 5 ]

var maze = generateMaze(10, 10);
console.log(maze);
var grid = renderMaze(maze);
console.log(grid);
var text = drawGrid(grid);
console.log(text);

// Sample output for 3x3 maze
// ██████████████
// ██      ██  ██
// ██  ██████  ██
// ██          ██
// ██  ██  ██████
// ██  ██      ██
// ██████████████

// Given a width and height, generate a maze.
function generateMaze(width, height) {
  // Calculate the size of a list of all cells
  var length = width * height;

  // Build a list of cells in the grid.
  // Initially all walls are closed
  var walls = new Array(length);
  var cells = new Array(length);
  var i = 0;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      cells[i] = {
        parent: null
      };
      walls[i] = {
        right: true,
        bottom: true
      };
      i++;
    }
  }

  // Walk the list in shuffled order and open walls.
  for (i of randomSequence(length)) {
    var wall = walls[i];
    var root = findRoot(cells[i]);
    // Ignore the last column.
    if (i % width < width - 1) {
      // Open right wall and merge if not in same set.
      var rightRoot = findRoot(cells[i + 1]);
      if (root !== rightRoot) {
        rightRoot.parent = root;
        wall.right = false;
      }
    }
    // Ignore the last row
    if (i / width < height - 1) {
      // Open bottom wall and merge if not in same set.
      var bottomRoot = findRoot(cells[i + width]);
      if (root !== bottomRoot) {
        bottomRoot.parent = root;
        wall.bottom = false;
      }
    }
  }

  walls.width = width;
  walls.height = height;

  return walls;
}

// Given a cell, find it's root.
function findRoot(cell) {
  while (cell.parent) cell = cell.parent;
  return cell;
}

// Generate a random sequence of all integers
// from 0 to n - 1.
function randomSequence(n) {

  // First build an ordered list
  var list = new Array(n);
  for (var i = 0; i < n; i++) {
    list[i] = i;
  }

  // Then swap each item with another random item.
  // This shuffles the order.
  for (i = 0; i < n; i++) {
    var j = Math.floor(Math.random() * n);
    var temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }

  return list;
}

function renderMaze(maze) {
  var width = maze.width;
  var height = maze.height;
  var newWidth = width * 2 + 1;
  var newHeight = height * 2 + 1;
  var grid = new Array(newWidth * newHeight);
  var i, x, y, cell;
  var j = 0;

  // Top wall is solid
  for (x = 0; x < newWidth; x++) {
    grid[j++] = 1;
  }

  // Loop the maze row by row
  for (y = 0; y < height; y++) {
    // First render a row for the cell and right wall
    grid[j++] = 1; // Left wall is solid
    for (x = 0; x < width; x++) {
      cell = maze[x + y * width];
      // Cell itself is always empty
      grid[j++] = 0;
      // Right wall is conditional
      grid[j++] = cell.right ? 1 : 0;
      i++;
    }

    // Then render bottom wall and corner
    grid[j++] = 1; // Left wall is solid
    for (x = 0; x < width; x++) {
      cell = maze[x + y * width];
      // Bottom wall is conditional
      grid[j++] = cell.bottom ? 1 : 0;
      // Corner is always solid.
      grid[j++] = 1;
      i++;
    }
  }
  grid.width = newWidth;
  grid.height = newHeight;
  return grid;
}

// Draw a grid as using full-blocks, spaces and newlines.
function drawGrid(grid) {
  var width = grid.width;
  var height = grid.height;
  var text = "\n";
  var i = 0;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      text += grid[i++] ? "██" : "  ";
    }
    text += "\n";
  }
  return text;
}
