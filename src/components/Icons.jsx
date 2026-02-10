// Shared SVG icons used across components

export function ArchiveIcon({ size = 14, strokeWidth = 2 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="5" rx="0" />
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
            <path d="M10 12h4" />
        </svg>
    );
}

export function TrashIcon({ size = 14, strokeWidth = 2 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    );
}

export function RestoreIcon({ size = 14, strokeWidth = 2 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
    );
}

export function SearchIcon({ size = 14, strokeWidth = 2 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

export function NackleLogo({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="80 68 360 368" fill="none" style={{ display: "block" }}>
            <defs>
                <filter id="nl-glow">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="nl-topLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="nl-sideLight" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="nl-faceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
                </linearGradient>
            </defs>
            {/* Back face */}
            <path
                d="M 128,392 L 128,96 L 204,96 L 204,256 L 340,96 L 416,96 L 416,392 L 340,392 L 340,232 L 204,392 Z"
                fill="currentColor"
                fillOpacity="0.04"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeLinejoin="miter"
                strokeOpacity="0.2"
            />
            {/* Extrusion top faces */}
            <polygon points="112,112 188,112 204,96 128,96" fill="url(#nl-topLight)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
            <polygon points="188,272 324,112 340,96 204,256" fill="url(#nl-topLight)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35" />
            <polygon points="324,112 400,112 416,96 340,96" fill="url(#nl-topLight)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
            {/* Extrusion side faces */}
            <polygon points="400,112 400,408 416,392 416,96" fill="url(#nl-sideLight)" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.25" />
            <polygon points="188,112 188,272 204,256 204,96" fill="url(#nl-sideLight)" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.15" />
            {/* Bottom + left edges */}
            <polygon
                points="112,408 188,408 204,392 128,392"
                fill="currentColor"
                fillOpacity="0.03"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeOpacity="0.1"
            />
            <polygon
                points="324,408 400,408 416,392 340,392"
                fill="currentColor"
                fillOpacity="0.03"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeOpacity="0.1"
            />
            <polygon
                points="112,112 112,408 128,392 128,96"
                fill="currentColor"
                fillOpacity="0.02"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeOpacity="0.08"
            />
            <polygon
                points="324,248 188,408 204,392 340,232"
                fill="currentColor"
                fillOpacity="0.02"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeOpacity="0.08"
            />
            {/* Front face */}
            <path
                d="M 112,408 L 112,112 L 188,112 L 188,272 L 324,112 L 400,112 L 400,408 L 324,408 L 324,248 L 188,408 Z"
                fill="url(#nl-faceGrad)"
            />
            {/* Diagonal slab highlight */}
            <polygon points="188,272 324,112 324,248 188,408" fill="currentColor" fillOpacity="0.1" />
            {/* Front wireframe — glowing */}
            <path
                d="M 112,408 L 112,112 L 188,112 L 188,272 L 324,112 L 400,112 L 400,408 L 324,408 L 324,248 L 188,408 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="miter"
                filter="url(#nl-glow)"
            />
            {/* Inner wireframe */}
            <path
                d="M 130,390 L 130,130 L 176,130 L 176,308 L 336,130 L 382,130 L 382,390 L 336,390 L 336,212 L 176,390 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeLinejoin="miter"
                opacity="0.25"
            />
            {/* Structure lines */}
            <line x1="188" y1="260" x2="324" y2="260" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
            <line x1="256" y1="112" x2="256" y2="408" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
            {/* Vertex anchors */}
            <g fill="currentColor">
                <rect x="106" y="106" width="12" height="12" opacity="0.9" />
                <rect x="106" y="402" width="12" height="12" opacity="0.7" />
                <rect x="394" y="106" width="12" height="12" opacity="0.9" />
                <rect x="394" y="402" width="12" height="12" opacity="0.7" />
                <rect x="182" y="106" width="12" height="12" opacity="0.9" />
                <rect x="182" y="266" width="12" height="12" opacity="0.8" />
                <rect x="318" y="106" width="12" height="12" opacity="0.9" />
                <rect x="318" y="242" width="12" height="12" opacity="0.8" />
            </g>
        </svg>
    );
}
