import { randi } from '@blast-game/core';
import { Button } from '@pixi/ui';
import { Context, BaseScene } from '@blast-game/framework';
import { Point, Texture } from 'pixi.js';
import { MainState, MainStore } from './store';
import { MovementSystem } from './movement-system';
import { Tile, TileType } from './tile';
import { DestroySystem } from './destroy-system';
import { Cell, Grid } from './grid';
import { MainUI } from './ui';

export interface TileTypeDescriptor {
    type: TileType;
    texture: Texture;
}

export class MainScene extends BaseScene<MainState> {
    private _grid!: Grid;
    private _tiles = new Map<number, Tile>();
    private _tileTypes: TileTypeDescriptor[] = [];
    private _stopClicking: boolean = false;
    private _activeBoosterBomb: boolean = false;
    private _movementSystem: MovementSystem;
    private _destroySystem: DestroySystem;

    constructor(name: string, ui: MainUI, store: MainStore) {
        super(name, ui, store);

        this.container.addChild(this.ui.container);

        this._grid = new Grid({
            cols: 10,
            rows: 10,
            width: 550,
            height: 550,
            topPadding: 7,
        });

        this._movementSystem = new MovementSystem();
        this._destroySystem = new DestroySystem(this._grid);
    }

    async init() {
        await super.init();

        // TODO
        const { resources } = Context.get();

        const tileTypes = {
            red: 'tile-red',
            green: 'tile-green',
            blue: 'tile-blue',
            pink: 'tile-pink',
            yellow: 'tile-yellow',
        };

        const tiles: TileTypeDescriptor[] = [];
        for (const [type, image] of Object.entries(tileTypes)) {
            const texture = resources.get(Texture, image);
            tiles.push({ type, texture });
        }

        this._tileTypes = tiles;

        this.fillGrid();

        this._grid.onClick = this.onClickGrid;

        this.ui.layout.attach('grid', {
            view: this._grid.container,
        });

        this.store.setState({
            scores: 0,
            steps: 50,
            maxScores: 100,
            shuffles: 5,
        });

        this.store.subscribe(
            (state) => state.scores >= state.maxScores || state.steps <= 0,
            () => {
                this.stop();
                this.finish();
            },
            { firstStart: false }
        );

        const shuffleButton = this.ui.layout.getContainer('shuffle') as Button;
        shuffleButton.onPress.connect(() => {
            const shuffles = this.store.state.shuffles;
            if (shuffles > 0) {
                this.store.setState({ shuffles: shuffles - 1 });
                this.shuffle();
            }
        });

        this._destroySystem.onDestroyTiles = () => {
            const { scores, steps } = this.store.state;
            this.store.setState({
                scores: scores + tiles.length,
                steps: steps - 1,
            });
        };
    }

    updateSceneCycle(): void {
        const dt = this.time.delta;

        this._destroySystem.update(dt);
        this._movementSystem.update(dt);

        if (!this._movementSystem.tilesToMoveCount) {
            this._stopClicking = false;
        }
    }

    onClickGrid = (cell: Cell) => {
        if (this._stopClicking) {
            return;
        }

        const destroyedTiles = this._destroySystem.destroy(cell);
        if (destroyedTiles.length) {
            this._stopClicking = true;
        }

        for (const tile of destroyedTiles) {
            this._tiles.delete(tile.id);
        }

        this._grid.forEachColumn(this.generateTopTiles);
    };

    generateTopTiles = (column: Cell[], col: number) => {
        // TODO: split by
        // getEmptyCells => Cell[]
        // addTilesToFall()

        let emptyCells = 0;
        for (let ci = column.length - 1; ci >= 0; ci--) {
            const cell = column[ci];
            const { tile } = cell;

            if (tile === null) {
                emptyCells++;
            }

            if (tile !== null && emptyCells > 0) {
                // Now the tile is not attached to the cell, because it's falling
                cell.tile = null;
                const dst = column[ci + emptyCells];
                tile.container.zIndex = column.length - dst.row;
                this._movementSystem.addTile(tile, dst);
            }
        }

        const { cellWidth, cellHeight } = this._grid;

        for (let ci = 0; ci < emptyCells; ci++) {
            const tile = this.generateTile();
            const dst = column[emptyCells - (ci + 1)];
            const cX = col * cellWidth;
            const cY = -(ci + 1) * cellHeight - tile.topPadding;

            tile.container.position.set(cX, cY);
            tile.container.zIndex = column.length - dst.row;
            this._movementSystem.addTile(tile, dst);
        }
    };

    fillGrid() {
        const { rows } = this._grid;

        this._grid.forEachCell((cell) => {
            const tile = this.generateTile();
            // TODO: replace this by accessors
            tile.container.position.copyFrom(cell.position);
            tile.container.zIndex = rows - cell.row;
            cell.tile = tile;
        });
    }

    generateTile(): Tile {
        const { cellWidth, cellHeight } = this._grid;
        const tileTypes = this._tileTypes;
        const randomTile = tileTypes[randi(0, tileTypes.length - 1)];

        const tile = new Tile({
            type: randomTile.type,
            position: new Point(),
            width: cellWidth,
            height: cellHeight,
            texture: randomTile.texture,
            zIndex: 0,
            scores: 1,
        });

        this._tiles.set(tile.id, tile);
        this._grid.container.addChild(tile.container);

        return tile;
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
