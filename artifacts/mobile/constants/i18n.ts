export type Lang = "en" | "bn";

export const STRINGS: Record<string, { en: string; bn: string }> = {
  // ── Shared ──────────────────────────────────────────────────────────────
  "identified":    { en: "Identified",            bn: "শনাক্ত" },
  "uncertain":     { en: "Uncertain",              bn: "অনিশ্চিত" },
  "unknown":       { en: "Unknown",                bn: "অজানা" },
  "cancel":        { en: "Cancel",                 bn: "বাতিল" },
  "tryAgain":      { en: "Try Again",              bn: "আবার চেষ্টা করুন" },
  "scanMedicine":  { en: "Scan Medicine",          bn: "ওষুধ স্ক্যান করুন" },
  "primaryUse":    { en: "Primary Use",            bn: "প্রাথমিক ব্যবহার" },
  "dosage":        { en: "Dosage",                 bn: "ডোজ" },
  "approxPrice":   { en: "Approximate Price",      bn: "আনুমানিক মূল্য" },
  "generalInfo":   { en: "General Information",    bn: "সাধারণ তথ্য" },
  "warnings":      { en: "Warnings & Side Effects",bn: "সতর্কতা ও পার্শ্বপ্রতিক্রিয়া" },

  // ── Tab bar ─────────────────────────────────────────────────────────────
  "tab.home":      { en: "Home",    bn: "হোম" },
  "tab.history":   { en: "History", bn: "ইতিহাস" },
  "tab.vault":     { en: "Vault",   bn: "ভল্ট" },
  "tab.profile":   { en: "Profile", bn: "প্রোফাইল" },

  // ── Home screen ─────────────────────────────────────────────────────────
  "home.greeting":       { en: "Welcome",               bn: "স্বাগতম" },
  "home.goodMorning":    { en: "Good morning 🌅",       bn: "সুপ্রভাত 🌅" },
  "home.goodAfternoon":  { en: "Good afternoon ☀️",    bn: "শুভ অপরাহ্ন ☀️" },
  "home.goodEvening":    { en: "Good evening 🌆",      bn: "শুভ সন্ধ্যা 🌆" },
  "home.goodNight":      { en: "Good night 🌙",        bn: "শুভ রাত্রি 🌙" },
  "home.scanLabel":      { en: "Scan Medicine",         bn: "ওষুধ স্ক্যান করুন" },
  "home.recentActivity": { en: "Recent Activity",       bn: "সাম্প্রতিক কার্যক্রম" },
  "home.viewHistory":    { en: "View History",          bn: "ইতিহাস দেখুন" },
  "home.emptyText":      {
    en: "No scans yet. Tap \"Scan Medicine\" to get started.",
    bn: "এখনো কোনো স্ক্যান নেই। শুরু করতে \"ওষুধ স্ক্যান করুন\" এ চাপুন।",
  },

  // ── Scan screen ─────────────────────────────────────────────────────────
  "scan.headerTitle":      { en: "Scan Medicine",                           bn: "ওষুধ স্ক্যান করুন" },
  "scan.headerSubtitle":   { en: "Point at the label or packaging",         bn: "লেবেল বা প্যাকেজিংয়ের দিকে তাক করুন" },
  "scan.frameHint":        { en: "Center the medicine label",               bn: "ওষুধের লেবেল কেন্দ্রে রাখুন" },
  "scan.captureLabel":     { en: "Tap to Capture",                          bn: "ক্যাপচার করতে চাপুন" },
  "scan.analyzingTitle":   { en: "Analyzing Medicine",                      bn: "ওষুধ বিশ্লেষণ করা হচ্ছে" },
  "scan.analyzingSubtitle":{ en: "AI is identifying your medicine",         bn: "AI আপনার ওষুধ শনাক্ত করছে" },
  "scan.errorTitle":       { en: "Analysis Failed",                         bn: "বিশ্লেষণ ব্যর্থ হয়েছে" },
  "scan.errorMsg":         { en: "Could not analyze the medicine. Check your connection and try again.", bn: "ওষুধ বিশ্লেষণ করা সম্ভব হয়নি। আপনার সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।" },
  "scan.permissionTitle":  { en: "Camera Access Needed",                    bn: "ক্যামেরা অ্যাক্সেস প্রয়োজন" },
  "scan.permissionSub":    { en: "Point your camera at any medicine to identify it instantly", bn: "যেকোনো ওষুধে ক্যামেরা তাক করুন এবং তাৎক্ষণিক তথ্য পান" },
  "scan.permissionBtn":    { en: "Allow Camera",                            bn: "ক্যামেরা অনুমতি দিন" },

  // ── Detail screen ───────────────────────────────────────────────────────
  "detail.headerTitle":  { en: "Scan Detail",           bn: "স্ক্যান বিবরণ" },
  "detail.disclaimer":   { en: "For informational purposes only. Always consult a healthcare professional.", bn: "শুধুমাত্র তথ্যের জন্য। সর্বদা একজন স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন।" },
  "detail.scanAnother":  { en: "Scan Another",          bn: "আরেকটি স্ক্যান" },
  "detail.notFound":     { en: "Scan not found",        bn: "স্ক্যান পাওয়া যায়নি" },

  // ── History screen ──────────────────────────────────────────────────────
  "history.headerTitle":   { en: "Scan History",                          bn: "স্ক্যান ইতিহাস" },
  "history.emptyTitle":    { en: "No scans yet",                          bn: "এখনো কোনো স্ক্যান নেই" },
  "history.emptySubtitle": { en: "Scan your first medicine to see it here", bn: "প্রথম ওষুধ স্ক্যান করুন এখানে দেখতে" },
  "history.countLabel":    { en: "{n} scan{s} saved on this device",      bn: "{n}টি স্ক্যান এই ডিভাইসে সংরক্ষিত" },

  // ── Vault screen ────────────────────────────────────────────────────────
  "vault.headerTitle":          { en: "My Meds",                  bn: "আমার ওষুধ" },
  "vault.headerSub":            { en: "Your personal medicine vault", bn: "আপনার ব্যক্তিগত ওষুধ ভান্ডার" },
  "vault.emptyTitle":           { en: "Your vault is empty",      bn: "আপনার ভল্ট খালি" },
  "vault.emptySubtitle":        { en: "After scanning a medicine, tap the bookmark icon on its detail screen to add it here.", bn: "ওষুধ স্ক্যান করার পরে বিবরণ স্ক্রিনে বুকমার্ক আইকনে চাপুন এখানে যোগ করতে।" },
  "vault.scanNow":              { en: "Scan a Medicine",          bn: "ওষুধ স্ক্যান করুন" },
  "vault.medicinesSaved":       { en: "{n} medicine{s} saved",    bn: "{n}টি ওষুধ সংরক্ষিত" },
  "vault.removeAlertTitle":     { en: "Remove from My Meds",      bn: "আমার ওষুধ থেকে সরান" },
  "vault.removeAlertMsg":       { en: "Remove \"{name}\" from your vault?", bn: "\"{name}\" আপনার ভল্ট থেকে সরাবেন?" },
  "vault.removeBtn":            { en: "Remove",                   bn: "সরান" },
  "vault.reminderTitle":        { en: "Med Reminder",             bn: "ওষুধের রিমাইন্ডার" },
  "vault.morning":              { en: "Morning",                  bn: "সকাল" },
  "vault.afternoon":            { en: "Afternoon",                bn: "দুপুর" },
  "vault.evening":              { en: "Evening",                  bn: "সন্ধ্যা" },
  "vault.custom":               { en: "Custom",                   bn: "কাস্টম" },
  "vault.setReminder":          { en: "Set Reminder",             bn: "রিমাইন্ডার সেট করুন" },
  "vault.saving":               { en: "Saving…",                  bn: "সংরক্ষণ হচ্ছে…" },
  "vault.removeReminder":       { en: "Remove Reminder",          bn: "রিমাইন্ডার সরান" },
  "vault.notifDisabledTitle":   { en: "Notifications disabled",   bn: "বিজ্ঞপ্তি অক্ষম" },
  "vault.notifDisabledMsg":     { en: "Enable notifications in Settings to receive med reminders. Your reminder has been saved.", bn: "রিমাইন্ডার পেতে সেটিংসে বিজ্ঞপ্তি চালু করুন। আপনার রিমাইন্ডার সংরক্ষিত হয়েছে।" },
  "vault.notifTitle":           { en: "Med Reminder",             bn: "ওষুধের রিমাইন্ডার" },
  "vault.notifBody":            { en: "Time to take {name}",      bn: "{name} খাওয়ার সময় হয়েছে" },
  "vault.reminderOn":           { en: "Reminder on",              bn: "রিমাইন্ডার চালু আছে" },
  "vault.reminderBtn":          { en: "Med Reminder",             bn: "ওষুধের রিমাইন্ডার" },

  // ── Profile screen ──────────────────────────────────────────────────────
  "profile.headerTitle":    { en: "Profile",             bn: "প্রোফাইল" },
  "profile.edit":           { en: "Edit",                bn: "সম্পাদনা" },
  "profile.changePhoto":    { en: "Tap to change photo", bn: "ছবি পরিবর্তন করতে চাপুন" },
  "profile.personalInfo":   { en: "PERSONAL INFO",       bn: "ব্যক্তিগত তথ্য" },
  "profile.nameLabel":      { en: "Name",                bn: "নাম" },
  "profile.emailLabel":     { en: "Email",               bn: "ইমেইল" },
  "profile.phoneLabel":     { en: "Phone",               bn: "ফোন" },
  "profile.namePlaceholder":{ en: "Your full name",      bn: "আপনার পূর্ণ নাম" },
  "profile.phonePlaceholder":{ en: "+1 (000) 000-0000",  bn: "+880 (000) 000-0000" },
  "profile.saveChanges":    { en: "Save Changes",        bn: "পরিবর্তন সংরক্ষণ করুন" },
  "profile.preferences":    { en: "PREFERENCES",         bn: "পছন্দসমূহ" },
  "profile.darkMode":       { en: "Dark Mode",           bn: "ডার্ক মোড" },
  "profile.more":           { en: "MORE",                bn: "আরো" },
  "profile.shareApp":       { en: "Share This App",      bn: "এই অ্যাপ শেয়ার করুন" },
  "profile.permissionTitle":{ en: "Permission needed",   bn: "অনুমতি প্রয়োজন" },
  "profile.permissionMsg":  { en: "Allow photo access to change your profile picture.", bn: "প্রোফাইল ছবি পরিবর্তন করতে ফটো অ্যাক্সেসের অনুমতি দিন।" },
  "profile.shareTitle":     { en: "MediScan — AI Medicine Scanner", bn: "মেডিস্ক্যান — AI ওষুধ স্ক্যানার" },
  "profile.shareMessage":   { en: "Check out MediScan! Point your camera at any medicine and instantly get dosage info, uses, and warnings. Download it now.", bn: "মেডিস্ক্যান দেখুন! যেকোনো ওষুধে ক্যামেরা তাক করুন এবং তাৎক্ষণিকভাবে ডোজ, ব্যবহার ও সতর্কতার তথ্য পান। এখনই ডাউনলোড করুন।" },
  "profile.language":       { en: "Language",            bn: "ভাষা" },

  // ── Result screen ───────────────────────────────────────────────────────
  "result.headerTitle":    { en: "Analysis Result",    bn: "বিশ্লেষণ ফলাফল" },
  "result.loadingTitle":   { en: "Analyzing Medicine", bn: "ওষুধ বিশ্লেষণ করা হচ্ছে" },
  "result.loadingSubtitle":{ en: "AI is identifying your medicine...", bn: "AI আপনার ওষুধ শনাক্ত করছে..." },
  "result.errorMsg":       { en: "Could not analyze medicine. Please try again.", bn: "ওষুধ বিশ্লেষণ করা সম্ভব হয়নি। আবার চেষ্টা করুন।" },
  "result.disclaimer":     { en: "For informational purposes only. Always consult a healthcare professional before taking any medication.", bn: "শুধুমাত্র তথ্যের জন্য। যেকোনো ওষুধ গ্রহণের আগে সর্বদা একজন স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন।" },
  "result.scanAgain":      { en: "Scan Another Medicine", bn: "আরেকটি ওষুধ স্ক্যান করুন" },

  // ── Login screen ────────────────────────────────────────────────────────
  "login.appName":    { en: "Medi Scan AI",    bn: "মেডি স্ক্যান AI" },
  "login.tagline":    { en: "Precision healthcare analysis at your fingertips.", bn: "আপনার আঙুলের ডগায় নির্ভুল স্বাস্থ্যসেবা বিশ্লেষণ।" },
  "login.feature1":   { en: "Scan any medicine instantly",  bn: "তাৎক্ষণিকভাবে যেকোনো ওষুধ স্ক্যান করুন" },
  "login.feature2":   { en: "Dosage, uses & price info",    bn: "ডোজ, ব্যবহার ও মূল্যের তথ্য" },
  "login.feature3":   { en: "Personalized scan history",    bn: "ব্যক্তিগতকৃত স্ক্যান ইতিহাস" },
  "login.feature4":   { en: "Secure & private",             bn: "নিরাপদ ও ব্যক্তিগত" },
  "login.loginBtn":   { en: "Log In to Continue",           bn: "প্রবেশ করুন" },
  "login.disclaimer": { en: "By continuing, you agree to our Terms of Service and Privacy Policy.", bn: "চালিয়ে যাওয়ার মাধ্যমে আপনি আমাদের পরিষেবার শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত হচ্ছেন।" },
  "login.encryption": { en: "HIPAA Compliant Data Encryption", bn: "এনক্রিপ্টেড ডেটা সুরক্ষা" },

  // ── Error fallback ──────────────────────────────────────────────────────
  "error.title":   { en: "Something went wrong",             bn: "কিছু একটা ভুল হয়েছে" },
  "error.message": { en: "Please reload the app to continue.", bn: "চালিয়ে যেতে অ্যাপটি পুনরায় লোড করুন।" },
  "error.details": { en: "Error Details",                    bn: "ত্রুটির বিবরণ" },

  // ── Time-ago ─────────────────────────────────────────────────────────────
  "time.justNow": { en: "Just now",    bn: "এইমাত্র" },
  "time.mAgo":    { en: "{n}m ago",   bn: "{n} মিনিট আগে" },
  "time.hAgo":    { en: "{n}h ago",   bn: "{n} ঘণ্টা আগে" },
  "time.dAgo":    { en: "{n}d ago",   bn: "{n} দিন আগে" },

  // ── Drawer ───────────────────────────────────────────────────────────────
  "drawer.about":        { en: "About This App",           bn: "এই অ্যাপ সম্পর্কে" },
  "drawer.aboutSub":     { en: "Version 1.0.0 • Medi Scan AI", bn: "সংস্করণ ১.০.০ • মেডি স্ক্যান AI" },
  "drawer.language":     { en: "App Language",             bn: "অ্যাপের ভাষা" },
  "drawer.developer":    { en: "About Developers",         bn: "ডেভেলপারদের সম্পর্কে" },
  "drawer.developerSub": { en: "Built with your health in mind", bn: "আপনার স্বাস্থ্যের কথা ভেবে তৈরি" },

  // ── Home subtitle ────────────────────────────────────────────────────────
  "home.subtitle": { en: "Stay ahead on your health journey today.", bn: "আজ আপনার স্বাস্থ্য যাত্রায় এগিয়ে থাকুন।" },
};

export function translate(
  key: string,
  lang: Lang,
  vars?: Record<string, string | number>,
): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  let str = entry[lang] ?? entry.en;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}
