import { useLocation, useNavigate } from "react-router-dom";
import { Recycle, TrendingUp, Clock, DollarSign, Leaf, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { innovations, wasteInfo } = location.state || { innovations: [], wasteInfo: {} };

  if (!innovations || innovations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white flex items-center justify-center">
        <div className="text-center" data-testid="no-results">
          <h2 className="font-outfit text-2xl font-bold text-primary mb-4">No innovations found</h2>
          <button
            data-testid="try-again-btn"
            onClick={() => navigate("/generate")}
            className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white">
      {/* Header */}
      <nav className="container mx-auto px-6 py-6" data-testid="results-nav">
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
            data-testid="new-search-btn"
            onClick={() => navigate("/generate")}
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6 py-2 font-medium transition-all"
          >
            New Search
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
          data-testid="results-header"
        >
          <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-primary font-medium">AI-Generated Ideas</span>
          </div>
          <h1 className="font-outfit text-4xl md:text-5xl font-bold text-primary mb-4">
            Your Innovation Ideas
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We've generated {innovations.length} creative project{innovations.length > 1 ? "s" : ""} from your
            e-waste
          </p>
        </motion.div>

        {/* Innovation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto" data-testid="innovations-grid">
          {innovations.map((innovation, index) => (
            <motion.div
              key={innovation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-testid={`innovation-card-${index}`}
              className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 hover:border-accent transition-all duration-300 hover:shadow-lg group flex flex-col"
            >
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold z-10">
                #{index + 1}
              </div>

              {/* Difficulty Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    getDifficultyColor(innovation.difficulty)
                  }`}
                >
                  {innovation.difficulty}
                </span>
              </div>

              <div className="p-6 pt-16 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="font-outfit text-xl font-bold text-primary mb-3 leading-tight">
                  {innovation.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{innovation.description}</p>

                {/* Type Badge */}
                <div className="mb-4">
                  <span className="inline-block bg-secondary text-primary px-3 py-1 rounded-full text-xs font-medium">
                    {innovation.innovation_type}
                  </span>
                </div>

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
                    <div className="font-bold text-primary text-sm">{innovation.time_estimate}</div>
                  </div>
                </div>

                {/* Scores */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Sustainability</span>
                      <span className="font-bold text-accent">{innovation.sustainability_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2 transition-all"
                        style={{ width: `${innovation.sustainability_score}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Reusability</span>
                      <span className="font-bold text-primary">{innovation.reusability_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${innovation.reusability_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  data-testid={`view-details-btn-${index}`}
                  onClick={() => navigate(`/innovation/${innovation.id}`)}
                  className="mt-auto w-full bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
          data-testid="bottom-cta"
        >
          <p className="text-gray-600 mb-4">Want to explore more ideas?</p>
          <button
            data-testid="generate-more-btn"
            onClick={() => navigate("/generate")}
            className="bg-accent text-black hover:bg-accent/90 rounded-full px-8 py-4 text-lg font-bold transition-transform hover:scale-105 active:scale-95"
          >
            Generate More Ideas
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;
