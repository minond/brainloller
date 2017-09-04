ELMMAKE = elm-make
YARN = yarn

install:
	$(YARN)

.PHONY: build
build:
	$(ELMMAKE) src/Main.elm --output=build/main.js

