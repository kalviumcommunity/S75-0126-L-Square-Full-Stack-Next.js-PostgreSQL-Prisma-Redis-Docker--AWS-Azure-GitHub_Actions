# Responsive & Themed Design System Documentation

## Overview

This documentation covers the responsive design system and theme implementation for the OpenFare application. The system leverages TailwindCSS v4 with custom configuration to provide a consistent, accessible, and visually appealing user interface across all devices and lighting conditions.

## Table of Contents

- [Tailwind Configuration](#tailwind-configuration)
- [Responsive Design](#responsive-design)
- [Theme System](#theme-system)
- [Design Tokens](#design-tokens)
- [Implementation Examples](#implementation-examples)
- [Testing & Validation](#testing--validation)

## Tailwind Configuration

### Configuration File
The `tailwind.config.js` file contains all custom configurations for the design system:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      // Custom color palette
      colors: {
        brand: { /* Blue color scale */ },
        success: { /* Green color scale */ },
        warning: { /* Amber color scale */ },
        danger: { /* Red color scale */ },
      },
      
      // Custom spacing, typography, and utilities
      spacing: { /* Custom spacing scale */ },
      borderRadius: { /* Custom border radius */ },
      boxShadow: { /* Custom shadows */ },
      fontSize: { /* Custom font sizes */ },
      animation: { /* Custom animations */ },
    },
    
    // Custom breakpoints
    screens: {
      'xs': '475px',    // Extra small devices
      'sm': '640px',    // Small devices
      'md': '768px',    // Medium devices
      'lg': '1024px',   // Large devices
      'xl': '1280px',   // Extra large devices
      '2xl': '1536px',  // 2x extra large devices
    },
  },
  plugins: [],
}
```

### Key Configuration Features

1. **Dark Mode Strategy**: Uses class-based dark mode (`darkMode: 'class'`)
2. **Custom Breakpoints**: Extended with `xs` breakpoint for smaller mobile devices
3. **Extended Color Palette**: Brand-specific colors with full 50-950 scale
4. **Custom Utilities**: Additional spacing, shadows, animations, and typography

## Responsive Design

### Breakpoint System

The design system uses 6 responsive breakpoints:

| Breakpoint | Min Width | Device Type | Typical Use Cases |
|------------|-----------|-------------|-------------------|
| `xs` | 475px | Extra Small Mobile | Small phones, portrait mode |
| `sm` | 640px | Small Mobile | Mobile phones, landscape mode |
| `md` | 768px | Tablet | Tablets, small laptops |
| `lg` | 1024px | Desktop | Standard desktop monitors |
| `xl` | 1280px | Large Desktop | Large desktop monitors |
| `2xl` | 1536px | Extra Large | Ultra-wide monitors |

### Responsive Utility Classes

All Tailwind utility classes can be made responsive by prefixing with breakpoint names:

```jsx
// Responsive padding
<div className="p-2 sm:p-4 md:p-6 lg:p-8">
  {/* Content adapts padding based on screen size */}
</div>

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Grid columns adapt to screen size */}
</div>

// Responsive typography
<h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl">
  {/* Font size increases with screen size */}
</h1>
```

### Implementation Best Practices

1. **Mobile-First Approach**: Start with mobile styles and add larger breakpoints
2. **Consistent Spacing**: Use the custom spacing scale for consistent margins and padding
3. **Flexible Grids**: Use responsive grid classes for content layout
4. **Adaptive Typography**: Scale text sizes appropriately for different viewports

## Theme System

### Dark Mode Implementation

The theme system provides seamless light/dark mode switching with:

- **Class-based Strategy**: Uses `dark:` prefix for dark mode styles
- **Persistent Storage**: Saves user preference in localStorage
- **System Preference Detection**: Respects user's OS theme preference
- **Smooth Transitions**: CSS transitions for theme switching

### Theme Toggle Component

```typescript
// In UIContext.tsx
const toggleTheme = () => {
  setTheme((prev) => {
    const newTheme = prev === "light" ? "dark" : "light";
    // Apply theme to document
    if (typeof window !== "undefined") {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      // Save to localStorage
      localStorage.setItem("theme", newTheme);
    }
    return newTheme;
  });
};
```

### Theme Usage in Components

```jsx
// Example component with theme support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 className="text-brand-600 dark:text-brand-400">Themed Content</h1>
  <p className="text-gray-700 dark:text-gray-300">
    This text adapts to the current theme
  </p>
</div>
```

### Color Contrast Considerations

The design system ensures WCAG AA compliance:

- **Light Theme**: Dark text on light backgrounds
- **Dark Theme**: Light text on dark backgrounds
- **Interactive Elements**: Sufficient contrast for buttons and links
- **Focus States**: Visible focus indicators for keyboard navigation

## Design Tokens

### Color Palette

#### Brand Colors
- **Primary Blue**: `brand-500` (#3b82f6) - Main brand color
- **Secondary Blue**: Scale from `brand-100` to `brand-900`

#### Semantic Colors
- **Success**: Green scale for positive actions and feedback
- **Warning**: Amber scale for cautionary messages
- **Danger**: Red scale for errors and destructive actions

#### Grayscale
- **Light Theme**: White to gray-900
- **Dark Theme**: Gray-50 to black

### Typography Scale

| Name | Class | Size | Use Case |
|------|-------|------|----------|
| Heading 1 | `text-4xl` | 2.25rem | Main page titles |
| Heading 2 | `text-3xl` | 1.875rem | Section headings |
| Heading 3 | `text-2xl` | 1.5rem | Subsection headings |
| Body Large | `text-lg` | 1.125rem | Lead paragraphs |
| Body Regular | `text-base` | 1rem | Standard text |
| Body Small | `text-sm` | 0.875rem | Supporting text |

### Spacing System

Custom spacing values for consistent layout:

- `18`: 4.5rem (72px)
- `88`: 22rem (352px)
- `92`: 23rem (368px)
- `128`: 32rem (512px)

### Shadow System

Three levels of shadows for depth:

- `soft`: Subtle elevation (`0 2px 10px rgba(0, 0, 0, 0.05)`)
- `medium`: Moderate elevation (`0 4px 20px rgba(0, 0, 0, 0.1)`)
- `strong`: Strong elevation (`0 8px 30px rgba(0, 0, 0, 0.15)`)

## Implementation Examples

### Responsive Card Component

```tsx
// Card.tsx with responsive design
const Card = ({ children, title, className = '' }: CardProps) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      rounded-xl shadow-medium
      p-4 sm:p-6
      border border-gray-200 dark:border-gray-700
      transition-all duration-300
      hover:shadow-strong
      ${className}
    `}>
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
```

### Responsive Navigation

```tsx
// Header with responsive navigation
const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - responsive sizing */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-600 dark:text-brand-400">
              OpenFare
            </h1>
          </div>
          
          {/* Navigation - responsive visibility */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-brand-600">
              Home
            </a>
            {/* More navigation items */}
          </nav>
          
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
```

### Theme-Aware Button

```tsx
// Button with theme support
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseClasses = 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 dark:focus:ring-offset-gray-800',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:focus:ring-gray-400',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500 dark:focus:ring-offset-gray-800'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
```

## Testing & Validation

### Device Testing Checklist

✅ **Mobile Devices** (320px - 475px)
- [ ] Content is readable without horizontal scrolling
- [ ] Touch targets are appropriately sized (minimum 44px)
- [ ] Navigation is accessible via hamburger menu
- [ ] Forms are usable on small screens

✅ **Tablet Devices** (768px - 1024px)
- [ ] Layout adapts to landscape/portrait orientation
- [ ] Grid systems display correctly
- [ ] Images and media scale appropriately
- [ ] Interactive elements are easily tappable

✅ **Desktop Devices** (1024px+)
- [ ] Content uses available space effectively
- [ ] Multi-column layouts display properly
- [ ] Hover states work correctly
- [ ] Keyboard navigation is smooth

### Theme Testing

✅ **Light Theme**
- [ ] Text has sufficient contrast against backgrounds
- [ ] Interactive elements are clearly visible
- [ ] Focus states are distinguishable
- [ ] Images and icons are properly visible

✅ **Dark Theme**
- [ ] Text remains readable on dark backgrounds
- [ ] No washed-out colors or poor contrast
- [ ] Focus indicators are visible
- [ ] All components adapt correctly

### Accessibility Validation

✅ **WCAG Compliance**
- [ ] Color contrast ratios meet AA standards
- [ ] Semantic HTML structure
- [ ] Proper ARIA attributes where needed
- [ ] Keyboard navigation support

✅ **Screen Reader Testing**
- [ ] All interactive elements are announced
- [ ] Form labels are properly associated
- [ ] Landmark regions are defined
- [ ] Dynamic content updates are announced

### Performance Testing

✅ **Loading Performance**
- [ ] CSS is optimized and minified
- [ ] No unnecessary repaints during theme switching
- [ ] Responsive images load appropriately
- [ ] Critical CSS is inlined

## Demo and Testing

A comprehensive demo page is available at `/demo/responsive` showcasing:

- ✅ All responsive breakpoints with live detection
- ✅ Complete color palette with light/dark variations
- ✅ Typography scale with real-world examples
- ✅ Spacing system visualization
- ✅ Responsive grid layouts
- ✅ Theme switching with localStorage persistence
- ✅ Real-time breakpoint indicator

### Testing Instructions

1. Visit `/demo/responsive` in your browser
2. Resize the window to test different breakpoints
3. Use browser DevTools device toolbar for precise testing
4. Toggle between light and dark themes
5. Test keyboard navigation and screen reader compatibility

## Best Practices

### Responsive Design
- Use mobile-first approach in CSS
- Test on actual devices when possible
- Consider touch target sizes for mobile
- Implement progressive enhancement

### Theme Implementation
- Always provide theme fallbacks
- Test theme transitions for smoothness
- Consider reduced motion preferences
- Validate color contrast in both themes

### Performance
- Use `prefers-reduced-motion` media query
- Optimize CSS bundle size
- Implement efficient theme switching
- Lazy load non-critical responsive images

---

*This responsive design system provides a solid foundation for creating accessible, performant, and visually consistent user interfaces across all devices and viewing conditions.*