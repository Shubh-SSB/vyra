import MorphText from "./ui/morph-text";

export default function AboutSection() {
    return (
        <section className="flex justify-center flex-col gap-8 items-center h-screen">
            <h1 className="w-full max-w-7xl text-center text-2xl font-bold text-main uppercase">Why bunko?</h1>
            <div className="text-center leading-snug tracking-tight text-7xl max-w-5xl font-bold text-white uppercase">WE DON'T JUST<span className="mx-2">CONNECT</span>PEOPLE. <br />
                WE CONNECT <span><MorphText words={[
                    "IDEAS", "MEMORIES", "EVERYTHING",
                ]} interval={2500} fontSize="clamp(1.5rem, 7.5vw, 5rem)" subtext="That Matters" /></span>
            </div>
        </section>
    );
}