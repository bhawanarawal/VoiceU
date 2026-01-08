const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand / About */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">
            VoiceU
          </h2>
          <p className="text-sm">
            A secure and transparent online voting system designed to ensure
            fair elections through modern technology.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/elections" className="hover:text-white">Elections</a></li>
            <li><a href="/vote" className="hover:text-white">Vote Now</a></li>
            <li><a href="/results" className="hover:text-white">Results</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Support
          </h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/help" className="hover:text-white">Help Center</a></li>
            <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
            <li><a href="/faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Legal
          </h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-white">Terms & Conditions</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-400">
        © 2026 VoteSecure. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

