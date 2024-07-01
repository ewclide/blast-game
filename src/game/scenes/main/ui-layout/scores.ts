import { LayoutBlock } from '@blast-game/core';
import { LayoutText } from '@blast-game/framework';

const scoresText: LayoutText = {
    type: 'text',
    text: 'ОЧКИ:\n0',
    anchor: { x: 0.5, y: 0.5 },
    style: {
        fill: 0xffffff,
        fontWeight: 'bolder',
        fontFamily: 'marvin',
        fontSize: 36,
        align: 'center',
    },
};

export const scoresBlock: LayoutBlock = {
    id: 'scores',
    width: '0px',
    height: '0px',
    alignY: 'start',
    offsetY: '50px',
    content: scoresText,
};
