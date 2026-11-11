import loadCountries from "./helpers/loadCountries.js";
import shuffle from "./helpers/shuffle.js";

// let's fetch some countries so we can get playing!
loadCountries('js/data.json')
  .then((data) => {
    const countries = data.countries;
    const game = new Game(countries);
  });

class Game {
  constructor(countries, numTurns = 10) {
    // because we shift & slice the array we'll need to keep
    // an intact copy
    this.masterCountries = countries;
    // easier access to elements
    this.DOM = {
      intro: document.querySelector('.intro'),
      score: document.querySelector('.score'),
      play: document.querySelector('.play'),
      gameover: document.querySelector('.gameover'),
      result: document.querySelector('.result'),
      xpEarned: document.querySelector('.xp-earned'),
      xpProgressLabel: document.querySelector('.xp-progress-label'),
      xpProgress: document.querySelector('.xp-progress'),
      xpProgressFill: document.querySelector('.xp-progress-fill'),
      xpLevel: document.querySelector('.xp-level'),
      flagImage: document.querySelector('.flag-image'),
      flagFallback: document.querySelector('.flag-fallback'),
      answerButtons: document.querySelectorAll('.suggestions button'),
      optionFeedback: document.querySelectorAll('.option-feedback'),
      replayButtons: document.querySelectorAll('button.replay'),
    }

    // number of turns in a game
    this.numTurns = numTurns;

    // trigger the checkAnswer method when clicked
    this.DOM.answerButtons.forEach((button) => {
      button.onclick = (e) => {
        this.checkAnswer(e.target);
      }
    });

    this.DOM.replayButtons.forEach((button) => {
      button.onclick = (e) => {
        this.start();
      }
    });

    // listen to animation end events
    // in the case of .move-on, we change the card,
    // then move it back on screen
    this.DOM.play.addEventListener('animationend', (e) => {
      const targetClass = e.target.classList;
      if (targetClass.contains('slide-off')) {
        this.showCountries();
        targetClass.remove('slide-off');
        targetClass.add('slide-on');
      }
    });
  }

  start() {
    // hide intro and gameover
    this.DOM.intro.classList.add('hide');
    this.DOM.gameover.classList.add('hide');
    this.DOM.score.classList.remove('hide');
    // show play area & score
    this.DOM.play.classList.remove('hide');
    this.DOM.play.classList.add('slide-on');
    // randomize countries
    this.countries = shuffle([...this.masterCountries]);

    this.turn = 0; // current turn
    this.score = 0;
    this.hasAwardedXP = false;
    this.updateScore();
    this.showCountries();
  }

  showCountries() {
    // get our answer
    const answer = this.countries.shift();
    this.correctAnswer = answer.name;
    this.answerResolved = false;
    this.DOM.optionFeedback.forEach((feedback) => feedback.classList.add('hide'));

    // pick 4 more countries, merge our answer and shuffle
    const selected = shuffle([answer, ...this.countries.slice(0, 4)]);

    // update the DOM, starting with the flag
    const flagCodePoints = [...answer.flag]
      .map((character) => character.codePointAt(0).toString(16))
      .filter((codePoint) => codePoint !== 'fe0f')
      .join('-');
    this.DOM.flagImage.alt = `Lá cờ ${answer.name}`;
    this.DOM.flagImage.src =
      `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/${flagCodePoints}.png`;
    this.DOM.flagImage.classList.remove('hide');
    this.DOM.flagFallback.classList.add('hide');
    this.DOM.flagFallback.innerText = answer.flag;
    this.DOM.flagImage.onerror = () => {
      this.DOM.flagImage.classList.add('hide');
      this.DOM.flagFallback.classList.remove('hide');
    };
    // update each button with a country name
    selected.forEach((country, index) => {
      const button = this.DOM.answerButtons[index];
      const feedback = this.DOM.optionFeedback[index];
      // remove any classes from previous turn
      button.classList.remove('correct', 'wrong');
      button.innerText = country.name;
      button.dataset.correct = country.name === answer.name;
      feedback.classList.add('hide');
      feedback.querySelector('img').removeAttribute('src');
      feedback.querySelector('span').innerText = '';
    });

  }

  checkAnswer(button) {
    // prevent clicks once round is finished
    if (this.DOM.play.classList.contains('slide-off') || this.answerResolved) {
      return;
    }

    this.answerResolved = true;
    const correct = button.dataset.correct === 'true';
    const correctButton = [...this.DOM.answerButtons]
      .find((answerButton) => answerButton.dataset.correct === 'true');

    if (correct) {
      button.classList.add('correct');
    } else {
      button.classList.add('wrong');
      correctButton.classList.add('correct');
    }

    const showFeedback = (answerButton, sticker, alt, message) => {
      const feedback = this.DOM.optionFeedback[
        [...this.DOM.answerButtons].indexOf(answerButton)
      ];
      const image = feedback.querySelector('img');
      image.src = sticker;
      image.alt = alt;
      feedback.querySelector('span').innerText = message;
      feedback.classList.remove('hide');
    };

    if (correct) {
      showFeedback(
        button,
        'i/correct-answer-sticker.png',
        'Sticker LET’S GO',
        '🎉 Chính xác! Làm tốt lắm!'
      );
    } else {
      showFeedback(
        button,
        'i/wrong-answer-sticker.gif',
        'Mèo khóc',
        '😭 Chưa đúng!'
      );
      showFeedback(
        correctButton,
        'i/correct-answer-feedback.gif',
        'Sticker đáp án đúng',
        'Đây mới là đáp án đúng!'
      );
    }

    window.setTimeout(() => this.nextTurn(), 1500);
  }

  nextTurn() {
    const wrongAnswers = document.querySelectorAll('button.wrong').length;
    this.turn += 1;
    if (wrongAnswers === 0) {
      this.score += 1;
      this.updateScore();
    }

    if (this.turn === this.numTurns) {
      window.setTimeout(() => {
        this.gameOver();
        console.log('GAMEOVER')
      }, 1500);
    } else {
      this.DOM.play.classList.remove('slide-on');
      this.DOM.play.classList.add('slide-off');
    }
  }

  updateScore() {
    this.DOM.score.innerText = this.score;
  }

  gameOver() {
    const ratings = ['💩','🤣','😴','🤪','👎','😓','😅','😃','🤓','🔥','⭐'];
    const percentage = (this.score / this.numTurns) * 100;
    // calculate rating based on score
    const rating = Math.ceil(percentage / ratings.length);
    const xpBefore = Number(localStorage.getItem('xp')) || 0;
    const xpEarned = this.score * 10;
    const xpAfter = xpBefore + xpEarned;
    const levelBefore = Math.floor(xpBefore / 100) + 1;
    const levelAfter = Math.floor(xpAfter / 100) + 1;
    const levelProgress = xpAfter % 100;

    if (!this.hasAwardedXP) {
      localStorage.setItem('xp', xpAfter);
      this.hasAwardedXP = true;
    }

    this.DOM.play.classList.add('hide');
    this.DOM.gameover.classList.remove('hide');
    // reuse our fade-in class from the intro
    this.DOM.gameover.classList.add('fade-in');
    this.DOM.result.innerHTML = `
      ${this.score} / ${this.numTurns} câu đúng
      <br />
      Xếp hạng: ${ratings[rating]}
      `;
    this.DOM.xpEarned.innerText = `Bạn nhận được: +${xpEarned} XP (10 XP/câu đúng)`;
    this.DOM.xpProgressLabel.innerText = `Tiến độ cấp ${levelAfter}: ${levelProgress} / 100 XP`;
    this.DOM.xpProgressFill.style.width = `${levelProgress}%`;
    this.DOM.xpProgress.setAttribute('aria-valuenow', levelProgress);
    this.DOM.xpLevel.innerText = levelAfter > levelBefore
      ? `🎉 Lên cấp ${levelAfter}!`
      : `Cấp hiện tại: ${levelAfter}`;
  }
}
