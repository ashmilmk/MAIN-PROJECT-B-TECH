const express = require('express');
const { body, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/progress/session
// @desc    Save learning session progress
// @access  Private
router.post('/session', [
  auth,
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('exerciseType').isIn([
    'reading-comprehension',
    'word-recognition',
    'spelling-exercise',
    'math-problems',
    'writing-exercise',
    'memory-game',
    'attention-task',
    'phonological-awareness'
  ]).withMessage('Invalid exercise type'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level'),
  body('score').isNumeric().isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('timeSpent').isNumeric().isInt({ min: 0 }).withMessage('Time spent must be a positive integer'),
  body('attempts').isNumeric().isInt({ min: 1 }).withMessage('Attempts must be at least 1'),
  body('correctAnswers').isNumeric().isInt({ min: 0 }).withMessage('Correct answers cannot be negative'),
  body('totalQuestions').isNumeric().isInt({ min: 1 }).withMessage('Total questions must be at least 1'),
  body('sessionData.startTime').isISO8601().withMessage('Start time must be a valid date'),
  body('sessionData.endTime').isISO8601().withMessage('End time must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      sessionId,
      exerciseType,
      difficulty,
      score,
      timeSpent,
      attempts,
      correctAnswers,
      totalQuestions,
      sessionData,
      feedback,
      analytics
    } = req.body;

    // Create progress record
    const progressData = {
      userId: req.user.userId,
      sessionId,
      exerciseType,
      difficulty,
      score,
      timeSpent,
      attempts,
      correctAnswers,
      totalQuestions,
      sessionData: {
        startTime: new Date(sessionData.startTime),
        endTime: new Date(sessionData.endTime),
        deviceInfo: sessionData.deviceInfo || '',
        browserInfo: sessionData.browserInfo || ''
      },
      performance: {
        accuracy: (correctAnswers / totalQuestions) * 100,
        speed: totalQuestions / (timeSpent / 60),
        consistency: 0 // Will be calculated based on historical data
      },
      analytics: analytics || {},
      feedback: feedback || {}
    };

    const progress = new Progress(progressData);
    await progress.save();

    // Update user's overall progress
    const user = await User.findById(req.user.userId);
    if (user) {
      user.progress.totalSessions += 1;
      user.progress.completedExercises += 1;
      
      // Calculate new average score
      const totalSessions = user.progress.totalSessions;
      const currentAverage = user.progress.averageScore;
      user.progress.averageScore = ((currentAverage * (totalSessions - 1)) + score) / totalSessions;
      
      user.progress.lastActive = new Date();
      await user.save();
    }

    res.status(201).json({
      status: 'success',
      message: 'Progress saved successfully',
      progress
    });

  } catch (error) {
    console.error('Save progress error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Session already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/history
// @desc    Get user's learning history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, exerciseType, difficulty, days = 30 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      userId: req.user.userId
    };

    if (exerciseType) {
      query.exerciseType = exerciseType;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Date filter
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.createdAt = { $gte: startDate };
    }

    const progress = await Progress.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Progress.countDocuments(query);

    res.json({
      status: 'success',
      progress,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get progress history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/summary
// @desc    Get user's progress summary
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const summary = await Progress.getUserProgressSummary(req.user.userId, parseInt(days));

    // Get additional analytics
    const exerciseTypeStats = await Progress.aggregate([
      {
        $match: {
          userId: req.user.userId,
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$exerciseType',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' },
          totalTime: { $sum: '$timeSpent' }
        }
      }
    ]);

    const difficultyStats = await Progress.aggregate([
      {
        $match: {
          userId: req.user.userId,
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    res.json({
      status: 'success',
      summary: {
        ...summary,
        exerciseTypeStats,
        difficultyStats
      }
    });

  } catch (error) {
    console.error('Get progress summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/analytics
// @desc    Get detailed learning analytics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const { days = 30, exerciseType } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const matchQuery = {
      userId: req.user.userId,
      createdAt: { $gte: startDate }
    };

    if (exerciseType) {
      matchQuery.exerciseType = exerciseType;
    }

    // Performance trends over time
    const performanceTrends = await Progress.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            exerciseType: '$exerciseType'
          },
          averageScore: { $avg: '$score' },
          totalSessions: { $sum: 1 },
          totalTime: { $sum: '$timeSpent' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Strengths and weaknesses analysis
    const strengthsWeaknesses = await Progress.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$exerciseType',
          averageScore: { $avg: '$score' },
          averageAccuracy: { $avg: '$performance.accuracy' },
          averageSpeed: { $avg: '$performance.speed' },
          totalSessions: { $sum: 1 }
        }
      }
    ]);

    // Learning consistency
    const consistencyData = await Progress.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$exerciseType',
          scores: { $push: '$score' },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $project: {
          exerciseType: '$_id',
          averageScore: 1,
          consistency: {
            $divide: [
              { $stdDevPop: '$scores' },
              '$averageScore'
            ]
          }
        }
      }
    ]);

    res.json({
      status: 'success',
      analytics: {
        performanceTrends,
        strengthsWeaknesses,
        consistencyData,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/student/:studentId
// @desc    Get student progress (teachers only)
// @access  Private (Teachers only)
router.get('/student/:studentId', [auth, authorize('teacher', 'admin')], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 30 } = req.query;

    const summary = await Progress.getUserProgressSummary(studentId, parseInt(days));

    const recentSessions = await Progress.find({
      userId: studentId,
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    })
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      status: 'success',
      studentId,
      summary,
      recentSessions
    });

  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;





