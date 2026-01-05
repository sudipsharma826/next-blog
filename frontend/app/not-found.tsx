import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HiHome } from 'react-icons/hi';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background dark:bg-background-dark transition-colors">
      <div className="w-full max-w-lg text-center">
        {/* Modern 404 Animation */}
        <div className="mb-8 flex justify-center">
          <Image
            src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
            alt="404 animation"
            width={320}
            height={192}
            className="w-full max-w-xs sm:max-w-sm md:max-w-md h-48 sm:h-56 md:h-64 object-cover rounded-lg shadow-lg"
            priority
          />
        </div>

        {/* Error Text */}
        <h1 className="mb-4 text-6xl sm:text-7xl font-extrabold text-primary dark:text-primary-dark">
          404
        </h1>
        <p className="mb-4 text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300">
          Page Not Found
        </p>
        <p className="mb-8 text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Oops! The page you&#39;re looking for seems to have wandered off into the digital wilderness.
        </p>

        {/* Home Button */}
        <div className="flex justify-center">
          <Link href="/" className="w-full">
            <Button
              size="lg"
              className="w-full bg-primary dark:bg-primary-dark text-white hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition"
            >
              <HiHome className="mr-2 h-5 w-5" />
              Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
