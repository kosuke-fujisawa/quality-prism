import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScenarioLoader } from './ScenarioLoader';

// Fetch APIをモック
(globalThis as any).fetch = vi.fn();

describe('ScenarioLoader', () => {
  beforeEach(() => {
    // テスト前にキャッシュをクリア
    ScenarioLoader.clearCache();
    vi.resetAllMocks();
  });

  describe('loadScenario', () => {
    it('should load a valid YAML scenario', async () => {
      const mockYamlContent = `
route: opening
scene: 1
background: title_bg.jpg
bgm: opening_theme.mp3
characters:
  - id: narrator
    name: "ナレーター"
    position: center
    sprite: null
default_speaker: narrator
texts:
  - speaker: narrator
    content:
      - "品質のプリズム"
      - "それぞれが異なる視点から、品質の本質を探求していく。"
  - speaker: mentor
    content: "ソフトウェア開発の世界で、品質とは何かを問いかける物語。"
    sprite: mentor_thinking.png
`;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockYamlContent)
      });

      const scenario = await ScenarioLoader.loadScenario('opening', 1);

      expect(scenario).toBeTruthy();
      expect(scenario?.route).toBe('opening');
      expect(scenario?.scene).toBe(1);
      expect(scenario?.background).toBe('title_bg.jpg');
      expect(scenario?.bgm).toBe('opening_theme.mp3');
      expect(scenario?.characters).toHaveLength(1);
      expect(scenario?.characters[0].id).toBe('narrator');
      expect(scenario?.default_speaker).toBe('narrator');
      
      // テキストが正規化されていることを確認
      expect(scenario?.texts).toHaveLength(3); // 配列が展開される
      expect(scenario?.texts[0].speaker).toBe('narrator');
      expect(scenario?.texts[0].content).toBe('品質のプリズム');
      expect(scenario?.texts[1].content).toBe('それぞれが異なる視点から、品質の本質を探求していく。');
      expect(scenario?.texts[2].speaker).toBe('mentor');
      expect(scenario?.texts[2].sprite).toBe('mentor_thinking.png');
    });

    it('should handle file not found', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const scenario = await ScenarioLoader.loadScenario('nonexistent', 1);
      expect(scenario).toBeNull();
    });

    it('should handle YAML parsing errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('invalid: yaml: content:')
      });

      const scenario = await ScenarioLoader.loadScenario('invalid', 1);
      expect(scenario).toBeNull();
    });

    it('should use cache for repeated requests', async () => {
      const mockYamlContent = `
route: test
scene: 1
texts:
  - speaker: narrator
    content: "test"
`;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockYamlContent)
      });

      // 最初の呼び出し
      const scenario1 = await ScenarioLoader.loadScenario('test', 1);
      expect(scenario1).toBeTruthy();

      // 2回目の呼び出し（キャッシュから）
      const scenario2 = await ScenarioLoader.loadScenario('test', 1);
      expect(scenario2).toBeTruthy();

      // fetchは1回だけ呼ばれる
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(scenario1).toBe(scenario2); // 同じオブジェクト参照
    });

    it('should handle texts as simple strings with default_speaker', async () => {
      const mockYamlContent = `
route: simple
scene: 1
default_speaker: narrator
texts:
  - "Simple text 1"
  - "Simple text 2"
`;

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockYamlContent)
      });

      const scenario = await ScenarioLoader.loadScenario('simple', 1);
      
      expect(scenario?.texts).toHaveLength(2);
      expect(scenario?.texts[0].speaker).toBe('narrator');
      expect(scenario?.texts[0].content).toBe('Simple text 1');
      expect(scenario?.texts[1].speaker).toBe('narrator');
      expect(scenario?.texts[1].content).toBe('Simple text 2');
    });

    it('should generate correct filename for scene 0', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await ScenarioLoader.loadScenario('opening', 0);
      
      expect(fetch).toHaveBeenCalledWith('/scenarios/opening.yaml');
    });

    it('should generate correct filename for scene > 0', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await ScenarioLoader.loadScenario('route1', 5);
      
      expect(fetch).toHaveBeenCalledWith('/scenarios/route1_5.yaml');
    });
  });

  describe('clearCache', () => {
    it('should clear the scenario cache', async () => {
      const mockYamlContent = `
route: test
scene: 1
texts:
  - speaker: narrator
    content: "test"
`;

      (fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockYamlContent)
      });

      // シナリオをロードしてキャッシュに保存
      await ScenarioLoader.loadScenario('test', 1);
      expect(fetch).toHaveBeenCalledTimes(1);

      // キャッシュをクリア
      ScenarioLoader.clearCache();

      // 再度ロード（fetchが再実行される）
      await ScenarioLoader.loadScenario('test', 1);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});