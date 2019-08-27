import React from 'react';
import Banner from './Banner';

function ErrorBanner (props) {
    const { children } = props;
    const defaultMessage = "Something went wrong; please try again later.";

    const bannerSettings = {
        backgroundColor: "#F08080",
        textColor: "#8B0000",
        maxWidth: undefined,
        width: "100%",
    }

    return (
        <Banner settings={bannerSettings}>
            <>{(children === undefined ? defaultMessage : children)}</>
        </Banner>
    );
}

export default ErrorBanner;