# Cafrezzo Admin Panel Complete Documentation

This document outlines the **Full Admin Panel Features & Specifications**. It defines every module, screen, and capability required for the store administrator to have **100% control** over the Cafrezzo e-commerce webapp without writing any code.

---

## 1. Dashboard & Analytics
The central hub for store overview and performance monitoring.

- **Key Metrics:** Total revenue, active orders, new users, and newsletter signups.
- **Recent Activity:** Live feed of the latest orders placed, reviews submitted, and returns requested.
- **Conversion Charts:** Visual graphs showing sales over time, top-selling coffee beans/machines, and payment method usage.

---

## 2. Storefront Control (CMS)
Total control over the visual presentation and marketing messages on the webapp.

### A. Top Bar & Promo Strip (Toggle Text Slides)
- **Manage Slides:** Add, edit, or delete the sliding promotional text (e.g., "Free Shipping over €50", "Summer Sale: 20% Off Beans").
- **Toggles:** Turn the promo strip on or off instantly. Set automated start and end dates for promotions.

### B. Hero & Banners
- **Homepage Carousel:** Upload desktop and mobile images for the main hero section.
- **Copy & CTA Control:** Edit the headline, sub-headline, button text, and destination URL for each banner.

### C. Featured Sections
- **Dynamic Selection:** Choose which specific products appear in the "Featured Products", "Featured Machines", or "New Arrivals" sections on the homepage.
- **Drag & Drop Ordering:** Re-order how items appear in featured carousels.

### D. Heritage & Brands Data
- **About Us / Story:** Update the text and imagery for the "Heritage" section on the homepage and the about pages.
- **Brand Logos:** Manage the logos and names of partner brands displayed in the footer or designated brand sections.

### E. Static Pages & Legal
- **Rich Text Editor:** Fully edit the FAQ, Terms & Conditions, Privacy Policy, and Shipping Info pages.

---

## 3. Product & Catalog Management (E-commerce)
Manage all tangible goods sold on the platform.

### A. Unified Product Editor (Beans, Machines, Accessories, Sweets)
- **Create / Edit / Delete:** Full CRUD operations for all database items.
- **Basic Info:** Name, translated name (FR/EN), slug (URL), base price, promotional original price.
- **Media Gallery:** Upload and reorder multiple, high-resolution product images.
- **Rich Data:** 
  - Define characteristics using sliders (e.g., Intensity 1-13, Bitterness, Acidity, Roastiness).
  - Add nested accordion features (Specs, Machine Compatibility, Origins).
- **Inventory & Variants:** Toggle stock status (In Stock / Out of Stock). Manage bulk "Sale Units" (e.g., Pack of 10 vs. Pack of 50).

### B. Categories & Tags
- Manage hierarchical categories (Coffee > Nespresso Compatible) and assign marketing tags (e.g., "Eco-Friendly", "Best Seller").

---

## 4. Order & Fulfillment Management
Process customer purchases from checkout to delivery.

### A. Order Dashboard
- **View All Orders:** Table with advanced filtering (Date, Status, Payment Method, User).
- **Order Details Page:** See exactly what was ordered, applied promo codes, shipping address, and payment reference numbers.

### B. Status Updates & Fulfillment
- **Manage Status:** Manually update an order from `Pending` → `Processing` → `Shipped` → `Delivered`.
- **Automated Communication:** Changing a status naturally triggers the corresponding email and push notification to the user.
- **Tracking Info:** Input shipping carrier and tracking numbers to be reflected on the user's dashboard.

### C. Returns & Refunds
- **Return Requests:** Review customer return requests made from the webapp.
- **Approve/Reject:** Process refunds back to the original payment method or issue Store Credit / Loyalty Points.

---

## 5. User & Customer Management
Understand and manage the customer base.

### A. User Profiles
- **User Database:** Search users by name, email, or registration date.
- **Customer View:** Click on any user to see their **entire order history**, saved addresses, and active wishlist.
- **Loyalty Points (Café Rewards):** View a user's specific point balance, current tier (e.g., Barista Elite), and manually add or deduct points for customer service reasons.

### B. Reviews & Testimonials
- **Review Moderation:** All product reviews submitted by users land here in a `Pending` state.
- **Approve/Reject:** Read the comment, verify the star rating, toggle the "Verified Purchase" badge, and approve it to appear live on the product page or homepage testimonial section.

### C. Newsletter Subscribers
- **Subscriber List:** View and export all emails collected from the Footer Newsletter input.
- **Broadcasts:** (Integration point) Sync this list to Mailchimp, SendGrid, or native broadcast tools.

---

## 6. System, Payments & Notifications setup
Deep system controls that dictate how the store operates.

### A. Checkout & Payment Settings
- **Enable / Disable Gateways:** Simple toggle switches to turn payment methods ON or OFF instantly.
  - Switch off `Cash on Delivery` during certain seasons.
  - Toggle `Stripe (Credit/Debit)`, `Apple Pay`, or `Wise` based on operational needs.
- **Thresholds:** Set minimum order values for specific payment methods or free shipping.

### B. Email Configurations & System Notifications
- **Email Templates:** View and modify the text/HTML used for automated system emails (Order Confirmation, Order Dispatched, Return Approved, Password Reset).
- **App Notifications:** Generate custom "System Notifications" that will appear in the user's Notification Center (the bell icon on the webapp) to announce sales or store news.

### C. Tax & Shipping Rules
- Manage flat-rate shipping costs, define tax zones, and set global VAT percentages.

---
*The administration interface applies these changes instantly to the Next.js Storefront via API integrations, ensuring complete real-time control.*
