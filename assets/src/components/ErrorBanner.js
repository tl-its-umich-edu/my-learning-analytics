import React from 'react';
import Banner from './Banner';

function ErrorBanner (props) {
    const { children } = props;
    const defaultMessage = "Something went wrong; please try again later.";

    return (
        <Banner backgroundColor="#CCE5FF" textColor="#004085">
            <>{(children === undefined ? defaultMessage : children)}</>
        </Banner>
    );
}

export default ErrorBanner;