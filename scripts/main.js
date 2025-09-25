// Main application logic
class ROICalculatorApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.validator = null;
        this.calculator = null;
        this.charts = null;
        this.pdfGenerator = null;
        this.results = null;
        this.formData = {};
        
        this.init();
    }

    init() {
        // Initialize components
        this.validator = new FormValidator();
        this.calculator = new ROICalculator();
        this.charts = new ROICharts();
        this.pdfGenerator = new PDFGenerator();

        // Set up event listeners
        this.setupEventListeners();
        this.setupSliders();
        this.setupRealTimeValidation();
        
        // Initialize progress
        this.updateProgress();
        
        console.log('ROI Calculator App initialized');
    }

    setupEventListeners() {
        // Navigation buttons
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const submitBtn = document.getElementById('submitBtn');
        const downloadBtn = document.getElementById('downloadPDF');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadPDF());
        }

        // Form submission
        const form = document.getElementById('roiForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }

        // Input change tracking
        this.setupInputTracking();
    }

    setupInputTracking() {
        const form = document.getElementById('roiForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateFormData();
            });
        });
    }

    setupSliders() {
        // Rework percentage slider
        const reworkSlider = document.getElementById('reworkPercent');
        const reworkValue = document.getElementById('reworkValue');
        
        if (reworkSlider && reworkValue) {
            reworkSlider.addEventListener('input', (e) => {
                reworkValue.textContent = e.target.value + '%';
            });
        }

        // Revision percentage slider
        const revisionSlider = document.getElementById('revisionPercent');
        const revisionValue = document.getElementById('revisionValue');
        
        if (revisionSlider && revisionValue) {
            revisionSlider.addEventListener('input', (e) => {
                revisionValue.textContent = e.target.value + '%';
            });
        }
    }

    setupRealTimeValidation() {
        this.validator = setupRealTimeValidation();
    }

    updateFormData() {
        const form = document.getElementById('roiForm');
        if (!form) return;

        const formData = new FormData(form);
        this.formData = {};

        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }

        // Add checkbox values
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            this.formData[checkbox.name] = checkbox.checked;
        });
    }

    nextStep() {
        // Validate current step
        const validation = this.validator.validateStep(this.currentStep);
        
        if (!validation.valid) {
            this.showValidationErrors(validation.errors);
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.hideStep(this.currentStep);
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.updateNavigation();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.hideStep(this.currentStep);
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.updateNavigation();
        }
    }

    showStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        if (step) {
            step.classList.add('active');
            // Scroll to top of form
            step.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    hideStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        if (step) {
            step.classList.remove('active');
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = percentage + '%';
        }

        if (progressText) {
            progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        }
    }

    updateNavigation() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        }

        if (this.currentStep === this.totalSteps) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'inline-block';
        } else {
            if (nextBtn) nextBtn.style.display = 'inline-block';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    }

    showValidationErrors(errors) {
        // Could implement a toast or modal here
        console.log('Validation errors:', errors);
        
        // For now, just focus on the first invalid field
        const firstErrorField = document.querySelector('.form-group.error input, .form-group.error select');
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }

    async submitForm() {
        try {
            // Validate all steps
            const fullValidation = this.validator.validateAllSteps();
            
            if (!fullValidation.valid) {
                this.showValidationErrors(fullValidation.errors);
                return;
            }

            // Update form data
            this.updateFormData();

            // Show loading overlay
            this.showLoading();

            // Calculate ROI (simulate delay for better UX)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.results = this.calculator.calculate(this.formData);
            
            // Hide loading and show results
            this.hideLoading();
            this.showResults();

        } catch (error) {
            console.error('Form submission error:', error);
            this.hideLoading();
            this.showError('An error occurred while calculating your ROI. Please try again.');
        }
    }

    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    showResults() {
        // Hide form
        const form = document.getElementById('roiForm');
        const navigation = document.querySelector('.form-navigation');
        if (form) form.style.display = 'none';
        if (navigation) navigation.style.display = 'none';

        // Show results section
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Update progress to 100%
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = 'Analysis Complete';

        // Populate results
        this.populateResults();
        
        // Initialize charts
        this.charts.initializeCharts(this.results);
        
        // Animate numbers
        setTimeout(() => {
            this.charts.animateNumbers(this.results);
        }, 500);
    }

    populateResults() {
        if (!this.results) return;

        const summaryTexts = this.calculator.generateSummaryText(this.results);

        // Update summary metrics
        document.getElementById('roiDescription').textContent = summaryTexts.narrative;

        // Populate detailed breakdown
        this.populateDetailedBreakdown();
    }

    populateDetailedBreakdown() {
        const detailedResults = document.getElementById('detailedResults');
        if (!detailedResults || !this.results) return;

        let html = '';

        this.results.breakdown.forEach(item => {
            html += `
                <div class="breakdown-item">
                    <div class="breakdown-label">${item.category}</div>
                    <div class="breakdown-value">$${item.amount.toLocaleString()}</div>
                </div>
            `;
        });

        // Add total
        html += `
            <div class="breakdown-item" style="border-top: 2px solid #667eea; font-weight: bold;">
                <div class="breakdown-label">Total Annual Value</div>
                <div class="breakdown-value">$${this.results.metrics.totalAnnualValue.toLocaleString()}</div>
            </div>
            <div class="breakdown-item">
                <div class="breakdown-label">Less: SqlDBM Annual Cost</div>
                <div class="breakdown-value">($${this.calculator.SQLDBM_ANNUAL_COST.toLocaleString()})</div>
            </div>
            <div class="breakdown-item" style="background: #f8f9fa; font-weight: bold;">
                <div class="breakdown-label">Net Annual Value</div>
                <div class="breakdown-value">$${this.results.metrics.netAnnualValue.toLocaleString()}</div>
            </div>
        `;

        detailedResults.innerHTML = html;
    }

    async downloadPDF() {
        try {
            this.showLoading();
            
            const result = await this.pdfGenerator.generatePDF(this.results, this.formData);
            
            this.hideLoading();
            
            if (result.success) {
                this.showSuccess(`PDF report "${result.filename}" has been downloaded successfully!`);
            } else {
                this.showError(`Failed to generate PDF: ${result.error}`);
            }
            
        } catch (error) {
            this.hideLoading();
            this.showError('An error occurred while generating the PDF report.');
            console.error('PDF generation error:', error);
        }
    }

    showError(message) {
        // Simple alert for now - could be replaced with a better notification system
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        // Simple alert for now - could be replaced with a better notification system
        alert(`Success: ${message}`);
    }

    // Utility method to restart the calculator
    restart() {
        location.reload();
    }

    // Method to get current results for external use
    getResults() {
        return this.results;
    }

    // Method to get current form data for external use
    getFormData() {
        return this.formData;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if all required classes are available
    if (typeof FormValidator === 'undefined' || 
        typeof ROICalculator === 'undefined' || 
        typeof ROICharts === 'undefined' || 
        typeof PDFGenerator === 'undefined') {
        console.error('Required classes not loaded');
        return;
    }

    // Initialize the ROI Calculator App
    window.roiApp = new ROICalculatorApp();
    
    console.log('ROI Calculator is ready!');
});

// Export for external use
window.ROICalculatorApp = ROICalculatorApp;