import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { ModeToggle } from "@/components/mode-toggle";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <main className="algo-shell page-enter px-6 py-8">
      <nav className="page-nav mb-10 flex flex-wrap items-center justify-end gap-6 px-6 py-4 text-xl font-[audiowide]">
        <p className="nav-link" onClick={() => navigate(ROUTES.landing)}>Landing</p>
        <p className="nav-link" onClick={() => navigate(ROUTES.home)}>Home</p>
        <p className="nav-link" onClick={() => navigate(ROUTES.algorithms)}>Algorithms</p>
        <div className="green-icon-btn p-1">
          <ModeToggle />
        </div>
      </nav>

      <div className="section-fade max-w-3xl mx-auto space-y-6 rounded-3xl p-8 glass-panel">
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
          className="algo-btn-primary"
        >
          Back To Algorithms
        </button>
      </div>
    </main>
  );
};

export default AboutPage;
