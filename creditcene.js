class creditScene extends Phaser.Scene {
    constructor() {
        super('credit');
    }

    preload() {
        this.load.image('btnBack', 'asset/tombolback.png');
    }

    create() {
        const { width, height } = this.scale;

        // 1. BACKGROUND GRADASI (Sesuai Referensi C9DEFE ke 9EC9FE)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xC9DEFE, 0xC9DEFE, 0x9EC9FE, 0x9EC9FE, 1);
        bg.fillRect(0, 0, width, height);

        // 2. KONTEN CREDIT
        const creditContent = [
            "DRAW THE FLAG",
            "---------------",
            "",
            "DEVELOPED BY:",
            "Revan, Bagas,",
            "Arpian King DEV",
            "",
            "PROGRAMMING:",
            "Revan",
            "Bagas",
            "Arpian King DEV",
            "",
            "VISUAL ART & DESIGN:",
            "Arpian King DEV",
            "Revan",
            "Bagas",
            "",
            "ASSET CREATION TOOLS:",
            "Figma (UI & Vector Design)",
            "Gemini (AI Asset Generation)",
            "",
            "MUSIC & SOUND:",
            "Pixabay Music",
            "Pixabay Sound Effects",
            "",
            "ENGINE & DEVELOPMENT TOOLS:",
            "Phaser 3 Engine",
            "Visual Studio Code",
            "GitHub (Version Control & Collaboration)",
            "",
            "SPECIAL THANKS:",
            "You! For Playing Our Game",
            "",
            "--- 2026 GamingArtPian DEV ---"
        ];

        this.creditContainer = this.add.container(width / 2, height + 50);

        creditContent.forEach((text, index) => {
            const isHeader = index < 2; // Judul Game ("DRAW THE FLAG")
            const isCategory = text.includes(':'); // Kategori ("DEVELOPED BY:", dll)

            // --- SKEMA WARNA CLEAN & ELEGANT ---
            let textColor, strokeColor, strokeThick;

            if (isHeader) {
                textColor = '#ffffff';      // Putih
                strokeColor = '#1a365d';    // Navy Blue
                strokeThick = 8;
            } else if (isCategory) {
                textColor = '#1a365d';      // Navy Blue
                strokeColor = '#ffffff';    // Putih
                strokeThick = 4;
            } else {
                textColor = '#ffffff';      // Putih
                strokeColor = '#1a365d';    // Navy Blue
                strokeThick = 5;
            }

            const txt = this.add.text(0, index * 60, text, {
                fontSize: isHeader ? '56px' : (isCategory ? '28px' : '36px'),
                fontFamily: '"Arial Rounded MT Bold", "Fredoka One", "Comic Sans MS", sans-serif',
                fill: textColor,
                fontStyle: 'bold',
                align: 'center',
                stroke: strokeColor, 
                strokeThickness: strokeThick, 
                shadow: {
                    offsetX: 2,
                    offsetY: 3,
                    color: 'rgba(0, 0, 0, 0.2)', // Bayangan tipis banget biar gak kotor
                    blur: 2,
                    stroke: true,
                    fill: true
                }
            }).setOrigin(0.5);
            
            this.creditContainer.add(txt);
        });

        // 3. FUNGSI AUTO-SCROLL
        this.startAutoScroll = () => {
            const targetY = -(this.creditContainer.getBounds().height + height); 
            const distance = Math.abs(this.creditContainer.y - targetY);
            const speed = 0.05; 

            this.scrollTween = this.tweens.add({
                targets: this.creditContainer,
                y: targetY,
                duration: distance / speed,
                ease: 'Linear'
            });
        };

        this.startAutoScroll();

        // 4. LOGIKA SCROLL & AUTO-RESUME
        this.resumeTimer = null;

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (this.scrollTween) this.scrollTween.stop();
            if (this.resumeTimer) this.resumeTimer.remove();

            this.creditContainer.y -= deltaY * 0.7;

            const minY = -(this.creditContainer.getBounds().height);
            const maxY = height + 100;
            this.creditContainer.y = Phaser.Math.Clamp(this.creditContainer.y, minY, maxY);

            this.resumeTimer = this.time.delayedCall(1500, () => {
                this.startAutoScroll();
            });
        });

        // 5. TOMBOL BACK
        const backBtn = this.add.image(100, 80, 'btnBack')
            .setScale(0.8)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);

        backBtn.on('pointerover', () => {
            this.tweens.add({ targets: backBtn, scale: 0.9, duration: 200, ease: 'Back.easeOut' });
        });

        backBtn.on('pointerout', () => {
            this.tweens.add({ targets: backBtn, scale: 0.8, duration: 200, ease: 'Back.easeOut' });
        });

        backBtn.on('pointerdown', () => {
            if (this.resumeTimer) this.resumeTimer.remove();
            
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('menu');
            });
        });

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
}