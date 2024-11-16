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
  // Add detector state
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(
    null
  );

  const MIN_CONFIDENCE = 0.4;
  const RADIUS = 5;
  const WIDTH = 1000;
  const HEIGHT = 700;

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
    // console.log("poses", poses);
    if (!canvasRef || !videoRef) return;

    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    const scaleX = canvasRef.width / videoRef.videoWidth;
    const scaleY = canvasRef.height / videoRef.videoHeight;

    const nose = poses[0].keypoints.find((point) => point.name === "nose");
    // const leftEar = poses[0].keypoints.find(
    //   (point) => point.name === "left_ear"
    // );
    // const rightEar = poses[0].keypoints.find(
    //   (point) => point.name === "right_ear"
    // );

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

    // Draw ear-nose-ear lines
    if (nose && leftEye && rightEye) {
      ctx.beginPath();
      ctx.moveTo(leftEye.x * scaleX, leftEye.y * scaleY);
      ctx.lineTo(nose.x * scaleX, nose.y * scaleY);
      ctx.lineTo(rightEye.x * scaleX, rightEye.y * scaleY);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

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

    const leftElbow = poses[0].keypoints.find(
      (point) =>
        point.name === "left_elbow" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );
    const rightElbow = poses[0].keypoints.find(
      (point) =>
        point.name === "right_elbow" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );

    const leftHip = poses[0].keypoints.find(
      (point) =>
        point.name === "left_hip" && point.score && point.score > MIN_CONFIDENCE
    );
    const rightHip = poses[0].keypoints.find(
      (point) =>
        point.name === "right_hip" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );

    const leftKnee = poses[0].keypoints.find(
      (point) =>
        point.name === "left_knee" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );
    const rightKnee = poses[0].keypoints.find(
      (point) =>
        point.name === "right_knee" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );

    const leftAnkle = poses[0].keypoints.find(
      (point) =>
        point.name === "left_ankle" &&
        point.score &&
        point.score > MIN_CONFIDENCE
    );
    const rightAnkle = poses[0].keypoints.find(
      (point) =>
        point.name === "right_ankle" &&
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

    if (leftElbow) {
      ctx.beginPath();
      ctx.arc(
        leftElbow.x * scaleX,
        leftElbow.y * scaleY,
        RADIUS,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "white";
      ctx.fill();
    }
    if (rightElbow) {
      ctx.beginPath();
      ctx.arc(
        rightElbow.x * scaleX,
        rightElbow.y * scaleY,
        RADIUS,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "white";
      ctx.fill();
    }

    // Draw wrist-elbow-arm lines
    if (leftShoulder && leftElbow && leftWrist) {
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x * scaleX, leftShoulder.y * scaleY);
      ctx.lineTo(leftElbow.x * scaleX, leftElbow.y * scaleY);
      ctx.lineTo(leftWrist.x * scaleX, leftWrist.y * scaleY);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (rightShoulder && rightElbow && rightWrist) {
      ctx.beginPath();
      ctx.moveTo(rightShoulder.x * scaleX, rightShoulder.y * scaleY);
      ctx.lineTo(rightElbow.x * scaleX, rightElbow.y * scaleY);
      ctx.lineTo(rightWrist.x * scaleX, rightWrist.y * scaleY);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw hip-hip lines
    if (leftHip && rightHip) {
      ctx.beginPath();
      ctx.moveTo(leftHip.x * scaleX, leftHip.y * scaleY);
      ctx.lineTo(rightHip.x * scaleX, rightHip.y * scaleY);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw shoulder-shoulder lines
    if (leftShoulder && rightShoulder) {
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x * scaleX, leftShoulder.y * scaleY);
      ctx.lineTo(rightShoulder.x * scaleX, rightShoulder.y * scaleY);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw ankle-knee-hip lines
    if (leftHip && leftKnee && leftAnkle) {
      ctx.beginPath();
      ctx.moveTo(leftHip.x * scaleX, leftHip.y * scaleY);
      ctx.lineTo(leftKnee.x * scaleX, leftKnee.y * scaleY);
      ctx.lineTo(leftAnkle.x * scaleX, leftAnkle.y * scaleY);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (rightHip && rightKnee && rightAnkle) {
      ctx.beginPath();
      ctx.moveTo(rightHip.x * scaleX, rightHip.y * scaleY);
      ctx.lineTo(rightKnee.x * scaleX, rightKnee.y * scaleY);
      ctx.lineTo(rightAnkle.x * scaleX, rightAnkle.y * scaleY);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw mid-hips to mid-shoulders
    if (leftHip && rightHip && leftShoulder && rightShoulder) {
      // Calculate midpoints
      const midHipX = (leftHip.x + rightHip.x) / 2;
      const midHipY = (leftHip.y + rightHip.y) / 2;
      const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
      const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

      // Draw line between midpoints
      ctx.beginPath();
      ctx.moveTo(midHipX * scaleX, midHipY * scaleY);
      ctx.lineTo(midShoulderX * scaleX, midShoulderY * scaleY);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
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
        <video
          ref={setVideoRef}
          style={{ width: `${WIDTH}px`, height: `${HEIGHT}px` }}
        />
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
        {/* <button
          onClick={() => {
            setIsRunning(false);
          }}
          style={{ backgroundColor: "red", color: "white" }}
        >
          Stop
        </button> */}
      </div>
    </div>
  );
}

export default App;
