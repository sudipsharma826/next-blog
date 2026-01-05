// frontend/components/Footer.tsx

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminData } from '@/lib/adminData';
import {
  FaInstagram,
  FaGithub,
  FaFacebook,
  FaLinkedinIn,
} from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border dark:border-border-dark bg-footer dark:bg-footer-dark py-10 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-lg">TechKnows</span>
          </div>
          <p className="text-muted-foreground dark:text-text-muted-dark max-w-xs mb-4">
            Explore in-depth tech articles, programming guides, and creative ideas. TechKnows is
            your go-to platform for learning technology, coding tutorials, and tech insights from
            the community.
          </p>
          <div className="flex gap-3 text-xl">
            <a
              href={`${adminData.instaGramUrl}`}
              aria-label="Instagram"
              className="hover:text-primary dark:hover:text-primary-dark"
            >
              <FaInstagram />
            </a>
            <a
              href={`${adminData.faceBookUrl}`}
              aria-label="Facebook"
              className="hover:text-primary dark:hover:text-primary-dark"
            >
              <FaFacebook />
            </a>
            <a
              href={`${adminData.gitHubUrl}`}
              aria-label="GitHub"
              className="hover:text-primary dark:hover:text-primary-dark"
            >
              <FaGithub />
            </a>
            <a
              href={`${adminData.linkedInUrl}`}
              aria-label="LinkedIn"
              className="hover:text-primary dark:hover:text-primary-dark"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-8">
          <div>
            <h4 className="font-semibold mb-2">Company</h4>
            <ul className="space-y-1 text-muted-foreground dark:text-text-muted-dark">
              <li>
                <Link href="/">Home</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Newsletter</h4>
            <form className="flex gap-2">
              <Input type="email" placeholder="Enter your email" className="max-w-xs" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </div>
      <div className="container mx-auto text-center text-xs text-muted-foreground dark:text-text-muted-dark mt-8">
        © {new Date().getFullYear()} TechKnows. All rights reserved.
      </div>
    </footer>
  );
}
