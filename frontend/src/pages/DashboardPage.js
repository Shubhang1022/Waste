import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Plus, Clock, DollarSign, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [savedInnovations, setSavedInnovations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedInnovations();
  }, []);

  const fetchSavedInnovations = async () => {
    try {
      const response = await axios.get(`${API}/saved-innovations`);
      setSavedInnovations(response.data.saved_innovations || []);
    } catch (error) {
      console.error("Error fetching saved innovations:", error);
      toast.error("Failed to load saved innovations");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white flex items-center justify-center">
        <div className="text-center" data-testid="loading-state">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white">
      {/* Header */}
      <nav className="container mx-auto px-6 py-6" data-testid="dashboard-nav">
        <div className="flex justify-between items-center">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
            data-testid="logo-link"
          >
            <Recycle className="w-8 h-8 text-primary" />
            <span className="font-outfit text-2xl font-bold text-primary">ReCircuit</span>
          </div>
          <button
            data-testid="create-new-btn"
            onClick={() => navigate("/generate")}
            className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
          data-testid="dashboard-header"
        >
          <h1 className="font-outfit text-4xl md:text-5xl font-bold text-primary mb-4">
            My Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Your saved innovations and project ideas
          </p>
        </motion.div>

        {savedInnovations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
            data-testid="empty-state"
          >
            <div className="bg-secondary rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
              <Recycle className="w-16 h-16 text-primary" />
            </div>
            <h2 className="font-outfit text-2xl font-bold text-primary mb-4">
              No Saved Innovations Yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start creating innovative projects from your e-waste and save your favorites here.
            </p>
            <button
              data-testid="get-started-btn"
              onClick={() => navigate("/generate")}
              className="bg-accent text-black hover:bg-accent/90 rounded-full px-8 py-4 text-lg font-bold transition-transform hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="saved-innovations-grid">
            {savedInnovations.map((saved, index) => {
              const innovation = saved.innovation;
              return (
                <motion.div
                  key={saved.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  data-testid={`saved-innovation-${index}`}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-accent transition-all duration-300 hover:shadow-lg group overflow-hidden"
                >
                  <div className="p-6">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          getDifficultyColor(innovation.difficulty)
                        }`}
                      >
                        {innovation.difficulty}
                      </span>
                      <span className="bg-secondary text-primary px-3 py-1 rounded-full text-xs font-medium">
                        {innovation.innovation_type}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-outfit text-xl font-bold text-primary mb-3 leading-tight">
                      {innovation.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {innovation.description}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <DollarSign className="w-4 h-4 text-primary mb-1" />
                        <div className="text-xs text-gray-600">Cost</div>
                        <div className="font-mono font-bold text-primary">
                          {innovation.currency} {innovation.estimated_cost}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <Clock className="w-4 h-4 text-primary mb-1" />
                        <div className="text-xs text-gray-600">Time</div>
                        <div className="font-bold text-primary text-sm">
                          {innovation.time_estimate}
                        </div>
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      data-testid={`view-saved-btn-${index}`}
                      onClick={() => navigate(`/innovation/${innovation.id}`)}
                      className="w-full bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      View Project <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Stats Section (if there are saved innovations) */}
        {savedInnovations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 bg-white rounded-2xl p-8 border border-gray-200"
            data-testid="stats-section"
          >
            <h3 className="font-outfit text-2xl font-bold text-primary mb-6">Your Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">
                  {savedInnovations.length}
                </div>
                <div className="text-gray-600">Saved Projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {Math.round(
                    savedInnovations.reduce(
                      (sum, s) => sum + (s.innovation.sustainability_score || 0),
                      0
                    ) / savedInnovations.length
                  )}
                  %
                </div>
                <div className="text-gray-600">Avg. Sustainability</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {Math.round(
                    savedInnovations.reduce(
                      (sum, s) => sum + (s.innovation.reusability_score || 0),
                      0
                    ) / savedInnovations.length
                  )}
                  %
                </div>
                <div className="text-gray-600">Avg. Reusability</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
