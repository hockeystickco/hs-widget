import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HockeystickWidget from '../components/HockeystickWidget';

export default class Shortcode extends Component {
  render() {
    return <HockeystickWidget {...this.props} />;
  }
}

Shortcode.propTypes = {
  wpObject: PropTypes.object,
};
