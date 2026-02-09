class gameplayScene extends Phaser.Scene {
  constructor() {
    super('gameplay');
  }

  preload() {
    // =================================================================
    // 1. LOAD SEMUA ASET (SESUAIKAN NAMA FILE SAMA DI FOLDER LU!)
    // =================================================================
    
    // Background (Papan Tulis + Biru)
    this.load.image('bgBoard', 'asset/Gameplay.png'); 

    // Tombol Navigasi
    this.load.image('btnBack', 'asset/tombolback.png'); // Panah merah kiri atas
    this.load.image('btnHint', 'asset/petunjuk.png'); // Lampu kiri bawah

    // Palet Warna (Bulat Merah & Putih di Kanan)
    this.load.image('paletMerah', 'asset/paletmerah.png'); 
    this.load.image('paletPutih', 'asset/paletputih.png');

    // Indikator Alat (Kanan Bawah)
    this.load.image('bgKuas', 'asset/penampungkuas.png'); // Kotak abu-abu
    this.load.image('iconKuas', 'asset/kuas.png');   // Gambar kuasnya

  }

  create() {
    const { width, height } = this.scale;

    // =========================================
    // 2. BACKGROUND UTAMA
    // =========================================
    this.add.image(width / 2, height / 2, 'bgBoard').setDisplaySize(width, height);


    // =========================================
    // 3. AREA GAMBAR BENDERA (LOGIC UTAMA)
    // =========================================
    
    // Koordinat Papan Tulis (Dikira-kira dari gambar lu)
    // Nanti lu geser-geser angka x, y, w, h ini biar pas di tengah papan
    const boardX = width / 2;
    const boardY = height / 2 + 30; 
    const flagW = 580; // Lebar area putih papan
    const flagH = 340; // Tinggi area putih papan
    
    this.selectedColor = null; // Warna yang lagi dipegang mouse/jari

    // --- FUNGSI BIKIN GARIS ARSIRAN (Biar kayak gambar 1) ---
    const createStripes = (x, y, w, h) => {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xCCCCCC, 1); // Garis abu-abu
        for (let i = -w; i < w + h; i += 20) {
            graphics.beginPath();
            graphics.moveTo(x - w/2 + i, y - h/2);
            graphics.lineTo(x - w/2 + i - h, y + h/2);
            graphics.strokePath();
        }
        // Masking biar garisnya gak keluar kotak
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(x - w/2, y - h/2, w, h);
        const mask = maskShape.createGeometryMask();
        graphics.setMask(mask);
        return graphics;
    };

    // --- BAGIAN ATAS (AREA 1) ---
    // Awalnya transparan + ada arsiran
    const zoneTop = this.add.rectangle(boardX, boardY - (flagH/4), flagW, flagH/2, 0xFFFFFF)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.01); // Hampir transparan biar bisa diklik
    
    // Bikin visual arsiran (garis miring) buat bagian atas
    const stripesTop = createStripes(boardX, boardY - (flagH/4), flagW, flagH/2);

    // --- BAGIAN BAWAH (AREA 2) ---
    const zoneBottom = this.add.rectangle(boardX, boardY + (flagH/4), flagW, flagH/2, 0xFFFFFF)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.01);

    const stripesBottom = createStripes(boardX, boardY + (flagH/4), flagW, flagH/2);


    // --- LOGIC KLIK ---
    const paintZone = (zone, stripesObj, correctColor) => {
        if (this.selectedColor !== null) {
            // 1. Hapus arsiran
            if(stripesObj) stripesObj.destroy(); 
            
            // 2. Warnai zona
            zone.setFillStyle(this.selectedColor);
            zone.setAlpha(1); // Jadi solid
            
            // 3. Cek Benar/Salah langsung (Realtime) atau simpan data
            zone.setData('color', this.selectedColor);
            
            // Efek suara "Plop" bisa ditaruh sini
            this.checkWinCondition(zoneTop, zoneBottom);
        }
    };

    zoneTop.on('pointerdown', () => paintZone(zoneTop, stripesTop));
    zoneBottom.on('pointerdown', () => paintZone(zoneBottom, stripesBottom));


    // =========================================
    // 4. UI ELEMENTS (SESUAI SCREENSHOT)
    // =========================================

    // --- TOMBOL BACK (Kiri Atas) ---
    const btnBack = this.add.image(60, 60, 'btnBack').setScale(0.1).setInteractive();
    btnBack.on('pointerdown', () => this.scene.start('level'));

    // --- TEXT BOX NEGARA (Kanan Atas) ---
    // Container bg putih + text
    this.add.image(width - 200, 120, 'bgJudul').setScale(0.8);
    this.add.text(width - 200, 120, 'INDONESIA', {
        fontSize: '24px', color: '#000', fontStyle: 'bold'
    }).setOrigin(0.5);

    // --- TIMER BAR (Kanan Atas - Di atas Judul) ---
    // Bar background (putih/abu)
    this.add.rectangle(width - 200, 70, 300, 20, 0xFFFFFF).setStrokeStyle(2, 0x000000);
    // Bar merah (Isinya)
    const timerBar = this.add.rectangle(width - 350, 70, 300, 16, 0xFF0000).setOrigin(0, 0.5);
    
    // Animasi Timer Habis
    this.tweens.add({
        targets: timerBar,
        scaleX: 0, // Mengecil sampai 0
        duration: 30000, // 30 detik
        ease: 'Linear'
    });


    // --- PALET WARNA (Kanan Tengah) ---
    
    // Palet Merah
    const pMerah = this.add.image(width - 80, height/2 - 50, 'paletMerah')
        .setInteractive().setScale(0.8);
    
    // Palet Putih
    const pPutih = this.add.image(width - 80, height/2 + 50, 'paletPutih')
        .setInteractive().setScale(0.8);

    // Logic Pilih Warna
    pMerah.on('pointerdown', () => {
        this.selectedColor = 0xD9252B; // Kode warna merah bendera (sesuaikan)
        this.updateCursor(0xD9252B); // Ganti warna kuas
        
        // Animasi kepencet
        this.tweens.add({ targets: pMerah, scale: 0.9, duration: 100, yoyo: true });
    });

    pPutih.on('pointerdown', () => {
        this.selectedColor = 0xFFFFFF;
        this.updateCursor(0xFFFFFF);
        
        this.tweens.add({ targets: pPutih, scale: 0.9, duration: 100, yoyo: true });
    });


    // --- ALAT KUAS (Kanan Bawah) ---
    // Background kotak abu
    this.add.image(width - 150, height - 100, 'bgKuas').setScale(0.8);
    // Icon Kuas (Nanti bisa berubah warna ujungnya)
    this.brushIcon = this.add.image(width - 150, height - 100, 'iconKuas').setScale(0.8);


    // --- TOMBOL HINT (Kiri Bawah) ---
    this.add.image(80, height - 80, 'btnHint').setInteractive().setScale(0.8)
        .on('pointerdown', () => {
            alert("Atas Merah, Bawah Putih bang! 🇮🇩");
        });
  }

  // Fungsi ubah warna ujung kuas (Visual aja)
  updateCursor(color) {
      this.brushIcon.setTint(color); 
  }

  // Fungsi Cek Menang Otomatis
  checkWinCondition(zoneTop, zoneBottom) {
      // Cek apakah data warna di zona sesuai kunci jawaban
      const topColor = zoneTop.getData('color');
      const bottomColor = zoneBottom.getData('color');

      // Merah: 0xD9252B, Putih: 0xFFFFFF
      if (topColor === 0xD9252B && bottomColor === 0xFFFFFF) {
          
          // Jeda dikit biar player sadar udah keisi
          this.time.delayedCall(500, () => {
              alert("BENAR! INDONESIA! 🎉");
              this.registry.set('level1Cleared', true);
              localStorage.setItem('level1Cleared', 'true');
              this.scene.start('level');
          });
      }
  }
}