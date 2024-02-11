import random

import json
import timeit


def test_performance():
    setup_code = """
from sparse_grid import SparseGrid
import test_loop as tl
import random

grid = SparseGrid()
grid.generate_random_cells(100000,1000)
    """
    test_code = """
tl.loop10(grid)"""

    time_taken = timeit.timeit(stmt=test_code, setup=setup_code, number=1)
    print(f"Time taken for 10 generations: {time_taken} seconds")


if __name__ == "__main__":
    test_performance()
