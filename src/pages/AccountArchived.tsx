import { motion } from "framer-motion";
import { Building2, MessageCircle, Mail } from "lucide-react";

export default function AccountArchived() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-[#0D0D0D]"
    >
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <Building2 className="w-10 h-10 text-amber-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-white mb-3"
          >
            Account Archived
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#A1A1AA] text-sm leading-relaxed mb-8"
          >
            This account is currently inactive and has been archived.
            If you believe this was done in error, please reach out to our admin team.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <a
              href="https://wa.me/8801791130633?text=Hi%2C%20my%20STAR%20CATCH%20account%20has%20been%20archived.%20I%20would%20like%20to%20request%20reactivation."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#128C7E] transition-colors shadow-lg shadow-[#25D366]/20"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Admin to Reactivate
            </a>

            <a
              href="mailto:starcatchbd@gmail.com?subject=Account%20Archived%20%E2%80%94%20Reactivation%20Request"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[#A1A1AA] text-sm font-semibold hover:bg-white/10 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Admin
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-[10px] text-[#A1A1AA]/40"
          >
            STAR CATCH Reviews & Feedback Agency Bd
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
