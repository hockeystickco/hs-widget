import React from 'react';

export default class Logo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      src: props.src,
      error: false
    };
  }

  onError = () => {
    if (!this.state.error) {
      this.setState({
        src: 'https://i.imgur.com/h8P0NNv.png',
        //src: '../images/Placeholder_Logo.png',
        error: true
      });
    }
  }

  render() {
    const {src, ...props} = this.props;
    return (
      <img
        className='logo'
        src={this.state.src}
        onError={this.onError}
        {...props}
      />
    );
  }
}
