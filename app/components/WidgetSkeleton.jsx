import React from 'react';
import { Skeleton, Space } from 'antd';
import './styles/widgetskeleton.less';
import SkeletonBox from './SkeletonBox.jsx'

export default class WidgetSkeleton extends React.Component {
  render() {
    return this.props.loading && (
      <Space direction="vertical" align="center" size={0}>
        <SkeletonBox width="106px" height="106px" marginBottom="10px" active={true}/>
        <SkeletonBox width="150px" height="21px" marginBottom="40px" active={true}/>

        <SkeletonBox width="192px" height="51px" marginBottom="30px" active={true}/>

        <SkeletonBox width="240px" height="22px" marginBottom="5px" active={true}/>
        <SkeletonBox width="240px" height="22px" marginBottom="5px" active={true}/>
        <SkeletonBox width="240px" height="22px" marginBottom="30px" active={true}/>

        <SkeletonBox width="240px" height="40px" marginBottom="21px" active={true}/>
      </Space>
    );
  }
}
