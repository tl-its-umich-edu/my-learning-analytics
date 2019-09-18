import React from 'react';
import Banner from './Banner';

function WarningBanner (props) {
    const { children } = props;
    const defaultMessage = "Something went wrong; please try again later.";

    const bannerSettings = {
        backgroundColor: "#FFF3CD",
        borderColor: "#FFEEBA",
        textColor: "#4C3319"
    };

    return (
        <Banner settings={bannerSettings}>
            <>{(children === undefined ? defaultMessage : children)}</>
        </Banner>
    );
}

export default WarningBanner;