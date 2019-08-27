import React from 'react';
import Banner from './Banner';

function AlertBanner (props) {
    const { children } = props;

    const bannerSettings = {
        backgroundColor: "#CCE5FF",
        textColor: "#004085",
        maxWidth: undefined,
        width: "100%",
    }

    return (
        <Banner settings={bannerSettings}>
            { children }
        </Banner>
    );
}

export default AlertBanner;