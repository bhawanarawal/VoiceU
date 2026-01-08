import React from "react";
import map from "./../../assets/map.jpg";


const Contact: React.FC = () => {
  return (
        
    <section id="contact" className="relative min-h-screen bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-10">

        {/* Left Section - Contact Form */}
        <div className="md:w-1/2 w-full bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Send Us a Message</h2>
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Subject"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Message"
              rows={5}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Right Section - Info Card + Image */}
        <div className="md:w-1/2 w-full flex flex-col gap-6">
          
          {/* Organization Info Card */}
          <div className="bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col gap-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Contact Information</h3>
            <div className="flex items-start gap-4">
              <span className="text-blue-600 text-2xl">📧</span>
              <div>
                <h4 className="font-semibold text-gray-900">Email</h4>
                <p className="text-gray-700">support@voiceu.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-blue-600 text-2xl">⏰</span>
              <div>
                <h4 className="font-semibold text-gray-900">Office Hours</h4>
                <p className="text-gray-700">Mon - Fri: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-blue-600 text-2xl">📍</span>
              <div>
                <h4 className="font-semibold text-gray-900">Location</h4>
                <p className="text-gray-700">123 College Road, City, Country</p>
              </div>
            </div>
          </div>

          {/* Bottom Image */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={map}
              alt="Contact"
              className="w-full h-64 object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;