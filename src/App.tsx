import DaysCounter from "./components/DaysCounters";
import ImageCard from "./components/ImageCards";
import HandController from "./components/HandController";

import foto_1 from "./assets/LoveImg_1.jpeg";
import foto_2 from "./assets/LoveImg_2.jpeg";
import foto_3 from "./assets/LoveImg_3.jpeg";
import foto_4 from "./assets/LoveImg_4.jpeg";
import foto_5 from "./assets/LoveImg_5.jpeg";
import foto_6 from "./assets/LoveImg_6.jpeg";
import foto_7 from "./assets/LoveImg_7.jpeg";

export default function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950">
      <HandController />

      <div
        id="scroll-content"
        className="absolute top-0 left-0 w-full flex flex-col items-center bg-gradient-to-b from-slate-950 via-purple-950 to-indigo-950 px-6 py-12 gap-10"
      >
        <DaysCounter />

        <ImageCard
          images={[
            foto_1,
            foto_2,
            foto_3,
            foto_4,
            foto_5,
            foto_6,
            foto_7,
          ]}
        />

        <div className="h-[100vh]" />
      </div>
    </div>
  );
}