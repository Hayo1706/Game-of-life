import React, {useEffect, useRef, useState} from 'react';
import './App.css';

function App() {
    const canvasRef = useRef(null);
    const [scale, setScale] = useState(0.5);
    const [offset, setOffset] = useState({ x: 600, y: 400 });
    const [litCells, setLitCells] = useState([]);

    const socketRef = useRef(null); // Ref to hold the WebSocket instance

    useEffect(() => {
        const connectSocket = () => {

            if (!socketRef.current) {
                const socket = new WebSocket('ws://localhost:8765');
                socket.onopen = () => {
                    console.log('WebSocket connected');
                };

                socket.onmessage = (event) => {
                    // Handle incoming messages from the server
                    const message = JSON.parse(event.data); // Parse JSON string to JavaScript object
                    setLitCells(message); // Update litCells state with the received data
                    console.log(message)
                };

                socket.onclose = (event) => {
                    console.log('WebSocket connection closed');
                    if (!event.wasClean) {
                        // Connection was not closed normally, attempt to reconnect
                        console.log('Attempting to reconnect...');
                        setTimeout(connectSocket, 3000); // Attempt to reconnect after 3 seconds
                    }
                    // Reset the ref when the connection is closed
                    socketRef.current = null;
                };
                socketRef.current = socket;
                return () => {
                    socket.close();
                    socketRef.current = null;
                };
            }
        }
        connectSocket()
    }, []);


    const handleWheel = (event) => {
        const newScale = scale * (1 - event.deltaY / 1000);
        setScale(newScale);
    };

    const handleMouseDown = (event) => {
        const startX = event.pageX - offset.x;
        const startY = event.pageY - offset.y;

        const handleMouseMove = (event) => {
            const offsetX = event.pageX - startX;
            const offsetY = event.pageY - startY;
            setOffset({ x: offsetX, y: offsetY });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const drawGrid = (ctx, scale, offsetX, offsetY) => {
        const step = 20 * scale;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#444'; // Dark gray background
        ctx.fillRect(0, 0, width, height);
        ctx.beginPath();
        const maxLineWidth = 0.1;
        const minLineWidth = 0.01;

         // Adjust line width based on scale
        ctx.lineWidth = Math.max(maxLineWidth * scale, minLineWidth);
        if (scale > 0.2) {
            for (let x = 0; x <= width; x += step) {
                ctx.moveTo(x + offsetX % step, 0);
                ctx.lineTo(x + offsetX % step, height);
            }
            for (let y = 0; y <= height; y += step) {
                ctx.moveTo(0, y + offsetY % step);
                ctx.lineTo(width, y + offsetY % step);
            }
        }
        ctx.strokeStyle = '#fff'; // White grid lines
        ctx.stroke();

        // Draw lit cells
        ctx.fillStyle = '#fff'; // White color for lit cells
        ctx.beginPath();
        litCells.forEach((cell) => {
            const [row, col] = cell;
            const cellX = col * step + offsetX;
            const cellY = row * step + offsetY;
            ctx.fillRect(cellX, cellY, step, step);
        });

        // // Reset fill style for drawing text
        // ctx.fillStyle = '#000'; // Black color for text
        // ctx.font = '10px Arial';
        // // Draw row and column numbers for all cells
        // for (let row = 0; row < height / step; row++) {
        //     for (let col = 0; col < width / step; col++) {
        //         const cellX = col * step + offsetX;
        //         const cellY = row * step + offsetY;
        //         ctx.fillText(`${row},${col}`, cellX + step - 20, cellY + step - 5);
        //     }
        // }
    };

    React.useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;



        const render = () => {
            drawGrid(ctx, scale, offset.x, offset.y);
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [scale, offset, litCells]);

    return (
        <div className="App">
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                style={{ cursor: 'grab' }}
            />
        </div>
    );
}

export default App;