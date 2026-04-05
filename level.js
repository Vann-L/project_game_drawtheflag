class levelScene extends Phaser.Scene {
  constructor() {
    super('level');
  }

  preload() {
    this.load.image('bgLevel', 'asset/Level.png');
    this.load.image('garis', 'asset/garis.png');
    this.load.image('TEXTLEVEL', 'asset/text_level.png');
    this.load.image('tombolback', 'asset/tombolback.png');

    // preload button level
    this.load.image('levelpijak', 'asset/levelpijak.png'); // current (bisa dimainkan)
    this.load.image('levellock', 'asset/levellock.png');   // locked
    this.load.image('level1', 'asset/level1.png');   // completed
    this.load.image('level2', 'asset/level2.png');   // completed
    this.load.image('level3', 'asset/level3.png');   // completed
    this.load.image('level4', 'asset/level4.png');   // completed
    this.load.image('level5', 'asset/level5.png');   // completed
    this.load.image('level6', 'asset/level6.png');   // completed
    this.load.image('level7', 'asset/level7.png');   // completed
    this.load.image('level8', 'asset/level8.png');   // completed
    this.load.image('level9', 'asset/level9.png');   // completed
    this.load.image('level10', 'asset/level10.png'); // completed
    this.load.image('level11', 'asset/level11.png'); // completed
    this.load.image('level12', 'asset/level12.png'); // completed
    this.load.image('level13', 'asset/level13.png'); // completed
    this.load.image('level14', 'asset/level14.png'); // completed
    this.load.image('level15', 'asset/level15.png'); // completed
    this.load.image('level16', 'asset/level16.png'); // completed
    this.load.image('level17', 'asset/level17.png'); // completed
    this.load.image('level18', 'asset/level18.png'); // completed
    this.load.image('level19', 'asset/level19.png'); // completed
    this.load.image('level20', 'asset/level20.png'); // completed
    this.load.audio('pop', 'asset/pop.mp3');
  }

  // 🔥 FUNGSI PEMBANTU CEK SFX 🔥
  playGlobalSFX(key, config) {
      if (localStorage.getItem('sfx_on') !== 'false') {
          this.sound.play(key, config);
      }
  }

  create() {
    const { width, height } = this.scale;

    // 🔥 CEK STATUS MUSIK SEBELUM NAIKKAN VOLUME BGM 🔥
    let existingBgm = this.sound.get('bgm_menu');
    let isMusicOn = localStorage.getItem('music_on') !== 'false';

    if (existingBgm && isMusicOn) { // Cuma naikkan volume kalau musik ON
        this.tweens.add({
            targets: existingBgm,
            volume: 0.8,    // Balikin ke volume normal
            delay: 0,    // Tunggu 3 detik biar sisa SFX transisi dari menu selesai dulu
            duration: 2000, // Naiknya perlahan selama 2 detik biar epic
            ease: 'Sine.easeInOut'
        });
    }

    // background level
    this.add.image(width / 2, height / 2, 'bgLevel').setDisplaySize(width, height);

    // garis
    this.add.image(width / 2, height * 0.60, 'garis').setScale(1.0);

    // TEXT LEVEL
    this.add.image(width / 2, height * 0.14, 'TEXTLEVEL').setScale(1);

    // tombol back
    const tombolback = this.add.image(width * 0.055, height * 0.080, 'tombolback')
      .setScale(1)
      .setInteractive({ useHandCursor: true });

    tombolback.on('pointerover', () => { tombolback.setTint(0xeeeeee); });
    tombolback.on('pointerout', () => { tombolback.clearTint(); });

    tombolback.on('pointerdown', () => {
      this.playGlobalSFX('pop'); // 🔥 PAKAI FUNGSI CEK SFX
      tombolback.setTint(0xeeeeee);

      this.tweens.add({ targets: tombolback, scale: 0.115, duration: 80, yoyo: true, ease: 'Quad.easeOut' });

      // Matikan BGM sepenuhnya kalau mau balik ke menu biar di menu mulai baru lagi
      // atau biarkan saja kalau mau lanjut terus
      this.scene.start('menu'); 
    });

    tombolback.on('pointerup', () => { tombolback.setTint(0xdddddd); });

    // ======================= LOGIKA LEVEL =======================

    const TOTAL_LEVEL = 20; 

    // Ambil data level dari localStorage
    let levelData = JSON.parse(localStorage.getItem('levelData')) || this.createDefaultLevelData(TOTAL_LEVEL);

    if (Object.keys(levelData).length !== TOTAL_LEVEL) {
        levelData = this.createDefaultLevelData(TOTAL_LEVEL);
    }

    const levelPositions = [
      { x: width * 0.06, y: height * 0.252 }, { x: width * 0.28, y: height * 0.252 }, { x: width * 0.50, y: height * 0.252 }, { x: width * 0.72, y: height * 0.252 }, { x: width * 0.945, y: height * 0.341 },
      { x: width * 0.84, y: height * 0.417 }, { x: width * 0.62, y: height * 0.417 }, { x: width * 0.40, y: height * 0.417 }, { x: width * 0.16, y: height * 0.417 }, { x: width * 0.055, y: height * 0.506 },
      { x: width * 0.28, y: height * 0.581 }, { x: width * 0.50, y: height * 0.581 }, { x: width * 0.72, y: height * 0.581 }, { x: width * 0.945, y: height * 0.668 }, { x: width * 0.84, y: height * 0.745 },
      { x: width * 0.62, y: height * 0.745 }, { x: width * 0.40, y: height * 0.745 }, { x: width * 0.16, y: height * 0.745 }, { x: width * 0.055, y: height * 0.835 }, { x: width * 0.28, y: height * 0.909 }
    ];

    for (let i = 1; i <= TOTAL_LEVEL; i++) {
      const pos = levelPositions[i - 1];
      this.createLevelButton(i, pos.x, pos.y, levelData);
    }
  }

  createDefaultLevelData(total) {
    const data = {};
    for (let i = 1; i <= total; i++) {
      data[i] = i === 1 ? 1 : 0; // Level 1 terbuka, sisanya terkunci
    }
    localStorage.setItem('levelData', JSON.stringify(data));
    return data;
  }

  createLevelButton(levelNumber, x, y, levelData) {
    const status = levelData[levelNumber]; 
    let key;

    const completedImages = {
      1: 'level1', 2: 'level2', 3: 'level3', 4: 'level4', 5: 'level5', 6: 'level6', 7: 'level7', 8: 'level8', 9: 'level9', 10: 'level10',
      11: 'level11', 12: 'level12', 13: 'level13', 14: 'level14', 15: 'level15', 16: 'level16', 17: 'level17', 18: 'level18', 19: 'level19', 20: 'level20'
    };

    if (status === 0) key = 'levellock';
    if (status === 1) key = 'levelpijak';
    if (status === 2) { key = completedImages[levelNumber]; }

    const btn = this.add.image(x, y, key).setScale(0.13).setDepth(10);

    if (status === 1 || status === 2) {
      btn.setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.playGlobalSFX('pop', { volume: 0.7 }); // 🔥 PAKAI FUNGSI CEK SFX
        const levelSceneMap = {
          1: 'gameplay1', 2: 'gameplay2', 3: 'gameplay3', 4: 'gameplay4', 5: 'gameplay5', 6: 'gameplay6', 7: 'gameplay7', 8: 'gameplay8', 9: 'gameplay9', 10: 'gameplay10',
          11: 'gameplay11', 12: 'gameplay12', 13: 'gameplay13', 14: 'gameplay14', 15: 'gameplay15', 16: 'gameplay16', 17: 'gameplay17', 18: 'gameplay18', 19: 'gameplay19', 20: 'gameplay20'
        };
        this.scene.start(levelSceneMap[levelNumber]);
      });

      btn.on('pointerover', () => { this.tweens.add({ targets: btn, scale: 0.14, duration: 100 }); });
      btn.on('pointerout', () => { this.tweens.add({ targets: btn, scale: 0.13, duration: 100 }); });
    }
  }
}