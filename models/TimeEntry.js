const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  description: { type: String, required: true },
  start_time: { type: Date, required: true },
  stop_time: { type: Date, required: true }
});

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);

module.exports = TimeEntry;