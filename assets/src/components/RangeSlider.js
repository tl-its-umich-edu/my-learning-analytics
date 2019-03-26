import React from 'react'
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import {Range} from 'rc-slider';

const rangeSlider = props => {
    const wrapperStyle = { width: "100%" };
    const marks = {};
    
    for (let week = props.min; week <= props.max; week++) {
        marks[week] = `${week}`
    }
    
    return (
        <div style={wrapperStyle}>
            <p>Select a start and end week</p>
            <Range 
            allowCross={false} 
            min={props.min} 
            max={props.max} 
            onChange={props.onWeekChange}
            defaultValue={[props.curWeek - 2, props.curWeek]} 
            marks = {marks} />
        </div>)
}

export default rangeSlider;