import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Github,
  ArrowRight,
  X,
  Smartphone,
  Globe,
  Layers,
} from "lucide-react";
import multiple from "../../assets/multiple.png";
import Ecommerce from "../../assets/Ecommerce.png";
import QuizGenerator from "../../assets/QuizGenerator.png";
import phone from "../../assets/phone.png";
import food from "../../assets/food.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const categories = ["All", "Web App", "Mobile", "UI/UX", "3D"];

const projects = [
  {
    id: 1,
    title: "E-COMMERCE WEB APPLICATION",
    description:
      "Built a full-stack e-commerce platform using the MERN stack with secure authentication and role-based access control.",
    fullDescription:
      "FinTrack Pro is a full-featured financial management platform that helps users take control of their money. Features include automated expense categorization using AI, customizable budgets with alerts, investment tracking with real-time market data, and detailed financial reports. Built with a focus on security and user privacy.",
    category: "Web App",
    image: Ecommerce,
    tags: ["React", "Node.js", "PostgreSQL", "Chart.js"],
    github: "https://github.com",
    live: "https://grand-mart-forge.lovable.app",
    features: [
      "Real-time sync",
      "Bank integration",
      "AI categorization",
      "Export reports",
    ],
  },
  {
    id: 2,
    title: "BRAIN BOX – MULTI-AI TOOLS PLATFORM",
    description:
      "Developed a full-stack MERN web application integrating AI services such as chatbots, translation, quiz generation, multimedia creation, and document automation into a scalable unified platform.",
    fullDescription:
      "MediCare Mobile revolutionizes healthcare access with instant doctor consultations, prescription management, and health vitals tracking. The app features secure video calling, appointment scheduling, and integration with wearable devices for comprehensive health monitoring.",
    category: "Web App",
    image: multiple,
    tags: ["React Native", "Firebase", "Node.js", "WebRTC"],
    github: "https://github.com",
    live: "https://multiple-ai-service.vercel.app/",
    features: [
      "Ai Service",
      "Multi Media",
      "Prescription management",
      "Scalable Web application",
    ],
  },
  {
    id: 3,
    title: "FoodDash",
    description:
      "Full stack based food delivery app with real-time order tracking, restaurant discovery, and seamless payment integration.",
    fullDescription:
      "FoodieGo is a premium food delivery experience built with MERN stack. Features include AI-powered restaurant recommendations, real-time GPS tracking of deliveries, multiple payment options including crypto, and a loyalty rewards system.",
    category: "Mobile",
    image: food,
    tags: ["React", "Node.js", "Express.js", "MySql"],
    github: "https://github.com",
    live: "https://cozy-plate-safe.lovable.app",
    features: [
      "Real-time tracking",
      "AI recommendations",
      "Multi-payment",
      "Rewards system",
    ],
  },
  {
    id: 4,
    title: "Your Premium Mobile Shop ",
    description:
      "Experience excellence in mobile sales and repairs. From latest smartphones to expert repair services, we've got all your mobile needs covered",
    fullDescription:
      "Experience excellence in mobile sales and repairs. From latest smartphones to expert repair services, we've got all your mobile needs covered..",
    category: "Web App",
    image: phone,
    tags: ["Next.js", "OpenAI", "Node.js", "Tailwind"],
    github: "https://github.com",
    live: "https://phone-flair.lovable.app/",
    features: [
      "Fast Delivery",
      "Genuine Products",
      "Quick Service",
      "Best Prices",
    ],
  },
  {
    id: 5,
    title: "AI Wikipedia Quiz Generator",
    description:
      "Transform any Wikipedia article into an engaging educational quiz",
    fullDescription: ".",
    category: "Web App",
    image: QuizGenerator,
    tags: ["React Native", "Redux", "Node.js", "MongoDB"],
    github: "https://github.com",
    live: "https://ai-quiz-generator-lake-two.vercel.app/",
    features: [],
  },
  {
    id: 6,
    title: "Designify",
    description:
      "Comprehensive design system and component library with 60+ accessible, customizable React components.",
    fullDescription:
      "Designify is a production-ready design system built for modern web applications. Includes 60+ fully accessible components, dark mode support, comprehensive documentation, and Figma design files. Built with accessibility-first approach meeting WCAG 2.1 AA standards.",
    category: "UI/UX",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
    tags: ["React", "Storybook", "Figma", "TypeScript"],
    github: "https://github.com",
    live: "https://example.com",
    features: ["60+ components", "Dark mode", "Accessibility", "Figma files"],
  },
  {
    id: 7,
    title: "3D Product Studio",
    description:
      "Interactive WebGL product configurator allowing customers to customize products in real-time 3D.",
    fullDescription:
      "3D Product Studio enables e-commerce businesses to showcase products in stunning 3D. Customers can rotate, zoom, and customize products with different colors and materials. Features AR preview mode and generates high-quality renders for marketing.",
    category: "3D",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
    tags: ["Three.js", "React", "WebGL", "Blender"],
    github: "https://github.com",
    live: "https://example.com",
    features: [
      "Real-time 3D",
      "AR preview",
      "Material editor",
      "Render export",
    ],
  },
  {
    id: 8,
    title: "EduLearn Flutter",
    description:
      "Flutter e-learning platform with video courses, progress tracking, and interactive quizzes.",
    fullDescription:
      "EduLearn Flutter brings quality education to mobile devices. Features include offline video downloads, interactive quizzes with instant feedback, progress tracking, and certificates of completion. Built with Flutter for a native experience on both iOS and Android.",
    category: "Mobile",
    image:
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop",
    tags: ["Flutter", "Dart", "Firebase", "FFmpeg"],
    github: "https://github.com",
    live: "https://example.com",
    features: [
      "Offline videos",
      "Interactive quizzes",
      "Certificates",
      "Progress sync",
    ],
  },
];

const ProjectCard = ({
  project,
  index,
  onOpen,
}: {
  project: (typeof projects)[0];
  index: number;
  onOpen: () => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const getIcon = () => {
    if (project.category === "Mobile")
      return <Smartphone className="h-3.5 w-3.5" />;
    if (project.category === "3D") return <Layers className="h-3.5 w-3.5" />;
    return <Globe className="h-3.5 w-3.5" />;
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={onOpen}
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all cursor-pointer border border-border"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Overlay Links */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <Button
            size="sm"
            className="gradient-primary text-primary-foreground border-0"
            onClick={(e) => {
              e.stopPropagation();
              window.open(project.github, "_blank");
            }}
          >
            <Github className="h-4 w-4 mr-1" /> Code
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              window.open(project.live, "_blank");
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" /> Demo
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <span className="text-xs font-medium text-primary">
            {project.category}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ProjectModal = ({
  project,
  isOpen,
  onClose,
}: {
  project: (typeof projects)[0] | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="relative overflow-hidden rounded-xl mb-4">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-48 sm:h-64 object-cover"
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {project.category}
            </span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl">
            {project.title}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {project.fullDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Features */}
          <div>
            <h4 className="font-semibold mb-3">Key Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {project.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="font-semibold mb-3">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 text-sm rounded-full bg-accent text-accent-foreground border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 gradient-primary text-primary-foreground border-0"
              onClick={() => window.open(project.github, "_blank")}
            >
              <Github className="h-4 w-4 mr-2" /> View Code
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-primary/30"
              onClick={() => window.open(project.live, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" /> Live Demo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const Projects = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<
    (typeof projects)[0] | null
  >(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section
      id="projects"
      className="py-16 sm:py-20 lg:py-32 bg-muted/30"
      ref={ref}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            Portfolio
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
          >
            Featured <span className=" text-primary">Projects</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4"
          >
            A selection of projects showcasing my expertise in web and mobile
            development, including React Native and Flutter applications.
          </motion.p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
            >
              <Button
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={
                  activeCategory === category
                    ? "gradient-primary text-primary-foreground border-0"
                    : "border-primary/30 hover:bg-primary/5"
                }
              >
                {category}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onOpen={() => setSelectedProject(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-10 sm:mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            className="border-primary/30 hover:bg-primary/5 group"
          >
            View All Projects
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
