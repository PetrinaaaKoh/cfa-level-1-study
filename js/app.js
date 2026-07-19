// app.js - Main Application

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
            console.log('App starting...');
            await this.loadTopics();
            this.renderTopicList();
            this.setupEventListeners();
            console.log('App started successfully!');
        } catch (error) {
            console.error('App init error:', error);
            alert('Error loading app: ' + error.message);
        }
    }
    
    async loadTopics() {
        console.log('Loading topics from ./data/topics.json...');
        const response = await fetch('./data/topics.json');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to load topics: ' + response.status);
        }
        
        const data = await response.json();
        console.log('Topics data loaded:', data);
        
        this.topics = data.topics || [];
        console.log('Number of topics:', this.topics.length);
        
        // Count total sections for progress
        this.topics.forEach(topic => {
            this.totalSections += 6; // Estimate 6 sections per topic
        });
    }
    
    renderTopicList() {
        console.log('Rendering topic list...');
        const topicList = document.getElementById('topic-list');
        
        if (!topicList) {
            console.error('topic-list element not found!');
            return;
        }
        
        topicList.innerHTML = '';
        
        if (!this.topics || this.topics.length === 0) {
            console.error('No topics to render!');
            topicList.innerHTML = '<li style="padding: 12px; color: red;">No topics loaded</li>';
            return;
        }
        
        this.topics.forEach(topic => {
            console.log('Rendering topic:', topic.name);
            
            const li = document.createElement('li');
            li.className = 'topic-item';
            
            const button = document.createElement('button');
            button.className = 'topic-btn';
            button.setAttribute('data-topic-id', topic.id);
            
            button.innerHTML = `
                <span class="topic-status">☐</span>
                <span class="topic-name">${topic.name}</span>
                <span class="topic-weight">${topic.weight}</span>
            `;
            
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
        
        // Hide welcome, show content
        const welcome = document.getElementById('welcome-screen');
        const content = document.getElementById('topic-content');
        
        if (welcome) welcome.style.display = 'none';
        if (content) content.style.display = 'block';
        
        // Update active state
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-topic-id') === topicId) {
                btn.classList.add('active');
            }
        });
        
        // Load topic content
        try {
            const response = await fetch(`./data/${topicId}.json`);
            if (!response.ok) {
                throw new Error('Failed to load topic content');
            }
            
            const topicData = await response.json();
            this.renderTopicContent(topic, topicData);
        } catch (error) {
            console.error('Error loading topic:', error);
            content.innerHTML = '<p style="color: red;">Error loading topic content</p>';
        }
    }
    
    renderTopicContent(topic, topicData) {
        const content = document.getElementById('topic-content');
        if (!content) return;
        
        let html = `
            <div class="topic-header">
                <h2>${topic.name}</h2>
                <p class="topic-weight-display">Exam Weight: ${topic.weight}</p>
            </div>
            <div id="sections-container">
        `;
        
        if (topicData.sections && topicData.sections.length > 0) {
            topicData.sections.forEach((section, index) => {
                html += `
                    <div class="section">
                        <h3>${section.title}</h3>
                        <div class="section-content">${section.content}</div>
                `;
                
                if (section.keyPoints && section.keyPoints.length > 0) {
                    html += '<div class="key-points"><h4>Key Points</h4><ul>';
                    section.keyPoints.forEach(point => {
                        html += `<li>${point}</li>`;
                    });
                    html += '</ul></div>';
                }
                
                if (section.formulas && section.formulas.length > 0) {
                    html += '<div class="formulas-container"><h4>Formulas</h4>';
                    section.formulas.forEach(formula => {
                        html += `
                            <div class="formula-card">
                                <div class="formula">${formula.expression}</div>
                        `;
                        if (formula.variables) {
                            html += '<dl class="formula-vars">';
                            Object.entries(formula.variables).forEach(([symbol, def]) => {
                                html += `<dt>${symbol}</dt><dd>${def}</dd>`;
                            });
                            html += '</dl>';
                        }
                        html += '</div>';
                    });
                    html += '</div>';
                }
                
                if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                    html += `
                        <div class="section quiz-section">
                            <div class="quiz-header">
                                <h3>Practice Questions</h3>
                                <span id="quiz-progress">0 of ${section.practiceQuestions.length}</span>
                            </div>
                            <div id="quiz-container-${index}"></div>
                            <div id="quiz-controls-${index}" class="quiz-controls"></div>
                        </div>
                    `;
                }
                
                html += `
                    <button class="btn btn-primary" onclick="this.textContent='✓ Completed'; this.className='btn btn-secondary';" style="margin-top: 16px;">
                        Mark as Complete
                    </button>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        // Initialize quizzes
        if (topicData.sections) {
            topicData.sections.forEach((section, index) => {
                if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                    const container = document.getElementById(`quiz-container-${index}`);
                    const controls = document.getElementById(`quiz-controls-${index}`);
                    if (container && controls) {
                        quizEngine.init(section.practiceQuestions);
                    }
                }
            });
        }
    }
    
    setupEventListeners() {
        // Search modal
        const searchBtn = document.getElementById('search-btn');
        const searchModal = document.getElementById('search-modal');
        const closeBtn = document.querySelector('.close-btn');
        
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}