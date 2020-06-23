import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HockeystickWidget from '../components/HockeystickWidget';

export default class Widget extends Component {
  render() {
    return (
      <div>
        <h1>Hockeystick Widget</h1>
        <p>Title: {this.props.wpObject.title}</p>
        <HockeystickWidget></HockeystickWidget>
      </div>
    );
  }
}

Widget.propTypes = {
  wpObject: PropTypes.object
};
