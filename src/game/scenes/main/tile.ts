import { TimeSystem } from '@blast-game/framework';
import { Easing, Tween } from '@tweenjs/tween.js';
import { IStore, StoreState } from '@blast-game/core';
import { Container, Point, Sprite, Texture } from 'pixi.js';
import { Cell, CellAttachment, Grid } from './grid';

export type ComponentType = string;
export interface TileComponent {
    type: string;
    entity: TileEntity | null;
    needsUpdate: boolean;
    activate(): void;
    onCreate(options: unknown): void;
    onAttach(entity: TileEntity): void;
    onUpdate(dt: number): void;
    onDestroy(): void;
}

export type TileFamily = string;
export interface TileEntity extends CellAttachment {
    id: number;
    family: TileFamily;
    width: number;
    height: number;
    container: Container;
    components: Map<ComponentType, TileComponent>;
    getNeighbors(): TileEntity[];
    onDestroy: () => void;
}

declare type Newable<T> = { new (...args: any[]): T };

export type TileComponentConstructor<C extends TileComponent = TileComponent> =
    Newable<C> & { type: string };

export class BaseComponent implements TileComponent {
    static type = 'base';

    protected _store: IStore<StoreState>;
    protected _tileFactory: TileFactory;
    protected _components: ComponentManager;

    entity: TileEntity | null = null;
    needsUpdate = false;

    constructor(
        store: IStore<StoreState>,
        tileFactory: TileFactory,
        components: ComponentManager
    ) {
        this._store = store;
        this._tileFactory = tileFactory;
        this._components = components;
    }

    get type() {
        return (this.constructor as typeof BaseComponent).type;
    }

    onCreate(options: unknown): void {}

    onAttach(entity: TileEntity): void {}

    onUpdate(dt: number): void {}

    onDestroy(): void {}

    activate(): void {}
}

export class ViewComponent extends BaseComponent {
    static readonly type = 'view';

    private _sprite = new Sprite();

    onCreate({ texture }: { texture: Texture }) {
        this._sprite.texture = texture;
    }

    onAttach(entity: TileEntity): void {
        const sprite = this._sprite;
        const { texture } = sprite;
        const { width, height } = entity;
        const sizeFactor = texture.height / texture.width;
        const topPadding = height * (sizeFactor - 1);

        sprite.position.y -= topPadding;
        sprite.width = width;
        sprite.height = height * sizeFactor;

        entity.container.addChild(sprite);
    }
}

const TILE_ACCEL = 3000;
export class MovementComponent extends BaseComponent {
    static readonly type = 'movement';

    private _dst: Cell | null = null;
    private _delay: number = 0;
    private _speed: number = 0;

    onComplete = () => {};

    setDstCell(cell: Cell) {
        if (this.entity) {
            this.entity.detach();
        }

        this._dst = cell;
    }

    onCreate({ delay }: { delay: number }) {
        this._delay = delay;
    }

    onUpdate(dt: number): void {
        const { entity, _dst } = this;
        if (entity === null || _dst === null) {
            return;
        }

        if (this._delay > 0) {
            this._delay -= dt;
            return;
        }

        const maxY = _dst.position.y;
        const position = entity.container.position;

        this._speed += TILE_ACCEL * dt;
        position.y += this._speed * dt;

        if (position.y >= maxY) {
            position.y = maxY;
            this._speed = 0;
            this.needsUpdate = false;
            entity.attach(_dst);
            this.onComplete();
            // TODO: on finish
        }
    }
}

export class ScoresComponent extends BaseComponent {
    static readonly type = 'scores';

    private _scores: number = 0;

    // TODO: types of store & factory
    onCreate({ scores }: { scores: number }) {
        this._scores = scores;
    }

    onDestroy(): void {
        const scores = this._store.state.scores;
        this._store.setState({
            scores: scores + this._scores,
        });
    }
}

export class DestroyComponent extends BaseComponent {
    static readonly type = 'destroy';

    private _tween: Tween<any> | null = null;
    private _maxDelay: number = 120;
    private _duration: number = 80;

    activate() {
        this._tween?.start();
    }

    onAttach(entity: TileEntity): void {
        const { container } = entity;
        container.zIndex = 100;

        this._tween = new Tween({
            scale: 1,
            alpha: 1,
        })
            .to({
                scale: 0,
                alpha: 0,
            })
            .easing(Easing.Quartic.In)
            .delay(Math.random() * this._maxDelay)
            .duration(this._duration)
            .onUpdate(({ scale, alpha }) => {
                container.position.x += 2;
                container.position.y += 2;
                container.scale = scale;
                container.alpha = alpha;
            })
            .onComplete(() => {
                this.needsUpdate = false;
                this._tileFactory.destroy(entity);
            });
    }

    onUpdate(dt: number): void {
        if (this._tween) {
            this._tween.update();
        }
    }
}

export class ComponentManager {
    private _queue: Set<TileComponent> = new Set();
    private _time: TimeSystem;
    private _store: IStore;
    private _tileFactory: TileFactory;

    constructor(time: TimeSystem, store: IStore, tileFactory: TileFactory) {
        this._time = time;
        this._store = store;
        this._tileFactory = tileFactory;
    }

    create(ComponentType: typeof BaseComponent, options?: any): TileComponent {
        const component = new ComponentType(
            this._store,
            this._tileFactory,
            this
        );
        component.onCreate(options);

        return component;
    }

    get<C extends BaseComponent>(
        entity: TileEntity,
        ComponentType: TileComponentConstructor<C>
    ): C {
        const component = entity.components.get(ComponentType.type);
        if (!component) {
            throw new Error();
        }

        return component as C;
    }

    getByType<C extends BaseComponent>(
        entity: TileEntity,
        type: string
    ): C | null {
        return (entity.components.get(type) as C) || null;
    }

    attach(entity: TileEntity, component: TileComponent) {
        if (component.entity !== null) {
            throw new Error();
        }

        component.entity = entity;
        entity.components.set(component.type, component);
        component.onAttach(entity);
    }

    update() {
        const dt = this._time.delta;
        for (const component of this._queue) {
            component.onUpdate(dt);
            if (!component.needsUpdate) {
                this._queue.delete(component);
            }
        }
    }

    requestUpdate(component: TileComponent) {
        component.needsUpdate = true;
        this._queue.add(component);
    }
}

export interface TileOptions {
    width: number;
    height: number;
    position: Point;
    zIndex: number;
    family: TileFamily;
}

let tileID = 0;
export class Tile implements TileEntity {
    readonly id = tileID++;
    readonly family: TileFamily;
    readonly width: number;
    readonly height: number;
    readonly container: Container;
    readonly components: Map<string, TileComponent> = new Map();

    onDestroy = () => {};
    cell: Cell | null = null;

    constructor(options: TileOptions) {
        const { width, height, position, family, zIndex } = options;

        const container = new Container();
        container.position.copyFrom(position);
        container.zIndex = zIndex;
        // TODO...
        // container.scale.set(width, height);
        // container.width = width;
        // container.height = height;

        this.family = family;
        this.width = width;
        this.height = height;
        this.container = container;
    }

    getNeighbors(): Tile[] {
        const { cell } = this;
        if (cell === null) {
            return [];
        }

        return cell.neighbors
            .map((c) => c.attachment)
            .filter((t) => t !== null) as Tile[];
    }

    attach(cell: Cell) {
        this.cell = cell;
        cell.attachment = this;
    }

    detach() {
        const { cell } = this;
        if (cell) {
            cell.attachment = null;
            this.cell = null;
        }
    }
}

export class TileFactory {
    private _container: Container;
    private _tiles: Map<number, TileEntity> = new Map();

    constructor(container: Container) {
        this._container = container;
    }

    create(options: TileOptions): TileEntity {
        const tile = new Tile(options);

        this._tiles.set(tile.id, tile);
        this._container.addChild(tile.container);

        return tile;
    }

    destroy(tile: TileEntity) {
        for (const component of tile.components.values()) {
            component.onDestroy();
            component.entity = null;
        }

        this._tiles.delete(tile.id);
        this._container.removeChild(tile.container);
        tile.detach();
        tile.onDestroy();
    }
}
