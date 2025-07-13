import jsQR from "jsqr";
import React, { useEffect, useRef, useState } from "react";

const Scanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [lastScannedCode, setLastScannedCode] = useState(null);

  const log = (message, type = "info") => {
    const timestamp = new Date().toISOString();
    console[type](`[QRScanner ${timestamp}] ${message}`);
  };

  const startCamera = async () => {
    try {
      log("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setError(null);
        log("Camera started successfully");
      }
    } catch (err) {
      const errorMsg = `Failed to start camera: ${err.message}`;
      log(errorMsg, "error");
      setError(errorMsg);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
      log("Camera stopped");
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data !== lastScannedCode) {
        log(`QR Code detected: ${code.data}`);
        setLastScannedCode(code.data);
        
        // Call the onScan callback if provided
        if (onScan) {
          onScan(code.data);
        } else {
          alert(`QR Code Scanned!\n\nContent: ${code.data}`);
        }

        // Stop scanning after successful read
        stopCamera();
      }
    }
  };

  useEffect(() => {
    let animationId;

    if (isScanning) {
      const scan = () => {
        scanQRCode();
        animationId = requestAnimationFrame(scan);
      };
      scan();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isScanning, lastScannedCode]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="relative mb-4">
        <video
          ref={videoRef}
          className="w-80 h-60 bg-black rounded-lg border-2 border-gray-300"
          playsInline
          muted
        />
        {!isScanning && (
          <div className="bg-white h-full w-full absolute top-0 flex justify-center items-center rounded-lg border-2 border-gray-300">
            <img className="h-40" src="qr_code.png" alt="QR Code Placeholder" />
          </div>
        )}
        {isScanning && (
          <div className="w-full bg-red-700 h-0.5 absolute top-4 animate-scan-line"></div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {isScanning && (
          <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none">
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-green-500"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-green-500"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-green-500"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-green-500"></div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={startCamera}
          disabled={isScanning}
          className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-green-600 transition-colors"
        >
          {isScanning ? "Scanning..." : "Start Scanner"}
        </button>

        <button
          onClick={stopCamera}
          disabled={!isScanning}
          className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-red-600 transition-colors"
        >
          Stop Scanner
        </button>
      </div>

      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {lastScannedCode && (
        <div className="w-full p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="text-sm font-semibold">Last Scanned:</p>
          <p className="text-sm break-all">{lastScannedCode}</p>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Point your camera at a QR code to scan it
        </p>
      </div>
    </div>
  );
};

export default Scanner;