import { describe, it, expect, beforeEach } from 'vitest';
import { ChoiceSystem } from './ChoiceSystem';

describe('ChoiceSystem', () => {
  let choiceSystem: ChoiceSystem;

  beforeEach(() => {
    choiceSystem = new ChoiceSystem();
    choiceSystem.clearFlags();
  });

  describe('選択肢の取得', () => {
    it('存在する選択肢を取得できる', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);

      expect(choice).toBeTruthy();
      expect(choice?.route).toBe('opening');
      expect(choice?.scene).toBe(2);
      expect(choice?.question).toBe(
        '開発において最も重要なことは何だと思いますか？'
      );
      expect(choice?.choices).toHaveLength(3);
    });

    it('存在しない選択肢はnullを返す', () => {
      const choice = ChoiceSystem.getChoice('nonexistent', 1);
      expect(choice).toBeNull();
    });

    it('共通ルートの選択肢を取得できる', () => {
      const choice = ChoiceSystem.getChoice('common', 3);

      expect(choice).toBeTruthy();
      expect(choice?.question).toBe('バグが見つかったときの対応は？');
      expect(choice?.choices).toHaveLength(3);
    });
  });

  describe('選択肢の処理', () => {
    it('選択によってフラグが更新される', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);
      const selectedChoice = choice!.choices[0]; // test_driven

      choiceSystem.makeChoice('test_choice', selectedChoice);

      const flags = choiceSystem.getFlags();
      expect(flags.get('test_driven')).toBe(1);
    });

    it('同じフラグの選択を複数回行うと累積される', () => {
      const choice1 = ChoiceSystem.getChoice('opening', 2);
      const choice2 = ChoiceSystem.getChoice('common', 3);

      choiceSystem.makeChoice('choice1', choice1!.choices[0]); // test_driven +1
      choiceSystem.makeChoice('choice2', choice2!.choices[0]); // test_driven +1

      const flags = choiceSystem.getFlags();
      expect(flags.get('test_driven')).toBe(2);
    });

    it('異なるフラグが独立して管理される', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);

      choiceSystem.makeChoice('choice1', choice!.choices[0]); // test_driven
      choiceSystem.makeChoice('choice2', choice!.choices[1]); // review_focus
      choiceSystem.makeChoice('choice3', choice!.choices[2]); // ux_focus

      const flags = choiceSystem.getFlags();
      expect(flags.get('test_driven')).toBe(1);
      expect(flags.get('review_focus')).toBe(1);
      expect(flags.get('ux_focus')).toBe(1);
    });
  });

  describe('ルート決定', () => {
    it('test_drivenが最も高い場合route1になる', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);

      // test_drivenを2回選択
      choiceSystem.makeChoice('choice1', choice!.choices[0]);
      choiceSystem.makeChoice('choice2', choice!.choices[0]);

      // 他を1回ずつ
      choiceSystem.makeChoice('choice3', choice!.choices[1]);

      const route = choiceSystem.determineRoute();
      expect(route).toBe('route1');
    });

    it('review_focusが最も高い場合route2になる', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);

      // review_focusを2回選択
      choiceSystem.makeChoice('choice1', choice!.choices[1]);
      choiceSystem.makeChoice('choice2', choice!.choices[1]);

      // 他を1回ずつ
      choiceSystem.makeChoice('choice3', choice!.choices[0]);

      const route = choiceSystem.determineRoute();
      expect(route).toBe('route2');
    });

    it('ux_focusが最も高い場合route3になる', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);

      // ux_focusを2回選択
      choiceSystem.makeChoice('choice1', choice!.choices[2]);
      choiceSystem.makeChoice('choice2', choice!.choices[2]);

      // 他を1回ずつ
      choiceSystem.makeChoice('choice3', choice!.choices[0]);

      const route = choiceSystem.determineRoute();
      expect(route).toBe('route3');
    });

    it('同点の場合はroute1をデフォルトとする', () => {
      // 何も選択しない場合
      const route = choiceSystem.determineRoute();
      expect(route).toBe('route1');
    });

    it('全て同点の場合もroute1をデフォルトとする', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);

      // 全てを1回ずつ選択
      choiceSystem.makeChoice('choice1', choice!.choices[0]);
      choiceSystem.makeChoice('choice2', choice!.choices[1]);
      choiceSystem.makeChoice('choice3', choice!.choices[2]);

      const route = choiceSystem.determineRoute();
      expect(route).toBe('route1');
    });
  });

  describe('フラグ管理', () => {
    it('フラグをクリアできる', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);
      choiceSystem.makeChoice('test', choice!.choices[0]);

      expect(choiceSystem.getFlags().get('test_driven')).toBe(1);

      choiceSystem.clearFlags();
      expect(choiceSystem.getFlags().get('test_driven')).toBeUndefined();
    });

    it('フラグをエクスポートできる', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);
      choiceSystem.makeChoice('choice1', choice!.choices[0]);
      choiceSystem.makeChoice('choice2', choice!.choices[1]);

      const exported = choiceSystem.exportFlags();
      expect(exported).toEqual({
        test_driven: 1,
        review_focus: 1,
      });
    });

    it('フラグをインポートできる', () => {
      const flags = {
        test_driven: 3,
        review_focus: 2,
        ux_focus: 1,
      };

      choiceSystem.importFlags(flags);

      const currentFlags = choiceSystem.getFlags();
      expect(currentFlags.get('test_driven')).toBe(3);
      expect(currentFlags.get('review_focus')).toBe(2);
      expect(currentFlags.get('ux_focus')).toBe(1);
    });
  });

  describe('選択肢の内容確認', () => {
    it('opening_2の選択肢が正しく設定されている', () => {
      const choice = ChoiceSystem.getChoice('opening', 2);

      expect(choice!.choices[0]).toEqual({
        id: 'test_first',
        text: 'テストを最初に書くこと',
        routeFlag: 'test_driven',
        value: 1,
      });

      expect(choice!.choices[1]).toEqual({
        id: 'code_review',
        text: 'コードレビューを徹底すること',
        routeFlag: 'review_focus',
        value: 1,
      });

      expect(choice!.choices[2]).toEqual({
        id: 'user_experience',
        text: 'ユーザー体験を最優先すること',
        routeFlag: 'ux_focus',
        value: 1,
      });
    });

    it('common_3の選択肢が正しく設定されている', () => {
      const choice = ChoiceSystem.getChoice('common', 3);

      expect(choice!.choices[0]).toEqual({
        id: 'write_test',
        text: 'まずテストを書いて再現する',
        routeFlag: 'test_driven',
        value: 1,
      });
    });
  });
});
