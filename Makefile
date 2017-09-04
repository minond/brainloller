ELMMAKE = elm-make
YARN = yarn

.PHONY: build
build: vendor
	$(ELMMAKE) src/Main.elm --output=build/main.js

vendor:
	cp node_modules/tachyons/css/tachyons.min.css build/tachyons.min.css

install:
	$(YARN)
