document.getElementById('runBtn').addEventListener('click', async () => {
  const outputDiv = document.getElementById('output');
  outputDiv.textContent = 'Running automation...';
  try {
    const res = await fetch('/run-automation', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      outputDiv.textContent = data.output || 'Done.';
      if (data.stderr) {
        outputDiv.textContent += '\n[stderr]\n' + data.stderr;
      }
    } else {
      outputDiv.textContent = 'Error: ' + (data.error || 'Unknown error') + '\n' + (data.stderr || '');
    }
  } catch (err) {
    outputDiv.textContent = 'Request failed: ' + err;
  }
});