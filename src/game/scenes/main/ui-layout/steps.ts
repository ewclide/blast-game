import { LayoutBlock } from '@blast-game/core';
import { LayoutText } from '@blast-game/framework';

const stepsText: LayoutText = {
    type: 'text',
    text: '37',
    anchor: { x: 0.5, y: 0.5 },
    style: {
        fill: 0xffffff,
        fontWeight: 'bolder',
        fontFamily: 'marvin',
        fontSize: 75,
        align: 'center',
    },
};

export const stepsBlock: LayoutBlock = {
    id: 'steps',
    width: '0px',
    height: '0px',
    content: stepsText,
};
