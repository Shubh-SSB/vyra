import { MusicPlayer } from "@/components/ui/music-player";

export default function test() {
    const myTracks = [
        {
            title: "Song Title",
            artist: "Artist Name",
            src: "/music/song.mp3", // Must be same-origin or CORS-enabled
            artwork: "/images/cover.jpg" // Optional
        }
    ];

    return (
        <div className="flex h-screen w-screen items-center justify-center ">
            <MusicPlayer tracks={myTracks} />
        </div>
    );
}
