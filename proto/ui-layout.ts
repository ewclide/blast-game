import { LayoutSection } from './layout';

const pauseButton = {
    type: 'button',
    textureId: 'pause-button',
};

const progresText = {
    type: 'text',
    text: 'ПРОГРЕСС',
    anchor: { x: 0.5, y: 0.5 },
    style: {
        fill: 0xffffff,
        fontWeight: 'bolder',
        fontFamily: 'marvin',
        fontSize: 32,
        align: 'center',
    },
};

const progressContainer = {
    type: 'progress',
    fill: 'progress-fill',
    bg: 'progress-bg',
    value: 50,
};

const stepsContainer = {
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

const scoresContainer = {
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

const maxScoresContainer = {
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

const shuffleButton = {
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

const progressSection: LayoutSection = {
    block: {
        width: '500px',
        height: '130px',
        alignY: 'start',
        alighX: 'start',
        direction: 'vertical',
        content: {
            type: 'texture',
            textureId: 'progress-back',
        },
        sections: [
            {
                height: '50px',
                block: {
                    width: '0px',
                    height: '0px',
                    alignY: 'end',
                    content: progresText,
                },
            },
            {
                block: {
                    id: 'progress-bar',
                    width: '430px',
                    height: '35px',
                    content: progressContainer,
                },
            },
        ],
    },
};

const infoSection: LayoutSection = {
    sections: [
        {
            block: {
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
                    content: maxScoresContainer,
                },
            },
        },
        {
            block: {
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
            },
        },
    ],
};

const pauseSection: LayoutSection = {
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

const header: LayoutSection = {
    height: '250px',
    sections: [progressSection, infoSection, pauseSection],
};

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
                block: {
                    id: 'steps',
                    width: '0px',
                    height: '0px',
                    content: stepsContainer,
                },
            },
            {
                height: '40%',
                block: {
                    id: 'scores',
                    width: '0px',
                    height: '0px',
                    alignY: 'start',
                    offsetY: '50px',
                    content: scoresContainer,
                },
            },
        ],
    },
};

const boosterSection: LayoutSection = {
    direction: 'horizontal',
    height: '200px',
    sections: [
        {
            block: {
                id: 'booster-0',
                height: '140px',
                content: {
                    type: 'button',
                    textureId: 'booster-back',
                },
            },
        },
        {
            block: {
                id: 'booster-1',
                height: '140px',
                content: {
                    type: 'button',
                    textureId: 'booster-back',
                },
            },
        },
        {
            block: {
                id: 'booster-2',
                height: '140px',
                content: {
                    type: 'button',
                    textureId: 'booster-back',
                },
            },
        },
    ],
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

const body: LayoutSection = {
    direction: 'horizontal',
    sections: [bodyLeftSection, bodyRightSection],
};

export const uiLayout: LayoutSection = {
    block: {
        width: '1100px',
        direction: 'vertical',
        sections: [header, body],
    },
};
