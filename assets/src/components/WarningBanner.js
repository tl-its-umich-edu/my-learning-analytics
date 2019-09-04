import React from 'react';
import Banner from './Banner';

function WarningBanner (props) {
    const { children } = props;
    const defaultMessage = "Something went wrong; please try again later.";

    const bannerSettings = {
        backgroundColor: "#fff3cd",
        borderColor: "#ffeeba",
        textColor: "#856404"
    };

    return (
        <Banner settings={bannerSettings}>
            <>{(children === undefined ? defaultMessage : children)}</>
        </Banner>
    );
}

export default WarningBanner;