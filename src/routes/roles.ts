import express, { Router, Request, Response } from 'express';
import { validateAnswers } from '../services/validator';
import { mapQuestionToMetaprograms } from '../services/metaprogramMapper';
import { calculateRolePercentages } from '../services/roleCalculator';
import { calculateCompetencies } from '../services/competencyCalculator';
import { logger } from '../config/logger';

const router = Router();

interface RoleCalculateRequest {
  answers: number[];
  userId?: string;
  testDate?: string;
}

/**
 * Генерация рекомендаций на основе ролей и компетенций
 */
function generateRecommendations(
  roles: any[],
  topCompetencies: any[],
  bottomCompetencies: any[]
): string[] {
  const recommendations: string[] = [];
  
  // Рекомендации на основе топ-3 ролей
  const top3Roles = roles.slice(0, 3);
  top3Roles.forEach((role) => {
    if (role.percentage >= 50) {
      const roleName = role.name || role.role_id || 'вашей роли';
      recommendations.push(
        `Развивайте свои сильные стороны в роли "${roleName}" (${role.percentage}%) - это ваша ключевая компетенция`
      );
    }
  });
  
  // Рекомендации на основе сильных компетенций
  if (topCompetencies.length > 0) {
    const topCompetency = topCompetencies[0];
    const compName = topCompetency.name || 'компетенция';
    const compPercent = topCompetency.percentage || 0;
    recommendations.push(
      `Ваша сильная сторона "${compName}" (${compPercent}%) - используйте это для достижения целей`
    );
  }
  
  // Рекомендации на основе слабых компетенций
  if (bottomCompetencies.length > 0) {
    const weakCompetency = bottomCompetencies[0];
    const compName = weakCompetency.name || 'компетенция';
    const compPercent = weakCompetency.percentage || 0;
    if (compPercent < 40) {
      recommendations.push(
        `Обратите внимание на развитие "${compName}" (${compPercent}%) - это область для роста`
      );
    }
  }
  
  // Общие рекомендации
  if (roles.length > 0 && roles[0].percentage >= 60) {
    const topRoleName = roles[0].name || roles[0].role_id || 'вашей роли';
    recommendations.push(
      `Высокая выраженность роли "${topRoleName}" - фокусируйтесь на задачах, которые соответствуют этой роли`
    );
  }
  
  // Если рекомендаций мало, добавляем общие
  if (recommendations.length < 3) {
    recommendations.push(
      'Используйте свои сильные стороны для достижения максимальных результатов'
    );
    recommendations.push(
      'Работайте над развитием слабых компетенций для баланса профиля'
    );
  }
  
  return recommendations;
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
    const bottomCompetencies = competencies.slice(-10).reverse();

    // Генерация рекомендаций
    const recommendations = generateRecommendations(roles, topCompetencies, bottomCompetencies);

    const response = {
      status: 'success',
      authentic_roles: roles,
      top_10_competencies: topCompetencies,
      bottom_10_competencies: bottomCompetencies,
      recommendations: recommendations,
    };

    logger.info('Calculation completed', {
      rolesCount: roles.length,
      recommendationsCount: recommendations.length,
    });

    res.json(response);
  } catch (error) {
    logger.error('Error', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

export default router;
