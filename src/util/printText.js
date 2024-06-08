const printText = (text, i, time = 100) => {
  let index = i;
  process.stdout.write(text[index]);
  index++;
  if (index < text.length) {
    setTimeout(() => printText(text, index), time);
  }
};

module.exports = printText;
