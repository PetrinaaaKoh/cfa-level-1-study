// app.js - CFA Study Application (Standalone Version)

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
        this.topics = data.topics || [];
        console.log('Loaded', this.topics.length, 'topics');
        this.totalSections = this.topics.length * 6;
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
            return;
        }
        
        this.topics.forEach(topic => {
            const li = document.createElement('li');
            li.className = 'topic-item';
            
            const button = document.createElement('button');
            button.className = 'topic-btn';
            button.setAttribute('data-topic-id', topic.id);
            
            button.innerHTML = '<span class="topic-status">☐</span>' +
                '<span class="topic-name">' + topic.name + '</span>' +
                '<span class="topic-weight">' + topic.weight + '</span>';
            
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
        
        const welcome = document.getElementById('welcome-screen');
        const content = document.getElementById('topic-content');
        
        if (welcome) welcome.style.display = 'none';
        if (content) content.style.display = 'block';
        
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-topic-id') === topicId) {
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
            console.log('Topic data loaded, sections:', topicData.sections ? topicData.sections.length : 0);
            this.renderTopicContent(topic, topicData);
        } catch (error) {
            console.error('Error loading topic:', error);
            if (content) {
                content.innerHTML = '<div class="section"><p style="color: red;">Error loading content: ' + error.message + '</p></div>';
            }
        }
    }
    
    renderTopicContent(topic, topicData) {
        const content = document.getElementById('topic-content');
        if (!content) return;
        
        let html = '<div class="topic-header"><h2>' + topic.name + '</h2>' +
            '<p class="topic-weight-display">Exam Weight: ' + topic.weight + '</p></div>' +
            '<div id="sections-container">';
        
        if (topicData.sections && topicData.sections.length > 0) {
            topicData.sections.forEach((section, index) => {
                const sectionId = topic.id + '-' + index;
                
                html += '<div class="section" data-section-id="' + sectionId + '">' +
                    '<h3>' + section.title + '</h3>' +
                    '<div class="section-content">' + section.content + '</div>';
                
                if (section.keyPoints && section.keyPoints.length > 0) {
                    html += '<div class="key-points"><h4>Key Points</h4><ul>';
                    section.keyPoints.forEach(point => {
                        html += '<li>' + point + '</li>';
                    });
                    html += '</ul></div>';
                }
                
                if (section.formulas && section.formulas.length > 0) {
                    html += '<h4>Formulas</h4>';
                    section.formulas.forEach(formula => {
                        html += '<div class="formula-card"><div class="formula">' + formula.expression + '</div></div>';
                    });
                }
                
                if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                    console.log('Section', index, 'has', section.practiceQuestions.length, 'questions');
                    html += '<div class="section quiz-section" style="margin-top: 32px;">' +
                        '<div class="quiz-header">' +
                        '<h3>Practice Questions</h3>' +
                        '<span id="quiz-progress-' + sectionId + '">0 of ' + section.practiceQuestions.length + '</span>' +
                        '</div>' +
                        '<div id="quiz-container-' + sectionId + '"></div>' +
                        '<div id="quiz-controls-' + sectionId + '" class="quiz-controls"></div>' +
                        '</div>';
                }
                
                html += '<button class="btn btn-primary" style="margin-top: 16px;" ' +
                    'onclick="this.textContent=\'✓ Completed\'; this.className=\'btn btn-secondary\';">' +
                    'Mark as Complete</button></div>';
            });
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        console.log('Content rendered, initializing quizzes...');
        
        // Initialize quizzes after DOM is ready
        setTimeout(() => {
            if (topicData.sections) {
                topicData.sections.forEach((section, index) => {
                    if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                        const sectionId = topic.id + '-' + index;
                        const container = document.getElementById('quiz-container-' + sectionId);
                        const controls = document.getElementById('quiz-controls-' + sectionId);
                        
                        console.log('Quiz container:', container ? 'FOUND' : 'NOT FOUND');
                        console.log('Quiz controls:', controls ? 'FOUND' : 'NOT FOUND');
                        
                        if (container && controls) {
                            console.log('Initializing quiz with', section.practiceQuestions.length, 'questions');
                            if (typeof quizEngine !== 'undefined' && quizEngine && quizEngine.init) {
                                quizEngine.init(section.practiceQuestions);
                                console.log('Quiz initialized successfully!');
                            } else {
                                console.error('quizEngine not available!');
                                container.innerHTML = '<p>Quiz engine not loaded. Please refresh the page.</p>';
                            }
                        } else {
                            console.error('Quiz container or controls not found for section', index);
                        }
                    }
                });
            }
        }, 300);
    }
    
    setupEventListeners() {
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