"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components";
import { useUI } from "@/hooks/useUI";
import { 
  Sun, 
  Moon, 
  Monitor, 
  Smartphone, 
  Tablet,
  MonitorSpeaker,
  Palette,
  Grid3X3,
  LayoutGrid
} from "lucide-react";

export default function ResponsiveDemoPage() {
  const { theme, toggleTheme } = useUI();
  const [currentBreakpoint, setCurrentBreakpoint] = useState("unknown");
  const [isClient, setIsClient] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect current breakpoint
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 475) setCurrentBreakpoint("xs");
      else if (width < 640) setCurrentBreakpoint("sm");
      else if (width < 768) setCurrentBreakpoint("md");
      else if (width < 1024) setCurrentBreakpoint("lg");
      else if (width < 1280) setCurrentBreakpoint("xl");
      else setCurrentBreakpoint("2xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const breakpointInfo = {
    xs: { name: "Extra Small", icon: Smartphone, min: "0px", max: "474px" },
    sm: { name: "Small", icon: Smartphone, min: "475px", max: "639px" },
    md: { name: "Medium", icon: Tablet, min: "640px", max: "767px" },
    lg: { name: "Large", icon: Monitor, min: "768px", max: "1023px" },
    xl: { name: "Extra Large", icon: MonitorSpeaker, min: "1024px", max: "1279px" },
    "2xl": { name: "2X Extra Large", icon: MonitorSpeaker, min: "1280px", max: "∞" }
  };

  const themeColors = [
    { name: "Brand Blue", class: "bg-brand-500", hex: "#3b82f6" },
    { name: "Success Green", class: "bg-success-500", hex: "#22c55e" },
    { name: "Warning Amber", class: "bg-warning-500", hex: "#f59e0b" },
    { name: "Danger Red", class: "bg-danger-500", hex: "#ef4444" },
  ];

  const textSizes = [
    { name: "Heading 1", class: "text-4xl font-bold", size: "2.25rem" },
    { name: "Heading 2", class: "text-3xl font-semibold", size: "1.875rem" },
    { name: "Heading 3", class: "text-2xl font-medium", size: "1.5rem" },
    { name: "Body Large", class: "text-lg", size: "1.125rem" },
    { name: "Body Regular", class: "text-base", size: "1rem" },
    { name: "Body Small", class: "text-sm", size: "0.875rem" },
  ];

  const spacingExamples = [
    { name: "Padding Small", class: "p-2", value: "0.5rem" },
    { name: "Padding Medium", class: "p-4", value: "1rem" },
    { name: "Padding Large", class: "p-8", value: "2rem" },
    { name: "Margin Small", class: "m-2", value: "0.5rem" },
    { name: "Margin Medium", class: "m-4", value: "1rem" },
    { name: "Margin Large", class: "m-8", value: "2rem" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Responsive & Themed Design
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Showcase of TailwindCSS responsive utilities and dark mode implementation
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Current Breakpoint Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {breakpointInfo[currentBreakpoint as keyof typeof breakpointInfo]?.name || "Unknown"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({currentBreakpoint})
                </span>
              </div>
              
              {/* Theme Toggle */}
              {isClient && (
                <Button
                  onClick={toggleTheme}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span className="hidden sm:inline">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span className="hidden sm:inline">Dark Mode</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breakpoint Showcase */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Monitor className="h-6 w-6 text-brand-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Responsive Breakpoints
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(breakpointInfo).map(([key, info]) => {
              const Icon = info.icon;
              const isActive = key === currentBreakpoint;
              
              return (
                <Card 
                  key={key}
                  className={`
                    transition-all duration-300
                    ${isActive 
                      ? 'ring-2 ring-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                      : 'hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`h-8 w-8 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
                    <div>
                      <h3 className={`font-semibold ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-gray-900 dark:text-white'}`}>
                        {info.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {info.min} - {info.max}
                      </p>
                    </div>
                    {isActive && (
                      <span className="ml-auto px-2 py-1 bg-brand-100 dark:bg-brand-800 text-brand-800 dark:text-brand-200 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Responsive classes available:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['', 'sm:', 'md:', 'lg:', 'xl:', '2xl:'].map(prefix => (
                        <span 
                          key={prefix} 
                          className={`px-2 py-1 text-xs rounded font-mono ${
                            prefix === '' 
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
                              : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                          }`}
                        >
                          {prefix || 'base'}{key}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="h-6 w-6 text-brand-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Color Palette
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {themeColors.map((color) => (
              <Card key={color.name} className="text-center">
                <div className={`w-full h-20 ${color.class} rounded-lg mb-4`}></div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {color.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {color.hex}
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Light</span>
                    <span className="text-gray-500">Dark</span>
                  </div>
                  <div className="flex gap-1">
                    {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                      <div 
                        key={shade}
                        className={`h-4 flex-1 rounded ${
                          shade <= 400 
                            ? `bg-${color.name.toLowerCase().split(' ')[0]}-${shade} dark:bg-${color.name.toLowerCase().split(' ')[0]}-${900 - shade + 100}`
                            : `bg-${color.name.toLowerCase().split(' ')[0]}-${shade} dark:bg-${color.name.toLowerCase().split(' ')[0]}-${900 - shade + 100}`
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <LayoutGrid className="h-6 w-6 text-brand-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Typography Scale
            </h2>
          </div>
          
          <Card>
            <div className="space-y-6">
              {textSizes.map((text) => (
                <div key={text.name} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {text.name}
                    </h3>
                    <p className={`text-gray-900 dark:text-white ${text.class}`}>
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {text.size}
                    <br />
                    <span className="text-xs">{text.class}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Spacing System */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Grid3X3 className="h-6 w-6 text-brand-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Spacing System
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spacingExamples.map((spacing) => (
              <Card key={spacing.name}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {spacing.name}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {spacing.value}
                  </span>
                </div>
                <div className={`bg-brand-100 dark:bg-brand-900/30 border-2 border-dashed border-brand-300 dark:border-brand-600 rounded ${spacing.class} transition-all duration-300 hover:scale-105`}>
                  <div className="bg-white dark:bg-gray-800 h-full w-full rounded flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                    Content
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  Class: {spacing.class}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Responsive Grid Demo */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Grid3X3 className="h-6 w-6 text-brand-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Responsive Grid Layout
            </h2>
          </div>
          
          <Card>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i}
                  className="aspect-square bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Grid Classes:</span> grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Resize your browser to see how the grid adapts to different screen sizes.
              </p>
            </div>
          </Card>
        </section>

        {/* Theme Preview */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Palette className="h-6 w-6 text-brand-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Theme Preview
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Light Theme Preview */}
            <Card className="bg-white">
              <div className="flex items-center gap-2 mb-4">
                <Sun className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Light Theme</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Card Example</h4>
                  <p className="text-gray-600 text-sm">
                    This is how content appears in light mode with proper contrast and readability.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="primary" size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Dark Theme Preview */}
            <Card className="bg-gray-900">
              <div className="flex items-center gap-2 mb-4">
                <Moon className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-white">Dark Theme</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Card Example</h4>
                  <p className="text-gray-300 text-sm">
                    This is how content appears in dark mode with proper contrast and readability.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="primary" size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}