class levelScene extends Phaser.Scene {
  constructor() {
    super('level');
  }

  preload() {
    this.load.image('bgLevel', 'asset/Level.png');
    this.load.image('garis', 'asset/garis.png');
    this.load.image('TEXTLEVEL', 'asset/TEXT LEVEL.png');
    this.load.image('tombolback', 'asset/tombolback.png');

    // preload button level
    this.load.image('levelpijak', 'asset/levelpijak.png'); // current (bisa dimainkan)
    this.load.image('levellock', 'asset/levellock.png');   // locked
    this.load.image('level1', 'asset/level1.png'); // completed
    this.load.image('level2', 'asset/level2.png'); // completed

  }

  create() {
    const { width, height } = this.scale;



    
    // background level
    this.add.image(width / 2, height / 2, 'bgLevel').setDisplaySize(width, height);

    // garis
    this.add.image(width / 2, height * 0.60, 'garis').setScale(1.0);

    // TEXT LEVEL
    this.add.image(width / 2, height * 0.17, 'TEXTLEVEL').setScale(0.50);

    // tombol back
    const tombolback = this.add.image(width * 0.055, height * 0.080, 'tombolback')
        .setScale(0.13)
        .setInteractive({ useHandCursor: true });

    // Efek hover tombol back
    tombolback.on('pointerover', () => {
        this.tweens.add({ targets: tombolback, scale: 0.135, duration: 100, ease: 'Back.Out' });
    });
    tombolback.on('pointerout', () => {
        this.tweens.add({ targets: tombolback, scale: 0.13, duration: 100, ease: 'Back.In' });
    });
    tombolback.on('pointerdown', () => {
      localStorage.removeItem('levelData');

        this.scene.start('menu'); 
    });

    // ======================= LOGIKA LEVEL =======================

    const TOTAL_LEVEL = 20; 

    // Ambil data level dari localStorage
    let levelData = JSON.parse(localStorage.getItem('levelData')) || this.createDefaultLevelData(TOTAL_LEVEL);

    // Refresh data jika jumlah level berubah di kodingan
    if (Object.keys(levelData).length !== TOTAL_LEVEL) {
        levelData = this.createDefaultLevelData(TOTAL_LEVEL);
    }

    // Posisi awal tombol level
  // Posisi tiap level (bebas kamu atur)
const levelPositions = [
  { x: width * 0.06, y: height * 0.252 }, // level 1
  { x: width * 0.28, y: height * 0.252 }, // level 2
  { x: width * 0.50, y: height * 0.252 }, // level 3
  { x: width * 0.72, y: height * 0.252 }, // level 4
  { x: width * 0.945, y: height * 0.341 }, // level 5
  { x: width * 0.84, y: height * 0.417 }, // level 6
  { x: width * 0.62, y: height * 0.417 }, // level 7
  { x: width * 0.40, y: height * 0.417 }, // level 8
  { x: width * 0.16, y: height * 0.417 }, // level 9
  { x: width * 0.055, y: height * 0.506 }, // level 10
  { x: width * 0.28, y: height * 0.581 }, // level 11
  { x: width * 0.50, y: height * 0.581 }, // level 12
  { x: width * 0.72, y: height * 0.581 }, // level 13
  { x: width * 0.945, y: height * 0.668 }, // level 14
  { x: width * 0.84, y: height * 0.745 }, // level 15
  { x: width * 0.62, y: height * 0.745 }, // level 16
  { x: width * 0.40, y: height * 0.745 }, // level 17
  { x: width * 0.16, y: height * 0.745 }, // level 18
  { x: width * 0.055, y: height * 0.835 }, // level 19
  { x: width * 0.28, y: height * 0.909 }, // level 20
  
  

  
  
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
    const status = levelData[levelNumber]; // 0=locked, 1=current, 2=completed
    let key;

      // Mapping gambar completed tiap level
  const completedImages = {
    1:  'level1', // ganti nanti sesuai aset
    2:  'level2',
    3:  'level3',
    4:  'level4',
    5:  'level5',
    6:  'level6',
    7:  'level7',
    8:  'level8',
    9:  'level9',
    10: 'level10',
    11: 'level11',
    12: 'level12',
    13: 'level13',
    14: 'level14',
    15: 'level15',
    16: 'level16',
    17: 'level17',
    18: 'level18',
    19: 'level19',
    20: 'level20',
  };

   if (status === 0) key = 'levellock';
if (status === 1) key = 'levelpijak';

if (status === 2) {
  const completedImages = {
    1:  'level1',
    2:  'level2',
    3:  'level3',
    4:  'level4',
    5:  'level5',
    6:  'level6',
    7:  'level7',
    8:  'level8',
    9:  'level9',
    10: 'level10',
    11: 'level11',
    12: 'level12',
    13: 'level13',
    14: 'level14',
    15: 'level15',
    16: 'level16',
    17: 'level17',
    18: 'level18',
    19: 'level19',
    20: 'level20',
  };

key = completedImages[levelNumber];

}

    const btn = this.add.image(x, y, key)
      .setScale(0.13)
      .setDepth(10);

    // === PERUBAHAN UTAMA DI SINI ===
    // Hanya level terbuka (1) atau selesai (2) yang bisa diklik untuk main ulang
    if (status === 1 || status === 2) {
      btn.setInteractive({ useHandCursor: true });

     btn.on('pointerdown', () => {
  const levelSceneMap = {
    1:  'gameplay1',
    2:  'gameplay2',
    3:  'gameplay3',
    4:  'gameplay4',
    5:  'gameplay5',
    6:  'gameplay6',
    7:  'gameplay7',
    8:  'gameplay8',
    9:  'gameplay9',
    10: 'gameplay10',
    11: 'gameplay11',
    12: 'gameplay12',
    13: 'gameplay13',
    14: 'gameplay14',
    15: 'gameplay15',
    16: 'gameplay16',
    17: 'gameplay17',
    18: 'gameplay18',
    19: 'gameplay19',
    20: 'gameplay20',
  };

  this.scene.start(levelSceneMap[levelNumber]);
});

      // Efek Hover
      btn.on('pointerover', () => {
        this.tweens.add({ targets: btn, scale: 0.14, duration: 100 });
      });
      btn.on('pointerout', () => {
        this.tweens.add({ targets: btn, scale: 0.13, duration: 100 });
      });
    }


  }
}