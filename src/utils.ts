export function randi(min: number, max: number) {
    return Math.floor(min + Math.random() * (max + 1 - min));
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
