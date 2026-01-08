import { useEffect, useRef, useState } from "react";
import {FaLock, FaUsers, FaBalanceScale} from "react-icons/fa";

const ServiceSection = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // run only once
        }
      },
      { threshold: 0.2 } // 20% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="h-screen justify-center py-16 bg-black/50 p-8 rounded-xl shadow-lg"
    >
      <div className="mb-5 text-center">
        <h2 className="text-3xl text-white font-bold">Our Services</h2>
        <p className="text-xl text-gray-300">
          Comprehensive voting solution for the college elections.
        </p>
      </div>

      {/* Top 3 Feature Cards */}
      <div className="grid md:grid-cols-3 h-70 p-3 gap-8">
        {[
          {
            title: "Secure Voting",
            desc: "End-to-end encrypted voting system ensuring your vote remains private and secure with blockchain verification.",
            bgFrom: "from-blue-50",
            bgTo: "to-blue-100",
            iconBg: "bg-blue-600",
            icon: <FaLock size={28} className="text-white" />,
          },
          {
            title: "Student Engagement",
            desc: "Real-time voting statistics, candidate profiles, and interactive forums to keep students engaged and informed.",
            bgFrom: "from-purple-50",
            bgTo: "to-purple-100",
            iconBg: "bg-purple-600",
            icon: <FaUsers size={28} className="text-white" />,
          },
          {
            title: "Fair Elections",
            desc: "Transparent process with real-time auditing, automated counting, and instant results to ensure complete fairness.",
            bgFrom: "from-green-50",
            bgTo: "to-green-100",
            iconBg: "bg-green-600",
             icon: <FaBalanceScale size={28} className="text-white" />,
          },
        ].map((service, index) => (
          <div
            key={service.title}
            className={`${
              visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            } transition-all duration-700 ease-out transform hover:scale-105 bg-gradient-to-br ${service.bgFrom} ${service.bgTo} p-8 rounded-xl shadow-lg`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            <div
              className={`w-16 h-16 ${service.iconBg} rounded-full flex items-center justify-center mb-4`}
            >
              {service.icon}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {service.title}
            </h3>
            <p className="text-gray-700">{service.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom 2 Cards */}
      <div className="mt-16 grid p-4 md:grid-cols-2 gap-8">
        {[
          {
            title: "Digital Ballot Management",
            desc: "Easily create, manage, and distribute digital ballots for any election type.",
          },
          {
            title: "24/7 Support",
            desc: "Round-the-clock technical support for students and election administrators.",
          },
        ].map((service, index) => (
          <div
            key={service.title}
            className={`${
              visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            } transition-all duration-700 ease-out  transform hover:scale-105 bg-gray-50 p-6 rounded-lg`}
            style={{ transitionDelay: `${(index + 3) * 200}ms` }}
          >
            <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {service.title}
            </h4>
            <p className="text-gray-700">{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceSection;
