import { Application, Assets, Texture } from 'pixi.js';
import { Field, FieldOptions } from './field';
import { InputSystem } from './input';
import { TimeSystem } from './time';

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
}

export class Game {
    readonly time: TimeSystem;
    readonly input: InputSystem;
    readonly field: Field;
    readonly options: GameOptions;
    private _assets!: InternalAssets;

    constructor(pixi: Application, options: GameOptions) {
        this.time = new TimeSystem();
        this.input = new InputSystem(pixi.canvas);
        this.field = new Field(options.field);
        this.options = options;

        pixi.stage.addChild(this.field.container);
    }

    private async _loadAssets() {
        const textureByImage = new Map<ImageName, Texture>();
        for (const [name, path] of Object.entries(this.options.assets)) {
            const texture = await Assets.load(path);
            textureByImage.set(name, texture);
        }

        const tileTypes = new Map<TileType, Texture>();
        for (const [type, image] of Object.entries(this.options.tileTypes)) {
            const texture = textureByImage.get(image);
            if (texture === undefined) {
                throw new Error();
            }

            tileTypes.set(type, texture);
        }

        this._assets = {
            tileTypes,
        };
    }

    async start() {
        await this._loadAssets();
        this.field.create(this._assets);
    }

    update = () => {
        this.time.update();
        this.logicUpdate();
        this.input.lateUpdate();
    };

    logicUpdate() {
        this.field.update(this.time);

        const click = this.input.click;
        if (click) {
            this.field.click(click);
        }
    }
}
