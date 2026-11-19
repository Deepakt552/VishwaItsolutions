import type { CSSProperties, HTMLAttributes } from 'react';

let observer: IntersectionObserver | undefined;

function observe(node: HTMLElement | null) {
    if (
        !node ||
        !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        if (node) {
            node.dataset.entered = 'true';
        }
        return;
    }

    observer ??= new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) {
                    continue;
                }
                (entry.target as HTMLElement).dataset.entered = 'true';
                observer?.unobserve(entry.target);
            }
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' },
    );
    const activeObserver = observer;
    activeObserver.observe(node);
    return () => activeObserver.unobserve(node);
}

export default function Reveal({
    as: Element = 'div',
    delay = 0,
    variant = 'up',
    ...props
}: HTMLAttributes<HTMLElement> & {
    as?: 'div' | 'article' | 'section';
    delay?: number;
    variant?: 'up' | 'left' | 'right' | 'scale';
}) {
    const style = {
        ...props.style,
        '--reveal-delay': delay + 'ms',
    } as CSSProperties;

    return (
        <Element
            {...props}
            ref={observe}
            data-reveal={variant}
            style={style}
        />
    );
}
