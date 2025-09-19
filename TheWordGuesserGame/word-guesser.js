// Global arrays for the word and guessed letters
var wordLetters = ['C', 'O', 'D', 'E'];
var guessedLetters = ['_', '_', '_', '_'];

// Game state variables
var totalReward = 0;
var guessedLettersList = [];
var wrongGuesses = 0;
var maxWrongGuesses = 6;

// ASCII Art for hangman display
var hangmanArt = [
    "  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========="
];

// Helper function to generate random reward
function generateReward() {
    return Math.floor(Math.random() * 100) + 10; // $10-$109
}

// Helper function to display hangman
function displayHangman() {
    console.log("\n" + hangmanArt[wrongGuesses] + "\n");
}

// Helper function to check if game is over
function isGameOver() {
    return wrongGuesses >= maxWrongGuesses || !guessedLetters.includes('_');
}

// Main guessLetter function with all features
function guessLetter(letter) {
    // Convert to uppercase for consistency
    letter = letter.toUpperCase();
    
    // Check if letter was already guessed
    if (guessedLettersList.includes(letter)) {
        console.log(`🤔 You already guessed "${letter}"! Try a different letter.`);
        return;
    }
    
    // Add to guessed letters list
    guessedLettersList.push(letter);
    
    var goodGuess = false;
    var lettersFound = 0;
    var moreToGuess = false;
    
    // Check if letter is in the word
    for (var i = 0; i < wordLetters.length; i++) {
        if (wordLetters[i] === letter) {
            guessedLetters[i] = letter;
            goodGuess = true;
            lettersFound++;
        }
        if (guessedLetters[i] === '_') {
            moreToGuess = true;
        }
    }
    
    if (goodGuess) {
        // Wheel of Fortune bonus: calculate reward
        var reward = generateReward() * lettersFound;
        totalReward += reward;
        
        console.log(`🎉 Awesome! You found "${letter}"! (${lettersFound} letter${lettersFound > 1 ? 's' : ''})`);
        console.log(`💰 You earned $${reward}! Total: $${totalReward}`);
        console.log(`📝 Current word: ${guessedLetters.join(' ')}`);
        
        if (!moreToGuess) {
            console.log("\n🏆 CONGRATULATIONS! YOU WON THE GAME! 🏆");
            console.log(`🎊 Final reward: $${totalReward}`);
            console.log("🎮 Thanks for playing The Word Guesser Game!");
        }
    } else {
        // Wrong guess - update hangman
        wrongGuesses++;
        console.log(`❌ Oops! "${letter}" is not in the word.`);
        console.log(`💸 You lost $10! Total: $${Math.max(0, totalReward - 10)}`);
        totalReward = Math.max(0, totalReward - 10);
        
        displayHangman();
        
        if (wrongGuesses >= maxWrongGuesses) {
            console.log("💀 GAME OVER! The hangman is complete!");
            console.log(`😢 The word was: ${wordLetters.join('')}`);
            console.log(`💰 Final reward: $${totalReward}`);
        } else {
            console.log(`📝 Current word: ${guessedLetters.join(' ')}`);
            console.log(`⚠️  Wrong guesses: ${wrongGuesses}/${maxWrongGuesses}`);
        }
    }
    
    console.log("─".repeat(50)); // Separator line
}

// Display game start message
console.log("🎮 Welcome to The Word Guesser Game! 🎮");
console.log("🎯 Guess the word letter by letter!");
console.log("💰 Earn money for correct guesses, lose money for wrong ones!");
console.log("💀 Don't let the hangman get complete!");
console.log(`📝 Word to guess: ${guessedLetters.join(' ')}`);
console.log("─".repeat(50));

// Test the game with various letters
console.log("\n🧪 Testing the game...\n");

guessLetter('C');
guessLetter('A');
guessLetter('O');
guessLetter('E');
guessLetter('D');
guessLetter('X'); // Wrong guess
guessLetter('Y'); // Wrong guess
guessLetter('Z'); // Wrong guess
guessLetter('W'); // Wrong guess
guessLetter('V'); // Wrong guess
guessLetter('U'); // Wrong guess - should trigger game over
