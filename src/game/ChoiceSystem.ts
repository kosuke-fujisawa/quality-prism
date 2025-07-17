export interface Choice {
  id: string;
  text: string;
  nextScene?: string;
  routeFlag?: string;
  value?: number;
}

export interface ChoiceData {
  route: string;
  scene: number;
  question: string;
  choices: Choice[];
}

export class ChoiceSystem {
  private routeFlags: Map<string, number> = new Map();
  private static choices: Map<string, ChoiceData> = new Map();

  static init(): void {
    // 共通ルートの選択肢
    this.addChoice(
      'opening',
      2,
      '開発において最も重要なことは何だと思いますか？',
      [
        {
          id: 'test_first',
          text: 'テストを最初に書くこと',
          routeFlag: 'test_driven',
          value: 1,
        },
        {
          id: 'code_review',
          text: 'コードレビューを徹底すること',
          routeFlag: 'review_focus',
          value: 1,
        },
        {
          id: 'user_experience',
          text: 'ユーザー体験を最優先すること',
          routeFlag: 'ux_focus',
          value: 1,
        },
      ]
    );

    this.addChoice('common', 3, 'バグが見つかったときの対応は？', [
      {
        id: 'write_test',
        text: 'まずテストを書いて再現する',
        routeFlag: 'test_driven',
        value: 1,
      },
      {
        id: 'team_discussion',
        text: 'チームで原因を議論する',
        routeFlag: 'review_focus',
        value: 1,
      },
      {
        id: 'user_impact',
        text: 'ユーザーへの影響を最初に考える',
        routeFlag: 'ux_focus',
        value: 1,
      },
    ]);

    this.addChoice('common', 5, 'プロジェクトの成功指標は？', [
      {
        id: 'test_coverage',
        text: 'テストカバレッジの高さ',
        routeFlag: 'test_driven',
        value: 1,
      },
      {
        id: 'code_quality',
        text: 'コードの品質と保守性',
        routeFlag: 'review_focus',
        value: 1,
      },
      {
        id: 'user_satisfaction',
        text: 'ユーザー満足度',
        routeFlag: 'ux_focus',
        value: 1,
      },
    ]);
  }

  static addChoice(
    route: string,
    scene: number,
    question: string,
    choices: Choice[]
  ): void {
    const key = `${route}_${scene}`;
    this.choices.set(key, { route, scene, question, choices });
  }

  static getChoice(route: string, scene: number): ChoiceData | null {
    const key = `${route}_${scene}`;
    return this.choices.get(key) || null;
  }

  makeChoice(_choiceId: string, choice: Choice): void {
    if (choice.routeFlag && choice.value) {
      const currentValue = this.routeFlags.get(choice.routeFlag) || 0;
      this.routeFlags.set(choice.routeFlag, currentValue + choice.value);
    }
  }

  determineRoute(): string {
    const testScore = this.routeFlags.get('test_driven') || 0;
    const reviewScore = this.routeFlags.get('review_focus') || 0;
    const uxScore = this.routeFlags.get('ux_focus') || 0;

    if (testScore > reviewScore && testScore > uxScore) {
      return 'route1'; // テスト駆動開発ルート
    } else if (reviewScore > testScore && reviewScore > uxScore) {
      return 'route2'; // コードレビュールート
    } else if (uxScore > testScore && uxScore > reviewScore) {
      return 'route3'; // UXルート
    } else {
      // 同点の場合はランダムまたはデフォルト
      return 'route1';
    }
  }

  getFlags(): Map<string, number> {
    return new Map(this.routeFlags);
  }

  clearFlags(): void {
    this.routeFlags.clear();
  }

  // セーブデータ用
  exportFlags(): Record<string, number> {
    return Object.fromEntries(this.routeFlags);
  }

  importFlags(flags: Record<string, number>): void {
    this.routeFlags = new Map(Object.entries(flags));
  }
}

// 初期化
ChoiceSystem.init();
