import React, { useState, useEffect } from 'react';
import './AuthLayout.css';
import bgImage from '../sl_0210121_40570_43.jpg';

const CAROUSEL_TEXTS = [
    "Explore Academic Excellence",
    "Discover Your Perfect Program",
    "Connect With Future Leaders"
];

const AuthLayout = ({ children }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const lastRun = React.useRef(Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            if (!document.hidden && now - lastRun.current >= 3800) {
                setCurrentSlide((prev) => (prev + 1) % CAROUSEL_TEXTS.length);
                lastRun.current = now;
            }
        }, 4000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="auth-container">
            {/* Left Panel - Image/Brand/Carousel */}
            <div className="auth-left-panel">
                <div className="auth-bg-image" style={{ backgroundImage: `url(${bgImage})` }}></div>
                <div className="auth-overlay"></div>

                <div className="auth-brand">
                    Unixora
                </div>

                <div className="auth-left-content">
                    <h1 key={currentSlide}>{CAROUSEL_TEXTS[currentSlide]}</h1>

                    <div className="carousel-indicators">
                        {CAROUSEL_TEXTS.map((_, index) => (
                            <div
                                key={index}
                                className={`indicator-bar ${index === currentSlide ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form (Children) */}
            <div className="auth-right-panel">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
