// app.js - Simple Version

class App {
    constructor() {
        this.topics = [];
        this.init();
    }
    
    async init() {
        await this.loadTopics();
        this.renderTopicList();
        this.setupEventListeners();
    }
    
    async loadTopics() {
        const response = await fetch('./data/topics.json');
        const data = await response.json();
        this.topics = data.topics;
        console.log('Loaded', this.topics.length, 'topics');
    }
    
    renderTopicList() {
        const topicList = document.getElementById('topic-list');
        topicList.innerHTML = '';
        
        this.topics.forEach(function(topic) {
            const li = document.createElement('li');
            li.className = 'topic-item';
            
            const btn = document.createElement('button');
            btn.className = 'topic-btn';
            btn.setAttribute('data-topic-id', topic.id);
            
            const status = document.createElement('span');
            status.className = 'topic-status';
            status.textContent = '\u2610';
            
            const name = document.createElement('span');
            name.className = 'topic-name';
            name.textContent = topic.name;
            
            const weight = document.createElement('span');
            weight.className = 'topic-weight';
            weight.textContent = topic.weight;
            
            btn.appendChild(status);
            btn.appendChild(name);
            btn.appendChild(weight);
            
            btn.addEventListener('click', function() {
                window.app.loadTopic(topic.id);
            });
            
            li.appendChild(btn);
            topicList.appendChild(li);
        });
    }
    
    async loadTopic(topicId) {
        const topic = this.topics.find(function(t) {
            return t.id === topicId;
        });
        if (!topic) return;
        
        const welcome = document.getElementById('welcome-screen');
        const content = document.getElementById('topic-content');
        
        if (welcome) welcome.style.display = 'none';
        if (content) content.style.display = 'block';
        
        const buttons = document.querySelectorAll('.topic-btn');
        buttons.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-topic-id') === topicId) {
                btn.classList.add('active');
            }
        });
        
        const response = await fetch('./data/' + topicId + '.json');
        const topicData = await response.json();
        this.renderTopicContent(topic, topicData);
    }
    
    renderTopicContent(topic, topicData) {
        const content = document.getElementById('topic-content');
        let html = '<div class="topic-header"><h2>' + topic.name + '</h2>';
        html += '<p>Exam Weight: ' + topic.weight + '</p></div>';
        
        const sections = topicData.sections;
        for (let idx = 0; idx < sections.length; idx++) {
            const section = sections[idx];
            html += '<div class="section"><h3>' + section.title + '</h3>';
            html += '<div class="section-content">' + section.content + '</div>';
            
            if (section.keyPoints && section.keyPoints.length > 0) {
                html += '<div class="key-points"><h4>Key Points</h4><ul>';
                for (let i = 0; i < section.keyPoints.length; i++) {
                    html += '<li>' + section.keyPoints[i] + '</li>';
                }
                html += '</ul></div>';
            }
            
            if (section.formulas && section.formulas.length > 0) {
                html += '<h4>Formulas</h4>';
                for (let i = 0; i < section.formulas.length; i++) {
                    html += '<div class="formula-card"><div class="formula">' + section.formulas[i].expression + '</div></div>';
                }
            }
            
            if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                html += '<div class="quiz-section" style="margin-top:32px">';
                html += '<h3>Practice Questions</h3>';
                html += '<div id="quiz-' + idx + '"></div>';
                html += '<div id="quiz-controls-' + idx + '" class="quiz-controls"></div></div>';
            }
            
            html += '<button class="btn btn-primary" style="margin-top:16px" onclick="this.textContent=\'Completed\';this.className=\'btn btn-secondary\'">Mark as Complete</button></div>';
        }
        
        content.innerHTML = html;
        
        // Initialize quizzes
        setTimeout(function() {
            for (let idx = 0; idx < sections.length; idx++) {
                const section = sections[idx];
                if (section.practiceQuestions && window.quizEngine) {
                    const container = document.getElementById('quiz-' + idx);
                    if (container) {
                        window.quizEngine.init(section.practiceQuestions);
                    }
                }
            }
        }, 100);
    }
    
    setupEventListeners() {
        const searchModal = document.getElementById('search-modal');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchBtn && searchModal) {
            searchBtn.addEventListener('click', function() {
                searchModal.style.display = 'flex';
            });
            
            searchModal.addEventListener('click', function(e) {
                if (e.target === searchModal) {
                    searchModal.style.display = 'none';
                }
            });
        }
    }
}

window.app = new App();