const express = require('express');
const router = express.Router();
const TimeEntry = require('../../models/TimeEntry');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Papa = require('papaparse');

// POST method to create a new time entry
router.post('/', isAuthenticated, async (req, res) => {
  const { description, start_time, stop_time } = req.body;
  const user_id = req.session.userId;

  try {
    const newTimeEntry = await TimeEntry.create({
      user_id,
      description,
      start_time,
      stop_time
    });
    console.log('New time entry created:', newTimeEntry);
    res.status(201).json(newTimeEntry);
  } catch (error) {
    console.error('Error creating time entry:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

// GET method to fetch the 10 most recent time entries for the logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  const user_id = req.session.userId;

  try {
    const timeEntries = await TimeEntry.find({ user_id })
      .sort({ start_time: -1 })
      .limit(10);
    console.log('Fetched time entries:', timeEntries);
    res.status(200).json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

// GET method to export time entries as CSV
router.get('/export-csv', isAuthenticated, async (req, res) => {
  const user_id = req.session.userId;

  try {
    const timeEntries = await TimeEntry.find({ user_id }).sort({ start_time: -1 });
    const csv = Papa.unparse(timeEntries.map(entry => ({
      date: entry.start_time.toISOString().split('T')[0],
      start_time: entry.start_time.toISOString(),
      stop_time: entry.stop_time.toISOString(),
      description: entry.description
    })));

    res.header('Content-Type', 'text/csv');
    res.attachment('time_entries.csv');
    res.send(csv);
    console.log('Time entries exported to CSV successfully.');
  } catch (error) {
    console.error('Error exporting time entries to CSV:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

// PUT method to update an existing time entry
router.put('/:id', isAuthenticated, async (req, res) => {
  const { description, start_time, stop_time } = req.body;
  const { id } = req.params;
  const user_id = req.session.userId;

  try {
    const updatedTimeEntry = await TimeEntry.findOneAndUpdate({ _id: id, user_id }, { description, start_time, stop_time }, { new: true });
    if (!updatedTimeEntry) {
      return res.status(404).send('Time entry not found or not owned by user.');
    }
    console.log('Time entry updated successfully:', updatedTimeEntry);
    res.status(200).json(updatedTimeEntry);
  } catch (error) {
    console.error('Error updating time entry:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

// DELETE method to delete a time entry
router.delete('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const user_id = req.session.userId;

  try {
    const deletedTimeEntry = await TimeEntry.findOneAndDelete({ _id: id, user_id });
    if (!deletedTimeEntry) {
      return res.status(404).send('Time entry not found or not owned by user.');
    }
    console.log('Time entry deleted successfully');
    res.status(200).send('Time entry successfully deleted');
  } catch (error) {
    console.error('Error deleting time entry:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

module.exports = router;