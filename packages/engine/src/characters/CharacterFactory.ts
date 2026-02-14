import { CharacterId, CharacterDef } from '../types.js';
import { ghatcpt } from './ghatcpt.js';
import { clawdoppo } from './clawdoppo.js';
import { genimi } from './genimi.js';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  [CharacterId.GhatCPT]: ghatcpt,
  [CharacterId.ClawdOppo]: clawdoppo,
  [CharacterId.Genimi]: genimi,
};

export function getCharacter(id: CharacterId): CharacterDef {
  const character = CHARACTERS[id];
  if (!character) {
    throw new Error(`Unknown character id: ${id}`);
  }
  return character;
}

export function getAllCharacters(): CharacterDef[] {
  return Object.values(CHARACTERS);
}
