document.addEventListener('DOMContentLoaded', function () {
  const selects = document.querySelectorAll('select');
  const sidenavs = document.querySelectorAll('.sidenav');
  const textareas = document.querySelectorAll('textarea[data-length]');

  // Initialize Materialize UI widgets used by the EJS templates.
  M.FormSelect.init(selects);
  M.Sidenav.init(sidenavs);
  M.CharacterCounter.init(textareas);

  const promptTextarea = document.getElementById('promptText');
  const promptCount = document.getElementById('prompt-count');

  // Keep a visible prompt character count next to Materialize validation.
  function updatePromptCount() {
    if (!promptTextarea || !promptCount) return;
    promptCount.textContent = `${promptTextarea.value.length} / 500 characters`;
  }

  if (promptTextarea) {
    updatePromptCount();
    promptTextarea.addEventListener('input', updatePromptCount);
    M.textareaAutoResize(promptTextarea);
  }

  const generateForm = document.getElementById('generate-form');
  const loadingSpinner = document.getElementById('loading-spinner');
  const generateButton = document.getElementById('generate-button');

  // Show a loading spinner while the server calls DALL-E 3.
  if (generateForm) {
    generateForm.addEventListener('submit', function () {
      if (loadingSpinner) loadingSpinner.classList.remove('hide');
      if (generateButton) {
        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';
      }
    });
  }

  const deleteForms = document.querySelectorAll('.delete-thumbnail-form');

  // Confirm deletes before submitting the method-override form.
  deleteForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const confirmed = window.confirm('Delete this thumbnail from your library?');
      if (!confirmed) {
        event.preventDefault();
      }
    });
  });
});
