import { FastifyInstance } from "fastify";
import { loadAllRulesFromDir } from "../rules/ruleEngine";

export default async function calculationRouters(app: FastifyInstance) {
  app.post('/api/calculations', async (request, reply) => {
    const profile = request.body as Record<string, any>;
    const rules = loadAllRulesFromDir();

    // ตรวจสอบ rule แต่ละอันว่าตรงเงื่อนไขกี่ข้อ
    const matchedRules = rules
      .map(rule => {
        const matchCount = rule.conditions.reduce((count, cond) => {
          const value = profile?.[cond.field];
          if (Array.isArray(cond.equals)) {
            return count + (cond.equals.includes(value) ? 1 : 0);
          } else {
            return count + (value === cond.equals ? 1 : 0);
          }
        }, 0);

        return { ...rule, matchCount };
      })
      .filter(r => r.matchCount > 0);

    if (matchedRules.length === 0) {
      return {
        totalAmount: 0,
        matchedRule: null,
        comments: ["No rules matched"]
      };
    }

    // เลือก rule ที่ match เงื่อนไขมากที่สุด
    matchedRules.sort((a, b) => b.matchCount - a.matchCount);
    const topRule = matchedRules[0];

    return {
      totalAmount: topRule.amount || 0,
      matchedRule: topRule.id,
      comments: [`Matched rule: ${topRule.id}, matched ${topRule.matchCount}/${topRule.conditions.length} conditions, amount: ${topRule.amount || 0}`]
    };
  });
}
