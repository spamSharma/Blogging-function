import ImageKit from "https://cdn.skypack.dev/imagekit-javascript";
import { db, storage } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Initialize ImageKit client
const imagekit = new ImageKit({
  publicKey: "public_dGeUs0LnIL2kLt0XbRDTNrZLcYg=",
  urlEndpoint: "https://ik.imagekit.io/y2x3yxbrx",
  authenticationEndpoint: "https://blogging-function.vercel.app/api/auth"  // ← updated
});


window.format = function(command, btn) {
  document.execCommand(command, false, null);
  updateToolbarState();
}

window.insertImage = function() {
  document.getElementById("imageInput").click();
}

window.handleImageUpload = async function(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    try {
      const result = await imagekit.upload({
        file,
        fileName: file.name
      });
      const img = document.createElement("img");
      img.src = result.url;
      img.style.maxWidth = "100%";
      img.style.margin = "10px 0";
      insertAtCursor(img);
    } catch (error) {
      console.error("ImageKit upload error:", error);
    }
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

// Handle Blog Post Submission
window.postBlog = async function() {
  const title = document.getElementById("blogTitle").value;
  const content = document.getElementById("editor").innerHTML;
  const thumbnailFile = document.getElementById("thumbnailInput").files[0];

  if (!title || !content) {
    alert('Please enter both title and content');
    return;
  }

  let thumbnailURL = '';
  if (thumbnailFile) {
    try {
      const thumbUpload = await imagekit.upload({
        file: thumbnailFile,
        fileName: `thumb_${Date.now()}_${thumbnailFile.name}`
      });
      thumbnailURL = thumbUpload.url;
    } catch (error) {
      console.error("Thumbnail upload error:", error);
    }
  }

  try {
    await addDoc(collection(db, 'blogs'), {
      title,
      content,
      thumbnailURL,
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp()
    });
    alert('Blog post published successfully!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error publishing blog:', error);
    alert('Error publishing blog post. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
  if (editor) {
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
  }
});
