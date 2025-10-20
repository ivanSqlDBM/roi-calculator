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
        this.addMethodology(doc);
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
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Ready to Transform Your Data Modeling Process?', this.margin + 10, yPos + 13);

        yPos += 35;

        // Value proposition
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const valueMessage = `Your analysis shows potential annual savings of $${results.metrics.totalAnnualValue.toLocaleString()} with SqlDBM. With a payback period of just ${Math.ceil(results.metrics.paybackMonths)} months and ${results.metrics.threeYearROI}x ROI over 3 years, isn't it time to see SqlDBM in action?`;
        
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
            '⚡ See exactly how SqlDBM accelerates your modeling workflows',
            '🎯 Discover features tailored to your ' + this.formatIndustry(formData.industry) + ' industry needs',
            '💡 Get answers to your specific data modeling challenges',
            '🚀 Learn how to achieve the projected savings in your environment',
            '🔧 See integrations with your current tools and processes'
        ];

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        benefits.forEach(benefit => {
            const benefitLines = doc.splitTextToSize(benefit, this.contentWidth - 10);
            doc.text(benefitLines, this.margin + 5, yPos);
            yPos += benefitLines.length * 5 + 3;
        });

        yPos += 15;

        // CTA Boxes
        const boxWidth = (this.contentWidth - 10) / 2;
        const boxHeight = 35;

        // Demo box
        doc.setFillColor(102, 126, 234);
        doc.setDrawColor(102, 126, 234);
        doc.rect(this.margin, yPos, boxWidth, boxHeight, 'FD');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Schedule a Live Demo', this.margin + 10, yPos + 15);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('30-minute personalized session', this.margin + 10, yPos + 25);

        // Tour box
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(102, 126, 234);
        doc.rect(this.margin + boxWidth + 10, yPos, boxWidth, boxHeight, 'FD');

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('Request Product Tour', this.margin + boxWidth + 20, yPos + 15);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Custom walkthrough for your use case', this.margin + boxWidth + 20, yPos + 25);

        yPos += 50;

        // Contact information
        doc.setFillColor(248, 249, 250);
        doc.rect(this.margin, yPos, this.contentWidth, 25, 'F');

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Contact Our Team Today:', this.margin + 10, yPos + 8);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('📧 demo@sqldbm.com  |  📞 (555) 123-4567  |  🌐 www.sqldbm.com/demo', this.margin + 10, yPos + 18);

        yPos += 35;

        // Urgency message
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        
        const urgencyMessage = `Don't let another quarter pass without optimizing your data modeling process. Your competitors may already be gaining the advantages outlined in this analysis.`;
        const urgencyLines = doc.splitTextToSize(urgencyMessage, this.contentWidth);
        doc.text(urgencyLines, this.margin, yPos);
    }

    addMethodology(doc) {
        let yPos = doc.internal.pageSize.height - 80;

        // Check if we need space
        if (yPos < 50) {
            doc.addPage();
            yPos = 30;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Methodology', this.margin, yPos);

        yPos += 15;

        const methodology = [
            '1. Labor Efficiency: Calculated based on team size × loaded FTE cost × time savings %',
            '2. Rework Reduction: Models per year × hours per model × hourly cost × rework avoided %',
            '3. Downstream Productivity: Stakeholders × hours saved per month × hourly cost × 12 months',
            '4. Tool Consolidation: Current tool spend + consulting costs × reduction %'
        ];

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        methodology.forEach(item => {
            const splitText = doc.splitTextToSize(item, this.contentWidth - 5);
            doc.text(splitText, this.margin + 5, yPos);
            yPos += splitText.length * 5 + 3;
        });
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

        return `Based on your organization's profile and current data modeling practices, implementing SqlDBM is projected to deliver significant value. The analysis shows a payback period of ${paybackText} with a ${results.metrics.threeYearROI}x return on investment over three years. The primary value drivers include improved team efficiency, reduced rework, enhanced stakeholder productivity, and tool consolidation savings. This analysis assumes conservative efficiency gains and is based on industry benchmarks for similar organizations.`;
    }
}

// Export for use in other scripts
window.PDFGenerator = PDFGenerator;