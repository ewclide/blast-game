import { Button } from '@pixi/ui';
import { Application, Container, Graphics } from 'pixi.js';
import { Layout } from './layout';
import { InternalAssets } from './game';

export class UI {
    readonly container: Container;
    readonly layout: Layout;

    private _gridBack: Graphics;

    constructor(pixi: Application) {
        const container = new Container();
        // container.zIndex = 1000;
        pixi.stage.addChild(container);
        this.container = container;

        this.layout = new Layout(pixi, {
            direction: 'vertical',
            sections: [
                {
                    key: 'header',
                    height: '200px',
                },
                {
                    key: 'body',
                    direction: 'horizontal',
                    sections: [
                        {
                            width: '60%',
                            block: {
                                key: 'grid-back',
                                width: '600px',
                                height: '600px',
                                alignY: 'start',
                                block: {
                                    key: 'grid',
                                    width: '550px',
                                    height: '550px',
                                },
                            },
                        },
                        {
                            width: '40%',
                        },
                    ],
                },
            ],
        });

        window.addEventListener('resize', this._handleOnResize);
    }

    destroy() {
        window.removeEventListener('resize', this._handleOnResize);
    }

    create(assets: InternalAssets) {
        // const buttonView = new Graphics();
        // buttonView.rect(0, 0, 100, 100);
        // buttonView.fill(0xff00ff);
        // const button = new Button(buttonView);
        // button.onPress.connect(() => console.log('Button pressed!'));
        // this.container.addChild(button.view);
        // button.

        const gridBackTexture = assets.textures.get('grid-back');
        if (gridBackTexture === undefined) {
            throw new Error();
        }

        const gridBack = new Graphics();
        this._gridBack = gridBack;
        gridBack.texture(gridBackTexture);

        this.container.addChild(gridBack);

        this._handleOnResize();
    }

    private _handleOnResize = () => {
        this.layout.update();

        const rect = this.layout.getRect('grid-back');
        const gridBack = this._gridBack;
        gridBack.width = rect.width;
        gridBack.height = rect.height;
        gridBack.x = rect.x;
        gridBack.y = rect.y;
    };
}
