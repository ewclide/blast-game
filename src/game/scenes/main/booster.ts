import {
    CircleDestroyStrategy,
    DestroyStrategy,
    DestroySystem,
} from './destroy-system';
import { MovementSystem } from './movement-system';
import { Cell, Grid } from './grid';
import { MainStore } from './store';

type Newable<T> = new (...args: any[]) => T;
type BoosterConstructor<B extends BaseBooster = BaseBooster> = Newable<B>;

class BaseBooster {
    completed: boolean = false;
    cooldown: number = 0;

    constructor(
        protected _grid: Grid,
        protected _destroySystem: DestroySystem,
        protected _movementSystem: MovementSystem
    ) {}

    apply(cell: Cell) {}

    reset() {}
}

export class BombBooster extends BaseBooster {
    static readonly price = 15;

    radius: number = 0;
    private _prevStrategy: DestroyStrategy;

    apply(): void {
        if (this.completed) {
            return;
        }

        const prevStrategy = this._destroySystem.destroyStrategy;
        this._prevStrategy = prevStrategy;

        this._destroySystem.destroyStrategy = new CircleDestroyStrategy(
            this._grid,
            this.radius
        );

        this.completed = true;
    }

    reset() {
        const prevStrategy = this._prevStrategy;
        if (prevStrategy) {
            this._destroySystem.destroyStrategy = prevStrategy;
        }

        this.completed = false;
    }
}

export class BoosterCreator {
    private _activeBooster: BaseBooster | null = null;
    private _boosters: Map<BoosterConstructor, BaseBooster> = new Map();

    constructor(
        private _store: MainStore,
        private _grid: Grid,
        private _destroySystem: DestroySystem,
        private _movementSystem: MovementSystem
    ) {}

    register<B extends BaseBooster>(BoosterType: BoosterConstructor<B>): B {
        if (this._boosters.has(BoosterType)) {
            throw new Error();
        }

        const booster = new BoosterType(
            this._grid,
            this._destroySystem,
            this._movementSystem
        );
        this._boosters.set(BoosterType, booster);

        return booster;
    }

    active<B extends BaseBooster>(
        BoosterType: BoosterConstructor<B>
    ): B | null {
        if (this._activeBooster) {
            return null;
        }

        const booster = this._boosters.get(BoosterType);
        if (booster === undefined) {
            throw new Error();
        }

        if (booster.cooldown > 0) {
            return null;
        }

        this._activeBooster = booster;
        return booster as B;
    }

    apply(cell: Cell) {
        if (this._activeBooster) {
            this._activeBooster.apply(cell);
        }
    }

    afterApply() {
        const activeBooster = this._activeBooster;
        if (activeBooster && activeBooster.completed) {
            activeBooster.reset();
            this._activeBooster = null;
        }
    }

    update(dt: number) {
        for (const booster of this._boosters.values()) {
            booster.cooldown -= dt;
            booster.cooldown = Math.max(booster.cooldown, 0);
        }
    }
}
