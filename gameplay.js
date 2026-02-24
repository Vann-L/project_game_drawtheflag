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
        this.load.image('iconKuas', 'asset/kuas.png');
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
        // Depth 20 supaya garis selalu paling atas
        this.add.rectangle(boardX, boardY, flagW, 3, 0x000000).setDepth(20);
        this.add.rectangle(boardX, boardY, flagW, flagH)
            .setStrokeStyle(3, 0x000000).setDepth(20);

        
        // --- 🖌️ IKON KUAS (Disiapkan di awal, default hidden) ---
        // Kita simpan di variabel 'this.brush' biar bisa digerakkan global
        this.add.image(width - 120, height - 100, 'bgKuas').setScale(0.7);
        this.brushIcon = this.add.image(width - 120, height - 100, 'iconKuas').setScale(0.7).setDepth(30);


        // ==================================================================
        // 🔥 LOGIC MEWARNAI: "LIQUID FILL" (PASTI PENUH & SMOOTH) 🔥
        // ==================================================================
        const paintZone = (zone, stripesObj) => {
            // Cek 1: Warna dipilih?
            if (this.selectedColor === null) {
                this.tweens.add({ targets: zone, x: zone.x + 5, duration: 50, yoyo: true, repeat: 3 });
                return;
            }

            // Cek 2: Jangan spam klik
            const currentColor = zone.getData('colorCode');
            if (zone.getData('isPainting') || currentColor === this.selectedColor) return;

            zone.setData('isPainting', true);

            // --- PERSIAPAN ---
            const paintGraphics = this.add.graphics().setDepth(5);
            
            // Masking (Biar cat gak bleber keluar kotak)
            const maskShape = this.make.graphics();
            maskShape.fillStyle(0xffffff);
            maskShape.fillRect(zone.x - zone.width/2, zone.y - zone.height/2, zone.width, zone.height);
            const mask = maskShape.createGeometryMask();
            paintGraphics.setMask(mask);

            // --- KOORDINAT ---
            const startX = zone.x - zone.width / 2; // Kiri
            const startY = zone.y;                // Tengah Vertical
            const zoneW = zone.width;
            const zoneH = zone.height;

            // Kita gerakkan Brush Icon ke posisi start dulu
            this.tweens.add({
                targets: this.brushIcon,
                x: startX,
                y: startY,
                angle: -20,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    startPainting();
                }
            });

            // --- FUNGSI ANIMASI UTAMA ---
            const startPainting = () => {
                const animData = { progress: 0 }; 

                this.tweens.add({
                    targets: animData,
                    progress: 1, // Target sampai 100% lebar
                    duration: 1000, // Durasi ngecat
                    ease: 'Linear', // Linear biar ngisinya stabil
                    
                    onUpdate: () => {
                        paintGraphics.clear();
                        paintGraphics.fillStyle(this.selectedColor, 1);

                        // 1. HITUNG POSISI 'KEPALA' KUAS
                        const currentX = startX + (animData.progress * zoneW);
                        
                        // Sedikit goyangan vertikal biar 'hidup'
                        const wobble = Math.sin(animData.progress * 15) * 10;
                        const currentY = startY + wobble;

                        // 2. GAMBAR EKOR (AREA YANG SUDAH DICAT)
                        paintGraphics.fillRect(startX, startY - zoneH/2 - 10, (currentX - startX), zoneH + 20);

                        // 3. GAMBAR KEPALA KUAS (BULATAN)
                        const brushHeadSize = zoneH / 2 + 10; 
                        paintGraphics.fillCircle(currentX, currentY, brushHeadSize);

                        // 4. UPDATE VISUAL ICON KUAS
                        this.brushIcon.x = currentX + 30;
                        this.brushIcon.y = currentY - 40;
                        
                        // Rotasi goyang dikit pas ngecat
                        this.brushIcon.setAngle(-20 + Math.cos(animData.progress * 20) * 10);
                    },

                    onComplete: () => {
                        // --- FINISHING ---
                        // Balikin Kuas
                        this.tweens.add({
                            targets: this.brushIcon,
                            x: width - 120,
                            y: height - 100,
                            angle: 0,
                            duration: 500,
                            ease: 'Back.out'
                        });

                        // Hapus Stripes
                        if (stripesObj.active) stripesObj.destroy();
                        
                        // Jadikan Permanen
                        zone.setFillStyle(this.selectedColor);
                        zone.setAlpha(1);
                        
                        // Bersihkan Graphics
                        paintGraphics.destroy();
                        maskShape.destroy();

                        // Simpan Data
                        zone.setData('colorCode', this.selectedColor);
                        zone.setData('isPainting', false);
                        
                        // Efek 'Puas'
                        this.tweens.add({ targets: zone, scale: 1.02, duration: 150, yoyo: true });

                        this.checkWinCondition(zoneTop, zoneBottom);
                    }
                });
            };
        };

        zoneTop.on('pointerdown', () => paintZone(zoneTop, stripesTop));
        zoneBottom.on('pointerdown', () => paintZone(zoneBottom, stripesBottom));


        // ================= UI ELEMENTS =================
        const btnBack = this.add.image(60, 60, 'btnBack').setScale(0.12).setInteractive(); 
        btnBack.on('pointerdown', () => this.scene.start('level'));

        const pMerah = this.add.image(width - 100, height/1.5 - 10, 'paletMerah').setInteractive().setScale(0.8);
        pMerah.on('pointerdown', () => {
            this.selectedColor = 0xD9252B; 
            this.updateBrushColor(0xD9252B);
            this.tweens.add({ targets: pMerah, scale: 0.9, duration: 100, yoyo: true });
        });

        const pPutih = this.add.image(width - 100, height/1.8 + 10, 'paletPutih').setInteractive().setScale(0.8);
        pPutih.on('pointerdown', () => {
            this.selectedColor = 0xFFFFFF; 
            this.updateBrushColor(0xFFFFFF);
            this.tweens.add({ targets: pPutih, scale: 0.9, duration: 100, yoyo: true });
        });

        // Judul & Timer
        this.add.rectangle(width - 200, 100, 250, 40, 0xFFFFFF).setStrokeStyle(2, 0x000000);
        this.add.text(width - 200, 100, 'INDONESIA', {
            fontSize: '24px', color: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5);

        const timerFill = this.add.rectangle(width - 325, 60, 250, 15, 0xFF0000).setOrigin(0, 0.5);
        this.tweens.add({ targets: timerFill, scaleX: 0, duration: 30000, ease: 'Linear' });

        this.add.image(60, height - 60, 'btnHint').setInteractive().setScale(0.8)
            .on('pointerdown', () => alert("Atas Merah, Bawah Putih!"));
    } 

    updateBrushColor(color) {
        this.brushIcon.setTint(color);
    }

    checkWinCondition(zoneTop, zoneBottom) {
        const topColor = zoneTop.getData('colorCode');
        const bottomColor = zoneBottom.getData('colorCode');

        if (topColor === 0xD9252B && bottomColor === 0xFFFFFF) {
            this.time.delayedCall(1500, () => { 
                this.levelComplete();
                this.registry.set('level1Cleared', true);
                localStorage.setItem('level1Cleared', 'true');
                alert("BENAR! HEBAT! 🎉");
            });
        }
    }

    levelComplete() {
        let levelDataStr = localStorage.getItem('levelData');
        let levelData = levelDataStr ? JSON.parse(levelDataStr) : {}; // Tambahan keamanan jika levelData belum ada
        
        levelData[1] = 2; // level 1 selesai
        levelData[2] = 1; // buka level 2

        localStorage.setItem('levelData', JSON.stringify(levelData));

        this.scene.start('level');
    }
}