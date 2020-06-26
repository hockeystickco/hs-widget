import React from 'react';
import { Skeleton } from 'antd';

export default class SkeletonBox extends React.Component {
  render() {
    const {
      width, height, marginBottom, ...props
    } = this.props;

    return (
      <Skeleton.Avatar
        style={{width, height, margin: 0, marginBottom}}
        className="skeleton__box"
        shape="square"
        {...props}
        />
    );
  }
}
