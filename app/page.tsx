"use client";

import { useState, useRef, useEffect } from "react";

type AnimationType = "fade" | "slide" | "typewriter" | "zoom";

export default function Home() {
  const [text, setText] = useState("Hello World!");
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [animation, setAnimation] = useState<AnimationType>("fade");
  const [duration, setDuration] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontSize, textColor, bgColor]);

  const drawPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  };

  const generateVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "text-video.webm";
      a.click();
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    };

    mediaRecorder.start();

    const fps = 30;
    const totalFrames = duration * fps;
    let frame = 0;

    const animate = () => {
      if (frame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      const progress = frame / totalFrames;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      switch (animation) {
        case "fade":
          ctx.globalAlpha = progress;
          ctx.fillText(text, canvas.width / 2, canvas.height / 2);
          ctx.globalAlpha = 1;
          break;

        case "slide":
          const slideX = canvas.width / 2 - canvas.width * (1 - progress);
          ctx.fillText(text, slideX, canvas.height / 2);
          break;

        case "typewriter":
          const chars = Math.floor(text.length * progress);
          const displayText = text.substring(0, chars);
          ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
          break;

        case "zoom":
          const scale = progress;
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(scale, scale);
          ctx.fillText(text, 0, 0);
          ctx.restore();
          break;
      }

      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-2">
          Text to Video Converter
        </h1>
        <p className="text-white text-center mb-8 text-lg opacity-90">
          Transform your text into stunning animated videos
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Your Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Enter your text here..."
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Text Color
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Background
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Animation Style
              </label>
              <select
                value={animation}
                onChange={(e) => setAnimation(e.target.value as AnimationType)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none cursor-pointer"
              >
                <option value="fade">Fade In</option>
                <option value="slide">Slide In</option>
                <option value="typewriter">Typewriter</option>
                <option value="zoom">Zoom In</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Duration: {duration}s
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <button
              onClick={generateVideo}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isGenerating ? "Generating Video..." : "Generate & Download Video"}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Preview</h2>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                width={640}
                height={360}
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
            <p className="text-gray-600 text-sm mt-4 text-center">
              This is how your video will look
            </p>
          </div>
        </div>

        {/* Hidden canvas for video generation */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="hidden"
        />
      </div>
    </div>
  );
}
