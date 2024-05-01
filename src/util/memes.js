const subreddit = require("./constants/subreddits");

module.exports = async ({ locale, customSubredditName }) => {
	try {
		const subredditName = locale ? subreddit[locale] : subreddit.en;
		const response = await fetch(
			`https://reddit.hedystia.com/api/data?name=${customSubredditName || subredditName}`,
			{
				headers: {
					"Content-Type": "application/json",
					"User-Agent": "https://github.com/Zastinian/HedystiaMD",
					"Authorization": "Hedystia",
				},
			},
		);
		const memeObject = await response.json();

		return {
			image: memeObject.image,
			category: memeObject.category,
			caption: memeObject.caption,
			permalink: memeObject.permalink,
		};
	} catch (error) {
		console.error(`Error fetching meme from Reddit ${error}`);
	}
};
