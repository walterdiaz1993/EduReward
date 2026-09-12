import { getDatabase } from './database';

export interface StudentRow {
  id: string;
  user_type: 'child' | 'student';
  full_name: string;
  username: string;
  email: string;
  parent_teacher_id?: string;
  points: number;
  period_type: 'bimonthly' | 'semester';
  grading_system: 'percentage' | 'decimal' | 'letters';
}

export interface PeriodRow {
  id: string;
  name: string;
  period_type: 'bimonthly' | 'semester';
  created_by: string;
}

export interface SubjectRow {
  id: string;
  name: string;
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

const generateUniqueId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const dbService = {
  // Students / Children
  async getAllStudents(parentTeacherId?: string): Promise<StudentRow[]> {
    const db = await getDatabase();
    if (parentTeacherId) {
      return await db.getAllAsync<StudentRow>(
        'SELECT * FROM students WHERE parent_teacher_id = ? ORDER BY full_name ASC;',
        [parentTeacherId]
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
        student.user_type,
        student.full_name,
        student.username,
        student.email,
        student.parent_teacher_id || null,
        student.points || 0,
        student.period_type || 'semester',
        student.grading_system || 'percentage',
      ]
    );
    return { id, ...student };
  },

  // Periods
  async getAllPeriods(createdBy?: string): Promise<PeriodRow[]> {
    const db = await getDatabase();
    if (createdBy) {
      return await db.getAllAsync<PeriodRow>(
        'SELECT * FROM periods WHERE created_by = ? ORDER BY name ASC;',
        [createdBy]
      );
    }
    return await db.getAllAsync<PeriodRow>('SELECT * FROM periods ORDER BY name ASC;');
  },

  async createPeriod(name: string, periodType: 'bimonthly' | 'semester', createdBy: string): Promise<PeriodRow> {
    const db = await getDatabase();
    const id = generateUniqueId('prd');
    await db.runAsync(
      'INSERT INTO periods (id, name, period_type, created_by) VALUES (?, ?, ?, ?);',
      [id, name, periodType, createdBy]
    );
    return { id, name, period_type: periodType, created_by: createdBy };
  },

  async deletePeriod(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM periods WHERE id = ?;', [id]);
    await db.runAsync('DELETE FROM period_assignments WHERE period_id = ?;', [id]);
  },

  // Subjects
  async getAllSubjects(): Promise<SubjectRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<SubjectRow>('SELECT * FROM subjects ORDER BY name ASC;');
  },

  async createSubject(name: string, createdBy: string): Promise<SubjectRow> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<SubjectRow>(
      'SELECT * FROM subjects WHERE name = ?;',
      [name]
    );
    if (existing) {
      return existing;
    }
    const id = generateUniqueId('sbj');
    await db.runAsync(
      'INSERT INTO subjects (id, name, created_by) VALUES (?, ?, ?);',
      [id, name, createdBy]
    );
    return { id, name, created_by: createdBy };
  },

  async deleteSubject(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM subjects WHERE id = ?;', [id]);
    await db.runAsync('DELETE FROM reward_rules WHERE subject_id = ?;', [id]);
    await db.runAsync('DELETE FROM period_assignments WHERE subject_id = ?;', [id]);
  },

  // Period Assignments
  async assignSubjectToStudentInPeriod(periodId: string, studentId: string, subjectId: string): Promise<void> {
    const db = await getDatabase();
    const id = generateUniqueId('asg');
    await db.runAsync(
      'INSERT INTO period_assignments (id, period_id, student_id, subject_id) VALUES (?, ?, ?, ?);',
      [id, periodId, studentId, subjectId]
    );
  },

  async getAssignmentsByPeriodAndStudent(periodId: string, studentId: string): Promise<PeriodAssignmentRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<PeriodAssignmentRow>(
      'SELECT * FROM period_assignments WHERE period_id = ? AND student_id = ?;',
      [periodId, studentId]
    );
  },

  // Reward Rules
  async saveRewardRule(rule: Omit<RewardRuleRow, 'id'>): Promise<RewardRuleRow> {
    const db = await getDatabase();
    const id = generateUniqueId('rule');
    await db.runAsync(
      `INSERT INTO reward_rules (id, subject_id, min_grade, max_grade, rule_type, reward_type, reward_value)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id, rule.subject_id, rule.min_grade, rule.max_grade, rule.rule_type, rule.reward_type, rule.reward_value]
    );
    return { id, ...rule };
  },

  async getRulesForSubject(subjectId: string): Promise<RewardRuleRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<RewardRuleRow>(
      'SELECT * FROM reward_rules WHERE subject_id = ? ORDER BY min_grade ASC;',
      [subjectId]
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

    await db.runAsync(
      `INSERT INTO grades_log (id, student_id, subject_id, period_id, raw_grade, numeric_grade, grading_system, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [gradeId, studentId, subjectId, periodId, rawGrade, numericGrade, gradingSystem, createdAt]
    );

    const gradeLog: GradeLogRow = {
      id: gradeId,
      student_id: studentId,
      subject_id: subjectId,
      period_id: periodId,
      raw_grade: rawGrade,
      numeric_grade: numericGrade,
      grading_system: gradingSystem,
      created_at: createdAt,
    };

    // Evaluate matching reward rule
    const rules = await this.getRulesForSubject(subjectId);
    const matchedRule = rules.find(
      (r) => numericGrade >= r.min_grade && numericGrade <= r.max_grade
    );

    let triggeredReward: RewardLogRow | undefined = undefined;

    if (matchedRule) {
      const rewardId = generateUniqueId('rwd');
      const title =
        matchedRule.rule_type === 'punishment'
          ? 'Castigo / Consecuencia Aplicada'
          : matchedRule.rule_type === 'major_reward'
          ? '¡Premio Mayor Obtenido! ⭐'
          : 'Premio Menor Obtenido';

      await db.runAsync(
        `INSERT INTO rewards_log (id, student_id, period_id, subject_id, title, reward_type, reward_value, rule_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          rewardId,
          studentId,
          periodId,
          subjectId,
          title,
          matchedRule.reward_type,
          matchedRule.reward_value,
          matchedRule.rule_type,
          createdAt,
        ]
      );

      // If points reward, update student points
      if (matchedRule.reward_type === 'points') {
        const ptsChange = parseInt(matchedRule.reward_value, 10) || 0;
        await db.runAsync('UPDATE students SET points = MAX(0, points + ?) WHERE id = ?;', [
          ptsChange,
          studentId,
        ]);
      }

      triggeredReward = {
        id: rewardId,
        student_id: studentId,
        period_id: periodId,
        subject_id: subjectId,
        title,
        reward_type: matchedRule.reward_type,
        reward_value: matchedRule.reward_value,
        rule_type: matchedRule.rule_type,
        created_at: createdAt,
      };
    }

    return { gradeLog, triggeredReward };
  },

  async getRewardsLogForStudent(studentId: string): Promise<RewardLogRow[]> {
    const db = await getDatabase();
    return await db.getAllAsync<RewardLogRow>(
      'SELECT * FROM rewards_log WHERE student_id = ? ORDER BY created_at DESC;',
      [studentId]
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
  },
};

export default dbService;
