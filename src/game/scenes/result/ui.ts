import { Graphics, Text } from 'pixi.js';
import { BaseUI, LayoutText } from '@blast-game/framework';
import { LayoutSection } from '@blast-game/core';
import { GameResult, ResultState, ResultStore } from './store';

const finalMessage: LayoutText = {
    type: 'text',
    text: 'You WIN!',
    anchor: { x: 0.5, y: 0.5 },
    style: {
        fill: 0xffffff,
        fontWeight: 'bolder',
        fontFamily: 'marvin',
        fontSize: 75,
        align: 'center',
    },
};

export const rootLayoutSection: LayoutSection = {
    block: {
        id: 'under-message',
        width: '500px',
        height: '120px',
        content: {
            type: 'background',
            color: 0xff00ff,
        },
        block: {
            id: 'message',
            width: '0px',
            height: '0px',
            content: finalMessage,
        },
    },
};

export class ResultUI extends BaseUI<ResultState> {
    constructor(store: ResultStore, section: LayoutSection) {
        super(store, section);
    }

    async init() {
        await super.init();

        const { layout } = this;
        const message = layout.getContainer('message').view as Text;
        const underMessage = layout.getContainer('under-message')
            .view as Graphics;

        // Sync store with ui
        const { store } = this;

        store.subscribe('result', (value: GameResult) => {
            let backColor = 0xff00ff;
            let resultText = '';

            if (value === GameResult.LOSE) {
                resultText = 'You LOSE :(';
                backColor = 0x990000;
            } else {
                resultText = 'You WIN :)';
                backColor = 0x009900;
            }

            underMessage.rect(0, 0, 10, 10);
            underMessage.fill(backColor);

            message.text = resultText;
        });
    }
}
