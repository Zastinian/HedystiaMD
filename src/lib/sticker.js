/* eslint-disable array-element-newline */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const { Buffer } = require("node:buffer");
const webp = require("node-webpmux");
const { fromBuffer } = require("file-type");
const fluent_ffmpeg = require("fluent-ffmpeg");
const uploadFile = require("./uploadFile");
const uploadImage = require("./uploadImage");
const { ffmpeg } = require("./converter");

const tmp = path.join(__dirname, "../../tmp");

async function canvas(code, type = "png", quality = 0.92) {
	const res = await fetch(
		`https://nurutomo.herokuapp.com/api/canvas?${queryURL({
			type,
			quality,
		})}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "text/plain",
				"Content-Length": code.length,
			},
			body: code,
		},
	);
	const image = Buffer.from(await res.arrayBuffer(), "base64");
	return image;
}

function queryURL(queries) {
	return new URLSearchParams(Object.entries(queries));
}

function sticker2(img, url) {
	return new Promise(async (resolve, reject) => {
		try {
			if (url) {
				const res = await fetch(url);
				if (res.status !== 200) throw await res.text();
				img = Buffer.from(await res.arrayBuffer(), "base64");
			}
			const dateGet = new Date();
			const inp = path.join(tmp, `${+dateGet}.jpeg`, img);
			await fs.promises.writeFile(tmp, `${+dateGet}.jpeg`, img);
			const ff = spawn("ffmpeg", [
				"-y",
				"-i",
				inp,
				"-vf",
				"scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1",
				"-f",
				"png",
				"-",
			]);
			ff.on("error", reject);
			ff.on("close", async () => {
				await fs.promises.unlink(tmp, `${+dateGet}.jpeg`, img);
			});
			const bufs = [];
			const [_spawnprocess, ..._spawnargs] = [
				...(module.exports.support.gm ? ["gm"] : module.exports.magick ? ["magick"] : []),
				"convert",
				"png:-",
				"webp:-",
			];
			const im = spawn(_spawnprocess, _spawnargs);
			im.on("error", () => {});
			im.stdout.on("data", (chunk) => bufs.push(chunk));
			ff.stdout.pipe(im.stdin);
			im.on("exit", () => {
				resolve(Buffer.concat(bufs));
			});
		} catch (e) {
			reject(e);
		}
	});
}

async function sticker1(img, url) {
	url = url || (await uploadImage(img));
	const { mime } = url ? { mime: "image/jpeg" } : await fromBuffer(img);
	const sc = `let im = await loadImg('data:${mime};base64,'+(await window.loadToDataURI('${url}')))
  c.width = c.height = 512
  let max = Math.max(im.width, im.height)
  let w = 512 * im.width / max
  let h = 512 * im.height / max
  ctx.drawImage(im, 256 - w / 2, 256 - h / 2, w, h)
  `;
	return await canvas(sc, "webp");
}

async function sticker3(img, url, packname, author) {
	url = url || (await uploadFile(img));
	const res = await fetch(
		`https://api.xteam.xyz/sticker/wm?${new URLSearchParams(
			Object.entries({
				url,
				packname,
				author,
			}),
		)}`,
	);
	return Buffer.from(await res.arrayBuffer(), "base64");
}

async function sticker4(img, url) {
	if (url) {
		const res = await fetch(url);
		if (res.status !== 200) throw await res.text();
		img = Buffer.from(await res.arrayBuffer(), "base64");
	}
	return await ffmpeg(
		img,
		[
			"-vf",
			"scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1",
		],
		"jpeg",
		"webp",
	);
}

async function sticker5(img, url, packname, author, categories = [""], extra = {}) {
	const { Sticker } = require("wa-sticker-formatter");
	const stickerMetadata = {
		type: "default",
		pack: packname,
		author,
		categories,
		...extra,
	};
	return new Sticker(img || url, stickerMetadata).toBuffer();
}

function sticker6(img, url) {
	return new Promise(async (resolve, reject) => {
		if (url) {
			const res = await fetch(url);
			if (res.status !== 200) throw await res.text();
			const buffer = await res.arrayBuffer();
			img = Buffer.from(buffer);
		}
		const type = (await fromBuffer(img)) || {
			mime: "application/octet-stream",
			ext: "bin",
		};
		if (type.ext === "bin") reject(img);
		const tmp = path.join(__dirname, `../../tmp/${+new Date()}.${type.ext}`);
		const out = path.join(`${tmp}.webp`);
		await fs.promises.writeFile(tmp, img);
		const Fffmpeg = /video/i.test(type.mime)
			? fluent_ffmpeg(tmp).inputFormat(type.ext)
			: fluent_ffmpeg(tmp).input(tmp);
		Fffmpeg.on("error", () => {
			fs.promises.unlink(tmp);
			reject(img);
		})
			.on("end", async () => {
				fs.promises.unlink(tmp);
				resolve(await fs.promises.readFile(out));
			})
			.addOutputOptions([
				`-vcodec`,
				`libwebp`,
				`-vf`,
				`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
			])
			.toFormat("webp")
			.save(out);
		setTimeout(() => {
			fs.promises.unlink(`${tmp}.webp`);
		}, 20000);
	});
}

async function sticker(img, url, ...args) {
	let lastError, stiker;
	for (const func of [
		sticker3,
		// eslint-disable-next-line no-constant-binary-expression
		true && sticker6,
		sticker5,
		// eslint-disable-next-line no-constant-binary-expression
		true && true && sticker4,
		// eslint-disable-next-line no-constant-binary-expression
		true && (true || false || false) && sticker2,
		sticker1,
	].filter((f) => f)) {
		try {
			stiker = await func(img, url, ...args);
			if (stiker.includes("html")) continue;
			if (stiker.includes("WEBP")) {
				try {
					return await addExif(stiker, ...args);
				} catch {
					return stiker;
				}
			}
			throw stiker.toString();
		} catch (err) {
			lastError = err;
			continue;
		}
	}
	return lastError;
}

async function addExif(webpSticker, packname, author, categories = [""], extra = {}) {
	const img = new webp.Image();
	const stickerPackId = crypto.randomBytes(32).toString("hex");
	const json = {
		"sticker-pack-id": stickerPackId,
		"sticker-pack-name": packname,
		"sticker-pack-publisher": author,
		"emojis": categories,
		...extra,
	};
	const exifAttr = Buffer.from([
		0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
	]);
	const jsonBuffer = Buffer.from(JSON.stringify(json), "base64");
	const exif = Buffer.concat([exifAttr, jsonBuffer]);
	exif.writeUIntLE(jsonBuffer.length, 14, 4);
	await img.load(webpSticker);
	img.exif = exif;
	return await img.save(null);
}

module.exports = { sticker, sticker1, sticker2, sticker3, sticker4, sticker6, addExif };
