import { useState, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs"; // Add this line
import "@tensorflow/tfjs-backend-webgl";

import "./App.css";

function App() {
  // Add state for video ref
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [poses, setPoses] = useState<poseDetection.Pose[]>([]);
  // Add canvas ref
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [intervalId, setIntervalId] = useState<any | null>(null);
  // Add detector state
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(
    null
  );

  const MIN_CONFIDENCE = 0.5;
  const RADIUS = 5;
  const WIDTH = 500;
  const HEIGHT = 300;

  // Add this state for animation frame tracking
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  // Add state to track if detection is running
  const [isRunning, setIsRunning] = useState(false);

  // Create a detector and setup webcam
  useEffect(() => {
    const fn = async () => {
      // Setup webcam
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef) {
          videoRef.srcObject = stream;
          videoRef.play();

          // Set canvas size to match video
          if (canvasRef) {
            canvasRef.width = WIDTH;
            canvasRef.height = HEIGHT;
            // canvasRef.width = videoRef.videoWidth || 500;
            // canvasRef.height = videoRef.videoHeight || 300;
          }
        }
      }
      await tf.ready();
    };
    fn();
  }, [videoRef, canvasRef]); // Add canvasRef to dependencies

  // Create detector once on mount
  useEffect(() => {
    const initDetector = async () => {
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      setDetector(detector);
    };

    initDetector();
  }, []); // Empty dependency array means this runs once on mount

  // Add function to draw nose
  const draw = (poses: poseDetection.Pose[]) => {
    if (!canvasRef || !videoRef) return;

    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Calculate scale factors
    const scaleX = canvasRef.width / videoRef.videoWidth;
    const scaleY = canvasRef.height / videoRef.videoHeight;

    const nose = poses[0].keypoints.find(
      (point) =>
        point.name === "nose" && point.score && point.score > MIN_CONFIDENCE
    );
    const leftEye = poses[0].keypoints.find(
      (point) =>
        point.name === "left_eye" && point.score && point.score > MIN_CONFIDENCE
    );
    const rightEye = poses[0].keypoints.find(
      (point) => point.name === "right_eye"
    );

    // const leftEar = poses[0].keypoints.find(
    //   (point) => point.name === "left_ear"
    // );
    // const rightEar = poses[0].keypoints.find(
    //   (point) => point.name === "right_ear"
    // );

    const leftShoulder = poses[0].keypoints.find(
      (point) =>
        point.name === "left_shoulder" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );
    const rightShoulder = poses[0].keypoints.find(
      (point) =>
        point.name === "right_shoulder" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );

    // Add hands
    const leftWrist = poses[0].keypoints.find(
      (point) =>
        point.name === "left_wrist" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );
    const rightWrist = poses[0].keypoints.find(
      (point) =>
        point.name === "right_wrist" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );

    if (nose) {
      ctx.beginPath();
      ctx.arc(nose.x * scaleX, nose.y * scaleY, RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = "pink";
      ctx.fill();
    }
    if (rightEye) {
      ctx.beginPath();
      ctx.arc(rightEye.x * scaleX, rightEye.y * scaleY, RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = "blue";
      ctx.fill();
    }
    if (leftEye) {
      ctx.beginPath();
      ctx.arc(leftEye.x * scaleX, leftEye.y * scaleY, RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = "blue";
      ctx.fill();
    }
    // if (leftEar) {
    //   ctx.beginPath();
    //   ctx.arc(leftEar.x * scaleX, leftEar.y * scaleY, RADIUS, 0, 2 * Math.PI);
    //   ctx.fillStyle = "brown";
    //   ctx.fill();
    // }
    // if (rightEar) {
    //   ctx.beginPath();
    //   ctx.arc(rightEar.x * scaleX, rightEar.y * scaleY, RADIUS, 0, 2 * Math.PI);
    //   ctx.fillStyle = "brown";
    //   ctx.fill();
    // }

    if (leftShoulder) {
      ctx.beginPath();
      ctx.arc(
        leftShoulder.x * scaleX,
        leftShoulder.y * scaleY,
        RADIUS,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "yellow";
      ctx.fill();
    }
    if (rightShoulder) {
      ctx.beginPath();
      ctx.arc(
        rightShoulder.x * scaleX,
        rightShoulder.y * scaleY,
        RADIUS,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "yellow";
      ctx.fill();
    }

    // Draw hands
    if (leftWrist) {
      ctx.beginPath();
      ctx.arc(
        leftWrist.x * scaleX,
        leftWrist.y * scaleY,
        RADIUS,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "green";
      ctx.fill();
    }
    if (rightWrist) {
      ctx.beginPath();
      ctx.arc(
        rightWrist.x * scaleX,
        rightWrist.y * scaleY,
        RADIUS,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "green";
      ctx.fill();
    }
  };

  // Modify detect function
  const detect = async () => {
    if (!videoRef || !detector || !isRunning) return;

    const poses = await detector.estimatePoses(videoRef);
    setPoses(poses);
    draw(poses);

    // Only request next frame if still running
    if (isRunning) {
      requestAnimationFrame(detect);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <div
        id="stats"
        style={{ position: "absolute", top: "10px", left: "10px" }}
      ></div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <canvas
          ref={setCanvasRef}
          id="output"
          style={{
            zIndex: 100,
            position: "absolute",
            width: `${WIDTH}px`,
            height: `${HEIGHT}px`,
            // border: "3px solid red",
          }}
        ></canvas>
        <video ref={setVideoRef} style={{ width: "500px", height: "300px" }} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: 30,
          gap: 10,
        }}
      >
        <button
          onClick={() => {
            setIsRunning(true);
            requestAnimationFrame(detect);
          }}
          style={{ backgroundColor: "green", color: "white" }}
        >
          Start
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
          }}
          style={{ backgroundColor: "red", color: "white" }}
        >
          Stop
        </button>
      </div>
    </div>
  );
}

export default App;
