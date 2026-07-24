import { Link, useLocation } from "react-router-dom";
import { Github } from "lucide-react";

const NAV_LINKS = [
  { to: "/features", label: "Features" },
  { to: "/how-it-works", label: "How it works" },
];

const GITHUB_URL = "https://github.com/SheppCrafd/vaea";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <div className="w-8 h-8 rounded-full border border-border shadow-sm overflow-hidden">
        <img src="/android-chrome-512x512.png" alt="" className="w-full h-full object-cover" />
      </div>
      <span className="font-terminal text-base font-bold tracking-tight">Vaea</span>
    </Link>
  );
}

function NavBar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm transition-colors ${
                  location.pathname === to
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
          >
            Log in
          </Link>
          <Link
            to="/login"
            className="text-sm px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-[1.5fr_1fr_1fr] gap-10">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              A personal workspace for organizing work, with Vaea Chat — an AI that acts on it, not just talks about it. Local-first — your data stays on your device.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Product</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Resources</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-3.5 h-3.5" />
                  Source on GitHub
                </a>
              </li>
              <li><Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign in</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground">
          Vaea. Local-first, always.
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
