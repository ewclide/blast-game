export type LayoutAlign = 'start' | 'center' | 'end';

export type LayoutDirection = 'vertical' | 'horizontal';

export type LayoutContentData = Record<string, unknown>;

export interface LayoutContent extends LayoutContentData {
    type: string;
}

export interface LayoutSection {
    id?: string;
    width?: string;
    height?: string;
    direction?: LayoutDirection;
    sections?: LayoutSection[];
    block?: LayoutBlock;
    content?: LayoutContent;
}

export interface LayoutBlock extends LayoutSection {
    alighX?: LayoutAlign;
    alignY?: LayoutAlign;
    offsetX?: string;
    offsetY?: string;
}
