// models/Counter.js
// Generic atomic counter — used to generate sequential readable IDs.
// findOneAndUpdate with $inc is atomic in MongoDB, so two simultaneous
// orders can never get the same number even under high load.
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id:  { type: String, required: true },  // e.g. 'order', 'customRequest'
  seq:  { type: Number, default: 0 },
});

// Returns the NEXT sequence number for the given counter name.
counterSchema.statics.next = async function (name) {
  const doc = await this.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }   // create if doesn't exist yet
  );
  return doc.seq;
};

module.exports = mongoose.model('Counter', counterSchema);