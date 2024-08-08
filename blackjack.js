let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0;

let hidden;
let deck;

let canHit = true;
let balance = 1000;
let betAmount = 0;
let gameInProgress = false;

window.onload = function() {
    buildDeck();
    shuffleDeck();
    updateBalanceDisplay();
    document.getElementById("restart").addEventListener("click", restartGame);
    document.getElementById("place-bet").addEventListener("click", placeBet);
}

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]);
        }
    }
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    console.log(deck);
}

function updateBalanceDisplay() {
    document.getElementById("balance").innerText = balance;
}

function placeBet() {
    if (gameInProgress) {
        restartGame();
    }

    betAmount = parseInt(document.getElementById("bet-amount").value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert("Invalid bet amount");
        return;
    }

    balance -= betAmount;
    updateBalanceDisplay();
    document.getElementById("hit").disabled = false;
    document.getElementById("stay").disabled = false;
    startGame();
}

function startGame() {
    gameInProgress = true;

    hidden = deck.pop();
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);

    let { card, cardImg } = drawCard();
    dealerSum += getValue(card);
    dealerAceCount += checkAce(card);
    cardImg.classList.add("deal-animation");
    document.getElementById("dealer-cards").append(cardImg);
    showYourSum();
    for (let i = 0; i < 2; i++) {
        setTimeout(() => {
            let { card, cardImg } = drawCard();
            yourSum += getValue(card);
            yourAceCount += checkAce(card);
            cardImg.classList.add("deal-animation");
            document.getElementById("your-cards").append(cardImg);}, i * 500);
        
    }
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    
}

function drawCard() {
    let card = deck.pop();
    let cardImg = document.createElement("img");
    cardImg.src = "./cards/" + card + ".png";
    cardImg.classList.add("deal-animation");
    return { card, cardImg };
}

function hit() {
    if (!canHit) return;

    let { card, cardImg } = drawCard();
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);

    if (reduceAce(yourSum, yourAceCount) > 21) {
        canHit = false;
        determineOutcome();
    }
    showYourSum();
}

function showYourSum() {
    document.getElementById("your-sum").innerText = yourSum;
}

function stay() {
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);

    canHit = false;

    let hiddenCardImg = document.querySelector("#hidden");
    hiddenCardImg.src = "./cards/" + hidden + ".png";
    hiddenCardImg.classList.add("flip-animation");
    
    while (dealerSum < 17) {
        let { card, cardImg } = drawCard();
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }

    determineOutcome();
    showYourSum();
}

function determineOutcome() {
    const message = getOutcomeMessage();
    document.getElementById("dealer-sum").innerText = dealerSum;
    showYourSum();
    document.getElementById("results").innerText = message;
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    document.getElementById("bet-amount").value = "";
    gameInProgress = false;

    setTimeout(restartGame, 4000);
}

function getOutcomeMessage() {
    if (yourSum > 21) return "You Lose!";
    if (dealerSum > 21) {
        balance += betAmount * 2;
        updateBalanceDisplay();
        return "You win!";
    }
    if (yourSum === dealerSum) {
        balance += betAmount;
        updateBalanceDisplay();
        return "Tie!";
    }
    if (yourSum > dealerSum) {
        balance += betAmount * 2;
        updateBalanceDisplay();
        return "You win!";
    }
    return "You lose!";
}

function getValue(card) {
    let value = card.split("-")[0];
    if (isNaN(value)) {
        if (value === "A") return 11;
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    return card[0] === "A" ? 1 : 0;
}

function reduceAce(sum, aceCount) {
    while (sum > 21 && aceCount > 0) {
        sum -= 10;
        aceCount -= 1;
    }
    return sum;
}

function restartGame() {
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    canHit = true;
    betAmount = 0;
    gameInProgress = false;

    document.getElementById("dealer-sum").innerText = "";
    document.getElementById("your-sum").innerText = "";
    document.getElementById("results").innerText = "";

    document.getElementById("dealer-cards").innerHTML = '<img src="./cards/BACK.png" id="hidden">';
    document.getElementById("your-cards").innerHTML = "";

    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    buildDeck();
    shuffleDeck();
    updateBalanceDisplay();
}
