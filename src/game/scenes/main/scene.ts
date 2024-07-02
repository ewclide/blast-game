import { Button, CheckBox, Switcher } from '@pixi/ui';
import { BaseScene } from '@blast-game/framework';
import { BatchDestroyStrategy, DestroySystem } from './destroy-system';
import { MainState, MainStore } from './store';
import { MovementSystem } from './movement-system';
import { BombBooster, BoosterCreator } from './booster';
import { TileGenerator } from './tile-generator';
import { Cell, Grid } from './grid';
import { MainUI } from './ui';

export class MainScene extends BaseScene<MainState> {
    private _grid!: Grid;
    private _stopClicking: boolean = false;
    private _movementSystem: MovementSystem;
    private _tileGenerator: TileGenerator;
    private _destroySystem: DestroySystem;
    private _boosterCreator: BoosterCreator;

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
        this._boosterCreator = new BoosterCreator(
            store,
            this._grid,
            this._destroySystem,
            this._movementSystem
        );
    }

    async init() {
        await super.init();

        this._tileGenerator.init();
        this._tileGenerator.fillGrid();
        this._grid.onClick = this.onClickGrid;
        this._destroySystem.destroyStrategy = new BatchDestroyStrategy(
            this._grid,
            2
        );

        this.ui.layout.attach('grid', {
            view: this._grid.container,
        });

        this.store.setState({
            scores: 0,
            steps: 25,
            maxScores: 100,
            shuffles: 5,
            boosters: 5,
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

        const boosterBomb = this._boosterCreator.register(BombBooster);
        boosterBomb.radius = 110;

        const boosterBombSwitcher = this.ui.layout.getContainer(
            'booster-bomb-switcher'
        ).view as CheckBox;

        boosterBombSwitcher.onCheck.connect(() => {
            const boosters = this.store.state.boosters;
            if (!boosters) {
                boosterBombSwitcher.forceCheck(false);
                return;
            }

            const active = this._boosterCreator.active(BombBooster);
            if (active) {
                this.store.setState({ boosters: boosters - 1 });
                active.onApply = () => boosterBombSwitcher.forceCheck(false);
            } else {
                boosterBombSwitcher.forceCheck(true);
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
        this._boosterCreator.update(dt);

        if (!this._movementSystem.tilesToMoveCount) {
            this._stopClicking = false;
        }
    }

    onClickGrid = (cell: Cell) => {
        if (this._stopClicking) {
            return;
        }

        this._boosterCreator.apply(cell);

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

        this._boosterCreator.afterApply();
    };
}
