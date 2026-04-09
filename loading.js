// File: loading.js
// Genshin Impact Style Loading Screen

class loadingScene extends Phaser.Scene {
    constructor() {
        super('loading');
    }

    preload() {
        const { width, height } = this.scale;

        // ============================================================
        // 1. BACKGROUND EPIC (Gradasi Malam + Bintang)
        // ============================================================
        
        // Background gradasi gelap ke biru malam (khas Genshin)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a1128, 0x0a1128, 0x1a2a6c, 0x1a2a6c, 1);
        bg.fillRect(0, 0, width, height);

        // Layer bintang-bintang (starfield)
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 3),
                0xffffff,
                Phaser.Math.FloatBetween(0.3, 1)
            );
            this.stars.push({
                obj: star,
                speed: Phaser.Math.FloatBetween(0.02, 0.08),
                phase: Phaser.Math.FloatBetween(0, Math.PI * 2)
            });
        }

        // ============================================================
        // 2. PULAU MENGAMBANG (Floating Islands khas Genshin)
        // ============================================================
        
        // Pulau utama di tengah bawah
        this.mainIsland = this.add.container(width / 2, height * 0.85);
        
        // Tanah pulau (bentuk oval)
        const islandBase = this.add.graphics();
        islandBase.fillStyle(0x2d1b4e, 1);
        islandBase.fillEllipse(0, 0, 400, 80);
        islandBase.fillStyle(0x4a2c8a, 1);
        islandBase.fillEllipse(0, -5, 380, 70);
        
        // Rumput di atas pulau
        const grass = this.add.graphics();
        grass.fillStyle(0x2e8b57, 0.8);
        grass.fillEllipse(0, -15, 350, 50);
        
        // Batu-batu kecil
        const rock1 = this.add.graphics();
        rock1.fillStyle(0x6b5b95, 1);
        rock1.fillRoundedRect(-120, -20, 30, 20, 8);
        const rock2 = this.add.graphics();
        rock2.fillStyle(0x5b4a7a, 1);
        rock2.fillRoundedRect(140, -15, 25, 15, 6);
        
        // Pohon kecil stylized
        const tree = this.add.container(-60, -35);
        const trunk = this.add.graphics();
        trunk.fillStyle(0x8b4513, 1);
        trunk.fillRect(-5, 0, 10, 30);
        const leaves = this.add.graphics();
        leaves.fillStyle(0x228b22, 1);
        leaves.fillCircle(0, -5, 20);
        leaves.fillStyle(0x32cd32, 1);
        leaves.fillCircle(-10, -10, 15);
        leaves.fillCircle(10, -10, 15);
        tree.add([trunk, leaves]);
        
        this.mainIsland.add([islandBase, grass, rock1, rock2, tree]);
        
        // Pulau kecil mengambang di kiri atas
        this.leftIsland = this.add.container(width * 0.2, height * 0.25);
        const smallIsland = this.add.graphics();
        smallIsland.fillStyle(0x3d2b6e, 1);
        smallIsland.fillEllipse(0, 0, 150, 40);
        smallIsland.fillStyle(0x5a3d9a, 1);
        smallIsland.fillEllipse(0, -3, 140, 35);
        const smallGrass = this.add.graphics();
        smallGrass.fillStyle(0x2e8b57, 0.7);
        smallGrass.fillEllipse(0, -8, 130, 30);
        // Kristal kecil
        const crystal = this.add.graphics();
        crystal.fillStyle(0x00ffff, 0.8);
        crystal.fillTriangle(0, -25, -10, -5, 10, -5);
        crystal.fillTriangle(0, -30, -6, -15, 6, -15);
        this.leftIsland.add([smallIsland, smallGrass, crystal]);
        
        // Pulau kecil mengambang di kanan atas
        this.rightIsland = this.add.container(width * 0.8, height * 0.35);
        const rightSmallIsland = this.add.graphics();
        rightSmallIsland.fillStyle(0x3d2b6e, 1);
        rightSmallIsland.fillEllipse(0, 0, 120, 35);
        rightSmallIsland.fillStyle(0x5a3d9a, 1);
        rightSmallIsland.fillEllipse(0, -3, 110, 30);
        this.rightIsland.add([rightSmallIsland]);

        // Animasi pulau mengambang (naik turun)
        this.tweens.add({
            targets: this.leftIsland,
            y: height * 0.25 - 15,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: this.rightIsland,
            y: height * 0.35 - 12,
            duration: 3500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 500
        });
        
        this.tweens.add({
            targets: this.mainIsland,
            y: height * 0.85 - 8,
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 200
        });

        // ============================================================
        // 3. EFEK PARTIKEL MAGIS (Sparkles & Falling Stars)
        // ============================================================
        
        // Bikin tekstur sparkle
        const sparkleGfx = this.add.graphics();
        sparkleGfx.fillStyle(0xffffff, 1);
        sparkleGfx.fillCircle(4, 4, 4);
        sparkleGfx.generateTexture('sparkle', 8, 8);
        sparkleGfx.destroy();
        
        // Bikin tekstur star (4-point)
        const starGfx = this.add.graphics();
        starGfx.fillStyle(0xffd700, 1);
        starGfx.beginPath();
        starGfx.moveTo(8, 0);
        starGfx.lineTo(10, 6);
        starGfx.lineTo(16, 8);
        starGfx.lineTo(10, 10);
        starGfx.lineTo(8, 16);
        starGfx.lineTo(6, 10);
        starGfx.lineTo(0, 8);
        starGfx.lineTo(6, 6);
        starGfx.closePath();
        starGfx.fillPath();
        starGfx.generateTexture('star4', 16, 16);
        starGfx.destroy();

        // Partikel magis di sekitar layar
        this.magicParticles = this.add.particles(0, 0, 'sparkle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: { min: 2000, max: 4000 },
            speedY: { min: -20, max: -50 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 0.8, end: 0 },
            quantity: 2,
            blendMode: 'ADD',
            frequency: 300,
            tint: [0x88ccff, 0xffd700, 0xff69b4]
        });

        // Bintang jatuh (shooting stars)
        this.shootingStars = this.add.particles(0, 0, 'star4', {
            x: { min: 0, max: width },
            y: { min: 0, max: height * 0.3 },
            lifespan: 1500,
            speedX: { min: 200, max: 400 },
            speedY: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            quantity: 1,
            blendMode: 'ADD',
            frequency: 2000,
            rotate: { min: 0, max: 360 }
        });

        // ============================================================
        // 4. LOGO & TITLE (Dengan efek glow)
        // ============================================================
        
        // Glow di belakang title
        const titleGlow = this.add.circle(width / 2, height * 0.22, 200, 0x4a90e2, 0.15)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
            targets: titleGlow,
            scale: 1.3,
            alpha: 0.08,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Judul Game
        this.add.text(width / 2, height * 0.18, 'DRAW THE FLAG', {
            fontSize: '52px',
            fontFamily: '"Cinzel", "Georgia", "Arial Black", serif',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#1a365d',
            strokeThickness: 4,
            shadow: { 
                offsetX: 0, 
                offsetY: 0, 
                color: '#4a90e2', 
                blur: 20, 
                stroke: false, 
                fill: true 
            }
        }).setOrigin(0.5);

        // Subtitle elegan
        const subtitle = this.add.text(width / 2, height * 0.27, '─ A Colorful Journey ─', {
            fontSize: '18px',
            fontFamily: '"Cinzel", "Georgia", serif',
            fill: '#c0c0c0',
            letterSpacing: 8
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: subtitle,
            alpha: 0.6,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ============================================================
        // 5. ELEMEN ANIMASI (Pyro, Hydro, Anemo - Ikon Elemen)
        // ============================================================
        
        this.elementContainer = this.add.container(width / 2, height * 0.45);
        
        // Bikin 3 elemen mengelilingi progress bar
        const elements = [
            { icon: '🔥', color: 0xff4500, angle: -90, distance: 180 },
            { icon: '💧', color: 0x00bfff, angle: 0, distance: 200 },
            { icon: '🍃', color: 0x32cd32, angle: 90, distance: 180 }
        ];
        
        this.elementIcons = [];
        elements.forEach((elem, i) => {
            const icon = this.add.text(0, 0, elem.icon, {
                fontSize: '32px'
            }).setOrigin(0.5);
            
            // Glow di belakang ikon
            const glow = this.add.circle(0, 0, 30, elem.color, 0.2)
                .setBlendMode(Phaser.BlendModes.ADD);
            
            const container = this.add.container(0, 0, [glow, icon]);
            this.elementContainer.add(container);
            
            this.elementIcons.push({
                container: container,
                angle: elem.angle,
                distance: elem.distance,
                speed: 0.5 + i * 0.1
            });
            
            // Animasi pulse glow
            this.tweens.add({
                targets: glow,
                scale: 1.5,
                alpha: 0.05,
                duration: 1000 + i * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        // ============================================================
        // 6. PROGRESS BAR (Style Genshin - Runes/Garis Elegan)
        // ============================================================
        
        const barWidth = 450;
        const barHeight = 8;
        const barX = width / 2 - barWidth / 2;
        const barY = height * 0.52;

        // Frame progress bar (dengan ornamen)
        const barFrame = this.add.graphics();
        barFrame.lineStyle(2, 0x4a90e2, 0.8);
        barFrame.strokeRoundedRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10, 6);
        
        // Ornamen di ujung kiri dan kanan
        const leftOrnament = this.add.graphics();
        leftOrnament.fillStyle(0x4a90e2, 0.6);
        leftOrnament.fillCircle(barX - 8, barY + barHeight/2, 4);
        const rightOrnament = this.add.graphics();
        rightOrnament.fillStyle(0x4a90e2, 0.6);
        rightOrnament.fillCircle(barX + barWidth + 8, barY + barHeight/2, 4);

        // Background progress bar (transparan gelap)
        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x000000, 0.4);
        progressBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);

        // Fill progress bar (gradasi biru ke cyan)
        this.progressFill = this.add.graphics();
        
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRoundedRect(barX, barY, barWidth, barHeight, 4);
        this.progressFill.setMask(maskShape.createGeometryMask());

        // Rune kecil di sepanjang progress bar
        this.runes = [];
        for (let i = 0; i < 5; i++) {
            const rune = this.add.text(barX + (barWidth / 4) * i, barY - 12, '◆', {
                fontSize: '12px',
                fill: '#4a90e2',
                alpha: 0.5
            }).setOrigin(0.5);
            this.runes.push(rune);
        }

        // Teks persentase
        this.progressText = this.add.text(width / 2, barY + 35, '0%', {
            fontSize: '28px',
            fontFamily: '"Cinzel", "Georgia", serif',
            fill: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 0, offsetY: 0, color: '#4a90e2', blur: 10, fill: true }
        }).setOrigin(0.5);

        // Status loading text
        this.statusText = this.add.text(width / 2, barY + 75, 'Connecting to the world...', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#a0c4e8',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // ============================================================
        // 7. LOADING TIPS (Gaya Genshin - Loading Screen Tips)
        // ============================================================
        
        const tips = [
            "Tip: Warna bendera harus sesuai urutan aslinya!",
            "Tip: Perhatikan batas waktu, jangan sampai kehabisan!",
            "Tip: Gunakan hint dengan bijak, setiap level memberi 1 hint!",
            "Tip: Klik area bergaris untuk mulai mewarnai!",
            "Tip: Beberapa bendera memiliki logo yang muncul setelah diwarnai!",
            "Tip: Bendera Indonesia: Merah di atas, Putih di bawah!",
            "Tip: Bendera Jepang: Latar putih dengan lingkaran merah!",
            "Tip: Bendera Prancis: Biru, Putih, Merah (vertikal)!",
            "Tip: Setiap negara memiliki cerita dan fakta uniknya sendiri!",
            "Tip: Kamu bisa replay level untuk mengumpulkan lebih banyak hint!"
        ];
        
        let tipIndex = 0;
        
        // Container untuk tip
        this.tipContainer = this.add.container(width / 2, height * 0.78);
        
        // Ikon buku/scroll
        const tipIcon = this.add.text(-200, 0, '📜', {
            fontSize: '24px'
        }).setOrigin(0.5);
        
        // Teks tip
        this.tipText = this.add.text(-160, 0, tips[0], {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#e0d8c8',
            fontStyle: 'italic',
            wordWrap: { width: 380 }
        }).setOrigin(0, 0.5);
        
        this.tipContainer.add([tipIcon, this.tipText]);
        
        // Ganti tip setiap 4 detik
        this.time.addEvent({
            delay: 4000,
            callback: () => {
                tipIndex = (tipIndex + 1) % tips.length;
                this.tweens.add({
                    targets: this.tipContainer,
                    alpha: 0,
                    x: width / 2 - 50,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        this.tipText.setText(tips[tipIndex]);
                        this.tipContainer.x = width / 2 + 50;
                        this.tweens.add({
                            targets: this.tipContainer,
                            alpha: 1,
                            x: width / 2,
                            duration: 300,
                            ease: 'Power2'
                        });
                    }
                });
            },
            loop: true
        });

        // ============================================================
        // 8. ANIMASI KARAKTER KECIL (Paimon-style companion)
        // ============================================================
        
        this.companion = this.add.container(width * 0.85, height * 0.75);
        
        // Badan
        const body = this.add.graphics();
        body.fillStyle(0xf5f5dc, 1);
        body.fillCircle(0, 0, 20);
        
        // Rambut/Mahkota
        const hair = this.add.graphics();
        hair.fillStyle(0xffd700, 1);
        hair.fillTriangle(0, -20, -10, -8, 10, -8);
        
        // Mata
        const eyeL = this.add.circle(-6, -2, 3, 0x000000);
        const eyeR = this.add.circle(6, -2, 3, 0x000000);
        const eyeSparkleL = this.add.circle(-5, -4, 1, 0xffffff);
        const eyeSparkleR = this.add.circle(7, -4, 1, 0xffffff);
        
        // Pipi
        const blushL = this.add.circle(-10, 3, 3, 0xffb6c1, 0.5);
        const blushR = this.add.circle(10, 3, 3, 0xffb6c1, 0.5);
        
        // Sayap kecil
        const wingL = this.add.graphics();
        wingL.fillStyle(0xe0e0e0, 0.8);
        wingL.fillEllipse(-22, -5, 12, 18);
        const wingR = this.add.graphics();
        wingR.fillStyle(0xe0e0e0, 0.8);
        wingR.fillEllipse(22, -5, 12, 18);
        
        this.companion.add([wingL, wingR, body, hair, eyeL, eyeR, eyeSparkleL, eyeSparkleR, blushL, blushR]);
        
        // Animasi terbang
        this.tweens.add({
            targets: this.companion,
            y: height * 0.75 - 15,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: [wingL, wingR],
            scaleY: 0.7,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ============================================================
        // 9. MONITOR PROGRESS LOADING
        // ============================================================
        
        this.load.on('progress', (value) => {
            const barWidth = 450;
            const barHeight = 8;
            const barX = width / 2 - barWidth / 2;
            const barY = height * 0.52;
            
            const fillWidth = barWidth * value;
            
            this.progressFill.clear();
            
            // Gradient effect di progress bar (biru ke cyan)
            this.progressFill.fillStyle(0x4a90e2, 1);
            this.progressFill.fillRect(barX, barY, fillWidth, barHeight);
            
            if (value > 0.3) {
                this.progressFill.fillStyle(0x5b9ae2, 1);
                this.progressFill.fillRect(barX + fillWidth * 0.3, barY, fillWidth * 0.4, barHeight);
            }
            if (value > 0.6) {
                this.progressFill.fillStyle(0x00d4ff, 1);
                this.progressFill.fillRect(barX + fillWidth * 0.6, barY, fillWidth * 0.4, barHeight);
            }
            
            // Animasi rune menyala sesuai progress
            this.runes.forEach((rune, i) => {
                const threshold = (i + 1) / this.runes.length;
                if (value >= threshold) {
                    rune.setAlpha(1);
                    rune.setColor('#00d4ff');
                } else {
                    rune.setAlpha(0.3);
                    rune.setColor('#4a90e2');
                }
            });
            
            this.progressText.setText(Math.floor(value * 100) + '%');
        });

        this.load.on('fileprogress', (file) => {
            const fileName = file.key;
            let displayName = fileName;
            
            if (fileName.includes('flagwin')) displayName = 'Bendera Kemenangan';
            else if (fileName.includes('palet')) displayName = 'Palet Warna';
            else if (fileName.includes('level')) displayName = 'Data Level';
            else if (fileName.includes('logo')) displayName = 'Lambang Negara';
            else if (fileName.includes('bgm') || fileName.includes('sfx')) displayName = 'Audio';
            else if (fileName.length > 20) displayName = fileName.substring(0, 17) + '...';
            
            this.statusText.setText('Memuat: ' + displayName);
        });

        this.load.on('complete', () => {
            this.statusText.setText('Perjalanan akan segera dimulai...');
            
            // Animasi semua rune menyala
            this.runes.forEach(rune => {
                this.tweens.add({
                    targets: rune,
                    alpha: 1,
                    scale: 1.3,
                    duration: 200,
                    yoyo: true
                });
            });
        });

        // ============================================================
        // 10. LOAD SEMUA ASSET GAME
        // ============================================================
        
        // --- UI & COMMON ---
        this.load.image('bgBoard', 'asset/Gameplay.png');
        this.load.image('btnBack', 'asset/tombolback.png');
        this.load.image('btnHint', 'asset/petunjuk.png');
        this.load.image('iconjam', 'asset/ICON JAM.png');
        
        // --- PALET WARNA ---
        this.load.image('paletMerah', 'asset/paletmerah.png');
        this.load.image('paletPutih', 'asset/paletputih.png');
        this.load.image('paletBiru', 'asset/paletbiru.png');
        this.load.image('paletHijau', 'asset/palethijau.png');
        this.load.image('paletKuning', 'asset/paletkuning.png');
        this.load.image('paletHitam', 'asset/palethitam.png');
        this.load.image('paletOrange', 'asset/paletorange.png');
        this.load.image('paletBiruMuda', 'asset/paletbirumuda.png');
        
        // --- KUAS ---
        this.load.image('bgKuas', 'asset/penampungkuas.png');
        this.load.image('gagangKuas', 'asset/gagang_kuas.png');
        this.load.image('buluKuas', 'asset/bulu_kuas.png');
        
        // --- WIN SCREEN ---
        this.load.image('winBG', 'asset/tulisan_menang.png');
        this.load.image('btnHome', 'asset/home.png');
        this.load.image('btnReplay', 'asset/ulang.png');
        this.load.image('btnNext', 'asset/next.png');
        this.load.image('kotak_win', 'asset/kotak_win.png');
        this.load.image('btn_x', 'asset/btn_x.png');
        
        // --- LOSE SCREEN ---
        this.load.image('loseText', 'asset/tulisan_kalah.png');
        this.load.image('iconX', 'asset/x.png');
        this.load.image('btnReplayLose', 'asset/replay_kalah.png');
        this.load.image('btnHomeLose', 'asset/home_kalah.png');
        
        // --- HINT SYSTEM ---
        this.load.image('hintBG', 'asset/popuphint.png');
        this.load.image('btnYes', 'asset/btn_yes.png');
        this.load.image('btnNo', 'asset/btn_no.png');
        this.load.image('quizBG', 'asset/quizBG.png');
        this.load.image('optionBtn', 'asset/optionBtn.png');
        
        // --- FLAG WIN IMAGES (1-20) ---
        for (let i = 1; i <= 20; i++) {
            this.load.image(`flagwin_lvl${i}`, `asset/flagwin_lvl${i}.png`);
        }
        
        // --- KOREA SELATAN ---
        this.load.image('korea_atas', 'asset/korea_atas.png');
        this.load.image('korea_bawah', 'asset/korea_bawah.png');
        this.load.image('korea_garis_outline', 'asset/korea_garis_outline.png');
        this.load.image('korea_garis_solid', 'asset/korea_garis_solid.png');
        
        // --- SWISS ---
        this.load.image('swiss_cross', 'asset/swiss_cross.png');
        this.load.image('swiss_garis', 'asset/swiss_garis.png');
        
        // --- TURKI ---
        this.load.image('turki_logo', 'asset/turki_logo.png');
        this.load.image('turki_garis', 'asset/turki_garis.png');
        
        // --- SPANYOL ---
        this.load.image('spain_logo_garis', 'asset/spain_logo_garis.png');
        this.load.image('spain_logo_warna', 'asset/spain_logo_warna.png');
        
        // --- MESIR ---
        this.load.image('mesir_logo_garis', 'asset/mesir_logo_garis.png');
        this.load.image('mesir_logo_warna', 'asset/mesir_logo_warna.png');
        
        // --- INDIA ---
        this.load.image('india_logo_garis', 'asset/india_logo_garis.png');
        this.load.image('india_logo_warna', 'asset/india_logo_warna.png');
        
        // --- BRAZIL ---
        this.load.image('brazil_diamond', 'asset/brazil_diamond.png');
        this.load.image('brazil_circle', 'asset/brazil_circle.png');
        this.load.image('brazil_garis', 'asset/brazil_garis.png');
        this.load.image('brazil_logo_warna', 'asset/brazil_logo_warna.png');
        
        // --- KAMBOJA ---
        this.load.image('kamboja_logo_garis', 'asset/kamboja_logo_garis.png');
        this.load.image('kamboja_logo_warna', 'asset/kamboja_logo_warna.png');
        
        // --- KANADA ---
        this.load.image('canada_logo_garis', 'asset/canada_logo_garis.png');
        this.load.image('canada_logo_warna', 'asset/canada_logo_warna.png');
        
        // --- ARGENTINA ---
        this.load.image('argentina_logo_garis', 'asset/argentina_logo_garis.png');
        this.load.image('argentina_logo_warna', 'asset/argentina_logo_warna.png');
        
        // --- AMERIKA SERIKAT ---
        this.load.image('us_stripes', 'asset/us_stripes.png');
        this.load.image('us_canton', 'asset/us_canton.png');
        this.load.image('us_stars', 'asset/us_stars.png');
        this.load.image('us_garis', 'asset/us_garis.png');
        
        // --- MENU & LEVEL SELECT ---
        this.load.image('bg', 'asset/BG MAIN MENU.png');
        this.load.image('btnPlay', 'asset/TOMBOL PLAY.png');
        this.load.image('title', 'asset/title.png');
        this.load.image('btn_credit', 'asset/TOMBOL CREDIT.png');
        this.load.image('bgLevel', 'asset/Level.png');
        this.load.image('garis', 'asset/garis.png');
        this.load.image('TEXTLEVEL', 'asset/text_level.png');
        this.load.image('levelpijak', 'asset/levelpijak.png');
        this.load.image('levellock', 'asset/levellock.png');
        
        for (let i = 1; i <= 20; i++) {
            this.load.image(`level${i}`, `asset/level${i}.png`);
        }
        
        // --- VISUAL NOVEL ---
        this.load.image('char_welcome', 'asset/wellcome.png');
        this.load.image('char_intro', 'asset/introduce.png');
        this.load.image('char_explain', 'asset/explaining.png');
        this.load.image('char_thinking', 'asset/thingking.png');
        this.load.image('char_goodluck', 'asset/goodluck.png');
        this.load.image('tutorial_img', 'asset/tutorial.png');
        this.load.image('tutorial2_img', 'asset/tutorial2.png');
        this.load.image('tutorial3_img', 'asset/tutorial3.png');
        this.load.image('pointer', 'asset/telunjuk.png');
        this.load.image('btn_skip', 'asset/btn_skip.png');
        this.load.image('popup_confirm', 'asset/popup_confirm.png');
        
        // --- SETTINGS ---
        this.load.image('btn_pengaturan', 'asset/btn_pengaturan.png');
        this.load.image('pengaturan', 'asset/pengaturan.png');
        this.load.image('close_pengaturan', 'asset/close_pengaturan.png');
        this.load.image('on_musik', 'asset/on_musik.png');
        this.load.image('off_musik', 'asset/off_musik.png');
        this.load.image('on_suara', 'asset/on_suara.png');
        this.load.image('off_suara', 'asset/off_suara.png');
        this.load.image('reset_game', 'asset/reset_game.png');
        this.load.image('popup_reset', 'asset/popup_reset.png');
        
        // --- AUDIO ---
        this.load.audio('suaraKuas', 'asset/suara_kuas.mp3');
        this.load.audio('pop', 'asset/pop.mp3');
        this.load.audio('soundMenang', 'asset/menang.mp3');
        this.load.audio('soundKalah', 'asset/kalah.mp3');
        this.load.audio('sfxTicking', 'asset/clock_ticking.mp3');
        this.load.audio('bgm_menu', 'asset/bossanova.mp3');
        this.load.audio('sfx_transition', 'asset/transisi.mp3');
        this.load.audio('sfx_woosh', 'asset/woosh.mp3');
        this.load.audio('sfx_pop', 'asset/pop.mp3');
    }

    update() {
        // Animasi bintang berkelap-kelip
        this.stars.forEach(star => {
            star.obj.alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(this.time.now * star.speed + star.phase));
        });
        
        // Rotasi elemen mengelilingi progress bar
        this.elementIcons.forEach((elem, i) => {
            elem.angle += 0.005 * elem.speed;
            const rad = Phaser.Math.DegToRad(elem.angle);
            elem.container.x = Math.cos(rad) * elem.distance;
            elem.container.y = Math.sin(rad) * elem.distance * 0.5;
        });
    }

    create() {
        const { width, height } = this.scale;

        // Animasi epic complete!
        this.statusText.setText('✨ Dunia telah siap! ✨');
        
        // Progress bar jadi emas
        const barWidth = 450;
        const barHeight = 8;
        const barX = width / 2 - barWidth / 2;
        const barY = height * 0.52;
        
        this.progressFill.clear();
        this.progressFill.fillStyle(0xffd700, 1);
        this.progressFill.fillRect(barX, barY, barWidth, barHeight);
        
        this.progressText.setText('100%');
        this.progressText.setColor('#ffd700');
        
        // Animasi semua elemen menyala
        this.runes.forEach(rune => {
            rune.setAlpha(1);
            rune.setColor('#ffd700');
            this.tweens.add({
                targets: rune,
                scale: 1.5,
                alpha: 1,
                duration: 300,
                yoyo: true,
                repeat: 2
            });
        });

        // Animasi companion loncat senang
        this.tweens.add({
            targets: this.companion,
            y: height * 0.75 - 25,
            duration: 300,
            yoyo: true,
            repeat: 3,
            ease: 'Back.out'
        });

        // Portal effect (lingkaran cahaya membesar)
        const portal = this.add.circle(width / 2, height / 2, 10, 0x00d4ff, 0.3)
            .setBlendMode(Phaser.BlendModes.ADD);
        
        this.tweens.add({
            targets: portal,
            scale: 50,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.out'
        });

        // Delay sebentar lalu transisi ke menu
        this.time.delayedCall(1200, () => {
            this.cameras.main.fadeOut(800, 10, 20, 40);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('menu');
            });
        });
    }
}