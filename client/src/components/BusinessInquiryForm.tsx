import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, Send } from "lucide-react";

export default function BusinessInquiryForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    projectDescription: "",
    budget: "",
    timeline: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = trpc.business.submitInquiry.useMutation({
    onSuccess: (data) => {
      toast.success("Inquiry submitted!", {
        description: data.message,
      });
      setIsSubmitted(true);
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        projectDescription: "",
        budget: "",
        timeline: "",
      });
      // Reset form after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message || "Please try again.",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.companyName.trim() || !formData.contactName.trim() || !formData.email.trim() || !formData.projectDescription.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    submitMutation.mutate(formData);
  };

  if (isSubmitted) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center space-y-4">
        <div className="text-5xl">✨</div>
        <h4 className="font-display font-bold text-2xl text-white">Thank you!</h4>
        <p className="text-muted-foreground">
          We've received your inquiry and will review it shortly. You'll hear from us within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-white">
            Company Name *
          </label>
          <Input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Your company"
            className="rounded-lg bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-teal-500/50"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="contactName" className="block text-sm font-medium text-white">
            Your Name *
          </label>
          <Input
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Full name"
            className="rounded-lg bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-teal-500/50"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="rounded-lg bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-teal-500/50"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-white">
            Phone (Optional)
          </label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            className="rounded-lg bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-teal-500/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="projectDescription" className="block text-sm font-medium text-white">
          Project Description *
        </label>
        <Textarea
          id="projectDescription"
          name="projectDescription"
          value={formData.projectDescription}
          onChange={handleChange}
          placeholder="Tell us about your project, goals, and requirements..."
          className="rounded-lg bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-teal-500/50 min-h-[120px]"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="budget" className="block text-sm font-medium text-white">
            Budget Range (Optional)
          </label>
          <Input
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., $25k - $50k"
            className="rounded-lg bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-teal-500/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="timeline" className="block text-sm font-medium text-white">
            Timeline (Optional)
          </label>
          <Input
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            placeholder="e.g., 3 months"
            className="rounded-lg bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus:border-teal-500/50"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitMutation.isPending}
        className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-teal-500/20 active:scale-97 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Inquiry
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We respect your privacy. Your information will only be used to contact you about your project.
      </p>
    </form>
  );
}
