import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export default function HandController() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastY = useRef<number | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const handsRef = useRef<Hands | null>(null);

  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) {
      lastY.current = null;
      return;
    }

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });

    hands.onResults((results) => {
      if (!results.multiHandLandmarks?.length) {
        lastY.current = null;
        return;
      }

      const hand = results.multiHandLandmarks[0];

      const thumbTip = hand[4]; // polegar
      const indexTip = hand[8]; // indicador

      // 📏 Distância entre polegar e indicador
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const pinchThreshold = 0.05;
      const isPinching = distance < pinchThreshold;

      if (!isPinching) {
        lastY.current = null;
        return;
      }

      const currentY = indexTip.y;

      if (lastY.current !== null) {
        const diff = currentY - lastY.current;

        const deadZone = 0.02;

        if (Math.abs(diff) > deadZone) {
          const speed = diff * 1200;

          window.scrollBy({
            top: speed,
            behavior: "auto",
          });
        }
      }

      lastY.current = currentY;
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start();
      cameraRef.current = camera;
      handsRef.current = hands;
    }

    return () => {
      cameraRef.current?.stop();
      handsRef.current?.close();
    };
  }, [active]);

  return (
    <>
      <button
        onClick={() => setActive(!active)}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition text-white shadow-lg"
      >
        {active ? "Desativar Câmera" : "Ativar Câmera"}
      </button>

      {active && (
        <video
          ref={videoRef}
          className="fixed bottom-4 right-4 w-32 rounded-xl opacity-50 z-40"
          autoPlay
          playsInline
        />
      )}
    </>
  );
}