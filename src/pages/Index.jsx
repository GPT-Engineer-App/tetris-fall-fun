import React from "react";

class Index extends React.Component {
  handleMouseDown = (event) => {
    if (event.button === 2) {
      event.preventDefault();
      this.rotateShape(this.currentShape);
    }
  };

  render() {
    return <div onMouseDown={this.handleMouseDown}>{}</div>;
  }
}

export default Index;
