import { LayoutBlock } from '@blast-game/core';
import { LayoutText } from '@blast-game/framework';

// TODO
const shuffleButton: LayoutText = {
    type: 'text',
    text: 'перемешать (5)',
    anchor: { x: 0.5, y: 0.5 },
    style: {
        fill: 0xffffff,
        fontWeight: 'bolder',
        fontFamily: 'marvin',
        fontSize: 18,
        align: 'center',
    },
};

export const shuffleBlock: LayoutBlock = {
    alignY: 'start',
    offsetY: '25px',
    width: '200px',
    height: '60px',
    content: {
        type: 'button',
        textureId: 'pink-button',
    },
    block: {
        width: '0px',
        height: '0px',
        content: shuffleButton,
    },
};
