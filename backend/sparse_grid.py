import json
import random
from collections import defaultdict


class Cell:
    def __init__(self):
        self.neighbours = 0
        self.alive = False

    def increment_neighbours(self):
        self.neighbours += 1

    def decrement_neighbours(self):
        self.neighbours -= 1
        return self.neighbours == 0 and not self.alive

    def set_alive(self, isAlive):
        self.alive = isAlive


class SparseGrid:
    def __init__(self):
        self.grid = defaultdict(Cell)

    def set_cell(self, cells):
        for cell in cells:
            self.grid[cell].set_alive(True)
            for neighbour in self.get_neighbors(cell):
                self.grid[neighbour].increment_neighbours()

    def del_cell(self, cells):
        cells_copy = list(cells)
        for cell in cells_copy:
            self.grid[cell].set_alive(False)
            for neighbour in self.get_neighbors(cell):
                if self.grid[neighbour].decrement_neighbours():
                    del self.grid[neighbour]


    def cell_alive(self, cell):
        return self.grid[cell].alive

    def get_neighbors(self, cell):
        x, y = cell
        return [(x + dx, y + dy) for dx in [-1, 0, 1] for dy in [-1, 0, 1] if (dx, dy) != (0, 0)]

    def generate_random_cells(self, num_cells, grid_size):
        random_cells = set()
        for _ in range(num_cells):
            x = random.randint(0, grid_size)  # Adjust the range according to your grid size
            y = random.randint(0, grid_size)  # Adjust the range according to your grid size
            random_cells.add((x, y))
        self.set_cell(random_cells)

    def iterate_cells(self):
        return self.grid.items()

    def to_json(self):
        return json.dumps([key for key,value in self.grid.items() if value.alive])
