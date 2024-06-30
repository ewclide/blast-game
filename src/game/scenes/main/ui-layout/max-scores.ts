import { LayoutBlock } from '../../../../core/layout';

const maxScoresText = {
    type: 'text',
    text: '6500',
    anchor: { x: 0.5, y: 0.5 },
    style: {
        fill: 0xffffff,
        fontWeight: 'bolder',
        fontFamily: 'marvin',
        fontSize: 30,
        align: 'center',
    },
};

export const maxScoresBlock: LayoutBlock = {
    alignY: 'start',
    offsetY: '25px',
    width: '150px',
    height: '60px',
    content: {
        type: 'texture',
        textureId: 'red-button',
    },
    block: {
        id: 'max-scores',
        width: '0px',
        height: '0px',
        content: maxScoresText,
    },
};
