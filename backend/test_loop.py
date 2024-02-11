from sparse_grid import SparseGrid


def loop10(grid: SparseGrid):
    for _ in range(10):
        dies = []
        born = []
        for key, value in grid.iterate_cells():
            if value.alive:
                if value.neighbours < 2 or value.neighbours > 3:
                    dies.append(key)
            else:
                if value.neighbours == 3:
                    born.append(key)

        grid.set_cell(born)
        grid.del_cell(dies)
