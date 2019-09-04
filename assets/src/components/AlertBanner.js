import React from 'react';
import Banner from './Banner';

function AlertBanner (props) {
    const { children } = props;

    const bannerSettings = {
        backgroundColor: "#CCE5FF",
        borderColor: "#b8daff",
        textColor: "#004085"
    };

    return (
        <Banner settings={bannerSettings}>
            { children }
        </Banner>
    );
}

export default AlertBanner;