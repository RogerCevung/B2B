import * as React from "react";

const DebugMenu: React.FC<{ size?: number; color1?: string; className?: string }> = ({
    size = 22,
    color1 = "#CCC",
    className,
}) => (
    <svg focusable="false" className={className} viewBox="0 0 22 22" width={size} height={size}>
        <path
            fill={color1}
            d="M21 12.7h-3c0-1.4-.3-2.6-.8-3.8.8-.8 1.6-1.7 2-2.8.2-.5 0-1.1-.5-1.3s-1.1 0-1.3.5c-.3.7-.7 1.3-1.2 1.8-.5-.8-1.2-1.4-1.9-2l2.2-3.6c.3-.5.1-1.1-.3-1.4-.5-.3-1.1-.1-1.4.3l-2.3 3.8c-.4-.1-1-.2-1.5-.2s-1 .1-1.5.2L7.2.6C6.9.1 6.3 0 5.8.2c-.5.3-.6.9-.3 1.4l2.2 3.6c-.7.4-1.4 1.1-1.9 1.9-.5-.6-.9-1.2-1.2-1.8-.2-.5-.8-.8-1.3-.6-.5.3-.8.8-.6 1.4.5 1.1 1.2 2.1 2 2.9-.4 1-.7 2.3-.7 3.7H1c-.6 0-1 .4-1 1s.4 1 1 1h3.1c.2 1.1.5 2.1.9 3-1.5 1-2.2 2.9-2.3 3-.2.5.1 1.1.6 1.3h.4c.4 0 .8-.3.9-.7.2-.5.7-1.5 1.4-2C7.3 21 9.1 22 11 22s3.7-1 4.9-2.6c.7.5 1.3 1.5 1.4 2 .1.4.5.7.9.7.1 0 .2 0 .3-.1.5-.2.8-.8.6-1.3 0-.1-.7-2-2.3-3 .4-.9.7-1.9.9-3H21c.6 0 1-.4 1-1s-.4-1-1-1zM11 6c1.5 0 2.8.9 3.7 2.3-1.1.6-2.4 1-3.7 1-1.4 0-2.6-.4-3.7-1C8.2 6.9 9.5 6 11 6zM7.2 17.5C6.4 16.3 6 14.7 6 13c0-1 .2-2 .4-2.9 1.1.6 2.3 1 3.6 1.1v8.5c-1.1-.3-2.1-1.1-2.8-2.2zm4.8 2.3v-8.5c1.3-.1 2.5-.5 3.5-1.1.3.8.5 1.8.5 2.8 0 3.4-1.7 6.1-4 6.8z"
        />
    </svg>
);

export default React.memo(DebugMenu);
