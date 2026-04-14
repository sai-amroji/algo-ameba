import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold font-plex">About Algo Ameba</h1>
        <p className="text-lg text-muted-foreground">
          Algo Ameba is a visual playground for understanding algorithms through
          step-by-step animations.
        </p>
        <p className="text-lg text-muted-foreground">
          The current focus is sorting and searching visualizers, with more
          categories planned next.
        </p>
        <button
          onClick={() => navigate(ROUTES.home)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back To Algorithms
        </button>
      </div>
    </main>
  );
};

export default AboutPage;
