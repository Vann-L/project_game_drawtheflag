class gameplayScene1 extends Phaser.Scene {
    constructor() {
        super('gameplay1');
    }

    preload() {
        // 1. LOAD ASET
        this.load.image('bgBoard', 'asset/Gameplay.png'); 
        this.load.image('btnBack', 'asset/tombolback.png');
        this.load.image('btnHint', 'asset/petunjuk.png'); 
        this.load.image('paletMerah', 'asset/paletmerah.png'); 
        this.load.image('paletPutih', 'asset/paletputih.png');
        this.load.image('bgKuas', 'asset/penampungkuas.png');
        this.load.image('gagangKuas', 'asset/gagang_kuas.png'); 
        this.load.image('buluKuas', 'asset/bulu_kuas.png');
        this.load.image('iconjam', 'asset/ICON JAM.png');

        this.load.image('winBG', 'asset/tulisan_menang.png');
        this.load.image('btnHome', 'asset/home.png');
        this.load.image('btnReplay', 'asset/ulang.png');
        this.load.image('btnNext', 'asset/next.png');
        this.load.image('flagIndonesia', 'asset/bendera_indonesia.png');

        this.load.image('loseText', 'asset/tulisan_kalah.png');
        this.load.image('iconX', 'asset/x.png');
        this.load.image('btnReplayLose', 'asset/replay_kalah.png');
        this.load.image('btnHomeLose', 'asset/home_kalah.png');

        this.load.image('hintBG','asset/popuphint.png');
        this.load.image('btnYes','asset/btn_yes.png');
        this.load.image('btnNo','asset/btn_no.png');

        this.load.audio('suaraKuas', 'asset/suara_kuas.mp3');
            this.load.audio('pop', 'asset/pop.mp3');
        this.load.audio('soundMenang', 'asset/menang.mp3'); 
        this.load.audio('soundKalah', 'asset/kalah.mp3'); 
    }

    create() {

        this.usedHintQuestions = [];
        //============ jawaban warna bendera ============
        this.flagAnswers = [
        {
        text:"ATAS MERAH - BAWAH PUTIH",
        top:0xD9252B,
        bottom:0xFFFFFF
        },
        {
        text:"MERAH DI BAGIAN ATAS",
        top:0xD9252B
        },
        {
        text:"PUTIH DI BAGIAN BAWAH",
        bottom:0xFFFFFF
        }
        ];

        // ================= SISTEM HINT =================
        let hintData = localStorage.getItem('hintData');
        if (hintData === null) {
            this.hintCount = 3;
            localStorage.setItem('hintData', 3);
        } else {
            this.hintCount = parseInt(hintData);
        }

        //========== soal hint ===============
        this.hintQuestions = [
        {q:"Apa warna atas bendera Indonesia?",a:"Merah",b:"Putih",c:"Biru",d:"Kuning",correct:"a"},
        {q:"Apa warna bawah bendera Indonesia?",a:"Hijau",b:"Putih",c:"Merah",d:"Biru",correct:"b"},
        {q:"Bendera Jepang warna apa?",a:"Merah Putih",b:"Merah",c:"Putih",d:"Biru",correct:"b"},
        {q:"Bendera Perancis ada berapa warna?",a:"2",b:"3",c:"4",d:"5",correct:"b"},
        // tambahkan sampai 22
        ]

        const { width, height } = this.scale;

        // 1. PASANG BACKGROUND
        this.add.image(width / 2, height / 2, 'bgBoard').setDisplaySize(width, height);

        // ==================================================================
        // 🔥 PENGATURAN POSISI & UKURAN 🔥
        // ==================================================================
        const boardX = width / 2.04; 
        const boardY = height / 2 + 13; 
        const flagW = 512; 
        const flagH = 306; 
        const halfHeight = flagH / 2;

        // --- VARIABEL ---
        this.selectedColor = null; 
        this.isAnimating = false; 

        // --- FUNGSI ARSIRAN (Background) ---
        const createStripes = (x, y, w, h) => {
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0xAAAAAA, 0.5); 
            
            for (let i = -w; i < w + h; i += 15) { 
                graphics.beginPath();
                graphics.moveTo(x - w/2 + i, y - h/2);
                graphics.lineTo(x - w/2 + i - h, y + h/2);
                graphics.strokePath();
            }
            
            // Masking
            const maskShape = this.make.graphics();
            maskShape.fillStyle(0xffffff);
            maskShape.fillRect(x - w/2, y - h/2, w, h);
            const mask = maskShape.createGeometryMask();
            graphics.setMask(mask);
            
            return graphics;
        };

        // --- AREA 1: ATAS (TARGET MERAH) ---
        const topY = boardY - (halfHeight / 2);
        const stripesTop = createStripes(boardX, topY, flagW, halfHeight);
        const zoneTop = this.add.rectangle(boardX, topY, flagW, halfHeight, 0xFFFFFF)
            .setInteractive({ useHandCursor: true }).setAlpha(0.01); 

        // --- AREA 2: BAWAH (TARGET PUTIH) ---
        const bottomY = boardY + (halfHeight / 2);
        const stripesBottom = createStripes(boardX, bottomY, flagW, halfHeight);
        const zoneBottom = this.add.rectangle(boardX, bottomY, flagW, halfHeight, 0xFFFFFF)
            .setInteractive({ useHandCursor: true }).setAlpha(0.01);

        // --- 🔥 GARIS HITAM & BINGKAI 🔥 ---
        this.add.rectangle(boardX, boardY, flagW, 3, 0x000000).setDepth(20);
        this.add.rectangle(boardX, boardY, flagW, flagH)
            .setStrokeStyle(3, 0x000000).setDepth(20);

        // --- 🖌️ IKON KUAS ---
        this.add.image(width - 185, height - 95, 'bgKuas').setScale(0.7);
        const gagang = this.add.image(0, 0, 'gagangKuas');
        this.bulu = this.add.image(0, 0, 'buluKuas'); 

        this.brushContainer = this.add.container(width - 185, height - 100, [gagang, this.bulu])
            .setScale(0.2)
            .setDepth(30);

        // ==================================================================
        // 🔥 LOGIC MEWARNAI: "LIQUID FILL" (PASTI PENUH & SMOOTH) 🔥
        // ==================================================================
        const paintZone = (zone, stripesObj) => {
            if (this.selectedColor === null) {
                this.tweens.add({ targets: zone, x: zone.x + 5, duration: 50, yoyo: true, repeat: 3 });
                return;
            }

            const currentColor = zone.getData('colorCode');
            if (zone.getData('isPainting') || currentColor === this.selectedColor) return;

            zone.setData('isPainting', true);
            this.isAnimating = true; // 🔥 NYALAIN GEMBOK

            const paintColor = this.selectedColor; 

            const paintGraphics = this.add.graphics().setDepth(5);
            
            const maskShapeLocal = this.make.graphics();
            maskShapeLocal.fillStyle(0xffffff);
            maskShapeLocal.fillRect(zone.x - zone.width/2, zone.y - zone.height/2, zone.width, zone.height);
            const maskLocal = maskShapeLocal.createGeometryMask();
            paintGraphics.setMask(maskLocal);

            const startX = zone.x - zone.width / 2; 
            const startY = zone.y;                
            const zoneW = zone.width;
            const zoneH = zone.height;

            this.tweens.add({
                targets: this.brushContainer,
                x: startX,
                y: startY,
                angle: -20,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    startPainting();
                }
            });

            const startPainting = () => {
                let sfx = this.sound.add('suaraKuas', { volume: 5.0 });
                sfx.play();

                const animData = { progress: 0 }; 

                this.tweens.add({
                    targets: animData,
                    progress: 1, 
                    duration: 1000, 
                    ease: 'Linear', 
                    
                    onUpdate: () => {
                        paintGraphics.clear();
                        paintGraphics.fillStyle(paintColor, 1);

                        const currentX = startX + (animData.progress * zoneW);
                        const wobble = Math.sin(animData.progress * 15) * 10;
                        const currentY = startY + wobble;

                        paintGraphics.fillRect(startX, startY - zoneH/2 - 10, (currentX - startX), zoneH + 20);

                        const brushHeadSize = zoneH / 2 + 10; 
                        paintGraphics.fillCircle(currentX, currentY, brushHeadSize);

                        this.brushContainer.x = currentX + 30;
                        this.brushContainer.y = currentY - 40;
                        this.brushContainer.setAngle(-20 + Math.cos(animData.progress * 20) * 10);
                    },

                    onComplete: () => {
                        sfx.stop();

                        this.tweens.add({
                            targets: this.brushContainer,
                            x: width - 185,
                            y: height - 100,
                            angle: 0,
                            duration: 500,
                            ease: 'Back.out'
                        });

                        if (stripesObj.active) stripesObj.destroy();
                        
                        zone.setFillStyle(paintColor);
                        zone.setAlpha(1);
                        
                        paintGraphics.destroy();
                        maskShapeLocal.destroy();

                        zone.setData('colorCode', paintColor);
                        zone.setData('isPainting', false);
                        this.isAnimating = false; // 🔥 MATIIN GEMBOK

                        this.checkWinCondition(zoneTop, zoneBottom);
                    }
                });
            };
        };

        zoneTop.on('pointerdown', () => paintZone(zoneTop, stripesTop));
        zoneBottom.on('pointerdown', () => paintZone(zoneBottom, stripesBottom));


        // ================= UI ELEMENTS =================
        const tombolback = this.add.image(width * 0.055, height * 0.080, 'tombolback')
            .setScale(1)
            .setInteractive({ useHandCursor: true });

        tombolback.on('pointerover', () => { tombolback.setTint(0xeeeeee); });
        tombolback.on('pointerout', () => { tombolback.clearTint(); });
        tombolback.on('pointerdown', () => {
           this.sound.play('pop');
            tombolback.setTint(0xeeeeee);
            this.tweens.add({ targets: tombolback, scale: 0.115, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
            this.scene.start('level'); 
        });
        tombolback.on('pointerup', () => { tombolback.setTint(0xdddddd); });

        const pMerah = this.add.image(width - 90, height/1.470 - 10, 'paletMerah').setInteractive().setScale(0.8);
        pMerah.on('pointerdown', () => {
            if (this.isAnimating) return; // 🔥 CEGAH KLIK PALET
            this.sound.play('pop', { volume: 0.6 });
            this.selectedColor = 0xD9252B; 
            this.updateBrushColor(0xD9252B);
            this.tweens.add({ targets: pMerah, scale: 0.9, duration: 100, yoyo: true });
        });

        const pPutih = this.add.image(width - 90, height/1.8 + 10, 'paletPutih').setInteractive().setScale(0.8);
        pPutih.on('pointerdown', () => {
            if (this.isAnimating) return; // 🔥 CEGAH KLIK PALET
             this.sound.play('pop', { volume: 0.6 });
            this.selectedColor = 0xFFFFFF; 
            this.updateBrushColor(0xFFFFFF);
            this.tweens.add({ targets: pPutih, scale: 0.9, duration: 100, yoyo: true });
        });


        // ================= JUDUL NEGARA =================
        const titleScale = 0.46; 
        const titleWidth = 650 * titleScale;
        const titleHeight = 60 * titleScale;
        const titleX = width - 202;
        const titleY = 102;

        const titleOuter = this.add.graphics();
        titleOuter.fillStyle(0xffffff, 1);
        titleOuter.fillRoundedRect(
            titleX - titleWidth/2 - (6 * titleScale),
            titleY - titleHeight/2 - (6 * titleScale),
            titleWidth + (12 * titleScale),
            titleHeight + (12 * titleScale),
            30 * titleScale
        );
        titleOuter.lineStyle(4 * titleScale, 0x000000);
        titleOuter.strokeRoundedRect(titleX - titleWidth/2, titleY - titleHeight/2, titleWidth, titleHeight, 25 * titleScale);

        this.add.text(titleX, titleY, 'INDONESIA', {
            fontSize: (32 * titleScale) + 'px', fontFamily: 'Arial', color: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5);

        // ================= TIMER =================
        const timerScale = 0.85; 
        const barWidth = 300 * timerScale;
        const barHeight = 22 * timerScale;
        const barX = width - 347;
        const barY = 60;

        this.add.image(barX + barWidth + (40 * timerScale), barY, 'iconjam').setScale(0.1 * timerScale);

        const frame = this.add.graphics();
        frame.fillStyle(0xffffff, 1);
        frame.lineStyle(2, 0xffffff);
        frame.fillRoundedRect(barX - (6 * timerScale), barY - (16 * timerScale), barWidth + (12 * timerScale), 32 * timerScale, 16 * timerScale);
        frame.strokeRoundedRect(barX - (6 * timerScale), barY - (16 * timerScale), barWidth + (12 * timerScale), 32 * timerScale, 16 * timerScale);

        const timerBG = this.add.graphics();
        timerBG.fillStyle(0xffffff, 1);
        timerBG.lineStyle(2, 0x000000);
        timerBG.fillRoundedRect(barX, barY - barHeight/2, barWidth, barHeight, 12 * timerScale);
        timerBG.strokeRoundedRect(barX, barY - barHeight/2, barWidth, barHeight, 12 * timerScale);

        const timerFill = this.add.graphics();

        const maskShapeTimer = this.make.graphics();
        maskShapeTimer.fillStyle(0xffffff);
        maskShapeTimer.fillRoundedRect(barX, barY - barHeight/2, barWidth, barHeight, 12 * timerScale);
        const maskTimer = maskShapeTimer.createGeometryMask();
        timerFill.setMask(maskTimer);

        const timerData = { value: 1 };

        this.timerTween = this.tweens.add({
            targets: timerData,
            value: 0,
            duration: 20000,
            ease: 'Linear',
            onUpdate: () => {
                timerFill.clear();
                timerFill.fillStyle(0xF21B1B, 1);
                timerFill.fillRoundedRect(barX, barY - barHeight/2, barWidth * timerData.value, barHeight, 12 * timerScale);
            },
            onComplete: () => {
               this.showLoseScreen();
            }
        });

        const btnHint = this.add.image(60, height - 60, 'btnHint')
        .setInteractive()
        .setScale(0.8);

        btnHint.on('pointerdown', () => {
        if (this.hintCount <= 0){
                alert("Hint habis!");
                return;
            }
            this.showHintConfirm();
        });
            
    } 

    // ==================================================================
    // 🔥 FUNGSI-FUNGSI LUAR 🔥
    // ==================================================================
    updateBrushColor(color) {
        this.bulu.setTint(color);
    }

    checkWinCondition(zoneTop, zoneBottom) {
        const topColor = zoneTop.getData('colorCode');
        const bottomColor = zoneBottom.getData('colorCode');

        if (topColor === 0xD9252B && bottomColor === 0xFFFFFF) {
            if (this.timerTween) {
                this.timerTween.stop();
            }
            this.time.delayedCall(500, () => { 
                this.showWinScreen();
            });
        }
    }

    addButtonEffect(btn) {
        btn.on('pointerover', () => { btn.setTint(0xdddddd); });
        btn.on('pointerout', () => { btn.clearTint(); });
        btn.on('pointerdown', () => {
            this.sound.play('pop', { volume: 0.8 });
            btn.setTint(0xbbbbbb);
            this.tweens.add({ targets: btn, scale: btn.scale * 0.9, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
        });
        btn.on('pointerup', () => { btn.setTint(0xdddddd); });
    }

    showWinScreen() {
        // 🔥 MAINKAN SFX MENANG 🔥
        this.sound.play('soundMenang', { volume: 1.0 });

        // 🔥 AMBIL BGM GLOBAL DARI MENU & KECILKAN VOLUMENYA (DUCKING) 🔥
        let globalBgm = this.sound.get('bgm_menu');
        if (globalBgm && globalBgm.isPlaying) {
            this.tweens.add({
                targets: globalBgm,
                volume: 0.15, 
                duration: 800,
                ease: 'Linear'
            });
        }

        // ================= REWARD HINT LEVEL 1 =================
        let rewardLevel1 = localStorage.getItem('rewardLevel1');
        
        if(!rewardLevel1){
            let hintData = localStorage.getItem('hintData');
            let hint = hintData ? parseInt(hintData) : 0;
            hint += 1;
            localStorage.setItem('hintData', hint);
            localStorage.setItem('rewardLevel1', true);
        }

        const { width, height } = this.scale;
        const bgX = 670, bgY = 130;
        const flagX = 660, flagY = 373;
        const replayX = 500, replayY = 610;
        const homeX = 660, homeY = 610;
        const nextX = 820, nextY = 610;
        const bgScale = 0.25, flagScale = 0.59, btnScale = 0.28;

        // 1. BG Gelap: Fade in biasa
        const blocker = this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0).setDepth(197).setInteractive();
        this.tweens.add({ targets: blocker, alpha: 0.6, duration: 300 });

        // 🔥 2. MEMBUAT EFEK CAHAYA (GLOW) HALUS DI BELAKANG BENDERA 🔥
        const glowContainer = this.add.container(flagX, flagY).setDepth(198).setAlpha(0);
        
        for (let i = 1; i <= 6; i++) {
            const g = this.add.graphics();
            g.fillStyle(0xffffff, 0.15 - (i * 0.02)); 
            g.fillRoundedRect(-180 - (i*15), -120 - (i*15), 360 + (i*30), 240 + (i*30), 30 + (i*5));
            g.setBlendMode(Phaser.BlendModes.ADD); 
            glowContainer.add(g);
        }

        // 3. Siapin elemen: Ukuran mulai dari kecil (0.8x target) & transparan
        const titleScaleTarget = 1; 
        const title = this.add.image(bgX, bgY, 'winBG').setDepth(200).setScale(bgScale * 0.8).setAlpha(0);
        const flag = this.add.image(flagX, flagY, 'flagIndonesia').setDepth(201).setScale(flagScale * 0.8).setAlpha(0);
        const replay = this.add.image(replayX, replayY, 'btnReplay').setInteractive({ useHandCursor: true }).setDepth(202).setScale(btnScale * 0.8).setAlpha(0);
        const home = this.add.image(homeX, homeY, 'btnHome').setInteractive({ useHandCursor: true }).setDepth(202).setScale(btnScale * 0.8).setAlpha(0);
        const next = this.add.image(nextX, nextY, 'btnNext').setInteractive({ useHandCursor: true }).setDepth(202).setScale(btnScale * 0.8).setAlpha(0);

        // 4. ANIMASI MUNCUL
        this.tweens.add({ targets: title, scale: titleScaleTarget, alpha: 1, duration: 400, ease: 'Back.out' });
        this.tweens.add({ targets: flag, scale: flagScale, alpha: 1, duration: 400, ease: 'Back.out', delay: 100 });
        this.tweens.add({ targets: glowContainer, scale: 1, alpha: 1, duration: 500, ease: 'Power2', delay: 150 });
        
        this.time.delayedCall(650, () => {
            this.tweens.add({ 
                targets: glowContainer, 
                scale: 1.05, 
                alpha: 0.7, 
                duration: 1200, 
                yoyo: true, 
                repeat: -1, 
                ease: 'Sine.easeInOut' 
            });
        });

        this.tweens.add({ targets: [replay, home, next], scale: btnScale, alpha: 1, duration: 400, ease: 'Back.out', delay: 200 });

        this.addButtonEffect(replay);
        this.addButtonEffect(home);
        this.addButtonEffect(next);

        // --- FUNGSI KLIK TOMBOL AMAN ---
        replay.on('pointerdown', () => {
            let levelDataStr = localStorage.getItem('levelData');
            let levelData = levelDataStr ? JSON.parse(levelDataStr) : {};
            levelData[1] = 2; levelData[2] = 1;
            localStorage.setItem('levelData', JSON.stringify(levelData));
            this.scene.restart();
        });

        home.on('pointerdown', () => {
            let levelDataStr = localStorage.getItem('levelData');
            let levelData = levelDataStr ? JSON.parse(levelDataStr) : {};
            levelData[1] = 2; levelData[2] = 1;
            localStorage.setItem('levelData', JSON.stringify(levelData));
            this.scene.start('level');
        });

        next.on('pointerdown', () => {
            let levelDataStr = localStorage.getItem('levelData');
            let levelData = levelDataStr ? JSON.parse(levelDataStr) : {};
            levelData[1] = 2; levelData[2] = 1;
            localStorage.setItem('levelData', JSON.stringify(levelData));
            this.scene.start('gameplay2');
        });
    }

  showLoseScreen() {
        const { width, height } = this.scale;
        
        // Cek supaya nggak dipanggil 2 kali
        if (this.gameOver) return; 
        this.gameOver = true;
        
        if (this.timerTween) this.timerTween.stop();

        // 🔥 TRY-CATCH AUDIONYA BIAR NGGAK BIKIN CRASH 🔥
        try {
            this.sound.play('soundKalah', { volume: 0.8 }); 
            
            let globalBgm = this.sound.get('bgm_menu');
            if (globalBgm && globalBgm.isPlaying) {
                this.tweens.add({
                    targets: globalBgm,
                    volume: 0.1, 
                    duration: 500,
                    ease: 'Linear'
                });
            }
        } catch (e) {
            console.warn("Audio kalah error/belum dimuat:", e);
        }

        const textX = 660, textY = 128;
        const xIconX = 660, xIconY = 372;
        const replayX = 565, replayY = 615;
        const homeX = 755, homeY = 615;
        const textScale = 1.1, xScale = 1.37, btnScale = 0.28;

        const blocker = this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0).setDepth(500).setInteractive();
        
        this.tweens.add({
            targets: blocker,
            alpha: 0.7, 
            duration: 500 
        });

    // ==================================================================
        // 🔥 TAMBAHKAN EFEK CAHAYA (GLOW) MERAH DI BELAKANG ICON X 🔥
        // ==================================================================
        const glowContainer = this.add.container(xIconX, xIconY).setDepth(500.5).setAlpha(0);
        
        // Gunakan image 'iconX' langsung sebagai glow biar bentuknya presisi
        for (let i = 1; i <= 5; i++) {
            let glowX = this.add.image(0, 0, 'iconX');
            
            // Bikin ukurannya makin membesar ke luar dari skala aslinya (xScale)
            glowX.setScale(xScale + (i * 0.12)); 
            
            // Kasih tint merah penuh biar warnanya nggak pudar
            glowX.setTint(0xFF0000); 
            
            // Makin ke luar, makin transparan
            glowX.setAlpha(0.25 - (i * 0.04)); 
            
            // Tambahkan blend mode ADD biar efek cahayanya nyala terang
            glowX.setBlendMode(Phaser.BlendModes.ADD);
            
            glowContainer.add(glowX);
        }

        const loseTextImg = this.add.image(textX, textY, 'loseText').setDepth(501).setScale(textScale).setAlpha(0);
        
        // 🔥 ICON X: ALPHA SEKARANG FULL (1.0) BIAR MERAH NYA JELAS 🔥
        const iconXImg = this.add.image(xIconX, xIconY, 'iconX').setDepth(501).setScale(xScale).setAlpha(0);

        const replay = this.add.image(replayX, replayY + 50, 'btnReplayLose').setDepth(502).setScale(btnScale).setAlpha(0);
        const home = this.add.image(homeX, homeY + 50, 'btnHomeLose').setDepth(502).setScale(btnScale).setAlpha(0);

        // ==================================================================
        // 🔥 TIMELINE ANIMASI MUNCUL (SUBTIL & COOL) 🔥
        // ==================================================================

        // Animasi Tulisan Kalah: Cuma Fade In di tempat
        this.tweens.add({
            targets: loseTextImg,
            alpha: 1,
            duration: 600, 
            ease: 'Linear', 
            delay: 100 
        });

        // 🔥 ANIMASI ICON X: ALPHA 1.0 (FULL MERAH) 🔥
        this.tweens.add({
            targets: iconXImg,
            alpha: 1.0, 
            duration: 800, 
            ease: 'Linear', 
            delay: 200 
        });

        // 🔥 ANIMASI CAHAYA (GLOW) MERAH: FADE IN 🔥
        this.tweens.add({
            targets: glowContainer,
            alpha: 1, // Cahaya muncul penuh
            duration: 800, 
            ease: 'Linear', 
            delay: 200 
        });

        // Animasi Tombol: Fade In & Slide Up halus ke posisi asli
        this.tweens.add({
            targets: [replay, home],
            y: replayY, 
            alpha: 1,
            duration: 500,
            ease: 'Cubic.out', 
            delay: 1000, 
            onComplete: () => {
                replay.setInteractive({ useHandCursor: true });
                home.setInteractive({ useHandCursor: true });
                this.addButtonEffect(replay);
                this.addButtonEffect(home);
            }
        });

        // --- Logika Klik Tombol Tetap Sama ---
        replay.on('pointerdown', () => { this.scene.restart(); });
        home.on('pointerdown', () => { this.scene.start('level'); });
    }

    showHintConfirm(){
        const {width,height} = this.scale;

        if(this.timerTween) this.timerTween.pause();

        const bg = this.add.rectangle(width/2,height/2,width,height,0x000000)
        .setAlpha(0.6)
        .setDepth(600)
        .setInteractive();

        const box = this.add.image(width/2,height/2,'hintBG')
        .setDepth(601)
        .setScale(0.49);

        const btnYes = this.add.image(width/2-105,height/2+55,'btnYes')
        .setInteractive()
        .setDepth(602)
        .setScale(0.092);

        const btnNo = this.add.image(width/2+70,height/2+55,'btnNo')
        .setInteractive()
        .setDepth(602)
        .setScale(0.092);

        btnNo.on('pointerdown',()=>{
            bg.destroy();
            box.destroy();
            btnYes.destroy();
            btnNo.destroy();
            if(this.timerTween) this.timerTween.resume();
        });

        btnYes.on('pointerdown',()=>{
            bg.destroy();
            box.destroy();
            btnYes.destroy();
            btnNo.destroy();
            this.showQuizHint();
        });
    }

    showQuizHint(){
        if(this.hintCount <= 0){
            alert("Hint sudah habis!");
            if(this.timerTween) this.timerTween.resume();
            return;
        }

        const {width,height} = this.scale;

        let availableQuestions = this.hintQuestions.filter((q,i)=>{
            return !this.usedHintQuestions.includes(i);
        });

        if(availableQuestions.length === 0){
            alert("Semua soal hint sudah dipakai!");
            return;
        }

        let randomIndex = Phaser.Math.Between(0,availableQuestions.length-1);
        let data = availableQuestions[randomIndex];

        let originalIndex = this.hintQuestions.indexOf(data);
        this.usedHintQuestions.push(originalIndex);

        const bg = this.add.rectangle(width/2,height/2,width,height,0x000000)
        .setAlpha(0.7)
        .setDepth(700)
        .setInteractive();

        const box = this.add.rectangle(width/2,height/2,700,400,0xffffff)
        .setDepth(701)
        .setStrokeStyle(4,0x000000);

        const question = this.add.text(width/2,height/2-120,data.q,{
        fontSize:"28px",
        color:"#000",
        wordWrap:{width:600}
        })
        .setOrigin(0.5)
        .setDepth(702);

        let optA,optB,optC,optD;

        const destroyAll = ()=>{
            bg.destroy();
            box.destroy();
            question.destroy();
            optA.destroy();
            optB.destroy();
            optC.destroy();
            optD.destroy();
        };

        const createOption = (text,y,key)=>{
            let btn = this.add.text(width/2,y,text,{
            fontSize:"26px",
            backgroundColor:"#dddddd",
            padding:{left:20,right:20,top:10,bottom:10}
            })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(702);

            btn.on("pointerdown",()=>{
                this.hintCount--;
                localStorage.setItem('hintData', this.hintCount);

                if(key === data.correct){
                    destroyAll();
                    this.showHintAnswer();
                    if(this.timerTween) this.timerTween.resume();
                }else{
                    alert("Jawaban salah! Sisa hint: " + this.hintCount);
                    if(this.hintCount <= 0){
                        destroyAll();
                        if(this.timerTween) this.timerTween.resume();
                        return;
                    }
                }
            });
            return btn;
        };

        optA = createOption("A. "+data.a,height/2-20,"a");
        optB = createOption("B. "+data.b,height/2+40,"b");
        optC = createOption("C. "+data.c,height/2+100,"c");
        optD = createOption("D. "+data.d,height/2+160,"d");
    }

    showHintAnswer(){
        let randomIndex = Phaser.Math.Between(0,this.flagAnswers.length-1);
        let hint = this.flagAnswers[randomIndex];

        alert("Petunjuk: " + hint.text);

        if(hint.top){
            this.selectedColor = hint.top;
            this.updateBrushColor(hint.top);
        }

        if(hint.bottom){
            this.selectedColor = hint.bottom;
            this.updateBrushColor(hint.bottom);
        }
    }
}