// progress.js

const STORAGE_KEY = 'cfa_study_progress';

/**
 * Progress tracker using LocalStorage
 */
class ProgressTracker {
    constructor() {
        this.data = this.load();
    }
    
    /**
     * Load progress from localStorage
     * @returns {Object}
     */
    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse progress data:', e);
            }
        }
        return {
            completedSections: [],
            questionHistory: [],
            lastUpdated: new Date().toISOString()
        };
    }
    
    /**
     * Save progress to localStorage
     */
    save() {
        this.data.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
    
    /**
     * Mark a section as completed
     * @param {string} sectionId - Section identifier
     */
    completeSection(sectionId) {
        if (!this.data.completedSections.includes(sectionId)) {
            this.data.completedSections.push(sectionId);
            this.save();
        }
    }
    
    /**
     * Check if section is completed
     * @param {string} sectionId - Section identifier
     * @returns {boolean}
     */
    isSectionCompleted(sectionId) {
        return this.data.completedSections.includes(sectionId);
    }
    
    /**
     * Record question attempt
     * @param {string} questionId - Question identifier
     * @param {string} selectedAnswer - User's answer
     * @param {string} correctAnswer - Correct answer
     * @param {boolean} isCorrect - Whether answer was correct
     */
    recordQuestion(questionId, selectedAnswer, correctAnswer, isCorrect) {
        this.data.questionHistory.push({
            questionId,
            selectedAnswer,
            correctAnswer,
            isCorrect,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 1000 attempts
        if (this.data.questionHistory.length > 1000) {
            this.data.questionHistory = this.data.questionHistory.slice(-1000);
        }
        
        this.save();
    }
    
    /**
     * Get question statistics
     * @returns {Object}
     */
    getQuestionStats() {
        const history = this.data.questionHistory;
        if (history.length === 0) {
            return { total: 0, correct: 0, percentage: 0 };
        }
        
        const correct = history.filter(q => q.isCorrect).length;
        return {
            total: history.length,
            correct,
            percentage: (correct / history.length) * 100
        };
    }
    
    /**
     * Calculate overall progress percentage
     * @param {number} totalSections - Total number of sections
     * @returns {number}
     */
    getOverallProgress(totalSections) {
        if (totalSections === 0) return 0;
        return (this.data.completedSections.length / totalSections) * 100;
    }
    
    /**
     * Get progress for specific topic
     * @param {string} topicId - Topic identifier
     * @param {number} topicSections - Number of sections in topic
     * @returns {Object}
     */
    getTopicProgress(topicId, topicSections) {
        const topicPrefix = `${topicId}-`;
        const completedInTopic = this.data.completedSections.filter(
            id => id.startsWith(topicPrefix)
        ).length;
        
        return {
            completed: completedInTopic,
            total: topicSections,
            percentage: topicSections > 0 ? (completedInTopic / topicSections) * 100 : 0
        };
    }
    
    /**
     * Reset all progress
     */
    reset() {
        this.data = {
            completedSections: [],
            questionHistory: [],
            lastUpdated: new Date().toISOString()
        };
        this.save();
    }
}

// Export singleton instance
export const progressTracker = new ProgressTracker();
