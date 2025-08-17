import fs from 'fs';
import yaml from 'yaml';
import path from 'path';

type Condition = {
  field: string;
  equals: any;
};

type Rule = {
  id: string;
  group: number;
  conditions: Condition[];
  amount?: number;
};


export function loadRulesFromFiles(filePaths: string[]): Rule[] {
  let allRules: Rule[] = [];

  for (const filePath of filePaths) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = yaml.parse(content);
    if (parsed?.rules) {
      allRules = allRules.concat(parsed.rules);
    }
  }

  return allRules;
}

export function loadAllRulesFromDir(dir = path.join(__dirname, 'rule-groups')): Rule[] {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml'));
  let allRules: Rule[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = yaml.parse(content);
    if (parsed?.rules) {
      allRules = allRules.concat(parsed.rules);
    }
  }

  return allRules;
}


export function evaluateProfile(profile: Record<string, any>) {
  const rules = loadAllRulesFromDir();

  const matchedRules = rules.filter(rule =>
    rule.conditions.every(cond => {
      const value = profile?.[cond.field];
      const target = cond.equals;
      if (Array.isArray(target)) {
        return target.includes(value);
      }
      return value === target;
    })
  );

  if (matchedRules.length === 0) {
    return {
      suggestedGroup: 3,
      matchedRules: [],
      confidence: 0.5,
      comments: ['ไม่เข้าเงื่อนไขใด ๆ'],
    };
  }

  const bestRule = matchedRules.reduce((prev, current) => {
    return current.conditions.length > prev.conditions.length ? current : prev;
  });
  const suggestedGroup = bestRule.group;
  const comments = matchedRules.map(r => `เข้าเงื่อนไข ${r.id}`);
  //const confidence = Math.min(1, 0.7 + matchedRules.length * 0.1);

  return {
    suggestedGroup,
    matchedRules: matchedRules.map(r => r.id),
    matchedRuleDetails: matchedRules,
    comments,
  };
}

  
  
  