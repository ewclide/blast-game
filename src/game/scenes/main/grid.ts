import { Container, Point, Texture } from 'pixi.js';
import { Tile, TileType } from './tile';
import { Box } from '../../../core';

export interface GridOptions {
    cols: number;
    rows: number;
    width: number;
    height: number;
}

export interface Cell {
    box: Box;
    position: Point;
    row: number;
    col: number;
    tile: Tile | null;
    /*
        Note: Store as mask
        mask = 0x[row][col] = (row << 16 | col)
        row = mask >> 16;
        col = mask & 0xffff;
    */
    neighbors: number[];
}

export interface TileTypeDescriptor {
    type: TileType;
    texture: Texture;
}

const encodeCoords = (row: number, col: number) => (row << 16) | col;
const decodeCoords = (mask: number) => [mask >> 16, mask & 0xffff];

export class Grid {
    private _cells: Cell[][] = [];
    private _cellSize = new Point();

    readonly cols: number;
    readonly rows: number;
    readonly width: number;
    readonly height: number;
    readonly container: Container;

    get cellWidth(): number {
        return this._cellSize.x;
    }

    get cellHeight(): number {
        return this._cellSize.y;
    }

    onClick: (cell: Cell) => void = () => {};

    constructor(options: GridOptions) {
        this.container = new Container();
        this.container.interactive = true;
        this.container.onclick = (e) => {
            console.log(e);
            // TODO
            // const cell = this.getCellByCoords(x, y);
            // this.onClick();
        };

        this.width = options.width;
        this.height = options.height;
        this.cols = options.cols;
        this.rows = options.rows;

        this.create();
    }

    create() {
        const { rows, cols } = this;

        const cellWidth = this.width / cols;
        const cellHeight = this.height / rows;
        this._cellSize.set(cellWidth, cellHeight);

        const encodeWithBorderCheck = (row: number, col: number) => {
            // Check field restrictions additionally
            return col >= 0 && col < cols && row >= 0 && row < rows
                ? encodeCoords(row, col)
                : -1;
        };

        // Create grid: by columns
        this._cells = Array.from({ length: cols }, (_, col) => {
            return Array.from({ length: rows }, (_, row) => {
                const box = new Box();
                const position = new Point(col * cellWidth, row * cellHeight);
                const neighbors = [
                    encodeWithBorderCheck(row - 1, col),
                    encodeWithBorderCheck(row + 1, col),
                    encodeWithBorderCheck(row, col - 1),
                    encodeWithBorderCheck(row, col + 1),
                    encodeWithBorderCheck(row - 1, col - 1),
                    encodeWithBorderCheck(row - 1, col + 1),
                    encodeWithBorderCheck(row + 1, col - 1),
                    encodeWithBorderCheck(row + 1, col + 1),
                ].filter((v) => v >= 0);

                box.setPositionSize(
                    position.x,
                    position.y,
                    cellWidth,
                    cellHeight
                );

                return {
                    box,
                    position,
                    col,
                    row,
                    tile: null,
                    neighbors,
                };
            });
        });
    }

    forEachCell(traverser: (cell: Cell) => void) {
        for (const verticalLine of this._cells) {
            for (const cell of verticalLine) {
                traverser(cell);
            }
        }
    }

    clear() {
        for (const verticalLine of this._cells) {
            for (const cell of verticalLine) {
                cell.tile = null;
            }
        }
    }

    getCol(col: number): Cell[] {
        return this._cells[col];
    }

    getCellByMask(mask: number): Cell {
        const [row, col] = decodeCoords(mask);
        return this.getCellByRowCol(row, col);
    }

    getCellByRowCol(row: number, col: number): Cell {
        return this._cells[col][row];
    }

    getCellByCoords(x: number, y: number): Cell | null {
        const { x: padX, y: padY } = this.container.position;
        const col = Math.floor((x - padX) / this._cellSize.x);
        const row = Math.floor((y - padY) / this._cellSize.y);

        const verticalLine = this._cells[col];
        if (verticalLine === undefined) {
            return null;
        }

        return verticalLine[row] || null;
    }
}
