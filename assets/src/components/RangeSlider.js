import React from 'react'
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import {Range} from 'rc-slider';

const rangeSlider = props => {
    const wrapperStyle = { width: "70%", margin: "0 auto" }
    const marks = {}
    
    for (let week = props.min; week <= props.max; week++) {
        if (week === props.curWeek) {
            marks[week] = `${week} (now)`
        } else {
            marks[week] = `${week}`
        }
    }
    
    return (
        <div style={wrapperStyle}>
            <p style={{textAlign: "center"}}>Select a start and end week</p>
            <Range 
            allowCross={false} 
            min={props.min} 
            max={props.max}
            onChange={props.onWeekChange}
            defaultValue={[props.startWeek, props.endWeek]}
            marks = {marks} />
        </div>)
}

export default rangeSlider;