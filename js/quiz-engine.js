// quiz-engine.js

import { $, $$, createElement, shuffleArray } from './utils.js';
import { progressTracker } from './progress.js';

/**
 * Quiz engine for rendering and managing practice questions
 */
export class QuizEngine {
    constructor() {
        this.currentQuestion = null;
        this.questions = [];
        this.currentIndex = 0;
        this.score = { correct: 0, incorrect: 0 };
    }
    
    /**
     * Initialize quiz with questions
     * @param {Array} questions - Array of question objects
     */
    init(questions) {
        this.questions = shuffleArray([...questions]);
        this.currentIndex = 0;
        this.score = { correct: 0, incorrect: 0 };
        this.renderQuestion();
    }
    
    /**
     * Render current question
     */
    renderQuestion() {
        const container = $('#quiz-container');
        if (!container || this.currentIndex >= this.questions.length) {
            this.renderQuizComplete();
            return;
        }
        
        this.currentQuestion = this.questions[this.currentIndex];
        const q = this.currentQuestion;
        
        container.innerHTML = '';
        
        const questionCard = createElement('div', { className: 'question-card' });
        
        // Question text
        const questionText = createElement('p', { 
            className: 'question-text',
            textContent: q.question 
        });
        questionCard.appendChild(questionText);
        
        // Options
        const optionsList = createElement('ul', { className: 'options-list' });
        const letters = ['A', 'B', 'C'];
        
        q.options.forEach((option, index) => {
            const optionItem = createElement('li', {
                className: 'option-item',
                dataset: { option: letters[index] }
            });
            
            const optionLabel = createElement('div', { 
                className: 'option-label' 
            });
            
            const optionLetter = createElement('span', {
                className: 'option-letter',
                textContent: letters[index]
            });
            
            const optionText = createElement('span', {
                textContent: option
            });
            
            optionLabel.appendChild(optionLetter);
            optionLabel.appendChild(optionText);
            optionItem.appendChild(optionLabel);
            
            optionItem.addEventListener('click', () => this.selectOption(index));
            optionsList.appendChild(optionItem);
        });
        
        questionCard.appendChild(optionsList);
        
        // Explanation (hidden initially)
        const explanation = createElement('div', {
            className: 'explanation',
            id: 'explanation'
        });
        
        const explanationTitle = createElement('h4', {
            textContent: 'Explanation'
        });
        
        const explanationText = createElement('p', {
            textContent: q.explanation
        });
        
        explanation.appendChild(explanationTitle);
        explanation.appendChild(explanationText);
        questionCard.appendChild(explanation);
        
        container.appendChild(questionCard);
        
        // Controls
        this.renderControls();
        this.updateProgress();
    }
    
    /**
     * Handle option selection
     * @param {number} index - Selected option index
     */
    selectOption(index) {
        if (this.currentQuestion.answered) return;
        
        const options = $$('.option-item');
        const correctLetter = this.currentQuestion.correctAnswer;
        const selectedLetter = ['A', 'B', 'C'][index];
        const isCorrect = selectedLetter === correctLetter;
        
        // Mark as answered
        this.currentQuestion.answered = true;
        
        // Update UI
        options.forEach((opt, i) => {
            opt.style.pointerEvents = 'none';
            const letter = ['A', 'B', 'C'][i];
            
            if (letter === correctLetter) {
                opt.classList.add('correct');
            } else if (i === index && !isCorrect) {
                opt.classList.add('incorrect');
            }
        });
        
        // Show explanation
        const explanation = $('#explanation');
        if (explanation) {
            explanation.classList.add('visible');
        }
        
        // Update score
        if (isCorrect) {
            this.score.correct++;
        } else {
            this.score.incorrect++;
        }
        
        // Record in progress
        progressTracker.recordQuestion(
            this.currentQuestion.id,
            selectedLetter,
            correctLetter,
            isCorrect
        );
        
        // Update controls
        this.renderControls();
        this.updateProgress();
    }
    
    /**
     * Render quiz controls
     */
    renderControls() {
        const container = $('#quiz-controls');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.currentQuestion?.answered) {
            const submitBtn = createElement('button', {
                className: 'btn btn-primary',
                textContent: 'Submit Answer',
                disabled: true,
                id: 'submit-btn'
            });
            container.appendChild(submitBtn);
        } else {
            const nextBtn = createElement('button', {
                className: 'btn btn-primary',
                textContent: this.currentIndex < this.questions.length - 1 
                    ? 'Next Question' 
                    : 'Finish Quiz'
            });
            
            nextBtn.addEventListener('click', () => {
                this.currentIndex++;
                this.renderQuestion();
            });
            
            container.appendChild(nextBtn);
        }
    }
    
    /**
     * Update question progress indicator
     */
    updateProgress() {
        const progressEl = $('#quiz-progress');
        if (progressEl) {
            progressEl.textContent = `Question ${this.currentIndex + 1} of ${this.questions.length}`;
        }
    }
    
    /**
     * Render quiz complete screen
     */
    renderQuizComplete() {
        const container = $('#quiz-container');
        if (!container) return;
        
        const percentage = this.questions.length > 0 
            ? Math.round((this.score.correct / this.questions.length) * 100) 
            : 0;
        
        container.innerHTML = `
            <div class="question-card" style="text-align: center; padding: 48px 24px;">
                <h3 style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 16px;">
                    Quiz Complete! 🎉
                </h3>
                <p style="font-size: 1.125rem; margin-bottom: 24px;">
                    You scored ${this.score.correct} out of ${this.questions.length}
                </p>
                <p style="font-size: 2rem; font-weight: bold; color: var(--success-color);">
                    ${percentage}%
                </p>
                <div class="quiz-controls" style="justify-content: center; margin-top: 32px;">
                    <button class="btn btn-secondary" id="retry-quiz-btn">Retry Quiz</button>
                </div>
            </div>
        `;
        
        const retryBtn = $('#retry-quiz-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.init(this.questions);
            });
        }
    }
}

// Export singleton instance
export const quizEngine = new QuizEngine();