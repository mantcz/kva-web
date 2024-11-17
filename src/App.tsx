import { useState, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
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
  const LINE_WIDTH = 8;
  const RADIUS = 12;
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;

  // Add state to track if detection is running
  const [isRunning, setIsRunning] = useState(false);

  // Create a detector and setup webcam
  useEffect(() => {
    const setupCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia || !videoRef || !canvasRef)
        return;

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
        }
      }
    };

    setupCamera();
  }, [videoRef, canvasRef]);

  // Create detector once on mount
  useEffect(() => {
    const initDetector = async () => {
      try {
        // Initialize TensorFlow.js backend
        await tf.setBackend("webgl");
        await tf.ready();

        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        const newDetector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        setDetector(newDetector);
      } catch (error) {
        console.error("Failed to initialize detector:", error);
      }
    };

    initDetector();
  }, []); // Empty dependency array means this runs once on mount

  // Add function to draw nose
  const draw = (poses: poseDetection.Pose[]) => {
    if (!canvasRef || !videoRef || !poses.length) return;

    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Calculate video scaling to maintain aspect ratio
    const videoAspect = videoRef.videoWidth / videoRef.videoHeight;
    const windowAspect = window.innerWidth / window.innerHeight;

    let scale;
    if (windowAspect > videoAspect) {
      scale = window.innerWidth / videoRef.videoWidth;
    } else {
      scale = window.innerHeight / videoRef.videoHeight;
    }

    // Calculate offsets to center the video
    const xOffset = (window.innerWidth - videoRef.videoWidth * scale) / 2;
    const yOffset = (window.innerHeight - videoRef.videoHeight * scale) / 2;

    // Find all keypoints
    const nose = poses[0].keypoints.find((point) => point.name === "nose");
    const leftEye = poses[0].keypoints.find(
      (point) => point.name === "left_eye"
    );
    const rightEye = poses[0].keypoints.find(
      (point) => point.name === "right_eye"
    );
    const leftEar = poses[0].keypoints.find(
      (point) => point.name === "left_ear"
    );
    const rightEar = poses[0].keypoints.find(
      (point) => point.name === "right_ear"
    );
    const leftShoulder = poses[0].keypoints.find(
      (point) => point.name === "left_shoulder"
    );
    const rightShoulder = poses[0].keypoints.find(
      (point) => point.name === "right_shoulder"
    );
    const leftElbow = poses[0].keypoints.find(
      (point) => point.name === "left_elbow"
    );
    const leftWrist = poses[0].keypoints.find(
      (point) => point.name === "left_wrist"
    );
    const rightElbow = poses[0].keypoints.find(
      (point) => point.name === "right_elbow"
    );
    const rightWrist = poses[0].keypoints.find(
      (point) => point.name === "right_wrist"
    );
    const leftHip = poses[0].keypoints.find(
      (point) => point.name === "left_hip"
    );
    const rightHip = poses[0].keypoints.find(
      (point) => point.name === "right_hip"
    );
    const leftKnee = poses[0].keypoints.find(
      (point) => point.name === "left_knee"
    );
    const leftAnkle = poses[0].keypoints.find(
      (point) => point.name === "left_ankle"
    );
    const rightKnee = poses[0].keypoints.find(
      (point) => point.name === "right_knee"
    );
    const rightAnkle = poses[0].keypoints.find(
      (point) => point.name === "right_ankle"
    );

    // Draw ear-nose-ear lines
    if (nose && leftEar && rightEar) {
      ctx.beginPath();
      ctx.moveTo(leftEar.x * scale + xOffset, leftEar.y * scale + yOffset);
      ctx.lineTo(nose.x * scale + xOffset, nose.y * scale + yOffset);
      ctx.lineTo(rightEar.x * scale + xOffset, rightEar.y * scale + yOffset);
      ctx.strokeStyle = "white";
      ctx.lineWidth = LINE_WIDTH / 2;
      ctx.stroke();
    }

    // Draw eye to eye
    if (leftEye && rightEye) {
      ctx.beginPath();
      ctx.moveTo(leftEye.x * scale + xOffset, leftEye.y * scale + yOffset);
      ctx.lineTo(rightEye.x * scale + xOffset, rightEye.y * scale + yOffset);
      ctx.strokeStyle = "white";
      ctx.lineWidth = LINE_WIDTH / 2;
      ctx.stroke();
    }

    // Draw mid-hips to mid-shoulders
    if (leftHip && rightHip && leftShoulder && rightShoulder) {
      const midHipX = (leftHip.x + rightHip.x) / 2;
      const midHipY = (leftHip.y + rightHip.y) / 2;
      const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
      const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

      ctx.beginPath();
      ctx.moveTo(midHipX * scale + xOffset, midHipY * scale + yOffset);
      ctx.lineTo(
        midShoulderX * scale + xOffset,
        midShoulderY * scale + yOffset
      );
      ctx.strokeStyle = "white";
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
    }

    // Draw shoulder to shoulder
    if (leftShoulder && rightShoulder) {
      ctx.beginPath();
      ctx.moveTo(
        leftShoulder.x * scale + xOffset,
        leftShoulder.y * scale + yOffset
      );
      ctx.lineTo(
        rightShoulder.x * scale + xOffset,
        rightShoulder.y * scale + yOffset
      );
      ctx.strokeStyle = "white";
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
    }

    // Draw hip to hip
    if (leftHip && rightHip) {
      ctx.beginPath();
      ctx.moveTo(leftHip.x * scale + xOffset, leftHip.y * scale + yOffset);
      ctx.lineTo(rightHip.x * scale + xOffset, rightHip.y * scale + yOffset);
      ctx.strokeStyle = "white";
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
    }

    // Draw leftWrist-leftElbow-leftShoulder
    if (leftWrist && leftElbow && leftShoulder) {
      ctx.beginPath();
      ctx.moveTo(leftWrist.x * scale + xOffset, leftWrist.y * scale + yOffset);
      ctx.lineTo(leftElbow.x * scale + xOffset, leftElbow.y * scale + yOffset);
      ctx.lineTo(
        leftShoulder.x * scale + xOffset,
        leftShoulder.y * scale + yOffset
      );
      ctx.strokeStyle = "white";
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
    }

    // Draw rightWrist-rightElbow-rightShoulder
    if (rightWrist && rightElbow && rightShoulder) {
      ctx.beginPath();
      ctx.moveTo(
        rightWrist.x * scale + xOffset,
        rightWrist.y * scale + yOffset
      );
      ctx.lineTo(
        rightElbow.x * scale + xOffset,
        rightElbow.y * scale + yOffset
      );
      ctx.lineTo(
        rightShoulder.x * scale + xOffset,
        rightShoulder.y * scale + yOffset
      );
      ctx.strokeStyle = "white";
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
    }

    // Draw leftHip-leftKnee-leftAnkle
    if (leftHip && leftKnee && leftAnkle) {
      ctx.beginPath();
      ctx.moveTo(leftHip.x * scale + xOffset, leftHip.y * scale + yOffset);
      ctx.lineTo(leftKnee.x * scale + xOffset, leftKnee.y * scale + yOffset);
      ctx.lineTo(leftAnkle.x * scale + xOffset, leftAnkle.y * scale + yOffset);
      ctx.strokeStyle = "white";
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
    }

    // Draw rightHip-rightKnee-rightAnkle
    if (rightHip && rightKnee && rightAnkle) {
      ctx.beginPath();
      ctx.moveTo(rightHip.x * scale + xOffset, rightHip.y * scale + yOffset);
      ctx.lineTo(rightKnee.x * scale + xOffset, rightKnee.y * scale + yOffset);
      ctx.lineTo(
        rightAnkle.x * scale + xOffset,
        rightAnkle.y * scale + yOffset
      );
      ctx.strokeStyle = "white";
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();
    }

    // Draw all points
    poses[0].keypoints.forEach((point) => {
      if (point.score && point.score > MIN_CONFIDENCE) {
        ctx.beginPath();
        ctx.arc(
          point.x * scale + xOffset,
          point.y * scale + yOffset,
          RADIUS,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
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
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <canvas
          ref={setCanvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        />
        <video
          ref={setVideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 2,
        }}
      >
        <button
          onClick={() => {
            setIsRunning(true);
            detect();
          }}
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default App;
