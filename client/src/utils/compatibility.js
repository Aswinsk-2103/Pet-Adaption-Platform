export function calcCompatibility(lifestyle, pet) {
  if (!lifestyle || !pet) return 0;
  let score = 0;

  const actMap = { low: 1, moderate: 2, high: 3 };
  const userAct = actMap[lifestyle.activityLevel] || 2;
  const petAct  = actMap[pet.activityLevel]       || 2;
  const actDiff = Math.abs(userAct - petAct);
  score += actDiff === 0 ? 1 : actDiff === 1 ? 0.5 : 0;

  if (!lifestyle.hasChildren || pet.goodWithKids)  score += 1;
  if (!lifestyle.hasOtherPets || pet.goodWithPets) score += 1;

  const expMap = { beginner: 1, intermediate: 2, experienced: 3 };
  const userExp = expMap[lifestyle.experience] || 1;
  const petNeed = petAct;
  score += userExp >= petNeed ? 1 : 0.5;

  return Math.round((score / 4) * 100);
}
