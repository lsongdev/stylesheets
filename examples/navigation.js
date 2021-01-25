
class Navigation {
    constructor(elementOrSelector, options = {}) {
        this.element = typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector)
            : elementOrSelector;

        this.options = {
            type: 'vertical', // vertical, horizontal
            collapsed: false,
            ...options
        };

        this.items = [];
        this.activeId = null;

        // If element exists and has content, we might want to hydrate? 
        // For now, we assume we might build or bind.
        // Let's bind events to existing structure first if present.
        if (this.element) {
            this.bindEvents();
        }
    }

    /**
     * Add a menu item
     * @param {Object} item - { id, label, icon, href, children: [] }
     */
    addMenu(item) {
        this.items.push(item);
        this.render(); // Simple re-render for now
        return this;
    }

    /**
     * Add a submenu to a parent item
     * @param {string} parentId
     * @param {Object} item 
     */
    addSubmenu(parentId, item) {
        const parent = this.findItem(parentId);
        if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(item);
            this.render();
        }
        return this;
    }

    findItem(id, items = this.items) {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.children) {
                const found = this.findItem(id, item.children);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * Set active item by ID
     * @param {string} id 
     */
    setActive(id) {
        this.activeId = id;
        this.updateActiveState();
    }

    updateActiveState() {
        if (!this.element) return;

        const allItems = this.element.querySelectorAll('.navigation-menu li');
        allItems.forEach(li => li.classList.remove('navigation-item-active')); // Check your CSS class name

        // Find the element with the data-id
        // Note: Render implementation needs to add data-id
        const targetLi = this.element.querySelector(`li[data-id="${this.activeId}"]`);
        if (targetLi) {
            targetLi.classList.add('navigation-item-active');

            // Expand parents
            let parent = targetLi.parentElement;
            while (parent && parent !== this.element) {
                if (parent.classList.contains('navigation-submenu')) {
                    // This is a submenu UL
                    parent.style.display = 'block';
                    // The LI containing this UL
                    const parentLi = parent.parentElement;
                    if (parentLi) {
                        parentLi.classList.remove('navigation-item-collapsed');
                        // Add active class to parent too if desired, or just expanded
                    }
                }
                parent = parent.parentElement;
            }
        }
    }

    // Render the navigation structure based on this.items
    render() {
        if (!this.element) return;

        // Clear existing menu if managing fully
        // But maybe we want to keep the brand/search?
        // Let's assume we render the list into .navigation-menu
        let list = this.element.querySelector('.navigation-menu');
        if (!list) {
            list = document.createElement('ul');
            list.className = 'navigation-menu';
            this.element.appendChild(list);
        }

        list.innerHTML = ''; // Clear

        this.items.forEach(item => {
            list.appendChild(this.createItemElement(item));
        });

        this.bindEvents(); // Re-bind events to new elements
        this.updateActiveState();
    }

    createItemElement(item) {
        const li = document.createElement('li');
        if (item.id) li.dataset.id = item.id;

        const a = document.createElement('a');
        a.href = item.href || '#';

        if (item.icon) {
            const i = document.createElement('i');
            i.className = item.icon; // e.g. "fas fa-home"
            a.appendChild(i);
        }

        // Label span
        const span = document.createElement('span');
        span.textContent = item.label;
        a.appendChild(span);

        li.appendChild(a);

        if (item.children && item.children.length > 0) {
            const ul = document.createElement('ul');
            ul.className = 'navigation-submenu';
            item.children.forEach(child => {
                ul.appendChild(this.createItemElement(child));
            });
            li.appendChild(ul);

            // Initial state for submenu?
            // ul.style.display = 'none'; // handled by CSS usually, but we want explicit control
        }

        return li;
    }

    bindEvents() {
        if (!this.element) return;

        // Toggle logic for submenus
        const links = this.element.querySelectorAll('.navigation-menu li a');
        links.forEach(link => {
            // Remove old listener to avoid duplicates if re-binding? 
            // Better to delegate or clone/replace. 
            // Simplest is delegation on the container.
        });

        // Let's use delegation on the container
        this.element.removeEventListener('click', this.handleClick); // cleanup
        this.handleClick = this.handleClick.bind(this);
        this.element.addEventListener('click', this.handleClick);
    }

    handleClick(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const li = link.parentElement;
        const submenu = li.querySelector('.navigation-submenu');

        // If has submenu -> toggle
        if (submenu) {
            e.preventDefault();
            // Toggle collapsed state class for arrow
            li.classList.toggle('navigation-item-collapsed');

            // Toggle visibility
            const isVisible = submenu.style.display === 'block';
            submenu.style.display = isVisible ? 'none' : 'block';
        } else {
            // Leaf item -> Activate
            if (li.dataset.id) {
                this.setActive(li.dataset.id);
            } else {
                // Fallback if manually instantiated without IDs
                // Just do visual active logic
                const all = this.element.querySelectorAll('.navigation-menu li');
                all.forEach(el => el.classList.remove('navigation-item-active'));
                li.classList.add('navigation-item-active');
            }
        }
    }
}

// Web Compoment Wrapper
class NavigationComponent extends HTMLElement {
    constructor() {
        super();
        this.nav = null;
    }

    connectedCallback() {
        // Create the basic structure
        this.innerHTML = `
            <nav class="navigation ${this.getAttribute('type') === 'horizontal' ? 'navigation-horizontal' : 'navigation-vertical'}">
                <div class="navigation-brand">
                    ${this.getAttribute('brand-html') || 'Brand'}
                </div>
                <ul class="navigation-menu"></ul>
            </nav>
        `;

        const navEl = this.querySelector('nav');
        this.nav = new Navigation(navEl);

        // Load data if provided via attribute
        const data = this.getAttribute('data');
        if (data) {
            try {
                const items = JSON.parse(data);
                items.forEach(item => this.nav.addMenu(item));
            } catch (e) {
                console.error('Invalid navigation data JSON', e);
            }
        }
    }

    // Expose Nav instance methods
    addMenu(item) { this.nav.addMenu(item); }
    setActive(id) { this.nav.setActive(id); }
}

customElements.define('x-navigation', NavigationComponent);

// Expose globally for the demo
window.Navigation = Navigation;
