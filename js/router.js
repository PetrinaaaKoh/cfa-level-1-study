// router.js

/**
 * Simple hash-based router for SPA navigation
 */
export class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }
    
    /**
     * Register a route
     * @param {string} path - Route path (hash)
     * @param {Function} handler - Route handler function
     */
    register(path, handler) {
        this.routes[path] = handler;
    }
    
    /**
     * Navigate to a route
     * @param {string} path - Route path
     */
    navigate(path) {
        window.location.hash = path;
    }
    
    /**
     * Handle route change
     */
    handleRouteChange() {
        const hash = window.location.hash.slice(1) || '/';
        const route = this.routes[hash] || this.routes['/'];
        
        if (route) {
            this.currentRoute = hash;
            route();
        }
    }
    
    /**
     * Get current route parameters
     * @param {string} pattern - Route pattern (e.g., '/topic/:id')
     * @returns {Object}
     */
    getParams(pattern) {
        const hash = window.location.hash.slice(1);
        const patternParts = pattern.split('/');
        const hashParts = hash.split('/');
        
        const params = {};
        patternParts.forEach((part, index) => {
            if (part.startsWith(':')) {
                params[part.slice(1)] = hashParts[index];
            }
        });
        
        return params;
    }
}

// Export singleton instance
export const router = new Router();
