import type { Attributes, AttributeId } from '../types';

export const ATTRIBUTE_LABELS: Record<AttributeId, string> = {
  maxHealth:'生命上限', maxStamina:'體力上限', mobility:'移動能力', melee:'近身戰技', endurance:'身體耐力', climate:'環境適應',
  observation:'觀察力', reasoning:'推理能力', memory:'記憶能力', focus:'專注能力', adaptability:'臨機應變', planning:'規劃能力',
  persuasion:'說服能力', deception:'欺瞞能力', negotiation:'談判能力', empathy:'同理能力', intimidation:'威嚇能力', resilience:'心理韌性',
};
export const INITIAL_ATTRIBUTES: Attributes = Object.fromEntries(Object.keys(ATTRIBUTE_LABELS).map(k => [k, 0])) as unknown as Attributes;
