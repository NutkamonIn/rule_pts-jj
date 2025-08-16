// tests/ruleEngine.spec.ts
import { describe, it, expect } from 'vitest';
import { evaluateProfile } from '../src/rules/ruleEngine';

describe('Rule Engine - Multi-File Rules', () => {
  it('ควรจัดกลุ่มพยาบาล ICU เป็นกลุ่ม 2', () => {
    const profile = {
      jobTitle: "พยาบาลวิชาชีพ",
      department: "ICU"
    };

    const result = evaluateProfile(profile);
    expect(result.suggestedGroup).toBe(2);
    expect(result.matchedRules).toContain('isICUNurse');
  });

  it('ควรจัดแพทย์เฉพาะทางเป็นกลุ่ม 1', () => {
    const profile = {
      jobTitle: "แพทย์",
      specialty: "วิสัญญี",
      education: "ปริญญาโท"
    };

    const result = evaluateProfile(profile);
    expect(result.suggestedGroup).toBe(1);
    expect(result.matchedRules.length).toBeGreaterThan(0);
  });

  it('ไม่เข้าเงื่อนไขใด ๆ เลย → กลุ่ม 1', () => {
    const profile = {
      jobTitle: "ผู้ช่วยพยาบาล",
      department: "ทั่วไป"
    };

    const result = evaluateProfile(profile);
    expect(result.suggestedGroup).toBe(1);
    expect(result.matchedRules).toEqual([]);
    expect(result.comments).toContain("ไม่เข้าเงื่อนไขใด ๆ");
  });
});