import { LayoutSection } from './layout-description';

export interface LayoutRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ILayoutParser {
    calc(
        canvas: HTMLCanvasElement,
        root: LayoutSection,
        rects: Map<string, LayoutRect>
    ): void;
}
