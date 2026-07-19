// app.js - CFA Study Application

import { $, $$, createElement, escapeHtml, shuffleArray } from './utils.js';
import { progressTracker } from './progress.js';
import { quizEngine } from './quiz-engine.js';

class App {
    constructor() {
        this.topics = [];
        this.totalSections = 0;
        this.init();
    }
    
    async init() {
        try {
            console.log('App initializing...');
            await this.loadTopics();
            this.renderTopicList();
            this.setupEventListeners();
            console.log('App initialized successfully!');
        } catch (error) {
            console.error('Init error:', error);
            alert('Error loading app: ' + error.message);
        }
    }
    
    async loadTopics() {
        console.log('Loading topics...');
        const response = await fetch('./data/topics.json');
        if (!response.ok) {
            throw new Error('Failed to load topics: ' + response.status);
        }
        
        const data = await response.json();
        console.log('Topics data:', data);
        
        this.topics = data.topics || [];
        console.log('Loaded', this.topics.length, 'topics');
        
        this.totalSections = this.topics.length * 6;
    }
    
    renderTopicList() {
        console.log('Rendering topic list...');
        const topicList = $('#topic-list');
        if (!topicList) {
            console.error('topic-list element not found!');
            return;
        }
        
        topicList.innerHTML = '';
        
        if (!this.topics || this.topics.length === 0) {
            console.error('No topics to render!');
            return;
        }
        
        this.topics.forEach(topic => {
            const li = createElement('li', { className: 'topic-item' });
            
            const button = createElement('button', {
                className: 'topic-btn',
                dataset: { topicId: topic.id }
            });
            
            const status = createElement('span', {
                className: 'topic-status',
                textContent: '☐'
            });
            
            const name = createElement('span', {
                className: 'topic-name',
                textContent: topic.name
            });
            
            const weight = createElement('span', {
                className: 'topic-weight',
                textContent: topic.weight
            });
            
            button.appendChild(status);
            button.appendChild(name);
            button.appendChild(weight);
            
            button.addEventListener('click', () => {
                console.log('Topic clicked:', topic.id);
                this.loadTopic(topic.id);
            });
            
            li.appendChild(button);
            topicList.appendChild(li);
        });
        
        console.log('Topic list rendered with', this.topics.length, 'topics');
    }
    
    async loadTopic(topicId) {
        console.log('Loading topic:', topicId);
        
        const topic = this.topics.find(t => t.id === topicId);
        if (!topic) {
            console.error('Topic not found:', topicId);
            return;
        }
        
        const welcome = $('#welcome-screen');
        const content = $('#topic-content');
        
        if (welcome) welcome.style.display = 'none';
        if (content) content.style.display = 'block';
        
        $$('.topic-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.topicId === topicId) {
                btn.classList.add('active');
            }
        });
        
        try {
            console.log('Loading content from ./data/' + topicId + '.json');
            const response = await fetch('./data/' + topicId + '.json');
            if (!response.ok) {
                throw new Error('Failed to load content: ' + response.status);
            }
            
            const topicData = await response.json();
            console.log('Topic data loaded:', topicData);
            this.renderTopicContent(topic, topicData);
        } catch (error) {
            console.error('Error loading topic:', error);
            if (content) {
                content.innerHTML = '<div class="section"><p style="color: red;">Error loading content: ' + error.message + '</p></div>';
            }
        }
    }
    
    renderTopicContent(topic, topicData) {
        const content = $('#topic-content');
        if (!content) return;
        
        let html = `
            <div class="topic-header">
                <h2>${escapeHtml(topic.name)}</h2>
                <p class="topic-weight-display">Exam Weight: ${escapeHtml(topic.weight)}</p>
            </div>
            <div id="sections-container">
        `;
        
        if (topicData.sections && topicData.sections.length > 0) {
            topicData.sections.forEach((section, index) => {
                const sectionId = topic.id + '-' + index;
                
                html += `
                    <div class="section" data-section-id="${sectionId}">
                        <h3>${escapeHtml(section.title)}</h3>
                        <div class="section-content">${section.content}</div>
                `;
                
                if (section.keyPoints && section.keyPoints.length > 0) {
                    html += `
                        <div class="key-points">
                            <h4>Key Points</h4>
                            <ul>
                    `;
                    section.keyPoints.forEach(point => {
                        html += `<li>${escapeHtml(point)}</li>`;
                    });
                    html += `</ul></div>`;
                }
                
                if (section.formulas && section.formulas.length > 0) {
                    html += `<h4>Formulas</h4>`;
                    section.formulas.forEach(formula => {
                        html += `
                            <div class="formula-card">
                                <div class="formula">${escapeHtml(formula.expression)}</div>
                        `;
                        if (formula.variables) {
                            html += `<dl class="formula-vars">`;
                            Object.entries(formula.variables).forEach(([symbol, def]) => {
                                html += `<dt>${escapeHtml(symbol)}</dt><dd>${escapeHtml(def)}</dd>`;
                            });
                            html += `</dl>`;
                        }
                        html += `</div>`;
                    });
                }
                
                if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                    console.log('Section', index, 'has', section.practiceQuestions.length, 'questions');
                    html += `
                        <div class="section quiz-section" style="margin-top: 32px;">
                            <div class="quiz-header">
                                <h3>Practice Questions</h3>
                                <span id="quiz-progress-${sectionId}">0 of ${section.practiceQuestions.length}</span>
                            </div>
                            <div id="quiz-container-${sectionId}"></div>
                            <div id="quiz-controls-${sectionId}" class="quiz-controls"></div>
                        </div>
                    `;
                }
                
                const isCompleted = progressTracker.isSectionCompleted(sectionId);
                html += `
                    <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}" 
                            data-section-id="${sectionId}"
                            style="margin-top: 16px;"
                            onclick="document.querySelector('[data-section-id=\\"${sectionId}\\"] button').textContent='✓ Completed'; document.querySelector('[data-section-id=\\"${sectionId}\\"] button').className='btn btn-secondary';">
                        ${isCompleted ? '✓ Completed' : 'Mark as Complete'}
                    </button>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        content.innerHTML = html;
        
        console.log('Content rendered, initializing quizzes...');
        
        setTimeout(() => {
            if (topicData.sections) {
                topicData.sections.forEach((section, index) => {
                    if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                        const sectionId = topic.id + '-' + index;
                        const container = $('#quiz-container-' + sectionId);
                        const controls = $('#quiz-controls-' + sectionId);
                        
                        console.log('Quiz container for section', index, ':', container ? 'FOUND' : 'NOT FOUND');
                        console.log('Quiz controls for section', index, ':', controls ? 'FOUND' : 'NOT FOUND');
                        
                        if (container && controls) {
                            console.log('Initializing quiz with', section.practiceQuestions.length, 'questions');
                            console.log('First question:', section.practiceQuestions[0].question.substring(0, 50) + '...');
                            quizEngine.init(section.practiceQuestions);
                        } else {
                            console.error('Quiz container or controls not found for section', index);
                        }
                    }
                });
            }
        }, 200);
    }
    
    setupEventListeners() {
        const searchBtn = $('#search-btn');
        const searchModal = $('#search-modal');
        const closeBtn = $('.close-btn');
        
        if (searchBtn && searchModal) {
            searchBtn.addEventListener('click', () => {
                searchModal.style.display = 'flex';
            });
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    searchModal.style.display = 'none';
                });
            }
            
            searchModal.addEventListener('click', (e) => {
                if (e.target === searchModal) {
                    searchModal.style.display = 'none';
                }
            });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}