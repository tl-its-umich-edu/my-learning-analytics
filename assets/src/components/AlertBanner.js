import React from 'react';
import Banner from './Banner';

function AlertBanner (props) {
    const { children } = props;

    return (
        <Banner backgroundColor="#CCE5FF" textColor="#004085">
            { children }
        </Banner>
    );
}

export default AlertBanner;