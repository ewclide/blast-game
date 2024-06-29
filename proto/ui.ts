import { Button, ProgressBar } from '@pixi/ui';
import {
    Application,
    TextOptions,
    Container,
    Graphics,
    Texture,
    Sprite,
    Text,
} from 'pixi.js';

import { Layout, LayoutContentDescriptor } from './layout';
import { ResourceManager } from './resource';
import { GameStore } from './game';
import { uiLayout } from './ui-layout';
import { Store } from './store';

export class UI {
    readonly container: Container;
    readonly layout: Layout;
    readonly resouces: ResourceManager;

    constructor(
        pixi: Application,
        resouces: ResourceManager,
        store: Store<GameStore>
    ) {
        const container = new Container();
        pixi.stage.addChild(container);

        this.container = container;
        this.resouces = resouces;
        this.layout = new Layout(pixi, uiLayout);

        store.subscribe('scores', (value) => {
            console.log('value', value);
        });

        window.addEventListener('resize', this._handleOnResize);
    }

    destroy() {
        window.removeEventListener('resize', this._handleOnResize);
    }

    create() {
        const { resouces } = this;

        this.layout.regContentBuilder<{ textureId: string }>(
            'texture',
            (data) => {
                const texture = resouces.get(Texture, data.textureId);
                const graphics = new Graphics();
                graphics.texture(texture);
                return graphics;
            }
        );

        this.layout.regContentBuilder<{ textureId: string }>(
            'button',
            (data) => {
                const texture = resouces.get(Texture, data.textureId);
                const sprite = new Sprite(texture);
                const button = new Button(sprite);
                // button.onPress.connect(() => console.log('click booster 0'));
                return button.view;
            }
        );

        type ProgressContenxt = {
            value: number;
            fill: string;
            bg: string;
        } & LayoutContentDescriptor;

        this.layout.regContentBuilder<ProgressContenxt>('progress', (data) => {
            const bg = resouces.get(Texture, data.bg);
            const fill = resouces.get(Texture, data.fill);
            return new ProgressBar({
                bg: new Sprite(bg),
                fill: new Sprite(fill),
                progress: data.value || 0,
            });
        });

        type TextContent = TextOptions & LayoutContentDescriptor;
        this.layout.regContentBuilder<TextContent>(
            'text',
            (data) => new Text(data)
        );

        this.layout.create(this.container);
    }

    private _handleOnResize = () => {
        this.layout.update();
    };
}
