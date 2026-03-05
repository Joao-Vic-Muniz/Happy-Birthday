import { useEffect, useRef } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export default function HandController() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const lastY = useRef<number | null>(null);
  const position = useRef(0);
  const maxScroll = useRef(0);

  useEffect(() => {
    const scrollElement = document.getElementById("scroll-content");

    if (scrollElement) {
      maxScroll.current =
        scrollElement.scrollHeight - window.innerHeight;
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

      const indexTip = hand[8];
      const middleTip = hand[12];

      const isActive = indexTip.y < middleTip.y;

      if (!isActive) {
        lastY.current = null;
        return;
      }

      const currentY = indexTip.y;

      if (lastY.current !== null) {
        const diff = currentY - lastY.current;

        const deadZone = 0.02;
        if (Math.abs(diff) > deadZone) {
          const speed = diff * 800;

          position.current += speed;

          position.current = Math.min(
            0,
            Math.max(-maxScroll.current, position.current)
          );

          if (scrollElement) {
            scrollElement.style.transform =
              `translateY(${position.current}px)`;
          }
        }
      }

      lastY.current = currentY;
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480,
      });

      camera.start();
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="fixed bottom-4 right-4 w-28 rounded-xl opacity-40 z-50"
      autoPlay
      playsInline
    />
  );
}