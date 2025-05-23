import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft, Calendar, ListChecks, Settings, Layers, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

// Animation variants for the wizard
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.3
    }
  },
  exit: { 
    opacity: 0,
    transition: { when: "afterChildren" }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: { y: -20, opacity: 0 }
};

// Confetti animation for completion
const confettiVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      delay: 0.2 
    }
  }
};

export default function OnboardingWizard() {
  const { isOnboarding, currentStep, nextStep, prevStep, skipOnboarding } = useOnboarding();
  const { t } = useTranslation();

  if (!isOnboarding) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="relative w-[92%] sm:w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden"
        >
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 z-10"
            onClick={skipOnboarding}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Content area */}
          <div className="p-3 sm:p-6 max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentStep === "welcome" && <WelcomeStep key="welcome" />}
              {currentStep === "dashboard" && <DashboardStep key="dashboard" />}
              {currentStep === "tasks" && <TasksStep key="tasks" />}
              {currentStep === "editions" && <EditionsStep key="editions" />}
              {currentStep === "settings" && <SettingsStep key="settings" />}
              {currentStep === "complete" && <CompleteStep key="complete" />}
            </AnimatePresence>
          </div>

          {/* Navigation buttons - mobile optimized */}
          <div className="p-3 sm:p-4 border-t border-gray-200 flex flex-wrap sm:flex-nowrap justify-between items-center">
            <div className="mb-2 sm:mb-0">
              {currentStep !== "welcome" && currentStep !== "complete" && (
                <Button variant="outline" size="sm" className="sm:size-default" onClick={prevStep}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  <span className="sm:inline">{t("previous")}</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {currentStep !== "complete" && (
                <Button variant="ghost" size="sm" className="sm:size-default" onClick={skipOnboarding}>
                  <span className="sm:inline">{t("skip")}</span>
                </Button>
              )}
              <Button size="sm" className="sm:size-default" onClick={nextStep}>
                <span className="mr-1 sm:mr-2">{currentStep === "complete" ? t("finish") : t("next")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Individual step components
function WelcomeStep() {
  const { t } = useTranslation();
  
  return (
    <motion.div
      key="welcome"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-center"
    >
      <motion.div variants={itemVariants}>
        <div className="flex justify-center mb-3 sm:mb-4">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <Calendar className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
        {t("welcome_to_training_app")}
      </motion.h2>
      
      <motion.p variants={itemVariants} className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        {t("onboarding_welcome_description")}
      </motion.p>
      
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {['dashboard', 'tasks', 'editions', 'settings'].map((step, i) => (
          <Card key={step} className="p-2 sm:p-4 text-center hover:shadow-md transition-shadow">
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex justify-center mb-1 sm:mb-2"
            >
              {step === 'dashboard' && <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />}
              {step === 'tasks' && <ListChecks className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />}
              {step === 'editions' && <Layers className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />}
              {step === 'settings' && <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />}
            </motion.div>
            <div className="font-medium text-sm sm:text-base">{t(`menu_${step}`)}</div>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}

function DashboardStep() {
  const { t } = useTranslation();
  
  return (
    <motion.div
      key="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants}>
        <div className="flex justify-center mb-3 sm:mb-4">
          <Zap className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
        </div>
      </motion.div>
      
      <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center">
        {t("dashboard_overview")}
      </motion.h2>
      
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6 text-center">
        <p className="text-sm sm:text-base text-gray-600">
          {t("dashboard_description")}
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
        <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">{t("key_features")}:</h3>
        <ul className="space-y-1 sm:space-y-2 pl-4 sm:pl-5 list-disc text-sm sm:text-base text-gray-700">
          <motion.li variants={itemVariants}>{t("dashboard_feature_1")}</motion.li>
          <motion.li variants={itemVariants}>{t("dashboard_feature_2")}</motion.li>
          <motion.li variants={itemVariants}>{t("dashboard_feature_3")}</motion.li>
        </ul>
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        className="bg-blue-50 border border-blue-200 text-blue-800 p-2 sm:p-4 rounded-lg text-xs sm:text-sm"
      >
        <p className="flex items-center">
          <span className="mr-2 flex-shrink-0">💡</span>
          <span>{t("dashboard_tip")}</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

function TasksStep() {
  const { t } = useTranslation();
  
  return (
    <motion.div
      key="tasks"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants}>
        <div className="flex justify-center mb-3 sm:mb-4">
          <ListChecks className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
        </div>
      </motion.div>
      
      <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center">
        {t("tasks_management")}
      </motion.h2>
      
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6 text-center">
        <p className="text-sm sm:text-base text-gray-600">
          {t("tasks_description")}
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <Card className="p-3 sm:p-4 border-l-4 border-blue-500">
          <h3 className="font-semibold text-sm sm:text-base mb-2">{t("task_statuses")}</h3>
          <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
            <li className="flex items-center">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-gray-300 mr-2"></span>
              <span>{t("not_started")}</span>
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-yellow-400 mr-2"></span>
              <span>{t("in_progress")}</span>
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500 mr-2"></span>
              <span>{t("done")}</span>
            </li>
          </ul>
        </Card>
        
        <Card className="p-3 sm:p-4 border-l-4 border-purple-500">
          <h3 className="font-semibold text-sm sm:text-base mb-2">{t("task_types")}</h3>
          <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
            <li className="flex items-center">
              <span className="text-xs px-1 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-800 rounded mr-2">GLR</span>
              <span className="text-xs sm:text-sm">{t("guided_learning_route")}</span>
            </li>
            <li className="flex items-center">
              <span className="text-xs px-1 py-0.5 sm:px-2 sm:py-1 bg-green-100 text-green-800 rounded mr-2">SLR</span>
              <span className="text-xs sm:text-sm">{t("self_learning_route")}</span>
            </li>
          </ul>
        </Card>
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 sm:p-4 rounded-lg text-xs sm:text-sm"
      >
        <p className="flex items-center">
          <span className="mr-2 flex-shrink-0">⚡</span>
          <span>{t("tasks_pro_tip")}</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

function EditionsStep() {
  const { t } = useTranslation();
  
  return (
    <motion.div
      key="editions"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants}>
        <div className="flex justify-center mb-3 sm:mb-4">
          <Layers className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
        </div>
      </motion.div>
      
      <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center">
        {t("editions_management")}
      </motion.h2>
      
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6 text-center">
        <p className="text-sm sm:text-base text-gray-600">
          {t("editions_description")}
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
        <Card className="p-3 sm:p-4 mb-3 sm:mb-4">
          <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">{t("edition_format")}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">{t("edition_format_description")}</p>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-gray-100 p-2 sm:p-3 rounded text-center">
              <div className="font-mono text-base sm:text-lg">YYMM-A</div>
              <div className="text-xs text-gray-500">{t("for_customers")}</div>
            </div>
            <div className="bg-gray-100 p-2 sm:p-3 rounded text-center">
              <div className="font-mono text-base sm:text-lg">YYMM-B</div>
              <div className="text-xs text-gray-500">{t("for_partners")}</div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <div className="bg-green-50 border border-green-200 text-green-800 p-2 sm:p-4 rounded-lg">
          <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">{t("edition_cloning")}</h3>
          <p className="text-xs sm:text-sm">{t("edition_cloning_description")}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingsStep() {
  const { t } = useTranslation();
  
  return (
    <motion.div
      key="settings"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div variants={itemVariants}>
        <div className="flex justify-center mb-3 sm:mb-4">
          <Settings className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
        </div>
      </motion.div>
      
      <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center">
        {t("customize_your_experience")}
      </motion.h2>
      
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6 text-center">
        <p className="text-sm sm:text-base text-gray-600">
          {t("settings_description")}
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <Card className="p-3 sm:p-4 flex flex-col items-center">
          <div className="mb-1 sm:mb-2 text-lg sm:text-xl">🌐</div>
          <h3 className="font-semibold text-sm sm:text-base mb-1">{t("language")}</h3>
          <p className="text-xs sm:text-sm text-center text-gray-600">
            {t("language_setting_description")}
          </p>
        </Card>
        
        <Card className="p-3 sm:p-4 flex flex-col items-center">
          <div className="mb-1 sm:mb-2 text-lg sm:text-xl">👤</div>
          <h3 className="font-semibold text-sm sm:text-base mb-1">{t("profile")}</h3>
          <p className="text-xs sm:text-sm text-center text-gray-600">
            {t("profile_setting_description")}
          </p>
        </Card>
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        className="bg-purple-50 border border-purple-200 text-purple-800 p-2 sm:p-4 rounded-lg text-xs sm:text-sm"
      >
        <p className="flex items-center">
          <span className="mr-2 flex-shrink-0">🔑</span>
          <span>{t("settings_security_tip")}</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

function CompleteStep() {
  const { t } = useTranslation();
  
  return (
    <motion.div
      key="complete"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-center"
    >
      <motion.div 
        variants={confettiVariants} 
        className="relative h-32 sm:h-40 mb-4 sm:mb-6"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: [0, -10, 0],
              transition: { 
                y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                scale: { duration: 0.5 },
                opacity: { duration: 0.5 }
              }
            }}
          >
            <div className="text-5xl sm:text-7xl">🎉</div>
          </motion.div>
        </div>
        
        {/* Animated confetti elements */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              background: `hsl(${Math.random() * 360}, 80%, 60%)`,
              width: `${Math.random() * 12 + 5}px`,
              height: `${Math.random() * 12 + 5}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0'
            }}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              y: [0, Math.random() * -100 - 50],
              x: [0, (Math.random() - 0.5) * 100]
            }}
            transition={{ 
              duration: Math.random() * 2 + 1, 
              delay: Math.random() * 0.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
          />
        ))}
      </motion.div>
      
      <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
        {t("youre_all_set")}!
      </motion.h2>
      
      <motion.p variants={itemVariants} className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-8">
        {t("onboarding_complete_description")}
      </motion.p>
      
      <motion.div variants={itemVariants} className="bg-green-50 border border-green-200 text-green-800 p-2 sm:p-4 rounded-lg mb-3 sm:mb-6">
        <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">{t("whats_next")}</h3>
        <p className="text-xs sm:text-sm">{t("onboarding_next_steps")}</p>
      </motion.div>
      
      <motion.p variants={itemVariants} className="text-sm text-gray-500 italic">
        {t("onboarding_restart_hint")}
      </motion.p>
    </motion.div>
  );
}