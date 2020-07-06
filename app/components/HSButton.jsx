import React from 'react';
import { Button } from 'antd';

export default class HSButton extends React.Component {
  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <Button type="primary" size="large" target="_blank" {...this.props}>
        View Hockeystick Profile
      </Button>
    );
  }
}
