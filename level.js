class levelScene extends Phaser.Scene {
  constructor() {
    super('level');
  }

  preload() {
    // MUAT ASET: Siapin semua gambar yang dibutuhin buat halaman pilih level
    this.load.image('bgLevel', 'asset/Level.png');
    this.load.image('garis', 'asset/garis.png');
    this.load.image('TEXTLEVEL', 'asset/text_level.png');
    this.load.image('tombolback', 'asset/tombolback.png');

    // Tombol kondisi level (bisa dipencet atau masih kekunci)
    this.load.image('levelpijak', 'asset/levelpijak.png'); 
    this.load.image('levellock', 'asset/levellock.png');   

    // Gambar kalau level udah selesai (nampilin benderanya)
    this.load.image('level1', 'asset/level1.png');
    this.load.image('level2', 'asset/level2.png');
    this.load.image('level3', 'asset/level3.png');
    this.load.image('level4', 'asset/level4.png');
    this.load.image('level5', 'asset/level5.png');
    this.load.image('level6', 'asset/level6.png');
    this.load.image('level7', 'asset/level7.png');
    this.load.image('level8', 'asset/level8.png');
    this.load.image('level9', 'asset/level9.png');
    this.load.image('level10', 'asset/level10.png');
    this.load.image('level11', 'asset/level11.png');
    this.load.image('level12', 'asset/level12.png');
    this.load.image('level13', 'asset/level13.png');
    this.load.image('level14', 'asset/level14.png');
    this.load.image('level15', 'asset/level15.png');
    this.load.image('level16', 'asset/level16.png');
    this.load.image('level17', 'asset/level17.png');
    this.load.image('level18', 'asset/level18.png');
    this.load.image('level19', 'asset/level19.png');
    this.load.image('level20', 'asset/level20.png');

    this.load.audio('pop', 'asset/pop.mp3');
  }

  // FUNGSI CEK SUARA
  // Sama kayak di gameplay, ini buat mastiin suara tombol cuma bunyi kalau settingan SFX nyala.
  playGlobalSFX(key, config) {
      if (localStorage.getItem('sfx_on') !== 'false') {
          this.sound.play(key, config);
      }
  }

  create() {
    const { width, height } = this.scale;

    // BGM FADE IN
    // Waktu di layar gameplay terus player menang/kalah, kan volume musiknya sempet dikecilin.
    // Nah pas player balik ke layar level ini, volumenya dinaikin lagi pelan-pelan biar mulus.
    let existingBgm = this.sound.get('bgm_menu');
    let isMusicOn = localStorage.getItem('music_on') !== 'false';

    if (existingBgm && isMusicOn) {
        this.tweens.add({
            targets: existingBgm,
            volume: 0.8,
            delay: 0,
            duration: 2000,
            ease: 'Sine.easeInOut'
        });
    }

    // Pasang background dan judul
    this.add.image(width / 2, height / 2, 'bgLevel').setDisplaySize(width, height);
    this.add.image(width / 2, height * 0.60, 'garis').setScale(1.0);
    this.add.image(width / 2, height * 0.14, 'TEXTLEVEL').setScale(1);

    // Tombol buat balik ke menu utama
    const tombolback = this.add.image(width * 0.055, height * 0.080, 'tombolback')
      .setScale(1)
      .setInteractive({ useHandCursor: true });

    tombolback.on('pointerover', () => { tombolback.setTint(0xeeeeee); });
    tombolback.on('pointerout', () => { tombolback.clearTint(); });

    tombolback.on('pointerdown', () => {
      this.playGlobalSFX('pop');
      tombolback.setTint(0xeeeeee);
      this.tweens.add({ targets: tombolback, scale: 0.115, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
      this.scene.start('menu'); 
    });

    tombolback.on('pointerup', () => { tombolback.setTint(0xdddddd); });

    // ======================= LOGIKA SAVE DATA & LEVEL =======================

    const TOTAL_LEVEL = 20;
    
    // SISTEM VERSI SAVE DATA
    // Kalau lu nambahin level atau ngerubah sistem save di masa depan, ganti DATA_VERSION ini (misal jadi 'v3').
    // Biar save data lama yang ada di HP/Browser player keriset otomatis dan gamenya gak nge-bug.
    const DATA_VERSION = 'v2'; 

    if (localStorage.getItem('levelDataVersion') !== DATA_VERSION) {
        localStorage.removeItem('levelData');
        localStorage.setItem('levelDataVersion', DATA_VERSION);
    }

    // Ambil data progress player. Kalau belum ada (baru main), panggil fungsi buat bikin data default.
    let levelData = JSON.parse(localStorage.getItem('levelData')) || this.createDefaultLevelData(TOTAL_LEVEL);

    // Proteksi tambahan: kalau data yang kesimpen jumlahnya gak 20 (berarti datanya korup), reset aja.
    if (Object.keys(levelData).length !== TOTAL_LEVEL) {
        levelData = this.createDefaultLevelData(TOTAL_LEVEL);
    }

    // Kordinat posisi X dan Y untuk 20 tombol level di layar
    const levelPositions = [
      { x: width * 0.06, y: height * 0.252 }, { x: width * 0.28, y: height * 0.252 }, { x: width * 0.50, y: height * 0.252 }, { x: width * 0.72, y: height * 0.252 }, { x: width * 0.945, y: height * 0.341 },
      { x: width * 0.84, y: height * 0.417 }, { x: width * 0.62, y: height * 0.417 }, { x: width * 0.40, y: height * 0.417 }, { x: width * 0.16, y: height * 0.417 }, { x: width * 0.055, y: height * 0.506 },
      { x: width * 0.28, y: height * 0.581 }, { x: width * 0.50, y: height * 0.581 }, { x: width * 0.72, y: height * 0.581 }, { x: width * 0.945, y: height * 0.668 }, { x: width * 0.84, y: height * 0.745 },
      { x: width * 0.62, y: height * 0.745 }, { x: width * 0.40, y: height * 0.745 }, { x: width * 0.16, y: height * 0.745 }, { x: width * 0.055, y: height * 0.835 }, { x: width * 0.28, y: height * 0.909 }
    ];

    // Bikin tombolnya satu-satu sesuai jumlah TOTAL_LEVEL
    for (let i = 1; i <= TOTAL_LEVEL; i++) {
      const pos = levelPositions[i - 1];
      this.createLevelButton(i, pos.x, pos.y, levelData);
    }
  }

  // FUNGSI BIKIN DATA AWAL
  // Nge-set level 1 terbuka (status 1), dan level sisanya terkunci (status 0).
  createDefaultLevelData(total) {
    const data = {};
    for (let i = 1; i <= total; i++) {
      data[i] = i === 1 ? 1 : 0; 
    }
    localStorage.setItem('levelData', JSON.stringify(data));
    return data;
  }

  // FUNGSI BIKIN TOMBOL LEVEL
  createLevelButton(levelNumber, x, y, levelData) {
    // Cek status dari storage: 0 (Kunci), 1 (Bisa Dimainkan), 2 (Selesai/Tamat)
    const status = levelData[levelNumber]; 
    let key;

    // Daftar nama gambar kalau level udah diselesain
    const completedImages = {
      1: 'level1', 2: 'level2', 3: 'level3', 4: 'level4', 5: 'level5',
      6: 'level6', 7: 'level7', 8: 'level8', 9: 'level9', 10: 'level10',
      11: 'level11', 12: 'level12', 13: 'level13', 14: 'level14', 15: 'level15',
      16: 'level16', 17: 'level17', 18: 'level18', 19: 'level19', 20: 'level20'
    };

    // Nentuin gambar tombol berdasarkan status
    if (status === 0) key = 'levellock';
    if (status === 1) key = 'levelpijak';
    if (status === 2) { key = completedImages[levelNumber]; }

    // Pasang tombolnya ke layar
    const btn = this.add.image(x, y, key).setScale(0.13).setDepth(10);

    // Kalau levelnya udah kebuka (status 1) atau udah tamat (status 2), baru tombolnya bisa diklik
    if (status === 1 || status === 2) {
      btn.setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.playGlobalSFX('pop', { volume: 0.7 });
        
        // Pemetaan nomor level ke nama Scene gamenya
        const levelSceneMap = {
          1: 'gameplay1', 2: 'gameplay2', 3: 'gameplay3', 4: 'gameplay4', 5: 'gameplay5',
          6: 'gameplay6', 7: 'gameplay7', 8: 'gameplay8', 9: 'gameplay9', 10: 'gameplay10',
          11: 'gameplay11', 12: 'gameplay12', 13: 'gameplay13', 14: 'gameplay14', 15: 'gameplay15',
          16: 'gameplay16', 17: 'gameplay17', 18: 'gameplay18', 19: 'gameplay19', 20: 'gameplay20'
        };
        // Pindah ke scene gameplay sesuai level yang diklik
        this.scene.start(levelSceneMap[levelNumber]);
      });

      // Animasi membesar dikit kalau mouse disorot ke tombol
      btn.on('pointerover', () => { this.tweens.add({ targets: btn, scale: 0.14, duration: 100 }); });
      btn.on('pointerout', () => { this.tweens.add({ targets: btn, scale: 0.13, duration: 100 }); });
    }
  }
}