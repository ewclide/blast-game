import { Bounds, Container, Graphics, Point, Texture } from 'pixi.js';
import { Tile, Box } from './tile';
import { randi } from './utils';
import { ClickData } from './input';
import { TimeSystem } from './time';
import { InternalAssets, TileType } from './game';

export interface FieldOptions {
    width: number;
    height: number;
    padding: number;
    sizeX: number;
    sizeY: number;
    minBatchSize: number;
}

interface Cell {
    box: Box;
    tiles: Set<Tile>;
    neighbors: number[];
}

const encodeCoords = (row: number, col: number) => (row << 16) | col;
const decodeCoords = (mask: number) => [mask >> 16, mask & 0xffff];

class Grid {
    readonly cellsByTile = new Map<Tile, Cell[]>();
    readonly cells: Cell[][];
    readonly cellWidth: number;
    readonly cellHeight: number;
    readonly sizeX: number;
    readonly sizeY: number;

    constructor(
        container: Container,
        width: number,
        height: number,
        sizeX: number = 5,
        sizeY: number = 5
    ) {
        const cw = width / sizeX;
        const ch = height / sizeY;

        this.cellWidth = cw;
        this.cellHeight = ch;
        this.sizeX = sizeX;
        this.sizeY = sizeY;

        // const encodeWithBorderCheck = (row: number, col: number) => {
        //     // Check field restrictions additionally
        //     return col >= 0 && col < sizeX && row >= 0 && row < sizeY
        //         ? encodeCoords(row, col)
        //         : -1;
        // };

        this.cells = Array.from({ length: sizeX }, (_, col) => {
            return Array.from({ length: sizeY }, (_, row) => {
                const minX = col * cw;
                const minY = row * ch;
                const box = new Box(minX, minY, minX + cw, minY + ch);

                // const neighbors = [
                //     encodeWithBorderCheck(row - 1, col),
                //     encodeWithBorderCheck(row + 1, col),
                //     encodeWithBorderCheck(row, col - 1),
                //     encodeWithBorderCheck(row, col + 1),
                // ].filter((v) => v >= 0);

                // let rect = new Graphics();
                // rect.rect(minX, minY, cw, ch);
                // rect.stroke({ width: 2, color: 0xff0000 });
                // rect.zIndex = 1000;
                // container.addChild(rect);

                return {
                    box,
                    tiles: new Set(),
                    neighbors: [],
                };
            });
        });

        console.log(this);
    }

    add(tile: Tile) {
        const { minX, minY, maxX, maxY } = tile.container.getBounds();

        const cells = [
            this.getCellByCoords(minX, minY),
            this.getCellByCoords(minX, maxY),
            this.getCellByCoords(maxX, maxY),
            this.getCellByCoords(maxX, minY),
        ];

        let cellsOfTile = this.cellsByTile.get(tile);
        if (cellsOfTile === undefined) {
            cellsOfTile = [];
            this.cellsByTile.set(tile, cellsOfTile);
        }

        for (const cell of cells) {
            if (cell !== null) {
                cellsOfTile.push(cell);
                cell.tiles.add(tile);
            }
        }
    }

    remove(tile: Tile) {
        const cellsOfTile = this.cellsByTile.get(tile);
        if (cellsOfTile === undefined) {
            return;
        }

        for (const cell of cellsOfTile) {
            cell.tiles.delete(tile);
        }

        this.cellsByTile.delete(tile);
    }

    getCellByCoords(x: number, y: number): Cell | null {
        const col = Math.floor(x / this.cellWidth);
        const verticalLine = this.cells[col];
        if (verticalLine === undefined) {
            return null;
        }

        const row = Math.floor(y / this.cellHeight);
        return verticalLine[row] || null;
    }

    pickTile(x: number, y: number): Tile | null {
        const cell = this.getCellByCoords(x, y);
        if (cell === null) {
            return null;
        }

        for (const tile of cell.tiles) {
            const box = tile.container.getBounds();
            if (box.containsPoint(x, y)) {
                return tile;
            }
        }

        return null;
    }

    getNearByTiles(tile: Tile): Set<Tile> {
        const nearTiles = new Set<Tile>();
        const cells = this.cellsByTile.get(tile);
        if (cells === undefined) {
            return nearTiles;
        }

        for (const cell of cells) {
            for (const nearTile of cell.tiles) {
                if (tile !== nearTile) {
                    nearTiles.add(nearTile);
                }
            }
        }

        return nearTiles;
    }
}

interface TileTypeDescriptor {
    type: TileType;
    texture: Texture;
}

const TILE_ACCEL = 2000;

export class Field extends Container implements FieldOptions {
    private _tiles = new Map<number, Tile>();
    private _grid: Grid;
    private _tileSize = new Point();
    private _tileTypes: TileTypeDescriptor[] = [];
    private _tilesToFall = new Set<Tile>();

    readonly fieldWidth: number;
    readonly fieldHeight: number;
    readonly padding: number;
    readonly sizeX: number;
    readonly sizeY: number;
    readonly minBatchSize: number;

    constructor(options: FieldOptions) {
        super();

        this.fieldWidth = options.width;
        this.fieldHeight = options.height;
        this.padding = options.padding;
        this.sizeX = options.sizeX;
        this.sizeY = options.sizeY;
        this.minBatchSize = options.minBatchSize;

        this._grid = new Grid(this, this.fieldWidth, this.fieldHeight);
    }

    create(assets: InternalAssets) {
        const { sizeY, sizeX } = this;
        const tileWidth = this.fieldWidth / sizeX;
        const tileHeight = this.fieldHeight / sizeY;
        this._tileSize.set(tileWidth, tileHeight);

        // Prepare tile descriptors
        this._tileTypes = [...assets.tileTypes].map(([type, texture]) => ({
            type,
            texture,
        }));

        // Generate tiles
        for (let col = 0; col < sizeX; col++) {
            for (let row = 0; row < sizeY; row++) {
                const tile = this.generateTile();
                tile.setPosition(col * tileWidth, row * tileHeight);
                tile.container.zIndex = sizeY - row;
                this._grid.add(tile);
                this._tiles.set(tile.id, tile);
            }
        }
    }

    generateTile(): Tile {
        const { x: tileWidth, y: tileHeight } = this._tileSize;
        const tileTypes = this._tileTypes;
        const randomTile = tileTypes[randi(0, tileTypes.length - 1)];
        const tile = new Tile({
            type: randomTile.type,
            position: new Point(),
            width: tileWidth,
            height: tileHeight,
            texture: randomTile.texture,
            zIndex: 0,
        });

        this.addChild(tile.container);
        return tile;
    }

    update(time: TimeSystem) {
        const dt = time.delta;

        for (const tile of this._tilesToFall) {
            this.testIntersection(tile, dt);
            this._grid.remove(tile);
            this._grid.add(tile);
        }
    }

    testIntersection(tile: Tile, dt: number) {
        // TODO
        const position = tile.container.position;
        const { width: tileW, height: tileH } = tile;
        const tileX = position.x + tileW / 2;
        const tileY = position.y + tileH / 2;
        const { speed } = tile;

        const offset = new Point();
        offset.x = speed.x * dt;
        offset.y = speed.y * dt;

        if (position.y + tileH + offset.y > this.fieldHeight) {
            tile.isStatic = true;
            tile.speed.set(0, 0);
            tile.setPosition(position.x, this.fieldHeight - tile.height);
            this._tilesToFall.delete(tile);
            return;
        }

        // const speedDir = new Point().copyFrom(speed).normalize();
        const bottomTile = this._grid.pickTile(
            // tileX + tileW * speedDir.x,
            // tileY + tileH * speedDir.y
            tileX + tileW * 0,
            tileY + tileH * 1
        );

        if (
            bottomTile !== null &&
            tile.box.intersectBoxPredict(bottomTile.box, offset)
        ) {
            if (bottomTile.isStatic) {
                tile.isStatic = true;
                tile.speed.set(0, 0);
                tile.setPosition(
                    position.x,
                    bottomTile.container.y - tile.height
                );
                this._tilesToFall.delete(tile);
                return;
            } else {
                tile.speed.x = bottomTile.speed.x;
                tile.speed.y = bottomTile.speed.y;
            }
        }

        // Move only vertically
        speed.y += TILE_ACCEL * dt;
        position.x += speed.x * dt;
        position.y += speed.y * dt;
        tile.updateBox();
    }

    shuffle() {
        // for (const verticalLine of this._grid) {
        //     for (const cell of verticalLine) {
        //     }
        // }
    }

    click(data: ClickData) {
        const { x, y } = data.relative;
        const tile = this._grid.pickTile(x, y);
        if (tile === null || !tile.isStatic) {
            return;
        }

        const tilesBatch = this.getTilesBatch(tile);
        if (tilesBatch.size >= this.minBatchSize) {
            for (const tile of tilesBatch) {
                this.destroyTile(tile);
            }

            for (const tile of tilesBatch) {
                const topTiles = this.getTopTiles(tile);
                for (const topTile of topTiles) {
                    topTile.isStatic = false;
                    this._tilesToFall.add(topTile);
                }
            }

            for (const tile of tilesBatch) {
                const newTile = this.generateTile();
                newTile.setPosition();
            }

            // console.log('_tilesToFall', this._tilesToFall.size);
        }

        // Generate tiles on the top of grid to fill it
        // for (let ci = 1; ci <= emptyCells; ci++) {
        //     const tile = this.generateTile();
        //     const dst = verticalLine[emptyCells - ci];
        //     const cX = colIndex * this._tileSize.x + this.padding;
        //     const cY = -ci * this._tileSize.y + this.padding - tile.topPadding;

        //     tile.container.position.set(cX, cY);
        //     tile.container.zIndex = verticalLine.length - dst.row;
        //     this._tilesToFall.add({ tile, dst });
        // }
    }

    getTopTiles(tile: Tile, _topTiles = new Set<Tile>()): Set<Tile> {
        // TODO: get from tile
        const { width: tileW, height: tileH } = tile;
        const tileX = tile.container.position.x + tileW / 2;
        const tileY = tile.container.position.y + tileH / 2;

        const topTile = this._grid.pickTile(tileX, tileY - tileH);
        if (topTile !== null) {
            _topTiles.add(topTile);
            this.getTopTiles(topTile, _topTiles);
        }

        return _topTiles;
    }

    getTilesBatch(tile: Tile, _batch = new Set<Tile>()): Set<Tile> {
        if (_batch.has(tile)) {
            return _batch;
        }

        _batch.add(tile);

        // TODO: get from tile
        const { width: tileW, height: tileH } = tile;
        const tileX = tile.container.position.x + tileW / 2;
        const tileY = tile.container.position.y + tileH / 2;
        const pickingCoords = [
            [tileX - tileW, tileY],
            [tileX + tileW, tileY],
            [tileX, tileY - tileH],
            [tileX, tileY + tileH],
        ];

        for (const coords of pickingCoords) {
            const nearTile = this._grid.pickTile(
                ...(coords as [number, number])
            );
            if (
                nearTile !== null &&
                nearTile.isStatic &&
                nearTile.type === tile.type
            ) {
                this.getTilesBatch(nearTile, _batch);
            }
        }

        return _batch;
    }

    destroyTile(tile: Tile) {
        // console.log('destroy');
        this._tiles.delete(tile.id);
        this._grid.remove(tile);
        this.removeChild(tile.container);
    }
}
