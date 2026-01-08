
import React from "react";
import BackgroundImage from "./../../assets/HomeBackground.jpg";
import ProgressCard from "./ProgressCard";

const HomeSection: React.FC = () => {
  const features = [
    { title: "Total Voters", percentage: 70, description: "Registered voters" },
    { title: "Votes Cast", percentage: 55, description: "Votes completed" },
    { title: "Election Progress", percentage: 40, description: "Ongoing elections" },
  ];
  return (
    <section id="home" className="h-screen flex-row bg-blue-100"  >
   
   <div className=" flex md:flex-row flex-col px-8 bg-center">
      <div className="flex-1  text-2xl max-w-lg mt-15 " 
       style={{
    animation: "fadeInUp 1s ease-out forwards",
  }}>
      <style>
    {`
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}
  </style>

      <div className="text-black text-6xl  mt-2 font-bold p-4  ">
        <h1>Your Voice,</h1>
        <span className="text-blue-500"><h1>Your Vote</h1></span>
        
      </div>
      <p>Empowering students to shape the future <br/> of our college throughsecure,<br/> transparent and  accessible digital voting.</p>
      <button className="px-6 py-2 bg-blue-500 mt-3 text-white font-semibold rounded hover:bg-blue-600 transition-colors duration-300 ">Get started</button>
     
      </div>    
       <div className="flex-1 flex justify-end mt-8 " >
        <img src={BackgroundImage} className="max-w-xl  h-auto object-contain rounded-2xl self-start"></img>
      </div>
      </div>
      <div className=" h-screen ml-2 mt-3 flex md:flex-row flex-col ">
         <div className="container mx-auto h-55 grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <ProgressCard
            key={i}
            title={f.title}
            percentage={f.percentage}
            description={f.description}
          />
        ))}
      </div>

      </div>
    </section>
  );
};

export default HomeSection;