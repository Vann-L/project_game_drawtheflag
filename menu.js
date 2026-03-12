class menuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  preload() {
    this.load.image('bg', 'asset/BG MAIN MENU.png');
    this.load.image('btnPlay', 'asset/TOMBOL PLAY.png');
    this.load.image('title', 'asset/title.png');
    
    // 5 ASET KARAKTER
    this.load.image('char_welcome', 'asset/wellcome.png');
    this.load.image('char_intro', 'asset/introduce.png');
    this.load.image('char_explain', 'asset/explaining.png');
    this.load.image('char_thinking', 'asset/thingking.png');
    this.load.image('char_goodluck', 'asset/goodluck.png');

    // 🔥 PRELOAD 3 ASET TUTORIAL BARU
    this.load.image('tutorial_img', 'asset/tutorial.png');
    this.load.image('tutorial2_img', 'asset/tutorial2.png');
    this.load.image('tutorial3_img', 'asset/tutorial3.png');
    this.load.image('pointer', 'asset/telunjuk.png');

    // SFX & BGM
    this.load.audio('sfx_pop', 'asset/pop.mp3');
    this.load.audio('bgm_menu', 'asset/bossanova.mp3');
    this.load.audio('sfx_transition', 'asset/transisi.mp3');
    
    // 🔥 PRELOAD SFX BARU UNTUK POINTER
    this.load.audio('sfx_woosh', 'asset/woosh.mp3'); 

    // tomol skip
    this.load.image('btn_skip', 'asset/btn_skip.png');

    // POPUP CONFIRM
    this.load.image('popup_confirm', 'asset/popup_confirm.png');
    this.load.image('btn_yes', 'asset/btn_yes.png');
    this.load.image('btn_no', 'asset/btn_no.png');
  }

  create() {
    const width = 1344;
    const height = 720;

    // MAININ BGM PAS MASUK MENU
    this.bgm = this.sound.add('bgm_menu', { volume: 0.8, loop: true });
    this.bgm.play();

    // === 1. BACKGROUND === 
    this.bg = this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);

    // === 2. PROCEDURAL PARTICLES ===
    const gfx = this.add.graphics();
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(4, 4, 4);
    gfx.generateTexture('magic_dust', 8, 8);
    gfx.destroy();

    this.add.particles(0, 0, 'magic_dust', {
      x: { min: 0, max: width }, y: { min: height, max: height + 100 },
      lifespan: { min: 4000, max: 8000 },
      speedY: { min: -20, max: -60 }, speedX: { min: -10, max: 10 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      quantity: 1, blendMode: 'ADD'
    }).setDepth(5);

    // === 3. JUDUL & TOMBOL PLAY ===
    const title = this.add.image(width / 2, height * 0.38, 'title').setAlpha(0);
    this.tweens.add({ targets: title, y: height * 0.35, alpha: 1, duration: 800, ease: 'Power3' });

    this.playBtn = this.add.image(width / 2, height * 0.65, 'btnPlay')
      .setScale(0.5).setInteractive({ useHandCursor: true }).setDepth(6);
    this.titleText = title; 

    const pulseTween = this.tweens.add({
      targets: this.playBtn, scale: 0.53, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // === 4. SETUP UI VISUAL NOVEL ===
    this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(10).setAlpha(0);
    this.character = this.add.image(300, height - 250, 'char_welcome').setDepth(11).setAlpha(0).setScale(0.8);
    this.dialogBox = this.add.rectangle(width / 2, height - 100, width - 150, 150, 0x000000, 0.8).setDepth(11).setAlpha(0).setStrokeStyle(4, 0xffffff);
    
    this.nameBox = this.add.rectangle(100, height - 195, 200, 40, 0xffffff, 0.9).setDepth(11).setAlpha(0).setOrigin(0);
    this.nameText = this.add.text(120, height - 185, 'Pemandu Misi', { fontSize: '20px', fontFamily: 'Arial', color: '#000000', fontStyle: 'bold' }).setDepth(12).setAlpha(0);

    this.dialogText = this.add.text(100, height - 140, '', {
      fontSize: '26px', fontFamily: 'Arial', color: '#ffffff', wordWrap: { width: width - 200 }, lineSpacing: 10
    }).setDepth(12).setAlpha(0);

    this.nextIndicator = this.add.text(width - 120, height - 60, '▼', { fontSize: '24px', color: '#ffffff' })
      .setDepth(12).setAlpha(0);
    this.tweens.add({ targets: this.nextIndicator, y: height - 55, duration: 400, yoyo: true, repeat: -1 });

    // 🔥 4.5 SETUP UI POPUP TUTORIAL LENGKAP
    this.tutorialContainer = this.add.container(width / 2 + 166, height / 2 - 80).setDepth(10.5).setAlpha(0);
    
    this.tutImage = this.add.image(0, 40, 'tutorial_img').setScale(0.4);
    
    this.bubbleContainer = this.add.container(-300, 20); 

    this.tutTextBg = this.add.graphics();
    this.tutTextBg.fillStyle(0xffffff, 1); 
    this.tutTextBg.fillRoundedRect(-140, -25, 280, 50, 25); 
    this.tutTextBg.lineStyle(4, 0x000000, 1); 
    this.tutTextBg.strokeRoundedRect(-140, -25, 280, 50, 25);
    
    this.tutText = this.add.text(0, 0, '', { 
        fontSize: '22px', fontFamily: 'Arial', color: '#000000', fontStyle: 'bold' 
    }).setOrigin(0.5);

    this.bubbleContainer.add([this.tutTextBg, this.tutText]);

    this.tutPointer = this.add.image(0, 0, 'pointer').setScale(0.06); 
    this.pointerBounceTween = null; 

    this.tutorialContainer.add([this.tutImage, this.bubbleContainer, this.tutPointer]);

// 🔥 TOMBOL SKIP (PAKAI GAMBAR)
this.skipBtn = this.add.image(width - 130, 60, 'btn_skip')
    .setScale(0.103)
    .setDepth(21)
    .setAlpha(0)
    .setInteractive({ useHandCursor: true });
    this.introClickZone = this.add.zone(width / 2, height / 2, width, height).setInteractive({ useHandCursor: true }).setDepth(20).setActive(false).setVisible(false);

   // === POPUP KONFIRMASI (PAKAI GAMBAR) ===
this.confirmBlocker = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7)
    .setDepth(30)
    .setInteractive()
    .setVisible(false);

this.confirmContainer = this.add.container(width/2, height/2)
    .setDepth(31)
    .setVisible(false)
    .setScale(0.8);

// GAMBAR POPUP
const popupImg = this.add.image(0, -27, 'popup_confirm').setScale(0.49);

// TOMBOL YA
const btnYes = this.add.image(-100, 38, 'btn_yes')
    .setScale(0.092)
    .setInteractive({ useHandCursor: true });

// TOMBOL TIDAK
const btnNo = this.add.image(60, 38, 'btn_no')
    .setScale(0.092)
    .setInteractive({ useHandCursor: true });

// MASUKKAN KE CONTAINER
this.confirmContainer.add([popupImg, btnYes, btnNo]);


    // ==========================================================
    // === DATA CERITA (DENGAN PENGATURAN UKURAN & POINTER) ===
    // ==========================================================
    this.storyData = [
      { text: "Halo Seniman! Selamat datang di Draw The Flag.", sprite: 'char_welcome' },
      { text: "Perkenalkan, aku Pemandu Misi. Aku yang akan menemani perjalananmu di dunia yang penuh warna ini.", sprite: 'char_intro' },
      { text: "Tapi tunggu... ada yang aneh. Akhir-akhir ini, banyak bendera negara kehilangan warnanya secara misterius.", sprite: 'char_thinking' },
      { text: "Tanpa warna, identitas negara-negara itu menghilang! Kita tidak bisa membiarkan kekacauan ini terjadi.", sprite: 'char_explain' },
      { text: "Di sinilah misimu dimulai! Kembalikan identitas negara-negara tersebut dengan mewarnai kembali bendera mereka yang telah memudar.", sprite: 'char_explain' },
      
      // 🔥 TUTORIAL 1: MEMILIH WARNA (GAMBAR 1)
      { 
        text: "Pertama, pilih warna yang tepat dari palet. Sebagai contoh, aku membutuhkan warna merah.", 
        sprite: 'char_explain',
        showTutorial: true, 
        tutImageKey: 'tutorial_img', 
        imageScale: 0.4,       
        pointerText: "1. Pilih Palet Warna",
        pointerX: 310,         
        pointerY: 80          
      },
      
      // 🔥 TUTORIAL 2: MENGECAT CANVAS (GAMBAR 2)
      { 
        text: "Kedua, klik pada bagian kanvas bendera yang kosong untuk mewarnainya sesuai warnanya.", 
        sprite: 'char_explain',
        showTutorial: true, 
        tutImageKey: 'tutorial2_img', 
        imageScale: 0.4,       
        pointerText: "2. Warnai Canvas",
        pointerX: -50,
        pointerY: 0
      },

      // 🔥 TUTORIAL 3: PERHATIKAN WAKTU (GAMBAR 3)
      { 
        text: "Ketiga, perhatikan batas waktu di atas! Jika waktu habis sebelum bendera selesai, kamu kalah.", 
        sprite: 'char_thinking',
        showTutorial: true, 
        tutImageKey: 'tutorial2_img', // Sesuai kode lu sebelumnya pake tutorial2_img
        imageScale: 0.8,       
        pointerText: "3. Perhatikan Waktu!",
        pointerX: 175,           
        pointerY: -140         
      },
      
      { text: "Hati-hati dan perhatikan posisinya ya! Jangan sampai warnanya tertukar atau salah tempat.", sprite: 'char_thinking' },
      { text: "Aku sangat percaya pada kemampuan senimu untuk menyelamatkan dunia ini. Selamat bermain, Seniman!", sprite: 'char_goodluck' }
    ];
    this.currentStoryIndex = 0;
    this.isTyping = false;

    // === LOGIKA KLIK ===
    this.playBtn.on('pointerdown', () => {
      pulseTween.stop();
      this.playBtn.disableInteractive(); 
      this.startIntro();
    });

    this.skipBtn.on('pointerdown', () => {
 this.tweens.add({
        targets: this.skipBtn,
        scale: 0.106,     // tekan
        duration: 20,
        ease: 'Quad.easeIn',
        onComplete: () => {

            this.tweens.add({
                targets: this.skipBtn,
                scale: 0.103,   // memantul sedikit
                duration: 120,
                ease: 'Back.easeOut'
            });

        }
    });
    this.introClickZone.disableInteractive();
    this.toggleConfirmDialog(true);
});

 
btnYes.on('pointerdown', () => {
    this.toggleConfirmDialog(false);
    this.playCinematicTransition();
});

btnNo.on('pointerdown', () => {
    this.toggleConfirmDialog(false);
    this.introClickZone.setInteractive({ useHandCursor: true });
});
    
     //===== efek efek button =====
     //efek skip
    this.skipBtn.on('pointerover', () => {
    this.skipBtn.setTint(0xeeeeee); // sedikit gelap
});

    this.skipBtn.on('pointerout', () => {
    this.skipBtn.clearTint(); // balik normal
});
   //efek yes
    btnYes.on('pointerover', () => {
    btnYes.setTint(0xeeeeee);
});

    btnYes.on('pointerout', () => {
    btnYes.clearTint();
});
    //efek no
    btnNo.on('pointerover', () => {
    btnNo.setTint(0xeeeeee);
});

    btnNo.on('pointerout', () => {
    btnNo.clearTint();
});

    

    this.introClickZone.on('pointerdown', () => {
      if (this.isTyping) {
        if (this.timer) this.timer.destroy();
        this.dialogText.setText(this.storyData[this.currentStoryIndex].text);
        this.isTyping = false;
        this.nextIndicator.setAlpha(1);
      } else {
        this.currentStoryIndex++;
        if (this.currentStoryIndex < this.storyData.length) {
          this.showDialog();
        } else {
          this.introClickZone.disableInteractive(); 
          this.playCinematicTransition(); 
        }
      }
    });

   
  }

  toggleConfirmDialog(show) {
    this.confirmBlocker.setVisible(show);
    this.confirmContainer.setVisible(show);
    if(show) {
        this.tweens.add({ targets: this.confirmContainer, scale: 1, duration: 200, ease: 'Back.out' });
    } else {
        this.confirmContainer.setScale(0.8); 
    }
  }

  startIntro() {
    this.introClickZone.setActive(true).setVisible(true);
   this.skipBtn.setActive(true);
    this.tweens.add({ targets: this.bgm, volume: 0.2, duration: 1000, ease: 'Sine.easeInOut' });
    this.tweens.add({
      targets: [this.overlay, this.character, this.dialogBox, this.dialogText, this.nameBox, this.nameText, this.skipBtn],
      alpha: 1, duration: 500,
      onComplete: () => {
        this.showDialog();
        this.tweens.add({ targets: this.character, y: this.character.y + 10, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    });
  }

  showDialog() {
    const currentData = this.storyData[this.currentStoryIndex];
    this.nextIndicator.setAlpha(0); 
    this.sound.play('sfx_pop', { volume: 0.6 });

    // === LOGIKA TUTORIAL VISUAL & TRANSISI GAMBAR ===
    if (currentData.showTutorial) {
        // 1. Kalo container tutorial masih ngumpet (pertama kali muncul)
        if (this.tutorialContainer.alpha === 0) {
            this.tutImage.setTexture(currentData.tutImageKey); 
            this.tutImage.setScale(currentData.imageScale); 
            
            // Set posisi pointer awal dan mainin suara woosh pertama
            this.tutPointer.setPosition(currentData.pointerX, currentData.pointerY);            
            this.tweens.add({ targets: this.tutorialContainer, alpha: 1, duration: 300 });
        } 
        // 2. Kalo udah muncul tapi gambarnya beda (Ganti langkah)
        else if (this.tutImage.texture.key !== currentData.tutImageKey) {
            this.tweens.add({
                targets: this.tutImage,
                alpha: 0,
                scale: currentData.imageScale - 0.05, 
                duration: 150,
                onComplete: () => {
                    this.tutImage.setTexture(currentData.tutImageKey); 
                    this.tweens.add({
                        targets: this.tutImage,
                        alpha: 1,
                        scale: currentData.imageScale, 
                        duration: 150,
                        ease: 'Back.out'
                    });
                }
            });
        }

        // 3. Efek Animasi Boks Teks (Scale Pop-Up)
        this.tutText.setText(currentData.pointerText);
        this.bubbleContainer.setScale(0); 
        this.tweens.add({ 
            targets: this.bubbleContainer, 
            scale: 1, 
            duration: 400, 
            ease: 'Back.out' 
        });

        // 4. Efek Pointer Pindah & Lompat-lompat
        if (this.pointerBounceTween) this.pointerBounceTween.stop(); 

        // Mainin suara woosh pas pointernya mulai jalan pindah ke lokasi baru
        if (this.tutorialContainer.alpha === 1) { 
            this.sound.play('sfx_woosh', { volume: 2.0 }); // 🔥 PLAY SFX WOOSH DI SINI JUGA
        }

        this.tweens.add({
            targets: this.tutPointer,
            x: currentData.pointerX,
            y: currentData.pointerY,
            duration: 400,
            ease: 'Cubic.easeOut', 
            onComplete: () => {
                this.pointerBounceTween = this.tweens.add({
                    targets: this.tutPointer,
                    y: currentData.pointerY - 15, 
                    duration: 350,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

    } else {
        // Hilangkan layar tutorial jika dialog sudah lewat
        this.tweens.add({ targets: this.tutorialContainer, alpha: 0, duration: 300 });
    }

    // === LOGIKA DIALOG TEKS BAWAAN ===
    this.tweens.add({
      targets: this.character, scaleY: 0.75, scaleX: 0.85, duration: 120, yoyo: true, ease: 'Quad.easeOut',
      onYoyo: () => this.character.setTexture(currentData.sprite)
    });

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

  playCinematicTransition() {
    this.tweens.add({
      targets: [this.tutorialContainer, this.character, this.dialogBox, this.dialogText, this.overlay, this.nameBox, this.nameText, this.nextIndicator, this.skipBtn, this.playBtn, this.titleText],
      alpha: 0, duration: 800, ease: 'Power2'
    });

    this.sound.play('sfx_transition', { volume: 0.8 }); 
    this.tweens.add({ targets: this.bgm, volume: 0, duration: 3000 });
    this.cameras.main.zoomTo(1.1, 3000, 'Sine.easeInOut');
    this.cameras.main.fadeOut(3000, 255, 255, 255); 

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.cameras.main.setZoom(1); 
      this.bgm.stop(); 
      this.scene.start('level');
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1344, 
  height: 720, 
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.NONE, 
    autoCenter: Phaser.Scale.CENTER_BOTH 
  },
  canvasStyle: 'width: 100vw; height: 100vh; object-fit: fill;',
  scene: [menuScene, levelScene, gameplayScene1], 
  
};

new Phaser.Game(config);