import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Heart } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com/srinivasan", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border relative">
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <a href="#home" className="text-2xl font-extrabold text-primmary inline-block mb-4 tracking-tight">
              SV
            </a>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Full-stack developer crafting high-performance web & mobile applications with modern technologies.
            </p>
          </div>

          <div>

            
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Connect</h4>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl glass hover:shadow-elevated transition-all"
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            © {new Date().getFullYear()} Srinivasan. Built with{" "}
            <Heart className="h-3.5 w-3.5 text-primary fill-primary" /> and React
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
