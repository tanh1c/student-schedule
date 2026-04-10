import React from 'react';

const AppLogo = ({ className, size }) => {
    // Use passed className or default to rounded-xl.
    // We add overflow-hidden to ensure the image respects the container's border radius (full bleed).
    // If className contains a rounded class, it will apply to the div.
    // We check if className exists to avoid appending 'rounded-xl' if user wants square. 
    // But usually safer to Apply default if not specified.
    // Simpler: Just append common classes.

    return (
        <div
            className={`relative flex items-center justify-center shrink-0 overflow-hidden ${className || 'rounded-xl'}`}
            style={size ? { width: size, height: size } : undefined}
        >
            <img
                src="/logo.png"
                alt="TKB Smart Logo"
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default AppLogo;
