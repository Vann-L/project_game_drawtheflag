class levelScene extends Phaser.Scene {
  constructor() {
    super('level'); // NAMA SCENE
  }

  preload() {
    this.load.image('bgLevel', 'asset/Level.png');
  }

  create() {
    const { width, height } = this.scale;

    // background level
    this.add.image(width / 2, height / 2, 'bgLevel')
      .setDisplaySize(width, height);

  }
}
