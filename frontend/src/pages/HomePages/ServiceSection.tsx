import { useEffect, useRef, useState } from "react";
import { FaLock, FaUsers, FaBalanceScale } from "react-icons/fa";

const ServiceSection = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const services = [
    {
      title: "Secure Digital Voting",
      desc: "A reliable online voting system that allows organizations to conduct elections and decision-making securely, ensuring vote privacy and protection against unauthorized access.",
      bgFrom: "from-blue-50",
      bgTo: "to-blue-100",
      iconBg: "bg-blue-600",
      icon: <FaLock size={28} className="text-white" />,
    },
    {
      title: "Member Engagement & Participation",
      desc: "Designed to increase participation across organizations by providing members with a simple, accessible, and transparent voting experience from anywhere, at any time.",
      bgFrom: "from-purple-50",
      bgTo: "to-purple-100",
      iconBg: "bg-purple-600",
      icon: <FaUsers size={28} className="text-white" />,
    },
    {
      title: "Fair & Transparent Elections",
      desc: "Ensures a fair election process with automated vote counting, real-time result visibility, and accountability within the organization.",
      bgFrom: "from-green-50",
      bgTo: "to-green-100",
      iconBg: "bg-green-600",
      icon: <FaBalanceScale size={28} className="text-white" />,
    },
  ];

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-15 bg-gray-50 px-6 md:px-12"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900">Our Services</h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto text-lg">
          Comprehensive voting solutions designed to make organizational
          elections secure, transparent, and inclusive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={service.title}
            className={`${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            } transition-all duration-700 ease-out transform hover:scale-105 rounded-2xl shadow-lg bg-gradient-to-br ${
              service.bgFrom
            } ${service.bgTo} p-8`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            <div
              className={`w-16 h-16 ${service.iconBg} rounded-full flex items-center justify-center mb-6`}
            >
              {service.icon}
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {service.title}
            </h3>

            <p className="text-gray-700 text-sm md:text-base">{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceSection;
