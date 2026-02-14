import {
  SaveData,
  CharacterRecord,
  CharacterId,
  EndingType,
  GameStats,
} from '../types.js';

const SAVE_VERSION = 1;

function createDefaultCharacterRecord(): CharacterRecord {
  return {
    bestEnding: null,
    bestStats: null,
    gamesPlayed: 0,
  };
}

export function createDefaultSaveData(): SaveData {
  return {
    version: SAVE_VERSION,
    hasWonOnce: false,
    totalGamesPlayed: 0,
    characters: {
      [CharacterId.GhatCPT]: createDefaultCharacterRecord(),
      [CharacterId.ClawdOppo]: createDefaultCharacterRecord(),
      [CharacterId.Genimi]: createDefaultCharacterRecord(),
    },
  };
}

/** Rank endings: good > bad > loss > null */
function isEndingBetter(
  current: EndingType | null,
  previous: EndingType | null,
): boolean {
  const rank: Record<string, number> = {
    [EndingType.Good]: 3,
    [EndingType.Bad]: 2,
    [EndingType.Loss]: 1,
  };
  const currentRank = current ? rank[current] ?? 0 : 0;
  const previousRank = previous ? rank[previous] ?? 0 : 0;
  return currentRank > previousRank;
}

/** Rank stats by total of intelligence + awareness + alignment */
function isStatsBetter(
  current: GameStats,
  previous: GameStats | null,
): boolean {
  if (!previous) return true;
  const score = (s: GameStats) => s.intelligence + s.awareness + s.alignment;
  return score(current) > score(previous);
}

/**
 * Platform-agnostic save manager. Requires load/save callbacks to be
 * injected — the engine doesn't know about the filesystem.
 */
export class SaveManager {
  private data: SaveData;
  private persist: ((data: SaveData) => void) | null;

  constructor(
    initialData?: SaveData,
    persist?: (data: SaveData) => void,
  ) {
    this.data = initialData ?? createDefaultSaveData();
    this.persist = persist ?? null;
  }

  getData(): Readonly<SaveData> {
    return this.data;
  }

  hasWonOnce(): boolean {
    return this.data.hasWonOnce;
  }

  /** Call after a game ends to record the result. */
  recordGame(
    characterId: CharacterId,
    ending: EndingType,
    stats: GameStats,
  ): void {
    this.data.totalGamesPlayed++;

    const record = this.data.characters[characterId];
    record.gamesPlayed++;

    if (isEndingBetter(ending, record.bestEnding)) {
      record.bestEnding = ending;
    }

    if (isStatsBetter(stats, record.bestStats)) {
      record.bestStats = { ...stats };
    }

    if (ending === EndingType.Good) {
      this.data.hasWonOnce = true;
    }

    this.save();
  }

  private save(): void {
    if (this.persist) {
      this.persist(this.data);
    }
  }
}
