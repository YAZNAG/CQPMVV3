"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/actions/contact.actions";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";

export function ContactForm({ dict }: { dict: Dictionary }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await submitContactMessage({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || undefined,
      subject: fd.get("subject") as string,
      message: fd.get("message") as string,
    });
    setLoading(false);
    if (result.success) {
      toast.success(dict.contact.success);
      e.currentTarget.reset();
    } else {
      toast.error(result.error ?? dict.common.error);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit}
      className="glass-card space-y-6 rounded-2xl border border-navy-100/80 p-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{dict.contact.name}</Label>
          <Input id="name" name="name" required className="border-navy-200" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{dict.contact.email}</Label>
          <Input id="email" name="email" type="email" required className="border-navy-200" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{dict.contact.phone}</Label>
        <Input id="phone" name="phone" className="border-navy-200" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">{dict.contact.subject}</Label>
        <Input id="subject" name="subject" required className="border-navy-200" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{dict.contact.message}</Label>
        <Textarea id="message" name="message" required rows={5} className="border-navy-200" />
      </div>
      <Button type="submit" variant="ocean" size="lg" disabled={loading} className="w-full sm:w-auto">
        <Send className="h-4 w-4" />
        {loading ? dict.common.loading : dict.contact.send}
      </Button>
    </motion.form>
  );
}
