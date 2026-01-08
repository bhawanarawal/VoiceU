const Overlay = () => {
  return (
    <section className="relative py-20">
      {/* Dark transparent overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">

          {/* Elections */}
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 text-white shadow-lg">
            <h2 className="text-4xl font-bold">32+</h2>
            <p className="mt-2 uppercase tracking-wide text-sm">
              Elections Conducted
            </p>
          </div>

          {/* Users */}
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 text-white shadow-lg">
            <h2 className="text-4xl font-bold">4,500+</h2>
            <p className="mt-2 uppercase tracking-wide text-sm">
              Registered Users
            </p>
          </div>

          {/* Candidates */}
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 text-white shadow-lg">
            <h2 className="text-4xl font-bold">210+</h2>
            <p className="mt-2 uppercase tracking-wide text-sm">
              Candidates Associated
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Overlay;
