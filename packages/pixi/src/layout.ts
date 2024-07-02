import { Button, CheckBox, ProgressBar } from '@pixi/ui';
import {
    TextOptions,
    Container,
    Graphics,
    Texture,
    Sprite,
    Text,
} from 'pixi.js';

import { Layout, LayoutContent } from '@blast-game/core';
import { ResourcesPixi } from './resources';

export type LayoutBackground = { color: number } & LayoutContent;
export type LayoutTexture = { textureId: string } & LayoutContent;
export type LayoutButton = { textureId: string } & LayoutContent;
export type LayoutText = TextOptions & LayoutContent;
export type LayoutProgress = {
    value: number;
    fill: string;
    bg: string;
} & LayoutContent;

export type LayoutSwitcher = {
    checked: boolean;
    imageOn: string;
    imageOff: string;
} & LayoutContent;

export class LayoutPixi extends Layout<Container> {
    prepare(resouces: ResourcesPixi): void {
        this.regContentCreator<LayoutText>(
            'text',
            (data) => ({ view: new Text(data) }),
            (rect, { view }) => {
                // Note: we must not stretch text, set only position
                view.x = rect.x;
                view.y = rect.y;
            }
        );

        this.regContentCreator<LayoutBackground>('background', (data) => {
            const graphics = new Graphics();
            graphics.rect(0, 0, 10, 10);
            graphics.fill(data.color);
            return { view: graphics };
        });

        this.regContentCreator<LayoutTexture>('texture', (data) => {
            const texture = resouces.get(Texture, data.textureId);
            const graphics = new Graphics();
            graphics.texture(texture);
            return { view: graphics };
        });

        this.regContentCreator<LayoutButton>('button', (data) => {
            const texture = resouces.get(Texture, data.textureId);
            const sprite = new Sprite(texture);
            const button = new Button(sprite);
            return button;
        });

        this.regContentCreator<LayoutProgress>('progress', (data) => {
            const bg = resouces.get(Texture, data.bg);
            const fill = resouces.get(Texture, data.fill);
            const progress = new ProgressBar({
                bg: new Sprite(bg),
                fill: new Sprite(fill),
                progress: data.value || 0,
            });

            return { view: progress };
        });

        this.regContentCreator<LayoutSwitcher>('switcher', (data) => {
            const imageOff = resouces.get(Texture, data.imageOff);
            const imageOn = resouces.get(Texture, data.imageOn);

            const switcher = new CheckBox({
                checked: false,
                style: {
                    unchecked: new Sprite(imageOff),
                    checked: new Sprite(imageOn),
                },
            });

            return { view: switcher };
        });
    }
}
