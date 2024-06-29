import { LayoutSection } from './layout';

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
                    content: {
                        type: 'text',
                        text: 'ПРОГРЕСС',
                        anchor: { x: 0.5, y: 0.5 },
                        style: {
                            fill: 0xffffff,
                            fontWeight: 'bolder',
                            fontSize: 32,
                            align: 'center',
                        },
                    },
                },
            },
            {
                block: {
                    id: 'progress-bar',
                    width: '430px',
                    height: '35px',
                    content: {
                        type: 'progress',
                        fill: 'progress-fill',
                        bg: 'progress-bg',
                        value: 50,
                    },
                },
            },
        ],
    },
};

const infoSection: LayoutSection = {
    block: {
        width: '400px',
        height: '70px',
        alignY: 'start',
        offsetY: '20px',
        sections: [
            {
                block: {
                    id: 'total-scores',
                },
            },
            {
                block: {
                    id: 'shuffles',
                },
            },
        ],
    },
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
        content: {
            type: 'button',
            textureId: 'pause-button',
        },
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
                    content: {
                        type: 'text',
                        text: '37',
                        anchor: { x: 0.5, y: 0.5 },
                        style: {
                            fill: 0xffffff,
                            fontWeight: 'bolder',
                            fontSize: 86,
                            align: 'center',
                        },
                    },
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
                    content: {
                        type: 'text',
                        text: 'ОЧКИ:\n0',
                        anchor: { x: 0.5, y: 0.5 },
                        style: {
                            fill: 0xffffff,
                            fontWeight: 'bolder',
                            fontSize: 40,
                            align: 'center',
                        },
                    },
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
    direction: 'vertical',
    block: {
        width: '1100px',
        direction: 'vertical',
        sections: [header, body],
    },
};
