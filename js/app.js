// app.js
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
            await this.loadTopics();
            this.renderTopicList();
            this.setupEventListeners();
        } catch (error) {
            console.error('Init error:', error);
        }
    }
    
    async loadTopics() {
        const response = await fetch('./data/topics.json');
        if (!response.ok) throw new Error('Failed to load topics');
        const data = await response.json();
        this.topics = data.topics || [];
        console.log('Loaded', this.topics.length, 'topics');
        this.totalSections = this.topics.length * 6;
    }
    
    renderTopicList() {
        const topicList = document.getElementById('topic-list');
        if (!topicList) return;
        topicList.innerHTML = '';
        this.topics.forEach(topic => {
            const li = document.createElement('li');
            li.className = 'topic-item';
            const button = document.createElement('button');
            button.className = 'topic-btn';
            button.setAttribute('data-topic-id', topic.id);
            button.innerHTML = '<span class="topic-status">☐</span><span class="topic-name">' + topic.name + '</span><span class="topic-weight">' + topic.weight + '</span>';
            button.addEventListener('click', () => this.loadTopic(topic.id));
            li.appendChild(button);
            topicList.appendChild(li);
        });
        console.log('Rendered', this.topics.length, 'topics');
    }
    
    async loadTopic(topicId) {
        const topic = this.topics.find(t => t.id === topicId);
        if (!topic) return;
        const welcome = document.getElementById('welcome-screen');
        const content = document.getElementById('topic-content');
        if (welcome) welcome.style.display = 'none';
        if (content) content.style.display = 'block';
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-topic-id') === topicId) btn.classList.add('active');
        });
        try {
            const response = await fetch('./data/' + topicId + '.json');
            if (!response.ok) throw new Error('Failed');
            const topicData = await response.json();
            this.renderTopicContent(topic, topicData);
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    renderTopicContent(topic, topicData) {
        const content = document.getElementById('topic-content');
        if (!content) return;
        let html = '<div class="topic-header"><h2>' + topic.name + '</h2><p>Exam Weight: ' + topic.weight + '</p></div>';
        if (topicData.sections) {
            topicData.sections.forEach((section, idx) => {
                html += '<div class="section"><h3>' + section.title + '</h3><div class="section-content">' + section.content + '</div>';
                if (section.keyPoints) {
                    html += '<div class="key-points"><h4>Key Points</h4><ul>';
                    section.keyPoints.forEach(pt => html += '<li>' + pt + '</li>');
                    html += '</ul></div>';
                }
                if (section.formulas) {
                    html += '<h4>Formulas</h4>';
                    section.formulas.forEach(f => html += '<div class="formula-card"><div class="formula">' + f.expression + '</div></div>');
                }
                if (section.practiceQuestions) {
                    html += '<div class="quiz-section"><h3>Practice Questions</h3><div id="quiz-' + idx + '"></div><div id="quiz-controls-' + idx + '" class="quiz-controls"></div></div>';
                }
                html += '<button class="btn btn-primary" style="margin-top:16px" onclick="this.textContent=\'Completed\';this.className=\'btn btn-secondary\'">Mark as Complete</button></div>';
            });
        }
        content.innerHTML = html;
        if (topicData.sections) {
            topicData.sections.forEach((section, idx) => {
                if (section.practiceQuestions) {
                    const container = document.getElementById('quiz-' + idx);
                    if (container) quizEngine.init(section.practiceQuestions);
                }
            });
        }
    }
    
    setupEventListeners() {
        const searchBtn = document.getElementById('search-btn');
        const searchModal = document.getElementById('search-modal');
        if (searchBtn && searchModal) {
            searchBtn.addEventListener('click', () => searchModal.style.display = 'flex');
            searchModal.addEventListener('click', (e) => {
                if (e.target === searchModal) searchModal.style.display = 'none';
            });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}