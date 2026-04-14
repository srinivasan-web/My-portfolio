
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState("");
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error: dbError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (dbError) {
        if (dbError.code === "23505") {
          toast({
            title: "Already subscribed!",
            description: "This email is already on our list.",
          });
        } else {
          throw dbError;
        }
      } else {
        setIsSubscribed(true);
        setEmail("");
        toast({
          title: "Subscribed!",
          description: "You'll receive updates about new projects and articles.",
        });
        setTimeout(() => setIsSubscribed(false), 3000);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="h-8 w-8 text-primary-foreground" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Stay <span className="text-gradient">Updated</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to get notified about new projects, blog posts, and development tips.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={`bg-background border-border ${error ? "border-destructive" : ""}`}
              />
              {error && <p className="text-destructive text-sm mt-1 text-left">{error}</p>}
            </div>
            <Button
              type="submit"
              disabled={isLoading || isSubscribed}
              className="gradient-primary text-primary-foreground"
            >
              {isSubscribed ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Subscribed!
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
