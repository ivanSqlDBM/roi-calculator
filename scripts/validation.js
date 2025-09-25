// Email validation functionality
class EmailValidator {
    constructor() {
        this.businessDomains = new Set([
            // Common business email providers
            'company.com', 'corp.com', 'business.com',
            // Major business domains (examples - in real implementation, you'd have a comprehensive list)
            'microsoft.com', 'apple.com', 'google.com', 'amazon.com', 'salesforce.com',
            'oracle.com', 'ibm.com', 'sap.com', 'cisco.com', 'adobe.com'
        ]);
        
        this.personalDomains = new Set([
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
            'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com'
        ]);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isBusinessEmail(email) {
        if (!this.isValidEmail(email)) {
            return false;
        }

        const domain = email.split('@')[1].toLowerCase();
        
        // Check if it's a known personal domain
        if (this.personalDomains.has(domain)) {
            return false;
        }

        // Check if it's a known business domain
        if (this.businessDomains.has(domain)) {
            return true;
        }

        // For unknown domains, check if it looks like a business domain
        // Business domains typically don't have common personal email patterns
        const personalPatterns = [
            /^(mail|email|webmail|personal)/,
            /\d+mail/,
            /(free|temp|disposable)/
        ];

        return !personalPatterns.some(pattern => pattern.test(domain));
    }

    validateBusinessEmail(email) {
        if (!email) {
            return { valid: false, message: 'Email is required' };
        }

        if (!this.isValidEmail(email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }

        if (!this.isBusinessEmail(email)) {
            return { 
                valid: false, 
                message: 'Please use your business email address (no personal emails like Gmail, Yahoo, etc.)' 
            };
        }

        return { valid: true, message: 'Valid business email' };
    }
}

// Form validation functionality
class FormValidator {
    constructor() {
        this.emailValidator = new EmailValidator();
    }

    validateStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        const requiredFields = step.querySelectorAll('[required]');
        let isValid = true;
        let errors = [];

        requiredFields.forEach(field => {
            const value = field.value.trim();
            const fieldName = field.getAttribute('name');
            
            // Remove previous error styling
            field.parentElement.classList.remove('error');
            
            if (!value) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
                errors.push(`${fieldName} is required`);
                return;
            }

            // Special validation for specific fields
            switch (fieldName) {
                case 'teamSize':
                    if (parseInt(value) < 1 || parseInt(value) > 100) {
                        this.showFieldError(field, 'Team size must be between 1 and 100');
                        isValid = false;
                        errors.push('Invalid team size');
                    }
                    break;

                case 'stakeholders':
                    if (parseInt(value) < 1 || parseInt(value) > 1000) {
                        this.showFieldError(field, 'Number of stakeholders must be between 1 and 1000');
                        isValid = false;
                        errors.push('Invalid number of stakeholders');
                    }
                    break;

                case 'dataProducts':
                    if (parseInt(value) < 1 || parseInt(value) > 1000) {
                        this.showFieldError(field, 'Number of data products must be between 1 and 1000');
                        isValid = false;
                        errors.push('Invalid number of data products');
                    }
                    break;

                case 'businessEmail':
                    const emailValidation = this.emailValidator.validateBusinessEmail(value);
                    if (!emailValidation.valid) {
                        this.showFieldError(field, emailValidation.message);
                        isValid = false;
                        errors.push('Invalid business email');
                    } else {
                        this.showFieldSuccess(field, emailValidation.message);
                    }
                    break;

                case 'firstName':
                case 'lastName':
                    if (value.length < 2) {
                        this.showFieldError(field, 'Name must be at least 2 characters');
                        isValid = false;
                        errors.push('Invalid name');
                    }
                    break;

                case 'company':
                    if (value.length < 2) {
                        this.showFieldError(field, 'Company name must be at least 2 characters');
                        isValid = false;
                        errors.push('Invalid company name');
                    }
                    break;
            }
        });

        return { valid: isValid, errors: errors };
    }

    showFieldError(field, message) {
        field.parentElement.classList.add('error');
        
        const validationDiv = field.parentElement.querySelector('.validation-message');
        if (validationDiv) {
            validationDiv.textContent = message;
            validationDiv.className = 'validation-message error';
        }
    }

    showFieldSuccess(field, message) {
        field.parentElement.classList.remove('error');
        
        const validationDiv = field.parentElement.querySelector('.validation-message');
        if (validationDiv) {
            validationDiv.textContent = message;
            validationDiv.className = 'validation-message success';
        }
    }

    clearFieldValidation(field) {
        field.parentElement.classList.remove('error');
        
        const validationDiv = field.parentElement.querySelector('.validation-message');
        if (validationDiv) {
            validationDiv.textContent = '';
            validationDiv.className = 'validation-message';
        }
    }

    validateAllSteps() {
        let allValid = true;
        const errors = [];

        for (let i = 1; i <= 4; i++) {
            const stepValidation = this.validateStep(i);
            if (!stepValidation.valid) {
                allValid = false;
                errors.push(...stepValidation.errors);
            }
        }

        return { valid: allValid, errors: errors };
    }
}

// Real-time validation setup
function setupRealTimeValidation() {
    const validator = new FormValidator();
    
    // Add real-time validation to email field
    const emailField = document.getElementById('businessEmail');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            const validation = validator.emailValidator.validateBusinessEmail(this.value);
            if (this.value) {
                if (validation.valid) {
                    validator.showFieldSuccess(this, validation.message);
                } else {
                    validator.showFieldError(this, validation.message);
                }
            } else {
                validator.clearFieldValidation(this);
            }
        });

        emailField.addEventListener('input', function() {
            if (this.parentElement.classList.contains('error')) {
                validator.clearFieldValidation(this);
            }
        });
    }

    // Add real-time validation to numeric fields
    const numericFields = ['teamSize', 'stakeholders', 'dataProducts'];
    numericFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('input', function() {
                if (this.parentElement.classList.contains('error')) {
                    validator.clearFieldValidation(this);
                }
            });
        }
    });

    // Add real-time validation to name fields
    const nameFields = ['firstName', 'lastName', 'company'];
    nameFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('input', function() {
                if (this.parentElement.classList.contains('error')) {
                    validator.clearFieldValidation(this);
                }
            });
        }
    });

    return validator;
}

// Export for use in other scripts
window.FormValidator = FormValidator;
window.EmailValidator = EmailValidator;