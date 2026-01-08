const Nav = () => {
  return (
    <header className="fixed top-0 w-full bg-white shadow z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          VoiceU
        </h1>

        <ul className="hidden md:flex gap-8 font-medium">
          <li><a href="#home" className="hover:text-blue-600">Home</a></li>
          <li><a href="#services" className="hover:text-blue-600">Services</a></li>
          <li><a href="#elections" className="hover:text-blue-600">Elections</a></li>
          <li><a href="#about" className="hover:text-blue-600">About</a></li>
          <li><a href="#contact" className="hover:text-blue-600">Contact</a></li>
          <li><button className="bg-blue-600 text-white hover:bg-blue-700 rounded-md">Login</button></li>
        </ul>
      </div>
    </header>
  );
};

export default Nav;
