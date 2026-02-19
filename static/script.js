// Brain Tumor Classification System JavaScript - Enhanced

// File upload handling
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const uploadZone = document.getElementById('upload-zone');
    
    if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
    }
    
    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', () => fileInput.click());
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#059669';
            uploadZone.style.background = '#f0fdf4';
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.borderColor = '#e5e7eb';
            uploadZone.style.background = '#f9fafb';
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#e5e7eb';
            uploadZone.style.background = '#f9fafb';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFileSelect(files[0]);
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    // Initialize chat functionality
    initializeChat();
});

function handleFileSelect(file) {
    console.log('File selected:', file.name);
    
    // Show loading spinner
    const uploadLoading = document.getElementById('upload-loading');
    if (uploadLoading) {
        uploadLoading.style.display = 'block';
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload and predict
    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        console.log('Prediction result:', result);
        
        if (uploadLoading) {
            uploadLoading.style.display = 'none';
        }
        
        // Hide upload section and show results
        const uploadSection = document.getElementById('upload-section');
        const resultsSection = document.getElementById('results-section');
        
        if (uploadSection) uploadSection.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'block';
        
        // Display results
        displayResults(result, file.name);
    })
    .catch(error => {
        console.error('Error analyzing image:', error);
        if (uploadLoading) {
            uploadLoading.style.display = 'none';
        }
        alert('Error analyzing image. Please try again.');
    });
}

function displayResults(result, filename) {
    // Update detection title
    const detectionTitle = document.getElementById('detection-title');
    if (detectionTitle && result.prediction) {
        const formattedPrediction = result.prediction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        detectionTitle.textContent = 'Detected Condition: ' + formattedPrediction;
    }
    
    // Create probability chart
    if (result.confidence_scores) {
        createProbabilityChart(result.confidence_scores);
    }
    
    // Display uploaded image
    if (result.uploaded_image_url) {
        const uploadedImageSection = document.getElementById('uploaded-image-section');
        const uploadedImageDisplay = document.getElementById('uploaded-image-display');
        const imageFilename = document.getElementById('image-filename');
        
        if (uploadedImageSection) uploadedImageSection.style.display = 'block';
        if (uploadedImageDisplay) uploadedImageDisplay.src = result.uploaded_image_url;
        if (imageFilename) imageFilename.textContent = filename;
    }
    
    // Display preprocessing steps
    if (result.preprocessing_steps) {
        displayPreprocessingSteps(result.preprocessing_steps);
    }
    
    // Animate progress bar
    animateProgressBar();
}

let probabilityChart = null;

function createProbabilityChart(confidenceScores) {
    const canvas = document.getElementById('probability-chart');
    if (!canvas || typeof Chart === 'undefined') {
        console.error('Chart.js not loaded or canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (probabilityChart) {
        probabilityChart.destroy();
    }
    
    const labels = Object.keys(confidenceScores).map(key =>
        key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    const data = Object.values(confidenceScores);
    
    // Create gradient colors based on confidence
    const colors = data.map((value) => {
        if (value > 80) return '#16a34a';
        if (value > 60) return '#059669';
        if (value > 40) return '#10b981';
        if (value > 20) return '#34d399';
        return '#9ca3af';
    });
    
    probabilityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color + '80'),
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 10
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(1) + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#059669'
                    },
                    grid: {
                        color: 'rgba(22, 163, 74, 0.1)',
                        borderColor: 'rgba(22, 163, 74, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        font: {
                            size: 11,
                            weight: '600'
                        },
                        color: '#059669'
                    },
                    grid: {
                        color: 'rgba(22, 163, 74, 0.1)',
                        borderColor: 'rgba(22, 163, 74, 0.2)'
                    }
                }
            }
        }
    });
}

function displayPreprocessingSteps(steps) {
    const gallery = document.getElementById('preprocessing-gallery');
    if (!gallery) return;
    
    gallery.innerHTML = '';
    
    steps.forEach(function(step) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'preprocessing-step';
        stepDiv.innerHTML =
            '<img src="' + step.image_url + '" alt="' + step.name + '" loading="lazy" onerror="this.style.display=\'none\'">' +
            '<p>' + step.name + '</p>' +
            '<div class="description">' + (step.description || '') + '</div>';
        gallery.appendChild(stepDiv);
    });
}

function animateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
        progressFill.style.width = '0%';
        setTimeout(() => {
            progressFill.style.width = '100%';
        }, 100);
    }
    
    if (progressText) {
        const steps = [
            'Step 1/5: Loading image...',
            'Step 2/5: Processing brain MRI scan...',
            'Step 3/5: Analyzing features...',
            'Step 4/5: Classifying tumor type...',
            'Step 5/5: Generating results...'
        ];
        
        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                progressText.textContent = steps[currentStep];
                currentStep++;
            } else {
                clearInterval(interval);
                progressText.textContent = 'Analysis complete!';
            }
        }, 500);
    }
}

// Metrics Tab Function
function showMetricsTab(tabName) {
    // Remove active class from all tabs and tab contents
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.metrics-tab-content');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    const selectedButton = Array.from(tabButtons).find(btn => 
        btn.getAttribute('onclick')?.includes(tabName)
    );
    
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}

// Socket.IO connection for chat
function initializeChat() {
    if (typeof io === 'undefined') {
        console.log('Socket.IO not loaded');
        return;
    }
    
    const socket = io();
    const chatBox = document.getElementById('chat-box');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const chatPlaceholder = chatBox?.querySelector('.chat-placeholder');
    
    socket.on('connect', () => {
        console.log('Connected to server');
        if (chatPlaceholder) {
            chatPlaceholder.textContent = 'Connected! Ask me anything 💬';
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        if (chatPlaceholder) {
            chatPlaceholder.textContent = 'Disconnected. Reconnecting...';
        }
    });
    
    socket.on('response', (data) => {
        console.log('Server response:', data.message);
        if (chatBox && data.message) {
            if (chatPlaceholder) {
                chatPlaceholder.style.display = 'none';
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = 'padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.2); border-radius: 6px; font-size: 0.875rem;';
            messageDiv.textContent = data.message;
            chatBox.appendChild(messageDiv);
            
            // Auto scroll to bottom
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
    
    // Send chat message
    if (chatSend && chatInput) {
        chatSend.addEventListener('click', () => {
            sendChatMessage(socket, chatInput, chatBox, chatPlaceholder);
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage(socket, chatInput, chatBox, chatPlaceholder);
            }
        });
    }
}

function sendChatMessage(socket, chatInput, chatBox, chatPlaceholder) {
    const message = chatInput.value.trim();
    if (message) {
        // Display user message
        if (chatPlaceholder) {
            chatPlaceholder.style.display = 'none';
        }
        
        const userMessageDiv = document.createElement('div');
        userMessageDiv.style.cssText = 'padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.3); border-radius: 6px; font-size: 0.875rem; text-align: right;';
        userMessageDiv.textContent = 'You: ' + message;
        chatBox.appendChild(userMessageDiv);
        
        // Emit to server
        socket.emit('message', { message: message });
        
        // Clear input
        chatInput.value = '';
        
        // Auto scroll
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Make showMetricsTab available globally
window.showMetricsTab = showMetricsTab;
