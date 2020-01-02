import React from 'react';
import './App.css';
import jsQR from 'jsqr';
import { Dialog } from '@blueprintjs/core';
import { isUrl } from './utils/regex';

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

		navigator.mediaDevices
			.getUserMedia({ video: { facingMode: 'environment' } })
			.then((stream) => {
				video.srcObject = stream;
				video.setAttribute('playsinline', true);
				video.play();
				requestAnimationFrame(this.tick);
			})
			.catch((e) => {
				navigator.mediaDevices
					.enumerateDevices()
					.then((devices) => {
						const cams = devices.filter(({ kind }) => kind === 'videoinput');
						return navigator.mediaDevices.getUserMedia({
							video: { deviceId: { exact: cams[0].deviceId } }
						});
					})
					.then((stream) => {
						video.srcObject = stream;
						video.setAttribute('playsinline', true);
						video.play();
						requestAnimationFrame(this.tick);
					});
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
			const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
			const code = jsQR(imageData.data, imageData.width, imageData.height, {
				inversionAttempts: 'dontInvert'
			});
			if (code && code.data) {
				this.setState({ isOpen: true, data: code.data });
				return;
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
						<div className="bp3-dialog-body">
							<a href={data}> {data} </a>{' '}
						</div>
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
