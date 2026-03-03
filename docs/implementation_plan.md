# Nespresso "Brewscape" Implementation Plan & Architecture

Based on the detailed UI/UX analysis of Nespresso and the Dribbble "Brewscape" reference, here is the comprehensive implementation plan and a structured system prompt to kickstart the development of the new, pixel-perfect website.

## 1. Goal Description
The objective is to rebuild the Nespresso web experience using the vibrant, modern, card-based "Brewscape" UI/UX design language. The new application will retain all complex e-commerce functionalities (catalog browsing, intricate product details, cart management, filtering) but present them through a highly engaging, asymmetric, and tactile interface.

The project will prioritize:
*   **Pixel-Perfect Accuracy** to the Dribbble reference (colors, border-radii, typography).
*   **Scalable Architecture** using modern frontend frameworks.
*   **Atomic Design Principles** ensuring highly reusable components.
*   **SOLID & OOP** where applicable in state management and service layers.

---

## 2. Proposed Architecture & Folder Structure

We recommend using **Next.js (App Router)** with **TypeScript** and **Tailwind CSS** (for rapid, pixel-perfect styling) or **Vanilla CSS Modules** if strict framework independence is preferred. For state management, **Zustand** or **Redux Toolkit** is recommended for the complex cart and session states.

### Core Technologies
*   **Framework:** Next.js (React)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Framer Motion (for the micro-animations and parallax effects implied by "torn paper" borders)
*   **State Management:** Zustand
*   **Data Fetching:** React Query / Server Actions

### Atomic Folder Structure
```text
src/
├── app/                  # Next.js App Router (Pages: Home, Shop, Product Detail, Cart)
├── components/           # Atomic UI Components
│   ├── atoms/            # Typography, Buttons, Badges, Icons
│   ├── molecules/        # Form fields, Quantity Steppers, Product Mini-Cards
│   ├── organisms/        # Header, Footer, Hero Section, Product Grids, Cart Drawer
│   └── templates/        # Page Layouts (MainLayout, AuthLayout)
├── lib/                  # Utility functions, helpers
├── services/             # API calls and external integrations (OOP approach)
│   ├── ApiClient.ts      # Base HTTP client
│   └── ProductService.ts # Product fetching logic
├── store/                # Global State (Zustand)
│   └── useCartStore.ts   # Shopping cart state and actions
├── types/                # TypeScript Interfaces and Types
└── assets/               # Images, Fonts, global CSS
    ├── styles/
    │   └── globals.css   # Contains CSS variables for exact color hex codes
```

---

## 3. The Comprehensive Development Prompt
*You can copy and paste the below prompt into a new chat or provide it to your development team/agent to begin coding the project.*

> ### System Prompt: Nespresso "Brewscape" Redesign Generation
> 
> **Role:** You are an elite Frontend Architect and UI/UX Developer with deep expertise in Next.js, React, TypeScript, and CSS/Tailwind. Your mission is to build the front-end of a high-end coffee e-commerce platform that replaces Nespresso's standard UI with a vibrant, modern "Brewscape" design inspired by Dribbble.
> 
> **Core Directives:**
> 1.  **Pixel-Perfect Execution:** Adhere strictly to the reference design. 
>     *   *Colors:* Primary Green (`#006241`), Off-White/Cream (`#F5F5F0`), Deep Black for typography (`#1E1E1E`), Coffee Brown accents.
>     *   *Typography:* Use a bold, heavy Sans-Serif (e.g., *Inter Bold* or *Montserrat Black*) for massive Hero text. Use clean, readable sans-serif for body.
>     *   *Shapes:* Implement heavy use of border-radius (e.g., `rounded-3xl` or `24px+`) for "Bento" style product cards. Use fully rounded "pill" shapes (`rounded-full`) for main call-to-action buttons.
> 2.  **Atomic Design & Reusability:** Build every UI element as a reusable React component following Atomic principles (Atoms -> Molecules -> Organisms). Do not hardcode repeated UI chunks.
> 3.  **Architecture & SOLID:** Use a clear separation of concerns. UI components must *only* handle rendering. Data fetching, business logic (cart calculations), and API calls must be abstracted into dedicated services (`/services`) and custom hooks. Observe the Single Responsibility Principle.
> 4.  **Key Functionalities to Implement:**
>     *   **Dynamic Hero Section:** Massive text overlapping high-res product imagery. Include a "torn paper" SVG or CSS mask divider at the bottom.
>     *   **Product Grid ("New Arrivals"):** Cards must feature a green upper-half background, a white lower-half, product imagery, and an integrated `+/-` quantity stepper directly on the card. Include cup-size selection icons (e.g., Tall, Grande, Venti equivalents).
>     *   **Accordion Details:** The "Whole Beans" section must feature smoothly animating accordions for Description, Ingredients, and Usage.
>     *   **Sticky Header:** A sophisticated top navigation bar that morphs on scroll.
> 
> **Immediate Task:**
> Please initialize the React/Next.js structure. Begin by creating the foundational `tailwind.config.ts` (or `globals.css`) containing the exact color variables. Then, build the `Button`, `ProductCard`, and `QuantityStepper` atomic components. Finally, assemble the `Home` page layout using these components to recreate the provided Brewscape design. Write clean, heavily commented, production-ready TypeScript code.

---

## 4. Verification Plan

### Automated / Syntax Verification
*   **Compile Check:** Ensure the Next.js/React project compiles without TypeScript or exhaustive-deps linting errors.

### Visual & Manual Verification
To ensure the implementation matches the prompt and reference image:
1.  **Browser UI Check:** Serve the application locally (`npm run dev`) and visually compare the rendered Hero, Product Cards, and Accordion sections to the provided Dribbble snippet.
2.  **Color Accuracy:** Use a browser color picker to verify that the rendered green matches exactly `#006241` and the background aligns with the off-white hex.
3.  **Component Interaction:** 
    *   Click the `+` and `-` on the `QuantityStepper` inside a `ProductCard` to ensure the state updates locally.
    *   Click the Accordion headers in the "Whole Beans" section to verify smooth expand/collapse animations.
