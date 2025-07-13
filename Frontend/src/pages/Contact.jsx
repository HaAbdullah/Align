import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://formspree.io/f/mzborobd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        console.log("Form submitted successfully");
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            email: "",
            message: "",
          });
        }, 3000);
      } else {
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  return (
    <div
      className="pt-24 pb-16 bg-gray-900 min-h-screen font-inter"
      id="contact"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text mb-4">
            Questions? Feedback? Just Say Hi.
          </h1>
          <p className="text-xl text-gray-200">We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Left Side - Contact Info */}
          <div className="relative group">
            {/* Gradient border background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-0 transition-opacity duration-300"></div>

            {/* Main content */}
            <div className="relative bg-gray-800 border-2 border-gray-600 rounded-xl p-8 transition-all duration-300 m-0.5">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <span className="text-3xl">🛠</span>
                  </div>
                  <p className="text-lg text-gray-200">
                    Need help using Align?
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <span className="text-3xl">💬</span>
                  </div>
                  <p className="text-lg text-gray-200">
                    Have feedback or ideas?
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <p className="text-lg text-gray-200">Want to collaborate?</p>
                </div>
              </div>

              <div className="mt-10 text-center">
                <p className="text-lg mb-2 text-gray-200">
                  Reach us anytime at:
                </p>
                <a
                  href="mailto:abdullah.hasanjee@gmail.com"
                  className="text-xl font-semibold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text hover:underline"
                >
                  📧 abdullah.hasanjee@gmail.com
                </a>
                <p className="mt-4 text-gray-400">
                  We usually respond within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="relative group">
            {/* Gradient border background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-0 transition-opacity duration-300"></div>

            {/* Main content */}
            <div className="relative bg-gray-800 border-2 border-gray-600 rounded-xl p-8 transition-all duration-300 m-0.5">
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text mb-6 text-center">
                Send Us a Message
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-gray-300 font-medium mb-2"
                  >
                    Your Email
                  </label>
                  {/* Email Input with Gradient Border */}
                  <div className="relative">
                    <div
                      className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                        isEmailFocused ? "opacity-100" : "opacity-0"
                      }`}
                    ></div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      className={`relative w-full px-4 py-3 border-2 ${
                        isEmailFocused
                          ? "border-transparent"
                          : "border-gray-600"
                      } rounded-lg bg-gray-700 text-gray-100 placeholder-gray-500 outline-none transition-all duration-300 m-0.5`}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-gray-300 font-medium mb-2"
                  >
                    Your Message
                  </label>
                  {/* Message Input with Gradient Border */}
                  <div className="relative">
                    <div
                      className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                        isMessageFocused ? "opacity-100" : "opacity-0"
                      }`}
                    ></div>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setIsMessageFocused(true)}
                      onBlur={() => setIsMessageFocused(false)}
                      rows="5"
                      className={`relative w-full px-4 py-3 border-2 ${
                        isMessageFocused
                          ? "border-transparent"
                          : "border-gray-600"
                      } rounded-lg bg-gray-700 text-gray-100 placeholder-gray-500 outline-none transition-all duration-300 resize-none m-0.5`}
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    Send
                  </button>
                </div>
              </form>

              {submitted && (
                <div className="mt-4 p-3 bg-emerald-900/50 border border-emerald-500 text-emerald-200 rounded-lg text-center">
                  Message submitted! We'll get back to you soon.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
