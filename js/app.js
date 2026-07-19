// app.js

import { $, $$, createElement, escapeHtml } from './utils.js';
import { progressTracker } from './progress.js';
import { quizEngine } from './quiz-engine.js';
import { router } from './router.js';

/**
 * Main application class
 */
class App {
    constructor() {
        this.topics = [];
        this.currentTopic = null;
        this.currentSection = null;
        this.totalSections = 0;
        
        this.init();
    }
    
    /**
     * Initialize application
     */
    async init() {
        try {
            await this.loadTopics();
            this.setupEventListeners();
            this.setupRoutes();
            this.renderTopicList();
            this.updateOverallProgress();
            
            console.log('CFA Study App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load study materials. Please refresh the page.');
        }
    }
    
    /**
     * Load topics data
     */
    async loadTopics() {
        const response = await fetch('data/topics.json');
        if (!response.ok) {
            throw new Error('Failed to load topics');
        }
        this.topics = await response.json();
        
        // Count total sections
        this.topics.forEach(topic => {
            this.totalSections += topic.sections.length;
        });
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search modal
        const searchBtn = $('#search-btn');
        const searchModal = $('#search-modal');
        const closeBtn = $('.close-btn');
        const searchInput = $('#search-input');
        
        if (searchBtn && searchModal) {
            searchBtn.addEventListener('click', () => {
                searchModal.style.display = 'flex';
                searchInput?.focus();
            });
            
            closeBtn?.addEventListener('click', () => {
                searchModal.style.display = 'none';
            });
            
            searchModal.addEventListener('click', (e) => {
                if (e.target === searchModal) {
                    searchModal.style.display = 'none';
                }
            });
        }
        
        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
    }
    
    /**
     * Setup routes
     */
    setupRoutes() {
        // Home route
        router.register('/', () => {
            this.showWelcome();
        });
        
        // Topic route
        router.register('/topic/:id', () => {
            const params = router.getParams('/topic/:id');
            this.loadTopic(params.id);
        });
    }
    
    /**
     * Render topic list in sidebar
     */
    renderTopicList() {
        const topicList = $('#topic-list');
        if (!topicList) return;
        
        topicList.innerHTML = '';
        
        this.topics.forEach(topic => {
            const topicItem = createElement('li', { className: 'topic-item' });
            
            const topicBtn = createElement('button', {
                className: 'topic-btn',
                dataset: { topicId: topic.id }
            });
            
            const status = createElement('span', {
                className: 'topic-status'
            });
            
            const name = createElement('span', {
                className: 'topic-name',
                textContent: topic.name
            });
            
            const weight = createElement('span', {
                className: 'topic-weight',
                textContent: topic.weight
            });
            
            topicBtn.appendChild(status);
            topicBtn.appendChild(name);
            topicBtn.appendChild(weight);
            
            topicBtn.addEventListener('click', () => {
                router.navigate(`/topic/${topic.id}`);
            });
            
            topicItem.appendChild(topicBtn);
            topicList.appendChild(topicItem);
        });
    }
    
    /**
     * Show welcome screen
     */
    showWelcome() {
        const welcome = $('#welcome-screen');
        const content = $('#topic-content');
        
        if (welcome) welcome.style.display = 'block';
        if (content) content.style.display = 'none';
        
        // Clear active states
        $$('.topic-btn').forEach(btn => btn.classList.remove('active'));
    }
    
    /**
     * Load topic overview
     * @param {string} topicId - Topic ID
     */
    async loadTopics() {
    try {
        console.log('Loading topics from ./data/topics.json');
        const response = await fetch('./data/topics.json');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load topics: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Topics loaded:', data);
        this.topics = data.topics;
        
        this.topics.forEach(topic => {
            this.totalSections += topic.sections.length;
        });
        
        console.log('Total sections:', this.totalSections);
    } catch (error) {
        console.error('Error loading topics:', error);
        this.showError('Failed to load topics: ' + error.message);
    }
}
    
    /**
     * Render topic sections
     * @param {Object} topicData - Topic data
     */
    renderSections(topicData) {
        const container = $('#sections-container');
        if (!container) return;
        
        topicData.sections.forEach((section, index) => {
            const sectionId = `${this.currentTopic.id}-${index}`;
            const isCompleted = progressTracker.isSectionCompleted(sectionId);
            
            const sectionEl = createElement('div', {
                className: 'section',
                dataset: { sectionId }
            });
            
            const header = createElement('h3', {
                textContent: section.title
            });
            
            const content = createElement('div', {
                className: 'section-content',
                innerHTML: section.content
            });
            
            sectionEl.appendChild(header);
            sectionEl.appendChild(content);
            
            // Add key points if available
            if (section.keyPoints && section.keyPoints.length > 0) {
                const keyPoints = createElement('div', { className: 'key-points' });
                const title = createElement('h4', { textContent: 'Key Points' });
                const list = createElement('ul');
                
                section.keyPoints.forEach(point => {
                    const item = createElement('li', { textContent: point });
                    list.appendChild(item);
                });
                
                keyPoints.appendChild(title);
                keyPoints.appendChild(list);
                sectionEl.appendChild(keyPoints);
            }
            
            // Add formulas if available
            if (section.formulas && section.formulas.length > 0) {
                const formulasEl = createElement('div', { className: 'formulas-container' });
                const formulasTitle = createElement('h4', { textContent: 'Formulas' });
                
                section.formulas.forEach(formula => {
                    const formulaCard = createElement('div', { className: 'formula-card' });
                    const formulaEl = createElement('div', { 
                        className: 'formula',
                        textContent: formula.expression 
                    });
                    
                    if (formula.variables) {
                        const varsDl = createElement('dl', { className: 'formula-vars' });
                        Object.entries(formula.variables).forEach(([symbol, definition]) => {
                            const dt = createElement('dt', { textContent: symbol });
                            const dd = createElement('dd', { textContent: definition });
                            varsDl.appendChild(dt);
                            varsDl.appendChild(dd);
                        });
                        formulaCard.appendChild(formulaEl);
                        formulaCard.appendChild(varsDl);
                    } else {
                        formulaCard.appendChild(formulaEl);
                    }
                    
                    formulasEl.appendChild(formulaCard);
                });
                
                sectionEl.appendChild(formulasTitle);
                sectionEl.appendChild(formulasEl);
            }
            
            // Add practice questions
            if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                const quizSection = createElement('div', { 
                    className: 'section quiz-section' 
                });
                
                const quizHeader = createElement('div', { className: 'quiz-header' });
                const quizTitle = createElement('h3', { textContent: 'Practice Questions' });
                const quizProgress = createElement('span', { 
                    id: 'quiz-progress',
                    textContent: `0 of ${section.practiceQuestions.length}` 
                });
                
                quizHeader.appendChild(quizTitle);
                quizHeader.appendChild(quizProgress);
                
                const quizContainer = createElement('div', { id: 'quiz-container' });
                const quizControls = createElement('div', { 
                    id: 'quiz-controls',
                    className: 'quiz-controls' 
                });
                
                quizSection.appendChild(quizHeader);
                quizSection.appendChild(quizContainer);
                quizSection.appendChild(quizControls);
                
                sectionEl.appendChild(quizSection);
                
                // Initialize quiz after rendering
                setTimeout(() => {
                    quizEngine.init(section.practiceQuestions);
                }, 0);
            }
            
            // Mark section as complete button
            const completeBtn = createElement('button', {
                className: `btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`,
                textContent: isCompleted ? '✓ Completed' : 'Mark as Complete',
                style: 'margin-top: 16px;'
            });
            
            completeBtn.addEventListener('click', () => {
                progressTracker.completeSection(sectionId);
                completeBtn.textContent = '✓ Completed';
                completeBtn.className = 'btn btn-secondary';
                this.updateOverallProgress();
                this.updateTopicStatus(this.currentTopic.id);
            });
            
            sectionEl.appendChild(completeBtn);
            container.appendChild(sectionEl);
        });
    }
    
    /**
     * Update topic completion status in sidebar
     * @param {string} topicId - Topic ID
     */
    updateTopicStatus(topicId) {
        const topic = this.topics.find(t => t.id === topicId);
        if (!topic) return;
        
        const topicProgress = progressTracker.getTopicProgress(topicId, topic.sections.length);
        const topicBtn = $(`.topic-btn[data-topic-id="${topicId}"]`);
        
        if (topicBtn) {
            const statusEl = topicBtn.querySelector('.topic-status');
            if (topicProgress.percentage === 100) {
                topicBtn.classList.add('completed');
                statusEl.textContent = '✓';
            } else if (topicProgress.percentage > 0) {
                statusEl.textContent = '◐';
            }
        }
    }
    
    /**
     * Update overall progress indicator
     */
    updateOverallProgress() {
        const progressEl = $('#overall-progress');
        if (!progressEl) return;
        
        const percentage = progressTracker.getOverallProgress(this.totalSections);
        progressEl.textContent = `${Math.round(percentage)}%`;
    }
    
    /**
     * Handle search input
     * @param {Event} e - Input event
     */
    handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = $('#search-results');
        
        if (!resultsContainer || query.length < 2) {
            if (resultsContainer) resultsContainer.innerHTML = '';
            return;
        }
        
        const results = [];
        
        // Search in topics
        this.topics.forEach(topic => {
            if (topic.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'topic',
                    title: topic.name,
                    preview: `Exam Weight: ${topic.weight}`,
                    route: `/topic/${topic.id}`
                });
            }
        });
        
        // Display results
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="padding: 16px; color: var(--text-secondary);">No results found</p>';
        } else {
            resultsContainer.innerHTML = '';
            results.slice(0, 10).forEach(result => {
                const item = createElement('div', {
                    className: 'search-result-item',
                    dataset: { route: result.route }
                });
                
                const title = createElement('div', {
                    className: 'search-result-title',
                    textContent: result.title
                });
                
                const preview = createElement('div', {
                    className: 'search-result-preview',
                    textContent: result.preview
                });
                
                item.appendChild(title);
                item.appendChild(preview);
                
                item.addEventListener('click', () => {
                    router.navigate(result.route);
                    $('#search-modal').style.display = 'none';
                    $('#search-input').value = '';
                });
                
                resultsContainer.appendChild(item);
            });
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const content = $('#topic-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="section" style="text-align: center; padding: 48px 24px;">
                <h3 style="color: #ef4444; margin-bottom: 16px;">Error</h3>
                <p style="color: var(--text-secondary);">${escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="window.location.hash = '/'" style="margin-top: 24px;">
                    Go Home
                </button>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}
