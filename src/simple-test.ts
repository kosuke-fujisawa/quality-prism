console.log('Simple test loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');

  const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas');
  console.log('Canvas found:', !!canvas);

  if (canvas) {
    canvas.addEventListener('click', () => {
      console.log('Canvas clicked!');
      alert('Canvas clicked!');
    });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText('Click me!', 300, 300);
    }
  }

  document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.key);
    alert('Key pressed: ' + e.key);
  });
});
