// Charts and visualizations
class ROICharts {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#28a745',
            warning: '#ffc107',
            info: '#17a2b8',
            light: '#f8f9fa',
            dark: '#343a40'
        };
        
        this.gradients = {};
    }

    createGradient(ctx, color1, color2) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }

    initializeCharts(results) {
        // Destroy existing charts
        this.destroyCharts();
        
        // Create value breakdown chart
        this.createValueBreakdownChart(results.breakdown);
        
        // Create ROI timeline chart
        this.createROITimelineChart(results.timeline);
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    createValueBreakdownChart(breakdown) {
        const ctx = document.getElementById('valueBreakdownChart');
        if (!ctx) return;

        // Calculate percentages for data labels
        const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
        const percentages = breakdown.map(item => Math.round((item.amount / total) * 100));

        const data = {
            labels: breakdown.map(item => item.category),
            datasets: [{
                label: 'Annual Savings',
                data: breakdown.map(item => item.amount),
                backgroundColor: [
                    this.colors.primary,
                    this.colors.secondary,
                    this.colors.success,
                    this.colors.info
                ],
                borderColor: [
                    this.colors.primary,
                    this.colors.secondary,
                    this.colors.success,
                    this.colors.info
                ],
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false,
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Horizontal bar chart
                plugins: {
                    legend: {
                        display: false // Hide legend since we only have one dataset
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.x;
                                const percentage = percentages[context.dataIndex];
                                return `$${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'right',
                        color: '#333',
                        font: {
                            weight: 'bold',
                            size: 11
                        },
                        formatter: function(value, context) {
                            const percentage = percentages[context.dataIndex];
                            return `${percentage}%`;
                        },
                        padding: {
                            left: 10
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Annual Savings ($)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            callback: function(value, index) {
                                // Truncate long labels
                                const label = this.getLabelForValue(value);
                                return label.length > 25 ? label.substring(0, 22) + '...' : label;
                            }
                        }
                    }
                },
                elements: {
                    bar: {
                        borderWidth: 1
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                layout: {
                    padding: {
                        right: 50 // Extra space for percentage labels
                    }
                }
            },
            plugins: [{
                // Custom plugin to draw percentage labels
                id: 'percentageLabels',
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    ctx.save();
                    
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const percentage = percentages[index];
                            const value = dataset.data[index];
                            
                            // Position for the label
                            const x = bar.x + 10;
                            const y = bar.y + 4;
                            
                            // Style the text
                            ctx.fillStyle = '#333';
                            ctx.font = 'bold 12px Inter, sans-serif';
                            ctx.textAlign = 'left';
                            ctx.textBaseline = 'middle';
                            
                            // Draw percentage
                            ctx.fillText(`${percentage}%`, x, y);
                        });
                    });
                    
                    ctx.restore();
                }
            }]
        };

        this.charts.valueBreakdown = new Chart(ctx, config);
    }

    createROITimelineChart(timeline) {
        const ctx = document.getElementById('roiTimelineChart');
        if (!ctx) return;

        // Get canvas context for gradients
        const canvasCtx = ctx.getContext('2d');
        
        const valueGradient = this.createGradient(canvasCtx, 'rgba(102, 126, 234, 0.8)', 'rgba(102, 126, 234, 0.1)');
        const costGradient = this.createGradient(canvasCtx, 'rgba(220, 53, 69, 0.8)', 'rgba(220, 53, 69, 0.1)');
        const netGradient = this.createGradient(canvasCtx, 'rgba(40, 167, 69, 0.8)', 'rgba(40, 167, 69, 0.1)');

        // Filter timeline to show every 3 months for first year, then every 6 months
        const filteredTimeline = timeline.filter((item, index) => {
            if (item.month <= 12) {
                return item.month % 3 === 0; // Every 3 months for first year
            } else {
                return item.month % 6 === 0; // Every 6 months after
            }
        });

        const data = {
            labels: filteredTimeline.map(item => {
                if (item.month <= 12) {
                    return `Month ${item.month}`;
                } else {
                    return `Year ${Math.ceil(item.month / 12)}`;
                }
            }),
            datasets: [
                {
                    label: 'Cumulative Value',
                    data: filteredTimeline.map(item => item.cumulativeValue),
                    borderColor: this.colors.primary,
                    backgroundColor: valueGradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                },
                {
                    label: 'Cumulative Cost',
                    data: filteredTimeline.map(item => item.cumulativeCost),
                    borderColor: '#dc3545',
                    backgroundColor: costGradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#dc3545',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                },
                {
                    label: 'Net Value',
                    data: filteredTimeline.map(item => item.netValue),
                    borderColor: this.colors.success,
                    backgroundColor: netGradient,
                    fill: false,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: this.colors.success,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: $${value.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Timeline'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Value ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        };

        this.charts.timeline = new Chart(ctx, config);
    }

    // Create a simple bar chart for comparison (optional)
    createComparisonChart(data, elementId) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;

        const config = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Value',
                    data: data.values,
                    backgroundColor: this.colors.primary,
                    borderColor: this.colors.secondary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        };

        return new Chart(ctx, config);
    }

    // Animate number counters
    animateNumbers(results) {
        this.animateCounter('roiSummary', 0, results.metrics.threeYearROI, 2000, (value) => `${value.toFixed(1)}x`);
        this.animateCounter('paybackPeriod', 0, results.metrics.paybackMonths, 2000, (value) => {
            const months = Math.round(value);
            if (months < 12) {
                return `${months} months`;
            } else {
                const years = Math.floor(months / 12);
                const remainingMonths = months % 12;
                if (remainingMonths === 0) {
                    return `${years} year${years > 1 ? 's' : ''}`;
                } else {
                    return `${years}y ${remainingMonths}m`;
                }
            }
        });
        this.animateCounter('annualValue', 0, results.metrics.totalAnnualValue, 2000, (value) => `$${Math.round(value).toLocaleString()}`);
        this.animateCounter('threeYearROI', 0, results.metrics.threeYearValue, 2000, (value) => `$${Math.round(value).toLocaleString()}`);
    }

    animateCounter(elementId, start, end, duration, formatter) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startTime = performance.now();
        const startValue = start;
        const endValue = end;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (endValue - startValue) * easeOutQuart;
            
            element.textContent = formatter(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Update chart colors based on theme
    updateTheme(isDark = false) {
        if (isDark) {
            this.colors.primary = '#8b92ff';
            this.colors.secondary = '#9b8bff';
        } else {
            this.colors.primary = '#667eea';
            this.colors.secondary = '#764ba2';
        }
    }
}

// Export for use in other scripts
window.ROICharts = ROICharts;