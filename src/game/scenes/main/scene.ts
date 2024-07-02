import { Button } from '@pixi/ui';
import { BaseScene } from '@blast-game/framework';
import { MainState, MainStore } from './store';
import { MovementSystem } from './movement-system';
import { DestroySystem } from './destroy-system';
import { TileGenerator } from './tile-generator';
import { Cell, Grid } from './grid';
import { MainUI } from './ui';

export class MainScene extends BaseScene<MainState> {
    private _grid!: Grid;
    private _stopClicking: boolean = false;
    private _activeBoosterBomb: boolean = false;
    private _movementSystem: MovementSystem;
    private _tileGenerator: TileGenerator;
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
        this._tileGenerator = new TileGenerator(this._grid);
    }

    async init() {
        await super.init();

        this._tileGenerator.init();
        this._tileGenerator.fillGrid();
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
                this._tileGenerator.shuffle();
            }
        });

        this._destroySystem.onDestroyTiles = (tiles) => {
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
            this._tileGenerator.remove(tile);
        }

        this._grid.forEachColumn((column, col) => {
            const emptyCells = this._movementSystem.moveHoveredTiles(
                column,
                col
            );

            const topTiles = this._tileGenerator.generateTopTiles(
                emptyCells,
                column,
                col
            );

            for (const [tile, cell] of topTiles) {
                this._movementSystem.addTile(tile, cell);
            }
        });
    };
}
