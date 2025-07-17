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

  static async loadScenario(route: string, scene: number): Promise<Scenario | null> {
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
      
      if (scenarioData.texts) {
        for (const textItem of scenarioData.texts) {
          if (typeof textItem === 'string') {
            // 単純な文字列の場合はdefault_speakerを使用
            normalizedTexts.push({
              speaker: defaultSpeaker,
              content: textItem
            });
          } else if (textItem.content) {
            if (Array.isArray(textItem.content)) {
              // 配列の場合は複数のテキストに展開
              for (const content of textItem.content) {
                normalizedTexts.push({
                  speaker: textItem.speaker || defaultSpeaker,
                  content: content,
                  sprite: textItem.sprite,
                  voice: textItem.voice
                });
              }
            } else {
              // 単一のcontentの場合
              normalizedTexts.push({
                speaker: textItem.speaker || defaultSpeaker,
                content: textItem.content,
                sprite: textItem.sprite,
                voice: textItem.voice
              });
            }
          }
        }
      }
      
      const scenario: Scenario = {
        route: scenarioData.route || route,
        scene: scenarioData.scene || scene,
        background: scenarioData.background,
        bgm: scenarioData.bgm,
        characters: scenarioData.characters || [],
        texts: normalizedTexts,
        default_speaker: defaultSpeaker
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