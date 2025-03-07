import { randi } from '@blast-game/core';
import { Tile, TileFamily } from './tile';
import { Point, Texture } from 'pixi.js';
import { getGameConfig } from '../../config-types';
import { Cell, Grid } from './grid';

interface TileTypeDescriptor {
    family: TileFamily;
    texture: Texture;
    scores: number;
}

export class TileGenerator {
    private _grid!: Grid;
    private _tiles = new Map<number, Tile>();
    private _tileTypes: TileTypeDescriptor[] = [];

    constructor(grid: Grid) {
        this._grid = grid;
    }

    init() {
        const { resources, config } = getGameConfig();

        const tiles: TileTypeDescriptor[] = [];
        for (const { family, image, scores } of config.tileTypes) {
            const texture = resources.get(Texture, image);
            tiles.push({ family, texture, scores });
        }

        this._tileTypes = tiles;
    }

    remove(tile: Tile): void {
        this._tiles.delete(tile.id);
    }

    generate(): Tile {
        const { cellWidth, cellHeight } = this._grid;
        const tileTypes = this._tileTypes;
        const randomTile = tileTypes[randi(0, tileTypes.length - 1)];

        const tile = new Tile({
            family: randomTile.family,
            position: new Point(),
            width: cellWidth,
            height: cellHeight,
            texture: randomTile.texture,
            scores: randomTile.scores,
            zIndex: 0,
        });

        this._tiles.set(tile.id, tile);
        this._grid.container.addChild(tile.container);

        return tile;
    }

    generateTopTiles = (
        emptyCells: number,
        column: Cell[],
        col: number
    ): [Tile, Cell][] => {
        const { cellWidth, cellHeight } = this._grid;
        const tilesToFall: [Tile, Cell][] = [];

        for (let ci = 0; ci < emptyCells; ci++) {
            const tile = this.generate();
            const dst = column[emptyCells - (ci + 1)];
            const cX = col * cellWidth;
            const cY = -(ci + 1) * cellHeight - tile.topPadding;

            tile.container.position.set(cX, cY);
            tile.container.zIndex = column.length - dst.row;

            tilesToFall.push([tile, dst]);
            // this._movementSystem.addTile(tile, dst);
        }

        return tilesToFall;
    };

    fillGrid() {
        const { rows } = this._grid;

        this._grid.forEachCell((cell) => {
            const tile = this.generate();
            // TODO: replace this by accessors
            tile.container.position.copyFrom(cell.position);
            tile.container.zIndex = rows - cell.row;
            cell.tile = tile;
        });
    }

    shuffle() {
        this._grid.clear();

        const tiles = [...this._tiles.values()];

        let currentIndex = tiles.length - 1;
        while (currentIndex >= 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            const randomTile = tiles[randomIndex];
            const currentTile = tiles[currentIndex];

            tiles[currentIndex] = randomTile;
            tiles[randomIndex] = currentTile;

            currentIndex--;
        }

        const { cols, rows } = this._grid;
        tiles.forEach((tile, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const cell = this._grid.getCellByRowCol(row, col);

            tile.container.position.copyFrom(cell.position);
            tile.container.zIndex = rows - row;
            cell.tile = tile;
        });
    }
}
