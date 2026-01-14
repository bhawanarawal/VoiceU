import React from "react";

const Contact: React.FC = () => {
  return (
    <section id="contact" className="relative w-full bg-gray-100 py-16">
      {/* Contact Info Boxes */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6 mb-12">
        {/* Info 1 */}
        <div className="flex-1 bg-white/20 backdrop-blur-md  p-6 text-center shadow-lg">
          <i className="fa fa-th fa-3x text-blue-600 mb-4"></i>
          <h3 className="text-xl font-bold mb-2">Get In Touch</h3>
          <p>
            <abbr title="Phone">P:</abbr> 123456789
          </p>
          <p>
            E:{" "}
            <a href="mailto:email@email.com" className="text-blue-600">
              email@email.com
            </a>
          </p>
        </div>

        {/* Info 2 */}
        <div className="flex-1 bg-white/20 backdrop-blur-md p-6 text-center shadow-lg">
          <i className="fa fa-map-marker fa-3x text-blue-600 mb-4"></i>
          <h3 className="text-xl font-bold mb-2">Our Location</h3>
          <p>Kathmandu, Nepal</p>
        </div>

        {/* Info 3 */}
        <div className="flex-1 bg-white/20 backdrop-blur-md  p-6 text-center shadow-lg">
          <i className="fa fa-book fa-3x text-blue-600 mb-4"></i>
          <h3 className="text-xl font-bold mb-2">24x7 Support</h3>
          <p>Call Us: 1234 567 890</p>
        </div>
      </div>

      {/* Map + Contact Form */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8">
        {/* Left - Map */}
        <div className="md:w-1/2 w-full overflow-hidden shadow-lg h-[700px]">
          <iframe
            title="VoiceU Location"
            src="https://www.google.com/maps/embed/v1/place?q=Nepal+kathmandu&key=AIzaSyBSFRN6WWGYwmFi498qXXsD2UwkbmD74v4"
            className="w-full h-full border-0"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        {/* Right - Contact Form */}
        <div className="md:w-1/2 w-full bg-white/20 backdrop-blur-md p-8  shadow-lg h-[700px] flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-gray-600 mb-6 text-center">
            Get In Touch With Us
          </h2>
          <form className="flex flex-col gap-4">
            <label className="text-gray-700 font-medium">Name</label>
            <input
              type="text"
              aria-label="Name"
              placeholder="Enter Your Name"
              className="p-3  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-gray-700 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              className="p-3  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-gray-700 font-medium">Subject</label>
            <input
              type="text"
              placeholder="Subject"
              className="p-3  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-gray-700 font-medium">Message</label>
            <textarea
              placeholder="Message"
              rows={5}
              className="p-3  border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            ></textarea>
            <button
              type="submit"
              className="mt-2 w-67 bg-gradient-to-r bg-blue-500 text-white font-semibold py-3 hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
