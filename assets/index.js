    const CHARSETS = {
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      numbers: "0123456789",
      symbols: "!@#$%^&*()-_=+[]{};:,.<>?/|\\~`"
    };

    // Cryptographically secure random integer between 0 and max - 1
    function getRandomIndex(max) {
      if (max <= 0) return 0;
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return Math.floor((array[0] / (0xffffffff + 1)) * max);
    }

    function getRandomChar(characters) {
      return characters[getRandomIndex(characters.length)];
    }

    function buildCharacterSet(options) {
      let characters = "";
      if (options.includeLowercase) characters += CHARSETS.lowercase;
      if (options.includeUppercase) characters += CHARSETS.uppercase;
      if (options.includeNumbers) characters += CHARSETS.numbers;
      if (options.includeSymbols) characters += CHARSETS.symbols;
      return characters;
    }

    // Generate password with guaranteed character representation when selected
    function generatePassword(options) {
      if (options.length < 4 || options.length > 64) {
        throw new Error("Password length must be between 4 and 64.");
      }

      const activeSets = [];
      if (options.includeLowercase) activeSets.push(CHARSETS.lowercase);
      if (options.includeUppercase) activeSets.push(CHARSETS.uppercase);
      if (options.includeNumbers) activeSets.push(CHARSETS.numbers);
      if (options.includeSymbols) activeSets.push(CHARSETS.symbols);

      if (activeSets.length === 0) {
        throw new Error("At least one character set must be enabled.");
      }

      const allCharacters = buildCharacterSet(options);
      let passwordArr = [];

      // Ensure at least one character from each selected charset is included
      for (let i = 0; i < activeSets.length && i < options.length; i++) {
        passwordArr.push(getRandomChar(activeSets[i]));
      }

      // Fill remaining length with random chars from all selected
      while (passwordArr.length < options.length) {
        passwordArr.push(getRandomChar(allCharacters));
      }

      // Cryptographically shuffle the resulting array using Fisher-Yates
      for (let i = passwordArr.length - 1; i > 0; i--) {
        const j = getRandomIndex(i + 1);
        const temp = passwordArr[i];
        passwordArr[i] = passwordArr[j];
        passwordArr[j] = temp;
      }

      return passwordArr.join('');
    }

    const form = document.getElementById('password-generator-form');
    const outputInput = document.getElementById('password-output');
    const copyBtn = document.getElementById('btn-copy');
    const lengthInput = document.getElementById('length-input');
    const btnMinus = document.getElementById('btn-minus');
    const btnPlus = document.getElementById('btn-plus');
    const lowercaseCheck = document.getElementById('lowercase');
    const uppercaseCheck = document.getElementById('uppercase');
    const numbersCheck = document.getElementById('numbers');
    const symbolsCheck = document.getElementById('symbols');
    const errorBanner = document.getElementById('error-banner');

    const sBar1 = document.getElementById('s-bar-1');
    const sBar2 = document.getElementById('s-bar-2');
    const sBar3 = document.getElementById('s-bar-3');
    const sBar4 = document.getElementById('s-bar-4');
    const strengthText = document.getElementById('strength-text');

    const MIN_LENGTH = 4;
    const MAX_LENGTH = 64;

    function updateStrengthMeter(password, length, options) {
      let score = 0;
      
      // Calculate active types
      let typeCount = 0;
      if (options.includeLowercase) typeCount++;
      if (options.includeUppercase) typeCount++;
      if (options.includeNumbers) typeCount++;
      if (options.includeSymbols) typeCount++;

      if (length >= 8) score += 1;
      if (length >= 14) score += 1;
      if (typeCount >= 3) score += 1;
      if (typeCount === 4 && length >= 12) score += 1;

      // Reset bars
      [sBar1, sBar2, sBar3, sBar4].forEach(bar => bar.style.backgroundColor = '#222');

      if (score <= 1) {
        sBar1.style.backgroundColor = '#ff5f56';
        strengthText.textContent = 'WEAK';
        strengthText.style.color = '#ff5f56';
      } else if (score === 2) {
        sBar1.style.backgroundColor = '#ffbd2e';
        sBar2.style.backgroundColor = '#ffbd2e';
        strengthText.textContent = 'FAIR';
        strengthText.style.color = '#ffbd2e';
      } else if (score === 3) {
        sBar1.style.backgroundColor = '#B5E853';
        sBar2.style.backgroundColor = '#B5E853';
        sBar3.style.backgroundColor = '#B5E853';
        strengthText.textContent = 'GOOD';
        strengthText.style.color = '#B5E853';
      } else {
        sBar1.style.backgroundColor = '#27c93f';
        sBar2.style.backgroundColor = '#27c93f';
        sBar3.style.backgroundColor = '#27c93f';
        sBar4.style.backgroundColor = '#27c93f';
        strengthText.textContent = 'STRONG';
        strengthText.style.color = '#27c93f';
      }
    }

    function generateAndDisplayPassword() {
      errorBanner.style.display = 'none';

      const options = {
        length: parseInt(lengthInput.value, 10),
        includeLowercase: lowercaseCheck.checked,
        includeUppercase: uppercaseCheck.checked,
        includeNumbers: numbersCheck.checked,
        includeSymbols: symbolsCheck.checked,
      };

      try {
        const password = generatePassword(options);
        outputInput.value = password;
        updateStrengthMeter(password, options.length, options);
      } catch (err) {
        outputInput.value = "";
        errorBanner.textContent = "> ERROR: " + err.message;
        errorBanner.style.display = 'block';
        [sBar1, sBar2, sBar3, sBar4].forEach(bar => bar.style.backgroundColor = '#222');
        strengthText.textContent = 'INVALID';
        strengthText.style.color = '#ff5f56';
      }
    }

    function updateCounterButtonsState() {
      const currentVal = parseInt(lengthInput.value, 10);
      btnMinus.disabled = currentVal <= MIN_LENGTH;
      btnPlus.disabled = currentVal >= MAX_LENGTH;
    }

    btnMinus.addEventListener('click', () => {
      let val = parseInt(lengthInput.value, 10);
      if (val > MIN_LENGTH) {
        lengthInput.value = val - 1;
        updateCounterButtonsState();
        generateAndDisplayPassword();
      }
    });

    btnPlus.addEventListener('click', () => {
      let val = parseInt(lengthInput.value, 10);
      if (val < MAX_LENGTH) {
        lengthInput.value = val + 1;
        updateCounterButtonsState();
        generateAndDisplayPassword();
      }
    });

    function copyToClipboard(text) {
      if (!text) return;

      // ExecCommand fallback for iframe execution context safety
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = text;
      tempTextArea.style.position = 'fixed';
      tempTextArea.style.opacity = '0';
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Copy fallback failed:', err);
      }
      
      document.body.removeChild(tempTextArea);
    }

    copyBtn.addEventListener('click', () => {
      if (!outputInput.value) return;

      copyToClipboard(outputInput.value);

      // Visual Copy Feedback
      copyBtn.textContent = 'COPIED!';
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.textContent = '[ COPY ]';
        copyBtn.classList.remove('copied');
      }, 1800);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      generateAndDisplayPassword();
    });

    [lowercaseCheck, uppercaseCheck, numbersCheck, symbolsCheck].forEach(checkbox => {
      checkbox.addEventListener('change', generateAndDisplayPassword);
    });

    // Initial trigger on load
    window.addEventListener('DOMContentLoaded', () => {
      updateCounterButtonsState();
      generateAndDisplayPassword();
    });