class levelScene extends Phaser.Scene {
  constructor() {
    super('level'); // NAMA SCENE
  }

  preload() {
    this.load.image('bgLevel', 'asset/Level.png');
    this.load.image('garis', 'asset/garis.png');
    this.load.image('TEXTLEVEL', 'asset/TEXT LEVEL.png');
    this.load.image('tombolback', 'asset/tombolback.png');
    //preload button level
    this.load.image('levelpijak', 'asset/levelpijak.png');
    this.load.image('levellock', 'asset/levellock.png');
  }

  create() {
    const { width, height } = this.scale;

    // background level
    this.add.image(width / 2, height / 2, 'bgLevel')
      .setDisplaySize(width, height);

 const garis = this.add.image(
  width / 2,
  height * 0.60,
  'garis'
)
.setScale(1.0)
.setAlpha(1); // atau bisa dihapus karena default = 1

 const TEXTLEVEL = this.add.image(
  width / 2,
  height * 0.17,
  'TEXTLEVEL'
)
.setScale(0.50)
.setAlpha(1); // atau bisa dihapus karena default = 1


// === BUTTON IMAGE ===
 const tombolback = this.add.image(
  width * 0.055,
  height * 0.080,
  'tombolback'
)
.setScale(0.13)
.setInteractive({ useHandCursor: true });

// scale awal & hover
const normalScale = 0.13;
const hoverScale = 0.135;

let hoverTween = null;

tombolback.on('pointerover', () => {
  if (hoverTween) hoverTween.stop();

  hoverTween = this.tweens.add({
    targets: tombolback,
    scale: hoverScale,
    duration: 150,
    ease: 'Back.Out'
  });
});

tombolback.on('pointerout', () => {
  if (hoverTween) hoverTween.stop();

  hoverTween = this.tweens.add({
    targets: tombolback,
    scale: normalScale,
    duration: 120,
    ease: 'Back.In'
  });
});

// klik
tombolback.on('pointerdown', () => {
  this.scene.start('menu'); // 🔥 PINDAH SCENE
});


//=================================tombol level untuk game================================//

// tombol level1
    const levelpijak = this.add.image(175 / 2, 235, 'levelpijak')
        .setDepth(10)
        .setInteractive()
        .setScale(0.13);

        levelpijak .on('pointerover', () => {
        this.tweens.add({
            targets: levelpijak ,
            scale: 0.14,
            duration: 200,
            ease: 'Power2'
        });
    });
        
    levelpijak .on('pointerout', () => {
        this.tweens.add({
            targets: levelpijak ,
            scale: 0.13,
            duration: 200,
            ease: 'Power2'
        });
    });

    levelpijak.on('pointerdown', () => {
        this.scene.start('gameplay');
    });



 // tombol level2
    const levellock = this.add.image(600 / 2, 235, 'levellock')
        .setDepth(10)
        .setScale(0.13);

    //level satu terbuka
    let unlocked2 = this.registry.get('level1Cleared') || localStorage.getItem('level1Cleared') === 'true';

    if (unlocked2) {
        //untuk kalau sudah menang level1  baru kebuka
        levellock.setInteractive();

        levellock.on('pointerdown', () => {
            this.scene.start('');
        });

        //animasi
        levellock.on('pointerover', () => {
            this.tweens.add({ targets: level2, scale: 0.14, duration: 200, ease: 'Power2' });
        });
        levellock.on('pointerout', () => {
            this.tweens.add({ targets: level2, scale: 0.13, duration: 200, ease: 'Power2' });
        });

    } else {
        //untuk kunci
        levellock.setAlpha(1);
        this.add.text(levellock.x, levellock.y + 60,)
            .setOrigin(0.5);
    }









  }
}

