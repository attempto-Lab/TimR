document.addEventListener('DOMContentLoaded', function() {
  // Attempt to fetch a resource that requires authentication
  fetch('/api/time-entries')
    .then(response => {
      // If the response status code is 401, redirect to the login page
      if (response.status === 401) {
        window.location.href = '/auth/login';
      }
    })
    .catch(error => console.error('Error checking authentication status:', error));

  const startStopBtn = document.getElementById('start-stop-btn');
  const elapsedTimeDiv = document.getElementById('elapsed-time');
  const taskDescriptionInput = document.getElementById('task-description');
  
  let timer = null;
  let startTime = null;
  let isTimerRunning = false;

  startStopBtn.addEventListener('click', function() {
    if (!isTimerRunning) {
      console.log('Timer started');
      startTimer();
    } else {
      console.log('Timer stopped');
      stopTimer().catch(error => console.error('Error stopping timer:', error.message, error.stack));
    }
  });

  function startTimer() {
    startTime = Date.now();
    startStopBtn.textContent = 'Stop';
    isTimerRunning = true;

    timer = setInterval(function() {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      elapsedTimeDiv.textContent = formatElapsedTime(elapsedTime);
    }, 1000);
  }

  async function stopTimer() {
    clearInterval(timer);
    timer = null;
    startStopBtn.textContent = 'Start';
    isTimerRunning = false;
    const taskDescription = taskDescriptionInput.value;
    taskDescriptionInput.value = '';
    elapsedTimeDiv.textContent = '0h 0m 0s';

    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: taskDescription,
          start_time: new Date(startTime).toISOString(),
          stop_time: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save time entry');
      }
      console.log('Time entry saved successfully');
      fetchTimeEntries(); // Fetch and display the updated list of time entries
    } catch (error) {
      console.error('Error saving time entry:', error.message, error.stack);
    }
  }

  function formatElapsedTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / 60000) % 60;
    const hours = Math.floor(milliseconds / 3600000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  async function fetchTimeEntries() {
    // Check if the element exists to prevent interference with the reports page
    if (!document.getElementById('time-entries-list')) return;

    try {
      const response = await fetch('/api/time-entries', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      const entries = await response.json();
      const list = document.getElementById('time-entries-list');
      list.innerHTML = ''; // Clear existing entries
      entries.forEach(entry => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        const startTime = new Date(entry.start_time);
        const stopTime = new Date(entry.stop_time);
        const duration = ((stopTime - startTime) / 1000 / 60).toFixed(2); // Convert to minutes
        li.innerHTML = `${entry.description} - ${duration} minutes
                        <span>
                          <button class="btn btn-sm btn-info edit-btn" data-id="${entry._id}">Edit</button>
                          <button class="btn btn-sm btn-danger delete-btn" data-id="${entry._id}">Delete</button>
                        </span>`;
        list.appendChild(li);
      });
      console.log('Time entries fetched and displayed successfully');
    } catch (error) {
      console.error('Error fetching time entries:', error.message, error.stack);
    }
  }

  document.getElementById('time-entries-list').addEventListener('click', function(event) {
    if (event.target.classList.contains('edit-btn')) {
      // Handle edit action
      const entryId = event.target.getAttribute('data-id');
      editTimeEntry(entryId);
    } else if (event.target.classList.contains('delete-btn')) {
      // Handle delete action
      const entryId = event.target.getAttribute('data-id');
      deleteTimeEntry(entryId);
    }
  });

  async function deleteTimeEntry(entryId) {
    try {
      const response = await fetch(`/api/time-entries/${entryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete time entry');
      }
      console.log('Time entry deleted successfully');
      fetchTimeEntries(); // Refresh the list of time entries
    } catch (error) {
      console.error('Error deleting time entry:', error.message, error.stack);
    }
  }

  async function editTimeEntry(entryId) {
    const entry = document.querySelector(`button[data-id="${entryId}"]`).parentNode.parentNode;
    const description = entry.childNodes[0].nodeValue.trim().split(" - ")[0];
    const newDescription = prompt("Edit description:", description);
    if (newDescription !== null && newDescription !== description) {
      try {
        const response = await fetch(`/api/time-entries/${entryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: newDescription,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to update time entry');
        }
        console.log('Time entry updated successfully');
        fetchTimeEntries(); // Refresh the list of time entries
      } catch (error) {
        console.error('Error updating time entry:', error.message, error.stack);
      }
    }
  }

  // Only fetch time entries if on the home page
  if (document.getElementById('time-entries-list')) {
    fetchTimeEntries(); // Fetch time entries on page load
  }

  // Logout function
  function logoutUser() {
    fetch('/auth/logout', {
      method: 'GET',
    }).then(response => {
      if (response.ok) {
        // Redirect to login page after successful logout
        window.location.href = '/auth/login';
      }
    }).catch(error => console.error('Error during logout:', error));
  }

  // Attach event listener to logout button if it exists
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.textContent.trim() === 'Logout') {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        logoutUser();
      });
    }
  });
});