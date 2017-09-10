module Brainloller.Lang exposing (BLProgram, Pixel, blCmd, blCmdPixel)


type alias Pixel =
    { r : Int
    , g : Int
    , b : Int
    }


type alias BLProgram =
    List (List Pixel)


type alias BLCmd a =
    { shiftRight : a
    , shiftLeft : a
    , increment : a
    , decrement : a
    , ioWrite : a
    , ioRead : a
    , loopOpen : a
    , loopClose : a
    , rotateClockwise : a
    , rotateCounterClockwise : a
    }


pixel : Int -> Int -> Int -> Pixel
pixel r g b =
    { r = r
    , g = g
    , b = b
    }


blCmd : BLCmd String
blCmd =
    { shiftRight = "shiftRight"
    , shiftLeft = "shiftLeft"
    , increment = "increment"
    , decrement = "decrement"
    , ioWrite = "ioWrite"
    , ioRead = "ioRead"
    , loopOpen = "loopOpen"
    , loopClose = "loopClose"
    , rotateClockwise = "rotateClockwise"
    , rotateCounterClockwise = "rotateCounterClockwise"
    }


blCmdPixel : BLCmd Pixel
blCmdPixel =
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
