import type { CSSProperties, ImgHTMLAttributes } from 'react';

/**
 * Drop-in for next/image's <Image>: same props, rendered as a plain <img>.
 * `fill` reproduces Next's absolute full-size layout (the parent provides
 * `position: relative`), `priority` loads eagerly with high fetch priority,
 * everything else lazy-loads. Shared hosting has no image optimiser, so
 * `quality`/`placeholder` are accepted and ignored.
 */
type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> & {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    quality?: number;
    placeholder?: string;
    unoptimized?: boolean;
};

const FILL: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%' };

export default function Image({ fill, priority, quality, placeholder, unoptimized, style, ...props }: ImageProps) {
    void quality;
    void placeholder;
    void unoptimized;

    return (
        <img
            {...props}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            style={fill ? { ...FILL, ...style } : style}
        />
    );
}
