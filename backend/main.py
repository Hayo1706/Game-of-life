import asyncio
import random

import websockets
import time
import json
from sparse_grid import SparseGrid


async def game_loop(grid, websocket):
    try:
        while True:
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

            await websocket.send(grid.to_json())  # Example message: cell at row 2, column 3 should light up
            await asyncio.sleep(1 / 60)  # 60fps, assuming the calculation is instant
    except websockets.exceptions.ConnectionClosedOK:
        print("Client disconnected")


async def handle_client(websocket, path):
    grid = SparseGrid()
    grid.generate_random_cells(100000, 1000)
    await websocket.send(grid.to_json())
    await game_loop(grid, websocket)


start_server = websockets.serve(handle_client, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
