import React from 'react';
import logo from './logo.svg';
import './App.css';
import jsQR from 'jsqr';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.canvas = React.createRef();
	}

	componentDidMount() {
		const video = this.myRef.current;

		navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((stream) => {
			console.log(video);
			video.srcObject = stream;
			video.setAttribute('playsinline', true); 
			video.play();
			requestAnimationFrame(this.tick);
		});
  }
  
  tick = () => {
    const video = this.myRef.current;
		const canvasElement = this.canvas.current;
    const canvas = canvasElement.getContext('2d');
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {

      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });
      if (code) {
        console.log(code);
      } else {
        console.log('no data');
      }
    }
    requestAnimationFrame(this.tick);
  }

	render() {
		return (
			<div className="App">
				<div ref={this.myRef} />
				<canvas ref={this.canvas} />
				<video ref={this.myRef} />
			</div>
		);
	}
}

export default App;
