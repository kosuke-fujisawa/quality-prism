console.log('Minimal main loaded');

class MinimalApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    console.log('MinimalApp constructor');

    this.canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas')!;
    this.ctx = this.canvas.getContext('2d')!;

    this.setupCanvas();
    this.setupEvents();
    this.showMenu();
  }

  private setupCanvas(): void {
    this.canvas.width = 800;
    this.canvas.height = 600;
  }

  private setupEvents(): void {
    console.log('Setting up events');

    this.canvas.addEventListener('click', (_e) => {
      console.log('Canvas clicked');
      alert('Canvas clicked!');
    });

    document.addEventListener('keydown', (e) => {
      console.log('Key pressed:', e.key);
      if (e.key >= '1' && e.key <= '5') {
        alert('Menu key: ' + e.key);
      }
    });
  }

  private showMenu(): void {
    console.log('Showing menu');

    this.ctx.fillStyle = '#111111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';

    this.ctx.font = '36px Arial';
    this.ctx.fillText('品質のプリズム', 250, 150);

    this.ctx.font = '24px Arial';
    this.ctx.fillText('1. START', 300, 250);
    this.ctx.fillText('2. LOAD', 300, 300);
    this.ctx.fillText('3. GALLERY', 300, 350);

    this.ctx.font = '16px Arial';
    this.ctx.fillText('クリックまたは数字キーでテスト', 300, 550);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, starting minimal app');
  new MinimalApp();
});
