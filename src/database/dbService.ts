import { getDatabase } from './database';

export interface StudentRow {
  id: string;
  user_type: 'child' | 'student';
  full_name: string;
  username: string;
  email: string;
  parent_teacher_id?: string;
  points: number;
  average?: number;
  period_type: 'bimonthly' | 'semester';
  grading_system: 'percentage' | 'decimal' | 'letters';
}

export type PeriodType = 'monthly' | 'bimonthly' | 'quarterly' | 'semester' | 'annual';
export type GradingSystem = 'percentage' | 'decimal' | 'letters';

export interface PeriodRow {
  id: string;
  name: string;
  period_type: PeriodType;
  created_by: string;
}

export interface SubjectRow {
  id: string;
  name: string;
  period_id?: string;
  grading_system?: GradingSystem;
  created_by: string;
}

export interface RewardRuleRow {
  id: string;
  subject_id: string;
  min_grade: number;
  max_grade: number;
  rule_type: 'punishment' | 'minor_reward' | 'major_reward';
  reward_type: 'points' | 'console' | 'allowance';
  reward_value: string;
}

export interface PeriodAssignmentRow {
  id: string;
  period_id: string;
  student_id: string;
  subject_id: string;
}

export interface GradeLogRow {
  id: string;
  student_id: string;
  subject_id: string;
  period_id: string;
  raw_grade: string;
  numeric_grade: number;
  grading_system: string;
  created_at: string;
}

export interface RewardLogRow {
  id: string;
  student_id: string;
  period_id: string;
  subject_id: string;
  title: string;
  reward_type: string;
  reward_value: string;
  rule_type: string;
  created_at: string;
}

export interface PeriodWheelRow {
  id: string;
  period_id: string;
  wheel_key: 'low' | 'medium' | 'high';
  title: string;
  min_grade: number;
  max_grade: number;
  color?: string;
  icon?: string;
}

export interface PeriodWheelOptionRow {
  id: string;
  wheel_id: string;
  option_text: string;
  created_at: string;
}

export interface PeriodWheelWithOptions extends PeriodWheelRow {
  options: PeriodWheelOptionRow[];
}

export interface StudentPeriodSpinRow {
  id: string;
  student_id: string;
  period_id: string;
  wheel_id: string;
  prize_text: string;
  created_at: string;
}

const generateUniqueId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const dbService = {
  // Students / Children
  async getAllStudents(parentTeacherId?: string): Promise<StudentRow[]> {
    const db = await getDatabase();
    if (parentTeacherId) {
      return await db.getAllAsync<StudentRow>(
        'SELECT * FROM students WHERE parent_teacher_id = ? ORDER BY full_name ASC;',
        [parentTeacherId || '']
      );
    }
    return await db.getAllAsync<StudentRow>('SELECT * FROM students ORDER BY full_name ASC;');
  },

  async createStudent(student: Omit<StudentRow, 'id'>): Promise<StudentRow> {
    const db = await getDatabase();
    const id = generateUniqueId('std');
    await db.runAsync(
      `INSERT OR IGNORE INTO students (id, user_type, full_name, username, email, parent_teacher_id, points, period_type, grading_system)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        student.user_type || 'child',
        student.full_name || '',
        student.username || '',
        student.email || '',
        student.parent_teacher_id || '',
        isNaN(Number(student.points)) ? 0 : Number(student.points),
        student.period_type || 'semester',
        student.grading_system || 'percentage',
      ]
    );
    return { id, ...student };
  },

  async deleteStudent(studentId: string): Promise<void> {
    const db = await getDatabase();
    const safeId = studentId || '';
    
    // Delete all related records to maintain referential integrity
    await db.runAsync('DELETE FROM grades_log WHERE student_id = ?;', [safeId]);
    await db.runAsync('DELETE FROM rewards_log WHERE student_id = ?;', [safeId]);
    await db.runAsync('DELETE FROM period_assignments WHERE student_id = ?;', [safeId]);
    await db.runAsync('DELETE FROM student_periods WHERE student_id = ?;', [safeId]);
    await db.runAsync('DELETE FROM student_period_spins WHERE student_id = ?;', [safeId]);
    await db.runAsync('DELETE FROM students WHERE id = ?;', [safeId]);
  },

  // Periods
  async getAllPeriods(createdBy?: string): Promise<PeriodRow[]> {
    const db = await getDatabase();
    if (createdBy) {
      return await db.getAllAsync<PeriodRow>(
        'SELECT * FROM periods WHERE created_by = ? ORDER BY name ASC;',
        [createdBy || '']
      );
    }
    return await db.getAllAsync<PeriodRow>('SELECT * FROM periods ORDER BY name ASC;');
  },

  async createPeriod(name: string, periodType: PeriodType, createdBy: string): Promise<PeriodRow> {
    const db = await getDatabase();
    const id = generateUniqueId('prd');
    await db.runAsync(
      'INSERT INTO periods (id, name, period_type, created_by) VALUES (?, ?, ?, ?);',
      [id, name || '', periodType || 'semester', createdBy || '']
    );
    return { id, name, period_type: periodType, created_by: createdBy };
  },

  async deletePeriod(id: string): Promise<void> {
    const db = await getDatabase();
    const safeId = id || '';
    await db.runAsync('DELETE FROM periods WHERE id = ?;', [safeId]);
    await db.runAsync('DELETE FROM subjects WHERE period_id = ?;', [safeId]);
    await db.runAsync('DELETE FROM period_assignments WHERE period_id = ?;', [safeId]);
  },

  // Subjects
  async getAllSubjects(): Promise<SubjectRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<SubjectRow>('SELECT * FROM subjects ORDER BY name ASC;');
  },

  async getSubjectsForPeriod(periodId: string): Promise<SubjectRow[]> {
    const db = await getDatabase();
    const safeId = periodId || '';
    try {
      return await db.getAllAsync<SubjectRow>(
        'SELECT * FROM subjects WHERE period_id = ? ORDER BY name ASC;',
        [safeId]
      );
    } catch (e) {
      // Ensure migration if column was missing
      try {
        await db.execAsync('ALTER TABLE subjects ADD COLUMN period_id TEXT;');
        await db.execAsync("ALTER TABLE subjects ADD COLUMN grading_system TEXT DEFAULT 'percentage';");
      } catch (err) {}
      return await db.getAllAsync<SubjectRow>(
        'SELECT * FROM subjects WHERE period_id = ? ORDER BY name ASC;',
        [safeId]
      );
    }
  },

  async createDefaultRewardRulesForSubject(
    subjectId: string,
    gradingSystem: GradingSystem = 'percentage'
  ): Promise<RewardRuleRow[]> {
    const db = await getDatabase();
    const safeSubjectId = subjectId || '';
    await this.deleteRulesForSubject(safeSubjectId);

    let defaultRules: Omit<RewardRuleRow, 'id'>[] = [];

    if (gradingSystem === 'decimal') {
      defaultRules = [
        {
          subject_id: safeSubjectId,
          min_grade: 0,
          max_grade: 5.9,
          rule_type: 'punishment',
          reward_type: 'console',
          reward_value: 'Sin tiempo de consola por 1 semana',
        },
        {
          subject_id: safeSubjectId,
          min_grade: 6.0,
          max_grade: 8.9,
          rule_type: 'minor_reward',
          reward_type: 'allowance',
          reward_value: '30 min de consola / Premio especial',
        },
        {
          subject_id: safeSubjectId,
          min_grade: 9.0,
          max_grade: 10.0,
          rule_type: 'major_reward',
          reward_type: 'allowance',
          reward_value: '1 hora de consola / Salida al cine',
        },
      ];
    } else if (gradingSystem === 'letters') {
      defaultRules = [
        {
          subject_id: safeSubjectId,
          min_grade: 0.0,
          max_grade: 2.4, // F - D
          rule_type: 'punishment',
          reward_type: 'console',
          reward_value: 'Sin tiempo de pantalla / Repasar materia',
        },
        {
          subject_id: safeSubjectId,
          min_grade: 2.5,
          max_grade: 4.4, // C - B
          rule_type: 'minor_reward',
          reward_type: 'allowance',
          reward_value: '30 min de consola / Premio especial',
        },
        {
          subject_id: safeSubjectId,
          min_grade: 4.5,
          max_grade: 5.0, // A
          rule_type: 'major_reward',
          reward_type: 'allowance',
          reward_value: '1 hora de consola / Salida al cine',
        },
      ];
    } else {
      // Percentage
      defaultRules = [
        {
          subject_id: safeSubjectId,
          min_grade: 0,
          max_grade: 59,
          rule_type: 'punishment',
          reward_type: 'console',
          reward_value: 'Sin tiempo de consola por 1 semana',
        },
        {
          subject_id: safeSubjectId,
          min_grade: 60,
          max_grade: 89,
          rule_type: 'minor_reward',
          reward_type: 'allowance',
          reward_value: '30 min de consola / Premio especial',
        },
        {
          subject_id: safeSubjectId,
          min_grade: 90,
          max_grade: 100,
          rule_type: 'major_reward',
          reward_type: 'allowance',
          reward_value: '1 hora de consola / Salida al cine',
        },
      ];
    }

    const createdRows: RewardRuleRow[] = [];
    for (const rule of defaultRules) {
      const id = generateUniqueId('rule');
      await db.runAsync(
        `INSERT INTO reward_rules (id, subject_id, min_grade, max_grade, rule_type, reward_type, reward_value)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          safeSubjectId,
          isNaN(Number(rule.min_grade)) ? 0 : Number(rule.min_grade),
          isNaN(Number(rule.max_grade)) ? 100 : Number(rule.max_grade),
          rule.rule_type || 'minor_reward',
          rule.reward_type || 'allowance',
          rule.reward_value || '',
        ]
      );
      createdRows.push({ id, ...rule });
    }

    return createdRows;
  },

  async createSubject(
    name: string,
    createdBy: string,
    periodId?: string,
    gradingSystem: GradingSystem = 'percentage'
  ): Promise<SubjectRow> {
    const db = await getDatabase();
    const id = generateUniqueId('sbj');
    const safeName = name || '';
    const safePeriodId = periodId || '';
    const safeGradingSystem = gradingSystem || 'percentage';
    const safeCreatedBy = createdBy || '';

    try {
      await db.runAsync(
        'INSERT INTO subjects (id, name, period_id, grading_system, created_by) VALUES (?, ?, ?, ?, ?);',
        [id, safeName, safePeriodId, safeGradingSystem, safeCreatedBy]
      );
    } catch (e) {
      // Ensure migration if column was missing
      try {
        await db.execAsync('ALTER TABLE subjects ADD COLUMN period_id TEXT;');
        await db.execAsync("ALTER TABLE subjects ADD COLUMN grading_system TEXT DEFAULT 'percentage';");
      } catch (err) {}
      await db.runAsync(
        'INSERT INTO subjects (id, name, period_id, grading_system, created_by) VALUES (?, ?, ?, ?, ?);',
        [id, safeName, safePeriodId, safeGradingSystem, safeCreatedBy]
      );
    }

    // Automatically create default rules in SQLite for every new subject
    await this.createDefaultRewardRulesForSubject(id, safeGradingSystem);

    return { id, name: safeName, period_id: safePeriodId, grading_system: safeGradingSystem, created_by: safeCreatedBy };
  },

  async deleteSubject(id: string): Promise<void> {
    const db = await getDatabase();
    const safeId = id || '';
    await db.runAsync('DELETE FROM subjects WHERE id = ?;', [safeId]);
    await db.runAsync('DELETE FROM reward_rules WHERE subject_id = ?;', [safeId]);
    await db.runAsync('DELETE FROM period_assignments WHERE subject_id = ?;', [safeId]);
  },

  // Period Assignments
  async assignSubjectToStudentInPeriod(periodId: string, studentId: string, subjectId: string): Promise<void> {
    const db = await getDatabase();
    const id = generateUniqueId('asg');
    await db.runAsync(
      'INSERT INTO period_assignments (id, period_id, student_id, subject_id) VALUES (?, ?, ?, ?);',
      [id, periodId || '', studentId || '', subjectId || '']
    );
  },

  async getAssignmentsByPeriodAndStudent(periodId: string, studentId: string): Promise<PeriodAssignmentRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<PeriodAssignmentRow>(
      'SELECT * FROM period_assignments WHERE period_id = ? AND student_id = ?;',
      [periodId || '', studentId || '']
    );
  },

  async getAssignedSubjectsForStudent(studentId: string): Promise<(SubjectRow & { period_name?: string })[]> {
    const db = await getDatabase();
    const safeStudentId = studentId || '';
    const rows = await db.getAllAsync<SubjectRow & { pa_period_id?: string; period_name?: string }>(
      `SELECT DISTINCT s.*, pa.period_id as pa_period_id, p.name as period_name 
       FROM subjects s
       INNER JOIN period_assignments pa ON s.id = pa.subject_id
       LEFT JOIN periods p ON pa.period_id = p.id
       WHERE pa.student_id = ?
       ORDER BY s.name ASC;`,
      [safeStudentId]
    );

    return rows.map((r) => ({
      ...r,
      period_id: r.period_id || r.pa_period_id || '',
      grading_system: r.grading_system || 'percentage',
    }));
  },

  async deleteAssignmentsForStudentInPeriod(periodId: string, studentId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'DELETE FROM period_assignments WHERE period_id = ? AND student_id = ?;',
      [periodId || '', studentId || '']
    );
  },

  async getStudentPeriods(studentId: string): Promise<PeriodRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<PeriodRow>(
      `SELECT p.* FROM periods p 
       INNER JOIN student_periods sp ON p.id = sp.period_id 
       WHERE sp.student_id = ? 
       ORDER BY p.name ASC;`,
      [studentId || '']
    );
  },

  async assignPeriodToStudent(studentId: string, periodId: string): Promise<void> {
    const db = await getDatabase();
    const safeStudentId = studentId || '';
    const safePeriodId = periodId || '';
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM student_periods WHERE student_id = ? AND period_id = ?;',
      [safeStudentId, safePeriodId]
    );
    if (!existing) {
      const id = generateUniqueId('stp');
      await db.runAsync(
        'INSERT INTO student_periods (id, student_id, period_id) VALUES (?, ?, ?);',
        [id, safeStudentId, safePeriodId]
      );
    }
  },

  async removeStudentPeriodRelation(studentId: string, periodId: string): Promise<void> {
    const db = await getDatabase();
    const safeStudentId = studentId || '';
    const safePeriodId = periodId || '';
    await db.runAsync(
      'DELETE FROM student_periods WHERE student_id = ? AND period_id = ?;',
      [safeStudentId, safePeriodId]
    );
    await db.runAsync(
      'DELETE FROM period_assignments WHERE student_id = ? AND period_id = ?;',
      [safeStudentId, safePeriodId]
    );
  },

  async saveStudentPeriodAndSubjectsBatch(studentId: string, periodId: string, subjectIds: string[]): Promise<void> {
    const safeStudentId = studentId || '';
    const safePeriodId = periodId || '';
    if (subjectIds.length > 0) {
      await this.assignPeriodToStudent(safeStudentId, safePeriodId);
      await this.deleteAssignmentsForStudentInPeriod(safePeriodId, safeStudentId);
      for (const sbId of subjectIds) {
        if (sbId) {
          await this.assignSubjectToStudentInPeriod(safePeriodId, safeStudentId, sbId);
        }
      }
    } else {
      await this.removeStudentPeriodRelation(safeStudentId, safePeriodId);
    }
  },

  // Reward Rules
  async deleteRulesForSubject(subjectId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM reward_rules WHERE subject_id = ?;', [subjectId || '']);
  },

  async saveSubjectRewardRulesBatch(
    subjectId: string,
    rules: Omit<RewardRuleRow, 'id'>[]
  ): Promise<void> {
    if (rules.length > 4) {
      throw new Error('Límite alcanzado: Máximo 4 premios por materia.');
    }
    const db = await getDatabase();
    const safeSubjectId = subjectId || '';
    await this.deleteRulesForSubject(safeSubjectId);
    for (const rule of rules) {
      const id = generateUniqueId('rule');
      await db.runAsync(
        `INSERT INTO reward_rules (id, subject_id, min_grade, max_grade, rule_type, reward_type, reward_value)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          id,
          safeSubjectId,
          isNaN(Number(rule.min_grade)) ? 0 : Number(rule.min_grade),
          isNaN(Number(rule.max_grade)) ? 100 : Number(rule.max_grade),
          rule.rule_type || 'minor_reward',
          rule.reward_type || 'points',
          rule.reward_value || '',
        ]
      );
    }
  },

  async saveRewardRule(rule: Omit<RewardRuleRow, 'id'>): Promise<RewardRuleRow> {
    const db = await getDatabase();
    const safeSubjectId = rule.subject_id || '';
    const existing = await this.getRulesForSubject(safeSubjectId);
    if (existing.length >= 4) {
      throw new Error('Límite alcanzado: Máximo 4 premios/reglas por materia.');
    }
    const id = generateUniqueId('rule');
    await db.runAsync(
      `INSERT INTO reward_rules (id, subject_id, min_grade, max_grade, rule_type, reward_type, reward_value)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        safeSubjectId,
        isNaN(Number(rule.min_grade)) ? 0 : Number(rule.min_grade),
        isNaN(Number(rule.max_grade)) ? 100 : Number(rule.max_grade),
        rule.rule_type || 'minor_reward',
        rule.reward_type || 'points',
        rule.reward_value || '',
      ]
    );
    return { id, ...rule };
  },

  async getRulesForSubject(subjectId: string): Promise<RewardRuleRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<RewardRuleRow>(
      'SELECT * FROM reward_rules WHERE subject_id = ? ORDER BY min_grade ASC;',
      [subjectId || '']
    );
  },

  // Grade Logging & Auto Reward Evaluation
  async addGradeAndEvaluateRewards(
    studentId: string,
    subjectId: string,
    periodId: string,
    rawGrade: string,
    numericGrade: number,
    gradingSystem: string
  ): Promise<{ gradeLog: GradeLogRow; triggeredReward?: RewardLogRow }> {
    const db = await getDatabase();
    const gradeId = generateUniqueId('grd');
    const createdAt = new Date().toISOString();

    const safeStudentId = studentId || '';
    const safeSubjectId = subjectId || '';
    const safePeriodId = periodId || '';
    const safeRawGrade = rawGrade || '';
    const safeNumericGrade = isNaN(Number(numericGrade)) ? 0 : Number(numericGrade);
    const safeGradingSystem = gradingSystem || 'percentage';

    await db.runAsync(
      `INSERT INTO grades_log (id, student_id, subject_id, period_id, raw_grade, numeric_grade, grading_system, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [gradeId, safeStudentId, safeSubjectId, safePeriodId, safeRawGrade, safeNumericGrade, safeGradingSystem, createdAt]
    );

    const gradeLog: GradeLogRow = {
      id: gradeId,
      student_id: safeStudentId,
      subject_id: safeSubjectId,
      period_id: safePeriodId,
      raw_grade: safeRawGrade,
      numeric_grade: safeNumericGrade,
      grading_system: safeGradingSystem,
      created_at: createdAt,
    };

    // Evaluate matching reward rule
    let rules = await this.getRulesForSubject(safeSubjectId);
    if (rules.length === 0) {
      rules = await this.createDefaultRewardRulesForSubject(safeSubjectId, safeGradingSystem as GradingSystem);
    }

    const matchedRule = rules.find(
      (r) => safeNumericGrade >= r.min_grade && safeNumericGrade <= r.max_grade
    );

    let triggeredReward: RewardLogRow | undefined = undefined;

    if (matchedRule) {
      const rewardId = generateUniqueId('rwd');
      const title =
        matchedRule.rule_type === 'punishment'
          ? '⚠️ Consecuencia Aplicada'
          : matchedRule.rule_type === 'major_reward'
          ? '🌟 ¡Premio Mayor Obtenido!'
          : '🎁 ¡Premio Menor Obtenido!';

      const safeRewardType = matchedRule.reward_type || 'points';
      const safeRewardValue = matchedRule.reward_value || '';
      const safeRuleType = matchedRule.rule_type || 'minor_reward';

      await db.runAsync(
        `INSERT INTO rewards_log (id, student_id, period_id, subject_id, title, reward_type, reward_value, rule_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          rewardId,
          safeStudentId,
          safePeriodId,
          safeSubjectId,
          title,
          safeRewardType,
          safeRewardValue,
          safeRuleType,
          createdAt,
        ]
      );

      triggeredReward = {
        id: rewardId,
        student_id: safeStudentId,
        period_id: safePeriodId,
        subject_id: safeSubjectId,
        title,
        reward_type: safeRewardType,
        reward_value: safeRewardValue,
        rule_type: safeRuleType,
        created_at: createdAt,
      };
    }

    // Recalculate student global average by averaging per-subject averages
    await this.calculateAndUpdateStudentAverage(safeStudentId);

    return { gradeLog, triggeredReward };
  },

  async getGradesForStudent(studentId: string): Promise<(GradeLogRow & { subject_name?: string })[]> {
    const db = await getDatabase();
    return await db.getAllAsync<GradeLogRow & { subject_name?: string }>(
      `SELECT g.*, s.name as subject_name 
       FROM grades_log g 
       LEFT JOIN subjects s ON g.subject_id = s.id 
       WHERE g.student_id = ? 
       ORDER BY g.created_at DESC;`,
      [studentId || '']
    );
  },

  async getGradesForSubjectAndStudent(studentId: string, subjectId: string): Promise<GradeLogRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<GradeLogRow>(
      'SELECT * FROM grades_log WHERE student_id = ? AND subject_id = ? ORDER BY created_at DESC;',
      [studentId || '', subjectId || '']
    );
  },

  async updateGradeLog(
    gradeId: string,
    studentId: string,
    rawGrade: string,
    numericGrade: number,
    gradingSystem: string
  ): Promise<{ gradeLog: GradeLogRow; triggeredReward?: RewardLogRow }> {
    const db = await getDatabase();
    const safeGradeId = gradeId || '';
    const safeStudentId = studentId || '';
    const safeRawGrade = rawGrade || '';
    const safeNumericGrade = isNaN(Number(numericGrade)) ? 0 : Number(numericGrade);
    const safeGradingSystem = gradingSystem || 'percentage';

    const existingGrade = await db.getFirstAsync<GradeLogRow>(
      'SELECT * FROM grades_log WHERE id = ?;',
      [safeGradeId]
    );

    await db.runAsync(
      `UPDATE grades_log SET raw_grade = ?, numeric_grade = ?, grading_system = ? WHERE id = ?;`,
      [safeRawGrade, safeNumericGrade, safeGradingSystem, safeGradeId]
    );

    const updatedGradeLog: GradeLogRow = {
      id: safeGradeId,
      student_id: existingGrade?.student_id || safeStudentId,
      subject_id: existingGrade?.subject_id || '',
      period_id: existingGrade?.period_id || '',
      raw_grade: safeRawGrade,
      numeric_grade: safeNumericGrade,
      grading_system: safeGradingSystem,
      created_at: existingGrade?.created_at || new Date().toISOString(),
    };

    let triggeredReward: RewardLogRow | undefined = undefined;

    if (existingGrade) {
      // Remove old reward log associated with this grade's timestamp
      await db.runAsync(
        'DELETE FROM rewards_log WHERE student_id = ? AND subject_id = ? AND created_at = ?;',
        [existingGrade.student_id, existingGrade.subject_id, existingGrade.created_at]
      );

      // Re-evaluate matching reward rule for new numeric grade
      let rules = await this.getRulesForSubject(existingGrade.subject_id);
      if (rules.length === 0) {
        rules = await this.createDefaultRewardRulesForSubject(existingGrade.subject_id, safeGradingSystem as GradingSystem);
      }

      const matchedRule = rules.find(
        (r) => safeNumericGrade >= r.min_grade && safeNumericGrade <= r.max_grade
      );

      if (matchedRule) {
        const rewardId = generateUniqueId('rwd');
        const title =
          matchedRule.rule_type === 'punishment'
            ? '⚠️ Consecuencia Aplicada'
            : matchedRule.rule_type === 'major_reward'
            ? '🌟 ¡Premio Mayor Obtenido!'
            : '🎁 ¡Premio Menor Obtenido!';

        const safeRewardType = matchedRule.reward_type || 'points';
        const safeRewardValue = matchedRule.reward_value || '';
        const safeRuleType = matchedRule.rule_type || 'minor_reward';

        await db.runAsync(
          `INSERT INTO rewards_log (id, student_id, period_id, subject_id, title, reward_type, reward_value, rule_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            rewardId,
            existingGrade.student_id,
            existingGrade.period_id,
            existingGrade.subject_id,
            title,
            safeRewardType,
            safeRewardValue,
            safeRuleType,
            existingGrade.created_at,
          ]
        );

        triggeredReward = {
          id: rewardId,
          student_id: existingGrade.student_id,
          period_id: existingGrade.period_id,
          subject_id: existingGrade.subject_id,
          title,
          reward_type: safeRewardType,
          reward_value: safeRewardValue,
          rule_type: safeRuleType,
          created_at: existingGrade.created_at,
        };
      }
    }

    await this.calculateAndUpdateStudentAverage(safeStudentId);

    return { gradeLog: updatedGradeLog, triggeredReward };
  },

  async deleteGradeLog(gradeId: string, studentId: string): Promise<void> {
    const db = await getDatabase();
    const safeGradeId = gradeId || '';
    const safeStudentId = studentId || '';

    const existingGrade = await db.getFirstAsync<GradeLogRow>(
      'SELECT * FROM grades_log WHERE id = ?;',
      [safeGradeId]
    );

    if (existingGrade) {
      await db.runAsync(
        'DELETE FROM rewards_log WHERE student_id = ? AND subject_id = ? AND created_at = ?;',
        [existingGrade.student_id, existingGrade.subject_id, existingGrade.created_at]
      );
    }

    await db.runAsync('DELETE FROM grades_log WHERE id = ?;', [safeGradeId]);
    await this.calculateAndUpdateStudentAverage(safeStudentId);
  },

  async recalculateAllStudentAverages(): Promise<void> {
    const db = await getDatabase();
    const students = await db.getAllAsync<{ id: string }>('SELECT id FROM students;');
    for (const st of students) {
      if (st && st.id) {
        await this.calculateAndUpdateStudentAverage(st.id);
      }
    }
  },

  async calculateAndUpdateStudentAverage(studentId: string): Promise<{
    globalAverage: number;
    subjectAverages: Record<string, { subjectName: string; average: number; count: number }>;
  }> {
    const db = await getDatabase();
    const safeStudentId = studentId || '';

    // Fetch student row to get primary grading system
    const student = await db.getFirstAsync<StudentRow>(
      'SELECT * FROM students WHERE id = ?;',
      [safeStudentId]
    );

    // Get assigned subjects for student
    const assignedSubjects = await this.getAssignedSubjectsForStudent(safeStudentId);

    // Determine target scale for global average based on assigned subjects
    let targetScale = student?.grading_system || 'percentage';
    if (assignedSubjects.length > 0) {
      const hasDecimal = assignedSubjects.some((s) => s.grading_system === 'decimal');
      const hasLetters = assignedSubjects.some((s) => s.grading_system === 'letters');
      const hasPercentage = assignedSubjects.some((s) => s.grading_system === 'percentage');

      if (hasDecimal && !hasPercentage) {
        targetScale = 'decimal';
      } else if (hasLetters && !hasPercentage && !hasDecimal) {
        targetScale = 'letters';
      }
    }

    // Get all grade logs for student
    const allGrades = await this.getGradesForStudent(safeStudentId);

    const subjectMap: Record<
      string,
      { subjectName: string; system: string; sumNorm: number; count: number; rawSum: number }
    > = {};

    // Initialize map for assigned subjects
    for (const sb of assignedSubjects) {
      subjectMap[sb.id] = {
        subjectName: sb.name,
        system: sb.grading_system || 'percentage',
        sumNorm: 0,
        count: 0,
        rawSum: 0,
      };
    }

    // Process all grades
    for (const g of allGrades) {
      if (!subjectMap[g.subject_id]) {
        subjectMap[g.subject_id] = {
          subjectName: g.subject_name || 'Materia',
          system: g.grading_system || 'percentage',
          sumNorm: 0,
          count: 0,
          rawSum: 0,
        };
      }

      const item = subjectMap[g.subject_id];
      item.count += 1;

      let actualNumGrade = g.numeric_grade;
      const effectiveSystem = item.system || g.grading_system;
      if (effectiveSystem === 'decimal' && actualNumGrade > 10) {
        actualNumGrade = actualNumGrade / 10;
      }

      item.rawSum += actualNumGrade;

      // Normalize to 0-100 scale for unified global average
      let normGrade = actualNumGrade;
      if (effectiveSystem === 'decimal') {
        normGrade = actualNumGrade * 10;
      } else if (effectiveSystem === 'letters') {
        normGrade = actualNumGrade * 20; // 5 -> 100, 4 -> 80, 3 -> 60, etc.
      }
      item.sumNorm += normGrade;
    }

    const subjectAverages: Record<string, { subjectName: string; average: number; count: number }> = {};
    let globalSumNorm = 0;
    let activeSubjectsCount = 0;

    for (const [sbId, data] of Object.entries(subjectMap)) {
      if (data.count > 0) {
        const rawAvg = Math.round((data.rawSum / data.count) * 10) / 10;
        const normAvg = data.sumNorm / data.count;

        subjectAverages[sbId] = {
          subjectName: data.subjectName,
          average: rawAvg,
          count: data.count,
        };

        globalSumNorm += normAvg;
        activeSubjectsCount += 1;
      }
    }

    let globalAverage = 0;
    if (activeSubjectsCount > 0) {
      const normGlobalAvg = globalSumNorm / activeSubjectsCount; // 0-100 scale

      // Convert global average back to target scale
      if (targetScale === 'decimal') {
        globalAverage = Math.round((normGlobalAvg / 10) * 10) / 10; // 0-10 scale
      } else if (targetScale === 'letters') {
        globalAverage = Math.round((normGlobalAvg / 20) * 10) / 10; // 0-5 scale
      } else {
        globalAverage = Math.round(normGlobalAvg * 10) / 10; // 0-100 scale
      }
    }

    await db.runAsync('UPDATE students SET average = ? WHERE id = ?;', [
      globalAverage,
      safeStudentId,
    ]);

    return { globalAverage, subjectAverages };
  },

  async getRewardForGradeLog(gradeLog: GradeLogRow): Promise<{
    title: string;
    reward_type: string;
    reward_value: string;
    rule_type: string;
  } | null> {
    const db = await getDatabase();
    // Try finding explicit reward log by student, subject, and creation timestamp
    const log = await db.getFirstAsync<RewardLogRow>(
      'SELECT * FROM rewards_log WHERE student_id = ? AND subject_id = ? AND created_at = ?;',
      [gradeLog.student_id, gradeLog.subject_id, gradeLog.created_at]
    );

    if (log) {
      return {
        title: log.title,
        reward_type: log.reward_type,
        reward_value: log.reward_value,
        rule_type: log.rule_type,
      };
    }

    // Fallback: evaluate rule for grade's subject and numeric grade
    const rules = await this.getRulesForSubject(gradeLog.subject_id);
    let num = gradeLog.numeric_grade;
    if (gradeLog.grading_system === 'decimal' && num > 10) {
      num = num / 10;
    }
    const matched = rules.find((r) => num >= r.min_grade && num <= r.max_grade);
    if (matched) {
      const title =
        matched.rule_type === 'punishment'
          ? '⚠️ Consecuencia Aplicada'
          : matched.rule_type === 'major_reward'
          ? '🌟 ¡Premio Mayor Obtenido!'
          : '🎁 ¡Premio Menor Obtenido!';
      return {
        title,
        reward_type: matched.reward_type,
        reward_value: matched.reward_value,
        rule_type: matched.rule_type,
      };
    }

    return null;
  },

  async getRewardsLogForStudent(studentId: string): Promise<RewardLogRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<RewardLogRow>(
      'SELECT * FROM rewards_log WHERE student_id = ? ORDER BY created_at DESC;',
      [studentId || '']
    );
  },

  // Period Wheels & Options Management
  async getPeriodWheels(periodId: string): Promise<PeriodWheelWithOptions[]> {
    const db = await getDatabase();
    const safePeriodId = periodId || '';
    if (!safePeriodId) return [];

    let wheels = await db.getAllAsync<PeriodWheelRow>(
      'SELECT * FROM period_wheels WHERE period_id = ? ORDER BY id DESC;',
      [safePeriodId]
    );

    // Fetch options for each wheel
    const result: PeriodWheelWithOptions[] = [];
    for (const w of wheels) {
      const options = await db.getAllAsync<PeriodWheelOptionRow>(
        'SELECT * FROM period_wheel_options WHERE wheel_id = ? ORDER BY created_at ASC;',
        [w.id]
      );
      result.push({
        ...w,
        options,
      });
    }

    return result;
  },

  async createPeriodWheel(periodId: string, title: string = 'Nueva Ruleta'): Promise<void> {
    const db = await getDatabase();
    const wheelId = generateUniqueId('pw');
    await db.runAsync(
      `INSERT INTO period_wheels (id, period_id, wheel_key, title, min_grade, max_grade, color, icon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [wheelId, periodId || '', 'custom', title, 0, 10, '#3b82f6', 'aperture']
    );
  },

  async updatePeriodWheelRange(
    wheelId: string,
    minGrade: number,
    maxGrade: number,
    title?: string,
    icon?: string,
    color?: string
  ): Promise<void> {
    const db = await getDatabase();
    const safeWheelId = wheelId || '';
    const safeMin = isNaN(Number(minGrade)) ? 0 : Number(minGrade);
    const safeMax = isNaN(Number(maxGrade)) ? 10 : Number(maxGrade);

    if (title !== undefined && icon !== undefined && color !== undefined) {
      await db.runAsync(
        'UPDATE period_wheels SET min_grade = ?, max_grade = ?, title = ?, icon = ?, color = ? WHERE id = ?;',
        [safeMin, safeMax, title, icon, color, safeWheelId]
      );
    } else if (title !== undefined && icon !== undefined) {
      await db.runAsync(
        'UPDATE period_wheels SET min_grade = ?, max_grade = ?, title = ?, icon = ? WHERE id = ?;',
        [safeMin, safeMax, title, icon, safeWheelId]
      );
    } else if (title !== undefined) {
      await db.runAsync(
        'UPDATE period_wheels SET min_grade = ?, max_grade = ?, title = ? WHERE id = ?;',
        [safeMin, safeMax, title, safeWheelId]
      );
    } else {
      await db.runAsync(
        'UPDATE period_wheels SET min_grade = ?, max_grade = ? WHERE id = ?;',
        [safeMin, safeMax, safeWheelId]
      );
    }
  },

  async deletePeriodWheel(wheelId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM period_wheel_options WHERE wheel_id = ?;', [wheelId || '']);
    await db.runAsync('DELETE FROM period_wheels WHERE id = ?;', [wheelId || '']);
  },

  async addWheelOption(wheelId: string, optionText: string): Promise<PeriodWheelOptionRow> {
    const db = await getDatabase();
    const safeWheelId = wheelId || '';
    const safeText = optionText.trim();
    if (!safeText) throw new Error('El texto de la opción no puede estar vacío.');

    const id = generateUniqueId('pwo');
    const createdAt = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO period_wheel_options (id, wheel_id, option_text, created_at) VALUES (?, ?, ?, ?);',
      [id, safeWheelId, safeText, createdAt]
    );

    return { id, wheel_id: safeWheelId, option_text: safeText, created_at: createdAt };
  },

  async deleteWheelOption(optionId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM period_wheel_options WHERE id = ?;', [optionId || '']);
  },

  async getMatchingWheelForStudent(
    studentId: string,
    periodId: string
  ): Promise<{ wheel: PeriodWheelRow; options: string[] } | null> {
    const db = await getDatabase();
    const wheelsWithOptions = await this.getPeriodWheels(periodId);
    if (wheelsWithOptions.length === 0) return null;

    // Get student's period average or global average
    const avgRes = await this.calculateAndUpdateStudentAverage(studentId);
    const avg = avgRes.globalAverage;

    // Match average against wheel ranges
    let matched = wheelsWithOptions.find(
      (w) => avg >= w.min_grade && avg <= w.max_grade
    );

    // Fallback if slightly out of exact bounds
    if (!matched) {
      if (avg < wheelsWithOptions[0].min_grade) {
        matched = wheelsWithOptions[0];
      } else {
        matched = wheelsWithOptions[wheelsWithOptions.length - 1];
      }
    }

    return {
      wheel: matched,
      options: matched.options.map((o) => o.option_text),
    };
  },

  async saveStudentPeriodSpin(
    studentId: string,
    periodId: string,
    wheelId: string,
    prizeText: string
  ): Promise<StudentPeriodSpinRow> {
    const db = await getDatabase();
    const id = generateUniqueId('sps');
    const createdAt = new Date().toISOString();

    await db.runAsync(
      `INSERT OR REPLACE INTO student_period_spins (id, student_id, period_id, wheel_id, prize_text, created_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id, studentId || '', periodId || '', wheelId || '', prizeText || '', createdAt]
    );

    return { id, student_id: studentId, period_id: periodId, wheel_id: wheelId, prize_text: prizeText, created_at: createdAt };
  },

  async getStudentPeriodSpin(studentId: string, periodId: string): Promise<StudentPeriodSpinRow | null> {
    const db = await getDatabase();
    const safeStudentId = studentId || '';
    const safePeriodId = periodId || '';
    if (!safeStudentId || !safePeriodId) return null;

    const row = await db.getFirstAsync<StudentPeriodSpinRow>(
      'SELECT * FROM student_period_spins WHERE student_id = ? AND period_id = ?;',
      [safeStudentId, safePeriodId]
    );

    return row || null;
  },

  async getAllStudentSpins(studentId: string): Promise<StudentPeriodSpinRow[]> {
    const db = await getDatabase();
    const safeStudentId = studentId || '';
    if (!safeStudentId) return [];
    
    return db.getAllAsync<StudentPeriodSpinRow>(
      'SELECT * FROM student_period_spins WHERE student_id = ? ORDER BY created_at DESC;',
      [safeStudentId]
    );
  },

  async resetStudentPeriodSpin(studentId: string, periodId: string): Promise<void> {
    const db = await getDatabase();
    const safeStudentId = studentId || '';
    const safePeriodId = periodId || '';
    await db.runAsync(
      'DELETE FROM student_period_spins WHERE student_id = ? AND period_id = ?;',
      [safeStudentId, safePeriodId]
    );
  },

  async clearAllData(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM students;');
    await db.runAsync('DELETE FROM periods;');
    await db.runAsync('DELETE FROM subjects;');
    await db.runAsync('DELETE FROM reward_rules;');
    await db.runAsync('DELETE FROM period_assignments;');
    await db.runAsync('DELETE FROM grades_log;');
    await db.runAsync('DELETE FROM rewards_log;');
    await db.runAsync('DELETE FROM period_wheels;');
    await db.runAsync('DELETE FROM period_wheel_options;');
    await db.runAsync('DELETE FROM student_period_spins;');
  },
};

export default dbService;
