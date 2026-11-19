import type { PointerEvent } from 'react';

export function movePattern(event: PointerEvent<HTMLElement>) {
    if (
        event.pointerType !== 'mouse' ||
        !window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    )
        return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--pattern-x', x * 16 + 'px');
    event.currentTarget.style.setProperty('--pattern-y', y * 16 + 'px');
}

export function resetPattern(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty('--pattern-x');
    event.currentTarget.style.removeProperty('--pattern-y');
}

export default function MotionPattern() {
    return (
        <div className="motion-pattern" aria-hidden="true">
            <span />
            <span />
            <span />
        </div>
    );
}
