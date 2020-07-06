import React from 'react';
import { Space, Tag } from 'antd';

export default class VerticalList extends React.Component {
  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <Space size={0} direction="vertical">
        <Space className="verticalList" size={3}>
          {this.props.verticals.slice(0, 3).map((vertical) => (
            <Tag key={vertical} className="vertical">
              {vertical}
            </Tag>
          ))}
        </Space>
        <Space className="verticalList" size={3}>
          {this.props.verticals.slice(3, 6).map((vertical) => (
            <Tag key={vertical} className="vertical">
              {vertical}
            </Tag>
          ))}
        </Space>
      </Space>
    );
  }
}
