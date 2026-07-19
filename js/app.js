class App {
    constructor() {
        this.topics = [];
        this.init();
    }
    
    async init() {
        const response = await fetch('./data/topics.json');
        const data = await response.json();
        this.topics = data.topics;
        this.renderTopicList();
    }
    
    renderTopicList() {
        const topicList = document.getElementById('topic-list');
        topicList.innerHTML = '';
        
        for (let i = 0; i < this.topics.length; i++) {
            const topic = this.topics[i];
            const li = document.createElement('li');
            li.className = 'topic-item';
            
            const btn = document.createElement('button');
            btn.className = 'topic-btn';
            btn.textContent = topic.name + ' (' + topic.weight + ')';
            
            const self = this;
            btn.onclick = function() {
                self.loadTopic(i);
            };
            
            li.appendChild(btn);
            topicList.appendChild(li);
        }
    }
    
    async loadTopic(idx) {
        const topic = this.topics[idx];
        const content = document.getElementById('topic-content');
        const welcome = document.getElementById('welcome-screen');
        
        if (welcome) welcome.style.display = 'none';
        if (content) content.style.display = 'block';
        
        const response = await fetch('./data/' + topic.id + '.json');
        const topicData = await response.json();
        
        let html = '<h2>' + topic.name + '</h2>';
        html += '<p>Exam Weight: ' + topic.weight + '</p>';
        
        for (let i = 0; i < topicData.sections.length; i++) {
            const section = topicData.sections[i];
            html += '<div class="section">';
            html += '<h3>' + section.title + '</h3>';
            html += '<div>' + section.content + '</div>';
            
            if (section.keyPoints && section.keyPoints.length > 0) {
                html += '<div class="key-points"><h4>Key Points</h4><ul>';
                for (let j = 0; j < section.keyPoints.length; j++) {
                    html += '<li>' + section.keyPoints[j] + '</li>';
                }
                html += '</ul></div>';
            }
            
            if (section.formulas && section.formulas.length > 0) {
                html += '<h4>Formulas</h4>';
                for (let j = 0; j < section.formulas.length; j++) {
                    html += '<div class="formula-card"><div class="formula">' + section.formulas[j].expression + '</div></div>';
                }
            }
            
            if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                html += '<div class="quiz-section" style="margin-top:32px">';
                html += '<h3>Practice Questions</h3>';
                html += '<div id="quiz-' + i + '"></div>';
                html += '<div id="quiz-controls-' + i + '" class="quiz-controls"></div>';
                html += '</div>';
            }
            
            html += '<button class="btn btn-primary" style="margin-top:16px">Mark as Complete</button>';
            html += '</div>';
        }
        
        content.innerHTML = html;
        
        // Initialize quizzes after DOM is ready
        const self = this;
        setTimeout(function() {
            for (let i = 0; i < topicData.sections.length; i++) {
                const section = topicData.sections[i];
                if (section.practiceQuestions && section.practiceQuestions.length > 0) {
                    const container = document.getElementById('quiz-' + i);
                    const controls = document.getElementById('quiz-controls-' + i);
                    
                    if (container && controls && window.quizEngine) {
                        window.quizEngine.init(section.practiceQuestions);
                    }
                }
            }
        }, 200);
    }
}

window.app = new App();
