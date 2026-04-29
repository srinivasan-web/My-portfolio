import { Suspense, lazy, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowDown,
  Github,
  Linkedin,
  Mail,
  Download,
  Eye,
  Code2,
  Smartphone,
  Globe,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/profile-photo.jpg";

const FloatingShapes = lazy(() =>
  import("@/components/three/FloatingShapes").then((m) => ({
    default: m.FloatingShapes,
  })),
);

const socialLinks = [
  {
    icon: Github,
    href: "https://github.com/srinivasan-web",
    label: "GitHub",
    color: "from-[hsl(221,83%,53%)] to-[hsl(250,95%,64%)]",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/srinivasan-m",
    label: "LinkedIn",
    color: "from-[hsl(199,89%,48%)] to-[hsl(221,83%,53%)]",
  },
  {
    icon: Mail,
    href: "mailto:udcu23s@gmail.com",
    label: "Email",
    color: "from-[hsl(280,87%,60%)] to-[hsl(330,80%,60%)]",
  },
];

const roles = [
  "Full-Stack Developer",
  "React Specialist",
  "Software Developer",
  "Full Stack with ai Integration",
  "UI/UX Enthusiast",
  "Cloud Architect",
  "Backend Developer",
];

const techBadges = [
  { icon: Code2, label: "React / Next.js" },
  { icon: Smartphone, label: "React Native / Flutter" },
  { icon: Globe, label: "Node.js / Python" },
];

// Animated counter component
const AnimatedCounter = ({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
};

// Typing animation hook
const useTypingAnimation = (
  words: string[],
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 2000,
) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && currentText === word) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(
        () => {
          setCurrentText(
            isDeleting
              ? word.substring(0, currentText.length - 1)
              : word.substring(0, currentText.length + 1),
          );
        },
        isDeleting ? deletingSpeed : typingSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [
    currentText,
    isDeleting,
    currentWordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  ]);

  return currentText;
};

export const Hero = () => {
  const typedRole = useTypingAnimation(roles);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero"
      onMouseMove={handleMouseMove}
    >
      {/* Mesh gradient background */}
      <div className="absolute inset-0 gradient-mesh z-0" />

      {/* 3D Background */}
      <div className="absolute inset-0 z-[1]">
        <Suspense fallback={<div className="absolute inset-0" />}>
          <FloatingShapes />
        </Suspense>
      </div>

      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[150px] z-[2]"
      />
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 20, -30, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-info/15 blur-[150px] z-[2]"
      />
      <motion.div
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(280,87%,60%)]/8 blur-[180px] z-[2]"
      />

      {/* Animated particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 relative z-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 text-center lg:text-left order-2 lg:order-1"
          >
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-6"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-muted-foreground">
                Available for freelance work
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 tracking-tight leading-[1.1]"
            >
              Hi, I'm{" "}
              <span className="text-primary relative">
                Srinivasan
                <motion.span
                  className="absolute -bottom-1 left-0 h-1 rounded-full gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                />
              </span>
            </motion.h1>

            {/* Typing Role */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center lg:justify-start gap-2 mb-6"
            >
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">
                {typedRole}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-[3px] h-6 bg-primary ml-1 align-middle"
                />
              </span>
            </motion.div>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Passionate about building high-performance, scalable web & mobile
              applications. I transform complex business requirements into
              elegant, user-centric digital solutions using modern technologies
              like React ,Node.js, Express.js, and cloud services.
            </motion.p>

            {/* Tech Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8"
            >
              {techBadges.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-default"
                >
                  <badge.icon className="h-3.5 w-3.5 text-primary" />
                  {badge.label}
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto gradient-primary text-primary-foreground border-0 shadow-glow hover:shadow-elevated transition-all h-12 px-8 text-base font-semibold group"
                  onClick={() =>
                    document
                      .getElementById("projects")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Eye className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  View My Work
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-border hover:border-primary/50 hover:bg-primary/5 h-12 px-8 text-base font-semibold group transition-all"
                >
                  <Download
                    className="mr-2 h-5 w-5 group-hover:animate-bounce "
                    href="/"
                  />
                  Download CV
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="flex gap-3 justify-center lg:justify-start"
            >
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  whileHover={{ scale: 1.15, y: -4, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className={`p-3 rounded-xl glass hover:shadow-glow transition-all relative overflow-hidden group`}
                  aria-label={link.label}
                >
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${link.color}`}
                  />
                  <link.icon className="h-5 w-5 text-foreground relative z-10" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-shrink-0 order-1 lg:order-2"
            style={{ perspective: 1000 }}
          >
            <motion.div className="relative" style={{ rotateX, rotateY }}>
              {/* Multi-layer glow */}
              <div className="absolute inset-0 rounded-full gradient-primary blur-[100px] opacity-15 scale-150" />
              <div className="absolute inset-0 rounded-full bg-info/10 blur-[80px] scale-125 animate-pulse-subtle" />

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                {/* Profile image */}
                <div className="w-70 h-70 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-[400px] xl:h-[500px] rounded-full overflow-hidden border-2 border-primary/30 shadow-elevated ring-4 ring-primary/10 relative group">
                  <img
                    src={profilePhoto}
                    alt="Srinivasan - Full Stack Developer"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                </div>

                {/* Orbiting rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-[-10px] rounded-full border border-dashed border-primary/20"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-[-24px] rounded-full border border-dashed border-info/15"
                />

                {/* Floating tech icons */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-[-30px]"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg glass shadow-glow"
                  >
                    <Code2 className="h-4 w-4 text-primary" />
                  </motion.div>
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-[-30px]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 p-2 rounded-lg glass shadow-glow"
                  >
                    <Globe className="h-4 w-4 text-info" />
                  </motion.div>
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-[-30px]"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 p-2 rounded-lg glass shadow-glow"
                  >
                    <Smartphone className="h-4 w-4 text-[hsl(280,87%,60%)]" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <motion.a
            href="#about"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="text-xs font-medium tracking-widest uppercase group-hover:text-gradient transition-all">
              Scroll
            </span>
            <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50 flex justify-center pt-1.5 transition-colors">
              <motion.div
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1.5 rounded-full bg-primary"
              />
            </div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
