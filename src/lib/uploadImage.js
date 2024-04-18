const { fromBuffer } = require("file-type")
const { FormData, Blob } = require("formdata-node")

module.exports = async (buffer) => {
	const { ext, mime } = await fromBuffer(buffer)
	const form = new FormData()
	const blob = new Blob([buffer.toArrayBuffer()], { type: mime })
	form.append("file", blob, `tmp.${ext}`)
	const res = await fetch("https://telegra.ph/upload", {
		method: "POST",
		body: form,
	})
	const img = await res.json()
	if (img.error) throw img.error
	return `https://telegra.ph${img[0].src}`
}
