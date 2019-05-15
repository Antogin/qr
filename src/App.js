import React from 'react';
import './App.css';
import jsQR from 'jsqr';
import { Spinner, Overlay, Dialog } from '@blueprintjs/core';

class App extends React.Component {
	state = {
		isOpen: false,
		code: null
	};
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.canvas = React.createRef();
	}

	componentDidMount() {
		const video = this.myRef.current;

		navigator.mediaDevices.getUserMedia({ video: { } }).then((stream) => {
			console.log(stream);
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
				this.setState({ isOpen: true, data: code.data });
				return;
			} else {
				console.log('no data');
			}
		}
		requestAnimationFrame(this.tick);
	};

	toggleOverlay = () => {
		const { isOpen } = this.state;
		this.setState({ isOpen: !isOpen, data: null });
		requestAnimationFrame(this.tick);
	};

	render() {
		const { isOpen, data } = this.state;
		return (
			<div className="App">
				<div ref={this.myRef} />
				<canvas className="canvas-feed" ref={this.canvas} />
				<video className="video-feed" ref={this.myRef} />
				<div>
					<Dialog isOpen={isOpen} onClose={this.toggleOverlay} title="Code">
						<div className="bp3-dialog-body">{data}</div>
						<div className="bp3-dialog-footer">
							<div className="bp3-dialog-footer-actions">
								<button className="bp3-button" onClick={this.toggleOverlay}>
									Close
								</button>
							</div>
						</div>
					</Dialog>
				</div>
			</div>
		);
	}
}

export default App;
