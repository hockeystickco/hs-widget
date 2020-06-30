import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export default class EntityInfo extends React.Component {
  render() {
    if (!this.props.content) {
      return null;
    }
    return <Text className={this.props.className}>{this.props.content}</Text>;
  }
}
