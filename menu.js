class menuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  preload() {
    // Siapin gambar background dan tombol utama
    this.load.image('bg', 'asset/BG MAIN MENU.png');
    this.load.image('btnPlay', 'asset/TOMBOL PLAY.png');
    this.load.image('title', 'asset/title.png');
    this.load.image('btn_credit', 'asset/TOMBOL CREDIT.png');
    
    // Load 5 ekspresi karakter buat narasi di awal
    this.load.image('char_welcome', 'asset/wellcome.png');
    this.load.image('char_intro', 'asset/introduce.png');
    this.load.image('char_explain', 'asset/explaining.png');
    this.load.image('char_thinking', 'asset/thingking.png');
    this.load.image('char_goodluck', 'asset/goodluck.png');

    // Gambar-gambar panduan cara main
    this.load.image('tutorial_img', 'asset/tutorial.png');
    this.load.image('tutorial2_img', 'asset/tutorial2.png');
    this.load.image('tutorial3_img', 'asset/tutorial3.png');
    this.load.image('pointer', 'asset/telunjuk.png');

    // Suara tombol dan musik latar
    this.load.audio('sfx_pop', 'asset/pop.mp3');
    this.load.audio('bgm_menu', 'asset/bossanova.mp3');
    this.load.audio('sfx_transition', 'asset/transisi.mp3');
    this.load.audio('sfx_woosh', 'asset/woosh.mp3'); 

    // Tombol skip cerita dan popup konfirmasinya
    this.load.image('btn_skip', 'asset/btn_skip.png');
    this.load.image('popup_confirm', 'asset/popup_confirm.png');
    this.load.image('btn_yes', 'asset/btn_yes.png');
    this.load.image('btn_no', 'asset/btn_no.png');

    // Semua gambar buat menu pengaturan (setting)
    this.load.image('btn_pengaturan', 'asset/btn_pengaturan.png');
    this.load.image('pengaturan', 'asset/pengaturan.png');
    this.load.image('close_pengaturan', 'asset/close_pengaturan.png');
    this.load.image('on_musik', 'asset/on_musik.png');
    this.load.image('off_musik', 'asset/off_musik.png');
    this.load.image('on_suara', 'asset/on_suara.png');
    this.load.image('off_suara', 'asset/off_suara.png');
    this.load.image('reset_game', 'asset/reset_game.png');
    this.load.image('popup_reset', 'asset/popup_reset.png');
  }

  // FUNGSI CEK SUARA
  // Biar suara tombol ngikutin settingan player, kalau di-mute ya gak bunyi
  playMenuSFX(key, config) {
      if (localStorage.getItem('sfx_on') !== 'false') {
          this.sound.play(key, config);
      }
  }

  create() {
    const width = 1344;
    const height = 720;

    // Baca data dari browser, defaultnya nyala kalau player belum pernah ngutak-ngatik
    let isMusicOn = localStorage.getItem('music_on') !== 'false'; 
    let isSfxOn = localStorage.getItem('sfx_on') !== 'false';

    // Nyalain musik menu
    let existingBgm = this.sound.get('bgm_menu');
    if (!existingBgm) {
        this.bgm = this.sound.add('bgm_menu', { volume: isMusicOn ? 0.8 : 0, loop: true });
        this.bgm.play();
    } else {
        this.bgm = existingBgm;
        if (!this.bgm.isPlaying) {
            this.bgm.play();
        }
        this.bgm.setVolume(isMusicOn ? 0.8 : 0);
    }

    // 1. SETUP BACKGROUND & EFEK DEBU TERBANG
    this.bg = this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);
    
    // Bikin tekstur debu-debu bercahaya langsung pakai kode, tanpa butuh aset gambar luar
    const gfx = this.add.graphics();
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(4, 4, 4);
    gfx.generateTexture('magic_dust', 8, 8);
    gfx.destroy();

    this.add.particles(0, 0, 'magic_dust', {
      x: { min: 0, max: width }, y: { min: height, max: height + 100 },
      lifespan: { min: 4000, max: 8000 },
      speedY: { min: -20, max: -60 }, speedX: { min: -10, max: 10 },
      scale: { start: 0.6, end: 0 }, alpha: { start: 1, end: 0 },
      quantity: 1, blendMode: 'ADD'
    }).setDepth(5);

    // 2. MUNCULIN JUDUL & TOMBOL PLAY
    const title = this.add.image(width / 2, height * 0.38, 'title').setAlpha(0);
    this.tweens.add({ targets: title, y: height * 0.35, alpha: 1, duration: 800, ease: 'Power3' });

    this.playBtn = this.add.image(width / 2, height * 0.65, 'btnPlay')
      .setScale(0.5).setInteractive({ useHandCursor: true }).setDepth(6);
    this.titleText = title; 

    // Bikin tombol play-nya denyut-denyut (membesar-mengecil) biar menarik buat diklik
    const pulseTween = this.tweens.add({
      targets: this.playBtn, scale: 0.53, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // 3. SETUP TAMPILAN CERITA (VISUAL NOVEL)
    // Semua elemen ini alpha-nya diset 0 (tembus pandang) dulu, baru dimunculin pas tombol play diklik
    this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(10).setAlpha(0);
    this.character = this.add.image(300, height - 250, 'char_welcome').setDepth(11).setAlpha(0).setScale(0.8);
    this.dialogBox = this.add.rectangle(width / 2, height - 100, width - 150, 150, 0x000000, 0.8).setDepth(11).setAlpha(0).setStrokeStyle(4, 0xffffff);
    this.nameBox = this.add.rectangle(100, height - 195, 200, 40, 0xffffff, 0.9).setDepth(11).setAlpha(0).setOrigin(0);
    this.nameText = this.add.text(120, height - 185, 'Pemandu Misi', { fontSize: '20px', fontFamily: 'Arial', color: '#000000', fontStyle: 'bold' }).setDepth(12).setAlpha(0);
    this.dialogText = this.add.text(100, height - 140, '', { fontSize: '26px', fontFamily: 'Arial', color: '#ffffff', wordWrap: { width: width - 200 }, lineSpacing: 10 }).setDepth(12).setAlpha(0);
    this.nextIndicator = this.add.text(width - 120, height - 60, '>>', { fontSize: '24px', color: '#ffffff' }).setDepth(12).setAlpha(0);
    
    // Panah kecil buat ngasih tau player bisa klik next
    this.tweens.add({ targets: this.nextIndicator, y: height - 55, duration: 400, yoyo: true, repeat: -1 });

    // Tempat buat nampilin gambar tutorial
    this.tutorialContainer = this.add.container(width / 2 + 166, height / 2 - 80).setDepth(10.5).setAlpha(0);
    this.tutImage = this.add.image(0, 40, 'tutorial_img').setScale(0.4);
    this.bubbleContainer = this.add.container(-300, 20); 
    this.tutTextBg = this.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(-140, -25, 280, 50, 25).lineStyle(4, 0x000000, 1).strokeRoundedRect(-140, -25, 280, 50, 25);
    this.tutText = this.add.text(0, 0, '', { fontSize: '22px', fontFamily: 'Arial', color: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    this.bubbleContainer.add([this.tutTextBg, this.tutText]);
    this.tutPointer = this.add.image(0, 0, 'pointer').setScale(0.06); 
    this.pointerBounceTween = null; 
    this.tutorialContainer.add([this.tutImage, this.bubbleContainer, this.tutPointer]);

    this.skipBtn = this.add.image(width - 130, 60, 'btn_skip').setScale(0.103).setDepth(21).setAlpha(0).setInteractive({ useHandCursor: true });
    
    // Area klik raksasa sebesar layar penuh buat lanjutin dialog
    this.introClickZone = this.add.zone(width / 2, height / 2, width, height).setInteractive({ useHandCursor: true }).setDepth(20).setActive(false).setVisible(false);

    // 4. POPUP YAKIN MAU SKIP CERITA?
    this.confirmBlocker = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7).setDepth(30).setInteractive().setVisible(false);
    this.confirmContainer = this.add.container(width/2, height/2).setDepth(31).setVisible(false).setScale(0.8);
    const popupImg = this.add.image(0, -27, 'popup_confirm').setScale(0.49);
    const btnYes = this.add.image(-100, 38, 'btn_yes').setScale(0.092).setInteractive({ useHandCursor: true });
    const btnNo = this.add.image(60, 38, 'btn_no').setScale(0.092).setInteractive({ useHandCursor: true });
    this.confirmContainer.add([popupImg, btnYes, btnNo]);

    // 5. TAMPILAN MENU PENGATURAN (SETTING)
    this.settingBtn = this.add.image(width - 60, 60, 'btn_pengaturan')
        .setScale(0.8) 
        .setDepth(50)
        .setInteractive({ useHandCursor: true });

    // Biar tombol gear-nya bereaksi kalau kena mouse
    this.settingBtn.on('pointerover', () => { this.settingBtn.setScale(0.85); });
    this.settingBtn.on('pointerout', () => { this.settingBtn.setScale(0.8); });

    this.settingBlocker = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
        .setDepth(100).setInteractive().setVisible(false);
    this.settingContainer = this.add.container(width / 2, height / 2)
        .setDepth(101).setVisible(false).setScale(0.8);

    const popupBgSetting = this.add.image(0, -10, 'pengaturan').setScale(1.1);
    const btnCloseSetting = this.add.image(popupBgSetting.displayWidth / 2 - 20, -popupBgSetting.displayHeight / 2 + 5, 'close_pengaturan')
        .setInteractive({ useHandCursor: true });

    // Tombol on/off musik
    this.btnMusicOn = this.add.image(85, -90, 'on_musik').setInteractive({ useHandCursor: true }).setAlpha(isMusicOn ? 1 : 0.5).setScale(1.1);
    this.btnMusicOff = this.add.image(148, -89, 'off_musik').setInteractive({ useHandCursor: true }).setAlpha(isMusicOn ? 0.5 : 1).setScale(1.1);

    // Tombol on/off efek suara
    this.btnSfxOn = this.add.image(82, -20, 'on_suara').setInteractive({ useHandCursor: true }).setAlpha(isSfxOn ? 1 : 0.5).setScale(1.1);
    this.btnSfxOff = this.add.image(148, -20, 'off_suara').setInteractive({ useHandCursor: true }).setAlpha(isSfxOn ? 0.5 : 1).setScale(1.1);

    // Tombol bahaya buat ngulang game dari awal
    const btnReset = this.add.image(0, 110, 'reset_game').setInteractive({ useHandCursor: true }).setScale(1.1);

    this.settingContainer.add([popupBgSetting, btnCloseSetting, this.btnMusicOn, this.btnMusicOff, this.btnSfxOn, this.btnSfxOff, btnReset]);

    // FUNGSI-FUNGSI DALAM MENU PENGATURAN
    // Munculin popup pengaturan
    this.settingBtn.on('pointerdown', () => {
        this.playMenuSFX('sfx_pop');
        this.settingBlocker.setVisible(true);
        this.settingContainer.setVisible(true);
        this.tweens.add({ targets: this.settingContainer, scale: 1, duration: 250, ease: 'Back.out' });
    });

    // Nutup popup pengaturan
    btnCloseSetting.on('pointerdown', () => {
        this.playMenuSFX('sfx_pop');
        this.settingBlocker.setVisible(false);
        this.settingContainer.setVisible(false);
        this.settingContainer.setScale(0.8);
    });

    // Logika nyalain/matiin musik
    this.btnMusicOn.on('pointerdown', () => {
        localStorage.setItem('music_on', 'true');
        if(this.bgm) this.bgm.setVolume(0.8);
        this.btnMusicOn.setAlpha(1);
        this.btnMusicOff.setAlpha(0.5);
        this.playMenuSFX('sfx_pop');
    });

    this.btnMusicOff.on('pointerdown', () => {
        localStorage.setItem('music_on', 'false');
        if(this.bgm) this.bgm.setVolume(0);
        this.btnMusicOn.setAlpha(0.5);
        this.btnMusicOff.setAlpha(1);
        this.playMenuSFX('sfx_pop');
    });

    // Logika nyalain/matiin efek suara
    this.btnSfxOn.on('pointerdown', () => {
        localStorage.setItem('sfx_on', 'true');
        this.btnSfxOn.setAlpha(1);
        this.btnSfxOff.setAlpha(0.5);
        this.playMenuSFX('sfx_pop'); 
    });

    this.btnSfxOff.on('pointerdown', () => {
        this.playMenuSFX('sfx_pop'); 
        localStorage.setItem('sfx_on', 'false');
        this.btnSfxOn.setAlpha(0.5);
        this.btnSfxOff.setAlpha(1);
    });

// --- TAMBAHAN TOMBOL CREDIT DI POJOK KIRI ---
this.creditBtn = this.add.image(60, 60, 'btn_credit') // Posisi x:60, y:60 (Pojok kiri atas)
    .setScale(0.8)
    .setDepth(50)
    .setInteractive({ useHandCursor: true });

// Efek hover biar konsisten dengan tombol pengaturan
this.creditBtn.on('pointerover', () => { this.creditBtn.setScale(0.85); });
this.creditBtn.on('pointerout', () => { this.creditBtn.setScale(0.8); });

// Event klik untuk pindah scene
this.creditBtn.on('pointerdown', () => {
    this.playMenuSFX('sfx_pop');
    
    // Transisi fade out sebelum pindah ke scene credit
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('credit'); // Pastikan nama scene 'credit' sesuai dengan class creditScene kamu
    });
});

    // 6. POPUP RESET GAME (Muncul kalau pencet tombol reset di setting)
    btnReset.on('pointerdown', () => {
        this.playMenuSFX('sfx_pop');
        
        // Sembunyiin pengaturan bentar biar gak ketumpuk
        this.settingBlocker.setVisible(false);
        this.settingContainer.setVisible(false);
        
        // Panggil popup konfirmasi reset
        this.resetBlocker.setVisible(true);
        this.resetContainer.setVisible(true);
        this.tweens.add({ targets: this.resetContainer, scale: 1, duration: 250, ease: 'Back.out' });
    });

    this.resetBlocker = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7)
        .setDepth(150).setInteractive().setVisible(false);

    this.resetContainer = this.add.container(width/2, height/2)
        .setDepth(151).setVisible(false).setScale(0.8);

    const popupResetImg = this.add.image(0, -27, 'popup_reset').setScale(0.49);
    const btnResetYes = this.add.image(-100, 38, 'btn_yes').setScale(0.092).setInteractive({ useHandCursor: true });
    const btnResetNo = this.add.image(60, 38, 'btn_no').setScale(0.092).setInteractive({ useHandCursor: true });

    this.resetContainer.add([popupResetImg, btnResetYes, btnResetNo]);

    // Eksekusi kalau milih YES (beneran hapus data)
    btnResetYes.on('pointerdown', () => {
        this.playMenuSFX('sfx_pop');
        
        // Amankan data setting audio biar gak keriset juga
        let m = localStorage.getItem('music_on');
        let s = localStorage.getItem('sfx_on');
        
        localStorage.clear(); 
        
        if(m) localStorage.setItem('music_on', m);
        if(s) localStorage.setItem('sfx_on', s);
        
        // Kasih transisi fade out trus restart layar
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart();
        });
    });

    // Eksekusi kalau milih NO (gak jadi)
    btnResetNo.on('pointerdown', () => {
        this.playMenuSFX('sfx_pop');
        this.resetBlocker.setVisible(false);
        this.resetContainer.setVisible(false);
        this.resetContainer.setScale(0.8); 
        
        // Tunjukin pengaturan lagi
        this.settingBlocker.setVisible(true);
        this.settingContainer.setVisible(true);
    });

    // Efek hover buat tombol yes/no reset
    [btnResetYes, btnResetNo].forEach(btn => {
        btn.on('pointerover', () => btn.setTint(0xeeeeee));
        btn.on('pointerout', () => btn.clearTint());
    });

    // 7. NASKAH CERITA VISUAL NOVEL
    this.storyData = [
      { text: "Halo Seniman! Selamat datang di Draw The Flag.", sprite: 'char_welcome' },
      { text: "Perkenalkan, aku Pemandu Misi. Aku yang akan menemani perjalananmu di dunia yang penuh warna ini.", sprite: 'char_intro' },
      { text: "Tapi tunggu... ada yang aneh. Akhir-akhir ini, banyak bendera negara kehilangan warnanya secara misterius.", sprite: 'char_thinking' },
      { text: "Tanpa warna, identitas negara-negara itu menghilang! Kita tidak bisa membiarkan kekacauan ini terjadi.", sprite: 'char_explain' },
      { text: "Di sinilah misimu dimulai! Kembalikan identitas negara-negara tersebut dengan mewarnai kembali bendera mereka yang telah memudar.", sprite: 'char_explain' },
      // Masuk bagian tutorial visual
      { text: "Pertama, pilih warna yang tepat dari palet. Sebagai contoh, aku membutuhkan warna merah.", sprite: 'char_explain', showTutorial: true, tutImageKey: 'tutorial_img', imageScale: 0.55, pointerText: "1. Pilih Palet Warna", pointerX: 310, pointerY: 80 },
      { text: "Kedua, klik pada bagian kanvas bendera yang kosong untuk mewarnainya sesuai warnanya.", sprite: 'char_explain', showTutorial: true, tutImageKey: 'tutorial2_img', imageScale: 0.55, pointerText: "2. Warnai Canvas", pointerX: -50, pointerY: 0 },
      { text: "Ketiga, perhatikan batas waktu di atas! Jika waktu habis sebelum bendera selesai, kamu kalah.", sprite: 'char_thinking', showTutorial: true, tutImageKey: 'tutorial2_img', imageScale: 0.8, pointerText: "3. Perhatikan Waktu!", pointerX: 175, pointerY: -140 },
      { text: "Hati-hati dan perhatikan posisinya ya! Jangan sampai warnanya tertukar atau salah tempat.", sprite: 'char_thinking' },
      { text: "Aku sangat percaya pada kemampuan senimu untuk menyelamatkan dunia ini. Selamat bermain, Seniman!", sprite: 'char_goodluck' }
    ];
    this.currentStoryIndex = 0;
    this.isTyping = false;

    // EVENT SAAT KLIK TOMBOL PLAY
    this.playBtn.on('pointerdown', () => {
      this.playMenuSFX('sfx_pop');
      pulseTween.stop();
      this.playBtn.disableInteractive(); 
      this.startIntro();
    });

    // EVENT SAAT KLIK SKIP
    this.skipBtn.on('pointerdown', () => {
        this.playMenuSFX('sfx_pop');
        this.tweens.add({
            targets: this.skipBtn, scale: 0.106, duration: 20, ease: 'Quad.easeIn',
            onComplete: () => {
                this.tweens.add({ targets: this.skipBtn, scale: 0.103, duration: 120, ease: 'Back.easeOut' });
            }
        });
        this.introClickZone.disableInteractive();
        this.toggleConfirmDialog(true);
    });

    // Tombol di dalam konfirmasi skip
    btnYes.on('pointerdown', () => {
        this.playMenuSFX('sfx_pop');
        this.toggleConfirmDialog(false);
        this.playCinematicTransition(); // Langsung terjun ke layar pilih level
    });

    btnNo.on('pointerdown', () => {
        this.playMenuSFX('sfx_pop');
        this.toggleConfirmDialog(false);
        this.introClickZone.setInteractive({ useHandCursor: true }); // Batal, lanjut baca cerita
    });
    
    // Hover efek biasa
    this.skipBtn.on('pointerover', () => { this.skipBtn.setTint(0xeeeeee); });
    this.skipBtn.on('pointerout', () => { this.skipBtn.clearTint(); });
    btnYes.on('pointerover', () => { btnYes.setTint(0xeeeeee); });
    btnYes.on('pointerout', () => { btnYes.clearTint(); });
    btnNo.on('pointerover', () => { btnNo.setTint(0xeeeeee); });
    btnNo.on('pointerout', () => { btnNo.clearTint(); });

    // EVENT LANJUTIN CERITA (KLIK LAYAR)
    this.introClickZone.on('pointerdown', () => {
      // Kalau teks lagi jalan ngetik dan player gak sabar, langsung tampilin utuh
      if (this.isTyping) {
        if (this.timer) this.timer.destroy();
        this.dialogText.setText(this.storyData[this.currentStoryIndex].text);
        this.isTyping = false;
        this.nextIndicator.setAlpha(1);
      } else {
        // Pindah ke kalimat selanjutnya
        this.currentStoryIndex++;
        if (this.currentStoryIndex < this.storyData.length) {
          this.showDialog();
        } else {
          // Kalau udah kelar naskahnya, langsung transisi
          this.introClickZone.disableInteractive(); 
          this.playCinematicTransition(); 
        }
      }
    });
  }

  // Fungsi buat animasiin popup skip cerita
  toggleConfirmDialog(show) {
    this.confirmBlocker.setVisible(show);
    this.confirmContainer.setVisible(show);
    if(show) {
        this.tweens.add({ targets: this.confirmContainer, scale: 1, duration: 200, ease: 'Back.out' });
    } else {
        this.confirmContainer.setScale(0.8); 
    }
  }

  // Fungsi buat mulai masuk sesi narasi awal
  startIntro() {
    this.introClickZone.setActive(true).setVisible(true);
    this.skipBtn.setActive(true);
    this.settingBtn.setVisible(false);
    this.creditBtn.setVisible(false); 

    // Kecilin lagu menu pas cerita mulai
    if (localStorage.getItem('music_on') !== 'false') {
        this.tweens.add({ targets: this.bgm, volume: 0.2, duration: 1000, ease: 'Sine.easeInOut' });
    }

    // Munculin UI narasi perlahan pakai fade-in
    this.tweens.add({
      targets: [this.overlay, this.character, this.dialogBox, this.dialogText, this.nameBox, this.nameText, this.skipBtn],
      alpha: 1, duration: 500,
      onComplete: () => {
        this.showDialog();
        // Bikin karakternya gerak-gerak napas dikit
        this.tweens.add({ targets: this.character, y: this.character.y + 10, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    });
  }

  // Fungsi nampilin isi cerita satu-satu
  showDialog() {
    const currentData = this.storyData[this.currentStoryIndex];
    this.nextIndicator.setAlpha(0); 
    this.playMenuSFX('sfx_pop', { volume: 0.6 });

    // Bagian nampilin gambar tutorial khusus kalau properti showTutorial-nya nyala
    if (currentData.showTutorial) {
        if (this.tutorialContainer.alpha === 0) {
            this.tutImage.setTexture(currentData.tutImageKey); 
            this.tutImage.setScale(currentData.imageScale); 
            this.tutPointer.setPosition(currentData.pointerX, currentData.pointerY);            
            this.tweens.add({ targets: this.tutorialContainer, alpha: 1, duration: 300 });
        } 
        else if (this.tutImage.texture.key !== currentData.tutImageKey) {
            this.tweens.add({
                targets: this.tutImage, alpha: 0, scale: currentData.imageScale - 0.05, duration: 150,
                onComplete: () => {
                    this.tutImage.setTexture(currentData.tutImageKey); 
                    this.tweens.add({ targets: this.tutImage, alpha: 1, scale: currentData.imageScale, duration: 150, ease: 'Back.out' });
                }
            });
        }

        this.tutText.setText(currentData.pointerText);
        this.bubbleContainer.setScale(0); 
        this.tweens.add({ targets: this.bubbleContainer, scale: 1, duration: 400, ease: 'Back.out' });

        if (this.pointerBounceTween) this.pointerBounceTween.stop(); 
        if (this.tutorialContainer.alpha === 1) { 
            this.playMenuSFX('sfx_woosh', { volume: 0.8 });
        }

        this.tweens.add({
            targets: this.tutPointer, x: currentData.pointerX, y: currentData.pointerY, duration: 400, ease: 'Cubic.easeOut', 
            onComplete: () => {
                this.pointerBounceTween = this.tweens.add({ targets: this.tutPointer, y: currentData.pointerY - 15, duration: 350, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            }
        });
    } else {
        // Hilangin tutorial kalau kalimatnya udah lewat bagian instruksi
        this.tweens.add({ targets: this.tutorialContainer, alpha: 0, duration: 300 });
    }

    // Ganti ekspresi karakter kayak nyusut terus membesar lagi cepet (squash and stretch)
    this.tweens.add({
      targets: this.character, scaleY: 0.75, scaleX: 0.85, duration: 120, yoyo: true, ease: 'Quad.easeOut',
      onYoyo: () => this.character.setTexture(currentData.sprite)
    });

    // Efek ngetik teks
    this.dialogText.setText('');
    this.isTyping = true;
    let i = 0;

    if (this.timer) this.timer.destroy();
    this.timer = this.time.addEvent({
      delay: 35,
      callback: () => {
        this.dialogText.text += currentData.text[i];
        i++;
        if (i === currentData.text.length) {
          this.isTyping = false;
          this.nextIndicator.setAlpha(1); 
        }
      },
      repeat: currentData.text.length - 1
    });
  }

  // Efek zoom layarnya memutih pas kelar dari intro sebelum masuk ke map level
  playCinematicTransition() {
    this.tweens.add({
      targets: [this.tutorialContainer, this.character, this.dialogBox, this.dialogText, this.overlay, this.nameBox, this.nameText, this.nextIndicator, this.skipBtn, this.playBtn, this.titleText],
      alpha: 0, duration: 800, ease: 'Power2'
    });

    this.playMenuSFX('sfx_transition', { volume: 0.8 }); 
  
    if (localStorage.getItem('music_on') !== 'false') {
        this.tweens.add({ targets: this.bgm, volume: 0, duration: 1000 }); 
    }
  
    this.cameras.main.zoomTo(1.1, 3000, 'Sine.easeInOut');
    this.cameras.main.fadeOut(3000, 255, 255, 255); 
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.cameras.main.setZoom(1); 
      this.scene.start('level');
    });
  }
}

// Konfigurasi dasar buat jalanin gamenya pakai Phaser
const config = {
  type: Phaser.WEBGL, 
  width: 1344, 
  height: 720, 
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT, 
    autoCenter: Phaser.Scale.CENTER_BOTH 
  },
  resolution: window.devicePixelRatio || 1, 
  antialias: true,
  antialiasGL: true, 
  roundPixels: false, 
  // Urutan scene-nya didaftarin di sini (Menu paling awal)
 scene: [loadingScene, menuScene, creditScene, levelScene, gameplayScene1, gameplayScene2, gameplayScene3, gameplayScene4, gameplayScene5, gameplayScene6,  gameplayScene7, gameplayScene8, gameplayScene9, gameplayScene10, gameplayScene11, gameplayScene12,  gameplayScene13, gameplayScene14, gameplayScene15, gameplayScene16, gameplayScene17, gameplayScene18, gameplayScene19, gameplayScene20  ],
};

new Phaser.Game(config);