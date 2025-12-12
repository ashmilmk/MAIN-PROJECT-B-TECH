const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true
  },
  exerciseType: {
    type: String,
    required: [true, 'Exercise type is required'],
    enum: [
      'reading-comprehension',
      'word-recognition',
      'spelling-exercise',
      'math-problems',
      'writing-exercise',
      'memory-game',
      'attention-task',
      'phonological-awareness'
    ]
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  timeSpent: {
    type: Number, // in seconds
    required: [true, 'Time spent is required'],
    min: [0, 'Time spent cannot be negative']
  },
  attempts: {
    type: Number,
    required: [true, 'Number of attempts is required'],
    min: [1, 'At least one attempt is required']
  },
  correctAnswers: {
    type: Number,
    required: [true, 'Number of correct answers is required'],
    min: [0, 'Correct answers cannot be negative']
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions is required'],
    min: [1, 'At least one question is required']
  },
  // Detailed performance metrics
  performance: {
    accuracy: {
      type: Number,
      min: 0,
      max: 100
    },
    speed: {
      type: Number, // questions per minute
      min: 0
    },
    consistency: {
      type: Number, // how consistent the performance was
      min: 0,
      max: 100
    }
  },
  // Learning analytics
  analytics: {
    strengths: [{
      type: String,
      enum: [
        'visual-processing',
        'auditory-processing',
        'working-memory',
        'attention',
        'phonological-awareness',
        'spatial-reasoning',
        'pattern-recognition'
      ]
    }],
    areasForImprovement: [{
      type: String,
      enum: [
        'reading-speed',
        'word-recognition',
        'spelling',
        'mathematical-concepts',
        'writing-fluency',
        'attention-sustained',
        'working-memory'
      ]
    }],
    recommendedNextSteps: [String]
  },
  // Session metadata
  sessionData: {
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    deviceInfo: {
      type: String,
      trim: true
    },
    browserInfo: {
      type: String,
      trim: true
    }
  },
  // Feedback and notes
  feedback: {
    userFeedback: {
      type: String,
      trim: true,
      maxlength: [500, 'User feedback cannot exceed 500 characters']
    },
    teacherNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Teacher notes cannot exceed 1000 characters']
    },
    difficultyRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate accuracy before saving
progressSchema.pre('save', function(next) {
  if (this.totalQuestions > 0) {
    this.performance.accuracy = (this.correctAnswers / this.totalQuestions) * 100;
  }
  if (this.timeSpent > 0) {
    this.performance.speed = (this.totalQuestions / (this.timeSpent / 60));
  }
  next();
});

// Index for better performance
progressSchema.index({ userId: 1, createdAt: -1 });
progressSchema.index({ exerciseType: 1 });
progressSchema.index({ difficulty: 1 });
progressSchema.index({ score: -1 });

// Virtual for session duration
progressSchema.virtual('sessionDuration').get(function() {
  return this.sessionData.endTime - this.sessionData.startTime;
});

// Static method to get user progress summary
progressSchema.statics.getUserProgressSummary = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const summary = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        averageScore: { $avg: '$score' },
        totalTimeSpent: { $sum: '$timeSpent' },
        totalExercises: { $sum: 1 },
        averageAccuracy: { $avg: '$performance.accuracy' },
        exerciseTypes: { $addToSet: '$exerciseType' }
      }
    }
  ]);
  
  return summary[0] || {
    totalSessions: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    totalExercises: 0,
    averageAccuracy: 0,
    exerciseTypes: []
  };
};

module.exports = mongoose.model('Progress', progressSchema);





