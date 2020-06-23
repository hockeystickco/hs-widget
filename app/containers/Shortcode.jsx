import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HockeystickWidget from '../components/HockeystickWidget';

export default class Shortcode extends Component {
  render() {
    return <span><HockeystickWidget/></span>;
  }
}

Shortcode.propTypes = {
  wpObject: PropTypes.object
};
