import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

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
    <div className="pt-24 pb-16 transition-colors" id="contact">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text mb-4 transition-colors">
            Questions? Feedback? Just Say Hi.
          </h1>
          <p className="text-xl text-gray-900 dark:text-gray-200 transition-colors">
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <span className="text-3xl">🛠</span>
                </div>
                <p className="text-lg text-gray-900 dark:text-gray-200 transition-colors">
                  Need help using JobFit?
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-lg text-gray-900 dark:text-gray-200 transition-colors">
                  Have feedback or ideas?
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <p className="text-lg text-gray-900 dark:text-gray-200 transition-colors">
                  Want to collaborate?
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-lg mb-2 text-gray-900 dark:text-gray-200 transition-colors">
                Reach us anytime at:
              </p>
              <a
                href="mailto:abdullah.hasanjee@gmail.com"
                className="text-xl font-semibold text-green-800 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text hover:underline transition-colors"
              >
                📧 hello@jobfit.ai
              </a>
              <p className="mt-4 text-gray-600 dark:text-gray-400 transition-colors">
                We usually respond within 24 hours.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors">
            <h2 className="text-2xl font-bold text-green-800 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text mb-6 text-center transition-colors">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors"
                >
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-800 dark:focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-800 dark:focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                  placeholder="How can we help you?"
                  required
                ></textarea>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-green-800 dark:bg-gradient-to-r dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition-colors"
                >
                  SUBMIT
                </button>
              </div>
            </form>

            {submitted && (
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center transition-colors">
                Message submitted! We'll get back to you soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
