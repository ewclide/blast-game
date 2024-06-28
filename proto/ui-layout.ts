import { LayoutSection } from './layout';

const progressSection: LayoutSection = {
    block: {
        key: 'progress-back',
        width: '500px',
        height: '130px',
        alignY: 'start',
        alighX: 'start',
        direction: 'vertical',
        sections: [
            {
                height: '50px',
                block: {
                    key: 'progress-text',
                    width: '0px',
                    height: '0px',
                    alignY: 'end',
                },
            },
            {
                block: {
                    key: 'progress-bar',
                    width: '430px',
                    height: '35px',
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
                    key: 'total-scores',
                },
            },
            {
                block: {
                    key: 'shuffles',
                },
            },
        ],
    },
};

const pauseSection: LayoutSection = {
    width: '25%',
    block: {
        alighX: 'end',
        alignY: 'start',
        offsetY: '20px',
        key: 'pause',
        width: '70px',
        height: '70px',
    },
};

const header: LayoutSection = {
    key: 'header',
    height: '250px',
    sections: [progressSection, infoSection, pauseSection],
};

const scoresSection: LayoutSection = {
    height: '400px',
    block: {
        key: 'scores-back',
        direction: 'vertical',
        sections: [
            {
                height: '60%',
                block: {
                    key: 'steps',
                    width: '0px',
                    height: '0px',
                },
            },
            {
                height: '40%',
                block: {
                    key: 'scores',
                    width: '0px',
                    height: '0px',
                    alignY: 'start',
                    offsetY: '50px',
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
                key: 'booster-0',
                height: '140px',
            },
        },
        {
            block: {
                key: 'booster-1',
                height: '140px',
            },
        },
        {
            block: {
                key: 'booster-2',
                height: '140px',
            },
        },
    ],
};

const bodyLeftSection: LayoutSection = {
    block: {
        key: 'grid-back',
        width: '600px',
        height: '600px',
        alignY: 'start',
        alighX: 'start',
        block: {
            key: 'grid',
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
    key: 'body',
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
