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

        this.load.image('winBG', 'asset/ANIMASI MENANG.png');
        this.load.image('btnHome', 'asset/home.png');
        this.load.image('btnReplay', 'asset/ulang.png');
        this.load.image('btnNext', 'asset/next.png');
        this.load.image('flagIndonesia', 'asset/bendera_indonesia.png');

        this.load.image('loseText', 'asset/tulisan_kalah.png');
        this.load.image('iconX', 'asset/x.png');
        this.load.image('btnReplayLose', 'asset/replay_kalah.png');
        this.load.image('btnHomeLose', 'asset/home_kalah.png');
    }

    create() {
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
        this.add.image(width - 120, height - 95, 'bgKuas').setScale(0.7);
        const gagang = this.add.image(0, 0, 'gagangKuas');
        // 👇 Ganti angka -15 di bawah ini kalau bulunya menceng sama gagangnya 👇
        this.bulu = this.add.image(0, 0, 'buluKuas'); 

        this.brushContainer = this.add.container(width - 120, height - 100, [gagang, this.bulu])
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

            // 🔥 FIX BUG: Kunci warna di sini
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
                        this.tweens.add({
                            targets: this.brushContainer,
                            x: width - 120,
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
                        
                        this.tweens.add({ targets: zone, scale: 1.02, duration: 150, yoyo: true });

                        this.checkWinCondition(zoneTop, zoneBottom);
                    }
                });
            };
        };

        zoneTop.on('pointerdown', () => paintZone(zoneTop, stripesTop));
        zoneBottom.on('pointerdown', () => paintZone(zoneBottom, stripesBottom));


        // ================= UI ELEMENTS =================
        const tombolback = this.add.image(width * 0.055, height * 0.080, 'tombolback')
            .setScale(0.13)
            .setInteractive({ useHandCursor: true });

        tombolback.on('pointerover', () => { tombolback.setTint(0xeeeeee); });
        tombolback.on('pointerout', () => { tombolback.clearTint(); });
        tombolback.on('pointerdown', () => {
            tombolback.setTint(0xeeeeee);
            this.tweens.add({ targets: tombolback, scale: 0.115, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
            this.scene.start('level'); 
        });
        tombolback.on('pointerup', () => { tombolback.setTint(0xdddddd); });

        const pMerah = this.add.image(width - 100, height/1.5 - 10, 'paletMerah').setInteractive().setScale(0.8);
        pMerah.on('pointerdown', () => {
            if (this.isAnimating) return; // 🔥 CEGAH KLIK PALET
            this.selectedColor = 0xD9252B; 
            this.updateBrushColor(0xD9252B);
            this.tweens.add({ targets: pMerah, scale: 0.9, duration: 100, yoyo: true });
        });

        const pPutih = this.add.image(width - 100, height/1.8 + 10, 'paletPutih').setInteractive().setScale(0.8);
        pPutih.on('pointerdown', () => {
            if (this.isAnimating) return; // 🔥 CEGAH KLIK PALET
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
            duration: 10000,
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

        this.add.image(60, height - 60, 'btnHint').setInteractive().setScale(0.8)
            .on('pointerdown', () => alert("Atas Merah, Bawah Putih!"));
            
    } // <--- AKHIR DARI FUNGSI CREATE. Nggak ada tulisan merah lagi di bawah sini.

    // ==================================================================
    // 🔥 FUNGSI-FUNGSI LUAR (DITARUH DI SINI BARU BENER) 🔥
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
            btn.setTint(0xbbbbbb);
            this.tweens.add({ targets: btn, scale: btn.scale * 0.9, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
        });
        btn.on('pointerup', () => { btn.setTint(0xdddddd); });
    }

    showWinScreen() {
        const { width, height } = this.scale;
        const bgX = 670, bgY = 130;
        const flagX = 660, flagY = 373;
        const replayX = 500, replayY = 610;
        const homeX = 660, homeY = 610;
        const nextX = 820, nextY = 610;
        const bgScale = 0.25, flagScale = 0.59, btnScale = 0.28;

        this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0.5).setDepth(199).setInteractive();
        this.add.image(bgX, bgY, 'winBG').setDepth(200).setScale(bgScale);
        const flag = this.add.image(flagX, flagY, 'flagIndonesia').setDepth(201).setScale(flagScale);

        const createGlow = (color, scaleOffset, alpha) => {
            return this.add.image(flag.x, flag.y, 'flagIndonesia').setDepth(200).setScale(flag.scale * scaleOffset).setTint(color).setAlpha(alpha);
        };

        const glow1 = createGlow(0xffffff, 1.05, 0.5); 
        const glow2 = createGlow(0xffffff, 1.1, 0.3);  

        this.tweens.add({
            targets: [glow1, glow2], scaleX: '+=0.05', scaleY: '+=0.05', alpha: '-=0.2', duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        const replay = this.add.image(replayX, replayY, 'btnReplay').setInteractive({ useHandCursor: true }).setDepth(202).setScale(btnScale);
        const home = this.add.image(homeX, homeY, 'btnHome').setInteractive({ useHandCursor: true }).setDepth(202).setScale(btnScale);
        const next = this.add.image(nextX, nextY, 'btnNext').setInteractive({ useHandCursor: true }).setDepth(202).setScale(btnScale);

        this.addButtonEffect(replay);
        this.addButtonEffect(home);
        this.addButtonEffect(next);

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
        this.gameOver = true;
        this.tweens.killAll();
        
        const textX = 660, textY = 128;
        const xIconX = 660, xIconY = 372;
        const replayX = 565, replayY = 615;
        const homeX = 755, homeY = 615;
        const textScale = 0.25, xScale = 1.37, btnScale = 0.28;

        const blocker = this.add.rectangle(width/2, height/2, width, height, 0x000000).setAlpha(0.6).setDepth(500).setInteractive();
        blocker.on('pointerdown', () => {});

        this.add.image(textX, textY, 'loseText').setDepth(501).setScale(textScale);
        this.add.image(xIconX, xIconY, 'iconX').setDepth(501).setScale(xScale);

        const replay = this.add.image(replayX, replayY, 'btnReplayLose').setInteractive({ useHandCursor: true }).setDepth(502).setScale(btnScale);
        const home = this.add.image(homeX, homeY, 'btnHomeLose').setInteractive({ useHandCursor: true }).setDepth(502).setScale(btnScale);
        
        this.addButtonEffect(replay);
        this.addButtonEffect(home);

        replay.on('pointerdown', () => { this.scene.restart(); });
        home.on('pointerdown', () => { this.scene.start('level'); });
    }
}