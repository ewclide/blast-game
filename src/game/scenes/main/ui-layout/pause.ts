import { LayoutSection } from '@blast-game/core';

const pauseButton = {
    type: 'button',
    textureId: 'pause-button',
};

export const pauseSection: LayoutSection = {
    width: '25%',
    block: {
        id: 'pause',
        alighX: 'end',
        alignY: 'start',
        offsetY: '20px',
        width: '70px',
        height: '70px',
        content: pauseButton,
    },
};
