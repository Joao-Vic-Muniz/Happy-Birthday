import { useEffect, useRef } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export default function HandController() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastY = useRef<number | null>(null);
  const position = useRef(0);

  useEffect(() => {
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
      if (!results.multiHandLandmarks?.length) return;

      const hand = results.multiHandLandmarks[0];
      const currentY = hand[8].y;

      if (lastY.current !== null) {
        const diff = currentY - lastY.current;

        const deadZone = 0.015;
        if (Math.abs(diff) > deadZone) {
          const speedLimit = 40;
          const movement = Math.max(
            -speedLimit,
            Math.min(speedLimit, diff * 1000)
          );

          position.current += movement;

          if (scrollRef.current) {
            scrollRef.current.style.transform = `translateY(${position.current}px)`;
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
    <>
      <video
        ref={videoRef}
        className="fixed bottom-4 right-4 w-28 rounded-xl opacity-40 z-50"
        autoPlay
        playsInline
      />

      <div
        ref={scrollRef}
        className="fixed inset-0 will-change-transform"
      />
    </>
  );
}