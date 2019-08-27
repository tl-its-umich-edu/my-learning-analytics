import React from 'react';
import Banner from './Banner';

function TipBanner (props) {
    const { children } = props;

    const bannerSettings = {
       backgroundColor: "#FFF",
       textColor: undefined,
       maxWidth: "300px",
       width: undefined,
    }

    return (
        <Banner settings={bannerSettings}>
            { children }
        </Banner>
    );
}

export default TipBanner;