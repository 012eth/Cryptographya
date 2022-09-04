export function EdgeId(source: string, target: string) {
    return Math.max(+source, +target) + '-' + Math.min(+source, +target);
}
