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
    readonly store: Store<GameStore>;

    constructor(
        pixi: Application,
        resouces: ResourceManager,
        store: Store<GameStore>
    ) {
        const container = new Container();
        pixi.stage.addChild(container);

        this.store = store;
        this.container = container;
        this.resouces = resouces;
        this.layout = new Layout(pixi, uiLayout);

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

        const steps = this.layout.getContainer('steps') as Text;
        const scores = this.layout.getContainer('scores') as Text;
        const maxScores = this.layout.getContainer('max-scores') as Text;
        const progress = this.layout.getContainer(
            'progress-bar'
        ) as ProgressBar;

        // Sync store with ui
        const { store } = this;

        store.subscribe('maxScores', (value: number) => {
            maxScores.text = value;
        });

        store.subscribe('scores', (value: number) => {
            scores.text = `ОЧКИ:\n${value}`;
        });

        store.subscribe('steps', (value: number) => {
            steps.text = value;
        });

        store.subscribe(
            (state) => (state.scores / state.maxScores) * 100,
            (value) => {
                progress.progress = value;
            }
        );
    }

    private _handleOnResize = () => {
        this.layout.update();
    };
}
