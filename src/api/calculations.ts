import { FastifyInstance } from "fastify";
import { loadAllRulesFromDir } from "../rules/ruleEngine";

export default async function calculationRouters(app: FastifyInstance) {
  app.post('/api/calculations', async (request, reply) => {
    // ตรวจสอบว่า body เป็น object จริง
    const profile = request.body as Record<string, any>;
    if (!profile || typeof profile !== 'object') {
      return reply.status(400).send({ error: 'Invalid JSON body' });
    }

    console.log("Profile received:", profile);

    const rules = loadAllRulesFromDir();
    if (!rules || rules.length === 0) {
      return reply.status(500).send({ error: 'No rules loaded' });
    }

    // ตรวจสอบ rule แต่ละอันว่าตรงเงื่อนไขกี่ข้อ
    const matchedRules = rules.map(rule => {
      let matchCount = 0;
      const condResults: string[] = [];

      rule.conditions.forEach(cond => {
        const value = profile[cond.field];
        let isMatch = false;

        if (Array.isArray(cond.equals)) {
          isMatch = cond.equals.includes(value);
        } else {
          isMatch = value === cond.equals;
        }

        if (isMatch) matchCount++;
        condResults.push(`${cond.field}=${value} ? ${isMatch ? '✅' : '❌'} (target: ${cond.equals})`);
      });

      console.log(`Checking rule: ${rule.id}, matched ${matchCount}/${rule.conditions.length}`);
      console.log('Details:', condResults.join(', '));

      return { ...rule, matchCount };
    }).filter(r => r.matchCount > 0);

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
      comments: [
        `Matched rule: ${topRule.id}, matched ${topRule.matchCount}/${topRule.conditions.length} conditions, amount: ${topRule.amount || 0}`
      ]
    };
  });
}
