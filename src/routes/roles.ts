import express, { Router, Request, Response } from 'express';
import { validateAnswers } from '../services/validator';
import { mapQuestionToMetaprograms } from '../services/metaprogramMapper';
import { calculateRolePercentages } from '../services/roleCalculator';
import { calculateCompetencies } from '../services/competencyCalculator';
import { logger } from '../config/logger';

const router = Router();

interface RoleCalculateRequest {
  answers: number[];
  userId: string;
  testDate: string;
}

router.post('/calculate', async (req: Request, res: Response) => {
  try {
    logger.info('POST /calculate received');

    const { answers, userId, testDate } = req.body as RoleCalculateRequest;

    const validation = validateAnswers(answers);
    if (!validation.valid) {
      return res.status(400).json({ status: 'error', message: validation.errors });
    }

    const metaprograms = mapQuestionToMetaprograms(answers);
    const roles = calculateRolePercentages(metaprograms);
    const competencies = calculateCompetencies(metaprograms);

    const topCompetencies = competencies.slice(0, 10);
    const bottomCompetencies = competencies.slice(-10);

    const response = {
      status: 'success',
      profile_id: `prof_${Date.now()}`,
      authentic_roles: roles,
      top_10_competencies: topCompetencies,
      bottom_10_competencies: bottomCompetencies,
      calculation_log: {
        phase_1_validation: { status: 'passed' },
        phase_2_mapping: { status: 'passed' },
        phase_3_roles: { status: 'passed' },
        phase_4_competencies: { status: 'passed' },
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
