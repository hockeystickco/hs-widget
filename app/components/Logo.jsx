import React from 'react';

export default class Logo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      src: props.src,
      error: false,
    };
  }

  onError = () => {
    if (!this.state.error) {
      this.setState({
        src: this.props.placeholder,
        error: true,
      });
    }
  };

  render() {
    const { src, ...props } = this.props;

    if (!this.props.visible) {
      return null;
    }

    return <img className="logo" src={this.state.src} onError={this.onError} {...props} />;
  }
}
