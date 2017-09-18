A Brainloller debugger and code editor.

To run this project locally, run `make install build serve` which builds once
and starts server, or `make install reactor` which runs Elm's reactor instead.

### Image processing flow

In order to allow users to both upload and link to Brainloller programs, and
not having to process the image on the client and potentially running into CORS
limitations, I've created a handfull of services that untimately process and
image and send back the pixel data:

- `https://tmpstore.herokuapp.com` for temporary file storage
- `https://paddedjson.herokuapp.com` for turning any endpoint into a jsonp resource
- `https://8rwnim1cq1.execute-api.us-west-2.amazonaws.com/prod/pixels_pixels` for image processing


```bash
curl -X POST -F file=@brainloller/helloworld.png https://tmpstore.herokuapp.com/upload
# -> {"name":"STOTAoaKaKyeIESyzXPlpeIupXDcbDyt"}

imgfileurl="https://tmpstore.herokuapp.com/get/STOTAoaKaKyeIESyzXPlpeIupXDcbDyt"
imgprocess="https://8rwnim1cq1.execute-api.us-west-2.amazonaws.com/prod/pixels_pixels"

curl "https://paddedjson.herokuapp.com/?url=$imgprocess&method=POST&body=%7B%22path%22:%22$imgfileurl%22%7D"
# -> callback({"isBase64Encoded":false,"statusCode":400,"headers":{},"body":{"pixels":[[{"R":255,"G":0,"B":0,"A":255}, ...
```

### Resources

- https://esolangs.org/wiki/Brainloller
- https://github.com/Fedcomp/brainloller-php
