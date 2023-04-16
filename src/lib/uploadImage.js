const {fromBuffer} = require("file-type");
const {FormData, Blob} = require("formdata-node");

module.exports = async (buffer) => {
  const {ext, mime} = await fromBuffer(buffer);
  let form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], {type: mime});
  form.append("file", blob, "tmp." + ext);
  let res = await fetch("https://telegra.ph/upload", {
    method: "POST",
    body: form,
  });
  let img = await res.json();
  if (img.error) throw img.error;
  return "https://telegra.ph" + img[0].src;
};
