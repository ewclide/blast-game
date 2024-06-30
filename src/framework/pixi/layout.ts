import { Button, ProgressBar } from '@pixi/ui';
import {
    TextOptions,
    Container,
    Graphics,
    Texture,
    Sprite,
    Text,
} from 'pixi.js';

import { Layout, LayoutContent } from '../../core';
import { ResourcesPixi } from './resources';

export type LayoutTexture = { textureId: string } & LayoutContent;
export type LayoutButton = { textureId: string } & LayoutContent;
export type LayoutText = TextOptions & LayoutContent;
export type LayoutProgress = {
    value: number;
    fill: string;
    bg: string;
} & LayoutContent;

export class LayoutPixi extends Layout<Container> {
    prepare(resouces: ResourcesPixi): void {
        this.regContentCreator<LayoutText>(
            'text',
            (data) => new Text(data),
            (rect, container) => {
                // Note: we must not stretch text, set only position
                container.x = rect.x;
                container.y = rect.y;
            }
        );

        this.regContentCreator<LayoutTexture>('texture', (data) => {
            const texture = resouces.get(Texture, data.textureId);
            const graphics = new Graphics();
            graphics.texture(texture);
            return graphics;
        });

        this.regContentCreator<LayoutButton>('button', (data) => {
            const texture = resouces.get(Texture, data.textureId);
            const sprite = new Sprite(texture);
            const button = new Button(sprite);
            return button.view;
        });

        this.regContentCreator<LayoutProgress>('progress', (data) => {
            const bg = resouces.get(Texture, data.bg);
            const fill = resouces.get(Texture, data.fill);
            return new ProgressBar({
                bg: new Sprite(bg),
                fill: new Sprite(fill),
                progress: data.value || 0,
            });
        });
    }
}
