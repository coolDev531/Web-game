class GameScene extends Scene {
  constructor(settings, level) {
    super();

    this.settings = settings;
    this.level = level;
    this.object = null;
    this.spaceship = null;
    this.bullets = [];
    this.lastBulletTime = null;
    this.ufos = []; // enemies
    this.ufoSpeed = settings.ufoSpeed;
    this.ufoTurnAround = 1;
    this.bombs = [];
    this.bombFrequency = settings.bombFrequency;
    this.coins = [];
    this.powerUps = [];
  }

  awake(play) {
    document.title = `UFO Hunter | Level ${this.level}`;

    this.spaceship = new Spaceship(
      play.width / 2,
      play.boundaries.bottom,
      play.settings.spaceshipSpeed
    );

    // create enemies
    this.spawnUfos(play);

    this.horizontalMoving = 1;
    this.verticalMoving = 0;
    this.ufosAreSinking = false;
    this.currentUfoSinkingValue = 0;
  }

  update(play) {
    this.spaceship.update(play);

    // move bullets
    this.bullets.forEach((bullet, index) => {
      bullet.fire(play, index);
    });

    // move bombs
    this.bombs.forEach((bomb, index) => {
      bomb.drop(play, index);
    });

    this.coins.forEach((coin, index) => {
      coin.drop(play, index);
    });

    this.powerUps.forEach((powerup, index) => {
      powerup.drop(play, index);
    });

    // move enemies
    this.ufos.forEach((ufo) => this.handleMoveUfo(ufo, play));
    this.handleUfosSinking(play);
    const frontLineUfos = this.getFrontLineUfos();
    this.handleDropBombs(frontLineUfos);
    this.detectUfoCollision(play);
    this.detectSpaceshipCollision(play);
    this.handleFrontLineUfosReachedBottom(frontLineUfos, play);

    if (this.ufos.length === 0) {
      console.log(`Level ${play.level} completed!`);
      play.level += 1;
      play.goToScene(new TransferScene(play.level));
    }
  }

  destroy() {
    this.spaceship.removeEventListeners();
  }

  draw(play) {
    super.draw(play);

    this.spaceship.draw();

    // draw bullets
    this.bullets.forEach((bullet) => {
      bullet.draw();
    });

    // draw enemies
    this.ufos.forEach((ufo) => {
      ufo.draw();
    });

    // draw bombs
    this.bombs.forEach((bomb) => {
      bomb.draw();
    });

    this.coins.forEach((coin) => {
      coin.draw();
    });

    this.powerUps.forEach((powerup) => {
      powerup.draw();
    });

    this.drawHeader();
    this.drawFooter();
  }

  handleMoveUfo(ufo, play) {
    // const newX = ufo.move(play, this.ufoTurnAround);
    const { newX, newY, reachedLeftOrRightBoundary } = ufo.getNextPosition(
      play,
      this.ufoTurnAround,
      this.horizontalMoving,
      this.verticalMoving
    );

    if (!this.ufosAreSinking) {
      if (reachedLeftOrRightBoundary) {
        this.ufoTurnAround *= -1;
        this.horizontalMoving = 0;
        this.verticalMoving = 1;
        this.ufosAreSinking = true;
      }
    }

    ufo.position.x = newX;
    ufo.position.y = newY;
  }

  handleUfosSinking(play) {
    if (this.ufosAreSinking) {
      this.currentUfoSinkingValue +=
        this.ufoSpeed * play.settings.updateSeconds;

      if (this.currentUfoSinkingValue >= play.settings.ufoSinkingValue) {
        // this is when the ufos have already sunk the amount of pixels we wanted them to sink
        this.ufosAreSinking = false;
        this.currentUfoSinkingValue = 0;
        this.verticalMoving = 0;
        this.horizontalMoving = 1;
      }
    }
  }

  spawnUfos(play) {
    this.ufoSpeed = play.settings.ufoSpeed + this.level * 7; // increase the speed of the ufos by 7 for each level
    this.bombSpeed = play.settings.bombSpeed + this.level * 10; // increase the speed of the bombs by 10 for each level
    this.bombFrequency = play.settings.bombFrequency + this.level * 0.05; // increase the frequency of the bombs by 0.05 for each level

    const maxRows = play.settings.ufoRows;
    const maxColumns = play.settings.ufoColumns;
    const initialUfos = [];

    let currentRow, currentColumn;

    // we're going to have 4 columns and 4 lines,
    // each enemy is 32px wide and 24px tall
    for (currentRow = 0; currentRow < maxRows; currentRow++) {
      for (currentColumn = 0; currentColumn < maxColumns; currentColumn++) {
        let x, y;
        x = play.width / 2 + currentColumn * 50 - (maxColumns - 1) * 25; // maxColumns - 1 * 25 is to center the ufos, 50 is the distance between the ufos on the horizontal axis (x) and 25 is half of that distance
        y = play.boundaries.top + 30 + currentRow * 30; // the distance is going to be 30 pixels between the ufos on the vertical axis

        initialUfos.push(
          new Ufo(x, y, this.ufoSpeed, currentRow, currentColumn, this.level)
        );

        // console.log(
        //   `UFO placed at row: ${currentRow}, column: ${currentColumn}, x: ${x}, y: ${y}`
        // );
      }
    }

    this.ufos = initialUfos;
  }

  // ufos bombing
  // Sorting UFOs - which are at the bottom of each column
  getFrontLineUfos() {
    const frontLineUfos = [];
    this.ufos.forEach((ufo) => {
      if (
        !frontLineUfos[ufo.column] ||
        frontLineUfos[ufo.column].row < ufo.row
      ) {
        // this means that we don't have an ufo in that column or the ufo that we have in that column is behind the current ufo
        frontLineUfos[ufo.column] = ufo;
      }
    });

    return frontLineUfos;
  }

  // ufos bombing
  // Bombing
  handleDropBombs(frontLineUfos) {
    frontLineUfos.forEach((ufo) => {
      let chance = this.bombFrequency * this.settings.updateSeconds;
      if (chance > Math.random()) {
        // make the ufo drop a bomb
        const bombX = ufo.position.x;
        const bombY = ufo.position.y + ufo.height / 2;
        this.bombs.push(new Bomb(bombX, bombY, this.bombSpeed));
      }
    });
  }

  detectUfoCollision(play) {
    this.ufos.forEach((ufo, ufoIndex) => {
      this.bullets.forEach((bullet, bulletIndex) => {
        bullet.onCollision(ufo, () => {
          this.ufos.splice(ufoIndex, 1);
          this.bullets.splice(bulletIndex, 1);
          play.incrementScore(play.settings.pointsPerUfo);
          play.soundsController.playSound('ufoDeath');

          // coindrop
          if (Math.random() >= 0.7) {
            const coinY = ufo.position.y + ufo.height / 2;
            this.coins.push(
              new Coin(ufo.position.x, coinY, play.settings.coinSpeed)
            );
          }

          // powerup drop
          if (Math.random() * 100 >= 95) {
            const powerupY = ufo.position.y + ufo.height / 2;
            this.powerUps.push(
              new Powerup(ufo.position.x, powerupY, play.settings.powerUpSpeed)
            );
          }
        });
      });
    });
  }

  detectSpaceshipCollision(play) {
    // detect if the spaceship has been hit by a bomb
    this.bombs.forEach((bomb, bombIndex) => {
      bomb.onCollision(
        this.spaceship,
        () => {
          this.bombs.splice(bombIndex, 1);

          play.soundsController.playSound('explosion');

          // game over
          if (play.shields === 0) {
            play.gameOver();
          }

          play.shields -= 1;
        },
        {
          leftPadding: 2,
          rightPadding: -2,
          topPadding: 6,
        }
      );
    });

    // detect if the spaceship has been hit by a coin
    this.coins.forEach((coin, coinIndex) => {
      coin.onCollision(
        this.spaceship,
        () => {
          this.coins.splice(coinIndex, 1);
          play.incrementScore(play.settings.pointsPerCoin);
          play.soundsController.playSound('coin');
        },
        {
          leftPadding: 2,
          rightPadding: -2,
          topPadding: 6,
        }
      );
    });

    // detect if the spaceship has been hit by a powerup
    this.powerUps.forEach((powerup, powerupIndex) => {
      powerup.onCollision(
        this.spaceship,
        () => {
          this.powerUps.splice(powerupIndex, 1);
          play.soundsController.playSound('powerup');

          if (play.playerPowerUps >= play.settings.maxPowerUps) {
            play.incrementScore(1000);
            play.playerPowerUps = play.settings.maxPowerUps;
          } else {
            play.playerPowerUps += 1;
          }
        },
        {
          leftPadding: 2,
          rightPadding: -2,
          topPadding: 6,
        }
      );
    });
  }

  onKeyDown(play, keyCode) {
    if (keyCode === 'KeyM') {
      play.soundsController.mute();
    }

    if (keyCode === 'Escape') {
      // not using goToScene because goToScene() clears the stack and we want to keep the current game scene in the stack
      play.pushScene(new PauseScene());
    }
  }

  drawFooter() {
    ctx.font = '16px Comic Sans MS';
    ctx.fillStyle = '#424242';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Press M to switch sound ON/OFF.  Sound:`,
      play.boundaries.left,
      play.boundaries.bottom + 70
    );

    const soundStatus = play.soundsController.isMuted() ? 'OFF' : 'ON';
    ctx.fillStyle = play.soundsController.isMuted() ? '#ff0000' : '#00ff00';
    ctx.fillText(
      soundStatus,
      play.boundaries.left + 375,
      play.boundaries.bottom + 70
    );

    ctx.fillStyle = '#424242';
    ctx.textAlign = 'right';
    ctx.fillText(
      'Press ESC to Pause.',
      play.boundaries.right,
      play.boundaries.bottom + 70
    );
  }

  drawHeader() {
    // score
    ctx.textAlign = 'center';
    ctx.fillStyle = '#BDBDBD';
    ctx.fontStyle = 'bold 24px Comic Sans MS';
    ctx.fillText('Score', play.boundaries.right, play.boundaries.top - 75);
    ctx.font = 'bold 30px Comic Sans MS';
    ctx.fillText(play.score, play.boundaries.right, play.boundaries.top - 25);

    // level
    ctx.font = 'bold 24px Comic Sans MS';
    ctx.fillText('Level', play.boundaries.left, play.boundaries.top - 75);
    ctx.font = 'bold 30px Comic Sans MS';
    ctx.fillText(this.level, play.boundaries.left, play.boundaries.top - 25);

    ctx.textAlign = 'center';
    // shields
    if (play.shields > 0) {
      ctx.fillStyle = '#BDBDBD';
      ctx.font = 'bold 24px Comic Sans MS';
      ctx.fillText('Shields', play.width / 2, play.boundaries.top - 75);
      ctx.font = 'bold 30px Comic Sans MS';
      ctx.fillText(play.shields, play.width / 2, play.boundaries.top - 25);
    } else {
      ctx.fillStyle = '#ff4d4d';
      ctx.font = 'bold 24px Comic Sans MS';
      ctx.fillText('WARNING', play.width / 2, play.boundaries.top - 75);

      ctx.fillStyle = '#BDBDBD';
      ctx.fillText(
        'No shields left!',
        play.width / 2,
        play.boundaries.top - 25
      );
    }
  }

  handleFrontLineUfosReachedBottom(frontLineUfos, play) {
    if (frontLineUfos.length > 0) {
      const frontLineUfo = frontLineUfos[0];
      if (
        frontLineUfo &&
        frontLineUfo.position.y + frontLineUfo.height >= play.boundaries.bottom
      ) {
        play.gameOver();
      }
    }
  }
}
