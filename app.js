/**
 * DropBin — Frontend Client Application
 * Pure HTML, CSS, Vanilla JS
 * Compatible with GitHub Pages & Google Apps Script
 */

// ==========================================
// CONFIGURATION
// ==========================================
// Paste your deployed Google Apps Script Web App URL below,
// or configure it dynamically via the in-app Settings modal.
const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbxobYbMXVfTdorpm4tBmnpU-yHydSY4FeDhVHL3e3id-rj9wMpt8MBB12p0XXull72s/exec";

// Storage key for settings & local demo fallback
const STORAGE_KEY_GAS_URL = "dropbin_gas_url";
const STORAGE_KEY_DEMO_STORE = "dropbin_demo_store";

// State
let selectedFile = null;
let currentMode = "file"; // 'file' or 'text'

// DOM Elements
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

const modeFileBtn = document.getElementById("modeFileBtn");
const modeTextBtn = document.getElementById("modeTextBtn");
const fileArea = document.getElementById("fileArea");
const textArea = document.getElementById("textArea");

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const selectedFileCard = document.getElementById("selectedFileCard");
const selectedFileName = document.getElementById("selectedFileName");
const selectedFileSize = document.getElementById("selectedFileSize");
const removeFileBtn = document.getElementById("removeFileBtn");

const textTitleInput = document.getElementById("textTitleInput");
const textPayloadInput = document.getElementById("textPayloadInput");
const charCount = document.getElementById("charCount");
const pasteClipboardBtn = document.getElementById("pasteClipboardBtn");

const customCodeInput = document.getElementById("customCodeInput");
const submitUploadBtn = document.getElementById("submitUploadBtn");
const uploadSuccessCard = document.getElementById("uploadSuccessCard");
const generatedCodeDisplay = document.getElementById("generatedCodeDisplay");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const shareUrlInput = document.getElementById("shareUrlInput");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const resetUploadBtn = document.getElementById("resetUploadBtn");
const qrCanvas = document.getElementById("qrCanvas");

const retrieveForm = document.getElementById("retrieveForm");
const retrieveCodeInput = document.getElementById("retrieveCodeInput");
const submitRetrieveBtn = document.getElementById("submitRetrieveBtn");
const retrieveResultCard = document.getElementById("retrieveResultCard");
const retrieveErrorAlert = document.getElementById("retrieveErrorAlert");
const retrieveErrorMsg = document.getElementById("retrieveErrorMsg");

const retrievedTypeBadge = document.getElementById("retrievedTypeBadge");
const retrievedTitle = document.getElementById("retrievedTitle");
const retrievedMeta = document.getElementById("retrievedMeta");
const fileResultBlock = document.getElementById("fileResultBlock");
const textResultBlock = document.getElementById("textResultBlock");
const downloadFileBtn = document.getElementById("downloadFileBtn");
const driveBackupLink = document.getElementById("driveBackupLink");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const imagePreview = document.getElementById("imagePreview");
const retrievedTextDisplay = document.getElementById("retrievedTextDisplay");
const copyRetrievedTextBtn = document.getElementById("copyRetrievedTextBtn");
const downloadTextAsFileBtn = document.getElementById("downloadTextAsFileBtn");

const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const settingsModal = document.getElementById("settingsModal");
const gasUrlInput = document.getElementById("gasUrlInput");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const testConnectionBtn = document.getElementById("testConnectionBtn");
const toast = document.getElementById("toast");

// Store currently retrieved item in memory for actions
let currentRetrievedItem = null;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initSettings();
  initTabNavigation();
  initSubmodeNavigation();
  initDropzone();
  initTextInput();
  initUpload();
  initRetrieve();
  checkUrlParamsForCode();
});

// ==========================================
// SETTINGS & BACKEND CONNECTION
// ==========================================
function getGasUrl() {
  return localStorage.getItem(STORAGE_KEY_GAS_URL) || DEFAULT_GAS_URL;
}

function initSettings() {
  const currentUrl = getGasUrl();
  updateStatusBadge(currentUrl);

  openSettingsBtn.addEventListener("click", () => {
    gasUrlInput.value = getGasUrl();
    settingsModal.classList.remove("hidden");
  });

  closeSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden");
    }
  });

  saveSettingsBtn.addEventListener("click", () => {
    const newUrl = gasUrlInput.value.trim();
    if (newUrl) {
      localStorage.setItem(STORAGE_KEY_GAS_URL, newUrl);
      showToast("Google Apps Script URL saved!");
    } else {
      localStorage.removeItem(STORAGE_KEY_GAS_URL);
      showToast("Operating in Local Demo Mode");
    }
    updateStatusBadge(newUrl);
    settingsModal.classList.add("hidden");
  });

  testConnectionBtn.addEventListener("click", async () => {
    const url = gasUrlInput.value.trim();
    if (!url) {
      showToast("Please enter a URL to test", true);
      return;
    }
    testConnectionBtn.disabled = true;
    testConnectionBtn.textContent = "Testing...";
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      const data = await res.json();
      if (data && (data.status === "ok" || data.message)) {
        showToast("✓ Connected successfully to Google Drive API!");
      } else {
        showToast("Connected, but unexpected response format", true);
      }
    } catch (err) {
      console.warn("Test connection error:", err);
      showToast("Connection failed. Check URL and Web App permissions.", true);
    } finally {
      testConnectionBtn.disabled = false;
      testConnectionBtn.textContent = "Test Connection";
    }
  });
}

function updateStatusBadge(url) {
  if (url) {
    statusIndicator.className = "status-badge status-live";
    statusText.textContent = "Google Drive Connected";
  } else {
    statusIndicator.className = "status-badge status-demo";
    statusText.textContent = "Demo / Offline Mode";
  }
}

// ==========================================
// TABS & SUBMODES
// ==========================================
function initTabNavigation() {
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");

      // Auto-focus retrieve input if switching to retrieve tab
      if (targetId === "retrieveTab") {
        setTimeout(() => retrieveCodeInput.focus(), 100);
      }
    });
  });
}

function initSubmodeNavigation() {
  modeFileBtn.addEventListener("click", () => {
    currentMode = "file";
    modeFileBtn.classList.add("active");
    modeTextBtn.classList.remove("active");
    fileArea.classList.remove("hidden");
    textArea.classList.add("hidden");
  });

  modeTextBtn.addEventListener("click", () => {
    currentMode = "text";
    modeTextBtn.classList.add("active");
    modeFileBtn.classList.remove("active");
    textArea.classList.remove("hidden");
    fileArea.classList.add("hidden");
    textPayloadInput.focus();
  });
}

// ==========================================
// FILE DROPZONE & HANDLING
// ==========================================
function initDropzone() {
  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  removeFileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    selectedFile = null;
    fileInput.value = "";
    selectedFileCard.classList.add("hidden");
    dropzone.classList.remove("hidden");
  });
}

function handleFileSelected(file) {
  // Max size limit (e.g. 25MB for Google Apps Script payload)
  const MAX_SIZE = 25 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    showToast("File is too large. Limit is 25MB.", true);
    return;
  }
  selectedFile = file;
  selectedFileName.textContent = file.name;
  selectedFileSize.textContent = formatBytes(file.size);
  selectedFileCard.classList.remove("hidden");
  dropzone.classList.add("hidden");
}

// ==========================================
// TEXT / KEYBOARD INPUT
// ==========================================
function initTextInput() {
  textPayloadInput.addEventListener("input", () => {
    charCount.textContent = textPayloadInput.value.length;
  });

  pasteClipboardBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      textPayloadInput.value = text;
      charCount.textContent = text.length;
      showToast("Pasted from clipboard");
    } catch (err) {
      showToast("Clipboard access denied. Please paste manually.", true);
    }
  });
}

// ==========================================
// UPLOAD LOGIC
// ==========================================
function initUpload() {
  submitUploadBtn.addEventListener("click", handleUpload);

  copyCodeBtn.addEventListener("click", () => {
    copyToClipboard(generatedCodeDisplay.textContent, "Code copied to clipboard!");
  });

  copyLinkBtn.addEventListener("click", () => {
    copyToClipboard(shareUrlInput.value, "Direct share link copied!");
  });

  resetUploadBtn.addEventListener("click", resetUploadState);
}

async function handleUpload() {
  const customCode = customCodeInput.value.trim().toUpperCase();
  const code = customCode || generateRandomCode();

  // Validate inputs
  if (currentMode === "file" && !selectedFile) {
    showToast("Please choose or drop a file first.", true);
    return;
  }

  if (currentMode === "text" && !textPayloadInput.value.trim()) {
    showToast("Please enter or paste text to share.", true);
    return;
  }

  setUploadLoading(true);

  try {
    let payload = {
      action: "upload",
      code: code,
      type: currentMode,
      timestamp: Date.now()
    };

    if (currentMode === "file") {
      const base64Data = await fileToBase64(selectedFile);
      payload.fileName = selectedFile.name;
      payload.mimeType = selectedFile.type || "application/octet-stream";
      payload.size = selectedFile.size;
      payload.contentBase64 = base64Data.split(",")[1]; // remove data:...base64, prefix
    } else {
      payload.fileName = textTitleInput.value.trim() || "paste.txt";
      payload.mimeType = "text/plain";
      payload.textContent = textPayloadInput.value;
      payload.size = new Blob([payload.textContent]).size;
    }

    const gasUrl = getGasUrl();

    if (gasUrl) {
      // Send to Google Apps Script Web App
      // Important: Use text/plain header to avoid CORS preflight (OPTIONS) rejection by Google
      const response = await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow"
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to upload to Google Drive");
      }
    } else {
      // Local Demo Mode (stores in localStorage for testing)
      simulateLocalUpload(code, payload);
    }

    displayUploadSuccess(code);
  } catch (err) {
    console.error("Upload error:", err);
    showToast("Upload failed: " + err.message, true);
  } finally {
    setUploadLoading(false);
  }
}

function displayUploadSuccess(code) {
  generatedCodeDisplay.textContent = code;

  // Construct direct share link
  const url = new URL(window.location.href);
  url.searchParams.set("code", code);
  shareUrlInput.value = url.toString();

  // Render QR Code for mobile quick pickup
  if (window.QRCode && qrCanvas) {
    QRCode.toCanvas(qrCanvas, url.toString(), {
      width: 140,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" }
    });
  }

  uploadSuccessCard.classList.remove("hidden");
  submitUploadBtn.classList.add("hidden");
}

function resetUploadState() {
  selectedFile = null;
  fileInput.value = "";
  selectedFileCard.classList.add("hidden");
  dropzone.classList.remove("hidden");

  textTitleInput.value = "";
  textPayloadInput.value = "";
  charCount.textContent = "0";
  customCodeInput.value = "";

  uploadSuccessCard.classList.add("hidden");
  submitUploadBtn.classList.remove("hidden");
}

function setUploadLoading(isLoading) {
  submitUploadBtn.disabled = isLoading;
  const textEl = submitUploadBtn.querySelector(".btn-text-content");
  const spinnerEl = submitUploadBtn.querySelector(".btn-spinner");

  if (isLoading) {
    textEl.classList.add("hidden");
    spinnerEl.classList.remove("hidden");
  } else {
    textEl.classList.remove("hidden");
    spinnerEl.classList.add("hidden");
  }
}

// ==========================================
// RETRIEVE LOGIC
// ==========================================
function initRetrieve() {
  retrieveForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = retrieveCodeInput.value.trim().toUpperCase();
    if (code) {
      fetchItemByCode(code);
    }
  });

  // Auto capitalize & format input
  retrieveCodeInput.addEventListener("input", () => {
    retrieveCodeInput.value = retrieveCodeInput.value.toUpperCase();
    if (retrieveCodeInput.value.length === 6) {
      // Auto submit on standard 6-char code
      fetchItemByCode(retrieveCodeInput.value);
    }
  });

  downloadFileBtn.addEventListener("click", () => {
    if (!currentRetrievedItem) return;
    downloadBlob(
      currentRetrievedItem.blob,
      currentRetrievedItem.fileName
    );
  });

  copyRetrievedTextBtn.addEventListener("click", () => {
    if (!currentRetrievedItem || !currentRetrievedItem.content) return;
    copyToClipboard(currentRetrievedItem.content, "Text copied to clipboard!");
  });

  downloadTextAsFileBtn.addEventListener("click", () => {
    if (!currentRetrievedItem || !currentRetrievedItem.content) return;
    const blob = new Blob([currentRetrievedItem.content], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, currentRetrievedItem.fileName || "snippet.txt");
  });
}

async function fetchItemByCode(code) {
  hideRetrieveResults();
  setRetrieveLoading(true);

  try {
    const gasUrl = getGasUrl();
    let data = null;

    if (gasUrl) {
      const response = await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "retrieve", code: code }),
        redirect: "follow"
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "No item found with this code");
      }
      data = result;
    } else {
      // Local Demo Mode fetch
      data = simulateLocalRetrieve(code);
      if (!data) {
        throw new Error("No item found matching code '" + code + "' in local demo storage.");
      }
    }

    renderRetrievedItem(data);
  } catch (err) {
    showRetrieveError(err.message);
  } finally {
    setRetrieveLoading(false);
  }
}

function renderRetrievedItem(data) {
  currentRetrievedItem = data;

  retrievedTypeBadge.textContent = (data.type || "FILE").toUpperCase();
  retrievedTitle.textContent = data.fileName || data.name || "Untitled";

  const sizeStr = data.size ? formatBytes(data.size) : "";
  const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "Just now";
  retrievedMeta.textContent = [sizeStr, dateStr].filter(Boolean).join(" • ");

  if (data.type === "text") {
    fileResultBlock.classList.add("hidden");
    textResultBlock.classList.remove("hidden");
    retrievedTextDisplay.textContent = data.content || data.textContent || "";
  } else {
    textResultBlock.classList.add("hidden");
    fileResultBlock.classList.remove("hidden");

    // Convert Base64 data back to Blob for downloading & previewing
    if (data.base64 || data.contentBase64) {
      const rawBase64 = data.base64 || data.contentBase64;
      const mime = data.mimeType || "application/octet-stream";
      currentRetrievedItem.blob = base64ToBlob(rawBase64, mime);

      // If image, render preview
      if (mime.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(currentRetrievedItem.blob);
        imagePreview.src = objectUrl;
        imagePreviewContainer.classList.remove("hidden");
      } else {
        imagePreviewContainer.classList.add("hidden");
      }
    }

    if (data.downloadUrl || data.driveViewUrl) {
      driveBackupLink.href = data.driveViewUrl || data.downloadUrl;
      driveBackupLink.classList.remove("hidden");
    } else {
      driveBackupLink.classList.add("hidden");
    }
  }

  retrieveResultCard.classList.remove("hidden");
}

function hideRetrieveResults() {
  retrieveResultCard.classList.add("hidden");
  retrieveErrorAlert.classList.add("hidden");
  imagePreviewContainer.classList.add("hidden");
}

function showRetrieveError(msg) {
  retrieveErrorMsg.textContent = msg;
  retrieveErrorAlert.classList.remove("hidden");
}

function setRetrieveLoading(isLoading) {
  submitRetrieveBtn.disabled = isLoading;
  const textEl = submitRetrieveBtn.querySelector(".btn-text-content");
  const spinnerEl = submitRetrieveBtn.querySelector(".btn-spinner");

  if (isLoading) {
    textEl.classList.add("hidden");
    spinnerEl.classList.remove("hidden");
  } else {
    textEl.classList.remove("hidden");
    spinnerEl.classList.add("hidden");
  }
}

// Auto-check URL query params for ?code=XYZ
function checkUrlParamsForCode() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (code) {
    // Switch to Retrieve tab
    const retrieveTabBtn = document.querySelector('[data-tab="retrieveTab"]');
    if (retrieveTabBtn) retrieveTabBtn.click();
    retrieveCodeInput.value = code.trim().toUpperCase();
    fetchItemByCode(retrieveCodeInput.value);
  }
}

// ==========================================
// LOCAL DEMO / OFFLINE FALLBACK
// ==========================================
function simulateLocalUpload(code, payload) {
  let store = {};
  try {
    store = JSON.parse(localStorage.getItem(STORAGE_KEY_DEMO_STORE) || "{}");
  } catch (e) {
    store = {};
  }
  store[code] = {
    ...payload,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY_DEMO_STORE, JSON.stringify(store));
}

function simulateLocalRetrieve(code) {
  try {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY_DEMO_STORE) || "{}");
    const item = store[code];
    if (item) {
      return {
        success: true,
        type: item.type,
        fileName: item.fileName,
        mimeType: item.mimeType,
        size: item.size,
        content: item.textContent,
        base64: item.contentBase64,
        createdAt: item.createdAt
      };
    }
  } catch (e) {}
  return null;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function generateRandomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous 0,O,1,I
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const byteArrays = [];
  const sliceSize = 512;

  for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
    const slice = byteChars.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: mimeType });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function copyToClipboard(text, successMsg = "Copied!") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg);
  }).catch(() => {
    showToast("Failed to copy", true);
  });
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.borderColor = isError ? "var(--danger)" : "var(--accent)";
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3200);
}
