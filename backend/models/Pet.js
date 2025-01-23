const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  species: {
    type: String,
    required: true
  },
  breed: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  medicalHistory: [{
    date: {
      type: Date,
      required: true
    },
    diagnosis: {
      type: String,
      required: true
    },
    treatment: {
      type: String,
      required: true
    },
    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: String
  }],
  vaccinations: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    nextDueDate: {
      type: Date,
      required: true
    },
    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }]
}, {
  timestamps: true
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet; 