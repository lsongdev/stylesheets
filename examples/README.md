# CSS Library Showcase

This example demonstrates the CSS components library with a Vercel/Cloudflare-style admin dashboard interface.

## Features Demonstrated

- **Sidebar Navigation**: Using `sidebar.css` with collapsible menus
- **Cards**: Using `card.css` for content containers
- **Grid System**: Using `grid.css` for responsive layouts
- **Forms**: Using `form.css`, `input.css`, `select.css`, and `checkbox.css`
- **Buttons**: Using `button.css` with various styles and sizes
- **Tables**: Using `table.css` for data presentation
- **Responsive Design**: Adapts to different screen sizes

## Components Included

- Sidebar navigation with collapsible sections
- Header with search and user actions
- Statistics cards with metrics
- Data tables with status indicators
- Form elements with various input types
- Button variations (primary, success, warning, danger)
- Checkbox and radio controls
- Responsive grid layouts

## How to Use

Open `dashboard.html` in your browser to view the example. The page showcases various components from the CSS library in a cohesive admin dashboard layout similar to Vercel or Cloudflare's interfaces.

## Customization

Global semantic token definitions are centralized in `base.css`:

- Override semantic tokens such as `--color-primary` and `--color-surface` to theme the whole library.
- Override component tokens such as `--input-padding` or `--button-border-radius` for a single component or subtree.
- Use `data-theme="light"`, `data-theme="dark"`, or `data-theme="auto"` on the root or a local container.
- Deprecated aliases live in `legacy.css`; new projects can omit that compatibility file.

Open `tokens.html` for live global, component-level, light, and dark override examples.
