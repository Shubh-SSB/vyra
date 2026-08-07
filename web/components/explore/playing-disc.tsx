import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface PlayingDiscProps {
    isPlaying?: boolean;
    className?: string;
}

export const PlayingDisc = ({ isPlaying = true, className }: PlayingDiscProps) => {
    return (
        <DotLottieReact
            src="https://lottie.host/2ca0ad9f-7daf-4616-9782-df6c525ad62b/pO1VslMVpG.lottie"
            loop
            autoplay={isPlaying}
            speed={0.6}
            className={className}
        />
    );
};
