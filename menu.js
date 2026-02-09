class menuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  preload() {
    this.load.image('bg', 'asset/BG MAIN MENU.png');
    this.load.image('btnPlay', 'asset/TOMBOL PLAY.png'); // tombol
    this.load.image('title', 'asset/title.png');

  }

  create() {
    const { width, height } = this.scale;

    // background
    this.add.image(width / 2, height / 2, 'bg')
      .setDisplaySize(width, height);

    // === BUTTON IMAGE ===
 const playBtn = this.add.image(
  width / 2,
  height * 0.62,
  'btnPlay'
)
.setScale(0.5)
.setInteractive({ useHandCursor: true });

// scale awal & hover
const normalScale = 0.5;
const hoverScale = 0.52;

let hoverTween = null;

playBtn.on('pointerover', () => {
  if (hoverTween) hoverTween.stop();

  hoverTween = this.tweens.add({
    targets: playBtn,
    scale: hoverScale,
    duration: 150,
    ease: 'Back.Out'
  });
});

playBtn.on('pointerout', () => {
  if (hoverTween) hoverTween.stop();

  hoverTween = this.tweens.add({
    targets: playBtn,
    scale: normalScale,
    duration: 120,
    ease: 'Back.In'
  });
});

// klik
playBtn.on('pointerdown', () => {
  this.scene.start('level'); // 🔥 PINDAH SCENE
});



// === JUDUL GAMBAR ===
const title = this.add.image(
  width / 2,
  height * 0.38,
  'title'
)
.setScale(1.0)
.setAlpha(0);

// animasi masuk (turun dikit + fade)
this.tweens.add({
  targets: title,
  y: height * 0.38,
  alpha: 1,
  duration: 600,
  ease: 'Power3'
});





  }
}

const config = {
  type: Phaser.AUTO,
  width: 1344,
  height: 810,
  scene: [menuScene, levelScene],
};

new Phaser.Game(config);
