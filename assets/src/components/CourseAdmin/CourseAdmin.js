import React from 'react';
import PropTypes from 'prop-types';
import './CourseAdmin.css';
import Checkbox from './Checkbox';


class CourseAdmin extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {value: ''};
    // this.state = { show_assignment_planning: false, show_grade_distribution: false}

    this.options = [  
                      { 'name':'Assignment Planning V1', 'enabled': false, 'options' : [] },
                      { 'name': 'Assignment Planning V2', 'enabled':true,'options' : [] },
                      { 'name' : 'Grade Distribution', 'enabled':true,   'options' : [ {'name':'Show Grade Counts', 'enabled':true, 'options':[ {'name':'Embellished Grade Counts', 'enabled':true} ]}]},
                      { 'name': 'Resources Accessed', 'enabled': true, 'options' : [] },
    ]

    this.booleans = [ 'show_assignment_planning', 'show_grade_distribution', 'show_resources_accessed', 'show_assignment_planning_v1' ]
    this.selectedCheckboxes = new Set();
  }

  // componentWillMount = () => {
  //   this.selectedCheckboxes = new Set();
  // }

  toggleCheckbox = label => {
    if (this.selectedCheckboxes.has(label)) {
      this.selectedCheckboxes.delete(label);
    } else {
      this.selectedCheckboxes.add(label);
    }
  }

  handleOption = (option) =>{
    var result = this.createCheckbox(option.name, option.enabled)
    
    if ( option.options && option.options.length>0) {
      return <li>{result}<ul>{option.options.map(this.handleOption)}</ul></li>
    } else {
      return <li key={option.name}>{result}</li>
    }
  }

  createCheckbox = (label,checked) => {
    return <Checkbox
            label={label}
            handleCheckboxChange={this.toggleCheckbox}
            isChecked={checked}
            key={label}
        />
  }

  createCheckboxes = (options) => {
    var result = options.map(this.handleOption)
    return <ul> {result} </ul>;
  }

  // handleChange(event) {
  //   this.setState({value: event.target.value});
  // }

  handleFormSubmit = formSubmitEvent => {
    formSubmitEvent.preventDefault();

    for (const checkbox of this.selectedCheckboxes) {
      console.log(checkbox, 'is selected.');
    }
  }

  render() {
    return (
      <form onSubmit={this.handleFormSubmit}>
        {this.createCheckboxes(this.options)}

        <button className="btn btn-default" type="submit">Save</button>
      </form>
    );
  }
}

export default CourseAdmin;
