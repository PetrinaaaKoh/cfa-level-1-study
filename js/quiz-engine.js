// quiz-engine.js - No ES6 modules

// Simple DOM helpers
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function createElement(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content) el.textContent = content;
    return el;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Progress tracker
const progressTracker = {
    recordQuestion: function(qid, selected, correct, isCorrect) {
        console.log('Question recorded:', qid, isCorrect ? 'correct' : 'incorrect');
    }
};

// Quiz Engine
class QuizEngine {
    constructor() {
        this.currentQuestion = null;
        this.questions = [];
        this.currentIndex = 0;
        this.score = { correct: 0, incorrect: 0 };
    }
    
    init(questions) {
        this.questions = shuffleArray([...questions]);
        this.currentIndex = 0;
        this.score = { correct: 0, incorrect: 0 };
        this.renderQuestion();
    }
    
    renderQuestion() {
        const container = $('#quiz-container');
        if (!container || this.currentIndex >= this.questions.length) {
            this.renderQuizComplete();
            return;
        }
        
        this.currentQuestion = this.questions[this.currentIndex];
        const q = this.currentQuestion;
        
        container.innerHTML = '';
        
        const card = createElement('div', 'question-card');
        
        const qText = createElement('p', 'question-text', q.question);
        card.appendChild(qText);
        
        const optionsList = createElement('ul', 'options-list');
        const letters = ['A', 'B', 'C'];
        
        for (let i = 0; i < q.options.length; i++) {
            const optItem = createElement('li', 'option-item');
            optItem.dataset.option = letters[i];
            
            const optLabel = createElement('div', 'option-label');
            const optLetter = createElement('span', 'option-letter', letters[i]);
            const optText = createElement('span', '', q.options[i]);
            
            optLabel.appendChild(optLetter);
            optLabel.appendChild(optText);
            optItem.appendChild(optLabel);
            
            const self = this;
            optItem.onclick = function() {
                self.selectOption(i);
            };
            
            optionsList.appendChild(optItem);
        }
        
        card.appendChild(optionsList);
        
        const explanation = createElement('div', 'explanation');
        explanation.id = 'explanation';
        explanation.innerHTML = '<h4>Explanation</h4><p>' + q.explanation + '</p>';
        card.appendChild(explanation);
        
        container.appendChild(card);
        this.renderControls();
        this.updateProgress();
    }
    
    selectOption(index) {
        if (this.currentQuestion.answered) return;
        
        this.currentQuestion.answered = true;
        const options = $$('.option-item');
        const correctLetter = this.currentQuestion.correctAnswer;
        const selectedLetter = ['A', 'B', 'C'][index];
        const isCorrect = selectedLetter === correctLetter;
        
        for (let i = 0; i < options.length; i++) {
            options[i].style.pointerEvents = 'none';
            const letter = ['A', 'B', 'C'][i];
            
            if (letter === correctLetter) {
                options[i].classList.add('correct');
            } else if (i === index && !isCorrect) {
                options[i].classList.add('incorrect');
            }
        }
        
        const explanation = $('#explanation');
        if (explanation) explanation.classList.add('visible');
        
        if (isCorrect) {
            this.score.correct++;
        } else {
            this.score.incorrect++;
        }
        
        progressTracker.recordQuestion(
            this.currentQuestion.id,
            selectedLetter,
            correctLetter,
            isCorrect
        );
        
        this.renderControls();
        this.updateProgress();
    }
    
    renderControls() {
        const container = $('#quiz-controls');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.currentQuestion.answered) {
            const btn = createElement('button', 'btn btn-primary', 'Submit Answer');
            btn.disabled = true;
            container.appendChild(btn);
        } else {
            const self = this;
            const btn = createElement('button', 'btn btn-primary', 
                this.currentIndex < this.questions.length - 1 ? 'Next Question' : 'Finish Quiz');
            btn.onclick = function() {
                self.currentIndex++;
                self.renderQuestion();
            };
            container.appendChild(btn);
        }
    }
    
    updateProgress() {
        const el = $('#quiz-progress');
        if (el) {
            el.textContent = 'Question ' + (this.currentIndex + 1) + ' of ' + this.questions.length;
        }
    }
    
    renderQuizComplete() {
        const container = $('#quiz-container');
        if (!container) return;
        
        const pct = this.questions.length > 0 ? 
            Math.round((this.score.correct / this.questions.length) * 100) : 0;
        
        container.innerHTML = '<div class="question-card" style="text-align:center;padding:48px 24px">' +
            '<h3 style="color:var(--primary-color);margin-bottom:16px">Quiz Complete!</h3>' +
            '<p style="font-size:1.125rem;margin-bottom:24px">You scored ' + this.score.correct + 
            ' out of ' + this.questions.length + '</p>' +
            '<p style="font-size:2rem;font-weight:bold;color:var(--success-color)">' + pct + '%</p>' +
            '</div>';
    }
}

// Attach to window
window.quizEngine = new QuizEngine();
console.log('quizEngine loaded and attached to window');