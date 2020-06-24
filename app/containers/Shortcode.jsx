import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HockeystickWidget from '../components/HockeystickWidget';

export default class Shortcode extends Component {
  render() {
    console.log(this.props);
    return <HockeystickWidget domain={this.props.wpObject.atts.url} content={this.props.wpObject.content}/>;
  }
}

Shortcode.propTypes = {
  wpObject: PropTypes.object
};
