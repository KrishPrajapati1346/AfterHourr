import { parseFoodDescription } from '../services/geminiService.js';

// @desc    Parse food description with AI
// @route   POST /api/ai/parse-food
export const parseFood = async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a food description' });
    }
    const result = await parseFoodDescription(description);
    const usedFallback = result.usedFallback ?? true;
    delete result.usedFallback;
    res.json({ success: true, parsed: result, usedFallback });
  } catch (error) {
    next(error);
  }
};
