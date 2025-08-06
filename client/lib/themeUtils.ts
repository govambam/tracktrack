// Theme utility function
export const getThemeStyles = (theme: string = "GolfOS") => {
  if (theme === "TourTech") {
    return {
      // Layout & Container - Enterprise clean, no gradients
      heroContainer: "bg-white",
      heroGradient: "bg-white",
      cardBackground: "bg-white",
      sectionBackground: "bg-gray-50",
      modalBackground: "bg-white",

      // Typography - Compact, weight-based hierarchy with monospace emphasis
      heroTitle:
        "text-slate-900 font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight",
      heroSubtitle: "text-slate-600 font-normal text-base sm:text-lg",
      sectionTitle:
        "text-slate-900 font-semibold text-lg sm:text-xl tracking-tight",
      cardTitle: "text-slate-900 font-semibold text-base",
      cardText: "text-slate-600 text-sm",
      dataText: "font-mono text-slate-800 font-medium",
      monoText: "font-mono text-slate-800 font-medium",
      monoLabel: "font-mono text-xs uppercase tracking-wide text-slate-500",
      orangeText: "text-orange-600 font-medium",

      // Buttons - Solid, enterprise-style
      primaryButton:
        "bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors",
      secondaryButton:
        "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors",
      accentColor: "text-orange-600",
      accentBackground: "bg-orange-600",

      // Borders & Shadows - Flat, minimal
      cardBorder: "border border-slate-200",
      cardShadow: "shadow-sm",
      cardHover: "hover:shadow-md transition-shadow",
      roundedCorners: "rounded-md",

      // Spacing - Compact, efficient
      containerPadding: "px-4 sm:px-6 lg:px-8",
      sectionPadding: "py-8 sm:py-10",
      cardPadding: "p-4 sm:p-5",
      headerSpacing: "mb-4",

      // Data Display - Monospace for clarity
      scoreFont: "font-mono font-semibold",
      tableHeader: "font-mono text-xs uppercase tracking-wide text-slate-500",
      tableCell: "font-mono text-sm text-slate-900",

      // Layout Constraints
      maxContentWidth: "max-w-4xl",
      textMaxWidth: "max-w-2xl",
    };
  }

  if (theme === "Masters") {
    return {
      // Layout & Container - Elegant with subtle warmth
      heroContainer:
        "bg-gradient-to-br from-amber-50/30 via-white to-green-50/20",
      heroGradient:
        "bg-gradient-to-br from-amber-50/20 via-white to-green-50/10",
      cardBackground: "bg-white",
      sectionBackground:
        "bg-gradient-to-br from-amber-50/30 via-white to-green-50/20",
      modalBackground: "bg-white",

      // Typography - Serif elegance with refined hierarchy
      heroTitle:
        "font-serif font-semibold text-green-900 text-3xl md:text-7xl tracking-tight",
      heroSubtitle:
        "font-serif font-medium text-green-800/80 text-base sm:text-lg tracking-wide",
      sectionTitle:
        "font-serif font-semibold text-green-900 text-4xl tracking-tight",
      cardTitle:
        "font-serif font-semibold text-green-900 text-lg md:text-2xl tracking-tight",
      cardText: "text-green-800/70 text-sm md:text-lg",
      dataText: "font-sans font-semibold text-green-900",
      elegantText: "font-serif font-medium text-green-800 tracking-wide",
      goldText: "text-yellow-600 font-semibold",

      // Buttons - Refined with Masters colors
      primaryButton:
        "bg-green-800 hover:bg-green-900 text-amber-50 font-medium transition-all duration-300 transform hover:scale-105",
      secondaryButton:
        "bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 font-medium transition-all duration-300",
      accentColor: "text-yellow-600",
      accentBackground: "bg-yellow-600",

      // Borders & Shadows - Elegant with gold accents, refined for Fore the Boy style
      cardBorder: "border border-green-800/20",
      cardShadow: "shadow-sm hover:shadow-lg hover:shadow-green-900/10",
      cardHover:
        "hover:border-yellow-600 hover:scale-[1.02] hover:shadow-lg transition-all duration-300",
      roundedCorners: "rounded-xl",

      // Spacing - Generous, refined to match Fore the Boy
      containerPadding: "px-6 sm:px-8 lg:px-16 xl:px-20",
      sectionPadding: "py-20 sm:py-24 lg:py-28",
      cardPadding: "p-6 sm:p-8",
      headerSpacing: "mb-8",

      // Data Display - Elegant serif for headings, sans for data
      scoreFont: "font-serif font-semibold",
      tableHeader:
        "font-serif text-sm font-medium tracking-wide text-green-800",
      tableCell: "font-sans text-base text-green-900",

      // Layout Constraints - Wider to match Fore the Boy
      maxContentWidth: "max-w-7xl",
      textMaxWidth: "max-w-5xl",

      // Masters-specific styles with improved hover states
      mastersCardBorder: "border border-green-800/20",
      mastersCardHover:
        "hover:border-yellow-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300",
      mastersCardShadow: "shadow-sm hover:shadow-lg",

      mastersGreen: "text-green-800",
      mastersGreenDeep: "text-green-900",
      mastersGold: "text-yellow-600",
      mastersGoldLight: "text-yellow-500",
      mastersCream: "bg-amber-50",
      mastersIcon: "h-8 w-8 text-yellow-600",
      mastersIconSmall: "h-4 w-4 text-yellow-600",
    };
  }

  // Default GolfOS theme
  return {
    // Container styles
    heroContainer: "bg-gradient-to-br from-green-50 via-white to-emerald-50",
    heroGradient:
      "bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20",
    cardBackground: "bg-white/90 backdrop-blur-sm",
    sectionBackground:
      "bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20",

    // Typography
    heroTitle: "text-slate-900 font-bold tracking-tight",
    heroSubtitle: "text-slate-600",
    sectionTitle: "text-slate-900 font-bold tracking-tight",
    cardTitle: "text-slate-900 font-bold",
    cardText: "text-slate-600",

    // Buttons and accents
    primaryButton:
      "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0",
    accentColor: "text-green-600",
    accentBackground: "bg-green-600",

    // Borders and shadows
    cardBorder: "border border-slate-200/50",
    cardShadow:
      "shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50",
    roundedCorners: "rounded-3xl",

    // Spacing
    containerPadding: "px-6 sm:px-8 lg:px-12",
    sectionPadding: "py-28",
    cardPadding: "p-8",
  };
};
