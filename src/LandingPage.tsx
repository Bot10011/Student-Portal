import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Add refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const missionVisionRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    // Only redirect if we're not coming from a logout action
    if (user && !location.state?.from?.pathname?.includes('/dashboard')) {
      const userData = JSON.parse(user);
      if (userData.isAuthenticated) {
        // Redirect to appropriate dashboard
        const dashboardPath = `/${userData.role}/dashboard`;
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [navigate, location]);

  // Add useEffect for scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Observe all elements with scroll-reveal Course 
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale')
      .forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  // Modify the parallax effect useEffect
  useEffect(() => {
    const handleParallax = () => {
      const scrolled = window.scrollY;
      
      // Text parallax (only the text moves)
      const textLayer = document.querySelector('.text-layer') as HTMLElement;
      if (textLayer) {
        textLayer.style.transform = `translateY(${scrolled * 0.4}px)`;
      }
    };

    window.addEventListener('scroll', handleParallax);
    return () => window.removeEventListener('scroll', handleParallax);
  }, []);

  // Background transition
  useEffect(() => {
    // Switch background after 5 seconds
    const bgTimer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 5000);

    
    return () => clearTimeout(bgTimer);
  }, []);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    
    setShowLoginModal(false);
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  return (
    <div className="min-h-screen">
      {/* Background layers container - Add position relative and z-index */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Layer 1: bg.jpg (bottom layer) - static */}
        <div className="absolute inset-0 z-0 transition-all duration-[2000ms] ease-in-out">
          <img 
            src="img/bg.jpg" 
            alt="Background"
            className="w-full h-full object-cover transition-transform duration-[2000ms] ease-in-out scale-110"
            style={{
              opacity: isInitialLoad ? 1.0 : 1,
              objectPosition: '100% 40%',
              transform: isInitialLoad ? 'scale(1.1)' : 'scale(1)'
            }}
          />
        </div>

        {/* Layer 2: Animated text (middle layer) - moves on scroll */}
        <div className="absolute inset-0 flex items-start justify-center z-10 mt-32 text-layer">
          <div className="text-center max-w-4xl mx-auto relative space-y-4 p-8">
            <div className={`transition-all duration-[2500ms] ease-in-out transform ${
              isInitialLoad ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
            }`}>
              <h1 className="text-6xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 
                bg-clip-text text-transparent animate-gradient-x relative font-circular-std">
                SMCBI School Portal
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-50"></div>
              </h1>
              
              <div className={`flex items-center justify-center space-x-3 mt-2 transition-all duration-[3000ms] ease-in-out transform ${
                isInitialLoad ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
              }`} style={{ transitionDelay: '500ms' }}>
                <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent animate-gradient-x font-circular-std">with</span>
                <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent animate-gradient-x font-circular-std">Schedule Automation</span>
              </div>
              
              <h1 className={`text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent animate-gradient-x mt-2 font-circular-std transition-all duration-[3500ms] ease-in-out transform ${
                isInitialLoad ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
              }`} style={{ transitionDelay: '1000ms' }}>System</h1>
            </div>
          </div>
        </div>

        {/* Layer 3: bg1.png (top layer) - static */}
        <div className="absolute inset-0 z-20 transition-all duration-[2000ms] ease-in-out">
          <img 
            src="img/bg1.png" 
            alt="Overlay"
            className="w-full h-full object-cover transition-transform duration-[2000ms] ease-in-out"
            style={{ 
              opacity: isInitialLoad ? 5.0 : 3,
              objectPosition: '100% 40%',
              transform: isInitialLoad ? 'scale(1.1)' : 'scale(1)'
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className={`
          container mx-auto px-6 py-4 
          sticky top-0 
          transition-all duration-500 ease-in-out
          rounded-3xl
          ${isScrolled 
            ? 'bg-white shadow-lg py-2' 
            : 'bg-transparent py-4'
          }
          ${showLoginModal ? 'z-0' : 'z-[100]'}
        `}
      >
        <div className="container mx-auto px-6">  </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-end space-x-2">
            <img src="img/logo1.png" alt="Logo" className="h-16 w-auto ml-auto" />
          </div>
          
          
          {/* macOS-style menu bar */}
          <div className="hidden md:flex items-center space-x-5">
  {[
    { name: 'Home', section: 'home' },
    { name: 'Event', section: 'event '},
    { name: 'About', section: 'mission-vision' },
    { name: 'Contact Us', section: 'contact' }
  ].map((item) => (
    <button
      key={item.name}
      onClick={() => scrollToSection(item.section)}
      className="px-6 py-2 rounded-lg text-[#2B3674] hover:bg-gray-100/80 text-sm font-medium transition-all duration-200"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      {item.name}
    </button>
  ))}
</div>


          {/* Login button with 3D pushable effect */}
          <div className="relative">
            <button 
              className="group relative bg-transparent p-0 border-none cursor-pointer"
              onClick={handleLoginClick}
            >
              {/* Enhanced shadow layer with multiple blurs for more depth */}
              <span className="absolute inset-0 w-full h-full bg-[#1a2634]/80 rounded-xl blur-[2px] transition-transform duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] transform translate-y-0.5 group-hover:translate-y-1 group-active:translate-y-0.25"></span>
              <span className="absolute inset-0 w-full h-full bg-[#1a2634]/40 rounded-xl blur-md transition-transform duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] transform translate-y-1 group-hover:translate-y-2 group-active:translate-y-0.5"></span>
              
              {/* Enhanced edge layer with more gradient stops */}
              <span className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-[#2C3E50] via-[#2C3E50] to-[#1a2634] shadow-inner"></span>
              
              {/* Front layer - keeping your original button styling */}
              <span className="block relative rounded-xl bg-[#2C3E50] px-6 py-3 text-white text-sm font-semibold transform -translate-y-1 transition-transform duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-hover:ease-[cubic-bezier(0.3,0.7,0.4,1.5)] group-active:-translate-y-0.5 group-active:duration-[34ms]">
                Login
              </span>
            </button>
          </div>
        </div>
      </nav>
     {/* Hero Section */}
      <div className="container mx-auto px-9 pt-20 relative pb-32" ref={heroRef}>
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="text-center max-w-4xl mx-auto relative space-y-6 p-8">
            <div className="relative">
                </div>
                </div>
              </div>
     
 {/* Core Values Cards - Updated with higher z-index */}
 <div className="absolute left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-6xl mx-auto z-[2]" style={{ bottom: "-120px" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 relative">
            <div className="absolute inset-0 -top-8 bg-transparent"></div>
            
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100/50 group pointer-events-auto relative">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">✝️</span>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 text-center">Faith</h3>
                <p className="text-gray-600 text-sm leading-relaxed text-center">
                  Guided by Christian values and principles in our community.
                </p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100/50 group pointer-events-auto relative">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 text-center">Excellence</h3>
                <p className="text-gray-600 text-sm leading-relaxed text-center">
                  Striving for the highest standards in academic achievement.
                </p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100/50 group pointer-events-auto relative">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 text-center">Service</h3>
                <p className="text-gray-600 text-sm leading-relaxed text-center">
                  Fostering a spirit of compassion and leadership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Mission, Vision & Values Section */}
      <div id="mission-vision" className="py-24 relative overflow-hidden parallax-bg" ref={missionVisionRef}>
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-blue-100 rounded-full filter blur-3xl opacity-20 -translate-x-1/2"></div>
          <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-purple-100 rounded-full filter blur-3xl opacity-20 translate-x-1/2"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          {/* Header */}
          <div className="text-center mb-16 max-w-2xl mx-auto scroll-reveal-scale">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full inline-block mb-4">
              Our Purpose
            </span>
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Mission & Vision</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600">
              Guiding principles that shape our institution's future and drive our commitment to excellence.
            </p>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Mission Card */}
            <div className="group relative scroll-reveal-left">
              {/* Card Background with Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-3xl transform transition-transform group-hover:scale-105 duration-300"></div>
              
              <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                {/* Icon Header */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-[#2C3E50] group-hover:text-blue-600 transition-colors duration-300 text-center">
                    Our Mission
                  </h2>
                </div>
            

                {/* Content */}
                <div className="flex flex-col justify-between flex-grow">
                  <p className="text-gray-600 leading-relaxed backdrop-blur-xl bg-white/50 p-6 rounded-xl border border-gray-100 group-hover:border-blue-100 transition-colors">
                    St. Mary's College of Bansalan, Inc. is committed to providing quality Catholic education 
                    that develops competent and socially responsible individuals through excellent academic programs, 
                    research, and community service guided by Christian values and principles.
                  </p>

                  {/* Key Points - Now with mt-auto to push it to the bottom */}
                  <div className="grid grid-cols-2 gap-4 mt-auto pt-8">
                    {[
                      { icon: "🎓", text: "Academic Excellence" },
                      { icon: "🤝", text: "Social Responsibility" },
                      { icon: "📚", text: "Quality Education" },
                      { icon: "✝️", text: "Christian Values" }
                    ].map((point, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-2 bg-blue-50/50 p-3 rounded-xl group-hover:bg-blue-50 transition-colors"
                      >
                        <span className="text-2xl">{point.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{point.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div> 
            </div>

            {/* Vision Card */}
            <div className="group relative scroll-reveal-right">
              {/* Card Background with Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-3xl transform transition-transform group-hover:scale-105 duration-300"></div>
              
              <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                {/* Icon Header */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-[#2C3E50] group-hover:text-purple-600 transition-colors duration-300 text-center">
                    Our Vision
                  </h2>
                </div>

                {/* Content */}
                <div className="space-y-4 flex-grow">
                  <p className="text-gray-600 leading-relaxed backdrop-blur-xl bg-white/50 p-6 rounded-xl border border-gray-100 group-hover:border-purple-100 transition-colors">
                    St. Mary's College of Bansalan, Inc. envisions itself as a premier Catholic educational 
                    institution in Mindanao, forming individuals who are academically competent, spiritually mature, 
                    and socially engaged in building a just and humane society.
                  </p>

                  {/* Achievement Timeline */}
                  <div className="relative mt-6 pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-200"></div>
                    {[
                      { year: "2024", text: "Premier Educational Institution" },
                      { year: "2025", text: "Regional Excellence Center" },
                      { year: "2026", text: "National Recognition" }
                    ].map((milestone, index) => (
                      <div key={index} className="relative mb-4 last:mb-0">
                        <div className="absolute -left-[19px] w-4 h-4 rounded-full bg-purple-500 border-4 border-white"></div>
                        <div className="ml-4">
                          <span className="text-sm font-semibold text-purple-600">{milestone.year}</span>
                          <p className="text-gray-600">{milestone.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

         
          </div>
        </div>
      </div>

      {/* Success Stories & Achievements Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-50 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.015]"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          {/* Header with animated underline */}
          <div className="text-center mb-16 max-w-2xl mx-auto scroll-reveal-scale">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full inline-block mb-4">
              Our Pride
            </span>
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Success Stories</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600">
              Celebrating the achievements of our outstanding alumni who continue to make their mark in various fields.
            </p>
          </div>
        
          {/* Success Stories Carousel */}
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              <div className="overflow-hidden">
                <div className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide -mx-4 pb-8">
                  {[
                    {
                      name: "John Doe",
                      achievement: "Top 1 - LET Board Exam 2023",
                      image: "/img/passer/passer.jpg",
                      quote: "SMCBI provided me with the foundation I needed to excel.",
                      program: "Bachelor of Secondary Education",
                      rating: 98.75,
                      socialLinks: {
                        linkedin: "https://linkedin.com/in/johndoe",
                        twitter: "https://twitter.com/johndoe"
                      }
                    },
                    {
                      name: "Jane Smith",
                      achievement: "Top 3 - Nursing Board 2023",
                      image: "/img/passer/passer2.jpg",
                      quote: "The rigorous training at SMCBI prepared me for success.",
                      program: "Bachelor of Science in Nursing",
                      rating:  9999999,
                      socialLinks: {
                        linkedin: "https://linkedin.com/in/janesmith",
                        twitter: "https://twitter.com/janesmith"
                      }
                    },
                    {
                      name: "Mark Johnson",
                      achievement: "Regional Top 5 - CPA Board 2023",
                      image: "/img/passer/passer1.jpg",
                      quote: "I'm grateful for the mentorship and support from SMCBI.",
                      program: "Bachelor of Science in Accountancy",
                      rating: 97.6,
                      socialLinks: {
                        linkedin: "https://linkedin.com/in/markjohnson",
                        twitter: "https://twitter.com/markjohnson"
                      }
                    }
                  ].map((student, index) => (
                    <div key={index} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 snap-center px-4">
                      <div className="group h-full">
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full transform hover:-translate-y-1 overflow-hidden">
                          <div className="relative h-[400px] overflow-hidden">
                            <img
                              src={student.image}
                              alt={student.name}
                              className="w-full h-full object-contain object-center"
                              style={{
                                backgroundColor: '#f8f9fa' // Light background for images
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {/* Achievement badge */}
                              <div className="absolute top-4 right-4">
                                <div className="bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1.5">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                                  </svg>
                                  <span className="font-mono">{student.rating}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-6">
                            <div className="mb-4">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                              <p className="text-blue-600 font-medium text-sm">{student.achievement}</p>
                            </div>

                            {/* Program with icon */}
                            <div className="flex items-center text-gray-600 text-sm mb-4">
                              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span>{student.program}</span>
                            </div>

                            {/* Quote */}
                            <blockquote className="relative italic text-gray-600 text-sm mb-6">
                              <svg className="w-6 h-6 text-blue-100 absolute -top-2 -left-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.999v10h-9.999z" />
                              </svg>
                              <p className="pl-6">{student.quote}</p>
                            </blockquote>

                            {/* Social links */}
                            <div className="flex justify-end space-x-3">
                              {Object.entries(student.socialLinks).map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                  <span className="sr-only">{platform}</span>
                                  {platform === 'linkedin' ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Custom navigation controls */}
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button className="group p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex space-x-2">
              {[0, 1, 2].map((dot) => (
                <button
                  key={dot}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    dot === 0 
                      ? 'w-8 bg-blue-600' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${dot + 1}`}
                />
              ))}
            </div>
            <button className="group p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16 scroll-reveal-scale">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full inline-block mb-4">
              Why Choose SMCBI
            </span>
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Excellence in Education Since 1959</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join a legacy of academic excellence and holistic development that has shaped generations of successful leaders.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: "🏆",
                title: "Academic Excellence",
                description: "Consistently high passing rates in board exams and national assessments",
                stats: "95% passing rate"
              },
              {
                icon: "👨‍🏫",
                title: "Expert Faculty",
                description: "Experienced educators with advanced degrees and industry experience",
                stats: "80% with Master's degrees"
              },
              {
                icon: "🌟",
                title: "Modern Facilities",
                description: "State-of-the-art laboratories, library, and smart classrooms",
                stats: "Recently upgraded"
              },
              {
                icon: "🤝",
                title: "Industry Partnerships",
                description: "Strong connections with leading companies for internships and job placement",
                stats: "50+ partner companies"
              },
              {
                icon: "🌍",
                title: "Global Perspective",
                description: "International exchange programs and global learning opportunities",
                stats: "10+ country partners"
              },
              {
                icon: "💰",
                title: "Affordable Excellence",
                description: "Competitive tuition fees with flexible payment terms and scholarship options",
                stats: "30% receive aid"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="text-blue-600 font-semibold">{feature.stats}</div>
              </div>
            ))}
          </div>

          {/* Success Stories Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#2C3E50] mb-6 text-center">Success Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Juan Dela Cruz",
                  position: "Software Engineer at Google",
                  image: "/img/teacher/1.jpg",
                  quote: "SMCBI provided me with the strong foundation I needed for my tech career."
                },
                {
                  name: "Maria Santos",
                  position: "Chief Financial Officer",
                  image: "/img/teacher/2.jpg",
                  quote: "The business program prepared me for leadership in the financial sector."
                },
                {
                  name: "Pedro Reyes",
                  position: "Award-winning Educator",
                  image: "/img/teacher/2.jpg",
                  quote: "The education program shaped me into the teacher I am today."
                }
              ].map((story, index) => (
                <div key={index} className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-semibold text-[#2C3E50]">{story.name}</h4>
                  <p className="text-blue-600 text-sm mb-2">{story.position}</p>
                  <p className="text-gray-600 italic">"{story.quote}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-white mb-4">Start Your Journey to Excellence</h3>
              <p className="text-white/90 mb-6">Limited slots available for the upcoming academic year</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors duration-300 font-semibold">
                  Apply Now
                </button>
                <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors duration-300">
                  Download Prospectus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Life Showcase */}
      <div className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full inline-block mb-4">
              Campus Life
            </span>
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Experience SMCBI</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover a vibrant campus community where learning goes beyond the classroom
            </p>
          </div>

          {/* Image Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { src: "/img/school/1.jpg", title: "Modern Library" },
              { src: "/img/school/1.jpg", title: "Sports Facilities" },
              { src: "/img/school/1.jpg", title: "Science Labs" },
              { src: "/img/school/1.jpg", title: "Student Cafe" },
              // Add more images as needed
            ].map((image, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl">
                <img 
                  src={image.src} 
                  alt={image.title}
                  className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="font-semibold">{image.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section with Principal's Message */}
      <div className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image Collage */}
            <div className="relative">
              <div className="relative w-full h-[400px]">
                {/* Main Image */}
                <div className="absolute top-0 left-0 w-3/4 h-3/4 rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="/img/event/1.jpg"
                    alt="Principal"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating Image 1 */}
                <div className="absolute bottom-12 right-0 w-1/2 h-1/2 rounded-2xl overflow-hidden shadow-lg transform rotate-6">
                  <img 
                    src="/img/event/1.jpg" 
                    alt="Principal with students"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Image 2 */}
                <div className="absolute top-1/4 right-12 w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white">
                  <img 
                   src="/img/event/1.jpg"
                    alt="Principal portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-blue-50 rounded-full">
                <span className="text-blue-600 text-sm font-semibold">President Message</span>
              </div>
              
              <blockquote className="text-xl text-gray-600 leading-relaxed">
                "At our School, we aim to empower students with the skills, knowledge, and values needed for success in a global context."
              </blockquote>

              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900"> S. Ma. Jocelyn G. Gerarde, RVM</h3>
                  <p className="text-gray-600">School President</p>
                </div>
                <img 
                  src="/img/sign.png" 
                  alt="Principal's Signature"
                  className="h-12 w-auto"
                />
              </div>

              <p className="text-gray-600">
                Our commitment to academic excellence, character development, and innovative learning approaches ensures that every student receives a well-rounded education that prepares them for future success.
              </p>

              <button className="inline-flex items-center space-x-2 px-6 py-3 bg-[#2C3E50] text-white rounded-xl hover:bg-[#1a2634] transition-all duration-300">
                <span>Read Full Message</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Contact Section with modern macOS style */}
      <div id="contact" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" ref={contactRef}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 scroll-reveal">
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full inline-block mb-4">
              Get In Touch
            </span>
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Contact Us</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              {/* Address Card */}
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 scroll-reveal-left group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#1E2B3A] rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2C3E50]">Address</h3>
                    <p className="text-gray-600 text-sm">National Highway, Poblacion, Bansalan, Davao del Sur</p>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 scroll-reveal-left group" style={{ transitionDelay: '0.1s' }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#1E2B3A] rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2C3E50]">E-Mail</h3>
                    <p className="text-gray-600 text-sm">smcbansalan1959@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Office Time Card */}
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 scroll-reveal-left group" style={{ transitionDelay: '0.2s' }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#1E2B3A] rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2C3E50]">Office Time</h3>
                    <p className="text-gray-600 text-sm">Mon - Thu 9:00 am - 4:00 pm</p>
                    <p className="text-gray-600 text-sm">Thu - Mon 10:00 pm - 5:00 pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 scroll-reveal-right">
              <h3 className="text-2xl font-semibold text-[#2C3E50] mb-6">Get In Touch</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-xl"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="E-mail"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-xl"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Subject"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-xl"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Write Your Message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-xl resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full font-inherit text-lg bg-[#2C3E50] hover:bg-[#1a2634] text-white px-4 py-3 rounded-xl flex items-center justify-center border-none overflow-hidden transition-all duration-200 cursor-pointer group"
                >
                  <div className="svg-wrapper-1">
                    <div className="svg-wrapper">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="transform-origin-center transition-transform duration-300 group-hover:translate-x-5 group-hover:rotate-45 group-hover:scale-110"
                      >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path
                          fill="currentColor"
                          d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <span className="block ml-1 transition-all duration-300 group-hover:opacity-0 group-hover:invisible group-hover:translate-x-8">Send Now</span>
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 scroll-reveal group">
            {/* Map Title */}
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="w-8 h-8 bg-[#1E2B3A] rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#2C3E50]">Find Us Here</h3>
            </div>

            {/* Map Container with modern styling */}
            <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-inner">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1980.954028861082!2d125.21324693838893!3d6.781043461752624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f84d334df97ea1%3A0x42ce41692ad5ea27!2sSt.%20Mary's%20College%20of%20Bansalan%2C%20Inc.!5e0!3m2!1sen!2sph!4v1738298565444!5m2!1sen!2sph"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl hover:opacity-95 transition-opacity duration-300"
            ></iframe>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">Live Location</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
     <footer className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-white py-20 relative isolation-auto z-5">


        <div className="container mx-auto px-4 sm:px-6 relative">
          {/* Top Section with Logo and Newsletter */}
          <div className="flex flex-col lg:flex-row justify-between items-center pb-12 border-b border-white/10 mb-12">
            {/* Logo and Tagline */}
            <div className="mb-8 lg:mb-0 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
                <img src="/img/logo1.png" alt="SMCBI Logo" className="h-12 w-auto" />
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    SMCBI
                  </h3>
                  <p className="text-sm text-gray-400">Excellence in Education</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md text-sm">
                Empowering minds, building futures, and fostering excellence through Catholic education since 1959.
              </p>
            </div>

            {/* Newsletter Section */}
            <div className="w-full lg:w-auto">
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
                <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter for updates and news.</p>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-sm text-gray-300 placeholder-gray-500"
                  />
                  <button className="px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors duration-300 text-sm font-semibold">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'About Us', href: '#' },
                  { name: 'Programs', href: '#' },
                  { name: 'Admissions', href: '#' },
                  { name: 'Campus Life', href: '#' },
                  { name: 'News & Events', href: '#' },
                ].map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2 group-hover:bg-white transition-colors duration-300"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Resources
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'Student Portal', href: '#' },
                  { name: 'Library', href: '#' },
                  { name: 'Research', href: '#' },
                  { name: 'Alumni', href: '#' },
                  { name: 'Careers', href: '#' },
                ].map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2 group-hover:bg-white transition-colors duration-300"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Contact Us
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>National Highway, Poblacion, Bansalan, Davao del Sur</span>
                </li>
                <li className="flex items-center space-x-3 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>smcbansalan1959@gmail.com</span>
                </li>
                <li className="flex items-center space-x-3 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+63 (082) 123-4567</span>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Connect With Us
              </h4>
              <div className="flex flex-wrap gap-4">
                {[
                  { name: 'Facebook', icon: 'facebook.png', color: 'bg-[#4267B2]' },
                  { name: 'Twitter', icon: 'twitter.png', color: 'bg-[#1DA1F2]' },
                  { name: 'Instagram', icon: 'instagram.png', color: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]' },
                  { name: 'LinkedIn', icon: 'linkedin.png', color: 'bg-[#0077B5]' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="group relative p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                    aria-label={social.name}
                  >
                    <img
                      src={`/img/${social.icon}`}
                      alt={social.name}
                      className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} St. Mary's College of Bansalan, Inc. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div 
            className="relative w-full max-w-sm mx-auto"
            onClick={e => e.stopPropagation()}
          >
            <div 
              className="relative"
              style={{
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              <button 
                onClick={handleCloseModal}
                className="absolute -right-2 -top-2 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-all duration-300 group z-50"
                aria-label="Close login form"
              >
                <svg 
                  className="w-4 h-4 text-gray-500 group-hover:text-gray-700 group-hover:scale-110 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <Login />
            </div>
          </div>
        </div>
      )}

      {/* Add these keyframe animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideIn {
            from {
              transform: translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .parallax-element {
            transform: translateY(0);
            transition: transform 0.1s ease-out;
            will-change: transform;
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
            
          }

          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 15s ease infinite;
          }

          .animate-bounce-slow {
            animation: bounce 3s infinite;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(-5%); }
            50% { transform: translateY(0); }
          }

          .hero-section {
            font-family: 'Poppins', sans-serif;
          }

          @keyframes slideUp {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .slide-up-animation {
            animation: slideUp 1s ease-out forwards;
          }

          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

          .perspective {
            perspective: 1000px;
          }

          .transform-style-3d {
            transform-style: preserve-3d;
          }

          .backface-hidden {
            backface-visibility: hidden;
          }

          .rotate-y-180 {
            transform: rotateY(180deg);
          }

          @keyframes scale-x {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }

          .animate-scale-x {
            animation: scale-x 0.7s ease-out forwards;
          }

          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }

          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {/* Add the AI Chatbot - Updated positioning */}
      <div className={`fixed bottom-6 right-6 z-50 ${showLoginModal ? 'hidden' : 'block'}`}>
  
      </div>
    </div>
  );
} 
