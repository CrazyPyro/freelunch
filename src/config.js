module.exports = {
	PORT: 8080,
	publicUrl: 'http://freelunch.apps.neilfunk.com:8080',
	// See https://developers.google.com/console/help/new/
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	tempPath: process.env.tempPath || 'shared',
};
