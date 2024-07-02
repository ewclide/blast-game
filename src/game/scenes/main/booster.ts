import {
    CircleDestroyStrategy,
    DestroyStrategy,
    DestroySystem,
} from './destroy-system';
import { MovementSystem } from './movement-system';
import { Cell, Grid } from './grid';
import { MainStore } from './store';

type BoosterConstructor<B extends BaseBooster> = (new (...args: any[]) => B) & {
    price: number;
};

class BaseBooster {
    static price = 0;

    public completed: boolean = false;

    constructor(
        protected _grid: Grid,
        protected _destroySystem: DestroySystem,
        protected _movementSystem: MovementSystem
    ) {}

    setup(props: unknown) {}

    apply(cell: Cell) {}

    reset() {}
}

export class BombBooster extends BaseBooster {
    static readonly price = 5;

    private _radius: number;
    private _prevStrategy: DestroyStrategy;

    setup(radius: number): void {
        this._radius = radius;
    }

    apply(): void {
        if (this.completed) {
            return;
        }

        const prevStrategy = this._destroySystem.destroyStrategy;
        this._prevStrategy = prevStrategy;

        this._destroySystem.destroyStrategy = new CircleDestroyStrategy(
            this._grid,
            this._radius
        );

        this.completed = true;
    }

    reset() {
        const prevStrategy = this._prevStrategy;
        if (prevStrategy) {
            this._destroySystem.destroyStrategy = prevStrategy;
        }
    }
}

export class BoosterCreator {
    private _activeBooster: BaseBooster | null = null;

    constructor(
        private _store: MainStore,
        private _grid: Grid,
        private _destroySystem: DestroySystem,
        private _movementSystem: MovementSystem
    ) {}

    active<B extends BaseBooster>(
        BoosterType: BoosterConstructor<B>
    ): B | null {
        const scores = this._store.state.scores;
        if (scores < BoosterType.price) {
            return null;
        }

        this._store.setState({
            scores: scores - BoosterType.price,
        });

        if (this._activeBooster) {
            this._activeBooster.reset();
        }

        const booster = new BoosterType(
            this._grid,
            this._destroySystem,
            this._movementSystem
        );

        this._activeBooster = booster;
        return booster;
    }

    apply(cell: Cell) {
        const activeBooster = this._activeBooster;
        if (!activeBooster) {
            return;
        }

        if (activeBooster.completed) {
            activeBooster.reset();
            this._activeBooster = null;
        } else {
            activeBooster.apply(cell);
        }
    }
}
