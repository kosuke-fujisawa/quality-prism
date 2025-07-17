import * as yaml from 'js-yaml';

export interface Character {
  id: string;
  name: string;
  position: 'left' | 'center' | 'right';
  sprite: string | null;
}

export interface ScenarioText {
  speaker: string;
  content: string;
  sprite?: string;
  voice?: string;
}

export interface Scenario {
  route: string;
  scene: number;
  background?: string;
  bgm?: string;
  characters: Character[];
  texts: ScenarioText[];
  default_speaker?: string;
}

export class ScenarioLoader {
  private static scenarios: Map<string, Scenario> = new Map();

  static async loadScenario(
    route: string,
    scene: number
  ): Promise<Scenario | null> {
    const key = `${route}_${scene}`;

    if (this.scenarios.has(key)) {
      return this.scenarios.get(key)!;
    }

    try {
      const filename = scene === 0 ? `${route}.yaml` : `${route}_${scene}.yaml`;
      const response = await fetch(`/scenarios/${filename}`);

      if (!response.ok) {
        console.warn(`Scenario file not found: ${filename}`);
        return null;
      }

      const yamlText = await response.text();
      const scenarioData = yaml.load(yamlText) as Record<string, unknown>;

      // テキストの正規化処理
      const normalizedTexts: ScenarioText[] = [];
      const defaultSpeaker = scenarioData.default_speaker || 'narrator';

      if (scenarioData.texts && Array.isArray(scenarioData.texts)) {
        for (const textItem of scenarioData.texts) {
          if (typeof textItem === 'string') {
            // 単純な文字列の場合はdefault_speakerを使用
            normalizedTexts.push({
              speaker: defaultSpeaker as string,
              content: textItem,
            });
          } else if (textItem && typeof textItem === 'object' && 'content' in textItem) {
            const item = textItem as any;
            if (Array.isArray(item.content)) {
              // 配列の場合は複数のテキストに展開
              for (const content of item.content) {
                normalizedTexts.push({
                  speaker: item.speaker || defaultSpeaker as string,
                  content: content as string,
                  sprite: item.sprite as string | undefined,
                  voice: item.voice as string | undefined,
                });
              }
            } else {
              // 単一のcontentの場合
              normalizedTexts.push({
                speaker: item.speaker || defaultSpeaker as string,
                content: item.content as string,
                sprite: item.sprite as string | undefined,
                voice: item.voice as string | undefined,
              });
            }
          }
        }
      }

      const scenario: Scenario = {
        route: scenarioData.route as string || route,
        scene: scenarioData.scene as number || scene,
        background: scenarioData.background as string | undefined,
        bgm: scenarioData.bgm as string | undefined,
        characters: Array.isArray(scenarioData.characters) ? scenarioData.characters as Character[] : [],
        texts: normalizedTexts,
        default_speaker: defaultSpeaker as string,
      };

      this.scenarios.set(key, scenario);
      return scenario;
    } catch (error) {
      console.error(`Failed to load scenario ${route}_${scene}:`, error);
      return null;
    }
  }

  static clearCache(): void {
    this.scenarios.clear();
  }
}
