import { useEffect, useRef } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import "./App.css";
import background from "./4c8lox39nnh21.png";

function App() {
  const inputVideoRef = useRef();
  const canvasRef = useRef();
  const contextRef = useRef();
  const imageRef = useRef();
  let p = false;
  useEffect(() => {
    contextRef.current = canvasRef.current.getContext("2d");

    const sendToMediaPipe = async () => {
      if (!inputVideoRef.current.videoWidth) {
        console.log(inputVideoRef.current.videoWidth);
        requestAnimationFrame(sendToMediaPipe);
      } else {
        await selfieSegmentation.send({ image: inputVideoRef.current });
        requestAnimationFrame(sendToMediaPipe);
      }
    };

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });
    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: true,
    });
    selfieSegmentation.initialize();

    const constraints = {
      video: { width: { min: 1280 }, height: { min: 720 } },
    };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      inputVideoRef.current.srcObject = stream;
      sendToMediaPipe();
    });

    selfieSegmentation.onResults(onResults);
  }, []);

  const onResults = (results) => {
    // console.log(background);
    // if (!p) imageRef.current.src = results.image;
    // p=true
    contextRef.current.save();
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    contextRef.current.drawImage(
      results.segmentationMask,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    // Only overwrite existing pixels.

    contextRef.current.globalCompositeOperation = "source-out";

    // contextRef.current.fillStyle = "rgba(0,0,0,0)";
    contextRef.current.filter = "blur(10px)";

    const image = new Image();
    image.src = background;
    contextRef.current.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    // contextRef.current.fillRect( 0, 0, canvasRef.current.width, canvasRef.current.height);

    // // Only overwrite missing pixels.
    contextRef.current.globalCompositeOperation = "destination-atop";

    contextRef.current.filter = "none";
    // contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // contextRef.current.filter = "none";
    contextRef.current.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    contextRef.current.restore();
  };

  return (
    <div className="App">
      <video autoPlay ref={inputVideoRef} />
      <canvas ref={canvasRef} width={1280} height={720} />
      {/* <img ref={imageRef} alt="no frame" src={background}/> */}
    </div>
  );
}

export default App;
