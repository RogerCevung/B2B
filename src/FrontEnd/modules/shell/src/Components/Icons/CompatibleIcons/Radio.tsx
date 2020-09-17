import * as React from "react";

const Radio: React.FC = () => {
    return (
        <svg focusable="false" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="a">
                    <stop stopColor="#4A4A4A" offset="0%" />
                    <stop stopColor="#424242" offset="100%" />
                </linearGradient>
            </defs>
            <g fill="none" fillRule="evenodd">
                <g transform="translate(1 8)" fillRule="nonzero">
                    <circle stroke="#4A4A4A" strokeWidth=".559" fill="#FFF" cx="3.976" cy="3.976" r="3.976" />
                    <circle fill="url(#a)" cx="3.976" cy="3.976" r="2.982" />
                </g>
                <path stroke="#4A4A4A" strokeWidth="2" strokeLinejoin="round" d="M13 12h11" />
            </g>
        </svg>
    );
};

export default React.memo(Radio);
