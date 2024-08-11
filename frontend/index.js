const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const standing = document.querySelector(".standing");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURL = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const baseURL = "https://sweetsharebackend-abhisheks-projects-bda1edf4.vercel.app";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; //100mb

// This is useful when the file input element is hidden or styled to be invisible
browseBtn.addEventListener("click", () => {
  // Simulate a click on the file input element to open the file browser and allow the user to select a file
  fileInput.click();
});

// Add an event listener to the drop zone to handle file drops
dropZone.addEventListener("drop", (e) => {
  // Prevent the default browser behavior for dropping files
  e.preventDefault();
  // Get the files dropped on the drop zone,The dataTransfer object is part of the Drag and Drop API, allowing access to data being transferred during drag-and-drop operations.
  const files = e.dataTransfer.files;
  if (files.length === 1) {
    if (files[0].size < maxAllowedSize) {
      // Set the file input element's files property to the dropped file
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
    }
  } else if (files.length > 1) {
    showToast("You can't upload multiple files");
  }
  // Remove the "dragged" class from the drop zone to reset its appearance
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragged");
});

dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
});

// file input change and uploader
fileInput.addEventListener("change", (e) => {
  e.preventDefault();
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast("Max file size is 100MB");
    fileInput.value = ""; // reset the input
    return;
  }

  uploadFile();

});

// Add an event listener to the copy URL button
copyURLBtn.addEventListener("click", async () => {
  // Write the value of the fileURL input field to the clipboard
  await navigator.clipboard.writeText(fileURL.value);
  showToast("Copied to clipboard");
});
// Add an event listener to the select fileURL input field
fileURL.addEventListener("click", () => {
  // Select all text in the input field when it's clicked
  fileURL.select();
});

const uploadFile = () => {
  // fileInput.files returns a FileList object, which is an array-like object containing the selected files
  files = fileInput.files;
  // FormData is a built-in JavaScript object that allows us to create a set of key-value pairs
  const formData = new FormData();
  
  //selecting the first file from the FileList object (files[0]) and appending it to the FormData object with the key "myfile"
  formData.append("myfile", files[0]);
  
  // Show the uploader progress container
  progressContainer.style.display = "block";
  
  // XMLHttpRequest is a built-in JavaScript object that allows us to make HTTP requests
  const xhr = new XMLHttpRequest();
  
  // The onprogress event is triggered periodically during the upload process, allowing us to update the progress indicator

  xhr.upload.onprogress =  function (event) {
    let percent = Math.round((100 * event.loaded) / event.total);
    progressPercent.innerText = percent;
    // bgProgress and progressBar are  HTML elements that display the upload progress as a visual bar
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
  };
  // The onerror event is triggered if there is an error during the upload process
  xhr.upload.onerror = function () {
    showToast(`Error in upload: ${xhr.standing}`);
    fileInput.value = "";
  };
  // Listen for the response from the server
  // The onreadystatechange event is triggered whenever the readyState property of the XMLHttpRequest object changes
  xhr.onreadystatechange = function () {
    // Check if the upload is complete
    // readyState 4 indicates that the request has completed
    if (xhr.readyState == XMLHttpRequest.DONE) {
      // Call the success function with the response text
     
      onFileUploadSuccess(xhr.responseText);
    }
  };
  // Prepare the request to the server
  xhr.open("POST", uploadURL); // Set up a POST request to the specified upload URL
  // Send the request along with the file data
  xhr.send(formData); // This initiates the file upload to the server
};

const onFileUploadSuccess = (res) => {
  fileInput.value = "";

  standing.innerText = "Uploaded";

  // - The button was  disabled during the upload process to prevent multiple submissions.
  // - The button text is changed back to "Send" to indicate it is now active and ready for the user to send the link.
  emailForm[2].removeAttribute("disabled");
  emailForm[2].innerText = "Send";

  progressContainer.style.display = "none";

  // - The server's response is expected to include a URL for the uploaded file.
  // - The destructuring syntax `{ file: url }` extracts the `file` property from the response and assigns it to the `url` variable.
  const { file: url } = JSON.parse(res);

  // Make the sharing container visible, which allows the user to share the file URL
  sharingContainer.style.display = "block";

  // Set the value of the file URL input field to the received URL

  fileURL.value = url;

};

// Add an event listener to the form that triggers when the form is submitted
emailForm.addEventListener("submit", (e) => {
  // Prevent the default form submission, which would cause a page reload
  e.preventDefault();

  // Disable the submit button to prevent multiple submissions during the email sending process
  emailForm[2].setAttribute("disabled", "true");

  emailForm[2].innerText = "Sending";

  const url = fileURL.value;

  const formData = {
    // Extract the unique file identifier (UUID) from the URL
    uuid: url.split("/").splice(-1, 1)[0],

    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };
  // Use the Fetch API to send the form data to the server
  fetch(emailURL, {
    method: "POST",
    // Set the request headers to indicate that the request body is in JSON format
    headers: {
      "Content-Type": "application/json",
    },
    // Convert formData to a JSON string because the Fetch API requires
    // the body to be a string when using 'application/json'.
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Email Sent");
        sharingContainer.style.display = "none";
      }
    });
});

let toastTimer;
// the toast function
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};
