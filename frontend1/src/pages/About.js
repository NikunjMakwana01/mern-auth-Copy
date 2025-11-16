import React from 'react';
import { FaUsers} from 'react-icons/fa';

const About = () => {
  const teamMembers = [
    {
      name: 'Nikunj Makwana',
      // role: 'Backend Developer',
      // responsibility: 'Maintains backend infrastructure, API development, and server-side logic',
      // icon: <FaServer />,
      // color: 'blue',
      // description: 'Specialized in Node.js, Express.js, and MongoDB with expertise in building scalable and secure backend systems.'
    },
    {
      name: 'Priyansh Modi',
      // role: 'Frontend Developer',
      // responsibility: 'Maintains frontend interface, user experience, and responsive design',
      // icon: <FaCode />,
      // color: 'green',
      // description: 'Expert in React.js, modern UI/UX design, and creating intuitive user interfaces with Tailwind CSS.'
    },
    {
      name: 'Tirth Patel',
      // role: 'Documentation Specialist',
      // responsibility: 'Handles project documentation, user guides, and technical writing',
      // icon: <FaBook />,
      // color: 'purple',
      // description: 'Focused on creating comprehensive documentation, user manuals, and maintaining project knowledge base.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="text-orange-600">DigiVote</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A secure digital voting platform built with cutting-edge technology to ensure transparent, 
            secure, and accessible voting for all citizens. This project is the result of collaborative 
            effort from our dedicated team of three developers.
          </p>
        </div>

        {/* Project Description */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6">About This Project</h2>
          <div className="space-y-4 text-lg">
            <p>
              The DigiVote App is a comprehensive digital voting platform designed to modernize the electoral process. 
              Built with security and transparency as top priorities, this application ensures that every vote counts 
              while maintaining the highest standards of data protection.
            </p>
            <p>
              Key features include secure user authentication, real-time voting, encrypted data transmission, 
              and comprehensive audit trails. The platform is designed to be accessible to all citizens, 
              regardless of their technical expertise.
            </p>
            <p>
              This project demonstrates advanced full-stack development skills, including secure API design, 
              real-time data handling, and responsive user interface development. It showcases the power of 
              collaborative development and how diverse skill sets can come together to create innovative solutions.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
              <FaUsers className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We are a collaborative team of three passionate developers, each bringing unique expertise 
              to create this comprehensive digital voting platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-300">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-${member.color}-100 dark:bg-${member.color}-900 rounded-full mb-4`}>
                    <div className={`text-${member.color}-600 text-2xl`}>
                      {member.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className={`text-${member.color}-600 font-semibold mb-2`}>
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {member.responsibility}
                  </p>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default About;
