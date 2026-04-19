# Accessibility Rules – WCAG 2.0 Level AA (Custom)

## Rule: 1.1.1 – Non-text Content (A)

- **Impact**: critical
- **Description**: All images must have an alternative text.
- **Check**: `img:not([alt])` – fail if any image lacks `alt` attribute.

## Rule: 1.3.1 – Info and Relationships (A)

- **Impact**: serious
- **Description**: Headings must be properly nested (h1 > h2 > h3 ...).
- **Check**: JavaScript function that checks heading order.

## Rule: 1.4.3 – Contrast (AA)

- **Impact**: serious
- **Description**: Text must have contrast ratio ≥4.5:1 (normal) or ≥3:1 (large).
- **Check**: Use `color-contrast` library (we'll implement with WCAG contrast formula).

## Rule: 2.4.1 – Bypass Blocks (A)

- **Impact**: moderate
- **Description**: Provide a "Skip to content" link.
- **Check**: `a[href="#main"], a[href="#content"], .skip-link` exists and is focusable.

## Rule: 4.1.2 – Name, Role, Value (A)

- **Impact**: critical
- **Description**: Custom controls must have ARIA roles and accessible names.
- **Check**: Any element with `role` but missing `aria-label` or `aria-labelledby` fails.

## Rule: Custom – No Flashing Content (AAA)

- **Impact**: moderate
- **Description**: No element flashes more than 3 times per second.
- **Check**: Search for `blink` or `animation` with `infinite` and short duration.
