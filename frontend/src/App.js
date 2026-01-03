import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import LandingPage from "./pages/LandingPage";
import GeneratorPage from "./pages/GeneratorPage";
import ResultsPage from "./pages/ResultsPage";
import DetailPage from "./pages/DetailPage";
import DashboardPage from "./pages/DashboardPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/generate" element={<GeneratorPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/innovation/:id" element={<DetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
