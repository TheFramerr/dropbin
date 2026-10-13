/**
 * DropBin — Client Application (v2.0)
 * Pure HTML, CSS, Vanilla JS
 * Google Drive Backend with GitHub Admin (@theserphh)
 */

// ==========================================
// CONFIGURATION (Hardcoded backend URL)
// ==========================================
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzAO5gMsNA3hcTt4pCZmORju3e66oxQ-2hEVxB86ND0Qcx15u1AxOvMl7VRRrFV1Ot3/exec";
const ADMIN_GITHUB_USER = "theframerr";
const STORAGE_KEY_ADMIN_TOKEN = "dropbin_gh_admin_token";

// State
let selectedFile = null;
let currentMode = "file"; // 'file' or 'text'
let adminToken = sessionStorage.getItem(STORAGE_KEY_ADMIN_TOKEN) || "";
let adminUserData = null;
let currentRetrievedItem = null;
let allAdminFiles = [];

// ==========================================
// DOM ELEMENTS
// ==========================================
// Tabs & Modes
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");
const modeFileBtn = document.getElementById("modeFileBtn");
const modeTextBtn = document.getElementById("modeTextBtn");
const fileArea = document.getElementById("fileArea");
const textArea = document.getElementById("textArea");

// Upload Components
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const selectedFileCard = document.getElementById("selectedFileCard");
const selectedFileName = document.getElementById("selectedFileName");
const selectedFileSize = document.getElementById("selectedFileSize");
const removeFileBtn = document.getElementById("removeFileBtn");

const textTitleInput = document.getElementById("textTitleInput");
const textPayloadInput = document.getElementById("textPayloadInput");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const pasteClipboardBtn = document.getElementById("pasteClipboardBtn");

const toggleAdvancedBtn = document.getElementById("toggleAdvancedBtn");
const advancedOptionsBody = document.getElementById("advancedOptionsBody");
const advancedChevron = document.getElementById("advancedChevron");
const customCodeInput = document.getElementById("customCodeInput");
const expirySelect = document.getElementById("expirySelect");
const uploadPinInput = document.getElementById("uploadPinInput");

const submitUploadBtn = document.getElementById("submitUploadBtn");
const uploadSuccessCard = document.getElementById("uploadSuccessCard");
const generatedCodeDisplay = document.getElementById("generatedCodeDisplay");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const shareUrlInput = document.getElementById("shareUrlInput");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const resetUploadBtn = document.getElementById("resetUploadBtn");
const qrImage = document.getElementById("qrImage");

// Retrieve Components
const retrieveForm = document.getElementById("retrieveForm");
const retrieveCodeInput = document.getElementById("retrieveCodeInput");
const retrievePinBox = document.getElementById("retrievePinBox");
const retrievePinInput = document.getElementById("retrievePinInput");
const submitRetrieveBtn = document.getElementById("submitRetrieveBtn");
const retrieveResultCard = document.getElementById("retrieveResultCard");
const retrievedTypeBadge = document.getElementById("retrievedTypeBadge");
const burnBadge = document.getElementById("burnBadge");
const retrievedTitle = document.getElementById("retrievedTitle");
const retrievedMeta = document.getElementById("retrievedMeta");
const fileResultBlock = document.getElementById("fileResultBlock");
const textResultBlock = document.getElementById("textResultBlock");
const downloadFileBtn = document.getElementById("downloadFileBtn");
const fileCategoryIcon = document.getElementById("fileCategoryIcon");

const mediaPreviewSection = document.getElementById("mediaPreviewSection");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const imagePreview = document.getElementById("imagePreview");
const audioPreviewContainer = document.getElementById("audioPreviewContainer");
const audioPreview = document.getElementById("audioPreview");
const videoPreviewContainer = document.getElementById("videoPreviewContainer");
const videoPreview = document.getElementById("videoPreview");

const viewRawBtn = document.getElementById("viewRawBtn");
const viewRenderedBtn = document.getElementById("viewRenderedBtn");
const retrievedTextDisplay = document.getElementById("retrievedTextDisplay");
const markdownDisplay = document.getElementById("markdownDisplay");
const copyRetrievedTextBtn = document.getElementById("copyRetrievedTextBtn");
const downloadTextAsFileBtn = document.getElementById("downloadTextAsFileBtn");

const revokedAlert = document.getElementById("revokedAlert");
const retrieveErrorAlert = document.getElementById("retrieveErrorAlert");
const retrieveErrorMsg = document.getElementById("retrieveErrorMsg");

// Admin Portal Components
const openAdminBtn = document.getElementById("openAdminBtn");
const adminBtnLabel = document.getElementById("adminBtnLabel");
const adminBadgeDot = document.getElementById("adminBadgeDot");
const adminModal = document.getElementById("adminModal");
const closeAdminBtn = document.getElementById("closeAdminBtn");
const adminLoginView = document.getElementById("adminLoginView");
const adminDashboardView = document.getElementById("adminDashboardView");
const githubTokenInput = document.getElementById("githubTokenInput");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminAuthError = document.getElementById("adminAuthError");
const adminAvatar = document.getElementById("adminAvatar");
const adminName = document.getElementById("adminName");
const adminUsername = document.getElementById("adminUsername");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const statTotal = document.getElementById("statTotal");
const statActive = document.getElementById("statActive");
const statRevoked = document.getElementById("statRevoked");
const adminSearchInput = document.getElementById("adminSearchInput");
const adminRefreshBtn = document.getElementById("adminRefreshBtn");
const adminFilesTableBody = document.getElementById("adminFilesTableBody");

// Edit Modal Components
const editFileModal = document.getElementById("editFileModal");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveEditBtn = document.getElementById("saveEditBtn");
const editFileId = document.getElementById("editFileId");
const editCodeInput = document.getElementById("editCodeInput");
const editFileNameInput = document.getElementById("editFileNameInput");
const editTextContentGroup = document.getElementById("editTextContentGroup");
const editTextContentInput = document.getElementById("editTextContentInput");

const toast = document.getElementById("toast");

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initSubmodes();
  initDropzone();
  initTextInput();
  initAdvancedOptions();
  initUpload();
  initRetrieve();
  initAdminPortal();
  initEditModal();
  checkUrlParams();

  // If token is already present, verify silently
  if (adminToken) {
    verifyExistingAdminSession();
  }
});

// ==========================================
// NAVIGATION & MODES
// ==========================================
function initTabs() {
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");

      if (targetId === "retrieveTab") {
        setTimeout(() => retrieveCodeInput.focus(), 80);
      }
    });
  });
}

function initSubmodes() {
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

function initAdvancedOptions() {
  toggleAdvancedBtn.addEventListener("click", () => {
    const isHidden = advancedOptionsBody.classList.contains("hidden");
    if (isHidden) {
      advancedOptionsBody.classList.remove("hidden");
      advancedChevron.style.transform = "rotate(180deg)";
    } else {
      advancedOptionsBody.classList.add("hidden");
      advancedChevron.style.transform = "rotate(0deg)";
    }
  });
}

// ==========================================
// DROPZONE & FILE INPUT
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

  // Global window drop listener
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", (e) => {
    if (e.target.closest("#dropzone")) return;
    if (e.dataTransfer.files.length > 0) {
      e.preventDefault();
      modeFileBtn.click();
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });
}

function handleFileSelected(file) {
  const MAX_SIZE = 500 * 1024 * 1024; // 25 MB
  if (file.size > MAX_SIZE) {
    showToast("File exceeds 500MB limit.", true);
    return;
  }
  selectedFile = file;
  selectedFileName.textContent = file.name;
  selectedFileSize.textContent = formatBytes(file.size);
  selectedFileCard.classList.remove("hidden");
  dropzone.classList.add("hidden");
}

function initTextInput() {
  textPayloadInput.addEventListener("input", () => {
    const text = textPayloadInput.value;
    charCount.textContent = text.length + " characters";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    wordCount.textContent = words + " words";
  });

  pasteClipboardBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      textPayloadInput.value = text;
      textPayloadInput.dispatchEvent(new Event("input"));
      showToast("Pasted from clipboard");
    } catch (err) {
      showToast("Clipboard access denied. Paste manually.", true);
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
    const payload = {
      action: "upload",
      code: code,
      type: currentMode,
      expiry: expirySelect.value,
      pin: uploadPinInput.value.trim(),
      timestamp: Date.now()
    };

    if (currentMode === "file") {
      const base64Data = await fileToBase64(selectedFile);
      payload.fileName = selectedFile.name;
      payload.mimeType = selectedFile.type || "application/octet-stream";
      payload.size = selectedFile.size;
      payload.contentBase64 = base64Data.split(",")[1];
    } else {
      payload.fileName = textTitleInput.value.trim() || "snippet.txt";
      payload.mimeType = "text/plain";
      payload.textContent = textPayloadInput.value;
      payload.size = new Blob([payload.textContent]).size;
    }

    const response = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to upload to Google Drive");
    }

    displayUploadSuccess(code);
  } catch (err) {
    console.error("Upload error:", err);
    let msg = err.message;
    if (msg.includes("NetworkError") || msg.includes("Failed to fetch")) {
      msg = "Permission Error: Ensure Google Apps Script deployment is set to 'Who has access: Anyone'.";
    }
    showToast("Upload failed: " + msg, true);
  } finally {
    setUploadLoading(false);
  }
}

function displayUploadSuccess(code) {
  generatedCodeDisplay.textContent = code;

  const url = new URL(window.location.href);
  url.searchParams.set("code", code);
  shareUrlInput.value = url.toString();

  if (qrImage) {
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(url.toString())}`;
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
  charCount.textContent = "0 characters";
  wordCount.textContent = "0 words";
  customCodeInput.value = "";
  uploadPinInput.value = "";
  expirySelect.value = "never";

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

  retrieveCodeInput.addEventListener("input", () => {
    retrieveCodeInput.value = retrieveCodeInput.value.toUpperCase();
    if (retrieveCodeInput.value.length === 6) {
      fetchItemByCode(retrieveCodeInput.value);
    }
  });

  downloadFileBtn.addEventListener("click", () => {
    if (!currentRetrievedItem) return;
    downloadBlob(currentRetrievedItem.blob, currentRetrievedItem.fileName);
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

  // Text vs Markdown switchers
  viewRawBtn.addEventListener("click", () => {
    viewRawBtn.classList.add("active");
    viewRenderedBtn.classList.remove("active");
    retrievedTextDisplay.classList.remove("hidden");
    markdownDisplay.classList.add("hidden");
  });

  viewRenderedBtn.addEventListener("click", () => {
    viewRenderedBtn.classList.add("active");
    viewRawBtn.classList.remove("active");
    retrievedTextDisplay.classList.add("hidden");
    markdownDisplay.classList.remove("hidden");
    renderMarkdownContent(currentRetrievedItem ? currentRetrievedItem.content : "");
  });
}

async function fetchItemByCode(code) {
  hideRetrieveResults();
  setRetrieveLoading(true);

  const pin = retrievePinInput.value.trim();

  try {
    const payload = {
      action: "retrieve",
      code: code,
      pin: pin,
      adminToken: adminToken // allows admin to download even if revoked
    };

    const response = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });

    const result = await response.json();

    if (!result.success) {
      if (result.pinRequired) {
        retrievePinBox.classList.remove("hidden");
        retrievePinInput.focus();
        throw new Error(result.error || "PIN required");
      }
      if (result.isRevoked) {
        revokedAlert.classList.remove("hidden");
        return;
      }
      throw new Error(result.error || "No item found with this code");
    }

    retrievePinBox.classList.add("hidden");
    renderRetrievedItem(result);
  } catch (err) {
    showRetrieveError(err.message);
  } finally {
    setRetrieveLoading(false);
  }
}

function renderRetrievedItem(data) {
  currentRetrievedItem = data;

  retrievedTypeBadge.textContent = (data.type || "FILE").toUpperCase();
  retrievedTitle.textContent = data.fileName || "Untitled";

  if (data.burnAfterReading) {
    burnBadge.classList.remove("hidden");
  } else {
    burnBadge.classList.add("hidden");
  }

  const sizeStr = data.size ? formatBytes(data.size) : "";
  const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "Just now";
  retrievedMeta.textContent = [sizeStr, dateStr].filter(Boolean).join(" • ");

  if (data.type === "text") {
    fileResultBlock.classList.add("hidden");
    textResultBlock.classList.remove("hidden");
    retrievedTextDisplay.textContent = data.content || "";
    viewRawBtn.click();
  } else {
    textResultBlock.classList.add("hidden");
    fileResultBlock.classList.remove("hidden");

    if (data.base64 || data.contentBase64) {
      const rawBase64 = data.base64 || data.contentBase64;
      const mime = data.mimeType || "application/octet-stream";
      currentRetrievedItem.blob = base64ToBlob(rawBase64, mime);

      setupMediaPreviews(currentRetrievedItem.blob, mime);
    }
  }

  retrieveResultCard.classList.remove("hidden");
}

function setupMediaPreviews(blob, mimeType) {
  mediaPreviewSection.classList.add("hidden");
  imagePreviewContainer.classList.add("hidden");
  audioPreviewContainer.classList.add("hidden");
  videoPreviewContainer.classList.add("hidden");

  const objectUrl = URL.createObjectURL(blob);

  if (mimeType.startsWith("image/")) {
    imagePreview.src = objectUrl;
    imagePreviewContainer.classList.remove("hidden");
    mediaPreviewSection.classList.remove("hidden");
  } else if (mimeType.startsWith("audio/")) {
    audioPreview.src = objectUrl;
    audioPreviewContainer.classList.remove("hidden");
    mediaPreviewSection.classList.remove("hidden");
  } else if (mimeType.startsWith("video/")) {
    videoPreview.src = objectUrl;
    videoPreviewContainer.classList.remove("hidden");
    mediaPreviewSection.classList.remove("hidden");
  }
}

function renderMarkdownContent(text) {
  const escaped = escapeHtml(text);
  const formatted = escaped
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n$/gim, '<br />')
    .replace(/\n/gim, '<br />');

  markdownDisplay.innerHTML = formatted;
}

function hideRetrieveResults() {
  retrieveResultCard.classList.add("hidden");
  retrieveErrorAlert.classList.add("hidden");
  revokedAlert.classList.add("hidden");
  mediaPreviewSection.classList.add("hidden");
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

function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (code) {
    const retrieveTabBtn = document.querySelector('[data-tab="retrieveTab"]');
    if (retrieveTabBtn) retrieveTabBtn.click();
    retrieveCodeInput.value = code.trim().toUpperCase();
    fetchItemByCode(retrieveCodeInput.value);
  }
}

// ==========================================
// ADMIN PORTAL & GITHUB AUTH (@theserphh)
// ==========================================
function initAdminPortal() {
  openAdminBtn.addEventListener("click", () => {
    adminModal.classList.remove("hidden");
    if (adminToken && adminUserData) {
      showAdminDashboard();
    } else {
      showAdminLogin();
    }
  });

  closeAdminBtn.addEventListener("click", () => {
    adminModal.classList.add("hidden");
  });

  adminModal.addEventListener("click", (e) => {
    if (e.target === adminModal) adminModal.classList.add("hidden");
  });

  adminLoginBtn.addEventListener("click", handleAdminLogin);

  adminLogoutBtn.addEventListener("click", () => {
    adminToken = "";
    adminUserData = null;
    sessionStorage.removeItem(STORAGE_KEY_ADMIN_TOKEN);
    openAdminBtn.classList.remove("authenticated");
    adminBtnLabel.textContent = "Admin Login";
    adminBadgeDot.classList.add("hidden");
    showAdminLogin();
    showToast("Logged out of Admin Portal");
  });

  adminRefreshBtn.addEventListener("click", loadAdminFiles);

  adminSearchInput.addEventListener("input", () => {
    filterAdminFilesTable(adminSearchInput.value.trim().toLowerCase());
  });
}

async function verifyExistingAdminSession() {
  try {
    const ghRes = await fetch("https://api.github.com/user", {
      headers: { "Authorization": `token ${adminToken}` }
    });
    if (ghRes.ok) {
      const user = await ghRes.json();
      if (user.login.toLowerCase() === ADMIN_GITHUB_USER.toLowerCase()) {
        adminUserData = user;
        onAdminAuthenticated(user);
      } else {
        sessionStorage.removeItem(STORAGE_KEY_ADMIN_TOKEN);
        adminToken = "";
      }
    }
  } catch (e) {
    console.warn("Silent admin auth check error:", e);
  }
}

async function handleAdminLogin() {
  const token = githubTokenInput.value.trim();
  if (!token) {
    showAdminAuthError("Please enter your GitHub Personal Access Token.");
    return;
  }

  setAdminLoginLoading(true);
  adminAuthError.classList.add("hidden");

  try {
    // 1. Verify with GitHub API directly in the client
    const ghRes = await fetch("https://api.github.com/user", {
      headers: { "Authorization": `token ${token}` }
    });

    if (!ghRes.ok) {
      throw new Error("Invalid GitHub token or token lacks 'read:user' permission.");
    }

    const ghUser = await ghRes.json();
    if (ghUser.login.toLowerCase() !== ADMIN_GITHUB_USER.toLowerCase()) {
      throw new Error(`Access denied. Authenticated as @${ghUser.login}, but admin is restricted to @${ADMIN_GITHUB_USER}`);
    }

    // 2. Verify with Google Apps Script backend
    const backendRes = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "admin_verify", adminToken: token }),
      redirect: "follow"
    });

    const backendData = await backendRes.json();
    if (!backendData.success) {
      throw new Error(backendData.error || "Backend verification failed.");
    }

    // Success
    adminToken = token;
    adminUserData = ghUser;
    sessionStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, token);

    onAdminAuthenticated(ghUser);
    showAdminDashboard();
    showToast(`Welcome, @${ADMIN_GITHUB_USER}!`);
  } catch (err) {
    showAdminAuthError(err.message);
  } finally {
    setAdminLoginLoading(false);
  }
}

function onAdminAuthenticated(user) {
  openAdminBtn.classList.add("authenticated");
  adminBtnLabel.textContent = `@${user.login}`;
  adminBadgeDot.classList.remove("hidden");

  adminAvatar.src = user.avatar_url;
  adminName.textContent = user.name || user.login;
  adminUsername.textContent = `@${user.login}`;
}

function showAdminLogin() {
  adminLoginView.classList.remove("hidden");
  adminDashboardView.classList.add("hidden");
  githubTokenInput.value = "";
  adminAuthError.classList.add("hidden");
}

function showAdminDashboard() {
  adminLoginView.classList.add("hidden");
  adminDashboardView.classList.remove("hidden");
  loadAdminFiles();
}

function showAdminAuthError(msg) {
  adminAuthError.textContent = msg;
  adminAuthError.classList.remove("hidden");
}

function setAdminLoginLoading(isLoading) {
  adminLoginBtn.disabled = isLoading;
  const textEl = adminLoginBtn.querySelector(".btn-text-content");
  const spinnerEl = adminLoginBtn.querySelector(".btn-spinner");

  if (isLoading) {
    textEl.classList.add("hidden");
    spinnerEl.classList.remove("hidden");
  } else {
    textEl.classList.remove("hidden");
    spinnerEl.classList.add("hidden");
  }
}

async function loadAdminFiles() {
  adminFilesTableBody.innerHTML = `<tr><td colspan="5" class="table-loading">Loading Drive files...</td></tr>`;

  try {
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "admin_list_files", adminToken: adminToken }),
      redirect: "follow"
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to load files");
    }

    allAdminFiles = data.files || [];
    updateAdminStats(allAdminFiles);
    renderAdminFilesTable(allAdminFiles);
  } catch (err) {
    adminFilesTableBody.innerHTML = `<tr><td colspan="5" class="table-loading" style="color:var(--danger)">Error: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function updateAdminStats(files) {
  const safeFiles = Array.isArray(files) ? files : [];
  statTotal.textContent = safeFiles.length;
  const activeCount = safeFiles.filter(f => f && !f.revoked).length;
  const revokedCount = safeFiles.filter(f => f && f.revoked).length;
  statActive.textContent = activeCount;
  statRevoked.textContent = revokedCount;
}

function renderAdminFilesTable(files) {
  const safeFiles = Array.isArray(files) ? files : [];
  if (safeFiles.length === 0) {
    adminFilesTableBody.innerHTML = `<tr><td colspan="5" class="table-loading">No files uploaded yet.</td></tr>`;
    return;
  }

  let html = "";
  safeFiles.forEach(f => {
    if (!f) return;
    const code = f.code || "UNKNOWN";
    const fileName = f.fileName || "Untitled";
    const fileType = (f.type || "file").toUpperCase();
    const statusClass = f.revoked ? "revoked" : "active";
    const statusLabel = f.revoked ? "REVOKED" : "ACTIVE";
    const revokeBtnLabel = f.revoked ? "Restore" : "Revoke";
    const dateFormatted = f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "-";

    html += `
      <tr data-file-id="${f.id}">
        <td><span class="table-code">${escapeHtml(code)}</span></td>
        <td>
          <div class="table-file-cell">
            <span class="table-file-name" title="${escapeHtml(fileName)}">${escapeHtml(fileName)}</span>
            <span class="table-file-meta">${escapeHtml(fileType)} • ${dateFormatted}</span>
          </div>
        </td>
        <td>${formatBytes(f.size)}</td>
        <td><span class="status-tag ${statusClass}">${statusLabel}</span></td>
        <td>
          <div class="action-btns-cell">
            <button class="btn-secondary btn-sm" onclick="adminDownloadFile('${escapeHtml(code)}')">Download</button>
            <button class="btn-secondary btn-sm" onclick="adminToggleRevoke('${f.id}', ${!f.revoked})">${revokeBtnLabel}</button>
            <button class="btn-secondary btn-sm" onclick="openEditModal('${f.id}', '${escapeHtml(code)}', '${escapeHtml(fileName)}', '${escapeHtml(f.type || "file")}')">Edit</button>
            <button class="btn-danger-outline" onclick="adminDeleteFile('${f.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });

  adminFilesTableBody.innerHTML = html;
}

function filterAdminFilesTable(query) {
  if (!query) {
    renderAdminFilesTable(allAdminFiles);
    return;
  }
  const filtered = allAdminFiles.filter(f => {
    if (!f) return false;
    const code = (f.code || "").toLowerCase();
    const name = (f.fileName || "").toLowerCase();
    return code.includes(query) || name.includes(query);
  });
  renderAdminFilesTable(filtered);
}

// Admin Action Callers
window.adminDownloadFile = async function (code) {
  showToast(`Fetching ${code} as Admin...`);
  try {
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "retrieve", code: code, adminToken: adminToken }),
      redirect: "follow"
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    if (result.type === "text") {
      const blob = new Blob([result.content], { type: "text/plain;charset=utf-8" });
      downloadBlob(blob, result.fileName || "snippet.txt");
    } else {
      const blob = base64ToBlob(result.base64, result.mimeType || "application/octet-stream");
      downloadBlob(blob, result.fileName);
    }
    showToast("Download started!");
  } catch (e) {
    showToast("Download failed: " + e.message, true);
  }
};

window.adminToggleRevoke = async function (fileId, shouldRevoke) {
  showToast(shouldRevoke ? "Revoking file..." : "Restoring file...");
  try {
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "admin_revoke_file",
        adminToken: adminToken,
        fileId: fileId,
        revoke: shouldRevoke
      }),
      redirect: "follow"
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    showToast(shouldRevoke ? "File revoked! Public access blocked." : "File restored to active!");
    loadAdminFiles();
  } catch (e) {
    showToast("Failed to update status: " + e.message, true);
  }
};

window.adminDeleteFile = async function (fileId) {
  if (!confirm("Are you sure you want to permanently trash this file from Google Drive?")) return;
  showToast("Deleting file...");
  try {
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "admin_delete_file",
        adminToken: adminToken,
        fileId: fileId
      }),
      redirect: "follow"
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    showToast("File deleted from Drive.");
    loadAdminFiles();
  } catch (e) {
    showToast("Failed to delete: " + e.message, true);
  }
};

// ==========================================
// EDIT MODAL LOGIC
// ==========================================
function initEditModal() {
  closeEditModalBtn.addEventListener("click", () => editFileModal.classList.add("hidden"));
  cancelEditBtn.addEventListener("click", () => editFileModal.classList.add("hidden"));

  saveEditBtn.addEventListener("click", async () => {
    const id = editFileId.value;
    const newCode = editCodeInput.value.trim().toUpperCase();
    const newFileName = editFileNameInput.value.trim();
    const newText = editTextContentInput.value;

    if (!newCode || !newFileName) {
      showToast("Code and Filename are required.", true);
      return;
    }

    saveEditBtn.disabled = true;
    saveEditBtn.textContent = "Saving...";

    try {
      const response = await fetch(GAS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "admin_update_file",
          adminToken: adminToken,
          fileId: id,
          newCode: newCode,
          newFileName: newFileName,
          newTextContent: newText
        }),
        redirect: "follow"
      });

      const res = await response.json();
      if (!res.success) throw new Error(res.error);

      showToast("File updated successfully!");
      editFileModal.classList.add("hidden");
      loadAdminFiles();
    } catch (e) {
      showToast("Update failed: " + e.message, true);
    } finally {
      saveEditBtn.disabled = false;
      saveEditBtn.textContent = "Save Changes";
    }
  });
}

window.openEditModal = function (fileId, code, fileName, type) {
  editFileId.value = fileId;
  editCodeInput.value = code;
  editFileNameInput.value = fileName;

  if (type === "text") {
    editTextContentGroup.classList.remove("hidden");
    editTextContentInput.value = "";
  } else {
    editTextContentGroup.classList.add("hidden");
  }

  editFileModal.classList.remove("hidden");
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function generateRandomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
