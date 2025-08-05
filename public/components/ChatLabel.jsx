import { assets } from '@/assets/assets';
import React, { useState } from 'react';
import Image from 'next/image';

const ChatLabel = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className='flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm cursor-pointer'>
            <p className='truncate'>Chat Name Here</p>
            <div
                className='relative flex items-center justify-center h-6 w-6 aspect-square hover:bg-black/80 rounded-lg'
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
            >
                <Image src={assets.three_dots} alt="" className='w-4'/>
                {menuOpen && (
                    <div className='absolute -right-36 top-6 bg-gray-700 rounded-xl w-max p-2 z-10'>
                        <div className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg'>
                            <Image src={assets.pencil_icon} alt="" className='w-4'/>
                            <p>Rename</p>
                        </div>
                        <div className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg'>
                            <Image src={assets.delete_icon} alt="" className='w-4'/>
                            <p>Delete</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatLabel;
