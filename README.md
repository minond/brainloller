WIP

A Brainloller debugger and code editor.

To run this project locally, run `make install build serve` which builds once
and starts server, or `make install reactor` which runs Elm's reactor instead.

### Image processing process

```bash
curl -X POST -F file=@brainloller/helloworld.png https://tmpstore.herokuapp.com/upload
# -> {"name":"STOTAoaKaKyeIESyzXPlpeIupXDcbDyt"}

curl "https://paddedjson.herokuapp.com/?url=https://8rwnim1cq1.execute-api.us-west-2.amazonaws.com/prod/pixels_pixels&method=POST&body=%7B%22path%22:%22https://tmpstore.herokuapp.com/get/STOTAoaKaKyeIESyzXPlpeIupXDcbDyt%22%7D"
# -> callback({"isBase64Encoded":false,"statusCode":400,"headers":{},"body":{"pixels":[[{"R":255,"G":0,"B":0,"A":255}, ...
```

### Resources

- https://esolangs.org/wiki/Brainloller
- https://github.com/Fedcomp/brainloller-php
