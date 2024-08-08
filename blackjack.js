let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0;

let hidden;
let deck;

let canDouble = true;
let canHit = true;
let balance = 1000;
let betAmount = 0;
let playerBet = 0;
let gameInProgress = false;

let gamesPlayed = 0;
let wins = 0;
let losses = 0;
let ties = 0;
let blackjacks = 0;

window.onload = function() {
    buildDeck();
    shuffleDeck();
    updateBalanceDisplay();
    document.getElementById("restart").addEventListener("click", restartGame);
    document.getElementById("place-bet").addEventListener("click", placeBet);
    document.getElementById("rebet").addEventListener("click", reBet);
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    document.getElementById("double-down").addEventListener("click", doubleDown);
    updateStatisticsDisplay();
}

function updateStatisticsDisplay() {
    document.getElementById("games-played").innerText = gamesPlayed;
    document.getElementById("wins").innerText = wins;
    document.getElementById("losses").innerText = losses;
    document.getElementById("ties").innerText = ties;
    document.getElementById("blackjack").innerText = blackjacks;
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
        alert("A game is already in progress. Please finish the current game");
        return;
    } 

    betAmount = parseInt(document.getElementById("bet-amount").value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert("Invalid bet amount");
        return;
    }
    restartGame();

    balance -= betAmount;
    playerBet = betAmount;
    updateBalanceDisplay();
    document.getElementById("hit").disabled = false;
    document.getElementById("stay").disabled = false;
    document.getElementById("double-down").disabled = false;
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

    for (let i = 0; i < 2; i++) {
        setTimeout(() => {
            let { card, cardImg } = drawCard();
            yourSum += getValue(card);
            yourAceCount += checkAce(card);
            cardImg.classList.add("deal-animation");
            document.getElementById("your-cards").append(cardImg);}, i * 500);
    }

    setTimeout(() => {
        showYourSum();
    }, 1000);
    updatebetsize();
    
}

function drawCard() {
    let card = deck.pop();
    let cardImg = document.createElement("img");
    cardImg.src = "./cards/" + card + ".png";
    cardImg.classList.add("deal-animation");
    return { card, cardImg };
}
function updatebetsize(){
    document.getElementById("bet-size").innerText = betAmount;
}
function doubleDown(){
    if (balance < betAmount) {
        alert("Not enough balance to double down!");
        return;
    }
    if (!canDouble) return;

    balance -= betAmount;
    betAmount *= 2;

    let { card, cardImg} = drawCard();
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    reduceAce(yourSum, yourAceCount);
    document.getElementById("your-cards").append(cardImg);
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    canDouble = false;
    let hiddenCardImg = document.querySelector("#hidden");
    hiddenCardImg.src = "./cards/" + hidden + ".png";
    hiddenCardImg.classList.add("flip-animation");
    stay();
}

function hit() {
    if (!canHit) return;

    let { card, cardImg } = drawCard();
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);
    gameInProgress = true;
    showYourSum();
    if (reduceAce(yourSum, yourAceCount) > 21) {
        canHit = false;
        determineOutcome();
    }
    
}

function showYourSum() {
    let sumWithAce = yourSum;

    if (yourAceCount > 0 && yourSum - 10 <= 21) {
        sumWithAce = yourSum - 10;
    }
    let sumText = yourSum;
    if (sumWithAce !== yourSum) {
        sumText += " or " + sumWithAce;
    }
    if (yourSum > 21) {
        sumText = sumWithAce
    }
    document.getElementById("your-sum").innerText = sumText;
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
    gamesPlayed++;
    const message = getOutcomeMessage();
    document.getElementById("dealer-sum").innerText = dealerSum;
    showYourSum();
    document.getElementById("results").innerText = message;
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    document.getElementById("double-down").disabled = true;
    document.getElementById("bet-amount").value = "";
    gameInProgress = false;
    updateBalanceDisplay();
    updateStatisticsDisplay();
    
}

function getOutcomeMessage() {
    if (yourSum > 21) { 
        losses++;
        return `You Lost ${betAmount} dollars!`;
        
    }
    if (yourSum === 21 && checkBlackjack()) {
        balance += betAmount * 2.5;
        blackjacks++;
        return `BlackJack!! you win ${betAmount*2.5} dollars`
    }
    if (dealerSum > 21) {
        balance += betAmount * 2;
        wins++;
        return `You win ${betAmount * 2} dollars!`;
    }
    if (yourSum === dealerSum) {
        balance += betAmount;
        ties++;
        return `Tie! ${betAmount} dollars returned`;
    }
    if (yourSum > dealerSum) {
        balance += betAmount * 2;
        wins++;
        return `You win ${betAmount * 2} dollars`;
    }
    losses++;
    return `You lose ${betAmount} dollars!`;
}

function checkBlackjack() {
    let cards = document.getElementById("your-cards").querySelectorAll("img");
    if (cards.length === 2) {
        let firstCardValue = getValue(cards[0].src.split("/").pop().split(".")[0]);
        let secondCardValue = getValue(cards[1].src.split("/").pop().split(".")[0]);
        return (firstCardValue === 11 && secondCardValue === 10) || (firstCardValue === 10 && secondCardValue === 11);
    }
    return false;
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

function reBet() {
    if (gameInProgress) {
        alert("A game is already in progress. Please finish the current game.");
        return;
    }
    if (playerBet > 0) {
        restartGame();
        document.getElementById("bet-amount").value = playerBet; // Set the bet amount input to the previous bet
        placeBet();
    } else {
        alert("No previous bet to repeat");
    }
}

function restartGame() {
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    canHit = true;
    canDouble = true;
    gameInProgress = false;

    document.getElementById("dealer-sum").innerText = "";
    document.getElementById("your-sum").innerText = "";
    document.getElementById("results").innerText = "";

    document.getElementById("dealer-cards").innerHTML = '<img src="./cards/BACK.png" id="hidden">';
    document.getElementById("your-cards").innerHTML = "";

    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    document.getElementById("double-down").disabled = true;
    buildDeck();
    shuffleDeck();
    updateBalanceDisplay();
    updateStatisticsDisplay();
}
