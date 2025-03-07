import { LayoutSection } from '@blast-game/core';
import { progressSection } from './progress';
import { maxScoresBlock } from './max-scores';
import { boosterSection } from './booster';
import { shuffleBlock } from './shuffle';
import { pauseSection } from './pause';
import { scoresBlock } from './scores';
import { stepsBlock } from './steps';

const scoresSection: LayoutSection = {
    height: '400px',
    block: {
        direction: 'vertical',
        content: {
            type: 'texture',
            textureId: 'scores-back',
        },
        sections: [
            {
                height: '60%',
                block: stepsBlock,
            },
            {
                height: '40%',
                block: scoresBlock,
            },
        ],
    },
};

const bodyLeftSection: LayoutSection = {
    block: {
        content: {
            type: 'texture',
            textureId: 'grid-back',
        },
        width: '600px',
        height: '600px',
        alignY: 'start',
        alighX: 'start',
        block: {
            id: 'grid',
            width: '550px',
            height: '550px',
        },
    },
};

const bodyRightSection: LayoutSection = {
    block: {
        alignY: 'start',
        alighX: 'end',
        direction: 'vertical',
        width: '400px',
        height: '600px',
        sections: [scoresSection, boosterSection],
    },
};

const infoSection: LayoutSection = {
    sections: [
        {
            block: maxScoresBlock,
        },
        {
            block: shuffleBlock,
        },
    ],
};

const header: LayoutSection = {
    height: '250px',
    sections: [progressSection, infoSection, pauseSection],
};

const body: LayoutSection = {
    direction: 'horizontal',
    sections: [bodyLeftSection, bodyRightSection],
};

export const rootLayoutSection: LayoutSection = {
    block: {
        width: '1100px',
        direction: 'vertical',
        sections: [header, body],
    },
};
