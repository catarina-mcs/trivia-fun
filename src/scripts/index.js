/* eslint-disable no-undef */
const startBtn = document.getElementById('start-btn');
const board = document.querySelector('.board');
const game = document.querySelector('.game');
const circles = document.querySelectorAll('.circle');
const lines = document.querySelectorAll('.line');
const questionCounter = document.getElementById('question-count');
const errorCounter = document.getElementById('error-count');
const answer = document.getElementById('answer');
const questionHtml = document.querySelector('.question');
const category = document.getElementById('category');
const difficulty = document.getElementById('difficulty');
const answers = document.querySelectorAll('.answer');
const nextBtn = document.getElementById('next-btn');
const victoryMessage = document.querySelector('.victory-message');
const gameoverMessage = document.querySelector('.gameover-message');
const restartBtn = document.getElementById('restart-btn');
let questionNumber = 0;
let errorCount = 0;
let token, question;


startBtn.addEventListener('click', () => {
    document.querySelector('.game-intro').style.display = 'none';
    generateToken().then(token => getQuestion(token));
});


async function generateToken() {
    let response = await fetch('https://opentdb.com/api_token.php?command=request');
    let data = await response.json();
    token = data.token;
    return token;
}


async function getQuestion() {
    nextBtn.removeEventListener('click', getQuestion);

    if (questionNumber < 5) {
        let response = await fetch(`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=easy&token=${token}&encode=base64`);
        let data = await response.json();
        question = await data.results;
        displayQuestion(question);
    } else if (questionNumber < 10) {
        let response = await fetch(`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=medium&token=${token}&encode=base64`);
        let data = await response.json();
        question = await data.results;   
        displayQuestion(question);
    } else {
        let response = await fetch(`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=hard&token=${token}&encode=base64`);
        let data = await response.json();
        question = await data.results;
        displayQuestion(question);
    }
}


function displayQuestion(question) {
    board.style.display = 'block';
    game.style.display = 'grid';

    if (questionNumber === 14) nextBtn.style.display = 'none';
    else nextBtn.style.display = 'inline-block';

    if (questionNumber > 0) {
        circles[questionNumber-1].classList.remove('circle-active');
        circles[questionNumber-1].classList.add('circle-completed');
        lines[questionNumber-1].style.backgroundColor = '#b298dc';
    }

    circles[questionNumber].classList.add('circle-active');
    circles[questionNumber].innerHTML = questionNumber + 1;
    questionCounter.innerHTML = questionNumber + 1;

    questionHtml.innerHTML = Base64.decode(question[0].question);
    category.innerHTML = Base64.decode(question[0].category);
    difficulty.innerHTML = Base64.decode(question[0].difficulty);

    let allAnswers = [question[0].correct_answer].concat(question[0].incorrect_answers);
    let randomNumbers = [0, 1, 2, 3];

    answers[0].innerHTML = Base64.decode(allAnswers[randomNumbers.splice(Math.floor(Math.random() * randomNumbers.length), 1)[0]]).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    answers[1].innerHTML = Base64.decode(allAnswers[randomNumbers.splice(Math.floor(Math.random() * randomNumbers.length), 1)[0]]).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    answers[2].innerHTML = Base64.decode(allAnswers[randomNumbers.splice(Math.floor(Math.random() * randomNumbers.length), 1)[0]]).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    answers[3].innerHTML = Base64.decode(allAnswers[randomNumbers.splice(Math.floor(Math.random() * randomNumbers.length), 1)[0]]).replace(/</g,'&lt;').replace(/>/g,'&gt;');

    answers.forEach(answer => {
        answer.addEventListener('click', checkAnswer);
        answer.classList.remove('correct', 'incorrect');
        answer.classList.add('clickable');
    });

    nextBtn.classList.add('btn-inactive');
    nextBtn.removeEventListener('click', getQuestion);

    console.log(Base64.decode(question[0].correct_answer));
}


function checkAnswer(element) {

    let correctAnswer = Base64.decode(question[0].correct_answer).replace(/</g,'&lt;').replace(/>/g,'&gt;');

    if (element.target.innerHTML === correctAnswer) {
        element.target.classList.add('correct');
        circles[questionNumber].innerHTML = '<i class="fas fa-check"></i>';
        if (questionNumber < 14) {
            nextBtn.classList.remove('btn-inactive');
            answers.forEach(answer => {
                answer.removeEventListener('click', checkAnswer); 
                answer.classList.remove('clickable');
            });
            nextBtn.addEventListener('click', getQuestion);
        } else if (questionNumber === 14) {
            setTimeout( () => {
                circles[questionNumber].classList.remove('circle-active');
                circles[questionNumber].classList.add('circle-completed');
                game.style.display = 'none';
                victoryMessage.style.display = 'block';
                restartBtn.style.display = 'inline-block';
                restartBtn.addEventListener('click', restartGame);
            }, 500);
        }
    } else {
        errorCount++;
        element.target.classList.add('incorrect');
        answers.forEach(answer => {
            answer.removeEventListener('click', checkAnswer);
            answer.classList.remove('clickable');
            if (answer.innerHTML === correctAnswer)
                answer.classList.add('correct');
        });
        circles[questionNumber].innerHTML = '<i class="fas fa-times"></i>';
        errorCounter.innerHTML = errorCount;

        if (errorCount === 1) { 
            answer.innerHTML = 'answer';
        } else answer.innerHTML = 'answers';

        if (errorCount < 3) {
            if (questionNumber < 14) {
                nextBtn.classList.remove('btn-inactive');
                nextBtn.addEventListener('click', getQuestion);
            } else if (questionNumber === 14) {
                setTimeout( () => {
                    circles[questionNumber].classList.remove('circle-active');
                    circles[questionNumber].classList.add('circle-completed');
                    game.style.display = 'none';
                    victoryMessage.style.display = 'block';
                    restartBtn.style.display = 'inline-block';
                    restartBtn.addEventListener('click', restartGame);
                }, 500);
                
            }
        } else {
            nextBtn.removeEventListener('click', getQuestion);
            nextBtn.classList.add('btn-inactive');
            setTimeout( () => {
                game.style.display = 'none';
                gameoverMessage.style.display = 'block';
                nextBtn.style.display = 'none';
                restartBtn.style.display = 'inline-block';
                restartBtn.addEventListener('click', restartGame);
            }, 500);
        }
    }

    if (questionNumber < 14) questionNumber++;
}


function restartGame() {
    questionNumber = 0;
    errorCount = 0;
    errorCounter.innerHTML = errorCount;
    circles.forEach(circle => {
        circle.classList.remove('circle-active','circle-completed');
        circle.innerHTML = '';
    });
    lines.forEach(line => line.style.backgroundColor = 'rgba(178, 152, 220, 0.4)');
    victoryMessage.style.display = 'none';
    gameoverMessage.style.display = 'none';
    restartBtn.style.display = 'none';
    restartBtn.removeEventListener('click', restartGame);
    getQuestion(token);
}