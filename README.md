# ♿ WCAG 2.0 Level AA Compliance Checker

![Demo - File Upload](Accessbility-check1.png)

## 📋 Objective

This application allows developers, QA testers, and accessibility specialists to automatically check HTML files against **WCAG 2.0 Level A and AA** success criteria.  
You can upload a single HTML file or a ZIP archive containing multiple HTML files, and the tool will generate a detailed, downloadable report highlighting **violations**, **passes**, and **elements that need manual review**.

The goal is to make accessibility testing faster, more consistent, and easier to integrate into your development workflow – helping you build inclusive web experiences that comply with legal standards (ADA, Section 508, EU Web Accessibility Directive).

---

## ✨ Features

- ✅ **Upload HTML files or ZIP archives** – bulk check multiple pages.
- ✅ **Real‑time scanning** using `axe-core` (automated WCAG 2.0 AA rules).
- ✅ **Interactive results dashboard** – see violation counts, impact levels, and affected code snippets.
- ✅ **Downloadable HTML report** – shareable, self‑contained compliance report.
- ✅ **Modern UI** – Capgemini‑inspired design with Tailwind CSS, responsive and accessible.
- ✅ **TypeScript & Next.js** – fast, reliable, and easy to extend.

---

## 🖼️ Sample Report Output

After scanning an HTML file, the application displays a summary and detailed violations like this:

![Sample Accessibility Report](Accessbility-report.png)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm / yarn / pnpm

### Installation

```bash
git clone https://github.com/your-username/wcag-checker.git
cd wcag-checker
npm install
