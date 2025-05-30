import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-storage.js";

const storage = getStorage();

// Make functions globally available
window.format = function(command, btn) {
    document.execCommand(command, false, null);
    updateToolbarState();
}

window.insertImage = function() {
    document.getElementById("imageInput").click();
}

window.handleImageUpload = function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "100%";
            img.style.margin = "10px 0";
            insertAtCursor(img);
        };
        reader.readAsDataURL(file);
    }
}

function insertAtCursor(node) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(node);

        const br = document.createElement("br");
        range.insertNode(br);
        range.setStartAfter(br);
        range.setEndAfter(br);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

window.changeFontSize = function(size) {
    document.execCommand("fontSize", false, size);
}

window.updateToolbarState = function() {
    const buttons = document.querySelectorAll(".btn-toolbar .btn[data-command]");
    buttons.forEach((button) => {
        const command = button.getAttribute("data-command");
        try {
            const isActive = document.queryCommandState(command);
            button.classList.toggle("active", isActive);
        } catch (e) {}
    });
}

// Function to upload a file to Firebase Storage
async function uploadFile(file, type) {
    try {
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `${type}/${filename}`);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Function to process images in content
async function processImages(content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const images = tempDiv.getElementsByTagName('img');
    
    for (let img of images) {
        if (img.src.startsWith('data:image')) {
            try {
                // Convert base64 to blob
                const response = await fetch(img.src);
                const blob = await response.blob();
                
                // Create a file from the blob
                const file = new File([blob], `image_${Date.now()}.png`, { type: 'image/png' });
                
                // Upload the file to Firebase Storage
                const url = await uploadFile(file, 'blog-images');
                
                // Update the image source to use the Firebase URL
                img.src = url;
            } catch (error) {
                console.error('Error saving image:', error);
                // Keep the original base64 image if save fails
            }
        }
    }
    return tempDiv.innerHTML;
}

// Handle Blog Post Submission
window.postBlog = async function() {
    const title = document.getElementById("blogTitle").value;
    const content = document.getElementById("editor").innerHTML;
    const thumbnail = document.getElementById("thumbnailInput").files[0];

    if (!title || !content) {
        alert('Please enter both title and content');
        return;
    }

    try {
        let thumbnailURL = '';
        
        // Upload thumbnail if provided
        if (thumbnail) {
            thumbnailURL = await uploadFile(thumbnail, 'thumbnails');
        }

        // Process and upload all images in the content
        const processedContent = await processImages(content);

        // Save blog post to Firestore
        await addDoc(collection(db, 'blogs'), {
            title,
            content: processedContent,
            thumbnailURL,
            createdAt: serverTimestamp(),
            lastModified: serverTimestamp()
        });

        alert('Blog post published successfully!');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error publishing blog:', error);
        alert('Error publishing blog post. Please try again. Error: ' + error.message);
    }
}

// Initialize editor state
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    if (editor) {
        editor.addEventListener('keyup', updateToolbarState);
        editor.addEventListener('mouseup', updateToolbarState);
    }
}); 