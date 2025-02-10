build:
	yarn build:chrome && zip -r my-extension.zip dist_chrome -x "dist_chrome/*.DS_Store"