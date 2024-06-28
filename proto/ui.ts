import { Button, ProgressBar } from '@pixi/ui';
import { Application, Container, Graphics, Sprite, Text } from 'pixi.js';
import { Layout } from './layout';
import { InternalAssets } from './game';
import { uiLayout } from './ui-layout';

export class UI {
    readonly container: Container;
    readonly layout: Layout;

    constructor(pixi: Application) {
        const container = new Container();
        pixi.stage.addChild(container);
        this.container = container;
        this.layout = new Layout(pixi, uiLayout);

        window.addEventListener('resize', this._handleOnResize);
    }

    destroy() {
        window.removeEventListener('resize', this._handleOnResize);
    }

    create(assets: InternalAssets) {
        const gridBackTexture = assets.textures.get('grid-back');
        if (gridBackTexture === undefined) {
            throw new Error();
        }

        const scoresBackTexture = assets.textures.get('scores-back');
        if (scoresBackTexture === undefined) {
            throw new Error();
        }

        const boosterBackTexture = assets.textures.get('booster-back');
        if (boosterBackTexture === undefined) {
            throw new Error();
        }

        const progressBackTexture = assets.textures.get('progress-back');
        if (progressBackTexture === undefined) {
            throw new Error();
        }

        const progressFillTexture = assets.textures.get('progress-fill');
        if (progressFillTexture === undefined) {
            throw new Error();
        }

        const progressBgTexture = assets.textures.get('progress-bg');
        if (progressBgTexture === undefined) {
            throw new Error();
        }

        const pauseButtonTexture = assets.textures.get('pause-button');
        if (pauseButtonTexture === undefined) {
            throw new Error();
        }

        const scoresBack = new Graphics();
        scoresBack.texture(scoresBackTexture);
        this.container.addChild(scoresBack);
        this.layout.attach('scores-back', scoresBack);

        const gridBack = new Graphics();
        gridBack.texture(gridBackTexture);
        this.container.addChild(gridBack);
        this.layout.attach('grid-back', gridBack);

        const boosterBack0 = new Sprite(boosterBackTexture);
        const boosterButton0 = new Button(boosterBack0);
        this.container.addChild(boosterButton0.view);
        this.layout.attach('booster-0', boosterButton0.view);
        boosterButton0.onPress.connect(() => console.log('click booster 0'));

        const boosterBack1 = new Sprite(boosterBackTexture);
        const boosterButton1 = new Button(boosterBack1);
        this.container.addChild(boosterButton1.view);
        this.layout.attach('booster-1', boosterButton1.view);
        boosterButton1.onPress.connect(() => console.log('click booster 0'));

        const boosterBack2 = new Sprite(boosterBackTexture);
        const boosterButton2 = new Button(boosterBack2);
        this.container.addChild(boosterButton2.view);
        this.layout.attach('booster-2', boosterButton2.view);
        boosterButton2.onPress.connect(() => console.log('click booster 0'));

        const scoresText = new Text({
            style: {
                fill: 0xffffff,
                fontWeight: 'bolder',
                fontSize: 40,
                align: 'center',
            },
        });
        scoresText.text = 'ОЧКИ:\n0';
        scoresText.anchor.set(0.5, 0.5);
        this.container.addChild(scoresText);
        this.layout.attach('scores', scoresText);

        const stepsText = new Text({
            style: {
                fill: 0xffffff,
                fontWeight: 'bolder',
                fontSize: 86,
                align: 'center',
            },
        });
        stepsText.text = '37';
        stepsText.anchor.set(0.5, 0.5);
        this.container.addChild(stepsText);
        this.layout.attach('steps', stepsText);

        const progressBack = new Graphics();
        progressBack.texture(progressBackTexture);
        this.container.addChild(progressBack);
        this.layout.attach('progress-back', progressBack);

        const progressText = new Text({
            style: {
                fill: 0xffffff,
                fontWeight: 'bolder',
                fontSize: 32,
                align: 'center',
            },
        });
        progressText.text = 'ПРОГРЕСС';
        progressText.anchor.set(0.5, 0.5);
        this.container.addChild(progressText);
        this.layout.attach('progress-text', progressText);

        const progressBar = new ProgressBar({
            bg: new Sprite(progressBgTexture),
            fill: new Sprite(progressFillTexture),
            progress: 50,
        });
        this.container.addChild(progressBar);
        this.layout.attach('progress-bar', progressBar);

        const pauseBack = new Sprite(pauseButtonTexture);
        const pauseButton = new Button(pauseBack);
        this.container.addChild(pauseButton.view);
        this.layout.attach('pause', pauseButton.view);
        pauseButton.onPress.connect(() => console.log('click-pause'));

        this._handleOnResize();
    }

    private _handleOnResize = () => {
        this.layout.update();
    };
}
