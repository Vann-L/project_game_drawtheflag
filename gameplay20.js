class gameplayScene20 extends Phaser.Scene {
    constructor() {
        super('gameplay20');
    }

    preload() {
        this.load.image('bgBoard', 'asset/Gameplay.png'); 
        this.load.image('btnBack', 'asset/tombolback.png');
        this.load.image('btnHint', 'asset/petunjuk.png'); 
        
        // PALET INGGRIS: Cuma Putih dan Merah
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
        
        // ASET BENDERA MENANG (Siapin ini doang bang!)
        this.load.image('flagwin_lvl20', 'asset/flagwin_lvl20.png');

        this.load.image('loseText', 'asset/tulisan_kalah.png');
        this.load.image('iconX', 'asset/x.png');
        this.load.image('btnReplayLose', 'asset/replay_kalah.png');
        this.load.image('btnHomeLose', 'asset/home_kalah.png');

        this.load.image('hintBG','asset/popuphint.png');
        this.load.image('btnYes','asset/btn_yes.png');
        this.load.image('btnNo','asset/btn_no.png');
        this.load.image('quizBG','asset/quizBG.png');
        this.load.image('optionBtn','asset/optionBtn.png');
        this.load.image('kotak_win', 'asset/kotak_win.png');
        this.load.image('btn_x', 'asset/btn_x.png');

        this.load.audio('suaraKuas', 'asset/suara_kuas.mp3');
        this.load.audio('pop', 'asset/pop.mp3');
        this.load.audio('soundMenang', 'asset/menang.mp3'); 
        this.load.audio('soundKalah', 'asset/kalah.mp3'); 
        this.load.audio('sfxTicking', 'asset/clock_ticking.mp3');
    }

    playGlobalSFX(key, config) {
        if (localStorage.getItem('sfx_on') !== 'false') {
            this.sound.play(key, config);
        }
    }

    create() {
        let globalBgm = this.sound.get('bgm_menu');
        let isMusicOn = localStorage.getItem('music_on') !== 'false';
        if (globalBgm) {
            this.tweens.killTweensOf(globalBgm); 
            if (isMusicOn) globalBgm.setVolume(1);
            else globalBgm.setVolume(0);
        }

        this.gameOver = false; 
        this.usedHintQuestions = [];
        this.usedFlagHints = []; 

        // Definisi Warna Inggris
        this.colorRed = 0xCE1124;  // Merah Inggris
        this.colorWhite = 0xFFFFFF; // Putih

        // JAWABAN BENAR INGGRIS
        this.flagAnswers = [
            { text:"PUTIH DI BAGIAN LATAR BENDERA", bg: this.colorWhite },
            { text:"MERAH DI PALANG VERTIKAL", crossV: this.colorRed },
            { text:"MERAH DI PALANG HORIZONTAL", crossH: this.colorRed }
        ];

        let hintData = localStorage.getItem('hintData');
        this.hintCount = hintData === null ? 2 : parseInt(hintData);
        if (hintData === null) localStorage.setItem('hintData', 2);

        // BANK SOAL INGGRIS
        this.hintQuestions = [
            {q:"Apa ibu kota negara Inggris?",a:"Manchester",b:"Liverpool",c:"London",d:"Birmingham",correct:"c"},
            {q:"Menara jam terkenal yang ada di London disebut?",a:"Big Ben",b:"Eiffel",c:"Pisa",d:"Liberty",correct:"a"},
            {q:"Inggris terletak di benua apa?",a:"Asia",b:"Amerika",c:"Australia",d:"Eropa",correct:"d"},
            {q:"Kompetisi liga sepak bola kasta tertinggi di Inggris adalah?",a:"La Liga",b:"Serie A",c:"Premier League",d:"Bundesliga",correct:"c"},
            {q:"Sistem pemerintahan di Inggris dipimpin oleh seorang?",a:"Presiden",b:"Raja/Ratu",c:"Sultan",d:"Gubernur",correct:"b"}
        ];

        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'bgBoard').setDisplaySize(width, height);

        const boardX = width / 2.04; 
        const boardY = height / 2 + 13; 
        const flagW = 512; 
        const flagH = 306; 
        const cw = 70; // Lebar palang merah (Cross Width)

        this.selectedColor = null; 
        this.isAnimating = false; 

        // Fungsi Arsiran
        const createStripes = (x, y, w, h) => {
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0xAAAAAA, 0.5); 
            for (let i = -w; i < w + h; i += 15) { 
                graphics.beginPath();
                graphics.moveTo(x - w/2 + i, y - h/2);
                graphics.lineTo(x - w/2 + i - h, y + h/2);
                graphics.strokePath();
            }
            const maskShape = this.make.graphics();
            maskShape.fillStyle(0xffffff);
            maskShape.fillRect(x - w/2, y - h/2, w, h);
            graphics.setMask(maskShape.createGeometryMask());
            return graphics;
        };

        // ================= PENYUSUNAN LAYER BENDERA INGGRIS (MURNI KODE) ================= //

        // 1. ZONA BACKGROUND (Putih)
        const stripesBg = createStripes(boardX, boardY, flagW, flagH).setDepth(11);
        const zoneBg = this.add.rectangle(boardX, boardY, flagW, flagH, 0xFFFFFF)
            .setInteractive({ useHandCursor: true }).setAlpha(0.01).setDepth(10); 

        // 2. ZONA PALANG VERTIKAL (Merah)
        const stripesCrossV = createStripes(boardX, boardY, cw, flagH).setDepth(13);
        const zoneCrossV = this.add.rectangle(boardX, boardY, cw, flagH, 0xFFFFFF)
            .setInteractive({ useHandCursor: true }).setAlpha(0.01).setDepth(12); 

        // 3. ZONA PALANG HORIZONTAL (Merah)
        const stripesCrossH = createStripes(boardX, boardY, flagW, cw).setDepth(15);
        const zoneCrossH = this.add.rectangle(boardX, boardY, flagW, cw, 0xFFFFFF)
            .setInteractive({ useHandCursor: true }).setAlpha(0.01).setDepth(14); 

        // 4. GARIS OUTLINE PALANG (Digambar Murni Pake Kode Biar Gak Tumpang Tindih)
        const outline = this.add.graphics().setDepth(20);
        outline.lineStyle(3, 0x000000);
        outline.strokeRect(boardX - flagW/2, boardY - flagH/2, flagW, flagH); // Bingkai bendera
        
        const hw = flagW/2;
        const hh = flagH/2;
        const ch = cw/2;
        
        // Gambar garis outline palang (Tanpa memotong di tengah)
        outline.beginPath();
        // Garis Vertikal Kiri
        outline.moveTo(boardX - ch, boardY - hh); outline.lineTo(boardX - ch, boardY - ch);
        outline.moveTo(boardX - ch, boardY + ch); outline.lineTo(boardX - ch, boardY + hh);
        // Garis Vertikal Kanan
        outline.moveTo(boardX + ch, boardY - hh); outline.lineTo(boardX + ch, boardY - ch);
        outline.moveTo(boardX + ch, boardY + ch); outline.lineTo(boardX + ch, boardY + hh);
        // Garis Horizontal Atas
        outline.moveTo(boardX - hw, boardY - ch); outline.lineTo(boardX - ch, boardY - ch);
        outline.moveTo(boardX + ch, boardY - ch); outline.lineTo(boardX + hw, boardY - ch);
        // Garis Horizontal Bawah
        outline.moveTo(boardX - hw, boardY + ch); outline.lineTo(boardX - ch, boardY + ch);
        outline.moveTo(boardX + ch, boardY + ch); outline.lineTo(boardX + hw, boardY + ch);
        outline.strokePath();

        this.add.image(width - 185, height - 95, 'bgKuas').setScale(0.7);
        const gagang = this.add.image(0, 0, 'gagangKuas');
        this.bulu = this.add.image(0, 0, 'buluKuas'); 
        this.brushContainer = this.add.container(width - 185, height - 100, [gagang, this.bulu]).setScale(0.2).setDepth(30);

        // LOGIKA MEWARNAI
        const paintZone = (zone, stripesToDestroy = null) => {
            if (this.gameOver || this.isAnimating) return;

            if (this.selectedColor === null) {
                this.tweens.add({ targets: zone, x: zone.x + 5, duration: 50, yoyo: true, repeat: 3 });
                return;
            }

            const currentColor = zone.getData('colorCode');
            if (zone.getData('isPainting') || currentColor === this.selectedColor) return;

            zone.setData('isPainting', true);
            this.isAnimating = true; 

            const paintColor = this.selectedColor; 
            const paintGraphics = this.add.graphics().setDepth(15);
            
            const maskShapeLocal = this.make.graphics();
            maskShapeLocal.fillStyle(0xffffff);
            maskShapeLocal.fillRect(zone.x - zone.width/2, zone.y - zone.height/2, zone.width, zone.height);
            paintGraphics.setMask(maskShapeLocal.createGeometryMask());

            const startX = zone.x - zone.width / 2;
            const startY = zone.y;
            const zoneW = zone.width;
            const zoneH = zone.height;

            this.tweens.add({
                targets: this.brushContainer, x: startX + 50, y: startY, angle: -20, duration: 400, ease: 'Power2',
                onComplete: () => { startPainting(); }
            });

            const startPainting = () => {
                let sfx = this.sound.add('suaraKuas', { volume: 5.0 });
                if (localStorage.getItem('sfx_on') !== 'false') sfx.play();

                const animData = { progress: 0 }; 

                this.tweens.add({
                    targets: animData, progress: 1, duration: 1000, ease: 'Linear', 
                    onUpdate: () => {
                        paintGraphics.clear();
                        paintGraphics.fillStyle(paintColor, 1);
                        const currentX = startX + (animData.progress * zoneW);
                        const wobble = Math.sin(animData.progress * 15) * 10;
                        const currentY = startY + wobble;
                        paintGraphics.fillRect(startX, startY - zoneH/2 - 10, (currentX - startX), zoneH + 20);
                        paintGraphics.fillCircle(currentX, currentY, zoneH / 2 + 10);
                        this.brushContainer.x = currentX + 30;
                        this.brushContainer.y = currentY - 40;
                        this.brushContainer.setAngle(-20 + Math.cos(animData.progress * 20) * 10);
                    },
                    onComplete: () => {
                        sfx.stop();
                        this.tweens.add({ targets: this.brushContainer, x: width - 185, y: height - 100, angle: 0, duration: 500, ease: 'Back.out' });

                        if (stripesToDestroy && stripesToDestroy.active) stripesToDestroy.destroy();
                        
                        zone.setFillStyle(paintColor); 
                        zone.setAlpha(1);
                        
                        paintGraphics.destroy();
                        zone.setData('colorCode', paintColor);
                        zone.setData('isPainting', false);
                        this.isAnimating = false; 

                        this.checkWinCondition(zoneBg, zoneCrossV, zoneCrossH);
                    }
                });
            };
        };

        // EVENT KLIK 
        zoneBg.on('pointerdown', (p, x, y, event) => { event.stopPropagation(); paintZone(zoneBg, stripesBg); });
        zoneCrossV.on('pointerdown', (p, x, y, event) => { event.stopPropagation(); paintZone(zoneCrossV, stripesCrossV); });
        zoneCrossH.on('pointerdown', (p, x, y, event) => { event.stopPropagation(); paintZone(zoneCrossH, stripesCrossH); });

        // TOMBOL BACK
        const tombolback = this.add.image(width * 0.055, height * 0.080, 'tombolback').setScale(1).setInteractive({ useHandCursor: true });
        tombolback.on('pointerdown', () => {
            this.playGlobalSFX('pop'); 
            this.tweens.add({ targets: tombolback, scale: 0.115, duration: 80, yoyo: true, onComplete: () => this.scene.start('level') });
        });

        // PALET WARNA (Merah & Putih)
        const pMerah = this.add.image(width - 90, height/1.65, 'paletMerah').setInteractive().setScale(0.8);
        pMerah.on('pointerdown', () => {
            if (this.gameOver || this.isAnimating) return;
            this.playGlobalSFX('pop', { volume: 0.6 }); 
            this.selectedColor = this.colorRed; this.updateBrushColor(this.colorRed);
            this.tweens.add({ targets: pMerah, scale: 0.9, duration: 100, yoyo: true });
        });

        const pPutih = this.add.image(width - 90, height/1.4, 'paletPutih').setInteractive().setScale(0.8);
        pPutih.on('pointerdown', () => {
            if (this.gameOver || this.isAnimating) return; 
            this.playGlobalSFX('pop', { volume: 0.6 }); 
            this.selectedColor = this.colorWhite; this.updateBrushColor(this.colorWhite);
            this.tweens.add({ targets: pPutih, scale: 0.9, duration: 100, yoyo: true });
        });

        // KODE JUDUL NEGARA
        const titleScale = 0.46; 
        const titleWidth = 650 * titleScale;
        const titleHeight = 60 * titleScale;
        const titleX = width - 202;
        const titleY = 102;

        const titleOuter = this.add.graphics();
        titleOuter.fillStyle(0xffffff, 1);
        titleOuter.fillRoundedRect( titleX - titleWidth/2 - (6 * titleScale), titleY - titleHeight/2 - (6 * titleScale), titleWidth + (12 * titleScale), titleHeight + (12 * titleScale), 30 * titleScale);
        titleOuter.lineStyle(4 * titleScale, 0x000000);
        titleOuter.strokeRoundedRect(titleX - titleWidth/2, titleY - titleHeight/2, titleWidth, titleHeight, 25 * titleScale);

        this.add.text(titleX, titleY, 'INGGRIS', { fontSize: (32 * titleScale) + 'px', fontFamily: 'Arial', color: '#000000', fontStyle: 'bold' }).setOrigin(0.5);

        // TIMER
        const barX = width - 347, barY = 60, barWidth = 300 * 0.85, barHeight = 22 * 0.85;
        const jamIcon = this.add.image(barX + barWidth + (40 * 0.85), barY, 'iconjam').setScale(0.1 * 0.85);
        let isJamPulsing = false; 

        const frame = this.add.graphics();
        frame.fillStyle(0xffffff, 1);
        frame.lineStyle(2, 0xffffff);
        frame.fillRoundedRect(barX - (6 * 0.85), barY - (16 * 0.85), barWidth + (12 * 0.85), 32 * 0.85, 16 * 0.85);
        frame.strokeRoundedRect(barX - (6 * 0.85), barY - (16 * 0.85), barWidth + (12 * 0.85), 32 * 0.85, 16 * 0.85);

        const timerBG = this.add.graphics();
        timerBG.fillStyle(0xffffff, 1);
        timerBG.lineStyle(2, 0x000000);
        timerBG.fillRoundedRect(barX, barY - barHeight/2, barWidth, barHeight, 12 * 0.85);
        timerBG.strokeRoundedRect(barX, barY - barHeight/2, barWidth, barHeight, 12 * 0.85);

        const timerFill = this.add.graphics();
        const maskShapeTimer = this.make.graphics();
        maskShapeTimer.fillStyle(0xffffff);
        maskShapeTimer.fillRoundedRect(barX, barY - barHeight/2, barWidth, barHeight, 12 * 0.85);
        const maskTimer = maskShapeTimer.createGeometryMask();
        timerFill.setMask(maskTimer);

        const timerData = { value: 1 };
        this.timerTween = this.tweens.add({
            targets: timerData, value: 0, duration: 20000, ease: 'Linear',
            onUpdate: () => {
                timerFill.clear();
                timerFill.fillStyle(0xF21B1B, 1);
                timerFill.fillRoundedRect(barX, barY - barHeight/2, barWidth * timerData.value, barHeight, 12 * 0.85);
                if (timerData.value <= 0.25 && !isJamPulsing) {
                    isJamPulsing = true; 
                    jamIcon.setTint(0xff4444); 
                    this.tweens.add({ targets: jamIcon, scale: (0.1 * 0.85) * 1.35, duration: 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                    this.sfxWaktu = this.sound.add('sfxTicking', { volume: 0.8, loop: true }); 
                    if (localStorage.getItem('sfx_on') !== 'false') this.sfxWaktu.play();
                }
            },
            onComplete: () => { this.showLoseScreen(); }
        });

        const btnHint = this.add.image(60, height - 60, 'btnHint').setInteractive().setScale(0.8);
        this.addButtonEffect(btnHint);
        btnHint.on('pointerdown', () => {
            if (this.hintCount <= 0) this.showHintEmpty();
            else this.showHintConfirm();
        });
    } 

    updateBrushColor(color) { this.bulu.setTint(color); }

    checkWinCondition(zoneBg, zoneCrossV, zoneCrossH) {
        if (this.gameOver) return;
        // INGGRIS: Background Putih, Palang Vertikal Merah, Palang Horizontal Merah
        if (zoneBg.getData('colorCode') === this.colorWhite && zoneCrossV.getData('colorCode') === this.colorRed && zoneCrossH.getData('colorCode') === this.colorRed) {
            this.gameOver = true; 
            if (this.timerTween) this.timerTween.stop();
            this.time.delayedCall(500, () => { this.showWinScreen(); });
        }
    }

    addButtonEffect(btn) {
        btn.on('pointerover', () => { btn.setTint(0xdddddd); });
        btn.on('pointerout', () => { btn.clearTint(); });
        btn.on('pointerdown', () => {
            this.playGlobalSFX('pop', { volume: 0.8 }); 
            btn.setTint(0xbbbbbb);
            this.tweens.add({ targets: btn, scale: btn.scale * 0.9, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
        });
        btn.on('pointerup', () => { btn.setTint(0xdddddd); });
    }

    showWinScreen() {
        if (this.sfxWaktu && this.sfxWaktu.isPlaying) this.sfxWaktu.stop();
        this.playGlobalSFX('soundMenang', { volume: 1.0 });

        let globalBgm = this.sound.get('bgm_menu');
        let isMusicOn = localStorage.getItem('music_on') !== 'false';
        if (globalBgm && globalBgm.isPlaying && isMusicOn) {
            this.tweens.add({ targets: globalBgm, volume: 0.15, duration: 800, ease: 'Linear' });
        }

        let rewardLevel20 = localStorage.getItem('rewardLevel20');
        if(!rewardLevel20){
            let hintData = localStorage.getItem('hintData');
            let hint = hintData ? parseInt(hintData) : 0;
            hint += 1;
            localStorage.setItem('hintData', hint);
            localStorage.setItem('rewardLevel20', true);
        }

        const { width, height } = this.scale;
        const bgX = 670, bgY = 130, flagX = 660, flagY = 373, replayX = 500, replayY = 610, homeX = 660, homeY = 610, nextX = 820, nextY = 610;
        const bgScale = 0.25, flagScale = 0.59, btnScale = 0.28;

        const blocker = this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0).setDepth(197).setInteractive();
        this.tweens.add({ targets: blocker, alpha: 0.6, duration: 300 });

        const glowContainer = this.add.container(flagX, flagY).setDepth(198).setAlpha(0);
        for (let i = 1; i <= 6; i++) {
            const g = this.add.graphics();
            g.fillStyle(0xffffff, 0.15 - (i * 0.02)); 
            g.fillRoundedRect(-180 - (i*15), -120 - (i*15), 360 + (i*30), 240 + (i*30), 30 + (i*5));
            g.setBlendMode(Phaser.BlendModes.ADD); 
            glowContainer.add(g);
        }

        const title = this.add.image(bgX, bgY, 'winBG').setDepth(200).setScale(bgScale * 0.8).setAlpha(0);
        const flag = this.add.image(flagX, flagY, 'flagwin_lvl20').setDepth(201).setScale(flagScale * 0.8).setAlpha(0);
        const replay = this.add.image(replayX, replayY, 'btnReplay').setInteractive({ useHandCursor: true }).setDepth(202).setScale(btnScale * 0.8).setAlpha(0);
        const home = this.add.image(homeX, homeY, 'btnHome').setInteractive({ useHandCursor: true }).setDepth(202).setScale(btnScale * 0.8).setAlpha(0);
        const next = this.add.image(nextX, nextY, 'btnNext').setInteractive({ useHandCursor: true }).setDepth(202).setScale(btnScale * 0.8).setAlpha(0);

        this.tweens.add({ targets: title, scale: 1, alpha: 1, duration: 400, ease: 'Back.out' });
        this.tweens.add({ targets: flag, scale: flagScale, alpha: 1, duration: 400, ease: 'Back.out', delay: 100 });
        this.tweens.add({ targets: glowContainer, scale: 1, alpha: 1, duration: 500, ease: 'Power2', delay: 150 });
        
        this.time.delayedCall(650, () => {
            this.tweens.add({ targets: glowContainer, scale: 1.05, alpha: 0.7, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        this.tweens.add({ targets: [replay, home, next], scale: btnScale, alpha: 1, duration: 400, ease: 'Back.out', delay: 200 });

        this.addButtonEffect(replay); this.addButtonEffect(home); this.addButtonEffect(next);

        const unlockNextLevel = () => {
            let levelDataStr = localStorage.getItem('levelData');
            let levelData = levelDataStr ? JSON.parse(levelDataStr) : {};
            levelData[20] = 2; // Level 20 clear!
            localStorage.setItem('levelData', JSON.stringify(levelData));
        };

        replay.on('pointerdown', () => { unlockNextLevel(); this.scene.restart(); });
        home.on('pointerdown', () => { unlockNextLevel(); this.scene.start('level'); });
        
        // EFEK SPESIAL LEVEL TAMAT!
        next.on('pointerdown', () => { 
            unlockNextLevel(); 
            alert("🎉 SELAMAT BANG! LU UDAH NAMATIN SEMUA 20 LEVEL! MANTAP JIWA! 🎉");
            this.scene.start('level'); 
        });
    }

    showLoseScreen() {
        const { width, height } = this.scale;
        if (this.gameOver) return; 
        this.gameOver = true;
        if (this.timerTween) this.timerTween.stop();
        if (this.sfxWaktu && this.sfxWaktu.isPlaying) this.sfxWaktu.stop();

        try {
            this.playGlobalSFX('soundKalah', { volume: 1.0 }); 
            let globalBgm = this.sound.get('bgm_menu');
            let isMusicOn = localStorage.getItem('music_on') !== 'false';
            if (globalBgm && globalBgm.isPlaying && isMusicOn) {
                this.tweens.add({ targets: globalBgm, volume: 0, duration: 1500, ease: 'Sine.easeOut' });
            }
        } catch (e) { console.warn(e); }

        const textX = 660, textY = 128, xIconX = 660, xIconY = 372, replayX = 565, replayY = 615, homeX = 755, homeY = 615;
        const textScale = 1.1, xScale = 1.37, btnScale = 0.28;

        const blocker = this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0).setDepth(500).setInteractive();
        this.tweens.add({ targets: blocker, alpha: 0.7, duration: 800, ease: 'Linear' });

        const glowContainer = this.add.container(xIconX, xIconY).setDepth(500.5).setAlpha(0).setScale(0.8);
        for (let i = 1; i <= 5; i++) {
            let glowX = this.add.image(0, 0, 'iconX');
            glowX.setScale(xScale + (i * 0.1)).setTint(0xFF0000).setAlpha(0.25 - (i * 0.04)).setBlendMode(Phaser.BlendModes.ADD);
            glowContainer.add(glowX);
        }
        this.tweens.add({ targets: glowContainer, alpha: 1.0, scale: 1.0, duration: 500, ease: 'Back.out', delay: 100 });
        this.time.delayedCall(600, () => {
            this.tweens.add({ targets: glowContainer, scale: 1.06, alpha: 0.6, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        const loseTextImg = this.add.image(textX, textY, 'loseText').setDepth(501).setScale(textScale).setAlpha(0);
        const iconXImg = this.add.image(xIconX, xIconY, 'iconX').setDepth(501).setScale(0.2).setAlpha(0);

        this.tweens.add({ targets: loseTextImg, y: textY, alpha: 1, duration: 600, ease: 'Expo.out', delay: 150 });
        this.tweens.add({ targets: iconXImg, scale: xScale, alpha: 1.0, duration: 500, ease: 'Back.out', delay: 250 });

        const replay = this.add.image(replayX, replayY + 150, 'btnReplayLose').setDepth(502).setScale(btnScale).setAlpha(0);
        const home = this.add.image(homeX, homeY + 150, 'btnHomeLose').setDepth(502).setScale(btnScale).setAlpha(0);

        this.tweens.add({ targets: replay, y: replayY, alpha: 1, duration: 600, ease: 'Power3.out', delay: 1000 });
        this.tweens.add({
            targets: home, y: homeY, alpha: 1, duration: 600, ease: 'Power3.out', delay: 1200, 
            onComplete: () => {
                replay.setInteractive({ useHandCursor: true }); home.setInteractive({ useHandCursor: true });
                this.addButtonEffect(replay); this.addButtonEffect(home);
            }
        });

        this.time.delayedCall(1800, () => {
            this.tweens.add({ targets: replay, scale: btnScale * 1.03, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.tweens.add({ targets: home, scale: btnScale * 1.03, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 300 });
        });

        replay.on('pointerdown', () => { this.scene.restart(); });
        home.on('pointerdown', () => { this.scene.start('level'); });
    }

    showHintConfirm(){
        const {width,height} = this.scale;
        if(this.timerTween) this.timerTween.pause();

        const bg = this.add.rectangle(width/2,height/2,width,height,0x000000).setAlpha(0.6).setDepth(600).setInteractive();
        const box = this.add.image(width/2,height/2,'hintBG').setDepth(601).setScale(0.49).setInteractive();
        const btnYes = this.add.image(width/2-105,height/2+55,'btnYes').setInteractive().setDepth(602).setScale(0.092);
        const btnNo = this.add.image(width/2+70,height/2+55,'btnNo').setInteractive().setDepth(602).setScale(0.092);

        this.addButtonEffect(btnYes); this.addButtonEffect(btnNo);

        btnNo.on('pointerdown',()=>{
            this.playGlobalSFX('pop'); 
            bg.destroy(); box.destroy(); btnYes.destroy(); btnNo.destroy();
            if(this.timerTween) this.timerTween.resume();
        });

        btnYes.on('pointerdown',()=>{
            this.playGlobalSFX('pop'); 
            bg.destroy(); box.destroy(); btnYes.destroy(); btnNo.destroy();
            this.showQuizHint();
        });
    }

    showQuizHint(){
        if(this.hintCount <= 0){
            this.showHintEmpty();
            if(this.timerTween) this.timerTween.resume();
            return;
        }

        const {width,height} = this.scale;
        let availableQuestions = this.hintQuestions.filter((q,i)=>{ return !this.usedHintQuestions.includes(i); });

        if(availableQuestions.length === 0){
            alert("Semua soal hint sudah dipakai!");
            return;
        }

        let randomIndex = Math.floor(Math.random() * availableQuestions.length);
        let data = availableQuestions[randomIndex];
        this.usedHintQuestions.push(this.hintQuestions.indexOf(data));

        const bg = this.add.rectangle(width/2,height/2,width,height,0x000000).setAlpha(0.7).setDepth(700).setInteractive();
        const box = this.add.image(width/2,height/2,'quizBG').setDepth(701).setScale(0.6);
        const question = this.add.text(width/2 + -15,height/2-60,data.q,{ fontSize:"21px", fontFamily:"Arial", color:"#000000", align:"center", wordWrap:{width:500} }).setOrigin(0.5).setDepth(702);

        let options = [];
        const destroyAll = ()=>{
            bg.destroy(); box.destroy(); question.destroy();
            options.forEach(o=>{ o.bg.destroy(); o.text.destroy(); });
        };

        const centerX = width / 2 + -20, startY = height / 2 + 20, offsetX = 110, gapY = 70;     

        const createOption = (text, x, y, key)=>{
            let btnBG = this.add.image(x,y,'optionBtn').setDepth(702).setScale(0.08).setInteractive({ useHandCursor:true });
            let btnText = this.add.text(x,y,text,{ fontSize:"19px", fontFamily:"Arial", color:"#000" }).setOrigin(0.5).setDepth(703);
            this.addButtonEffect(btnBG);

            btnBG.on("pointerdown",()=>{
                this.playGlobalSFX('pop'); 
                this.hintCount--;
                localStorage.setItem('hintData', this.hintCount);

                if(key === data.correct){
                    btnBG.setTint(0x00ff00);
                    this.time.delayedCall(300, ()=>{ destroyAll(); this.showHintAnswer(); });
                }else{
                    btnBG.setTint(0xff0000);
                    this.time.delayedCall(400, ()=>{
                        btnBG.clearTint(); 
                        if(this.hintCount <= 0){ destroyAll(); if(this.timerTween) this.timerTween.resume(); }
                    });
                }
            });
            options.push({bg:btnBG,text:btnText});
        };

        createOption("A. "+data.a, centerX - offsetX, startY, "a");
        createOption("B. "+data.b, centerX + offsetX, startY, "b");
        createOption("C. "+data.c, centerX - offsetX, startY + gapY, "c");
        createOption("D. "+data.d, centerX + offsetX, startY + gapY, "d");
    }

    showHintAnswer(){
        if (this.timerTween) this.timerTween.pause();

        let availableHints = this.flagAnswers.filter((h,i)=>{ return !this.usedFlagHints.includes(i); });
        if(availableHints.length === 0){ this.usedFlagHints = []; availableHints = this.flagAnswers; }

        let randomIndex = Math.floor(Math.random() * availableHints.length);
        let hint = availableHints[randomIndex];
        this.usedFlagHints.push(this.flagAnswers.indexOf(hint));

        const { width, height } = this.scale;
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0.6).setDepth(800).setInteractive();
        const box = this.add.image(width/2, height/2, 'kotak_win').setDepth(801).setScale(0.35);
        const text = this.add.text(width/2, height/2, hint.text, { fontSize: "26px", fontFamily: "Arial", color: "#000000", align: "center", wordWrap: { width: 400 } }).setOrigin(0.5).setDepth(802);
        const btnClose = this.add.image(width/2 + 260, height/2 - 90, 'btn_x').setDepth(803).setScale(0.15).setInteractive({ useHandCursor: true });
        this.addButtonEffect(btnClose);

        btnClose.on('pointerdown', () => {
            this.playGlobalSFX('pop'); 
            bg.destroy(); box.destroy(); text.destroy(); btnClose.destroy();
            if (this.timerTween) this.timerTween.resume();
        });

        if(hint.bg){ this.selectedColor = hint.bg; this.updateBrushColor(hint.bg); }
        if(hint.crossV){ this.selectedColor = hint.crossV; this.updateBrushColor(hint.crossV); }
        if(hint.crossH){ this.selectedColor = hint.crossH; this.updateBrushColor(hint.crossH); }
    }

    showHintEmpty(){
        const { width, height } = this.scale;
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0.6).setDepth(900).setInteractive();
        const box = this.add.image(width/2, height/2, 'kotak_win').setDepth(901).setScale(0.35);
        const text = this.add.text(width/2, height/2, "HINT HABIS!", { fontSize: "26px", fontFamily: "Arial", color: "#000000", align: "center" }).setOrigin(0.5).setDepth(902);
        const btnClose = this.add.image(width/2 + 260, height/2 - 90, 'btn_x').setDepth(903).setScale(0.15).setInteractive({ useHandCursor: true });
        this.addButtonEffect(btnClose);

        btnClose.on('pointerdown', () => {
            this.playGlobalSFX('pop'); 
            bg.destroy(); box.destroy(); text.destroy(); btnClose.destroy();
        });
    }
}