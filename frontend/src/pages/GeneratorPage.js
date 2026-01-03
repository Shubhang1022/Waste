import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, Loader2, Recycle, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const INNOVATION_TYPES = [
  { id: "diy_tools", label: "DIY Tools" },
  { id: "electronics", label: "Electronics Projects" },
  { id: "home_utility", label: "Home Utility" },
  { id: "creative_art", label: "Creative/Art" },
  { id: "eco_friendly", label: "Eco-friendly" },
  { id: "small_business", label: "Small Business" },
  { id: "educational", label: "Educational" },
];

const GeneratorPage = () => {
  const navigate = useNavigate();
  const [inputMethod, setInputMethod] = useState("text"); // "text" or "image"
  const [wasteName, setWasteName] = useState("");
  const [wasteDescription, setWasteDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(["diy_tools"]);
  const [budget, setBudget] = useState(50);
  const [currency, setCurrency] = useState("USD");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleType = (typeId) => {
    if (selectedTypes.includes(typeId)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== typeId));
      }
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const handleGenerate = async () => {
    if (inputMethod === "text" && !wasteName.trim()) {
      toast.error("Please enter the e-waste name");
      return;
    }
    if (inputMethod === "image" && !imageFile) {
      toast.error("Please upload an image");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Analyze waste
      setAnalyzing(true);
      let wasteData;

      if (inputMethod === "image") {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(",")[1];
          const analyzeResponse = await axios.post(`${API}/analyze-waste`, {
            image_base64: base64,
          });
          wasteData = analyzeResponse.data;
          await generateInnovations(wasteData);
        };
        reader.readAsDataURL(imageFile);
      } else {
        const analyzeResponse = await axios.post(`${API}/analyze-waste`, {
          waste_name: wasteName,
          waste_description: wasteDescription,
        });
        wasteData = analyzeResponse.data;
        await generateInnovations(wasteData);
      }
    } catch (error) {
      console.error("Error generating innovations:", error);
      toast.error(error.response?.data?.detail || "Failed to generate innovations");
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const generateInnovations = async (wasteData) => {
    try {
      setAnalyzing(false);

      // Step 2: Generate innovations
      const innovationResponse = await axios.post(`${API}/generate-innovations`, {
        waste_id: wasteData.waste_id,
        waste_description: wasteData.waste_description,
        innovation_types: selectedTypes,
        budget: budget,
        currency: currency,
        skill_level: skillLevel,
      });

      const innovations = innovationResponse.data.innovations;

      // Navigate to results
      navigate("/results", {
        state: {
          innovations,
          wasteInfo: {
            description: wasteData.waste_description,
            identified_from: wasteData.identified_from,
          },
        },
      });
    } catch (error) {
      console.error("Error generating innovations:", error);
      toast.error(error.response?.data?.detail || "Failed to generate innovations");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white">
      {/* Header */}
      <nav className="container mx-auto px-6 py-6" data-testid="generator-nav">
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
            data-testid="dashboard-btn"
            onClick={() => navigate("/dashboard")}
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6 py-2 font-medium transition-all"
          >
            My Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1
            className="font-outfit text-4xl md:text-5xl font-bold text-primary text-center mb-4"
            data-testid="page-title"
          >
            Innovation Generator
          </h1>
          <p className="text-center text-gray-600 text-lg mb-12" data-testid="page-subtitle">
            Transform your e-waste into creative projects
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Panel - Input Form */}
            <div className="space-y-6" data-testid="input-form">
              {/* Input Method Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Input Method</label>
                <div className="flex gap-4" data-testid="input-method-toggle">
                  <button
                    data-testid="text-input-btn"
                    onClick={() => setInputMethod("text")}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                      inputMethod === "text"
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 hover:border-primary"
                    }`}
                  >
                    Text Description
                  </button>
                  <button
                    data-testid="image-input-btn"
                    onClick={() => setInputMethod("image")}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                      inputMethod === "image"
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 hover:border-primary"
                    }`}
                  >
                    Upload Image
                  </button>
                </div>
              </div>

              {/* Text Input */}
              {inputMethod === "text" && (
                <div className="space-y-4" data-testid="text-input-section">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Waste Name *
                    </label>
                    <input
                      data-testid="waste-name-input"
                      type="text"
                      value={wasteName}
                      onChange={(e) => setWasteName(e.target.value)}
                      placeholder="e.g., Old laptop, Broken phone, Circuit boards"
                      className="w-full bg-white border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      data-testid="waste-description-input"
                      value={wasteDescription}
                      onChange={(e) => setWasteDescription(e.target.value)}
                      placeholder="Describe the condition, components, or any specific details..."
                      rows={4}
                      className="w-full bg-white border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload */}
              {inputMethod === "image" && (
                <div data-testid="image-input-section">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload E-Waste Image *
                  </label>
                  {!imagePreview ? (
                    <label
                      data-testid="image-upload-area"
                      className="image-upload-container border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-12 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-secondary/30 block"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        data-testid="image-file-input"
                      />
                      <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium">Click to upload image</p>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG, WEBP (max 5MB)</p>
                    </label>
                  ) : (
                    <div className="relative" data-testid="image-preview-section">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-2xl"
                      />
                      <button
                        data-testid="remove-image-btn"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Innovation Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Innovation Types (Select at least one)
                </label>
                <div className="grid grid-cols-2 gap-3" data-testid="innovation-types">
                  {INNOVATION_TYPES.map((type) => (
                    <button
                      key={type.id}
                      data-testid={`innovation-type-${type.id}`}
                      onClick={() => toggleType(type.id)}
                      className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                        selectedTypes.includes(type.id)
                          ? "border-accent bg-accent/20 text-primary"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget: {currency} {budget}
                </label>
                <div className="flex gap-4">
                  <input
                    data-testid="budget-slider"
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    data-testid="budget-number-input"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-24 bg-white border-2 border-gray-200 focus:border-primary rounded-xl px-3 py-2 outline-none"
                  />
                  <select
                    data-testid="currency-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-white border-2 border-gray-200 focus:border-primary rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                <div className="flex gap-3" data-testid="skill-level-select">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <button
                      key={level}
                      data-testid={`skill-level-${level.toLowerCase()}`}
                      onClick={() => setSkillLevel(level)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                        skillLevel === level
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                data-testid="generate-innovations-btn"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-accent text-black hover:bg-accent/90 rounded-full px-8 py-4 text-lg font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {analyzing ? "Analyzing..." : "Generating..."}
                  </>
                ) : (
                  "Generate Innovations"
                )}
              </button>
            </div>

            {/* Right Panel - Preview/Tips */}
            <div className="bg-secondary rounded-2xl p-8" data-testid="tips-section">
              <h3 className="font-outfit text-2xl font-bold text-primary mb-4">Tips for Best Results</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span>
                    <strong>For images:</strong> Ensure good lighting and clear view of components
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span>
                    <strong>For text:</strong> Be specific about the condition and type of e-waste
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span>
                    <strong>Budget:</strong> Set a realistic budget for materials and tools
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span>
                    <strong>Skill Level:</strong> Choose based on your comfort with DIY projects
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <span>
                    <strong>Innovation Types:</strong> Select multiple types for more variety
                  </span>
                </li>
              </ul>

              <div className="mt-8 p-6 bg-white rounded-xl">
                <h4 className="font-outfit text-lg font-bold text-primary mb-2">Example E-Waste</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Old smartphones, tablets, laptops</li>
                  <li>• Broken circuit boards, hard drives</li>
                  <li>• Dead batteries, chargers, cables</li>
                  <li>• Fans, motors, LED strips</li>
                  <li>• Old keyboards, mice, monitors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;
