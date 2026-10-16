import React, { useRef, useState, useEffect } from "react";
import { Camera, X, RefreshCw, Sparkles, Check, AlertCircle } from "lucide-react";
import { scanMeterImage, initMeterOcrModel, type MeterOcrResult } from "../lib/meterOcr";

interface MeterCameraScannerProps {
  onScanComplete: (detectedNumber: number, photoDataUrl: string) => void;
  onClose: () => void;
}

export const MeterCameraScanner: React.FC<MeterCameraScannerProps> = ({
  onScanComplete,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [lastResult, setLastResult] = useState<MeterOcrResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    // Warm up model
    initMeterOcrModel().then((ok) => setModelReady(ok));

    let activeStream: MediaStream | null = null;

    // Start back camera
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((s) => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.");
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCaptureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    setLastResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsScanning(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.75);
    setCapturedImage(photoDataUrl);

    // Calculate viewfinder crop box (central 60% width, 25% height)
    const cropW = Math.round(canvas.width * 0.6);
    const cropH = Math.round(canvas.height * 0.22);
    const cropX = Math.round((canvas.width - cropW) / 2);
    const cropY = Math.round((canvas.height - cropH) / 2);

    try {
      const result = await scanMeterImage(canvas, { x: cropX, y: cropY, w: cropW, h: cropH });
      setLastResult(result);
    } catch (err) {
      console.error("Scanning error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyResult = () => {
    if (lastResult && capturedImage) {
      onScanComplete(lastResult.detectedNumber, capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setLastResult(null);
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-between p-4 sm:p-6 text-white">
      {/* Header bar */}
      <div className="w-full max-w-lg flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">AI Smart Meter Scanner</h2>
            <p className="text-[10px] text-sky-300">Edge AI Computer Vision (100% Offline)</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Viewport & Viewfinder */}
      <div className="w-full max-w-lg flex-1 my-3 flex flex-col items-center justify-center relative overflow-hidden rounded-2xl bg-black border border-slate-800">
        {cameraError ? (
          <div className="p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-xs text-slate-300">{cameraError}</p>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured Meter" className="w-full h-full object-contain" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Viewfinder Bounding Box Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[75%] h-[28%] border-2 border-sky-400 rounded-xl relative shadow-[0_0_20px_rgba(56,189,248,0.3)] bg-sky-500/10 backdrop-contrast-125">
                {/* 4 Corner Markers */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />

                <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-wider text-sky-200">
                  Pas-kan Deretan Angka Meteran di Kotak Ini
                </div>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Result Card or Instructions */}
      <div className="w-full max-w-lg space-y-3">
        {lastResult ? (
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Hasil Deteksi AI ({lastResult.engine})
              </span>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                {lastResult.detectedNumber} <span className="text-xs text-slate-400 font-sans font-normal">m³</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Tingkat Akurasi: {Math.round(lastResult.confidence * 100)}% (Bisa diedit manual)
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRetake}
                className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
              >
                Ulangi
              </button>
              <button
                onClick={handleApplyResult}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center space-x-1.5 transition-colors shadow"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Angka</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {modelReady ? "Model AI Siap (ONNX Web)" : "Memuat Engine AI..."}
            </span>
            <button
              onClick={handleCaptureAndScan}
              disabled={isScanning || !modelReady}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center space-x-2 shadow-lg disabled:opacity-50 transition-all"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memindai AI...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Pindai Meter Sekarang</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
