import { describe, it, expect } from 'vitest';
import { evaluateProfile } from '../src/rules/ruleEngine';

describe('Rule Evaluation Tests', () => {
  it('ควรเข้า dr_1 (medic_rules.yaml)', () => {
    const result = evaluateProfile({ jobTitle: 'นายแพทย์' });
    expect(result.matchedRules).toContain('dr_1');
    expect(result.suggestedGroup).toBe(1);
  });

  it('ควรเข้า dr_2 (medic_rules.yaml)', () => {
    const result = evaluateProfile({ hasSpecialCommand: true, degree: 'ปริญญาโท' });
    expect(result.matchedRules).toContain('dr_2');
    expect(result.suggestedGroup).toBe(2);
  });

  it('ควรเข้า dr_3 (medic_rules.yaml)', () => {
    const result = evaluateProfile({
      jobTitle: 'นายแพทย์',
      degree: 'ว.ว. สาขาพยาธิวิทยาคลินิก',
      specialty: 'สาขาพยาธิวิทยาทั่วไป'
    });
    expect(result.matchedRules).toContain('dr_3');
    expect(result.suggestedGroup).toBe(3);
  });

  it('ควรเข้า n_1 (nurse_rules.yaml)', () => {
    const result = evaluateProfile({ jobTitle: 'พยาบาล' });
    expect(result.matchedRules).toContain('n_1');
    expect(result.suggestedGroup).toBe(1);
  });

  it('ควรเข้า n_2 (nurse_rules.yaml)', () => {
    const result = evaluateProfile({
      jobTitle: 'พยาบาล',
      hasSpecialCommand: true,
      specialty: 'งานควบคุมการติดเชื้อในโรงพยาบาล(IC)',
      department: 'ห้องสังเกตอาการ'
    });
    expect(result.matchedRules).toContain('n_2');
    expect(result.suggestedGroup).toBe(2);
  });

  it('ควรเข้า n_3 (nurse_rules.yaml)', () => {
    const result = evaluateProfile({
      jobTitle: 'วิสัญญี',
      degree: 'ปริญญาโทสาขาการพยาบาลเวชปฏิบัติ',
      hasSpecialCommand: true,
      department: 'ICU',
      specialty: 'การพยาบาลผู้ป่วยติดเชื้อรุนแรงหรืออันตราย'
    });
    expect(result.matchedRules).toContain('n_3');
    expect(result.suggestedGroup).toBe(3);
  });

  it('ควรเข้า pm_1 (phama_rule.yaml)', () => {
    const result = evaluateProfile({ jobTitle: 'เภสัชกร' });
    expect(result.matchedRules).toContain('pm_1');
    expect(result.suggestedGroup).toBe(1);
  });

  it('ควรเข้า pm_2 (phama_rule.yaml)', () => {
    const result = evaluateProfile({
      hasSpecialCommand: true,
      specialty: 'การเตรียมยาหรือวิเคราะห์ยาเคมีบำบัด'
    });
    expect(result.matchedRules).toContain('pm_2');
    expect(result.suggestedGroup).toBe(2);
  });

  it('ควร fallback ไป group=3 ถ้าไม่เข้าเงื่อนไขใดๆ', () => {
    const result = evaluateProfile({ jobTitle: 'ช่างไฟ' });
    expect(result.suggestedGroup).toBe(3);
    expect(result.matchedRules.length).toBe(0);
  });
});
