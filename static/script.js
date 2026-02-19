// Brain Tumor Classification System JavaScript
// Add your JavaScript code here

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
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.borderColor = '#d1d5db';
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#d1d5db';
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
});

function handleFileSelect(file) {
    // Handle file selection and upload
    console.log('File selected:', file.name);
    // Add your file upload logic here
}

// Socket.IO connection for chat
if (typeof io !== 'undefined') {
    const socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('response', (data) => {
        console.log('Server response:', data.message);
        // Handle chat responses
    });
    
    // Send chat message
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    
    if (chatSend && chatInput) {
        chatSend.addEventListener('click', () => {
            const message = chatInput.value;
            if (message.trim()) {
                socket.emit('message', { message: message });
                chatInput.value = '';
            }
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                chatSend.click();
            }
        });
    }
}

