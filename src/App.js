import React from 'react';
import './App.css';
import jsQR from 'jsqr';
import { Dialog, Button } from '@blueprintjs/core';
import { isUrl } from './utils/regex';

class App extends React.Component {
	state = {
		isOpen: false,
		code: null,
		cams: 0,
		multipleCameras: false
	};
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.canvas = React.createRef();
	}

	componentDidMount() {
		const video = this.myRef.current;
		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				const cams = devices.filter(({ kind }) => kind === 'videoinput');
				this.setState({
					...this.state,
					multipleCameras: cams.length > 1,
					deviceId: cams[0].deviceId,
					cameras: cams
				});

				console.log(cams)

				if (cams.length > 1) {
					return navigator.mediaDevices.getUserMedia({
						video: {
							facingMode: {
								exact: 'environment'
							}
						}
					})
				}

				return navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: cams[0].deviceId } } });
			})
			.then((stream) => {
				console.log(stream);
				video.srcObject = stream;
				video.setAttribute('playsinline', true);
				video.play();
				requestAnimationFrame(this.tick);
			});
	}

	swapCam = () => {
		const { cameras, deviceId } = this.state;
		const video = this.myRef.current;

		const newCam = cameras.find((cam) => cam.deviceId !== deviceId);

		if (!newCam) {
			return
		}
		navigator.mediaDevices.getUserMedia({
			video: {
				facingMode: {
					exact: 'environment'
				}
			}
		}).then((stream) => {
			console.log(stream);
			this.setState({ ...this.state, deviceId: newCam.deviceId });

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
		const { isOpen, data, multipleCameras } = this.state;
		return (
			<div className="App">
				<div ref={this.myRef} />
				<canvas className="canvas-feed" ref={this.canvas} />
				<video className="video-feed" ref={this.myRef} />

				<div className="swap-cam-container">
					{/* {multipleCameras ? ( */}
					<Button onClick={this.swapCam} icon="swap-horizontal" className="switch-button" large />
					{/* ) : null} */}
				</div>

				<div>
					<Dialog isOpen={isOpen} onClose={this.toggleOverlay} title="Code">
						<div className="bp3-dialog-body">{isUrl ? <a href={data}> {data} </a> : data}</div>
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
