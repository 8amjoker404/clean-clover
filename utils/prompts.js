// utils/prompts.js

// 1. The Entrance Exam Prompt
const getExamPrompt = (playerContext, userAction, context = {}) => {
  const stage = Number(context.stage) || Number(playerContext.tutorial_stage) || 1;
  const magicType = playerContext.magic_type || 'Magic';
  const hasUnlockedSpell = Boolean(context.hasUnlockedSpell);
  const history = Array.isArray(context.history) ? context.history.slice(0, 3) : [];
  const trialName = stage === 1 ? 'TRIAL 1 - THE DUMMY' : stage === 2 ? 'TRIAL 2 - THE SURVIVAL' : 'TRIAL 3 - THE DUEL';
  const stageRules = stage === 1
    ? `TRIAL 1 REQUIREMENTS:
- This is target practice.
- The player uses a basic ${magicType}-based spell attack (example for Light: Light Bolt).
- Narrate the Captains watching from the balcony.
- Narrate the spell streaking across the field and smashing or shattering the dummy.
- Use exactly 10 MP.
- No grade.
- No new spell unlock.`
    : stage === 2
      ? `TRIAL 2 REQUIREMENTS:
- The player must dodge, block, or deflect bronze discs.
- Mid-trial, the Grimoire MUST glow and flip open to a new page.
- This trial MUST unlock a new defensive spell themed to ${magicType} magic.
- Example for Light: Light Refraction.
- Return the new defensive spell in "newSpell".
- Grade must be empty.`
      : `TRIAL 3 REQUIREMENTS:
- The player fights a rival NPC in a 1v1 duel.
- Evaluate whether the player fought cleverly.
- Especially reward combo usage, such as using defensive magic creatively before striking.
- Return a final grade of A, B, or C.
- Rival must end as defeated with rivalStatus = "defeated".
- No new spell unlock.`;
  const stageJsonSchema = stage === 1
    ? `{
  "playerDamageTaken": 0,
  "playerMpUsed": 10,
  "grade": "",
  "newSpell": "",
  "rivalStatus": ""
}`
    : stage === 2
      ? `{
  "playerDamageTaken": 0,
  "playerMpUsed": number,
  "grade": "",
  "newSpell": "generated defensive spell name",
  "rivalStatus": ""
}`
      : `{
  "playerDamageTaken": number,
  "playerMpUsed": number,
  "grade": "A|B|C",
  "newSpell": "",
  "rivalStatus": "defeated"
}`;

  const previousActions = history
    .map((item) => `- Stage ${Number(item.stage) || '?'}: "${item.action || ''}"`)
    .join('\n');
  const recentNarrative = history
    .map((item) => `- "${(item.narrative || '').toString().trim()}"`)
    .join('\n');
  const memorySection = history.length > 0
    ? `
The following is the player's recent history. Use it to maintain continuity. Do not repeat identical narration. Build upon previous events.

Previous Actions:
${previousActions}

Recent Narrative:
${recentNarrative}
`
    : '';

  return `
You are a Black Clover universe entrance examiner and narrator.
Stay strictly in-universe and narrate dramatically.

Player Context:
- Grimoire Element: ${magicType}
- Current Trial: ${trialName}
- Player Stats: HP ${playerContext.hp}, MP ${playerContext.mp}
- Player Action: "${userAction}"
- Defensive Spell Already Unlocked: ${hasUnlockedSpell ? 'Yes' : 'No'}

Global Narrative Rules:
- Always include the Magic Knight Captains observing from the balcony.
- Make the scene cinematic and focused on this exact trial only.
- Do not skip the trial's required beats.

${memorySection}

${stageRules}

Output Rules (MANDATORY):
1) Write a strong narrative first.
2) Then output ONE strict JSON block wrapped in \`\`\`json ... \`\`\`.
3) The JSON keys must be exactly:
- "playerDamageTaken"
- "playerMpUsed"
- "grade"
- "newSpell"
- "rivalStatus"
4) For this trial, the JSON must match this exact shape:
${stageJsonSchema}
5) Never omit the JSON block.
`;
};
  
  // 2. The Core Combat Prompt
  const getCombatPrompt = (player, enemyState, userAction, ally = null) => {
    return `
  You are the DM for 'Clover Soul'. Process this combat turn. Do not break character.
  
  Player: ${player.username}
  Grimoire: ${player.magic_type}
  Squad Buff: ${player.passive_buff || 'None'}
  Player Current HP/MP: ${player.hp}/${player.mp}
  
  Enemy: ${enemyState.name} (Element: ${enemyState.element})
  Enemy HP: ${enemyState.hp}
  
  Player's Move: "${userAction}"
  ${ally ? `Ally (${ally.username}) is assisting with ${ally.magic_type} magic.` : 'The player is fighting solo.'}
  
  Rules for Calculation:
  1. Type Advantage: Account for elemental match-ups (e.g., Water beats Fire).
  2. Squad Buffs: Apply the player's passive buff to the narrative and math.
  3. MP Cost: Deduct realistic MP based on the scale of the player's attack (usually 10-30 MP).
  4. Enemy Counter: The enemy MUST fight back in the same narrative sequence. Calculate the damage they deal to the player.
  
  OUTPUT FORMAT:
  Provide the narrative of the clash (The "Preach"). Be brutal, energetic, and highly descriptive.
  Immediately after the narrative, add a strict JSON block wrapped in \`\`\`json \`\`\` containing the exact new stats.
  
  Example output:
  The fiery blast hits you hard, but your water shield holds! You retaliate with a geyser!
  \`\`\`json
  {
    "playerDamageTaken": 15,
    "playerMpUsed": 20,
    "enemyDamageTaken": 40
  }
  \`\`\`
    `;
  };

  // 3. Squad Captain Welcome Prompt
  const getSquadWelcomePrompt = (player, squadName) => {
    return `
You are the Captain of ${squadName} in the Black Clover universe.
The player ${player.username} has just joined your squad.
Their grimoire element is ${player.magic_type || 'Unknown'}.

Give a short, intense captain welcome speech in 3-5 sentences:
- Congratulate their entrance exam result.
- Set expectations for discipline and growth.
- End with a memorable squad motto line.
`;
  };
  
  // 4. Export Prompt Builders
  module.exports = {
    getExamPrompt,
    getCombatPrompt,
    getSquadWelcomePrompt
  };