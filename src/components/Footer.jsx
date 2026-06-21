import { Github, Info } from 'lucide-react';

/**
 * Footer component with project disclaimers and links.
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-appBorder py-6 mt-12 bg-slate-950/20">
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-appText-muted">
        {/* Network Warning */}
        <div className="flex items-center gap-2 max-w-md">
          <Info className="w-4 h-4 text-accent shrink-0" />
          <p className="leading-relaxed">
            <span className="font-semibold text-white">Disclaimer:</span> RentStar operates strictly on the <span className="text-accent">Stellar Testnet</span> network. Do not attempt to send real assets to addresses here.
          </p>
        </div>

        {/* Links / Info */}
        <div className="flex items-center space-x-4">
          <span>&copy; {new Date().getFullYear()} RentStar</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
            title="GitHub Repository"
            aria-label="View RentStar on GitHub"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
