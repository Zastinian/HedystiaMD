const printText = (text, index, time = 100) => {
  process.stdout.write(text[index]);
  index++;
  if (index < text.length) {
    setTimeout(() => printText(text, index), time);
  }
};

module.exports = printText;
