import { Application, Assets, Texture } from 'pixi.js';
import { Grid, FieldOptions } from './grid';
import { InputSystem } from './input';
import { TimeSystem } from './time';
import { UI } from './ui';

export interface AssetsDescriptor {
    tiles: { type: string; image: string }[];
}

export type ImageName = string;
export type ImagePath = string;
export type TileType = number | string;

export interface GameOptions {
    field: FieldOptions;
    assets: Record<ImageName, ImagePath>;
    tileTypes: Record<TileType, ImageName>;
}

export interface InternalAssets {
    tileTypes: Map<TileType, Texture>;
    textures: Map<string, Texture>;
}

export class Game {
    readonly time: TimeSystem;
    readonly input: InputSystem;
    readonly grid: Grid;
    readonly options: GameOptions;
    readonly ui: UI;
    private _assets!: InternalAssets;

    constructor(pixi: Application, options: GameOptions) {
        this.time = new TimeSystem();
        this.input = new InputSystem(pixi.canvas);
        this.grid = new Grid(options.field);
        this.options = options;
        this.ui = new UI(pixi);

        this.ui.layout.attach('grid', this.grid.container);

        pixi.stage.addChild(this.grid.container);
    }

    private async _loadAssets() {
        const textures = new Map<ImageName, Texture>();
        for (const [name, path] of Object.entries(this.options.assets)) {
            const texture = await Assets.load(path);
            textures.set(name, texture);
        }

        const tileTypes = new Map<TileType, Texture>();
        for (const [type, image] of Object.entries(this.options.tileTypes)) {
            const texture = textures.get(image);
            if (texture === undefined) {
                throw new Error();
            }

            tileTypes.set(type, texture);
        }

        this._assets = {
            tileTypes,
            textures,
        };
    }

    async start() {
        await this._loadAssets();

        this.grid.create(this._assets);
        this.ui.create(this._assets);
    }

    update = () => {
        this.time.update();
        this.logicUpdate();
        this.input.lateUpdate();
    };

    logicUpdate() {
        this.grid.update(this.time);

        const click = this.input.click;
        if (click) {
            this.grid.click(click);
        }
    }
}
