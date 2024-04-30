const subreddit = require("./constants/subreddits");

module.exports = async ({ locale, customSubredditName, fullRawBody }) => {
	try {
		const subredditName = locale ? subreddit[locale] : subreddit.en;
		const response = await fetch(
			`https://www.reddit.com/r/${customSubredditName || subredditName}/hot/.json?count=100`,
			{
				method: "GET",
				headers: {
					"User-Agent": "https://github.com/Zastinian/HedystiaMD",
					"Authorization": "",
				},
			},
		);
		const memeObject = await response.json();
		const randomPost =
			memeObject.data.children[Math.floor(Math.random() * memeObject.data.children.length)];

		return fullRawBody
			? randomPost
			: {
					image: randomPost.data.url,
					category: randomPost.data.link_flair_text,
					caption: randomPost.data.title,
					permalink: randomPost.data.permalink,
				};
	} catch (error) {
		console.error(`Error fetching meme from Reddit ${error}`);
	}
};
