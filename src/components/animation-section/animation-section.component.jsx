"use client";

import { useRef, useEffect, useState } from "react";

const Animation = ({ children, type="fade-in" }) => {
    const domRef = useRef();
    const [isVisible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new window.IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setVisible(true);
            });
        });
        if (domRef.current) {
            observer.observe(domRef.current);
        }
        return () => observer.disconnect();
    }, []);

    return (
        <div className={`${type}-animation${isVisible ? " is-visible" : ""}`} ref={domRef}>
            <div className={`child-${type}-animation`}>
                {children}
            </div>
        </div>
    );
};

export default Animation;