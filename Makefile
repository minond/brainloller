ELMMAKE = elm-make
YARN = yarn

.PHONY: build
build: vendor
	$(ELMMAKE) src/Main.elm --output=build/main.js

vendor:
	cp node_modules/tachyons/css/tachyons.min.css build/tachyons.min.css

install:
	$(YARN)

.PHONY: serve
serve:
	@echo "Opening http://localhost:$(PORT)"
	(sleep 1 && open http://localhost:$(PORT)) &
	python -m SimpleHTTPServer $(PORT)
