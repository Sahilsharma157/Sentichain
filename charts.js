// Global chart instances
let barChart, pieChart, lineChart, radarChart;

// Initialize charts when DOM is loaded
function initCharts() {
  // Charts will be initialized when needed
  console.log('Charts module initialized');
}

// Update charts with new data
function updateCharts(results) {
  // Destroy existing charts first
  destroyCharts();
  
  // Then render new charts
  renderCharts(results);
}

// Update chart themes based on dark/light mode
function updateChartThemes() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  const textColor = isDarkMode ? '#f8fafc' : '#1e293b';
  
  // Update existing charts if they exist
  if (barChart) updateChartColorsWithTheme();
}

// Main function to render all charts
function renderCharts(results) {
  const isDarkMode = document.body.classList.contains('dark-mode');
  const textColor = isDarkMode ? '#f8fafc' : '#1e293b';
  
  renderBarChart(results, textColor);
  renderPieChart(results, textColor);
  renderLineChart(results, textColor);
  renderRadarChart(results, textColor);
}

// Render bar chart showing sentiment distribution
function renderBarChart(results, textColor) {
  const ctx = document.getElementById('barChart').getContext('2d');
  
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Positive', 'Negative', 'Neutral'],
      datasets: [{
        label: 'Sentiment Score',
        data: [
          results.positive_percentage * 100,
          results.negative_percentage * 100,
          results.neutral_percentage * 100
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',  // Green
          'rgba(239, 68, 68, 0.7)',   // Red
          'rgba(245, 158, 11, 0.7)'   // Orange
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            },
            color: textColor
          },
          grid: {
            color: textColor + '20'
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: textColor + '20'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    }
  });
}

// Render pie chart showing sentiment proportions
function renderPieChart(results, textColor) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  
  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Positive', 'Negative', 'Neutral'],
      datasets: [{
        data: [
          results.positive_percentage * 100,
          results.negative_percentage * 100,
          results.neutral_percentage * 100
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.raw.toFixed(1) + '%';
            }
          }
        }
      }
    }
  });
}

// Render line chart showing sentiment intensity over sections of text
function renderLineChart(results, textColor) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  
  // For the demo, create sample data showing intensity across text sections
  // In a real application, this would be calculated from the text
  const sections = ['Intro', 'Section 1', 'Section 2', 'Section 3', 'Conclusion'];
  
  // Generate some mock data for the line chart
  // In reality, this would be based on sectional sentiment analysis
  const posIntensity = [0.5, 0.7, 0.4, 0.6, 0.8].map(v => v * results.positive_percentage * 100);
  const negIntensity = [0.3, 0.6, 0.8, 0.4, 0.2].map(v => v * results.negative_percentage * 100);
  const neuIntensity = [0.6, 0.3, 0.5, 0.7, 0.4].map(v => v * results.neutral_percentage * 100);
  
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sections,
      datasets: [
        {
          label: 'Positive',
          data: posIntensity,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Negative',
          data: negIntensity,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Neutral',
          data: neuIntensity,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor
          },
          grid: {
            color: textColor + '20'
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: textColor + '20'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    }
  });
}

// Render radar chart showing key topics
function renderRadarChart(results, textColor) {
  const ctx = document.getElementById('radarChart').getContext('2d');
  
  // For the demo, create sample key topics
  // In a real application, these would be extracted from the text
  const topics = results.key_topics || ['Finance', 'Technology', 'Politics', 'Environment', 'Health'];
  
  // Generate random relevance scores for each topic
  // In reality, this would be based on topic extraction and relevance scoring
  const relevanceScores = [];
  for (let i = 0; i < topics.length; i++) {
    relevanceScores.push(Math.random() * 100);
  }
  
  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: topics,
      datasets: [{
        label: 'Topic Relevance',
        data: relevanceScores,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: {
          borderWidth: 3
        }
      },
      scales: {
        r: {
          angleLines: {
            color: textColor + '40'
          },
          grid: {
            color: textColor + '20'
          },
          pointLabels: {
            color: textColor
          },
          ticks: {
            color: textColor,
            backdropColor: 'transparent'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    }
  });
}

// Destroy all charts to prevent memory leaks
function destroyCharts() {
  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();
  if (lineChart) lineChart.destroy();
  if (radarChart) radarChart.destroy();
}

// Update colors of all charts based on theme
function updateChartColorsWithTheme() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  const textColor = isDarkMode ? '#f8fafc' : '#1e293b';
  
  // We would update existing charts here, but since we're demo-ing,
  // we'll just recreate them if we have results
  if (currentAnalysisResults) {
    destroyCharts();
    renderCharts(currentAnalysisResults.results);
  }
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', initCharts);
