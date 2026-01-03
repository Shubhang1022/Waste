import { useNavigate } from "react-router-dom";
import { Sparkles, Recycle, Lightbulb, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F0] to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6" data-testid="landing-nav">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Recycle className="w-8 h-8 text-primary" />
            <span className="font-outfit text-2xl font-bold text-primary">ReCircuit</span>
          </div>
          <button
            data-testid="nav-get-started-btn"
            onClick={() => navigate('/generate')}
            className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="col-span-full md:col-span-7"
            data-testid="hero-section"
          >
            <h1 className="font-outfit text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-primary leading-tight">
              Turn E-Waste into
              <span className="text-accent"> Innovation</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mt-6 max-w-2xl">
              Transform your electronic waste into budget-friendly DIY projects with AI-powered step-by-step guidance.
              From broken laptops to old phones — discover endless possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                data-testid="hero-start-creating-btn"
                onClick={() => navigate('/generate')}
                className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Start Creating <ArrowRight className="w-5 h-5" />
              </button>
              <button
                data-testid="view-examples-btn"
                onClick={() => navigate('/dashboard')}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 py-4 text-lg font-medium transition-all"
              >
                View Examples
              </button>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-full md:col-span-5"
            data-testid="hero-image"
          >
            <div className="rounded-2xl overflow-hidden h-[300px] md:h-[400px] shadow-card">
              <img
                src="https://images.unsplash.com/photo-1717667745934-53091623e8ee?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="E-waste components"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12"
          data-testid="stats-section"
        >
          <div className="bg-secondary p-6 rounded-xl">
            <Sparkles className="w-10 h-10 text-accent mb-3" />
            <div className="font-outfit text-3xl font-bold text-primary">AI-Powered</div>
            <p className="text-gray-600 mt-2">Smart innovation suggestions</p>
          </div>
          <div className="bg-secondary p-6 rounded-xl">
            <Lightbulb className="w-10 h-10 text-accent mb-3" />
            <div className="font-outfit text-3xl font-bold text-primary">100+ Ideas</div>
            <p className="text-gray-600 mt-2">Creative project possibilities</p>
          </div>
          <div className="bg-secondary p-6 rounded-xl">
            <TrendingUp className="w-10 h-10 text-accent mb-3" />
            <div className="font-outfit text-3xl font-bold text-primary">Budget-Aware</div>
            <p className="text-gray-600 mt-2">Projects within your budget</p>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20"
          data-testid="how-it-works-section"
        >
          <h2 className="font-outfit text-4xl font-bold text-primary text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-outfit text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-outfit text-xl font-bold text-primary mb-2">Upload or Describe</h3>
              <p className="text-gray-600">Share an image or describe your e-waste</p>
            </div>
            <div className="text-center">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-outfit text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-outfit text-xl font-bold text-primary mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI generates creative innovation ideas</p>
            </div>
            <div className="text-center">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-outfit text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-outfit text-xl font-bold text-primary mb-2">Build It</h3>
              <p className="text-gray-600">Follow step-by-step instructions to create</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 bg-primary rounded-3xl p-12 text-center"
          data-testid="cta-section"
        >
          <h2 className="font-outfit text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your E-Waste?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join the sustainable innovation movement. Start creating amazing projects from waste today.
          </p>
          <button
            data-testid="cta-start-now-btn"
            onClick={() => navigate('/generate')}
            className="bg-accent text-black hover:bg-accent/90 rounded-full px-10 py-5 text-lg font-bold transition-transform hover:scale-105 active:scale-95"
          >
            Start Now — It's Free!
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 mt-20" data-testid="footer">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Recycle className="w-6 h-6" />
            <span className="font-outfit text-xl font-bold">ReCircuit</span>
          </div>
          <p className="text-white/80">Transforming e-waste into innovation, one project at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
