'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';


const Page = () => {
    return (
        <div className="w-screen flex flex-col items-center space-y-40">
            {/* Section 1 */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-screen flex items-center justify-center"
            >
                <div className="w-2/4 flex justify-center">
                    <motion.img 
                        src="vec1.avif" 
                        alt="Start A Conversation" 
                        className="object-cover rounded-lg shadow-lg"
                        whileHover={{ scale: 1.05 }}
                    />
                </div>
                <div className="w-2/4 px-10">
                    <h1 className='text-black font-extrabold text-6xl'>Start A Conversation</h1>
                    <p className='text-gray-700 text-xl mt-3'>Connect with your friends and start a conversation</p>
                    <motion.button 
                        className="bg-[#ff6666] text-white px-6 py-3 rounded-lg shadow-md transition duration-300 hover:bg-gray-900 hover:shadow-lg active:scale-95 mt-5"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Link href='/conversations'>Get Started</Link>
                    </motion.button>
                </div>
            </motion.div>

            {/* Section 2 */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-screen flex items-center justify-center p-5"
            >
                <div className="w-2/4 px-10">
                    <h1 className='text-black font-extrabold text-6xl'>Find Friends Instantly</h1>
                    <p className='text-gray-700 text-xl mt-3'>Add your buddies</p>
                    <motion.button 
                        className="bg-[#eddd2f] text-white px-6 py-3 rounded-lg shadow-md transition duration-300 hover:bg-gray-900 hover:shadow-lg active:scale-95 mt-5"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Link href='/s'><p className='font-bold'>Get Started</p></Link>
                    </motion.button>
                </div>
                <div className="w-2/4 flex justify-center">
                    <motion.img 
                        src="vec3.jpg" 
                        alt="Find Friends Instantly" 
                        className="object-cover rounded-lg shadow-lg"
                        whileHover={{ scale: 1.05 }}
                    />
                </div>
            </motion.div>

            {/* Section 3 */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-screen flex items-center justify-center p-5"
            >
                <div className="w-2/4 flex justify-center">
                    <motion.img 
                        src="vec5.jpg" 
                        alt="Custom AI Dashboard" 
                        className="object-cover rounded-lg shadow-lg"
                        whileHover={{ scale: 1.05 }}
                    />
                </div>
                <div className="w-2/4 px-10">
                    <h1 className='text-black font-extrabold text-6xl'>Custom AI Dashboard</h1>
                    <p className='text-gray-700 text-xl mt-3'>Get personalized insights using our AI features</p>
                    <motion.button 
                        className="bg-[#a3297a] text-white px-6 py-3 rounded-lg shadow-md transition duration-300 hover:bg-gray-900 hover:shadow-lg active:scale-95 mt-5"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Link href='#'><p className='font-bold'>Get Started</p></Link>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default Page;
