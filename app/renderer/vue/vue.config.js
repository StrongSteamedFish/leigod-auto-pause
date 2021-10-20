module.exports = {
	publicPath:"./",
	outputDir:"../pages",
	pages:{
		index:{
			entry:"src/pages/index/main.js",
			template:"public/index.html",
			filename:"index.html"
		},
		setting:{
			entry:"src/pages/setting/setting.js",
			template:"public/setting.html",
			filename:"setting.html"
		}
	}
}