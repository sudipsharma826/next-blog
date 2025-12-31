import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="w-full max-w-4xl flex flex-col items-center text-center gap-8 py-12 mx-auto">
      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
        <Image src="/banner%20iamge.jpg" alt="Banner" fill className="object-cover" priority />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Build, Learn & Scale with <span className="text-text-primary dark:text-text-primary-dark">TechKnows</span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Explore in-depth tech articles, programming guides, and creative ideas. TechKnows is your go-to platform for learning technology, coding tutorials, and tech insights from the community.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button size="lg" className="bg-primary dark:bg-primary-dark text-white hover:bg-primary/90 dark:hover:bg-primary-dark/90">Get Started</Button>
        <Button variant="outline" size="lg">Learn More</Button>
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-6">
        <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">Technology</span>
        <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">Programming</span>
        <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">Sharing Ideas</span>
        <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">Feedback and Networking</span>
      </div>
    </section>
  );
}
