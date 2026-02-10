class gameplayScene extends Phaser.Scene {
  constructor() {
    super('gameplay');
  }

  preload() {
    // =================================================================
    // 1. LOAD ASET
    // =================================================================
    
    // Background Utama (Sesuai file yang kamu upload)
    this.load.image('bgBoard', 'asset/Gameplay.png'); 

    // UI & Tombol
    this.load.image('btnBack', 'asset/tombolback.png');
    this.load.image('btnHint', 'asset/petunjuk.png'); 

    // Palet Warna (Pastikan nama file di folder asset 'paletmerah.png' dll)
    this.load.image('paletMerah', 'asset/paletmerah.png'); 
    this.load.image('paletPutih', 'asset/paletputih.png');

    // Dekorasi Kuas
    this.load.image('bgKuas', 'asset/penampungkuas.png');
    this.load.image('iconKuas', 'asset/kuas.png');
  }

  create() {
    const { width, height } = this.scale;

    // 1. PASANG BACKGROUND
    this.add.image(width / 2, height / 2, 'bgBoard').setDisplaySize(width, height);


    // ==================================================================
    // 🔥 PENGATURAN POSISI (SUDAH AKU SESUAIKAN BIAR PAS) 🔥
    // ==================================================================
    
    // Posisi Tengah Papan
    const boardX = width / 2.04; 
    
    // Posisi Vertikal (Aku turunin dikit biar pas di tengah frame kayu)
    const boardY = height / 2 + 13; 

    // Ukuran Area Gambar (Aku kecilin dikit biar gak nabrak kayu)
    const flagW = 512; 
    const flagH = 306; 

    // ==================================================================


    // --- LOGIC VARIABEL ---
    this.selectedColor = null; 
    const halfHeight = flagH / 2;


    // --- FUNGSI BIKIN ARSIRAN (GARIS MIRING) ---
    const createStripes = (x, y, w, h) => {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xAAAAAA, 0.5); // Garis abu-abu transparan
        
        for (let i = -w; i < w + h; i += 15) { // Jarak antar garis 15
            graphics.beginPath();
            graphics.moveTo(x - w/2 + i, y - h/2);
            graphics.lineTo(x - w/2 + i - h, y + h/2);
            graphics.strokePath();
        }
        
        // Masking (Biar rapi gak keluar kotak)
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(x - w/2, y - h/2, w, h);
        const mask = maskShape.createGeometryMask();
        graphics.setMask(mask);
        
        return graphics;
    };


    // --- AREA 1: BAGIAN ATAS (TARGET: MERAH) ---
    const topY = boardY - (halfHeight / 2);
    
    // Visual Arsiran
    const stripesTop = createStripes(boardX, topY, flagW, halfHeight);
    
    // Zona Klik
    const zoneTop = this.add.rectangle(boardX, topY, flagW, halfHeight, 0xFFFFFF)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.01); // Hampir transparan


    // --- AREA 2: BAGIAN BAWAH (TARGET: PUTIH) ---
    const bottomY = boardY + (halfHeight / 2);

    // Visual Arsiran
    const stripesBottom = createStripes(boardX, bottomY, flagW, halfHeight);

    // Zona Klik
    const zoneBottom = this.add.rectangle(boardX, bottomY, flagW, halfHeight, 0xFFFFFF)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.01);


    // --- 🔥 GARIS HITAM PEMISAH (SUDAH DITIPISIN) 🔥 ---
    // Tinggi cuma 3px (sebelumnya 6px)
    this.add.rectangle(boardX, boardY, flagW, 3, 0x000000).setDepth(10);
    
    // TAMBAHAN: Garis Pinggir Kotak (Outline) biar rapi
    this.add.rectangle(boardX, boardY, flagW, flagH).setStrokeStyle(3, 0x000000);


    // --- LOGIC KLIK & MEWARNAI ---
    const paintZone = (zone, stripesObj) => {
        if (this.selectedColor !== null) {
            
            // 1. Hapus arsiran
            if(stripesObj.active) stripesObj.destroy(); 
            
            // 2. Warnai
            zone.setFillStyle(this.selectedColor);
            zone.setAlpha(1); // Jadi Solid
            
            // 3. Simpan Data
            zone.setData('colorCode', this.selectedColor);
            
            // 4. Efek 'Boing'
            this.tweens.add({ targets: zone, scale: 1.02, duration: 100, yoyo: true });

            // 5. Cek Menang
            this.checkWinCondition(zoneTop, zoneBottom);
        } else {
            // Goyang kalau belum pilih warna
            this.tweens.add({ targets: zone, x: zone.x + 5, duration: 50, yoyo: true, repeat: 3 });
        }
    };

    zoneTop.on('pointerdown', () => paintZone(zoneTop, stripesTop));
    zoneBottom.on('pointerdown', () => paintZone(zoneBottom, stripesBottom));


    // ================= UI ELEMENTS =================

    // 1. TOMBOL BACK (Kiri Atas - Disesuaikan)
    const btnBack = this.add.image(60, 60, 'btnBack').setScale(0.12).setInteractive(); 
    btnBack.on('pointerdown', () => this.scene.start('level'));

    // 2. PALET WARNA (Kanan - Posisi Aman)
    const pMerah = this.add.image(width - 100, height/1.5 - 10, 'paletMerah').setInteractive().setScale(0.8);
    pMerah.on('pointerdown', () => {
        this.selectedColor = 0xD9252B; // Merah Bendera Indonesia
        this.updateBrushColor(0xD9252B);
        this.tweens.add({ targets: pMerah, scale: 0.9, duration: 100, yoyo: true });
    });

    const pPutih = this.add.image(width - 100, height/1.8 + 10, 'paletPutih').setInteractive().setScale(0.8);
    pPutih.on('pointerdown', () => {
        this.selectedColor = 0xFFFFFF; // Putih
        this.updateBrushColor(0xFFFFFF);
        this.tweens.add({ targets: pPutih, scale: 0.9, duration: 100, yoyo: true });
    });

    // 3. INDIKATOR KUAS (Kanan Bawah)
    this.add.image(width - 120, height - 100, 'bgKuas').setScale(0.7);
    this.brushIcon = this.add.image(width - 120, height - 100, 'iconKuas').setScale(0.7);

    // 4. JUDUL NEGARA (Kanan Atas)
    // Background Teks
    this.add.rectangle(width - 200, 100, 250, 40, 0xFFFFFF).setStrokeStyle(2, 0x000000);
    this.add.text(width - 200, 100, 'INDONESIA', {
        fontSize: '24px', color: '#000000', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Timer Bar
    const timerFill = this.add.rectangle(width - 325, 60, 250, 15, 0xFF0000).setOrigin(0, 0.5);
    this.tweens.add({ targets: timerFill, scaleX: 0, duration: 30000, ease: 'Linear' });

    // 5. TOMBOL HINT (Kiri Bawah)
    this.add.image(60, height - 60, 'btnHint').setInteractive().setScale(0.8)
        .on('pointerdown', () => alert("Atas Merah, Bawah Putih!"));

  } 


  // --- FUNGSI PENDUKUNG ---
  updateBrushColor(color) {
      this.brushIcon.setTint(color);
  }

  checkWinCondition(zoneTop, zoneBottom) {
      const topColor = zoneTop.getData('colorCode');
      const bottomColor = zoneBottom.getData('colorCode');

      // Cek Merah (0xD9252B) dan Putih (0xFFFFFF)
      if (topColor === 0xD9252B && bottomColor === 0xFFFFFF) {
          this.time.delayedCall(500, () => {
              this.registry.set('level1Cleared', true);
              localStorage.setItem('level1Cleared', 'true');
              alert("BENAR! HEBAT! 🎉");
              this.scene.start('level');
          });
      }
  }
}