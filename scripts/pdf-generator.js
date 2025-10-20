// PDF Generation functionality
class PDFGenerator {
    constructor() {
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.contentWidth = this.pageWidth - (2 * this.margin);
    }

    async generatePDF(results, formData) {
        try {
            // Create new jsPDF instance
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Add content to PDF
            this.addHeader(doc);
        this.addCompanyInfo(doc, formData);
        this.addExecutiveSummary(doc, results);
        this.addDetailedBreakdown(doc, results);
        this.addCallToAction(doc, results, formData);
        this.addCalculationDetails(doc, results, formData);
        this.addFooter(doc);            // Generate filename
            const timestamp = new Date().toISOString().split('T')[0];
            const companyName = formData.company.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `SqlDBM_ROI_Analysis_${companyName}_${timestamp}.pdf`;

            // Save the PDF
            doc.save(filename);

            return { success: true, filename: filename };

        } catch (error) {
            console.error('PDF Generation Error:', error);
            return { success: false, error: error.message };
        }
    }

    addHeader(doc) {
        // Add logo placeholder and header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('SqlDBM ROI Analysis', this.margin, 30);

        // Add date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Generated on ${currentDate}`, this.margin, 40);

        // Add separator line
        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(0.5);
        doc.line(this.margin, 45, this.pageWidth - this.margin, 45);
    }

    addCompanyInfo(doc, formData) {
        let yPos = 55;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Company Information', this.margin, yPos);

        yPos += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const companyInfo = [
            { label: 'Company:', value: formData.company },
            { label: 'Contact:', value: `${formData.firstName} ${formData.lastName}` },
            { label: 'Email:', value: formData.businessEmail },
            { label: 'Job Title:', value: formData.jobTitle || 'N/A' },
            { label: 'Industry:', value: this.formatIndustry(formData.industry) },
            { label: 'Company Size:', value: this.formatCompanySize(formData.companySize) }
        ];

        companyInfo.forEach(item => {
            doc.setFont('helvetica', 'bold');
            doc.text(item.label, this.margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(item.value, this.margin + 35, yPos);
            yPos += 7;
        });
    }

    addExecutiveSummary(doc, results) {
        let yPos = 125;

        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage();
            yPos = 30;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Executive Summary', this.margin, yPos);

        yPos += 15;

        // Add key metrics in a grid
        const metrics = [
            {
                label: 'Payback Period',
                value: results.metrics.paybackMonths <= 12 
                    ? `${Math.round(results.metrics.paybackMonths)} months`
                    : `${Math.round(results.metrics.paybackMonths / 12 * 10) / 10} years`,
                color: [40, 167, 69]
            },
            {
                label: 'Annual Value Created',
                value: `$${results.metrics.totalAnnualValue.toLocaleString()}`,
                color: [102, 126, 234]
            },
            {
                label: '3-Year ROI',
                value: `${results.metrics.threeYearROI}x`,
                color: [118, 75, 162]
            },
            {
                label: 'Net 3-Year Value',
                value: `$${results.metrics.threeYearValue.toLocaleString()}`,
                color: [23, 162, 184]
            }
        ];

        // Create metric boxes
        const boxWidth = (this.contentWidth - 10) / 2;
        const boxHeight = 25;

        metrics.forEach((metric, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = this.margin + (col * (boxWidth + 10));
            const y = yPos + (row * (boxHeight + 10));

            // Draw box
            doc.setFillColor(248, 249, 250);
            doc.setDrawColor(233, 236, 239);
            doc.rect(x, y, boxWidth, boxHeight, 'FD');

            // Add metric label
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 100, 100);
            doc.text(metric.label, x + 5, y + 8);

            // Add metric value
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...metric.color);
            doc.text(metric.value, x + 5, y + 18);
        });

        yPos += 70;

        // Add business value message
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(102, 126, 234);
        doc.rect(this.margin, yPos, this.contentWidth, 25, 'FD');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('Key Business Insight:', this.margin + 10, yPos + 8);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const businessMessage = 'While data modeling may not directly generate revenue, SqlDBM transforms it into a business accelerator through efficiency gains, reduced rework, and enhanced downstream productivity.';
        const businessLines = doc.splitTextToSize(businessMessage, this.contentWidth - 20);
        doc.text(businessLines, this.margin + 10, yPos + 17);

        yPos += 35;

        // Add narrative summary
        const summaryText = results.narrative || this.generateNarrativeSummary(results);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const splitText = doc.splitTextToSize(summaryText, this.contentWidth);
        doc.text(splitText, this.margin, yPos);
    }

    addDetailedBreakdown(doc, results) {
        // Add new page for detailed breakdown
        doc.addPage();
        let yPos = 30;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Detailed Value Breakdown', this.margin, yPos);

        yPos += 20;

        // Create table for breakdown
        const tableData = results.breakdown.map(item => [
            item.category,
            `$${item.amount.toLocaleString()}`,
            `${item.percentage}%`
        ]);

        this.addTable(doc, 
            ['Value Category', 'Annual Savings', '% of Total'], 
            tableData, 
            yPos
        );

        yPos += (tableData.length + 2) * 10 + 20;

        // Add assumptions
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Assumptions', this.margin, yPos);

        yPos += 15;

        const assumptions = [
            'SqlDBM annual platform cost: $120,000',
            'Average loaded FTE cost: $150,000',
            'Default efficiency improvement: 20-40%',
            'Rework reduction: 15-25%',
            'Stakeholder time savings: 2-4 hours/month',
            'Industry and company size adjustments applied'
        ];

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        assumptions.forEach(assumption => {
            doc.text(`• ${assumption}`, this.margin + 5, yPos);
            yPos += 6;
        });
    }

    addCallToAction(doc, results, formData) {
        // Add new page for CTA
        doc.addPage();
        let yPos = 30;

        // CTA Header with colored background
        doc.setFillColor(102, 126, 234);
        doc.rect(this.margin, yPos, this.contentWidth, 20, 'F');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Transform Data Modeling into a Business Accelerator', this.margin + 5, yPos + 13);

        yPos += 35;

        // Value proposition
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const valueMessage = `Your analysis demonstrates how SqlDBM transforms data modeling from a cost center into a business accelerator, delivering $${results.metrics.totalAnnualValue.toLocaleString()} in annual value through efficiency gains, reduced rework, and enhanced downstream productivity. With a ${Math.ceil(results.metrics.paybackMonths)}-month payback period, SqlDBM proves that smart modeling infrastructure drives real business impact.`;
        
        const valueLines = doc.splitTextToSize(valueMessage, this.contentWidth);
        doc.text(valueLines, this.margin, yPos);
        yPos += valueLines.length * 6 + 15;

        // Benefits section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('What You\'ll Discover in Your Demo:', this.margin, yPos);
        
        yPos += 12;

        const benefits = [
            '• See how SqlDBM accelerates workflows and reduces cycle times',
            '• Discover how better models drive downstream productivity gains',
            '• Learn cost reduction strategies through improved efficiency',
            '• Understand how to achieve the projected savings in your environment',
            '• See integrations that maximize your existing tool investments'
        ];

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        benefits.forEach(benefit => {
            const benefitLines = doc.splitTextToSize(benefit, this.contentWidth - 10);
            doc.text(benefitLines, this.margin, yPos);
            yPos += benefitLines.length * 5 + 3;
        });

        yPos += 25;

        // Centered CTA Button
        const ctaWidth = 80;
        const ctaHeight = 20;
        const ctaX = (this.pageWidth - ctaWidth) / 2;

        // Draw CTA button
        doc.setFillColor(102, 126, 234);
        doc.setDrawColor(102, 126, 234);
        doc.rect(ctaX, yPos, ctaWidth, ctaHeight, 'FD');

        // CTA text
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Schedule a Live Demo', ctaX + ctaWidth/2, yPos + 13, { align: 'center' });

        yPos += 30;

        // Centered link
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 126, 234);
        doc.text('https://content.sqldbm.com/contact-us', this.pageWidth/2, yPos, { align: 'center' });
    }

    addCalculationDetails(doc, results, formData) {
        // Add new page for detailed calculations
        doc.addPage();
        let yPos = 30;

        // Page Header
        doc.setFillColor(102, 126, 234);
        doc.rect(this.margin, yPos, this.contentWidth, 15, 'F');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('How Did We Get to This Number?', this.margin + 5, yPos + 10);

        yPos += 25;

        // Introduction
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const intro = 'Below are the detailed calculations that generated your ROI analysis, using your specific inputs and industry-standard benchmarks.';
        doc.text(doc.splitTextToSize(intro, this.contentWidth), this.margin, yPos);
        yPos += 15;

        // Your Inputs Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('Your Inputs:', this.margin, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        const inputs = [
            `Team Size: ${results.inputs.teamSize} engineers`,
            `Stakeholders: ${results.inputs.stakeholders} downstream users`,
            `Data Products/Year: ${results.inputs.dataProducts}`,
            `Current Tool: ${this.formatCurrentTool(results.inputs.currentTools)}`,
            `Industry: ${this.formatIndustry(results.inputs.industry)} (${results.inputs.industryMultiplier}x multiplier)`,
            `Company Size: ${this.formatCompanySize(results.inputs.companySize)} (${results.inputs.companySizeMultiplier}x multiplier)`,
            `Rework %: ${results.inputs.reworkPercent}%`,
            `Revision %: ${results.inputs.revisionPercent}%`
        ];

        inputs.forEach(input => {
            doc.text(`• ${input}`, this.margin + 5, yPos);
            yPos += 6;
        });

        yPos += 10;

        // Calculation 1: Labor Efficiency Savings
        yPos = this.addCalculationSection(doc, yPos, '1. Labor Efficiency Savings', [
            `Formula: Team Size × FTE Cost × Time Saved %`,
            `Calculation: ${results.inputs.teamSize} × $150,000 × ${results.savings.laborEfficiency.timeSavedPercent}%`,
            `= ${results.inputs.teamSize} × $150,000 × ${results.savings.laborEfficiency.timeSavedPercent/100}`,
            `= $${results.savings.laborEfficiency.annualSavings.toLocaleString()}/year`
        ], `Time savings adjusted for current tools and practices. ${results.inputs.currentTools === 'sqldbm' ? 'Minimal additional savings since already using SqlDBM.' : 'Significant savings from modernizing current tools.'}`);

        // Calculation 2: Rework Reduction
        yPos = this.addCalculationSection(doc, yPos, '2. Rework Reduction Savings', [
            `Formula: Models/Year × Hours/Model × Hourly Rate × Rework Avoided %`,
            `Calculation: ${results.inputs.dataProducts} × 80 × $75 × ${results.savings.reworkReduction.reworkAvoided}%`,
            `= ${results.inputs.dataProducts} × 80 × $75 × ${results.savings.reworkReduction.reworkAvoided/100}`,
            `= $${results.savings.reworkReduction.annualSavings.toLocaleString()}/year`
        ], `Rework reduction based on improved model clarity and standardization through SqlDBM.`);

        // Calculation 3: Downstream Productivity
        yPos = this.addCalculationSection(doc, yPos, '3. Downstream Productivity Gains', [
            `Formula: Stakeholders × Hours Saved/Month × Rate × 12 months`,
            `Calculation: ${results.inputs.stakeholders} × ${results.savings.downstreamProductivity.hoursSavedPerMonth} × $60 × 12`,
            `= ${results.inputs.stakeholders} × ${results.savings.downstreamProductivity.hoursSavedPerMonth} × $60 × 12`,
            `= $${results.savings.downstreamProductivity.annualSavings.toLocaleString()}/year`
        ], `Time savings for business analysts and data consumers through better model documentation and accessibility.`);

        // Calculation 4: Tool Consolidation
        yPos = this.addCalculationSection(doc, yPos, '4. Tool Consolidation Savings', [
            `Current Tool Spend: $${results.savings.toolConsolidation.currentToolSpend.toLocaleString()}`,
            `Consulting Costs: $${results.savings.toolConsolidation.consultingSpend.toLocaleString()}`,
            `Total Current Spend: $${(results.savings.toolConsolidation.currentToolSpend + results.savings.toolConsolidation.consultingSpend).toLocaleString()}`,
            `Reduction: ${results.savings.toolConsolidation.reductionPercent}%`,
            `Savings: $${results.savings.toolConsolidation.annualSavings.toLocaleString()}/year`
        ], `Savings from consolidating existing tools and reducing consulting needs.`);

        // Final Calculation
        if (yPos > 240) {
            doc.addPage();
            yPos = 30;
        }

        doc.setFillColor(248, 249, 250);
        doc.rect(this.margin, yPos, this.contentWidth, 35, 'F');

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('Total ROI Calculation:', this.margin + 10, yPos + 10);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        const finalCalc = [
            `Total Annual Value: $${results.metrics.totalAnnualValue.toLocaleString()}`,
            `Less SqlDBM Cost: $120,000`,
            `Net Annual Benefit: $${results.metrics.netAnnualValue.toLocaleString()}`,
            `Payback Period: ${results.metrics.paybackMonths} months`,
            `3-Year ROI: ${results.metrics.threeYearROI}x return`
        ];

        finalCalc.forEach((item, index) => {
            doc.text(item, this.margin + 10, yPos + 18 + (index * 4));
        });
    }

    addCalculationSection(doc, startY, title, calculations, explanation) {
        let yPos = startY;

        // Check if we need a new page
        if (yPos > 220) {
            doc.addPage();
            yPos = 30;
        }

        // Section title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text(title, this.margin, yPos);
        yPos += 10;

        // Calculations
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        calculations.forEach(calc => {
            doc.text(calc, this.margin + 5, yPos);
            yPos += 5;
        });

        yPos += 3;

        // Explanation
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const explainLines = doc.splitTextToSize(explanation, this.contentWidth - 10);
        doc.text(explainLines, this.margin + 5, yPos);
        yPos += explainLines.length * 4 + 8;

        return yPos;
    }

    formatCurrentTool(tool) {
        const toolMap = {
            'sqldbm': 'SqlDBM',
            'erwin': 'Erwin',
            'powerdesigner': 'PowerDesigner', 
            'excel': 'Excel',
            'visio': 'Visio',
            'lucidchart': 'Lucidchart',
            'draw.io': 'Draw.io',
            'other': 'Other'
        };
        return toolMap[tool] || tool;
    }

    addTable(doc, headers, data, startY) {
        const colWidth = this.contentWidth / headers.length;
        let yPos = startY;

        // Draw header
        doc.setFillColor(102, 126, 234);
        doc.setDrawColor(102, 126, 234);
        doc.rect(this.margin, yPos, this.contentWidth, 8, 'FD');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);

        headers.forEach((header, index) => {
            doc.text(header, this.margin + (index * colWidth) + 2, yPos + 5.5);
        });

        yPos += 8;

        // Draw data rows
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        data.forEach((row, rowIndex) => {
            if (rowIndex % 2 === 0) {
                doc.setFillColor(248, 249, 250);
                doc.rect(this.margin, yPos, this.contentWidth, 7, 'F');
            }

            row.forEach((cell, colIndex) => {
                doc.text(String(cell), this.margin + (colIndex * colWidth) + 2, yPos + 5);
            });

            yPos += 7;
        });

        // Draw table border
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.rect(this.margin, startY, this.contentWidth, yPos - startY);
    }

    addFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Add page number
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(
                `Page ${i} of ${pageCount}`, 
                this.pageWidth - this.margin - 20, 
                this.pageHeight - 10
            );

            // Add disclaimer
            const disclaimer = 'This ROI analysis is based on the inputs provided and industry benchmarks. Actual results may vary.';
            const disclaimerLines = doc.splitTextToSize(disclaimer, this.contentWidth);
            doc.text(
                disclaimerLines, 
                this.margin, 
                this.pageHeight - 15
            );
        }
    }

    formatIndustry(industry) {
        const industryMap = {
            'financial-services': 'Financial Services',
            'insurance': 'Insurance',
            'healthcare': 'Healthcare',
            'retail-ecommerce': 'Retail & E-commerce',
            'technology': 'Technology',
            'manufacturing': 'Manufacturing',
            'telecommunications': 'Telecommunications',
            'energy': 'Energy & Utilities',
            'government': 'Government',
            'education': 'Education',
            'media': 'Media & Entertainment',
            'other': 'Other'
        };
        return industryMap[industry] || industry;
    }

    formatCompanySize(size) {
        const sizeMap = {
            'medium': 'Medium (< $500M)',
            'large': 'Large ($500M - $5B)',
            'enterprise': 'Enterprise (> $5B)'
        };
        return sizeMap[size] || size;
    }

    generateNarrativeSummary(results) {
        const paybackText = results.metrics.paybackMonths <= 12 
            ? `${Math.round(results.metrics.paybackMonths)} months`
            : `${Math.round(results.metrics.paybackMonths / 12 * 10) / 10} years`;

        return `While data modeling may not directly generate revenue, this analysis demonstrates how SqlDBM transforms it into a powerful business accelerator. Through improved efficiency, reduced rework, and enhanced downstream productivity, SqlDBM delivers a ${paybackText} payback period with ${results.metrics.threeYearROI}x ROI over three years. The projected $${results.metrics.totalAnnualValue.toLocaleString()} in annual value proves that smart modeling infrastructure drives measurable business impact beyond traditional cost center thinking.`;
    }
}

// Export for use in other scripts
window.PDFGenerator = PDFGenerator;