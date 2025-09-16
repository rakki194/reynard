import type { AgentEntity } from "../types";

// Generate mock agent data
export function generateMockAgent(id: string, spirit: string, style: string): AgentEntity {
  const spirits = ["fox", "wolf", "otter", "eagle", "lion", "dolphin"];
  const actualSpirit = spirits.includes(spirit) ? spirit : spirits[Math.floor(Math.random() * spirits.length)];

  return {
    id,
    name: `${actualSpirit.charAt(0).toUpperCase() + actualSpirit.slice(1)}-${style.charAt(0).toUpperCase() + style.slice(1)}-${Math.floor(Math.random() * 100)}`,
    spirit: actualSpirit,
    style,
    position: {
      x: Math.random() * 800 + 50,
      y: Math.random() * 600 + 50,
    },
    age: Math.floor(Math.random() * 50) + 1,
    maturityAge: 18,
    traits: {
      personality: {
        dominance: Math.random(),
        independence: Math.random(),
        patience: Math.random(),
        aggression: Math.random(),
        charisma: Math.random(),
        creativity: Math.random(),
        perfectionism: Math.random(),
        adaptability: Math.random(),
        playfulness: Math.random(),
        intelligence: Math.random(),
        loyalty: Math.random(),
        curiosity: Math.random(),
        courage: Math.random(),
        empathy: Math.random(),
        determination: Math.random(),
        spontaneity: Math.random(),
      },
      physical: {
        size: Math.random(),
        strength: Math.random(),
        agility: Math.random(),
        endurance: Math.random(),
        appearance: Math.random(),
        grace: Math.random(),
        speed: Math.random(),
        coordination: Math.random(),
        stamina: Math.random(),
        flexibility: Math.random(),
        reflexes: Math.random(),
        vitality: Math.random(),
      },
      abilities: {
        strategist: Math.random(),
        hunter: Math.random(),
        teacher: Math.random(),
        artist: Math.random(),
        healer: Math.random(),
        inventor: Math.random(),
        explorer: Math.random(),
        guardian: Math.random(),
        diplomat: Math.random(),
        warrior: Math.random(),
        scholar: Math.random(),
        performer: Math.random(),
        builder: Math.random(),
        navigator: Math.random(),
        communicator: Math.random(),
        leader: Math.random(),
      },
    },
    lineage: {
      parents: [],
      children: [],
      ancestors: [],
      descendants: [],
    },
  };
}
