module Brainloller.Lang exposing (BLProgram, Pixel, cmdPixel)


type alias Pixel =
    { r : Int
    , g : Int
    , b : Int
    }


type alias BLProgram =
    List (List Pixel)


pixel : Int -> Int -> Int -> Pixel
pixel r g b =
    { r = r
    , g = g
    , b = b
    }


cmdPixel =
    { shiftRight = pixel 255 0 0 -- >, red
    , shiftLeft = pixel 128 0 0 -- <, dark red
    , increment = pixel 0 255 0 -- +, green
    , decrement = pixel 0 128 0 -- -, dark green
    , ioWrite = pixel 0 0 255 -- ., blue
    , ioRead = pixel 0 0 128 -- ,, dark blue
    , loopOpen = pixel 255 255 0 -- [, yellow
    , loopClose = pixel 128 128 0 -- ], dark yellow
    , rotateClockwise = pixel 0 255 255 -- +90, cyan
    , rotateCounterClockwise = pixel 0 128 128 -- -90, dark cyan
    }
