export type Language = "en" | "bn";

export const translations = {
  en: {
    featuresLabel: "Features",
    featuresTitle: "Everything you need",
    smartStarRoutingTitle: "Smart Star Routing",
    smartStarRoutingDesc:
      "4-5 stars instantly redirect to your Google Review page. 1-3 stars open a private feedback form — keeping your public rating protected automatically.",
    privateFeedbackTitle: "Private Feedback Inbox",
    privateFeedbackDesc:
      "Every negative review is captured privately before it reaches Google. Respond directly and turn dissatisfied customers into loyal ones.",
    analyticsTitle: "Real-Time Analytics Dashboard",
    analyticsDesc:
      "Track total scans, Google redirect rate, private feedback volume, and staff performance — all in one live dashboard.",
    qrNfcTitle: "Smart NFC Cards & Printable QR",
    qrNfcDesc:
      "Get a premium NFC tap card plus downloadable print-ready QR code posters. Customers simply tap or scan to reach your review page.",
    whatsappAlertsTitle: "Instant WhatsApp Alerts",
    whatsappAlertsDesc:
      "Receive instant WhatsApp notifications the moment a customer submits private feedback — so you can respond before they leave.",
    mobileTitle: "Mobile-Optimized Experience",
    mobileDesc:
      "Large tap targets, fluid animations, and responsive layouts ensure every customer can leave feedback in seconds on any device.",
    // Mini-demo strings
    starDemo45: "4-5 Stars → Google Review",
    starDemo13: "1-3 Stars → Private Feedback",
    starDemoInfo: "Customers choose; smart routing handles the rest.",
    nfcDemoTitle: "Tap to Rate",
    nfcDemoSubtitle: "Place on table or counter",
    whatsappDemoTitle: "New Private Feedback",
    whatsappDemoBody: "Customer left 2★ for Your Business",
    whatsappDemoTime: "Just now",
  },
  bn: {
    featuresLabel: "বৈশিষ্ট্য",
    featuresTitle: "আপনার প্রয়োজনীয় সবকিছু",
    smartStarRoutingTitle: "স্মার্ট স্টার রুটিং",
    smartStarRoutingDesc:
      "৪-৫ স্টার আপনার Google রিভিউ পেজে তাৎক্ষণিকভাবে পাঠায়। ১-৩ স্টার প্রাইভেট ফিডব্যাক ফর্ম খোলে — আপনার পাবলিক রেটিং স্বয়ংক্রিয়ভাবে সুরক্ষিত রাখে।",
    privateFeedbackTitle: "প্রাইভেট ফিডব্যাক ইনবক্স",
    privateFeedbackDesc:
      "প্রতিটি নেগেটিভ রিভিউ Google-এ পৌঁছানোর আগেই প্রাইভেটভাবে ক্যাপচার হয়। সরাসরি উত্তর দিন এবং অসন্তুষ্ট গ্রাহকদের অনুগত গ্রাহকে রূপান্তরিত করুন।",
    analyticsTitle: "রিয়েল-টাইম অ্যানালিটিক্স ড্যাশবোর্ড",
    analyticsDesc:
      "মোট স্ক্যান, Google রিডাইরেক্ট হার, প্রাইভেট ফিডব্যাক পরিমাণ এবং স্টাফ পারফরম্যান্স ট্র্যাক করুন — সব একটি লাইভ ড্যাশবোর্ডে।",
    qrNfcTitle: "স্মার্ট NFC কার্ড ও প্রিন্টেবল QR",
    qrNfcDesc:
      "একটি প্রিমিয়াম NFC ট্যাপ কার্ড এবং ডাউনলোডযোগ্য প্রিন্ট-রেডি QR কোড পোস্টার পান। গ্রাহকরা শুধু ট্যাপ বা স্ক্যান করে আপনার রিভিউ পেজে পৌঁছাতে পারবে।",
    whatsappAlertsTitle: "তাৎক্ষণিক WhatsApp অ্যালার্ট",
    whatsappAlertsDesc:
      "একজন গ্রাহক প্রাইভেট ফিডব্যাক জমা দেওয়ার মুহূর্তেই WhatsApp নোটিফিকেশন পান — যাতে তারা চলে যাওয়ার আগেই আপনি প্রতিক্রিয়া জানাতে পারেন।",
    mobileTitle: "মোবাইল-অপ্টিমাইজড অভিজ্ঞতা",
    mobileDesc:
      "বড় ট্যাপ টার্গেট, তরল অ্যানিমেশন এবং রেসপন্সিভ লেআউট নিশ্চিত করে যে প্রতিটি গ্রাহক যেকোনো ডিভাইসে সেকেন্ডের মধ্যে ফিডব্যাক দিতে পারে।",
    starDemo45: "৪-৫ স্টার → Google রিভিউ",
    starDemo13: "১-৩ স্টার → প্রাইভেট ফিডব্যাক",
    starDemoInfo: "গ্রাহকরা বেছে নেন; স্মার্ট রুটিং বাকিটা সামলায়।",
    nfcDemoTitle: "ট্যাপ করে রেট দিন",
    nfcDemoSubtitle: "টেবিল বা কাউন্টারে রাখুন",
    whatsappDemoTitle: "নতুন প্রাইভেট ফিডব্যাক",
    whatsappDemoBody: "গ্রাহক আপনার ব্যবসায়ে ২★ দিয়েছেন",
    whatsappDemoTime: "এইমাত্র",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
