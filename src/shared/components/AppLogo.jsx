import React from 'react';

const AppLogo = ({ className, size }) => {
    const gradientId = React.useId();
    const glowId = React.useId();
    const strokeId = React.useId();

    return (
        <div
            aria-label="StuSpace"
            className={`relative flex shrink-0 items-center justify-center overflow-hidden ${className || 'rounded-xl'}`}
            role="img"
            style={size ? { width: size, height: size } : undefined}
        >
            <svg
                aria-hidden="true"
                className="h-full w-full"
                viewBox="0 0 64 64"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id={gradientId} x1="10" y1="6" x2="54" y2="60" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#0F172A" />
                        <stop offset="0.52" stopColor="#1D4ED8" />
                        <stop offset="1" stopColor="#38BDF8" />
                    </linearGradient>
                    <radialGradient id={glowId} cx="0" cy="0" r="1" gradientTransform="translate(16 14) rotate(46.8) scale(31.241 27.9894)" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" stopOpacity="0.34" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id={strokeId} x1="19" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="#DBEAFE" />
                    </linearGradient>
                </defs>

                <rect width="64" height="64" rx="18" fill={`url(#${gradientId})`} />
                <rect width="64" height="64" rx="18" fill={`url(#${glowId})`} />

                <g opacity="0.24">
                    <circle cx="49" cy="16" r="10" fill="white" />
                    <circle cx="17" cy="50" r="12" fill="#0F172A" />
                </g>

                <g transform="translate(12 12)">
                    <rect
                        x="7"
                        y="6"
                        width="24"
                        height="24"
                        rx="8"
                        fill="white"
                        fillOpacity="0.08"
                        stroke="white"
                        strokeOpacity="0.42"
                        strokeWidth="1.8"
                        transform="rotate(-8 19 18)"
                    />
                    <rect
                        x="10"
                        y="10"
                        width="28"
                        height="26"
                        rx="9"
                        fill="white"
                        fillOpacity="0.1"
                        stroke={`url(#${strokeId})`}
                        strokeWidth="2.2"
                    />
                    <path
                        d="M17 18H31"
                        stroke="white"
                        strokeLinecap="round"
                        strokeOpacity="0.96"
                        strokeWidth="2.4"
                    />
                    <path
                        d="M17 23H29"
                        stroke="white"
                        strokeLinecap="round"
                        strokeOpacity="0.76"
                        strokeWidth="2.4"
                    />
                    <path
                        d="M17 28H25"
                        stroke="white"
                        strokeLinecap="round"
                        strokeOpacity="0.58"
                        strokeWidth="2.4"
                    />

                    <g transform="translate(27 25)">
                        <circle cx="6.5" cy="6.5" r="7.5" fill="#0F172A" fillOpacity="0.2" />
                        <circle cx="6.5" cy="6.5" r="6.5" fill="#0F172A" fillOpacity="0.24" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" />
                        <path
                            d="M9.6 6.4A3.1 3.1 0 1 1 8.4 4"
                            stroke="white"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                        />
                        <path
                            d="M9.2 2.8L9.2 4.7L7.3 4.7"
                            stroke="white"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                        />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default AppLogo;
