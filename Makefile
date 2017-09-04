ELMMAKE = elm-make

.PHONY: build
build:
	$(ELMMAKE) src/Main.elm --output=build/main.js

