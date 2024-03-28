document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('date-range-form');
  const downloadCsvBtn = document.getElementById('download-csv');
  let chart;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    fetchTimeEntries(startDate, endDate);
  });

  downloadCsvBtn.addEventListener('click', function() {
    downloadCSV();
  });

  async function fetchTimeEntries(startDate, endDate) {
    try {
      const response = await fetch(`/api/time-entries?start=${startDate}&end=${endDate}`);
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      const entries = await response.json();
      renderChart(entries);
      updateEntriesList(entries);
      console.log('Time entries fetched successfully for the selected date range.');
    } catch (error) {
      console.error('Error fetching time entries:', error.message, error.stack);
    }
  }

  function renderChart(entries) {
    const ctx = document.getElementById('time-chart').getContext('2d');
    const labels = entries.map(entry => new Date(entry.start_time).toLocaleDateString());
    const data = entries.map(entry => ((new Date(entry.stop_time) - new Date(entry.start_time)) / 3600000).toFixed(2)); // Convert milliseconds to hours

    if (chart) {
      chart.destroy(); // If a chart instance exists, destroy it before creating a new one
    }

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Hours Worked',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    console.log('Bar chart rendered successfully.');
  }

  async function downloadCSV() {
    try {
      const response = await fetch('/api/time-entries/export-csv', {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }
      const csvData = await response.text();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "time_entries.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('CSV file downloaded successfully.');
    } catch (error) {
      console.error('Error downloading CSV:', error.message, error.stack);
    }
  }

  function updateEntriesList(entries) {
    const list = document.getElementById('time-entries-list');
    list.innerHTML = ''; // Clear existing entries
    entries.forEach(entry => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      const startTime = new Date(entry.start_time).toLocaleString();
      const stopTime = new Date(entry.stop_time).toLocaleString();
      li.textContent = `${entry.description} - From: ${startTime} To: ${stopTime}`;
      list.appendChild(li);
    });
    console.log('Time entries list updated successfully.');
  }
});