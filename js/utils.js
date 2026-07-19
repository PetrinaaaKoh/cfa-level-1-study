// utils.js

/**
 * Safely query DOM element
 * @param {string} selector - CSS selector
 * @returns {Element|null}
 */
export function $(selector) {
    return document.querySelector(selector);
}

/**
 * Query all matching elements
 * @param {string} selector - CSS selector
 * @returns {NodeList}
 */
export function $$(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - HTML attributes
 * @param {string|Element} content - Inner content
 * @returns {Element}
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (content) {
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Element) {
            element.appendChild(content);
        }
    }
    
    return element;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string}
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @returns {string}
 */
export function formatPercentage(value) {
    return `${Math.round(value)}%`;
}

/**
 * Shuffle array (Fisher-Yates)
 * @param {Array} array - Array to shuffle
 * @returns {Array}
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
