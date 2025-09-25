# SqlDBM ROI Calculator

A comprehensive web-based ROI calculator tool for SqlDBM that helps potential customers understand the business impact and return on investment of adopting SqlDBM for their data modeling needs.

## Features

### 📊 **Comprehensive ROI Analysis**
- Multi-step form capturing current environment and workflows
- Industry and company size benchmarking
- Conservative ROI calculations based on proven methodologies
- Real-time input validation and business email verification

### 🎨 **Interactive Visualizations**
- Dynamic charts showing value breakdown and ROI timeline
- Animated metrics and progress indicators
- Responsive design for desktop and mobile devices
- Professional, modern UI with smooth animations

### 📄 **Professional Reports**
- Downloadable PDF reports with detailed analysis
- Company branding and professional formatting
- Methodology documentation and assumptions
- Executive summary with key metrics

### 🔧 **Technical Features**
- Client-side calculation engine (no server required)
- Progressive form with validation
- Business email domain verification
- Mobile-responsive design
- Chart.js visualizations
- jsPDF report generation

## ROI Calculation Framework

The calculator uses a 4-component framework based on the SqlDBM specification:

### 1. Labor Efficiency Savings
- **Formula**: `(Team Size × FTE Cost × % Time Saved)`
- **Default**: 25% time savings, $150K loaded FTE cost
- **Adjustments**: Based on current tools, CI/CD usage, industry

### 2. Rework Reduction
- **Formula**: `(Models/Year × Hours/Model × Hourly Rate × % Rework Avoided)`
- **Default**: 20% rework reduction, 80 hours per model
- **Adjustments**: Based on current rework rates and governance tools

### 3. Downstream Productivity Gains
- **Formula**: `(Stakeholders × Hours Saved/Month × Rate × 12)`
- **Default**: 3 hours saved per stakeholder per month
- **Adjustments**: Based on governance tools and cloud architecture

### 4. Tool Consolidation Savings
- **Formula**: `(Current Tool Spend + Consulting) × % Reduction`
- **Default**: 60% reduction in tool and consulting costs
- **Adjustments**: Based on current tooling sophistication

## Project Structure

```
roi-calculator/
├── index.html              # Main HTML structure
├── styles/
│   └── main.css            # Complete CSS styling
├── scripts/
│   ├── main.js             # Main application logic
│   ├── calculator.js       # ROI calculation engine
│   ├── validation.js       # Form and email validation
│   ├── charts.js          # Chart visualizations
│   └── pdf-generator.js   # PDF report generation
├── assets/                 # Static assets (images, fonts)
└── README.md              # This file
```

## Installation & Usage

### Quick Start
1. **Clone or download** the project files
2. **Open `index.html`** in a modern web browser
3. **Start calculating ROI** immediately - no server required!

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for external libraries (Chart.js, jsPDF, Google Fonts)
- No server or installation required

### For Development
```bash
# Serve locally (optional)
python -m http.server 8000
# Or use any static file server
```

## Form Inputs

### Required Inputs
1. **Current annual Database/Data Warehouse spend**
2. **Current annual dbt spend** (optional)
3. **Data architecture/engineering team size**
4. **Number of downstream stakeholders**
5. **Estimated data products to build (12 months)**
6. **Average time from requirements to model**
7. **Current modeling tool(s)**
8. **Industry**
9. **Company size/revenue bracket**
10. **Business email address**
11. **Contact information**

### Additional Inputs (Optional)
- % of engineering time on rework/technical debt
- % of models requiring revision due to unclear standards
- Git/CI-CD integration usage
- Governance tools usage
- Cloud-only vs hybrid architecture
- Geographic region

## Validation Features

### Business Email Validation
- Blocks personal email domains (Gmail, Yahoo, etc.)
- Validates email format and business domain patterns
- Real-time validation feedback
- Comprehensive business domain database

### Form Validation
- Required field enforcement
- Numeric range validation
- Real-time error feedback
- Progressive validation by step

## Output & Results

### Key Metrics Displayed
- **Payback Period**: When SqlDBM investment breaks even
- **Annual Value Created**: Total yearly savings potential
- **3-Year ROI**: Return multiple over 3 years
- **Net Annual Value**: Savings after SqlDBM costs

### Visualizations
- **Value Breakdown Chart**: Doughnut chart showing savings categories
- **ROI Timeline**: Line chart showing cumulative value over time
- **Detailed Breakdown**: Itemized savings calculations

### PDF Report Contents
- Executive summary with key metrics
- Company information and inputs
- Detailed value breakdown
- Methodology and assumptions
- Professional formatting and branding

## Configuration

### Industry Multipliers
```javascript
industryMultipliers = {
    'financial-services': 1.2,
    'healthcare': 1.1,
    'technology': 1.0,
    'retail-ecommerce': 0.9,
    // ... etc
}
```

### Company Size Multipliers
```javascript
companySizeMultipliers = {
    'startup': 0.8,
    'small': 0.9,
    'medium': 1.0,
    'large': 1.1,
    'enterprise': 1.2
}
```

### Key Constants
- SqlDBM Annual Cost: $120,000
- Default FTE Cost: $150,000
- Default Hourly Rate: $75
- Stakeholder Hourly Rate: $60
- Hours per Model: 80

## Browser Support

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

### External Libraries (CDN)
- **Chart.js**: Data visualizations
- **jsPDF**: PDF report generation  
- **Google Fonts**: Typography (Inter font family)

### No Server Dependencies
- Pure client-side JavaScript
- No backend required
- No database needed
- No API calls required

## Lead Capture

The tool captures lead information including:
- Company details
- Contact information
- Industry and company size
- Current tool usage
- Team size and structure

**Note**: Currently stores data locally. Ready for CRM integration in Phase 2.

## Customization

### Styling
- Modify `styles/main.css` for visual customization
- CSS custom properties for easy theming
- Responsive grid system
- Modern gradient backgrounds

### Calculations
- Update constants in `scripts/calculator.js`
- Modify industry/company multipliers
- Adjust savings percentages
- Add new calculation components

### Form Fields
- Add/remove fields in `index.html`
- Update validation in `scripts/validation.js`
- Modify PDF generation in `scripts/pdf-generator.js`

## Security Considerations

- Client-side only (no sensitive data transmission)
- Business email validation prevents spam
- No external data storage
- Input sanitization and validation
- XSS protection through proper DOM handling

## Performance

- Optimized for fast loading
- Progressive enhancement
- Efficient chart rendering
- Lazy loading for heavy components
- Mobile-optimized interactions

## Future Enhancements

### Phase 2 Features
- CRM integration for lead storage
- A/B testing capabilities
- Advanced industry benchmarking
- Email automation
- Analytics dashboard
- Multi-language support

### Technical Improvements
- Service worker for offline capability
- Progressive Web App features
- Advanced accessibility features
- Server-side validation option
- Database integration ready

## Support

For technical issues or feature requests:
1. Check the browser console for errors
2. Verify all external libraries are loading
3. Test in different browsers
4. Review form validation messages

## License

This ROI Calculator is proprietary software for SqlDBM lead generation and customer evaluation purposes.

---

**Built with ❤️ for SqlDBM - Transform your data modeling workflow**