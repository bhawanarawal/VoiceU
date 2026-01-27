import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-tr from-blue-700 via-blue-900 to-black text-gray-100">
      <div className="w-full py-10 px-4 md:px-10 flex flex-col md:flex-row justify-between items-start gap-10 max-w-full">
        <div className="flex flex-col gap-4 md:w-1/3">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold">
              <span className="text-blue-200">Voice</span>
              <span className="text-white">U</span>
            </h2>
          </div>
          <p className="text-gray-200 text-sm leading-6">
            VoiceU connects you to the heart of every election, putting power in
            your hands. Cast your vote confidently and track results in real
            time. A smarter, fairer way to make your voice count.
          </p>
          <div className="flex gap-4 mt-2 text-gray-100">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-blue-100 transition-transform transform hover:scale-110"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-blue-100 transition-transform transform hover:scale-110"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-blue-100 transition-transform transform hover:scale-110"
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-blue-100 transition-transform transform hover:scale-110"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-10 md:w-2/3">
          <div className="md:w-1/3">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-100 text-sm">
              <li>
                <a href="/" className="hover:text-blue-100 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/elections"
                  className="hover:text-blue-100 transition-colors"
                >
                  Elections
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-blue-100 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-blue-100 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="md:w-1/3">
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-gray-100 text-sm">
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-blue-200" /> support@voiceu.com
              </li>
              <li className="flex items-center gap-2">
                <FaPhone className="text-blue-200" /> +977 9800000000
              </li>
            </ul>
          </div>

          <div className="md:w-1/3">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Stay Updated
            </h3>
            <p className="text-gray-200 text-sm mb-3">
              Subscribe to get the latest updates on elections and results.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 backdrop-blur-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-300 rounded hover:bg-blue-400 transition-colors text-white font-semibold shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 py-5 text-center text-sm text-gray-200 flex flex-col md:flex-row justify-center items-center gap-2">
        <span>@ 2026 VoiceU. All rights reserved.</span>
        <span className="hidden md:inline">| Made with ❤️</span>
      </div>
    </footer>
  );
};

export default Footer;
