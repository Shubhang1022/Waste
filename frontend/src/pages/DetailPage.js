import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Recycle,
  ArrowLeft,
  Clock,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Bookmark,
  Leaf,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [innovation, setInnovation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInnovation();
  }, [id]);

  const fetchInnovation = async () => {
    try {
      const response = await axios.get(`${API}/innovation/${id}`);
      setInnovation(response.data);
    } catch (error) {
      console.error("Error fetching innovation:", error);
      toast.error("Failed to load innovation details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/save-innovation?innovation_id=${id}`);
      toast.success("Innovation saved to your dashboard!");
    } catch (error) {
      console.error("Error saving innovation:", error);
      toast.error("Failed to save innovation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white flex items-center justify-center">
        <div className="text-center" data-testid="loading-state">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading innovation details...</p>
        </div>
      </div>
    );
  }

  if (!innovation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white flex items-center justify-center">
        <div className="text-center" data-testid="not-found">
          <h2 className="font-outfit text-2xl font-bold text-primary mb-4">Innovation not found</h2>
          <button
            onClick={() => navigate("/generate")}
            className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium"
          >
            Generate New Ideas
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white">
      {/* Header */}
      <nav className="container mx-auto px-6 py-6" data-testid="detail-nav">
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
            data-testid="back-btn"
            onClick={() => navigate(-1)}
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6 py-2 font-medium transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
            data-testid="innovation-header"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
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
            <h1 className="font-outfit text-4xl md:text-5xl font-bold text-primary mb-4">
              {innovation.title}
            </h1>
            <p className="text-gray-600 text-lg">{innovation.description}</p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            data-testid="key-metrics"
          >
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <DollarSign className="w-6 h-6 text-primary mb-2" />
              <div className="text-sm text-gray-600">Estimated Cost</div>
              <div className="font-mono font-bold text-xl text-primary">
                {innovation.currency} {innovation.estimated_cost}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <Clock className="w-6 h-6 text-primary mb-2" />
              <div className="text-sm text-gray-600">Time Required</div>
              <div className="font-bold text-xl text-primary">{innovation.time_estimate}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <Leaf className="w-6 h-6 text-accent mb-2" />
              <div className="text-sm text-gray-600">Sustainability</div>
              <div className="font-bold text-xl text-accent">{innovation.sustainability_score}%</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <div className="text-sm text-gray-600">Reusability</div>
              <div className="font-bold text-xl text-primary">{innovation.reusability_score}%</div>
            </div>
          </motion.div>

          {/* Materials & Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            data-testid="materials-tools"
          >
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-outfit text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Materials Needed
              </h3>
              <ul className="space-y-2">
                {innovation.materials_needed?.map((material, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-accent mt-1">•</span>
                    <span>{material}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-outfit text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Tools Required
              </h3>
              <ul className="space-y-2">
                {innovation.tools_required?.map((tool, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-primary mt-1">•</span>
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Safety Warnings */}
          {innovation.safety_warnings && innovation.safety_warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 mb-8"
              data-testid="safety-warnings"
            >
              <h3 className="font-outfit text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Safety Warnings
              </h3>
              <ul className="space-y-2">
                {innovation.safety_warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-red-700">
                    <span className="mt-1">⚠️</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Step-by-Step Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            data-testid="step-by-step"
          >
            <h2 className="font-outfit text-3xl font-bold text-primary mb-6">Step-by-Step Instructions</h2>
            <div className="space-y-4">
              {innovation.steps?.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-secondary/50 rounded-xl p-6 border-l-4 border-primary"
                  data-testid={`step-${idx}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold">
                      {step.step_number}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-outfit text-lg font-bold text-primary mb-2">{step.title}</h4>
                      <p className="text-gray-700 mb-3">{step.description}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="bg-white px-3 py-1 rounded-full text-gray-600">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {step.duration}
                        </span>
                        {step.tools_required && step.tools_required.length > 0 && (
                          <span className="bg-white px-3 py-1 rounded-full text-gray-600">
                            <Wrench className="w-3 h-3 inline mr-1" />
                            {step.tools_required.join(", ")}
                          </span>
                        )}
                      </div>
                      {step.safety_note && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          {step.safety_note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Potential Value */}
          {innovation.potential_value && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 bg-accent/10 rounded-xl p-6 border border-accent"
              data-testid="potential-value"
            >
              <h3 className="font-outfit text-xl font-bold text-primary mb-2">Potential Value</h3>
              <p className="text-gray-700">{innovation.potential_value}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row gap-4"
            data-testid="action-buttons"
          >
            <button
              data-testid="save-innovation-btn"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Bookmark className="w-5 h-5" />
                  Save to Dashboard
                </>
              )}
            </button>
            <button
              data-testid="generate-more-btn"
              onClick={() => navigate("/generate")}
              className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 py-4 text-lg font-medium transition-all"
            >
              Generate More Ideas
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
