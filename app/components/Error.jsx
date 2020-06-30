import React from 'react';
import { Space, Typography } from 'antd';

const { Text } = Typography;

export default class Error extends React.Component {
  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <Space direction='vertical' align='center' style={{'margin': 'auto', 'marginTop': '150px', 'marginBottom': '150px'}}>
        <img
          className='error'
          src={this.props.imageSrc}/>
        <Text className='entityDesc' style={{'margin': '0'}}>{'Whoops. Something went wrong'}</Text>
        <Text className='entityLocation'>{'Please try again later'}</Text>
      </Space>
    );
  }
}
